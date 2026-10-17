'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Copy, Loader2, Mail, RotateCcw, Ban, Search } from 'lucide-react';
import CatalystAdminHeader from '../components/CatalystAdminHeader';
import {
    Application, CHASE_COOLDOWN_HOURS, EXCLUDED_REASONS, ExcludedReason, WORKING_CLOSE_DATE,
    completeness, duplicateGroups, looksLikeTest,
} from '@/lib/catalyst-selection';

type Filter = 'needs_attention' | 'incomplete' | 'duplicates' | 'test' | 'ready' | 'excluded' | 'all';

const FILTERS: { value: Filter; label: string }[] = [
    { value: 'needs_attention', label: 'Needs attention' },
    { value: 'incomplete', label: 'Incomplete' },
    { value: 'duplicates', label: 'Possible duplicates' },
    { value: 'test', label: 'Test-looking' },
    { value: 'ready', label: 'Complete' },
    { value: 'excluded', label: 'Excluded' },
    { value: 'all', label: 'All' },
];

function daysUntil(date: string) {
    const ms = new Date(`${date}T23:59:59Z`).getTime() - Date.now();
    return Math.ceil(ms / 86400000);
}

export default function CatalystCleanUpPage() {
    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<Filter>('needs_attention');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [busy, setBusy] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/catalyst-w', { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Could not load applications.');
            setApps((data as Application[]).filter(a => a.type === 'apply'));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { void load(); }, [load]);

    // Duplicate detection runs over applications that are not already excluded.
    const live = useMemo(() => apps.filter(a => !a.excluded_reason && !a.duplicate_of), [apps]);
    const dupGroups = useMemo(() => duplicateGroups(live), [live]);
    const dupGroupOf = useMemo(() => {
        const m = new Map<string, string[]>();
        dupGroups.forEach(ids => ids.forEach(id => m.set(id, ids)));
        return m;
    }, [dupGroups]);
    const byId = useMemo(() => new Map(apps.map(a => [a.id, a])), [apps]);

    const rows = useMemo(() => apps.map(app => {
        const c = completeness(app);
        const excluded = !!app.excluded_reason || !!app.duplicate_of;
        const group = dupGroupOf.get(app.id);
        const isTest = !excluded && looksLikeTest(app);
        return { app, c, excluded, group, isTest };
    }), [apps, dupGroupOf]);

    const counts = useMemo(() => ({
        total: rows.filter(r => !r.excluded).length,
        complete: rows.filter(r => !r.excluded && r.c.complete).length,
        incomplete: rows.filter(r => !r.excluded && !r.c.complete).length,
        duplicates: rows.filter(r => !r.excluded && r.group).length,
        test: rows.filter(r => r.isTest).length,
        excluded: rows.filter(r => r.excluded).length,
        chased: rows.filter(r => !r.excluded && (r.app.chase_count || 0) > 0).length,
    }), [rows]);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter(r => {
            if (q && !`${r.app.full_name} ${r.app.email} ${r.app.business_name || ''} ${r.app.country || ''}`.toLowerCase().includes(q)) return false;
            switch (filter) {
                case 'needs_attention': return !r.excluded && (!r.c.complete || !!r.group || r.isTest || r.c.warnings.length > 0);
                case 'incomplete': return !r.excluded && !r.c.complete;
                case 'duplicates': return !r.excluded && !!r.group;
                case 'test': return r.isTest;
                case 'ready': return !r.excluded && r.c.complete;
                case 'excluded': return r.excluded;
                default: return true;
            }
        }).sort((a, b) => {
            // Keep duplicate groups together so they can be compared side by side.
            if (filter === 'duplicates') return (a.group?.[0] || '').localeCompare(b.group?.[0] || '') || a.app.created_at.localeCompare(b.app.created_at);
            return b.app.created_at.localeCompare(a.app.created_at);
        });
    }, [rows, filter, search]);

    const patch = async (id: string, body: Record<string, unknown>, success: string) => {
        setBusy(id);
        try {
            const res = await fetch('/api/admin/catalyst-w', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...body }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Update failed');
            setApps(prev => prev.map(a => (a.id === id ? { ...a, ...data.submission } : a)));
            setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
            toast.success(success);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setBusy(null);
        }
    };

    const chase = async (ids: string[], force = false) => {
        if (ids.length === 0) return;
        if (!confirm(`Email ${ids.length} applicant${ids.length === 1 ? '' : 's'} asking for their missing details?`)) return;
        setBusy('chase');
        try {
            const res = await fetch('/api/admin/catalyst-w/chase', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, force }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Could not send reminders');
            const parts = [`${data.sent.length} sent`];
            if (data.skipped.length) parts.push(`${data.skipped.length} skipped (complete, excluded or reminded in the last ${CHASE_COOLDOWN_HOURS}h)`);
            if (data.failed.length) parts.push(`${data.failed.length} failed`);
            (data.failed.length ? toast.error : toast.success)(parts.join(' · '));
            setSelected(new Set());
            await load();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setBusy(null);
        }
    };

    const selectableIds = visible.filter(r => !r.excluded && !r.c.complete).map(r => r.app.id);
    const allSelected = selectableIds.length > 0 && selectableIds.every(id => selected.has(id));
    const closeIn = daysUntil(WORKING_CLOSE_DATE);

    return (
        <div className="min-h-screen bg-gray-50">
            <CatalystAdminHeader title="Applicant clean-up" subtitle="Find incomplete, duplicate and test applications, then chase the missing details" onRefresh={load}>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {[
                        { label: 'Live applications', value: counts.total },
                        { label: 'Complete', value: counts.complete },
                        { label: 'Incomplete', value: counts.incomplete },
                        { label: 'Possible duplicates', value: counts.duplicates },
                        { label: 'Reminded', value: counts.chased },
                        { label: 'Excluded', value: counts.excluded },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl bg-white/10 p-4">
                            <p className="text-2xl font-black">{loading ? '–' : s.value}</p>
                            <p className="mt-0.5 text-xs font-semibold opacity-70">{s.label}</p>
                        </div>
                    ))}
                </div>
            </CatalystAdminHeader>

            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <strong>Working closing date: 6 November</strong> ({closeIn > 0 ? `${closeIn} day${closeIn === 1 ? '' : 's'} left` : 'passed'}) — subject to approval before it is published.
                    Reminder emails ask applicants to reply promptly and do not mention a date.
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map(f => (
                            <button
                                key={f.value}
                                onClick={() => { setFilter(f.value); setSelected(new Set()); }}
                                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${filter === f.value ? 'bg-[#0B2C24] text-white' : 'border border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <label className="relative ml-auto">
                        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search name, email, business, country"
                            aria-label="Search applications"
                            className="w-64 max-w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                        />
                    </label>
                </div>

                {selected.size > 0 && (
                    <div className="sticky top-2 z-20 mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-[#0B2C24] px-4 py-3 text-sm text-white shadow-lg">
                        <span className="font-semibold">{selected.size} selected</span>
                        <button onClick={() => chase([...selected])} disabled={busy === 'chase'} className="inline-flex items-center gap-2 rounded-lg bg-[#F4C430] px-3 py-1.5 font-bold text-[#0B2C24] disabled:opacity-50">
                            {busy === 'chase' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Send completion reminder
                        </button>
                        <button onClick={() => setSelected(new Set())} className="text-white/70 hover:text-white">Clear</button>
                    </div>
                )}

                {error ? (
                    <div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error} <button onClick={load} className="ml-2 font-semibold underline">Retry</button></div>
                ) : loading ? (
                    <div role="status" className="flex items-center justify-center gap-2 rounded-xl bg-white p-10 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading applications…</div>
                ) : visible.length === 0 ? (
                    <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-500">Nothing here — {filter === 'needs_attention' ? 'every live application is complete with no duplicates.' : 'no applications match this filter.'}</div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            aria-label="Select all incomplete applications shown"
                                            checked={allSelected}
                                            disabled={selectableIds.length === 0}
                                            onChange={() => setSelected(allSelected ? new Set() : new Set(selectableIds))}
                                        />
                                    </th>
                                    <th className="px-4 py-3">Applicant</th>
                                    <th className="px-4 py-3">Completeness</th>
                                    <th className="px-4 py-3">Flags</th>
                                    <th className="px-4 py-3">Reminders</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {visible.map(({ app, c, excluded, group, isTest }) => {
                                    const original = group && group[0] !== app.id ? byId.get(group[0]) : null;
                                    const canChase = !excluded && !c.complete;
                                    return (
                                        <tr key={app.id} className={excluded ? 'bg-gray-50/70 text-gray-500' : ''}>
                                            <td className="px-4 py-3 align-top">
                                                <input
                                                    type="checkbox"
                                                    aria-label={`Select ${app.full_name}`}
                                                    disabled={!canChase}
                                                    checked={selected.has(app.id)}
                                                    onChange={() => setSelected(prev => { const n = new Set(prev); n.has(app.id) ? n.delete(app.id) : n.add(app.id); return n; })}
                                                />
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <p className="font-semibold text-gray-900">{app.full_name}</p>
                                                <p className="text-xs text-gray-500 break-all">{app.email}{app.phone ? ` · ${app.phone}` : ''}</p>
                                                <p className="text-xs text-gray-500">{[app.business_name, app.country].filter(Boolean).join(' · ') || '—'}</p>
                                                <p className="text-[11px] text-gray-400">Applied {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {app.status}</p>
                                            </td>
                                            <td className="min-w-[220px] px-4 py-3 align-top">
                                                <div className="mb-1.5 flex items-center gap-2">
                                                    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-gray-100">
                                                        <div className={`h-full rounded-full ${c.percent === 100 ? 'bg-green-500' : c.percent >= 70 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${c.percent}%` }} />
                                                    </div>
                                                    <span className="text-xs font-semibold">{c.percent}%</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {c.missing.map(m => <span key={m} className="rounded bg-red-50 px-1.5 py-0.5 text-[11px] text-red-700">{m}</span>)}
                                                    {c.helpfulMissing.map(m => <span key={m} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600" title="Not required, but useful for interviews and verification">No {m.toLowerCase()}</span>)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <div className="flex flex-col gap-1 text-xs">
                                                    {excluded && <span className="inline-flex items-center gap-1 font-semibold text-gray-600"><Ban className="h-3.5 w-3.5" /> {app.duplicate_of ? `Duplicate of ${byId.get(app.duplicate_of)?.full_name || 'another application'}` : EXCLUDED_REASONS.find(r => r.value === app.excluded_reason)?.label}</span>}
                                                    {group && <span className="inline-flex items-center gap-1 text-purple-700"><Copy className="h-3.5 w-3.5" /> {group.length} similar applications{original ? ` (oldest: ${original.full_name})` : ' — this is the oldest'}</span>}
                                                    {isTest && <span className="inline-flex items-center gap-1 text-orange-700"><AlertTriangle className="h-3.5 w-3.5" /> Looks like a test entry</span>}
                                                    {c.warnings.map(w => <span key={w} className="inline-flex items-center gap-1 text-amber-700"><AlertTriangle className="h-3.5 w-3.5" /> {w}</span>)}
                                                    {!excluded && !group && !isTest && c.warnings.length === 0 && c.complete && <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle className="h-3.5 w-3.5" /> Ready for review</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 align-top text-xs text-gray-500">
                                                {app.chase_count ? <>{app.chase_count}× · last {new Date(app.last_chased_at!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</> : 'None'}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <div className="flex flex-wrap justify-end gap-1.5">
                                                    {excluded ? (
                                                        <button disabled={busy === app.id} onClick={() => patch(app.id, { excluded_reason: null, duplicate_of: null }, 'Application restored')} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50">
                                                            <RotateCcw className="h-3.5 w-3.5" /> Restore
                                                        </button>
                                                    ) : (
                                                        <>
                                                            {canChase && (
                                                                <button disabled={busy === 'chase'} onClick={() => chase([app.id])} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50">
                                                                    <Mail className="h-3.5 w-3.5" /> Remind
                                                                </button>
                                                            )}
                                                            {original && (
                                                                <button disabled={busy === app.id} onClick={() => patch(app.id, { duplicate_of: original.id, excluded_reason: 'duplicate' }, `Marked as duplicate of ${original.full_name}`)} className="rounded-lg border border-purple-200 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50">
                                                                    Mark duplicate
                                                                </button>
                                                            )}
                                                            <select
                                                                aria-label={`Exclude ${app.full_name}`}
                                                                value=""
                                                                disabled={busy === app.id}
                                                                onChange={e => e.target.value && patch(app.id, { excluded_reason: e.target.value as ExcludedReason }, 'Application excluded')}
                                                                className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-600"
                                                            >
                                                                <option value="">Exclude…</option>
                                                                {EXCLUDED_REASONS.filter(r => r.value !== 'duplicate').map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                            </select>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <p className="mt-3 text-xs text-gray-400">Excluding never deletes an application; restore it at any time. Duplicates are matched on email, phone or the same name and business.</p>
            </div>
        </div>
    );
}
