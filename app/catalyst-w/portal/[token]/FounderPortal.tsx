'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, CheckCircle2, Loader2, MapPin, MessageCircle, Phone, Mail, Users, ArrowRight } from 'lucide-react';
import { REVENUE_BANDS, formatDate, formatUsd } from '@/lib/catalyst-launch';

type PortalState = {
    founder: { first_name: string; full_name: string; business_name: string | null; country: string | null };
    launch_date: string;
    scholarship: { invited: boolean; request: null | { requested: string; can_contribute_usd: number; monthly_revenue_band: string | null; dependants: number | null; circumstances: string; submitted_at: string; decision: string } };
    offer: null | { plan_label: string; fee_usd: number; funding: string; subsidy_note: string | null; payment_deadline: string; status: string; overdue: boolean; amount_paid_usd: number | null };
    payments_enabled: boolean;
    welcome: null | {
        group: null | { name: string; venture_lead_name: string | null; venture_lead_email: string | null; contact_name: string | null; contact_email: string | null; contact_phone: string | null; meeting_rhythm: string | null };
        gathering: null | { country: string; host_org: string | null; coordinator_name: string | null; coordinator_contact: string | null; venue: string | null; first_activity: string | null; first_activity_date: string | null };
        sessions: { week_number: number; title: string; type: string; scheduled_date: string | null; scheduled_time: string | null; timezone: string | null; duration_minutes: number | null }[];
        next_action: string | null;
        next_action_due: string | null;
    };
};

const box = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100';
const field = 'mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20';
const primary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2C24] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123d32] disabled:opacity-50';

function daysUntil(date: string) {
    return Math.ceil((new Date(`${date}T00:00:00Z`).getTime() - Date.now()) / 86400000);
}

function whatsappLink(phone: string) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}

export default function FounderPortal({ token }: { token: string }) {
    const [state, setState] = useState<PortalState | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState<string | null>(null);
    const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
    const verified = useRef(false);

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/catalyst-w/portal/${token}`, { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setState(data);
        } catch (e: any) {
            setError(e.message || 'We could not open your page. Please try again.');
        }
    }, [token]);

    const act = useCallback(async (action: string, payload: Record<string, unknown> = {}) => {
        setBusy(action);
        setNotice(null);
        try {
            const res = await fetch(`/api/catalyst-w/portal/${token}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...payload }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data;
        } catch (e: any) {
            setNotice({ kind: 'error', text: e.message || 'Something went wrong. Please try again.' });
            return null;
        } finally {
            setBusy(null);
        }
    }, [token]);

    // Returning from Paystack: confirm the payment, then tidy the address bar.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const reference = params.get('reference') || params.get('trxref');
        if (reference && !verified.current) {
            verified.current = true;
            (async () => {
                const res = await act('verify_payment', { reference });
                if (res) setNotice({ kind: 'ok', text: 'Payment received. Your place is confirmed. Welcome to Catalyst W!' });
                window.history.replaceState(null, '', window.location.pathname);
                await load();
            })();
        } else {
            void load();
        }
    }, [act, load]);

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50 px-4 pb-16 pt-28">
                <div className={`${box} mx-auto max-w-xl text-center`}>
                    <h1 className="text-xl font-bold text-gray-900">We couldn&apos;t open this page</h1>
                    <p className="mt-2 text-sm text-gray-600">{error}</p>
                </div>
            </main>
        );
    }
    if (!state) {
        return <main className="flex min-h-screen items-center justify-center bg-gray-50 pt-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" aria-label="Loading" /></main>;
    }

    const { founder, offer, scholarship, welcome } = state;
    const confirmed = offer?.status === 'confirmed';
    const showScholarship = !confirmed && (scholarship.invited || !!offer) && !(offer && ['declined', 'expired', 'withdrawn'].includes(offer.status));

    return (
        <main className="min-h-screen bg-gray-50 px-4 pb-16 pt-28">
            <div className="mx-auto max-w-2xl space-y-5">
                <header className="rounded-2xl bg-[#0B2C24] p-6 text-white">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-[#F4C430]">AgriPro Catalyst W · Cohort 2026</p>
                    <h1 className="mt-2 text-2xl font-bold">Hi {founder.first_name}</h1>
                    <p className="mt-1 text-sm text-white/70">{confirmed ? 'You are in. Here is everything you need for launch.' : 'This is your private Catalyst W page. Keep the link to yourself.'}</p>
                    {founder.business_name && <p className="mt-3 text-sm text-white/90">{founder.business_name}{founder.country ? ` · ${founder.country}` : ''}</p>}
                </header>

                {notice && (
                    <div role={notice.kind === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm ${notice.kind === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>{notice.text}</div>
                )}

                {offer && <OfferCard offer={offer} paymentsEnabled={state.payments_enabled} busy={busy} act={act} reload={load} />}

                {showScholarship && <ScholarshipCard scholarship={scholarship} busy={busy} act={act} reload={load} setNotice={setNotice} />}

                {confirmed && welcome && <WelcomeCard welcome={welcome} launchDate={state.launch_date} />}

                {!offer && !scholarship.invited && (
                    <div className={box}>
                        <h2 className="font-semibold text-gray-900">Your application is with our team</h2>
                        <p className="mt-1 text-sm text-gray-600">We&apos;ll email you as soon as there&apos;s news. Anything you need to do will show up on this page.</p>
                    </div>
                )}

                <p className="text-center text-xs text-gray-400">Questions? Reply to any Catalyst W email and our team will help.</p>
            </div>
        </main>
    );
}

function OfferCard({ offer, paymentsEnabled, busy, act, reload }: {
    offer: NonNullable<PortalState['offer']>;
    paymentsEnabled: boolean;
    busy: string | null;
    act: (a: string, p?: Record<string, unknown>) => Promise<any>;
    reload: () => Promise<void>;
}) {
    const [declining, setDeclining] = useState(false);
    const [reason, setReason] = useState('');
    const free = offer.fee_usd === 0;

    const pay = async () => {
        const res = await act('start_payment');
        if (res?.url) window.location.href = res.url;
    };

    if (offer.status === 'confirmed') {
        return (
            <div className={`${box} ring-green-200`}>
                <p className="flex items-center gap-2 font-semibold text-green-800"><CheckCircle2 className="h-5 w-5" /> Your place is confirmed</p>
                <p className="mt-1 text-sm text-gray-600">{offer.plan_label}{offer.amount_paid_usd ? ` · ${formatUsd(offer.amount_paid_usd)} received` : offer.fee_usd === 0 ? ' · fully funded' : ''}</p>
            </div>
        );
    }
    if (['declined', 'expired', 'withdrawn'].includes(offer.status) || offer.overdue) {
        return (
            <div className={box}>
                <h2 className="font-semibold text-gray-900">{offer.status === 'declined' ? 'You declined your offer' : 'This offer has closed'}</h2>
                <p className="mt-1 text-sm text-gray-600">{offer.status === 'declined' ? 'Thank you for letting us know. We hope to work with you in a future cohort.' : 'The deadline has passed. If you still want to join, reply to your offer email and we will see what we can do.'}</p>
            </div>
        );
    }

    return (
        <div className={box}>
            <p className="text-xs font-bold uppercase tracking-wider text-green-700">{offer.status === 'accepted' ? 'Offer accepted — one step left' : 'Your offer'}</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">{offer.status === 'accepted' ? 'Pay to confirm your place' : 'We’d love you to join Catalyst W'}</h2>
            <dl className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-3">
                <div><dt className="text-xs text-gray-500">Programme</dt><dd className="font-semibold text-gray-900">{offer.plan_label}</dd></div>
                <div><dt className="text-xs text-gray-500">Your fee</dt><dd className="font-semibold text-gray-900">{free ? 'Fully funded' : formatUsd(offer.fee_usd)}</dd></div>
                <div><dt className="text-xs text-gray-500">{free ? 'Accept by' : 'Accept and pay by'}</dt><dd className="font-semibold text-gray-900">{formatDate(offer.payment_deadline)}</dd></div>
            </dl>
            {offer.subsidy_note && <p className="mt-3 text-sm text-gray-600">{offer.subsidy_note}</p>}

            {!declining ? (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    {free ? (
                        <button disabled={!!busy} onClick={async () => { if (await act('accept_offer')) await reload(); }} className={primary}>
                            {busy === 'accept_offer' && <Loader2 className="h-4 w-4 animate-spin" />} Accept my place
                        </button>
                    ) : paymentsEnabled ? (
                        <button disabled={!!busy} onClick={pay} className={primary}>
                            {busy === 'start_payment' && <Loader2 className="h-4 w-4 animate-spin" />} {offer.status === 'accepted' ? 'Pay' : 'Accept and pay'} {formatUsd(offer.fee_usd)} <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : offer.status === 'sent' ? (
                        <button disabled={!!busy} onClick={async () => { if (await act('accept_offer')) await reload(); }} className={primary}>Accept my offer</button>
                    ) : null}
                    {offer.status === 'sent' && <button onClick={() => setDeclining(true)} className="rounded-xl px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100">I can&apos;t take up my place</button>}
                </div>
            ) : (
                <div className="mt-5 space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Would you tell us why? (optional)
                        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} maxLength={1000} className={field} />
                    </label>
                    <div className="flex gap-3">
                        <button disabled={!!busy} onClick={async () => { if (await act('decline_offer', { reason })) await reload(); }} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Decline my offer</button>
                        <button onClick={() => setDeclining(false)} className="rounded-xl px-5 py-3 text-sm text-gray-600">Go back</button>
                    </div>
                </div>
            )}
            {!free && (
                <p className="mt-4 text-xs text-gray-500">
                    {paymentsEnabled ? 'Secure card payment through Paystack, in US dollars. ' : 'Online payment is not open yet. '}
                    Need to pay by bank transfer or mobile money? Reply to your offer email and we&apos;ll send the details.
                </p>
            )}
        </div>
    );
}

function ScholarshipCard({ scholarship, busy, act, reload, setNotice }: {
    scholarship: PortalState['scholarship'];
    busy: string | null;
    act: (a: string, p?: Record<string, unknown>) => Promise<any>;
    reload: () => Promise<void>;
    setNotice: (n: { kind: 'ok' | 'error'; text: string }) => void;
}) {
    const req = scholarship.request;
    const [editing, setEditing] = useState(!req);
    const [form, setForm] = useState({ requested: req?.requested || 'scholarship_199', can_contribute_usd: req ? String(req.can_contribute_usd) : '', monthly_revenue_band: req?.monthly_revenue_band || '', dependants: req?.dependants != null ? String(req.dependants) : '', circumstances: req?.circumstances || '' });

    if (req && !editing) {
        const decided = req.decision !== 'pending';
        return (
            <div className={box}>
                <h2 className="font-semibold text-gray-900">Scholarship request</h2>
                <p className="mt-1 text-sm text-gray-600">
                    {decided
                        ? req.decision === 'declined'
                            ? 'We weren’t able to offer you a scholarship this time. This doesn’t affect your application.'
                            : `Good news: you’ve been awarded ${req.decision === 'fully_funded' ? 'a fully funded place' : 'a $199 scholarship place'}. Your offer will show the reduced fee.`
                        : `Thanks. We received your request on ${formatDate(req.submitted_at)}. We’ll let you know our decision, and it won’t affect whether you’re selected.`}
                </p>
                {!decided && <button onClick={() => setEditing(true)} className="mt-3 text-sm font-medium text-green-700 underline">Update my request</button>}
            </div>
        );
    }

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await act('submit_scholarship', form);
        if (res) { setNotice({ kind: 'ok', text: 'Thank you. Your scholarship request has been sent to our team.' }); setEditing(false); await reload(); }
    };

    return (
        <form onSubmit={submit} className={box}>
            <h2 className="text-lg font-bold text-gray-900">Request scholarship support</h2>
            <p className="mt-1 text-sm text-gray-600">We have a limited number of $199 places and a few fully funded places, where funding allows. Your answers are private and are looked at separately from your application. Asking won&apos;t affect whether you&apos;re selected.</p>
            <fieldset className="mt-4">
                <legend className="text-sm font-medium text-gray-700">What would make it possible for you to join?</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {[{ v: 'scholarship_199', t: 'A $199 place', d: 'I can pay $199 but not the full fee' }, { v: 'fully_funded', t: 'A fully funded place', d: 'I can’t pay any fee right now' }].map(o => (
                        <label key={o.v} className={`cursor-pointer rounded-xl border p-3 text-sm ${form.requested === o.v ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                            <input type="radio" name="requested" value={o.v} checked={form.requested === o.v} onChange={() => setForm({ ...form, requested: o.v })} className="sr-only" />
                            <span className="font-semibold text-gray-900">{o.t}</span><span className="mt-0.5 block text-xs text-gray-600">{o.d}</span>
                        </label>
                    ))}
                </div>
            </fieldset>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="text-sm font-medium text-gray-700">How much could you pay? (USD)
                    <input type="number" min={0} inputMode="decimal" value={form.can_contribute_usd} onChange={e => setForm({ ...form, can_contribute_usd: e.target.value })} className={field} placeholder="0" />
                </label>
                <label className="text-sm font-medium text-gray-700">Business revenue per month
                    <select value={form.monthly_revenue_band} onChange={e => setForm({ ...form, monthly_revenue_band: e.target.value })} className={field}>
                        <option value="">Prefer not to say</option>
                        {REVENUE_BANDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                </label>
                <label className="text-sm font-medium text-gray-700">People who depend on you
                    <input type="number" min={0} max={30} value={form.dependants} onChange={e => setForm({ ...form, dependants: e.target.value })} className={field} placeholder="Optional" />
                </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-gray-700">Tell us about your situation
                <textarea required minLength={20} maxLength={3000} rows={5} value={form.circumstances} onChange={e => setForm({ ...form, circumstances: e.target.value })} className={field} placeholder="For example: what the fee would mean for your business or family right now, and anything else we should know." />
            </label>
            <button type="submit" disabled={!!busy} className={`${primary} mt-4 w-full sm:w-auto`}>
                {busy === 'submit_scholarship' && <Loader2 className="h-4 w-4 animate-spin" />} Send my request
            </button>
        </form>
    );
}

function WelcomeCard({ welcome, launchDate }: { welcome: NonNullable<PortalState['welcome']>; launchDate: string }) {
    const days = daysUntil(launchDate);
    const { group, gathering, sessions } = welcome;
    const weeks = [1, 2, 3].map(w => ({ week: w, items: sessions.filter(s => s.week_number === w) }));
    const phone = group?.contact_phone ? whatsappLink(group.contact_phone) : null;

    return (
        <div className="space-y-5">
            <div className={`${box} bg-gradient-to-br from-white to-green-50`}>
                <p className="text-xs font-bold uppercase tracking-wider text-green-700">Welcome pack</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">We launch on {formatDate(launchDate)}</h2>
                <p className="mt-1 text-sm text-gray-600">{days > 1 ? `${days} days to go.` : days === 1 ? 'That’s tomorrow!' : days === 0 ? 'That’s today!' : 'The programme is under way.'} Here’s everything you need for the first few weeks.</p>
            </div>

            <div className={box}>
                <h3 className="flex items-center gap-2 font-semibold text-gray-900"><ArrowRight className="h-4 w-4 text-green-700" /> Your next step</h3>
                {welcome.next_action ? (
                    <p className="mt-2 text-sm text-gray-800">{welcome.next_action}{welcome.next_action_due && <span className="text-gray-500"> · by {formatDate(welcome.next_action_due)}</span>}</p>
                ) : <p className="mt-2 text-sm text-gray-500">Your next step will appear here before launch.</p>}
            </div>

            <div className={box}>
                <h3 className="flex items-center gap-2 font-semibold text-gray-900"><Users className="h-4 w-4 text-green-700" /> Your group</h3>
                {group ? (
                    <div className="mt-2 space-y-3 text-sm">
                        <p className="text-base font-semibold text-gray-900">{group.name}</p>
                        {group.meeting_rhythm && <p className="text-gray-600">{group.meeting_rhythm}</p>}
                        <div className="grid gap-3 sm:grid-cols-2">
                            {group.venture_lead_name && (
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Venture lead</p>
                                    <p className="font-semibold">{group.venture_lead_name}</p>
                                    {group.venture_lead_email && <a href={`mailto:${group.venture_lead_email}`} className="mt-1 inline-flex items-center gap-1 text-xs text-green-700"><Mail className="h-3 w-3" /> {group.venture_lead_email}</a>}
                                </div>
                            )}
                            {group.contact_name && (
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Your contact person</p>
                                    <p className="font-semibold">{group.contact_name}</p>
                                    <div className="mt-1 flex flex-wrap gap-3 text-xs">
                                        {group.contact_email && <a href={`mailto:${group.contact_email}`} className="inline-flex items-center gap-1 text-green-700"><Mail className="h-3 w-3" /> Email</a>}
                                        {group.contact_phone && <a href={`tel:${group.contact_phone}`} className="inline-flex items-center gap-1 text-green-700"><Phone className="h-3 w-3" /> {group.contact_phone}</a>}
                                        {phone && <a href={phone} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-700"><MessageCircle className="h-3 w-3" /> WhatsApp</a>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : <p className="mt-2 text-sm text-gray-500">We’re putting groups together now. Your group and contact person will appear here before launch.</p>}
            </div>

            <div className={box}>
                <h3 className="flex items-center gap-2 font-semibold text-gray-900"><CalendarDays className="h-4 w-4 text-green-700" /> First three weeks</h3>
                {sessions.length === 0 ? <p className="mt-2 text-sm text-gray-500">The timetable will appear here soon.</p> : (
                    <div className="mt-3 space-y-4">
                        {weeks.filter(w => w.items.length).map(w => (
                            <div key={w.week}>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Week {w.week}</p>
                                <ul className="mt-1.5 divide-y divide-gray-100 rounded-xl border border-gray-100">
                                    {w.items.map((s, i) => (
                                        <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5 text-sm">
                                            <span className="font-medium text-gray-900">{s.title}</span>
                                            <span className="text-xs text-gray-500">
                                                {s.scheduled_date ? formatDate(s.scheduled_date) : 'Date to be confirmed'}
                                                {s.scheduled_time ? ` · ${s.scheduled_time.slice(0, 5)}${s.timezone ? ` (${s.timezone.replace('Africa/', '')} time)` : ''}` : ''}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {gathering && (
                <div className={box}>
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900"><MapPin className="h-4 w-4 text-green-700" /> {gathering.country} gathering</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-700">
                        {gathering.first_activity && <p><strong>First activity:</strong> {gathering.first_activity}{gathering.first_activity_date ? ` · ${formatDate(gathering.first_activity_date)}` : ''}</p>}
                        {gathering.venue && <p><strong>Where:</strong> {gathering.venue}</p>}
                        {gathering.host_org && <p><strong>Hosted by:</strong> {gathering.host_org}</p>}
                        {gathering.coordinator_name && <p><strong>Local coordinator:</strong> {gathering.coordinator_name}{gathering.coordinator_contact ? ` · ${gathering.coordinator_contact}` : ''}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
