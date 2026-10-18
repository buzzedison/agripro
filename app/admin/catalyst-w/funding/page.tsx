'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import LaunchShell, { btnPrimary, btnSecondary, card, input, label } from '../components/LaunchShell';
import { launchAction, upsertById, useLaunch } from '../components/useLaunch';
import { BudgetLine, PARTNER_KINDS, PARTNER_STATUS, Partner, formatDate, formatUsd } from '@/lib/catalyst-launch';

type PartnerDraft = Partial<Partner>;
type LineDraft = Partial<BudgetLine>;
const today = () => new Date().toISOString().slice(0, 10);

export default function FundingPage() {
    const { data, setData, loading, error, load } = useLaunch();
    const [partner, setPartner] = useState<PartnerDraft | null>(null);
    const [line, setLine] = useState<LineDraft | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | Partner['status']>('all');

    if (!data) return <LaunchShell title="Partners & funding" subtitle="Funding requests, partner contributions and launch costs" onRefresh={load} loading={loading} error={error}>{null}</LaunchShell>;

    const budget = data.budget;
    const totalBudget = budget.reduce((s, b) => s + b.budget_usd, 0);
    const totalFunded = budget.reduce((s, b) => s + Math.min(b.funded_usd, b.budget_usd), 0);
    const essential = budget.filter(b => b.essential);
    const essentialBudget = essential.reduce((s, b) => s + b.budget_usd, 0);
    const essentialFunded = essential.reduce((s, b) => s + Math.min(b.funded_usd, b.budget_usd), 0);
    const essentialGap = essentialBudget - essentialFunded;
    const confirmedPartners = data.partners.filter(p => p.status === 'confirmed');
    const pledged = confirmedPartners.reduce((s, p) => s + (p.amount_usd || 0), 0);
    const overdueSteps = data.partners.filter(p => p.next_step_due && p.next_step_due < today() && !['confirmed', 'declined'].includes(p.status));
    const partners = data.partners.filter(p => statusFilter === 'all' || p.status === statusFilter);
    const partnerName = new Map(data.partners.map(p => [p.id, p.name]));
    const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

    const savePartner = async () => {
        if (!partner) return;
        const res = await launchAction<{ partner: Partner }>('save_partner', { partner }, 'Partner saved');
        if (res) { setData({ ...data, partners: upsertById(data.partners, { ...res.partner, amount_usd: res.partner.amount_usd == null ? null : Number(res.partner.amount_usd) }) }); setPartner(null); }
    };
    const deletePartner = async (p: Partner) => {
        if (!confirm(`Delete ${p.name}? Budget lines linked to them keep their amounts.`)) return;
        if (await launchAction('delete_partner', { id: p.id }, 'Partner deleted')) setData({ ...data, partners: data.partners.filter(x => x.id !== p.id), budget: data.budget.map(b => (b.partner_id === p.id ? { ...b, partner_id: null } : b)) });
    };
    const saveLine = async () => {
        if (!line) return;
        const res = await launchAction<{ line: BudgetLine }>('save_budget_line', { line }, 'Budget line saved');
        if (res) { setData({ ...data, budget: upsertById(data.budget, { ...res.line, budget_usd: Number(res.line.budget_usd), funded_usd: Number(res.line.funded_usd) }) }); setLine(null); }
    };
    const deleteLine = async (b: BudgetLine) => {
        if (!confirm(`Delete “${b.item}”?`)) return;
        if (await launchAction('delete_budget_line', { id: b.id }, 'Budget line deleted')) setData({ ...data, budget: data.budget.filter(x => x.id !== b.id) });
    };

    return (
        <LaunchShell
            title="Partners & funding"
            subtitle="Track funding requests against the existing budget, partner contributions and essential launch costs"
            onRefresh={load}
            loading={loading}
            error={error}
            tiles={[
                { label: 'Essential costs funded', value: <span className={essentialGap > 0 ? 'text-amber-300' : ''}>{pct(essentialFunded, essentialBudget)}%</span>, hint: `${formatUsd(essentialFunded)} of ${formatUsd(essentialBudget)}` },
                { label: 'Essential gap', value: formatUsd(essentialGap) },
                { label: 'Whole budget funded', value: `${pct(totalFunded, totalBudget)}%`, hint: `${formatUsd(totalFunded)} of ${formatUsd(totalBudget)}` },
                { label: 'Confirmed partners', value: confirmedPartners.length },
                { label: 'Pledged by partners', value: formatUsd(pledged) },
                { label: 'Overdue follow-ups', value: <span className={overdueSteps.length ? 'text-amber-300' : ''}>{overdueSteps.length}</span> },
            ]}
        >
            <div className="space-y-6">
                <section className={card}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-gray-900">Launch budget</h2>
                            <p className="text-sm text-gray-500">Enter the lines from Faith&apos;s existing budget unchanged. Mark the ones launch can&apos;t happen without as essential.</p>
                        </div>
                        <button onClick={() => setLine({ essential: false, budget_usd: 0, funded_usd: 0 })} className={btnSecondary}><Plus className="h-4 w-4" /> Add line</button>
                    </div>
                    {line && (
                        <div className="mb-4 grid gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-2 lg:grid-cols-6">
                            <label className={`${label} lg:col-span-2`}>Item<input className={`${input} mt-1`} value={line.item || ''} onChange={e => setLine({ ...line, item: e.target.value })} /></label>
                            <label className={label}>Category<input className={`${input} mt-1`} value={line.category || ''} onChange={e => setLine({ ...line, category: e.target.value })} placeholder="e.g. Venues" /></label>
                            <label className={label}>Budget (USD)<input type="number" min={0} className={`${input} mt-1`} value={line.budget_usd ?? ''} onChange={e => setLine({ ...line, budget_usd: e.target.value as unknown as number })} /></label>
                            <label className={label}>Funded so far (USD)<input type="number" min={0} className={`${input} mt-1`} value={line.funded_usd ?? ''} onChange={e => setLine({ ...line, funded_usd: e.target.value as unknown as number })} /></label>
                            <label className={label}>Funded by
                                <select className={`${input} mt-1`} value={line.partner_id || ''} onChange={e => setLine({ ...line, partner_id: e.target.value || null })}>
                                    <option value="">Existing budget / other</option>
                                    {data.partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </label>
                            <label className={`${label} lg:col-span-4`}>Notes<input className={`${input} mt-1`} value={line.notes || ''} onChange={e => setLine({ ...line, notes: e.target.value })} /></label>
                            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={!!line.essential} onChange={e => setLine({ ...line, essential: e.target.checked })} /> Essential for launch</label>
                            <div className="flex items-end gap-2"><button onClick={saveLine} className={btnPrimary}>Save</button><button onClick={() => setLine(null)} className="px-2 py-2 text-sm text-gray-500">Cancel</button></div>
                        </div>
                    )}
                    {budget.length === 0 ? <p className="text-sm text-gray-500">No budget lines yet.</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <tr><th className="py-2 pr-3">Item</th><th className="py-2 pr-3 text-right">Budget</th><th className="py-2 pr-3 text-right">Funded</th><th className="py-2 pr-3">Coverage</th><th className="py-2 pr-3">Funded by</th><th className="py-2" /></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[...budget].sort((a, b) => Number(b.essential) - Number(a.essential)).map(b => {
                                        const cover = pct(Math.min(b.funded_usd, b.budget_usd), b.budget_usd);
                                        return (
                                            <tr key={b.id}>
                                                <td className="py-2.5 pr-3">
                                                    <p className="font-medium">{b.item} {b.essential && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">Essential</span>}</p>
                                                    <p className="text-xs text-gray-500">{[b.category, b.notes].filter(Boolean).join(' · ')}</p>
                                                </td>
                                                <td className="py-2.5 pr-3 text-right">{formatUsd(b.budget_usd)}</td>
                                                <td className="py-2.5 pr-3 text-right">{formatUsd(b.funded_usd)}</td>
                                                <td className="py-2.5 pr-3">
                                                    <div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100"><div className={`h-full ${cover >= 100 ? 'bg-green-500' : b.essential ? 'bg-amber-400' : 'bg-gray-400'}`} style={{ width: `${cover}%` }} /></div><span className="text-xs">{cover}%</span></div>
                                                </td>
                                                <td className="py-2.5 pr-3 text-xs text-gray-600">{b.partner_id ? partnerName.get(b.partner_id) : b.funding_source || 'Existing budget'}</td>
                                                <td className="py-2.5 text-right">
                                                    <button onClick={() => setLine(b)} className="text-xs font-medium text-green-700">Edit</button>
                                                    <button onClick={() => deleteLine(b)} aria-label={`Delete ${b.item}`} className="ml-2 text-gray-400 hover:text-red-600"><Trash2 className="inline h-3.5 w-3.5" /></button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="border-t-2 border-gray-200 font-semibold">
                                    <tr><td className="py-2 pr-3">Total</td><td className="py-2 pr-3 text-right">{formatUsd(totalBudget)}</td><td className="py-2 pr-3 text-right">{formatUsd(totalFunded)}</td><td colSpan={3} /></tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </section>

                <section className={card}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-gray-900">Partners</h2>
                            <p className="text-sm text-gray-500">Funders, delivery partners, country hosts and recruitment partners, with who owns the follow-up.</p>
                        </div>
                        <div className="flex gap-2">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} aria-label="Filter partners" className={`${input} w-auto`}>
                                <option value="all">All statuses</option>
                                {Object.entries(PARTNER_STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                            </select>
                            <button onClick={() => setPartner({ kind: 'funder', status: 'to_contact', owner: data.me })} className={btnSecondary}><Plus className="h-4 w-4" /> Add partner</button>
                        </div>
                    </div>
                    {partner && (
                        <div className="mb-4 grid gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
                            <label className={label}>Name<input className={`${input} mt-1`} value={partner.name || ''} onChange={e => setPartner({ ...partner, name: e.target.value })} /></label>
                            <label className={label}>Type<select className={`${input} mt-1`} value={partner.kind} onChange={e => setPartner({ ...partner, kind: e.target.value as Partner['kind'] })}>{PARTNER_KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}</select></label>
                            <label className={label}>Status<select className={`${input} mt-1`} value={partner.status} onChange={e => setPartner({ ...partner, status: e.target.value as Partner['status'] })}>{Object.entries(PARTNER_STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}</select></label>
                            <label className={label}>Owner<input className={`${input} mt-1`} value={partner.owner || ''} onChange={e => setPartner({ ...partner, owner: e.target.value })} /></label>
                            <label className={label}>Contact name<input className={`${input} mt-1`} value={partner.contact_name || ''} onChange={e => setPartner({ ...partner, contact_name: e.target.value })} /></label>
                            <label className={label}>Contact email<input type="email" className={`${input} mt-1`} value={partner.contact_email || ''} onChange={e => setPartner({ ...partner, contact_email: e.target.value })} /></label>
                            <label className={label}>Amount (USD, if cash)<input type="number" min={0} className={`${input} mt-1`} value={partner.amount_usd ?? ''} onChange={e => setPartner({ ...partner, amount_usd: e.target.value as unknown as number })} /></label>
                            <label className={label}>Next step due<input type="date" className={`${input} mt-1`} value={partner.next_step_due || ''} onChange={e => setPartner({ ...partner, next_step_due: e.target.value })} /></label>
                            <label className={`${label} sm:col-span-2`}>What they contribute<input className={`${input} mt-1`} value={partner.contribution || ''} onChange={e => setPartner({ ...partner, contribution: e.target.value })} placeholder="e.g. Venue in Accra and 2 mentors" /></label>
                            <label className={`${label} sm:col-span-2`}>Next step<input className={`${input} mt-1`} value={partner.next_step || ''} onChange={e => setPartner({ ...partner, next_step: e.target.value })} placeholder="e.g. Send funding request using Faith's budget" /></label>
                            <div className="flex items-end gap-2"><button onClick={savePartner} className={btnPrimary}>Save</button><button onClick={() => setPartner(null)} className="px-2 py-2 text-sm text-gray-500">Cancel</button></div>
                        </div>
                    )}
                    {partners.length === 0 ? <p className="text-sm text-gray-500">No partners yet.</p> : (
                        <ul className="divide-y divide-gray-100">
                            {partners.map(p => {
                                const late = p.next_step_due && p.next_step_due < today() && !['confirmed', 'declined'].includes(p.status);
                                return (
                                    <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                                        <div className="min-w-0">
                                            <p className="font-medium">{p.name} <span className="text-xs font-normal text-gray-500">· {PARTNER_KINDS.find(k => k.value === p.kind)?.label}{p.owner ? ` · owner ${p.owner}` : ''}</span></p>
                                            {p.contribution && <p className="text-sm text-gray-700">{p.contribution}{p.amount_usd ? ` · ${formatUsd(p.amount_usd)}` : ''}</p>}
                                            {p.next_step && <p className={`text-xs ${late ? 'font-semibold text-amber-700' : 'text-gray-500'}`}>Next: {p.next_step}{p.next_step_due ? ` · ${formatDate(p.next_step_due)}` : ''}{late ? ' (overdue)' : ''}</p>}
                                            {(p.contact_name || p.contact_email) && <p className="text-xs text-gray-400">{[p.contact_name, p.contact_email].filter(Boolean).join(' · ')}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PARTNER_STATUS[p.status].color}`}>{PARTNER_STATUS[p.status].label}</span>
                                            <button onClick={() => setPartner(p)} className="text-xs font-medium text-green-700">Edit</button>
                                            <button onClick={() => deletePartner(p)} aria-label={`Delete ${p.name}`} className="text-gray-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>
        </LaunchShell>
    );
}
