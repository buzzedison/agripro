import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { COHORT_YEAR } from '@/lib/catalyst-selection';
import { OfferFunding, addDays, defaultFee, deadlinePassed } from '@/lib/catalyst-launch';
import {
    confirmOffer, ensurePortalUrl, sendOfferEmail, sendOfferReminder, sendScholarshipInvite, sendWelcomePack, serviceClient,
} from '@/lib/catalyst-launch-server';

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FUNDING: OfferFunding[] = ['standard', 'scholarship_199', 'fully_funded', 'custom_subsidy'];
const text = (v: unknown, max = 2000) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const num = (v: unknown) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));
const date = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

const FOUNDER_FIELDS = 'id, full_name, email, phone, country, business_name, sector, status, plan_tier, participant_status, excluded_reason, duplicate_of, reserve_rank, scholarship_invited_at, welcome_sent_at, group_id, next_action, next_action_due, portal_token, created_at, business_verified';

export async function GET() {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;
    const supabase = serviceClient();
    try {
        const [settings, founders, scholarships, offers, payments, partners, budget, countries, groups, cohort] = await Promise.all([
            supabase.from('catalyst_launch_settings').select('*').eq('cohort_year', COHORT_YEAR).single(),
            supabase.from('catalyst_submissions').select(FOUNDER_FIELDS).eq('type', 'apply').is('excluded_reason', null).is('duplicate_of', null).order('created_at'),
            supabase.from('catalyst_scholarship_requests').select('*'),
            supabase.from('catalyst_offers').select('*'),
            supabase.from('catalyst_payments').select('id, offer_id, reference, amount_usd, status, created_at').order('created_at', { ascending: false }).limit(500),
            supabase.from('catalyst_partners').select('*').eq('cohort_year', COHORT_YEAR).order('name'),
            supabase.from('catalyst_budget_lines').select('*').eq('cohort_year', COHORT_YEAR).order('created_at'),
            supabase.from('catalyst_countries').select('*').eq('cohort_year', COHORT_YEAR).order('priority').order('country'),
            supabase.from('catalyst_groups').select('*').eq('cohort_year', COHORT_YEAR).order('name'),
            supabase.from('catalyst_w_cohorts').select('id, name, start_date').in('status', ['active', 'draft']).order('start_date', { ascending: false }).limit(1).maybeSingle(),
        ]);
        for (const r of [settings, founders, scholarships, offers, payments, partners, budget, countries, groups]) if (r.error) throw r.error;
        let sessions: unknown[] = [];
        if (cohort.data) {
            const { data } = await supabase.from('catalyst_w_sessions').select('id, week_number, title, type, scheduled_date, scheduled_time, timezone, status')
                .eq('cohort_id', cohort.data.id).lte('week_number', 3).order('week_number').order('session_number');
            sessions = data || [];
        }
        // The portal token is a credential: admins get a has-link flag, not the token itself.
        const safeFounders = (founders.data || []).map(({ portal_token, ...f }) => ({ ...f, has_portal: !!portal_token }));
        return NextResponse.json({
            me: auth.email,
            settings: settings.data,
            founders: safeFounders,
            scholarships: scholarships.data,
            offers: offers.data,
            payments: payments.data,
            partners: partners.data,
            budget: budget.data,
            countries: countries.data,
            groups: groups.data,
            cohort: cohort.data,
            sessions,
        });
    } catch (err: any) {
        return bad(err?.message || 'Could not load launch data. Has migration 064 been applied?', 500);
    }
}

export async function POST(request: NextRequest) {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;
    const body = await request.json().catch(() => null);
    if (!body?.action) return bad('Missing action');
    const supabase = serviceClient();
    const now = new Date().toISOString();

    const founder = async (id: string) => {
        const { data, error } = await supabase.from('catalyst_submissions').select('id, full_name, email, business_name, country, portal_token, status, excluded_reason, duplicate_of').eq('id', id).single();
        if (error || !data) throw new Error('Founder not found');
        return data;
    };

    try {
        switch (body.action) {
            // ── Settings ──────────────────────────────────────────────
            case 'save_settings': {
                const s = body.settings || {};
                const patch = {
                    target_cohort_size: Math.max(0, Math.round(num(s.target_cohort_size) ?? 0)),
                    scholarship_199_places: Math.max(0, Math.round(num(s.scholarship_199_places) ?? 0)),
                    fully_funded_places: Math.max(0, Math.round(num(s.fully_funded_places) ?? 0)),
                    standard_fee_usd: Math.max(0, num(s.standard_fee_usd) ?? 399),
                    offer_response_days: Math.min(30, Math.max(1, Math.round(num(s.offer_response_days) ?? 5))),
                    ...(date(s.launch_date) ? { launch_date: s.launch_date } : {}),
                    updated_by: auth.email, updated_at: now,
                };
                const { data, error } = await supabase.from('catalyst_launch_settings').update(patch).eq('cohort_year', COHORT_YEAR).select('*').single();
                if (error) throw error;
                return NextResponse.json({ settings: data });
            }

            // ── Scholarships ──────────────────────────────────────────
            case 'invite_scholarship': {
                const ids: string[] = Array.isArray(body.ids) ? body.ids.slice(0, 100) : [];
                if (!ids.length) return bad('Choose at least one founder.');
                const sent: string[] = []; const failed: { id: string; reason: string }[] = [];
                for (const id of ids) {
                    try {
                        const f = await founder(id);
                        if (f.excluded_reason || f.duplicate_of) throw new Error('excluded');
                        await sendScholarshipInvite(f, await ensurePortalUrl(supabase, f));
                        await supabase.from('catalyst_submissions').update({ scholarship_invited_at: now }).eq('id', id);
                        sent.push(id);
                    } catch (e: any) { failed.push({ id, reason: e?.message || 'failed' }); }
                }
                return NextResponse.json({ sent, failed });
            }
            case 'decide_scholarship': {
                const decision = body.decision;
                if (!['pending', 'fully_funded', 'scholarship_199', 'declined'].includes(decision)) return bad('Unknown decision');
                const { data, error } = await supabase.from('catalyst_scholarship_requests').update({
                    decision, decision_notes: text(body.notes),
                    decided_by: decision === 'pending' ? null : auth.email, decided_at: decision === 'pending' ? null : now,
                }).eq('id', body.id).select('*').single();
                if (error) throw error;
                return NextResponse.json({ scholarship: data });
            }

            // ── Offers ────────────────────────────────────────────────
            case 'save_offer': {
                const o = body.offer || {};
                if (!o.submission_id) return bad('Missing founder');
                const funding: OfferFunding = FUNDING.includes(o.funding) ? o.funding : 'standard';
                const { data: settings } = await supabase.from('catalyst_launch_settings').select('*').eq('cohort_year', COHORT_YEAR).single();
                const fee = num(o.fee_usd) ?? defaultFee(funding, settings || { standard_fee_usd: 399 });
                if (fee < 0) return bad('Fee cannot be negative.');
                if (funding === 'fully_funded' && fee !== 0) return bad('A fully funded place has no fee.');
                const deadline = date(o.payment_deadline) || addDays(new Date(), settings?.offer_response_days ?? 5);
                const { data: existing } = await supabase.from('catalyst_offers').select('id, status').eq('submission_id', o.submission_id).maybeSingle();
                if (existing && existing.status === 'confirmed') return bad('This place is already confirmed; record changes in the notes instead.');
                const row = {
                    submission_id: o.submission_id, plan_label: text(o.plan_label, 120) || 'Catalyst W Programme',
                    fee_usd: fee, funding, subsidy_note: text(o.subsidy_note, 500), payment_deadline: deadline, updated_at: now,
                    // Editing a closed offer re-opens it as a draft to be sent again.
                    ...(existing && ['declined', 'expired', 'withdrawn'].includes(existing.status) ? { status: 'draft', sent_at: null, responded_at: null, decline_reason: null } : {}),
                    ...(existing ? {} : { created_by: auth.email }),
                };
                const { data, error } = existing
                    ? await supabase.from('catalyst_offers').update(row).eq('id', existing.id).select('*').single()
                    : await supabase.from('catalyst_offers').insert(row).select('*').single();
                if (error) throw error;
                return NextResponse.json({ offer: data });
            }
            case 'send_offer': {
                const { data: offer, error } = await supabase.from('catalyst_offers').select('*').eq('id', body.id).single();
                if (error || !offer) return bad('Offer not found', 404);
                if (!['draft', 'sent', 'accepted'].includes(offer.status)) return bad('Only open offers can be (re)sent.');
                if (deadlinePassed(offer.payment_deadline)) return bad('The payment deadline has passed. Set a new deadline first.');
                const f = await founder(offer.submission_id);
                await sendOfferEmail(f, offer, await ensurePortalUrl(supabase, f));
                const { data } = await supabase.from('catalyst_offers').update({ status: offer.status === 'accepted' ? 'accepted' : 'sent', sent_at: offer.sent_at || now, updated_at: now }).eq('id', offer.id).select('*').single();
                await supabase.from('catalyst_submissions').update({ status: 'accepted', reserve_rank: null, updated_at: now }).eq('id', offer.submission_id).in('status', ['reviewed', 'shortlisted', 'interviewed', 'waitlisted']);
                return NextResponse.json({ offer: data });
            }
            case 'remind_offer': {
                const { data: offer } = await supabase.from('catalyst_offers').select('*').eq('id', body.id).single();
                if (!offer || !['sent', 'accepted'].includes(offer.status)) return bad('Only open offers can be reminded.');
                const f = await founder(offer.submission_id);
                await sendOfferReminder(f, offer, await ensurePortalUrl(supabase, f));
                const { data } = await supabase.from('catalyst_offers').update({ reminder_sent_at: now, updated_at: now }).eq('id', offer.id).select('*').single();
                return NextResponse.json({ offer: data });
            }
            case 'close_offer': {
                const status = body.status === 'expired' ? 'expired' : 'withdrawn';
                const { data, error } = await supabase.from('catalyst_offers').update({ status, updated_at: now })
                    .eq('id', body.id).in('status', ['draft', 'sent', 'accepted']).select('*').single();
                if (error || !data) return bad('This offer can no longer be closed.');
                await supabase.from('catalyst_submissions').update({ status: 'waitlisted', updated_at: now }).eq('id', data.submission_id).eq('status', 'accepted');
                return NextResponse.json({ offer: data });
            }
            case 'record_payment': {
                const method = ['bank_transfer', 'mobile_money', 'waived', 'other'].includes(body.method) ? body.method : null;
                if (!method) return bad('Choose how the founder paid.');
                const amount = num(body.amount_usd);
                if (amount == null || amount < 0) return bad('Enter the amount received.');
                const confirmed = await confirmOffer(supabase, body.id, { amountUsd: amount, method, reference: text(body.reference, 120) });
                if (!confirmed) return bad('Only sent or accepted offers can be confirmed.');
                return NextResponse.json({ offer: confirmed });
            }
            case 'set_reserve': {
                const rank = body.rank == null || body.rank === '' ? null : Math.max(1, Math.round(Number(body.rank)));
                const { data, error } = await supabase.from('catalyst_submissions')
                    .update({ reserve_rank: rank, ...(rank ? { status: 'waitlisted' } : {}), updated_at: now })
                    .eq('id', body.id).select('id, status, reserve_rank').single();
                if (error) throw error;
                return NextResponse.json({ founder: data });
            }

            // ── Partners & budget ─────────────────────────────────────
            case 'save_partner': {
                const p = body.partner || {};
                if (!text(p.name)) return bad('Partner name is required.');
                if (p.contact_email && !EMAIL_RE.test(p.contact_email)) return bad('Contact email looks invalid.');
                const row = {
                    cohort_year: COHORT_YEAR, name: text(p.name, 160), kind: p.kind || 'funder', status: p.status || 'to_contact',
                    contact_name: text(p.contact_name, 160), contact_email: text(p.contact_email, 200), owner: text(p.owner, 160),
                    contribution: text(p.contribution, 1000), amount_usd: num(p.amount_usd), next_step: text(p.next_step, 300),
                    next_step_due: date(p.next_step_due), notes: text(p.notes), updated_at: now,
                };
                const { data, error } = p.id
                    ? await supabase.from('catalyst_partners').update(row).eq('id', p.id).select('*').single()
                    : await supabase.from('catalyst_partners').insert(row).select('*').single();
                if (error) throw error;
                return NextResponse.json({ partner: data });
            }
            case 'delete_partner': {
                const { error } = await supabase.from('catalyst_partners').delete().eq('id', body.id);
                if (error) throw error;
                return NextResponse.json({ ok: true });
            }
            case 'save_budget_line': {
                const b = body.line || {};
                if (!text(b.item)) return bad('Budget item is required.');
                const row = {
                    cohort_year: COHORT_YEAR, item: text(b.item, 160), category: text(b.category, 80),
                    budget_usd: Math.max(0, num(b.budget_usd) ?? 0), funded_usd: Math.max(0, num(b.funded_usd) ?? 0),
                    essential: !!b.essential, partner_id: b.partner_id || null, funding_source: text(b.funding_source, 160), notes: text(b.notes), updated_at: now,
                };
                const { data, error } = b.id
                    ? await supabase.from('catalyst_budget_lines').update(row).eq('id', b.id).select('*').single()
                    : await supabase.from('catalyst_budget_lines').insert(row).select('*').single();
                if (error) throw error;
                return NextResponse.json({ line: data });
            }
            case 'delete_budget_line': {
                const { error } = await supabase.from('catalyst_budget_lines').delete().eq('id', body.id);
                if (error) throw error;
                return NextResponse.json({ ok: true });
            }

            // ── Countries ─────────────────────────────────────────────
            case 'save_country': {
                const c = body.country || {};
                if (!text(c.country, 80)) return bad('Country name is required.');
                const row = {
                    cohort_year: COHORT_YEAR, country: text(c.country, 80), priority: Math.max(1, Math.round(num(c.priority) ?? 1)), active: c.active !== false,
                    status: ['planning', 'host_confirmed', 'ready'].includes(c.status) ? c.status : 'planning',
                    host_name: text(c.host_name, 160), host_org: text(c.host_org, 160), host_contact: text(c.host_contact, 200),
                    host_capacity: num(c.host_capacity), coordinator_name: text(c.coordinator_name, 160), coordinator_contact: text(c.coordinator_contact, 200),
                    venue: text(c.venue, 200), first_activity: text(c.first_activity, 500), first_activity_date: date(c.first_activity_date), notes: text(c.notes), updated_at: now,
                };
                const { data, error } = c.id
                    ? await supabase.from('catalyst_countries').update(row).eq('id', c.id).select('*').single()
                    : await supabase.from('catalyst_countries').insert(row).select('*').single();
                if (error) throw error;
                return NextResponse.json({ country: data });
            }

            // ── Groups, next actions and welcome packs ────────────────
            case 'save_group': {
                const g = body.group || {};
                if (!text(g.name, 80)) return bad('Group name is required.');
                for (const e of [g.venture_lead_email, g.contact_email]) if (e && !EMAIL_RE.test(e)) return bad('An email address looks invalid.');
                const row = {
                    cohort_year: COHORT_YEAR, name: text(g.name, 80), country: text(g.country, 80),
                    venture_lead_name: text(g.venture_lead_name, 160), venture_lead_email: text(g.venture_lead_email, 200),
                    contact_name: text(g.contact_name, 160), contact_email: text(g.contact_email, 200), contact_phone: text(g.contact_phone, 60),
                    meeting_rhythm: text(g.meeting_rhythm, 300), updated_at: now,
                };
                const { data, error } = g.id
                    ? await supabase.from('catalyst_groups').update(row).eq('id', g.id).select('*').single()
                    : await supabase.from('catalyst_groups').insert(row).select('*').single();
                if (error) throw error;
                return NextResponse.json({ group: data });
            }
            case 'delete_group': {
                const { error } = await supabase.from('catalyst_groups').delete().eq('id', body.id);
                if (error) throw error;
                return NextResponse.json({ ok: true });
            }
            case 'assign_founder': {
                const patch: Record<string, unknown> = { updated_at: now };
                if ('group_id' in body) patch.group_id = body.group_id || null;
                if ('next_action' in body) patch.next_action = text(body.next_action, 500);
                if ('next_action_due' in body) patch.next_action_due = date(body.next_action_due);
                const { data, error } = await supabase.from('catalyst_submissions').update(patch).eq('id', body.id).select('id, group_id, next_action, next_action_due').single();
                if (error) throw error;
                return NextResponse.json({ founder: data });
            }
            case 'send_welcome': {
                const ids: string[] = Array.isArray(body.ids) ? body.ids.slice(0, 100) : [];
                if (!ids.length) return bad('Choose at least one founder.');
                const { data: settings } = await supabase.from('catalyst_launch_settings').select('launch_date').eq('cohort_year', COHORT_YEAR).single();
                const { data: groups } = await supabase.from('catalyst_groups').select('id, name, contact_name').eq('cohort_year', COHORT_YEAR);
                const groupById = new Map((groups || []).map(g => [g.id, g]));
                const sent: string[] = []; const failed: { id: string; reason: string }[] = [];
                for (const id of ids) {
                    try {
                        const { data: f } = await supabase.from('catalyst_submissions').select('id, full_name, email, business_name, portal_token, group_id, status').eq('id', id).single();
                        if (!f) throw new Error('not found');
                        if (f.status !== 'paid') throw new Error('place not confirmed');
                        const g = f.group_id ? groupById.get(f.group_id) : null;
                        await sendWelcomePack(f, await ensurePortalUrl(supabase, f), { group: g?.name, contact: g?.contact_name, launchDate: settings?.launch_date || '2026-11-30' });
                        await supabase.from('catalyst_submissions').update({ welcome_sent_at: now, participant_status: 'onboarding' }).eq('id', id);
                        sent.push(id);
                    } catch (e: any) { failed.push({ id, reason: e?.message || 'failed' }); }
                }
                return NextResponse.json({ sent, failed });
            }
            case 'portal_link': {
                // Lets an admin copy a founder's link to share over WhatsApp; recorded in server logs only.
                const f = await founder(body.id);
                return NextResponse.json({ url: await ensurePortalUrl(supabase, f) });
            }

            default:
                return bad('Unknown action');
        }
    } catch (err: any) {
        return bad(err?.message || 'Something went wrong.', 500);
    }
}
