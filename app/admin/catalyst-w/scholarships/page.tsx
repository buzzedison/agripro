'use client';

import { useMemo, useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import LaunchShell, { btnPrimary, btnSecondary, card, input, label } from '../components/LaunchShell';
import { launchAction, upsertById, useLaunch } from '../components/useLaunch';
import { SCHOLARSHIP_LABELS, ScholarshipDecision, ScholarshipRequest, formatDate, formatUsd } from '@/lib/catalyst-launch';

const INVITABLE = ['reviewed', 'shortlisted', 'interviewed', 'accepted', 'waitlisted'];
const DECISIONS: { value: ScholarshipDecision; label: string; color: string }[] = [
    { value: 'fully_funded', label: 'Fully funded', color: 'bg-emerald-600 text-white' },
    { value: 'scholarship_199', label: '$199 place', color: 'bg-green-600 text-white' },
    { value: 'declined', label: 'No scholarship', color: 'bg-gray-700 text-white' },
    { value: 'pending', label: 'Undecided', color: 'bg-gray-200 text-gray-700' },
];

export default function ScholarshipsPage() {
    const { data, setData, loading, error, load } = useLaunch();
    const [places, setPlaces] = useState<{ s199: string; full: string } | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [busy, setBusy] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [expanded, setExpanded] = useState<string | null>(null);

    const founderById = useMemo(() => new Map((data?.founders || []).map(f => [f.id, f])), [data]);
    const requestBySubmission = useMemo(() => new Map((data?.scholarships || []).map(s => [s.submission_id, s])), [data]);
    const used = useMemo(() => ({
        s199: (data?.scholarships || []).filter(s => s.decision === 'scholarship_199').length,
        full: (data?.scholarships || []).filter(s => s.decision === 'fully_funded').length,
        pending: (data?.scholarships || []).filter(s => s.decision === 'pending').length,
    }), [data]);

    if (!data) return <LaunchShell title="Scholarships" subtitle="Financial need, assessed separately from admission" onRefresh={load} loading={loading} error={error}>{null}</LaunchShell>;

    const s199Places = data.settings.scholarship_199_places;
    const fullPlaces = data.settings.fully_funded_places;
    const invitable = data.founders.filter(f => INVITABLE.includes(f.status) && !requestBySubmission.has(f.id));
    const requests = [...data.scholarships].sort((a, b) => Number(a.decision !== 'pending') - Number(b.decision !== 'pending') || a.submitted_at.localeCompare(b.submitted_at));

    const savePlaces = async () => {
        if (!places) return;
        const res = await launchAction('save_settings', { settings: { ...data.settings, scholarship_199_places: places.s199, fully_funded_places: places.full } }, 'Scholarship places saved');
        if (res) { setData({ ...data, settings: { ...res.settings, standard_fee_usd: Number(res.settings.standard_fee_usd) } }); setPlaces(null); }
    };

    const invite = async (ids: string[]) => {
        if (!ids.length || !confirm(`Email ${ids.length} founder${ids.length === 1 ? '' : 's'} an invitation to request scholarship support?`)) return;
        setBusy('invite');
        const res = await launchAction('invite_scholarship', { ids });
        setBusy(null);
        if (!res) return;
        (res.failed.length ? toast.error : toast.success)(`${res.sent.length} invited${res.failed.length ? ` · ${res.failed.length} failed` : ''}`);
        const now = new Date().toISOString();
        setData({ ...data, founders: data.founders.map(f => (res.sent.includes(f.id) ? { ...f, scholarship_invited_at: now, has_portal: true } : f)) });
        setSelected(new Set());
    };

    const decide = async (req: ScholarshipRequest, decision: ScholarshipDecision) => {
        if (decision === 'scholarship_199' && req.decision !== 'scholarship_199' && used.s199 >= s199Places && !confirm(`All ${s199Places} $199 places are already awarded. Award another anyway?`)) return;
        if (decision === 'fully_funded' && req.decision !== 'fully_funded' && used.full >= fullPlaces && !confirm(fullPlaces === 0 ? 'No fully funded places are set — only award one where funding is available. Continue?' : `All ${fullPlaces} fully funded places are already awarded. Award another anyway?`)) return;
        setBusy(req.id);
        const res = await launchAction('decide_scholarship', { id: req.id, decision, notes: notes[req.id] ?? req.decision_notes ?? '' }, 'Decision saved');
        setBusy(null);
        if (res) setData({ ...data, scholarships: upsertById(data.scholarships, { ...res.scholarship, can_contribute_usd: Number(res.scholarship.can_contribute_usd) }) });
    };

    const placeTile = (n: number, of: number) => <span className={n > of ? 'text-red-300' : ''}>{n}/{of}</span>;

    return (
        <LaunchShell
            title="Scholarships"
            subtitle="Financial need, assessed separately from admission"
            onRefresh={load}
            loading={loading}
            error={error}
            tiles={[
                { label: '$199 places awarded', value: placeTile(used.s199, s199Places) },
                { label: 'Fully funded awarded', value: placeTile(used.full, fullPlaces) },
                { label: 'Requests awaiting decision', value: used.pending },
                { label: 'Requests received', value: data.scholarships.length },
                { label: 'Invited, not yet replied', value: data.founders.filter(f => f.scholarship_invited_at && !requestBySubmission.has(f.id)).length },
            ]}
        >
            <div className="space-y-6">
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    Decide scholarships on need alone. Selection scores are deliberately not shown here, and asking for support never affects admission. Offer fully funded places only where funding is confirmed.
                </div>

                <section className={card}>
                    <h2 className="font-bold text-gray-900">Places available</h2>
                    <p className="mb-3 text-sm text-gray-500">Set how many places of each kind the budget supports. Offers use these decisions to set each founder&apos;s fee.</p>
                    <div className="flex flex-wrap items-end gap-3">
                        <label className={label}>$199 scholarship places
                            <input type="number" min={0} className={`${input} mt-1 w-40`} value={places?.s199 ?? s199Places} onChange={e => setPlaces({ s199: e.target.value, full: places?.full ?? String(fullPlaces) })} />
                        </label>
                        <label className={label}>Fully funded places
                            <input type="number" min={0} className={`${input} mt-1 w-40`} value={places?.full ?? fullPlaces} onChange={e => setPlaces({ s199: places?.s199 ?? String(s199Places), full: e.target.value })} />
                        </label>
                        <button onClick={savePlaces} disabled={!places} className={btnPrimary}>Save places</button>
                    </div>
                </section>

                <section className={card}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-gray-900">Requests</h2>
                            <p className="text-sm text-gray-500">Undecided requests first.</p>
                        </div>
                    </div>
                    {requests.length === 0 ? <p className="text-sm text-gray-500">No requests yet. Invite founders below; their answers appear here.</p> : (
                        <ul className="divide-y divide-gray-100">
                            {requests.map(r => {
                                const f = founderById.get(r.submission_id);
                                return (
                                    <li key={r.id} className="py-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900">{f?.full_name || 'Founder'} <span className="font-normal text-gray-500">· {[f?.business_name, f?.country].filter(Boolean).join(' · ')}</span></p>
                                                <p className="text-xs text-gray-500">
                                                    Asks for <strong>{r.requested === 'fully_funded' ? 'a fully funded place' : 'a $199 place'}</strong> · can contribute {formatUsd(r.can_contribute_usd)}
                                                    {r.monthly_revenue_band ? ` · revenue ${r.monthly_revenue_band}/month` : ''}{r.dependants != null ? ` · ${r.dependants} dependants` : ''} · sent {formatDate(r.submitted_at)}
                                                </p>
                                                <p className={`mt-1.5 whitespace-pre-wrap text-sm text-gray-700 ${expanded === r.id ? '' : 'line-clamp-2'}`}>{r.circumstances}</p>
                                                {r.circumstances.length > 160 && <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="text-xs font-medium text-green-700">{expanded === r.id ? 'Show less' : 'Read all'}</button>}
                                            </div>
                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{SCHOLARSHIP_LABELS[r.decision]}</span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <input value={notes[r.id] ?? r.decision_notes ?? ''} onChange={e => setNotes({ ...notes, [r.id]: e.target.value })} placeholder="Reason for the decision (internal)" aria-label="Decision notes" className={`${input} max-w-sm py-1.5 text-xs`} />
                                            {DECISIONS.map(d => (
                                                <button key={d.value} disabled={busy === r.id} onClick={() => decide(r, d.value)}
                                                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50 ${r.decision === d.value ? `${d.color} ring-2 ring-offset-1 ring-gray-400` : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                                                    {d.label}
                                                </button>
                                            ))}
                                            {busy === r.id && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                                        </div>
                                        {r.decided_by && <p className="mt-1 text-[11px] text-gray-400">Decided by {r.decided_by} on {formatDate(r.decided_at)}</p>}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <section className={card}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-gray-900">Invite founders to request support</h2>
                            <p className="text-sm text-gray-500">Founders in selection who have not sent a request. The email links to their private founder page.</p>
                        </div>
                        <button onClick={() => invite([...selected])} disabled={!selected.size || busy === 'invite'} className={btnPrimary}>
                            {busy === 'invite' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Invite {selected.size || ''}
                        </button>
                    </div>
                    {invitable.length === 0 ? <p className="text-sm text-gray-500">Everyone in selection has either been invited and replied, or there is no one at these stages yet.</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="py-2 pr-3"><input type="checkbox" aria-label="Select all" checked={invitable.length > 0 && invitable.every(f => selected.has(f.id))} onChange={e => setSelected(e.target.checked ? new Set(invitable.map(f => f.id)) : new Set())} /></th>
                                        <th className="py-2 pr-3">Founder</th><th className="py-2 pr-3">Stage</th><th className="py-2 pr-3">Plan chosen</th><th className="py-2">Invited</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invitable.map(f => (
                                        <tr key={f.id}>
                                            <td className="py-2 pr-3"><input type="checkbox" aria-label={`Select ${f.full_name}`} checked={selected.has(f.id)} onChange={() => setSelected(prev => { const n = new Set(prev); n.has(f.id) ? n.delete(f.id) : n.add(f.id); return n; })} /></td>
                                            <td className="py-2 pr-3"><p className="font-medium">{f.full_name}</p><p className="text-xs text-gray-500">{[f.business_name, f.country].filter(Boolean).join(' · ')}</p></td>
                                            <td className="py-2 pr-3 capitalize text-gray-600">{f.status}</td>
                                            <td className="py-2 pr-3 text-gray-600">{f.plan_tier || '—'}</td>
                                            <td className="py-2 text-gray-600">{f.scholarship_invited_at ? <span>{formatDate(f.scholarship_invited_at)} <button onClick={() => invite([f.id])} className={`${btnSecondary} ml-2 px-2 py-1 text-xs`}>Resend</button></span> : 'Not yet'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </LaunchShell>
    );
}
