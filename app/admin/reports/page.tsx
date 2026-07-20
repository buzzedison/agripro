'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { REPORT_REASON_LABELS, type ReportReason, type ReportStatus, type ReportTargetType } from '@/lib/moderation';
import {
    Flag, ExternalLink, Trash2, ShieldOff, CheckCircle2, XCircle, Loader2, RefreshCw, User as UserIcon,
} from 'lucide-react';

interface ReportRow {
    id: string;
    reporter_id: string;
    target_type: ReportTargetType;
    target_id: string;
    reason: ReportReason;
    details: string | null;
    status: ReportStatus;
    admin_notes: string | null;
    created_at: string;
    reporter?: { full_name: string } | null;
    // Resolved target preview
    target?: {
        exists: boolean;
        label: string;
        preview: string;
        authorName?: string;
        authorId?: string;
    };
}

const STATUS_TABS: { value: ReportStatus | 'all'; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'actioned', label: 'Actioned' },
    { value: 'dismissed', label: 'Dismissed' },
    { value: 'all', label: 'All' },
];

const STATUS_COLORS: Record<ReportStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    reviewed: 'bg-blue-100 text-blue-700',
    actioned: 'bg-red-100 text-red-700',
    dismissed: 'bg-gray-200 text-gray-600',
};

export default function AdminReportsPage() {
    const supabase = createClient();
    const [reports, setReports] = useState<ReportRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<ReportStatus | 'all'>('pending');
    const [selected, setSelected] = useState<ReportRow | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resolveTarget = useCallback(async (r: ReportRow): Promise<ReportRow['target']> => {
        if (r.target_type === 'post') {
            const { data: post } = await supabase.from('posts').select('id, content, user_id').eq('id', r.target_id).maybeSingle();
            if (!post) return { exists: false, label: 'Post', preview: 'Post no longer exists (already removed).' };
            const { data: author } = await supabase.from('profiles').select('full_name').eq('id', post.user_id).maybeSingle();
            return { exists: true, label: 'Post', preview: post.content, authorName: author?.full_name, authorId: post.user_id };
        }
        if (r.target_type === 'comment') {
            const { data: comment } = await supabase.from('post_comments').select('id, content, user_id').eq('id', r.target_id).maybeSingle();
            if (!comment) return { exists: false, label: 'Comment', preview: 'Comment no longer exists (already removed).' };
            const { data: author } = await supabase.from('profiles').select('full_name').eq('id', comment.user_id).maybeSingle();
            return { exists: true, label: 'Comment', preview: comment.content, authorName: author?.full_name, authorId: comment.user_id };
        }
        // user
        const { data: profile } = await supabase.from('profiles').select('id, full_name, bio, is_suspended').eq('id', r.target_id).maybeSingle();
        if (!profile) return { exists: false, label: 'Account', preview: 'Account no longer exists.' };
        return {
            exists: true,
            label: 'Account',
            preview: profile.bio || '(no bio)',
            authorName: profile.full_name,
            authorId: profile.id,
        };
    }, [supabase]);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        let query = supabase.from('content_reports').select('*').order('created_at', { ascending: false });
        if (tab !== 'all') query = query.eq('status', tab);
        const { data, error: fetchError } = await query;

        if (fetchError) {
            setError(fetchError.message);
            setLoading(false);
            return;
        }

        const rows = (data || []) as ReportRow[];
        const reporterIds = [...new Set(rows.map((r) => r.reporter_id))];
        const { data: reporters } = reporterIds.length
            ? await supabase.from('profiles').select('id, full_name').in('id', reporterIds)
            : { data: [] as { id: string; full_name: string }[] };
        const reporterMap = new Map((reporters || []).map((p) => [p.id, p]));

        const withTargets = await Promise.all(
            rows.map(async (r) => ({
                ...r,
                reporter: reporterMap.get(r.reporter_id) || null,
                target: await resolveTarget(r),
            }))
        );

        setReports(withTargets);
        setLoading(false);
    }, [supabase, tab, resolveTarget]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const updateStatus = async (id: string, status: ReportStatus, notes?: string) => {
        setBusy(true);
        const { error: updateError } = await supabase
            .from('content_reports')
            .update({ status, reviewed_at: new Date().toISOString(), admin_notes: notes })
            .eq('id', id);
        if (updateError) setError(updateError.message);
        await fetchReports();
        setSelected(null);
        setBusy(false);
    };

    const deleteTargetContent = async (r: ReportRow) => {
        if (!confirm(`Delete this ${r.target_type}? This cannot be undone.`)) return;
        setBusy(true);
        const table = r.target_type === 'post' ? 'posts' : 'post_comments';
        const { error: deleteError } = await supabase.from(table).delete().eq('id', r.target_id);
        if (deleteError) {
            setError(deleteError.message);
            setBusy(false);
            return;
        }
        await updateStatus(r.id, 'actioned', 'Content deleted by admin.');
    };

    const suspendAuthor = async (r: ReportRow) => {
        const authorId = r.target_type === 'user' ? r.target_id : r.target?.authorId;
        if (!authorId) return;
        if (!confirm(`Suspend ${r.target?.authorName || 'this user'}? Their content will be hidden platform-wide.`)) return;
        setBusy(true);
        const { error: suspendError } = await supabase.from('profiles').update({ is_suspended: true }).eq('id', authorId);
        if (suspendError) {
            setError(suspendError.message);
            setBusy(false);
            return;
        }
        await updateStatus(r.id, 'actioned', 'Author suspended by admin.');
    };

    const pendingCount = reports.filter((r) => r.status === 'pending').length;

    return (
        <div className="p-6 lg:p-8 max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <Flag className="w-6 h-6 text-red-500" /> Reports
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Review reported posts, comments and accounts.</p>
                </div>
                <button
                    onClick={fetchReports}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="inline-flex items-center gap-1 p-1 mb-6 rounded-lg bg-gray-100">
                {STATUS_TABS.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setTab(t.value)}
                        className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t.label}
                        {t.value === 'pending' && pendingCount > 0 && tab !== 'pending' && (
                            <span className="ml-1.5 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
                {loading ? (
                    <div className="p-10 text-center text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-400">No reports here.</div>
                ) : (
                    reports.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => setSelected(r)}
                            className="w-full flex items-start gap-4 px-5 py-4 hover:bg-gray-50 text-left"
                        >
                            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                {r.target_type === 'user' ? <UserIcon className="w-4 h-4 text-red-500" /> : <Flag className="w-4 h-4 text-red-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-semibold text-sm text-gray-900">
                                        {r.target?.label} by {r.target?.authorName || 'unknown'}
                                    </span>
                                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                                    {!r.target?.exists && (
                                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">removed</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 truncate max-w-xl">{r.target?.preview}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Reported by {r.reporter?.full_name || 'unknown'} · {REPORT_REASON_LABELS[r.reason]} · {new Date(r.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Detail drawer */}
            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
                    <div className="relative w-full sm:max-w-md bg-white h-full overflow-y-auto shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-gray-900">Report details</h2>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                        </div>

                        <dl className="space-y-3 text-sm mb-6">
                            <div>
                                <dt className="text-xs text-gray-400 uppercase tracking-wide">Reported</dt>
                                <dd className="text-gray-900 font-medium">{selected.target?.label} by {selected.target?.authorName || 'unknown'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-400 uppercase tracking-wide">Content</dt>
                                <dd className="text-gray-700 bg-gray-50 rounded-lg p-3 mt-1 whitespace-pre-wrap">{selected.target?.preview}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-400 uppercase tracking-wide">Reason</dt>
                                <dd className="text-gray-900">{REPORT_REASON_LABELS[selected.reason]}</dd>
                            </div>
                            {selected.details && (
                                <div>
                                    <dt className="text-xs text-gray-400 uppercase tracking-wide">Reporter notes</dt>
                                    <dd className="text-gray-700">{selected.details}</dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-xs text-gray-400 uppercase tracking-wide">Reported by</dt>
                                <dd className="text-gray-900">{selected.reporter?.full_name || 'unknown'} · {new Date(selected.created_at).toLocaleString()}</dd>
                            </div>
                            {selected.target?.authorId && (
                                <Link
                                    href={`/connect/${selected.target.authorId}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium hover:underline"
                                >
                                    View author profile <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                            )}
                        </dl>

                        <div className="space-y-2 pt-4 border-t border-gray-100">
                            {selected.status === 'pending' && (
                                <button
                                    onClick={() => updateStatus(selected.id, 'reviewed')}
                                    disabled={busy}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Mark reviewed
                                </button>
                            )}
                            {selected.target?.exists && selected.target_type !== 'user' && (
                                <button
                                    onClick={() => deleteTargetContent(selected)}
                                    disabled={busy}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete {selected.target_type}
                                </button>
                            )}
                            {selected.target?.exists && (
                                <button
                                    onClick={() => suspendAuthor(selected)}
                                    disabled={busy}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
                                >
                                    <ShieldOff className="w-4 h-4" /> Suspend {selected.target.authorName || 'user'}
                                </button>
                            )}
                            <button
                                onClick={() => updateStatus(selected.id, 'dismissed', 'No action needed.')}
                                disabled={busy}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4" /> Dismiss report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
