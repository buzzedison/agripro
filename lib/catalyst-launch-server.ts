import 'server-only';
import { randomBytes } from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildBrandedEmail, escapeHtml } from '@/lib/email/branded-email';
import { Offer, formatDate, formatUsd } from '@/lib/catalyst-launch';

// Server-only helpers for the Catalyst W launch: portal links, founder emails and Paystack.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.agriprohub.com';
const FROM = 'AgriPro Catalyst W <noreply@agriprohub.com>';
const REPLY_TO = process.env.CATALYST_REPLY_TO || 'edison@agriprohub.com';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export function serviceClient(): SupabaseClient {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

export type FounderRecord = {
    id: string;
    full_name: string;
    email: string;
    business_name?: string | null;
    country?: string | null;
    portal_token?: string | null;
};

/** Returns the founder's private portal link, creating its 256-bit token the first time. */
export async function ensurePortalUrl(supabase: SupabaseClient, founder: FounderRecord): Promise<string> {
    let token = founder.portal_token;
    if (!token) {
        const fresh = randomBytes(32).toString('hex');
        // Only set when still empty, so two admins acting at once cannot issue different links.
        await supabase.from('catalyst_submissions').update({ portal_token: fresh }).eq('id', founder.id).is('portal_token', null);
        const { data } = await supabase.from('catalyst_submissions').select('portal_token').eq('id', founder.id).single();
        token = data?.portal_token || fresh;
        founder.portal_token = token;
    }
    return `${SITE_URL}/catalyst-w/portal/${token}`;
}

const button = (href: string, label: string) =>
    `<p style="margin:20px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;background:#0B2C24;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:8px;">${escapeHtml(label)}</a></p>
<p style="margin:0 0 12px;font-size:12px;color:#6b7280;">This link is personal to you. Please do not forward it.</p>`;
const p = (html: string) => `<p style="margin:0 0 12px;line-height:1.6;">${html}</p>`;

async function send(to: string, subject: string, headerTitle: string, firstName: string, bodyHtml: string) {
    if (!resend) throw new Error('Email is not configured (RESEND_API_KEY).');
    const html = buildBrandedEmail({ headerTitle, subtitle: 'AgriPro Catalyst W — Cohort 2026', recipientName: firstName || 'there', bodyHtml, signOff: '— The AgriPro Catalyst W Team' });
    const { error } = await resend.emails.send({ from: FROM, to, replyTo: REPLY_TO, subject, html });
    if (error) throw new Error(error.message);
}
const first = (f: FounderRecord) => f.full_name.split(' ')[0];

export async function sendScholarshipInvite(f: FounderRecord, url: string) {
    await send(f.email, 'Catalyst W scholarships — tell us what you need', 'Scholarship support', first(f),
        p(`Thank you for applying to AgriPro Catalyst W${f.business_name ? ` with <strong>${escapeHtml(f.business_name)}</strong>` : ''}.`) +
        p('We offer a limited number of <strong>$199 scholarship places</strong> and, where funding allows, a small number of <strong>fully funded places</strong>. Scholarship requests are assessed separately from admission: asking for support does not affect whether you are selected.') +
        p('If cost could stop you taking part, please tell us about your situation using the short form below. It takes about five minutes.') +
        button(url, 'Request scholarship support'));
}

export async function sendOfferEmail(f: FounderRecord, offer: Offer, url: string) {
    const fee = Number(offer.fee_usd) === 0 ? 'Your place is <strong>fully funded</strong> — there is no fee to pay.' : `Your programme fee is <strong>${formatUsd(offer.fee_usd)}</strong>${offer.funding !== 'standard' ? ` (${escapeHtml(offer.subsidy_note || 'includes a scholarship')})` : ''}.`;
    await send(f.email, 'Your offer — AgriPro Catalyst W Cohort 2026', 'Congratulations — we would like to offer you a place', first(f),
        p(`We are delighted to offer you a place in <strong>AgriPro Catalyst W, Cohort 2026</strong>${f.business_name ? ` for <strong>${escapeHtml(f.business_name)}</strong>` : ''}.`) +
        p(fee) +
        p(`Please accept your offer${Number(offer.fee_usd) > 0 ? ' and complete payment' : ''} by <strong>${formatDate(offer.payment_deadline)}</strong>. After that date we may offer the place to another founder.`) +
        button(url, Number(offer.fee_usd) > 0 ? 'View offer and pay' : 'View and accept offer') +
        p('If you have questions or need a different way to pay, reply to this email.'));
}

export async function sendOfferReminder(f: FounderRecord, offer: Offer, url: string) {
    await send(f.email, 'Reminder: your Catalyst W offer', 'A reminder about your offer', first(f),
        p(`Your place in Catalyst W is being held until <strong>${formatDate(offer.payment_deadline)}</strong>. ${offer.status === 'accepted' ? 'Thank you for accepting — please complete your payment to confirm your place.' : 'Please accept or decline your offer so we can plan the cohort.'}`) +
        button(url, offer.status === 'accepted' ? 'Complete payment' : 'View my offer') +
        p('If something is stopping you, reply to this email and we will try to help.'));
}

export async function sendPlaceConfirmed(f: FounderRecord, offer: Offer, url: string) {
    await send(f.email, 'Your place is confirmed — AgriPro Catalyst W', 'Your place is confirmed', first(f),
        p(`${Number(offer.amount_paid_usd) > 0 ? `We have received your payment of ${formatUsd(offer.amount_paid_usd)}. ` : ''}You are now confirmed in <strong>AgriPro Catalyst W, Cohort 2026</strong>.`) +
        p('Your welcome pack, with your group, contact person and the first weeks of the timetable, will appear on your founder page before launch.') +
        button(url, 'Open my founder page'));
}

export async function sendWelcomePack(f: FounderRecord, url: string, details: { group?: string | null; contact?: string | null; launchDate: string }) {
    await send(f.email, 'Welcome to Catalyst W — your welcome pack', 'Welcome to Catalyst W', first(f),
        p(`We launch on <strong>${formatDate(details.launchDate)}</strong> and we cannot wait to start.`) +
        (details.group ? p(`You are in <strong>${escapeHtml(details.group)}</strong>${details.contact ? `, and your contact person is <strong>${escapeHtml(details.contact)}</strong>` : ''}.`) : '') +
        p('Your founder page has your group, contact person, the timetable for the first three weeks and your next action. Please check it before the opening session.') +
        button(url, 'Open my welcome pack'));
}

// ── Payments ────────────────────────────────────────────────────────

export const paymentsConfigured = () => !!PAYSTACK_SECRET;

export async function paystackInitialize(args: { email: string; amountUsd: number; reference: string; callbackUrl: string; offerId: string; submissionId: string; name: string }) {
    if (!PAYSTACK_SECRET) throw new Error('Online payment is not set up yet. Please reply to your offer email and we will send other payment options.');
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: args.email,
            amount: Math.round(args.amountUsd * 100),
            currency: 'USD',
            reference: args.reference,
            callback_url: args.callbackUrl,
            metadata: {
                campaign: 'catalyst_w_fee',
                offer_id: args.offerId,
                submission_id: args.submissionId,
                custom_fields: [{ display_name: 'Founder', variable_name: 'founder', value: args.name }, { display_name: 'Purpose', variable_name: 'purpose', value: 'Catalyst W 2026 programme fee' }],
            },
        }),
    });
    const data = await res.json();
    if (!data.status || !data.data?.authorization_url) throw new Error('Could not start the payment. Please try again in a few minutes.');
    return data.data.authorization_url as string;
}

export async function paystackVerify(reference: string) {
    if (!PAYSTACK_SECRET) throw new Error('Payment service not configured.');
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        cache: 'no-store',
    });
    const data = await res.json();
    return data?.data as undefined | { status: string; amount: number; currency: string; reference: string; metadata?: { offer_id?: string } };
}

/**
 * Confirms a founder's place once (paid, waived for fully funded places, or recorded by an admin).
 * Safe to call repeatedly: only sent/accepted offers change, so webhook retries do nothing.
 */
export async function confirmOffer(supabase: SupabaseClient, offerId: string, payment: { amountUsd: number; method: string; reference?: string | null }) {
    const now = new Date().toISOString();
    const { data: offer } = await supabase.from('catalyst_offers')
        .update({ status: 'confirmed', confirmed_at: now, responded_at: now, amount_paid_usd: payment.amountUsd, payment_method: payment.method, payment_reference: payment.reference || null, updated_at: now })
        .eq('id', offerId).in('status', ['sent', 'accepted'])
        .select('*').maybeSingle();
    if (!offer) return null;
    await supabase.from('catalyst_submissions')
        .update({ status: 'paid', participant_status: 'selected', selected_at: now, updated_at: now })
        .eq('id', offer.submission_id);
    const { data: founder } = await supabase.from('catalyst_submissions').select('id, full_name, email, business_name, portal_token').eq('id', offer.submission_id).single();
    if (founder) {
        try { await sendPlaceConfirmed(founder, offer as Offer, await ensurePortalUrl(supabase, founder)); } catch (e) { console.error('Confirmation email failed', e); }
    }
    return offer as Offer;
}

/** Checks a Paystack transaction against the offer and confirms the place if it covers the fee. */
export async function settlePaystackReference(supabase: SupabaseClient, reference: string) {
    const tx = await paystackVerify(reference);
    const { data: payment } = await supabase.from('catalyst_payments').select('id, offer_id').eq('reference', reference).maybeSingle();
    if (!tx || !payment) return { ok: false as const, reason: 'Payment not found.' };
    const { data: offer } = await supabase.from('catalyst_offers').select('*').eq('id', payment.offer_id).single();
    const paidUsd = tx.amount / 100;
    const success = tx.status === 'success' && tx.currency === 'USD' && offer && paidUsd + 0.001 >= Number(offer.fee_usd) && (!tx.metadata?.offer_id || tx.metadata.offer_id === offer.id);
    await supabase.from('catalyst_payments').update({
        status: tx.status === 'success' ? 'success' : tx.status === 'abandoned' ? 'abandoned' : 'failed',
        amount_usd: paidUsd, raw: tx, updated_at: new Date().toISOString(),
    }).eq('id', payment.id);
    if (!success) return { ok: false as const, reason: tx.status === 'success' ? 'The amount paid did not match your fee. Our team will contact you.' : 'The payment was not completed.' };
    if (offer.status === 'confirmed') return { ok: true as const, offer };
    const confirmed = await confirmOffer(supabase, offer.id, { amountUsd: paidUsd, method: 'paystack', reference });
    return confirmed ? { ok: true as const, offer: confirmed } : { ok: false as const, reason: 'This offer is no longer open. Our team will contact you about your payment.' };
}
