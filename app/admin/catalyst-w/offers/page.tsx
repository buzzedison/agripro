'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Copy, Loader2, Send } from 'lucide-react';
import LaunchShell, { btnPrimary, btnSecondary, card, input, label } from '../components/LaunchShell';
import { LaunchData, LaunchFounder, launchAction, upsertById, useLaunch } from '../components/useLaunch';
import {
    FUNDING_LABELS, OFFER_STATUS, OPEN_OFFER_STATUSES, Offer, OfferFunding, SCHOLARSHIP_LABELS,
    addDays, defaultFee, formatDate, formatUsd, isOverdue,
} from '@/lib/catalyst-launch';

type Draft = { submission_id: string; funding: OfferFunding; fee_usd: string; plan_label: string; payment_deadline: string; subsidy_note: string };
const CANDIDATE_STATUSES = ['accepted', 'interviewed', 'shortlisted'];
const normaliseOffer = (o: Offer): Offer => ({ ...o, fee_usd: Number(o.fee_usd), amount_paid_usd: o.amount_paid_usd == null ? null : Number(o.amount_paid_usd) });

function planFromTier(tier: string | null) {
    if (!tier) return 'Catalyst W Programme';
    return tier.replace(/\s*\(\$\d+\)\s*$/, '').trim() || 'Catalyst W Programme';
}

export default function OffersPage() {
    const { data, setData, loading, error, load } = useLaunch();
    const [draft, setDraft] = useState<Draft | null>(null);
    const [settingsDraft, setSettingsDraft] = useState<Record<string, string> | null>(null);
    const [payment, setPayment] = useState<{ id: string; method: string; amount: string; reference: string } | null>(null);
    const [busy, setBusy] = useState<string | null>(null);

    const offerBySubmission = useMemo(() => new Map((data?.offers || []).map(o => [o.submission_id, o])), [data]);
    const scholarshipBySubmission = useMemo(() => new Map((data?.scholarships || []).map(s => [s.submission_id, s])), [data]);
    const founderById = useMemo(() => new Map((data?.founders || []).map(f => [f.id, f])), [data]);

    if (!data) return <LaunchShell title="Offers & confirmed places" subtitle="Offers with fees, subsidies and payment deadlines" onRefresh={load} loading={loading} error={error}>{null}</LaunchShell>;

    const s = data.settings;
    const confirmed = data.offers.filter(o => o.status === 'confirmed');
    const open = data.offers.filter(o => o.status === 'sent' || o.status === 'accepted');
    const overdue = data.offers.filter(o => isOverdue(o));
    const vacancies = Math.max(0, s.target_cohort_size - confirmed.length - open.length);
    const candidates = data.founders
        .filter(f => CANDIDATE_STATUSES.includes(f.status) && !offerBySubmission.has(f.id))
        .sort((a, b) => CANDIDATE_STATUSES.indexOf(a.status) - CANDIDATE_STATUSES.indexOf(b.status) || Number(!!b.business_verified) - Number(!!a.business_verified));
    const reserve = data.founders.filter(f => f.status === 'waitlisted' && (!offerBySubmission.has(f.id) || !OPEN_OFFER_STATUSES.includes(offerBySubmission.get(f.id)!.status)))
        .sort((a, b) => (a.reserve_rank ?? 9999) - (b.reserve_rank ?? 9999) || a.created_at.localeCompare(b.created_at));
    const offers = [...data.offers].sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a)) || (a.status === 'draft' ? -1 : 0) - (b.status === 'draft' ? -1 : 0) || a.payment_deadline.localeCompare(b.payment_deadline));
    const stuckPayments = data.payments.filter(p => p.status === 'success' && data.offers.find(o => o.id === p.offer_id)?.status !== 'confirmed');
    const collected = confirmed.reduce((sum, o) => sum + (o.amount_paid_usd || 0), 0);

    const startDraft = (f: LaunchFounder, existing?: Offer) => {
        const sch = scholarshipBySubmission.get(f.id);
        const funding: OfferFunding = existing?.funding || (sch?.decision === 'fully_funded' ? 'fully_funded' : sch?.decision === 'scholarship_199' ? 'scholarship_199' : 'standard');
        setDraft({
            submission_id: f.id,
            funding,
            fee_usd: String(existing?.fee_usd ?? defaultFee(funding, s)),
            plan_label: existing?.plan_label || planFromTier(f.plan_tier),
            payment_deadline: existing && existing.payment_deadline >= new Date().toISOString().slice(0, 10) ? existing.payment_deadline : addDays(new Date(), s.offer_response_days),
            subsidy_note: existing?.subsidy_note || (funding === 'scholarship_199' ? '$199 scholarship place' : funding === 'fully_funded' ? 'Fully funded place' : ''),
        });
    };

    const saveDraft = async (sendNow: boolean) => {
        if (!draft) return;
        setBusy('draft');
        const saved = await launchAction<{ offer: Offer }>('save_offer', { offer: draft }, sendNow ? undefined : 'Offer saved as draft');
        let offer = saved?.offer ? normaliseOffer(saved.offer) : null;
        if (offer && sendNow) {
            const sent = await launchAction<{ offer: Offer }>('send_offer', { id: offer.id }, 'Offer sent');
            if (sent) offer = normaliseOffer(sent.offer);
        }
        setBusy(null);
        if (!offer) return;
        const next: LaunchData = { ...data, offers: upsertById(data.offers, offer) };
        if (offer.status === 'sent') next.founders = data.founders.map(f => (f.id === offer!.submission_id && f.status !== 'paid' ? { ...f, status: 'accepted', reserve_rank: null } : f));
        setData(next);
        setDraft(null);
    };

    const offerAction = async (offer: Offer, action: string, payload: Record<string, unknown> = {}, success?: string) => {
        setBusy(offer.id);
        const res = await launchAction<{ offer: Offer }>(action, { id: offer.id, ...payload }, success);
        setBusy(null);
        if (!res) return;
        const updated = normaliseOffer(res.offer);
        const founders = data.founders.map(f => {
            if (f.id !== updated.submission_id) return f;
            if (updated.status === 'confirmed') return { ...f, status: 'paid' as const };
            if ((updated.status === 'expired' || updated.status === 'withdrawn') && f.status === 'accepted') return { ...f, status: 'waitlisted' as const };
            return f;
        });
        setData({ ...data, offers: upsertById(data.offers, updated), founders });
        setPayment(null);
    };

    const copyLink = async (founderId: string) => {
        const res = await launchAction<{ url: string }>('portal_link', { id: founderId });
        if (!res) return;
        try { await navigator.clipboard.writeText(res.url); toast.success('Founder link copied. Share it only with this founder.'); } catch { prompt('Copy the founder link:', res.url); }
        setData({ ...data, founders: data.founders.map(f => (f.id === founderId ? { ...f, has_portal: true } : f)) });
    };

    const saveSettings = async () => {
        if (!settingsDraft) return;
        const res = await launchAction('save_settings', { settings: { ...s, ...settingsDraft } }, 'Settings saved');
        if (res) { setData({ ...data, settings: { ...res.settings, standard_fee_usd: Number(res.settings.standard_fee_usd) } }); setSettingsDraft(null); }
    };

    const setReserve = async (f: LaunchFounder, rank: string) => {
        const res = await launchAction('set_reserve', { id: f.id, rank: rank || null });
        if (res) setData({ ...data, founders: data.founders.map(x => (x.id === f.id ? { ...x, ...res.founder } : x)) });
    };

    const draftFounder = draft ? founderById.get(draft.submission_id) : null;
    const sv = (k: keyof typeof s) => settingsDraft?.[k] ?? String(s[k]);

    return (
        <LaunchShell
            title="Offers & confirmed places"
            subtitle="Send offers with the right fee, track replies and payments, and fill places from the reserve list"
            onRefresh={load}
            loading={loading}
            error={error}
            tiles={[
                { label: 'Target cohort', value: s.target_cohort_size || '—' },
                { label: 'Confirmed places', value: confirmed.length },
                { label: 'Offers awaiting reply/payment', value: open.length },
                { label: 'Past deadline', value: <span className={overdue.length ? 'text-amber-300' : ''}>{overdue.length}</span> },
                { label: 'Places to fill', value: s.target_cohort_size ? vacancies : '—', hint: 'Target minus confirmed and open offers' },
                { label: 'Fees collected', value: formatUsd(collected) },
            ]}
        >
            <div className="space-y-6">
                {stuckPayments.length > 0 && (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> {stuckPayments.length} successful payment{stuckPayments.length === 1 ? '' : 's'} not linked to a confirmed place</p>
                        <p className="mt-1">The founder paid after their offer closed or the amount was short. Check in Paystack, then record the payment or arrange a refund: {stuckPayments.map(p => p.reference).join(', ')}</p>
                    </div>
                )}

                <section className={card}>
                    <h2 className="font-bold text-gray-900">Cohort settings</h2>
                    <div className="mt-3 flex flex-wrap items-end gap-3">
                        <label className={label}>Target cohort size<input type="number" min={0} className={`${input} mt-1 w-32`} value={sv('target_cohort_size')} onChange={e => setSettingsDraft({ ...settingsDraft, target_cohort_size: e.target.value })} /></label>
                        <label className={label}>Standard fee (USD)<input type="number" min={0} className={`${input} mt-1 w-32`} value={sv('standard_fee_usd')} onChange={e => setSettingsDraft({ ...settingsDraft, standard_fee_usd: e.target.value })} /></label>
                        <label className={label}>Days to accept & pay<input type="number" min={1} max={30} className={`${input} mt-1 w-32`} value={sv('offer_response_days')} onChange={e => setSettingsDraft({ ...settingsDraft, offer_response_days: e.target.value })} /></label>
                        <label className={label}>Launch date<input type="date" className={`${input} mt-1`} value={sv('launch_date')} onChange={e => setSettingsDraft({ ...settingsDraft, launch_date: e.target.value })} /></label>
                        <button onClick={saveSettings} disabled={!settingsDraft} className={btnPrimary}>Save</button>
                    </div>
                </section>

                {draft && draftFounder && (
                    <section className={`${card} border-green-200 ring-2 ring-green-100`}>
                        <h2 className="font-bold text-gray-900">Offer for {draftFounder.full_name}</h2>
                        <p className="mb-3 text-sm text-gray-500">
                            {[draftFounder.business_name, draftFounder.country].filter(Boolean).join(' · ')}
                            {scholarshipBySubmission.get(draftFounder.id) && ` · Scholarship: ${SCHOLARSHIP_LABELS[scholarshipBySubmission.get(draftFounder.id)!.decision]}`}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <label className={label}>Funding
                                <select className={`${input} mt-1`} value={draft.funding} onChange={e => { const funding = e.target.value as OfferFunding; setDraft({ ...draft, funding, fee_usd: funding === 'custom_subsidy' ? draft.fee_usd : String(defaultFee(funding, s)) }); }}>
                                    {Object.entries(FUNDING_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                            </label>
                            <label className={label}>Fee (USD)<input type="number" min={0} className={`${input} mt-1`} disabled={draft.funding === 'fully_funded'} value={draft.fee_usd} onChange={e => setDraft({ ...draft, fee_usd: e.target.value })} /></label>
                            <label className={label}>Plan<input className={`${input} mt-1`} value={draft.plan_label} onChange={e => setDraft({ ...draft, plan_label: e.target.value })} /></label>
                            <label className={label}>Accept & pay by<input type="date" className={`${input} mt-1`} value={draft.payment_deadline} onChange={e => setDraft({ ...draft, payment_deadline: e.target.value })} /></label>
                            <label className={`${label} sm:col-span-2 lg:col-span-4`}>Note shown to the founder about their fee (optional)<input className={`${input} mt-1`} maxLength={500} value={draft.subsidy_note} onChange={e => setDraft({ ...draft, subsidy_note: e.target.value })} placeholder="e.g. Includes a partner-funded subsidy of $200" /></label>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button onClick={() => saveDraft(true)} disabled={busy === 'draft'} className={btnPrimary}>{busy === 'draft' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Save & email offer</button>
                            <button onClick={() => saveDraft(false)} disabled={busy === 'draft'} className={btnSecondary}>Save as draft</button>
                            <button onClick={() => setDraft(null)} className="px-3 py-2 text-sm text-gray-500">Cancel</button>
                        </div>
                    </section>
                )}

                <section className={card}>
                    <h2 className="font-bold text-gray-900">Offers</h2>
                    <p className="mb-3 text-sm text-gray-500">Past-deadline offers first. Founders accept and pay on their private founder page.</p>
                    {offers.length === 0 ? <p className="text-sm text-gray-500">No offers yet. Prepare one from the selected founders below.</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <tr><th className="py-2 pr-3">Founder</th><th className="py-2 pr-3">Fee</th><th className="py-2 pr-3">Deadline</th><th className="py-2 pr-3">Status</th><th className="py-2 text-right">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {offers.map(o => {
                                        const f = founderById.get(o.submission_id);
                                        const late = isOverdue(o);
                                        return (
                                            <tr key={o.id} className={late ? 'bg-amber-50/60' : ''}>
                                                <td className="py-3 pr-3 align-top"><p className="font-medium">{f?.full_name || 'Founder'}</p><p className="text-xs text-gray-500">{[f?.business_name, f?.country].filter(Boolean).join(' · ')}</p></td>
                                                <td className="py-3 pr-3 align-top"><p className="font-semibold">{formatUsd(o.fee_usd)}</p><p className="text-xs text-gray-500">{FUNDING_LABELS[o.funding]}</p></td>
                                                <td className="py-3 pr-3 align-top"><p className={late ? 'font-semibold text-amber-700' : ''}>{formatDate(o.payment_deadline)}</p>{late && <p className="text-xs text-amber-700">Past deadline</p>}</td>
                                                <td className="py-3 pr-3 align-top">
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${OFFER_STATUS[o.status].color}`}>{OFFER_STATUS[o.status].label}</span>
                                                    {o.status === 'confirmed' && <p className="mt-1 text-xs text-gray-500">{formatUsd(o.amount_paid_usd)} · {o.payment_method?.replace('_', ' ')} · {formatDate(o.confirmed_at)}</p>}
                                                    {o.status === 'declined' && o.decline_reason && <p className="mt-1 max-w-xs text-xs text-gray-500">“{o.decline_reason}”</p>}
                                                    {o.reminder_sent_at && ['sent', 'accepted'].includes(o.status) && <p className="mt-1 text-xs text-gray-400">Reminded {formatDate(o.reminder_sent_at)}</p>}
                                                </td>
                                                <td className="py-3 align-top">
                                                    <div className="flex flex-wrap justify-end gap-1.5">
                                                        {o.status === 'draft' && <button disabled={busy === o.id} onClick={() => offerAction(o, 'send_offer', {}, 'Offer sent')} className={`${btnPrimary} px-2.5 py-1.5 text-xs`}>Send</button>}
                                                        {['sent', 'accepted'].includes(o.status) && !late && <button disabled={busy === o.id} onClick={() => offerAction(o, 'remind_offer', {}, 'Reminder sent')} className={`${btnSecondary} px-2.5 py-1.5 text-xs`}>Remind</button>}
                                                        {['sent', 'accepted'].includes(o.status) && <button disabled={busy === o.id} onClick={() => setPayment({ id: o.id, method: o.fee_usd === 0 ? 'waived' : 'bank_transfer', amount: String(o.fee_usd), reference: '' })} className={`${btnSecondary} px-2.5 py-1.5 text-xs`}>Record payment</button>}
                                                        {(['draft', 'declined', 'expired', 'withdrawn'].includes(o.status) || late) && f && <button onClick={() => startDraft(f, o)} className={`${btnSecondary} px-2.5 py-1.5 text-xs`}>{late ? 'New deadline' : 'Edit'}</button>}
                                                        {late && <button disabled={busy === o.id} onClick={() => confirm('Mark this offer expired and free the place?') && offerAction(o, 'close_offer', { status: 'expired' }, 'Offer expired — place freed')} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100">Expire</button>}
                                                        {['draft', 'sent', 'accepted'].includes(o.status) && !late && <button disabled={busy === o.id} onClick={() => confirm('Withdraw this offer? The founder is not emailed automatically.') && offerAction(o, 'close_offer', { status: 'withdrawn' }, 'Offer withdrawn')} className="rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50">Withdraw</button>}
                                                        <button onClick={() => copyLink(o.submission_id)} title="Copy founder page link" aria-label="Copy founder page link" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><Copy className="h-3.5 w-3.5" /></button>
                                                    </div>
                                                    {payment?.id === o.id && (
                                                        <div className="mt-2 flex flex-wrap items-end justify-end gap-2 rounded-lg bg-gray-50 p-2">
                                                            <label className={label}>Method
                                                                <select className={`${input} mt-1 py-1.5 text-xs`} value={payment.method} onChange={e => setPayment({ ...payment, method: e.target.value })}>
                                                                    <option value="bank_transfer">Bank transfer</option><option value="mobile_money">Mobile money</option><option value="waived">Waived / fully funded</option><option value="other">Other</option>
                                                                </select>
                                                            </label>
                                                            <label className={label}>Amount (USD)<input type="number" min={0} className={`${input} mt-1 w-24 py-1.5 text-xs`} value={payment.amount} onChange={e => setPayment({ ...payment, amount: e.target.value })} /></label>
                                                            <label className={label}>Reference<input className={`${input} mt-1 w-32 py-1.5 text-xs`} value={payment.reference} onChange={e => setPayment({ ...payment, reference: e.target.value })} /></label>
                                                            <button disabled={busy === o.id} onClick={() => offerAction(o, 'record_payment', { method: payment.method, amount_usd: payment.amount, reference: payment.reference }, 'Place confirmed')} className={`${btnPrimary} px-2.5 py-1.5 text-xs`}>Confirm place</button>
                                                            <button onClick={() => setPayment(null)} className="text-xs text-gray-500">Cancel</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className={card}>
                    <h2 className="font-bold text-gray-900">Selected founders without an offer</h2>
                    <p className="mb-3 text-sm text-gray-500">Founders at Accepted, Interviewed or Shortlisted. The fee follows their scholarship decision unless you change it.</p>
                    {candidates.length === 0 ? <p className="text-sm text-gray-500">No one is waiting for an offer.</p> : (
                        <ul className="divide-y divide-gray-100">
                            {candidates.map(f => {
                                const sch = scholarshipBySubmission.get(f.id);
                                return (
                                    <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                        <div>
                                            <p className="font-medium">{f.full_name} <span className="text-xs font-normal capitalize text-gray-500">· {f.status}</span></p>
                                            <p className="text-xs text-gray-500">{[f.business_name, f.country, f.plan_tier].filter(Boolean).join(' · ')}{sch ? ` · Scholarship: ${SCHOLARSHIP_LABELS[sch.decision]}` : ''}{f.business_verified ? ' · Business verified' : ''}</p>
                                        </div>
                                        <button onClick={() => startDraft(f)} className={`${btnSecondary} px-2.5 py-1.5 text-xs`}>Prepare offer</button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <section className={card}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-gray-900">Reserve list</h2>
                            <p className="text-sm text-gray-500">Rank founders in the order places should be offered when someone declines or misses the deadline.</p>
                        </div>
                        {reserve[0] && vacancies > 0 && <button onClick={() => startDraft(reserve[0], offerBySubmission.get(reserve[0].id))} className={btnPrimary}>Offer next: {reserve[0].full_name}</button>}
                    </div>
                    {reserve.length === 0 ? <p className="text-sm text-gray-500">No one on the reserve list. Set founders to Reserve list on the Selection page.</p> : (
                        <ol className="divide-y divide-gray-100">
                            {reserve.map(f => (
                                <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                                    <div className="flex items-center gap-3">
                                        <input type="number" min={1} aria-label={`Reserve rank for ${f.full_name}`} defaultValue={f.reserve_rank ?? ''} onBlur={e => e.target.value !== String(f.reserve_rank ?? '') && setReserve(f, e.target.value)} className={`${input} w-16 py-1 text-center`} />
                                        <div><p className="font-medium">{f.full_name}</p><p className="text-xs text-gray-500">{[f.business_name, f.country].filter(Boolean).join(' · ')}</p></div>
                                    </div>
                                    <button onClick={() => startDraft(f, offerBySubmission.get(f.id))} className={`${btnSecondary} px-2.5 py-1.5 text-xs`}>Prepare offer</button>
                                </li>
                            ))}
                        </ol>
                    )}
                </section>
            </div>
        </LaunchShell>
    );
}
