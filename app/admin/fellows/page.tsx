'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
    Plus, X, RefreshCw, CheckCircle2, Circle, Eye, EyeOff,
    Trash2, ExternalLink, BookOpen, Sparkles,
} from 'lucide-react';

type Fellow = {
    id: string;
    user_id: string | null;
    slug: string;
    email: string;
    full_name: string;
    designation: 'fellow' | 'director';
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

    const addFellow = async (form: { full_name: string; email: string; designation: string; role_in_agripro: string }) => {
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

            {/* Table */}
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
                                                {fellow.designation === 'director' && (
                                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-medium">
                                                        Director
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
                                    <option value="director">Fellowship Director</option>
                                </select>
                            </div>
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
    onSave: (form: { full_name: string; email: string; designation: string; role_in_agripro: string }) => void;
    saving: boolean;
}) {
    const [form, setForm] = useState({ full_name: '', email: '', designation: 'fellow', role_in_agripro: '' });

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
                        <option value="director">Fellowship Director</option>
                    </select>
                    <button
                        onClick={() => onSave(form)}
                        disabled={saving || !form.full_name.trim() || !form.email.trim()}
                        className="w-full py-2.5 rounded-lg bg-[#0B2C24] text-white text-sm font-semibold hover:bg-[#10392f] disabled:opacity-50"
                    >
                        {saving ? 'Adding…' : 'Add fellow'}
                    </button>
                </div>
            </div>
        </div>
    );
}
