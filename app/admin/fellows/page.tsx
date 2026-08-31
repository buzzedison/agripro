'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
    Plus, X, RefreshCw, CheckCircle2, Circle, Eye, EyeOff,
    Trash2, ExternalLink, BookOpen, Sparkles, Clock, ShieldAlert, Trophy, Download,
} from 'lucide-react';
import {
    type PerformanceRating, type WeeklyScore, RATING_LABEL, RATING_BADGE,
    graceInfo, GRACE_PERIOD_DAYS, weekStartISO,
} from '@/lib/fellows/accountability';
import { type FellowDesignation, designationLabel, isAmbassador } from '@/lib/fellows/designation';

type Fellow = {
    id: string;
    user_id: string | null;
    slug: string;
    email: string;
    full_name: string;
    designation: FellowDesignation;
    role_in_agripro: string | null;
    bio: string | null;
    expertise: string[];
    photo_url: string | null;
    linkedin_url: string | null;
    twitter_url: string | null;
    website_url: string | null;
    instagram_url: string | null;
    facebook_url: string | null;
    youtube_url: string | null;
    tiktok_url: string | null;
    country: string | null;
    city: string | null;
    has_business: boolean;
    business_name: string | null;
    business_description: string | null;
    status: 'active' | 'alumni' | 'inactive';
    weekly_hours_committed: number | null;
    commitment_started_at: string | null;
    performance_rating: PerformanceRating;
    rating_updated_at: string | null;
    total_points: number;
    is_public: boolean;
    admin_notes: string | null;
    claimed_at: string | null;
    created_at: string;
};

// What a "complete" profile means — each item is one chunk of the percentage.
// Business details only count when the fellow says they run a business.
function completenessChecks(fellow: Fellow): { label: string; done: boolean }[] {
    const checks = [
        { label: 'Photo', done: !!fellow.photo_url },
        { label: 'Bio', done: !!fellow.bio },
        { label: 'Expertise', done: (fellow.expertise || []).length > 0 },
        { label: 'AgriPro role', done: !!fellow.role_in_agripro },
        { label: 'Location', done: !!(fellow.country || fellow.city) },
        {
            label: 'A link (socials/website)',
            done: !!(
                fellow.linkedin_url || fellow.twitter_url || fellow.website_url ||
                fellow.instagram_url || fellow.facebook_url || fellow.youtube_url || fellow.tiktok_url
            ),
        },
    ];
    if (fellow.has_business) {
        checks.push({ label: 'Business details', done: !!(fellow.business_name && fellow.business_description) });
    }
    return checks;
}

function completenessPercent(fellow: Fellow): number {
    const checks = completenessChecks(fellow);
    return Math.round((checks.filter((c) => c.done).length / checks.length) * 100);
}

function completenessColor(percent: number): string {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 40) return 'bg-amber-400';
    return 'bg-red-400';
}

type ContributionCounts = Record<string, { total: number; published: number }>;

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    alumni: 'bg-blue-100 text-blue-700',
    inactive: 'bg-gray-200 text-gray-600',
};

function slugify(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export default function AdminFellowsPage() {
    const [fellows, setFellows] = useState<Fellow[]>([]);
    const [counts, setCounts] = useState<ContributionCounts>({});
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [selected, setSelected] = useState<Fellow | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scores, setScores] = useState<WeeklyScore[]>([]);
    const [view, setView] = useState<'roster' | 'leaderboard'>('roster');

    const supabase = createClient();

    const fetchFellows = useCallback(async () => {
        setLoading(true);
        const { data, error: fetchError } = await supabase
            .from('catalyst_fellows')
            .select('*')
            .order('designation', { ascending: false })
            .order('full_name');
        if (fetchError) {
            setError(fetchError.message);
        } else {
            setFellows((data || []) as Fellow[]);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchFellows();
        fetch('/api/admin/fellows/contributions')
            .then((r) => (r.ok ? r.json() : { counts: {} }))
            .then((d) => setCounts(d.counts || {}))
            .catch(() => {});
    }, [fetchFellows]);

    const addFellow = async (form: { full_name: string; email: string; designation: string; role_in_agripro: string; country: string }) => {
        setSaving(true);
        setError(null);
        const base = slugify(form.full_name);
        const taken = new Set(fellows.map((f) => f.slug));
        let slug = base;
        let suffix = 2;
        while (taken.has(slug)) slug = `${base}-${suffix++}`;

        const { error: insertError } = await supabase.from('catalyst_fellows').insert({
            full_name: form.full_name.trim(),
            email: form.email.trim().toLowerCase(),
            designation: form.designation,
            role_in_agripro: form.role_in_agripro.trim() || null,
            country: form.country.trim() || null,
            slug,
        });
        if (insertError) {
            setError(insertError.message);
        } else {
            setShowAdd(false);
            await fetchFellows();
        }
        setSaving(false);
    };

    const updateFellow = async (id: string, patch: Partial<Fellow>) => {
        setSaving(true);
        const { error: updateError } = await supabase.from('catalyst_fellows').update(patch).eq('id', id);
        if (updateError) setError(updateError.message);
        await fetchFellows();
        setSelected((prev) => (prev && prev.id === id ? { ...prev, ...patch } as Fellow : prev));
        setSaving(false);
    };

    // Load a fellow's weekly scores whenever the drawer opens on them.
    const fetchScores = useCallback(async (fellowId: string) => {
        const { data } = await supabase
            .from('catalyst_fellow_weekly_scores')
            .select('id, fellow_id, week_start, tasks_done, tasks_assigned, points, rating, note, created_at')
            .eq('fellow_id', fellowId)
            .order('week_start', { ascending: false });
        setScores((data || []) as WeeklyScore[]);
    }, [supabase]);

    useEffect(() => {
        if (selected) fetchScores(selected.id);
        else setScores([]);
    }, [selected, fetchScores]);

    // Record (or overwrite) one week's task result. Points + rating + the fellow's
    // total are derived by the DB trigger, so we just refetch afterwards.
    const recordWeek = async (
        fellowId: string,
        entry: { week_start: string; tasks_done: number; tasks_assigned: number | null; note: string | null },
    ) => {
        setSaving(true);
        const { error: upsertError } = await supabase
            .from('catalyst_fellow_weekly_scores')
            .upsert(
                {
                    fellow_id: fellowId,
                    week_start: entry.week_start,
                    tasks_done: entry.tasks_done,
                    tasks_assigned: entry.tasks_assigned,
                    points: entry.tasks_done, // trigger keeps this in sync; explicit avoids null
                    note: entry.note,
                },
                { onConflict: 'fellow_id,week_start' },
            );
        if (upsertError) setError(upsertError.message);
        await Promise.all([fetchScores(fellowId), fetchFellows()]);
        // Trigger-derived totals/rating changed — pull the fresh row into the drawer.
        const { data: fresh } = await supabase.from('catalyst_fellows').select('*').eq('id', fellowId).single();
        if (fresh) setSelected((prev) => (prev && prev.id === fellowId ? (fresh as Fellow) : prev));
        setSaving(false);
    };

    const deleteFellow = async (id: string) => {
        if (!confirm('Remove this fellow from the roster? Their profile page will disappear. This cannot be undone.')) return;
        setSaving(true);
        const { error: deleteError } = await supabase.from('catalyst_fellows').delete().eq('id', id);
        if (deleteError) setError(deleteError.message);
        setSelected(null);
        await fetchFellows();
        setSaving(false);
    };

    const claimedCount = fellows.filter((f) => f.user_id).length;
    const publishedTotal = Object.values(counts).reduce((sum, c) => sum + c.published, 0);
    const avgCompleteness = fellows.length
        ? Math.round(fellows.reduce((sum, f) => sum + completenessPercent(f), 0) / fellows.length)
        : 0;

    const exportFellowsCsv = () => {
        const headers = [
            'Full Name', 'Email', 'Designation', 'Role in AgriPro', 'Country', 'City',
            'Status', 'Public', 'Profile Claimed', 'Weekly Hours Committed',
            'Performance Rating', 'Total Points', 'LinkedIn', 'Knowledge Hub Published',
            'Admin Notes', 'Joined',
        ];
        const rows = fellows.map((f) => {
            const kh = counts[f.email.toLowerCase()];
            return [
                f.full_name,
                f.email,
                designationLabel(f.designation, f.role_in_agripro),
                f.role_in_agripro || '',
                f.country || '',
                f.city || '',
                f.status,
                f.is_public ? 'Yes' : 'No',
                f.claimed_at ? new Date(f.claimed_at).toLocaleDateString() : 'Not claimed',
                f.weekly_hours_committed != null ? String(f.weekly_hours_committed) : '',
                RATING_LABEL[f.performance_rating] || f.performance_rating,
                String(f.total_points ?? 0),
                f.linkedin_url || '',
                kh ? `${kh.published}/${kh.total}` : '0/0',
                f.admin_notes || '',
                new Date(f.created_at).toLocaleDateString(),
            ];
        });
        const csv = [headers, ...rows]
            .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catalyst-fellows-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 lg:p-8 max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <Sparkles className="w-6 h-6 text-amber-500" /> Catalyst Fellows
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        The fellowship working team — roster, profiles and Knowledge Hub activity.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchFellows}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <Link
                        href="/fellowship/fellows"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <ExternalLink className="w-4 h-4" /> Public directory
                    </Link>
                    <button
                        onClick={exportFellowsCsv}
                        disabled={fellows.length === 0}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B2C24] text-white text-sm font-medium hover:bg-[#10392f]"
                    >
                        <Plus className="w-4 h-4" /> Add fellow
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                <StatCard label="Total fellows" value={fellows.length} />
                <StatCard label="Claimed profiles" value={`${claimedCount}/${fellows.length}`} />
                <StatCard label="Avg. profile complete" value={`${avgCompleteness}%`} />
                <StatCard label="Active" value={fellows.filter((f) => f.status === 'active').length} />
                <StatCard label="Published articles" value={publishedTotal} />
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* View toggle */}
            <div className="inline-flex items-center gap-1 p-1 mb-4 rounded-lg bg-gray-100">
                <button
                    onClick={() => setView('roster')}
                    className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'roster' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Roster
                </button>
                <button
                    onClick={() => setView('leaderboard')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'leaderboard' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Trophy className="w-3.5 h-3.5" /> Leaderboard
                </button>
            </div>

            {view === 'leaderboard' ? (
                <Leaderboard fellows={fellows} onSelect={setSelected} />
            ) : (
            /* Table */
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs uppercase text-gray-400 border-b border-gray-100">
                            <th className="px-4 py-3">Fellow</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Profile</th>
                            <th className="px-4 py-3">Claimed</th>
                            <th className="px-4 py-3">Public</th>
                            <th className="px-4 py-3">
                                <span className="inline-flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> KH</span>
                            </th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
                        ) : fellows.length === 0 ? (
                            <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                                No fellows yet — add your fellows to get started.
                            </td></tr>
                        ) : (
                            fellows.map((fellow) => {
                                const kh = counts[fellow.email.toLowerCase()];
                                const percent = completenessPercent(fellow);
                                return (
                                    <tr
                                        key={fellow.id}
                                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => setSelected(fellow)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">
                                                {fellow.full_name}
                                                {fellow.designation !== 'fellow' && (
                                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium">
                                                        {designationLabel(fellow.designation)}
                                                        {isAmbassador(fellow.designation) && fellow.country ? ` · ${fellow.country}` : ''}
                                                    </span>
                                                )}
                                                {(fellow.performance_rating === 'at_risk' || fellow.performance_rating === 'underperforming') && (
                                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-medium ${RATING_BADGE[fellow.performance_rating]}`}>
                                                        {RATING_LABEL[fellow.performance_rating]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400">{fellow.email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{fellow.role_in_agripro || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[fellow.status]}`}>
                                                {fellow.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${completenessColor(percent)}`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 tabular-nums">{percent}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {fellow.user_id ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-gray-300" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {fellow.is_public ? (
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <EyeOff className="w-4 h-4 text-gray-300" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {kh ? `${kh.published}/${kh.total}` : '0'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/fellowship/fellows/${fellow.slug}`}
                                                target="_blank"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-gray-400 hover:text-gray-700"
                                                title="View public profile"
                                            >
                                                <ExternalLink className="w-4 h-4 inline" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            )}

            {/* Add modal */}
            {showAdd && (
                <AddFellowModal onClose={() => setShowAdd(false)} onSave={addFellow} saving={saving} />
            )}

            {/* Detail drawer */}
            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setSelected(null)}>
                    <div
                        className="w-full max-w-md bg-white h-full overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">{selected.full_name}</h2>
                            <button onClick={() => setSelected(null)} className="p-1 text-gray-400 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <dl className="space-y-3 text-sm mb-6">
                            <div>
                                <dt className="text-xs text-gray-400 mb-1">Login email (must match their AgriPro account)</dt>
                                <dd>
                                    <input
                                        type="email"
                                        defaultValue={selected.email}
                                        onBlur={(e) => {
                                            const next = e.target.value.trim().toLowerCase();
                                            if (next && next !== selected.email) {
                                                updateFellow(selected.id, { email: next, user_id: null } as Partial<Fellow>);
                                            }
                                        }}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Changing it unlinks any claimed account — they re-link by logging in with the new email.
                                    </p>
                                </dd>
                            </div>
                            <DetailRow label="Role in AgriPro" value={selected.role_in_agripro || '—'} />
                            <DetailRow label="Country" value={selected.country || '—'} />
                            <DetailRow
                                label="Profile claimed"
                                value={selected.claimed_at ? new Date(selected.claimed_at).toLocaleDateString() : 'Not yet — they need to log in with this email'}
                            />
                            <DetailRow
                                label="Knowledge Hub"
                                value={(() => {
                                    const kh = counts[selected.email.toLowerCase()];
                                    return kh ? `${kh.published} published / ${kh.total} total` : 'No contributions';
                                })()}
                            />
                            <div>
                                <dt className="text-xs text-gray-400 mb-1.5">
                                    Profile completeness — {completenessPercent(selected)}%
                                </dt>
                                <dd>
                                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden mb-2">
                                        <div
                                            className={`h-full rounded-full ${completenessColor(completenessPercent(selected))}`}
                                            style={{ width: `${completenessPercent(selected)}%` }}
                                        />
                                    </div>
                                    <ul className="space-y-1">
                                        {completenessChecks(selected).map((check) => (
                                            <li key={check.label} className="flex items-center gap-1.5 text-xs">
                                                {check.done ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                                ) : (
                                                    <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                                )}
                                                <span className={check.done ? 'text-gray-400 line-through' : 'text-gray-700'}>
                                                    {check.label}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </dd>
                            </div>
                        </dl>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Designation</label>
                                <select
                                    value={selected.designation}
                                    onChange={(e) => updateFellow(selected.id, { designation: e.target.value as Fellow['designation'] })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    disabled={saving}
                                >
                                    <option value="fellow">Fellow</option>
                                    <option value="deputy_director">Deputy Fellowship Director</option>
                                    <option value="director">Fellowship Director</option>
                                    <option value="programme_delivery_lead">Programme Delivery Lead</option>
                                    <option value="growth_engagement_lead">Growth & Engagement Lead</option>
                                    <option value="partnerships_lead">Partnerships Lead</option>
                                    <option value="ambassador">Country Ambassador</option>
                                </select>
                            </div>
                            {isAmbassador(selected.designation) && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={selected.country || ''}
                                        key={`${selected.id}-country`}
                                        onBlur={(e) => {
                                            const val = e.target.value.trim();
                                            if (val === (selected.country || '')) return;
                                            updateFellow(selected.id, { country: val || null });
                                        }}
                                        placeholder="e.g. Nigeria"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                        disabled={saving}
                                    />
                                    <p className="mt-1.5 text-xs text-gray-400">
                                        Capped at 10 ambassadors per country — saving past the cap will show an error.
                                    </p>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                                <select
                                    value={selected.status}
                                    onChange={(e) => updateFellow(selected.id, { status: e.target.value as Fellow['status'] })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    disabled={saving}
                                >
                                    <option value="active">Active</option>
                                    <option value="alumni">Alumni</option>
                                    <option value="inactive">Inactive (hidden)</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={selected.is_public}
                                    onChange={(e) => updateFellow(selected.id, { is_public: e.target.checked })}
                                    disabled={saving}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                Visible on public directory
                            </label>
                            {/* ── Accountability ─────────────────────────── */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#0B2C24]" />
                                        <h4 className="text-sm font-semibold text-gray-900">Accountability</h4>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0B2C24]/5 text-[#0B2C24] text-xs font-bold">
                                        <Trophy className="w-3.5 h-3.5" /> {selected.total_points ?? 0} pts
                                    </span>
                                </div>

                                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                    Weekly hours committed
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    defaultValue={selected.weekly_hours_committed ?? ''}
                                    key={`${selected.id}-hours`}
                                    onBlur={(e) => {
                                        const raw = e.target.value.trim();
                                        const val = raw === '' ? null : Math.max(0, parseInt(raw, 10) || 0);
                                        if (val === (selected.weekly_hours_committed ?? null)) return;
                                        const patch: Partial<Fellow> = { weekly_hours_committed: val };
                                        // Start the one-week grace clock the first time hours are committed
                                        if (val !== null && !selected.commitment_started_at) {
                                            patch.commitment_started_at = new Date().toISOString();
                                        }
                                        updateFellow(selected.id, patch);
                                    }}
                                    placeholder="e.g. 10 hrs/week"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    disabled={saving}
                                />

                                {(() => {
                                    const g = graceInfo(selected.commitment_started_at);
                                    if (!g.committed) {
                                        return (
                                            <p className="mt-2 text-xs text-gray-400">
                                                Set weekly hours to start the {GRACE_PERIOD_DAYS}-day grace period.
                                            </p>
                                        );
                                    }
                                    const ends = g.graceEndsAt?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                    return g.inGrace ? (
                                        <p className="mt-2 text-xs text-amber-600 font-medium">
                                            In grace period — rating opens {ends}.
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-xs text-gray-500">
                                            Grace period ended — rating active.
                                        </p>
                                    );
                                })()}

                                <div className="mt-3">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                        Performance rating
                                    </label>
                                    {(() => {
                                        const g = graceInfo(selected.commitment_started_at);
                                        const locked = g.committed && g.inGrace;
                                        return (
                                            <>
                                                <select
                                                    value={selected.performance_rating}
                                                    onChange={(e) =>
                                                        updateFellow(selected.id, {
                                                            performance_rating: e.target.value as PerformanceRating,
                                                            rating_updated_at: new Date().toISOString(),
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                                                    disabled={saving || locked}
                                                >
                                                    <option value="unrated">Unrated</option>
                                                    <option value="on_track">On track</option>
                                                    <option value="at_risk">At risk</option>
                                                    <option value="underperforming">Underperforming</option>
                                                </select>
                                                <p className="mt-1.5 text-xs text-gray-400">
                                                    {locked
                                                        ? 'Rating opens once the grace period ends.'
                                                        : 'Auto-set from the latest scored week — you can override.'}
                                                </p>
                                            </>
                                        );
                                    })()}
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() =>
                                            updateFellow(selected.id, {
                                                commitment_started_at: new Date().toISOString(),
                                                performance_rating: 'unrated',
                                                rating_updated_at: null,
                                            })
                                        }
                                        disabled={saving || !selected.weekly_hours_committed}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Restart grace period
                                    </button>
                                    {selected.status !== 'inactive' && (
                                        <button
                                            onClick={() => {
                                                if (!confirm(`Prune ${selected.full_name}? This sets them to Inactive and removes them from all public displays. You can reactivate them later.`)) return;
                                                updateFellow(selected.id, { status: 'inactive' });
                                            }}
                                            disabled={saving}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        >
                                            <ShieldAlert className="w-3.5 h-3.5" /> Prune — set inactive
                                        </button>
                                    )}
                                </div>

                                {/* Weekly task scoring (tasks assigned in Stride) */}
                                <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                                    <p className="text-xs font-semibold text-gray-600 mb-1">Weekly task scoring</p>
                                    <p className="text-[11px] text-gray-400 mb-3">
                                        Record how many Stride tasks were done. Points accumulate and the latest week auto-sets the rating.
                                    </p>
                                    <WeeklyScoreForm
                                        key={selected.id}
                                        saving={saving}
                                        onRecord={(entry) => recordWeek(selected.id, entry)}
                                    />
                                    {scores.length > 0 && (
                                        <ul className="mt-3 space-y-1.5">
                                            {scores.slice(0, 6).map((sc) => (
                                                <li key={sc.id} className="flex items-center gap-2 text-xs">
                                                    <span className="text-gray-500 w-20 shrink-0">
                                                        {new Date(sc.week_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="text-gray-700 font-medium">
                                                        {sc.tasks_done}{sc.tasks_assigned != null ? `/${sc.tasks_assigned}` : ''} done
                                                    </span>
                                                    <span className="text-gray-400">· {sc.points} pts</span>
                                                    <span className={`ml-auto px-2 py-0.5 rounded-full font-medium ${RATING_BADGE[sc.rating]}`}>
                                                        {RATING_LABEL[sc.rating]}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Admin notes</label>
                                <textarea
                                    defaultValue={selected.admin_notes || ''}
                                    rows={3}
                                    onBlur={(e) => {
                                        if (e.target.value !== (selected.admin_notes || '')) {
                                            updateFellow(selected.id, { admin_notes: e.target.value || null });
                                        }
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex flex-col gap-1.5">
                                    <Link
                                        href={`/fellowship/fellows/${selected.slug}`}
                                        target="_blank"
                                        className="text-sm text-[#0B2C24] font-medium hover:underline"
                                    >
                                        View public profile →
                                    </Link>
                                    <Link
                                        href={`/fellowship/portal?fellow=${selected.id}`}
                                        target="_blank"
                                        className="text-sm text-[#0B2C24] font-medium hover:underline"
                                    >
                                        Edit their profile in the portal →
                                    </Link>
                                </div>
                                <button
                                    onClick={() => deleteFellow(selected.id)}
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" /> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs text-gray-400">{label}</dt>
            <dd className="text-gray-800">{value}</dd>
        </div>
    );
}

function AddFellowModal({
    onClose,
    onSave,
    saving,
}: {
    onClose: () => void;
    onSave: (form: { full_name: string; email: string; designation: string; role_in_agripro: string; country: string }) => void;
    saving: boolean;
}) {
    const [form, setForm] = useState({ full_name: '', email: '', designation: 'fellow', role_in_agripro: '', country: '' });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
            <div className="w-full max-w-md bg-white rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-900">Add a fellow</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                    Use the email they log into AgriPro with — that&apos;s how their profile links to
                    their account, Connect profile and Knowledge Hub contributions.
                </p>
                <div className="space-y-4">
                    <input
                        placeholder="Full name"
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                    <input
                        placeholder="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                    <input
                        placeholder="Role in AgriPro (optional)"
                        value={form.role_in_agripro}
                        onChange={(e) => setForm({ ...form, role_in_agripro: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    />
                    <select
                        value={form.designation}
                        onChange={(e) => setForm({ ...form, designation: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                    >
                        <option value="fellow">Fellow</option>
                        <option value="deputy_director">Deputy Fellowship Director</option>
                        <option value="director">Fellowship Director</option>
                        <option value="programme_delivery_lead">Programme Delivery Lead</option>
                        <option value="growth_engagement_lead">Growth & Engagement Lead</option>
                        <option value="partnerships_lead">Partnerships Lead</option>
                        <option value="ambassador">Country Ambassador</option>
                    </select>
                    {form.designation === 'ambassador' && (
                        <div>
                            <input
                                placeholder="Country (required, e.g. Nigeria)"
                                value={form.country}
                                onChange={(e) => setForm({ ...form, country: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                            />
                            <p className="mt-1.5 text-xs text-gray-400">
                                Capped at 10 ambassadors per country.
                            </p>
                        </div>
                    )}
                    <button
                        onClick={() => onSave(form)}
                        disabled={saving || !form.full_name.trim() || !form.email.trim() || (form.designation === 'ambassador' && !form.country.trim())}
                        className="w-full py-2.5 rounded-lg bg-[#0B2C24] text-white text-sm font-semibold hover:bg-[#10392f] disabled:opacity-50"
                    >
                        {saving ? 'Adding…' : 'Add fellow'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Fellows ranked by accumulated points. Click a row to open their drawer.
function Leaderboard({ fellows, onSelect }: { fellows: Fellow[]; onSelect: (f: Fellow) => void }) {
    const ranked = [...fellows]
        .filter((f) => f.status !== 'inactive')
        .sort(
            (a, b) =>
                (b.total_points ?? 0) - (a.total_points ?? 0) ||
                a.full_name.localeCompare(b.full_name),
        );

    if (ranked.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
                No fellows to rank yet.
            </div>
        );
    }

    const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null);

    return (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
            {ranked.map((f, i) => {
                const rating = f.performance_rating ?? 'unrated';
                return (
                    <button
                        key={f.id}
                        onClick={() => onSelect(f)}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-left"
                    >
                        <span className="w-8 text-center text-lg font-bold text-gray-400 tabular-nums">
                            {medal(i) ?? i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{f.full_name}</p>
                            <p className="text-xs text-gray-400 truncate">
                                {f.role_in_agripro || 'Catalyst Fellow'}
                            </p>
                        </div>
                        {rating !== 'unrated' && (
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${RATING_BADGE[rating]}`}>
                                {RATING_LABEL[rating]}
                            </span>
                        )}
                        <span className="w-16 text-right font-bold text-[#0B2C24] tabular-nums">
                            {f.total_points ?? 0}
                            <span className="text-xs text-gray-400 font-normal"> pts</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// Compact form to record one week's task result. Resets per fellow via `key`.
function WeeklyScoreForm({
    saving,
    onRecord,
}: {
    saving: boolean;
    onRecord: (entry: { week_start: string; tasks_done: number; tasks_assigned: number | null; note: string | null }) => void;
}) {
    const [week, setWeek] = useState(weekStartISO());
    const [done, setDone] = useState('');
    const [assigned, setAssigned] = useState('');
    const [note, setNote] = useState('');

    const submit = () => {
        const d = Math.max(0, parseInt(done || '0', 10) || 0);
        const a = assigned.trim() === '' ? null : Math.max(0, parseInt(assigned, 10) || 0);
        onRecord({ week_start: week, tasks_done: d, tasks_assigned: a, note: note.trim() || null });
        setDone('');
        setAssigned('');
        setNote('');
    };

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-400 mb-1">Week of</label>
                    <input
                        type="date"
                        value={week}
                        onChange={(e) => setWeek(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-400 mb-1">Done</label>
                    <input
                        type="number"
                        min={0}
                        value={done}
                        onChange={(e) => setDone(e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-400 mb-1">Assigned</label>
                    <input
                        type="number"
                        min={0}
                        value={assigned}
                        onChange={(e) => setAssigned(e.target.value)}
                        placeholder="—"
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                    />
                </div>
            </div>
            <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
            />
            <button
                onClick={submit}
                disabled={saving || done.trim() === ''}
                className="w-full py-1.5 rounded-lg bg-[#0B2C24] text-white text-xs font-semibold hover:bg-[#10392f] disabled:opacity-50"
            >
                Record week
            </button>
        </div>
    );
}
