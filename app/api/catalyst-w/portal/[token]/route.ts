import { NextRequest, NextResponse } from 'next/server';
import { COHORT_YEAR } from '@/lib/catalyst-selection';
import { REVENUE_BANDS, deadlinePassed, sameCountry } from '@/lib/catalyst-launch';
import { SITE_URL, confirmOffer, paymentsConfigured, paystackInitialize, serviceClient, settlePaystackReference } from '@/lib/catalyst-launch-server';

// Founder portal: everything a founder can see or do, reached only through their private link.
// Responses contain only that founder's own information and never other founders' data.

type Ctx = { params: Promise<{ token: string }> };
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

async function loadFounder(token: string) {
    if (!/^[0-9a-f]{64}$/.test(token)) return null;
    const supabase = serviceClient();
    const { data } = await supabase.from('catalyst_submissions')
        .select('id, full_name, email, business_name, country, status, excluded_reason, duplicate_of, scholarship_invited_at, group_id, next_action, next_action_due, portal_token')
        .eq('portal_token', token).maybeSingle();
    if (!data || data.excluded_reason || data.duplicate_of) return null;
    return { supabase, founder: data };
}

export async function GET(_req: NextRequest, ctx: Ctx) {
    const { token } = await ctx.params;
    const loaded = await loadFounder(token);
    if (!loaded) return bad('This link is not valid. Please use the latest link from your email, or reply to it for help.', 404);
    const { supabase, founder } = loaded;

    const [{ data: scholarship }, { data: offer }, { data: settings }] = await Promise.all([
        supabase.from('catalyst_scholarship_requests').select('requested, can_contribute_usd, monthly_revenue_band, dependants, circumstances, submitted_at, decision').eq('submission_id', founder.id).maybeSingle(),
        supabase.from('catalyst_offers').select('id, plan_label, fee_usd, funding, subsidy_note, payment_deadline, status, confirmed_at, amount_paid_usd').eq('submission_id', founder.id).neq('status', 'draft').maybeSingle(),
        supabase.from('catalyst_launch_settings').select('launch_date').eq('cohort_year', COHORT_YEAR).single(),
    ]);

    let welcome = null;
    if (offer?.status === 'confirmed') {
        const [{ data: group }, { data: countries }, { data: cohort }] = await Promise.all([
            founder.group_id ? supabase.from('catalyst_groups').select('name, venture_lead_name, venture_lead_email, contact_name, contact_email, contact_phone, meeting_rhythm').eq('id', founder.group_id).maybeSingle() : Promise.resolve({ data: null }),
            supabase.from('catalyst_countries').select('country, active, status, host_org, coordinator_name, coordinator_contact, venue, first_activity, first_activity_date').eq('cohort_year', COHORT_YEAR).eq('active', true),
            supabase.from('catalyst_w_cohorts').select('id').in('status', ['active', 'draft']).order('start_date', { ascending: false }).limit(1).maybeSingle(),
        ]);
        const { data: sessions } = cohort
            ? await supabase.from('catalyst_w_sessions').select('week_number, title, type, scheduled_date, scheduled_time, timezone, duration_minutes, status').eq('cohort_id', cohort.id).lte('week_number', 3).neq('status', 'cancelled').order('week_number').order('session_number')
            : { data: [] };
        const gathering = (countries || []).find(c => sameCountry(c.country, founder.country));
        welcome = {
            group,
            gathering: gathering && gathering.status !== 'planning' ? gathering : null,
            sessions: sessions || [],
            next_action: founder.next_action,
            next_action_due: founder.next_action_due,
        };
    }

    return NextResponse.json({
        founder: { first_name: founder.full_name.split(' ')[0], full_name: founder.full_name, business_name: founder.business_name, country: founder.country },
        launch_date: settings?.launch_date || '2026-11-30',
        scholarship: { invited: !!founder.scholarship_invited_at, request: scholarship },
        offer: offer ? { ...offer, fee_usd: Number(offer.fee_usd), overdue: (offer.status === 'sent' || offer.status === 'accepted') && deadlinePassed(offer.payment_deadline) } : null,
        payments_enabled: paymentsConfigured(),
        welcome,
    }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest, ctx: Ctx) {
    const { token } = await ctx.params;
    const loaded = await loadFounder(token);
    if (!loaded) return bad('This link is not valid.', 404);
    const { supabase, founder } = loaded;
    const body = await request.json().catch(() => null);
    const now = new Date().toISOString();
    const { data: offer } = await supabase.from('catalyst_offers').select('*').eq('submission_id', founder.id).neq('status', 'draft').maybeSingle();

    try {
        switch (body?.action) {
            case 'submit_scholarship': {
                if (!founder.scholarship_invited_at && !offer) return bad('Scholarship requests open once our team invites you.');
                if (offer?.status === 'confirmed') return bad('Your place is already confirmed.');
                const requested = body.requested === 'fully_funded' ? 'fully_funded' : body.requested === 'scholarship_199' ? 'scholarship_199' : null;
                if (!requested) return bad('Choose the support you are asking for.');
                const circumstances = String(body.circumstances || '').trim();
                if (circumstances.length < 20) return bad('Please tell us a little more about your situation (at least a couple of sentences).');
                const contribute = Number(body.can_contribute_usd);
                const { data: existing } = await supabase.from('catalyst_scholarship_requests').select('id, decision').eq('submission_id', founder.id).maybeSingle();
                if (existing && existing.decision !== 'pending') return bad('Our team has already decided on your request. Reply to your email if your situation has changed.');
                const row = {
                    submission_id: founder.id, requested,
                    can_contribute_usd: Number.isFinite(contribute) ? Math.min(Math.max(contribute, 0), 10000) : 0,
                    monthly_revenue_band: REVENUE_BANDS.includes(body.monthly_revenue_band) ? body.monthly_revenue_band : null,
                    dependants: Number.isFinite(Number(body.dependants)) && body.dependants !== '' ? Math.min(Math.max(Math.round(Number(body.dependants)), 0), 30) : null,
                    circumstances: circumstances.slice(0, 3000), submitted_at: now,
                };
                const { error } = existing
                    ? await supabase.from('catalyst_scholarship_requests').update(row).eq('id', existing.id)
                    : await supabase.from('catalyst_scholarship_requests').insert(row);
                if (error) throw error;
                return NextResponse.json({ ok: true });
            }

            case 'accept_offer': {
                if (!offer || offer.status !== 'sent') return bad('There is no open offer to accept.');
                if (deadlinePassed(offer.payment_deadline)) return bad('This offer has passed its deadline. Please reply to your offer email.');
                if (Number(offer.fee_usd) === 0) {
                    await confirmOffer(supabase, offer.id, { amountUsd: 0, method: 'waived' });
                } else {
                    await supabase.from('catalyst_offers').update({ status: 'accepted', responded_at: now, updated_at: now }).eq('id', offer.id).eq('status', 'sent');
                }
                return NextResponse.json({ ok: true });
            }

            case 'decline_offer': {
                if (!offer || !['sent', 'accepted'].includes(offer.status)) return bad('There is no open offer to decline.');
                await supabase.from('catalyst_offers').update({
                    status: 'declined', responded_at: now, updated_at: now, decline_reason: String(body.reason || '').trim().slice(0, 1000) || null,
                }).eq('id', offer.id);
                return NextResponse.json({ ok: true });
            }

            case 'start_payment': {
                if (!offer || !['sent', 'accepted'].includes(offer.status)) return bad('There is no offer awaiting payment.');
                if (Number(offer.fee_usd) <= 0) return bad('Your place has no fee to pay.');
                if (deadlinePassed(offer.payment_deadline)) return bad('This offer has passed its payment deadline. Please reply to your offer email.');
                const reference = `cw_${offer.id.replace(/-/g, '').slice(0, 12)}_${Date.now()}`;
                const { error } = await supabase.from('catalyst_payments').insert({ offer_id: offer.id, reference, amount_usd: offer.fee_usd });
                if (error) throw error;
                if (offer.status === 'sent') await supabase.from('catalyst_offers').update({ status: 'accepted', responded_at: now, updated_at: now }).eq('id', offer.id);
                const url = await paystackInitialize({
                    email: founder.email, amountUsd: Number(offer.fee_usd), reference,
                    callbackUrl: `${SITE_URL}/catalyst-w/portal/${token}`, offerId: offer.id, submissionId: founder.id, name: founder.full_name,
                });
                return NextResponse.json({ url });
            }

            case 'verify_payment': {
                const reference = String(body.reference || '');
                if (!offer || !reference) return bad('Missing payment reference.');
                const { data: payment } = await supabase.from('catalyst_payments').select('offer_id').eq('reference', reference).maybeSingle();
                if (!payment || payment.offer_id !== offer.id) return bad('This payment does not belong to your offer.', 404);
                const result = await settlePaystackReference(supabase, reference);
                return result.ok ? NextResponse.json({ ok: true }) : bad(result.reason, 402);
            }

            default:
                return bad('Unknown action');
        }
    } catch (err: any) {
        return bad(err?.message || 'Something went wrong. Please try again.', 500);
    }
}
