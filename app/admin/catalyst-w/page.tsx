'use client';

import { useCallback, useEffect, useState } from 'react';
import CustomEmailComposer from '@/components/admin/CustomEmailComposer';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Download, RefreshCw, ChevronDown, Calendar, Trash2,
    Loader2, CheckCircle, Clock, XCircle, Star, Users,
    DollarSign, Send, Eye, AlertCircle, Mail,
} from 'lucide-react';

type SubmissionStatus = 'new' | 'reviewed' | 'interviewed' | 'accepted' | 'paid' | 'waitlisted' | 'rejected';
type EmailTemplate = 'reviewed' | 'interview' | 'accept' | 'paid' | 'waitlist' | 'follow_up' | 'reject';

type Submission = {
    id: string;
    type: 'apply' | 'prospectus' | 'plan';
    status: SubmissionStatus;
    full_name: string;
    email: string;
    country?: string;
    phone?: string;
    business_name?: string;
    business_stage?: string;
    sector?: string;
    plan_tier?: string;
    why_apply?: string;
    revenue?: string;
    team_size?: string;
    website?: string;
    organisation?: string;
    role?: string;
    interest?: string;
    referral_source?: string;
    referral_detail?: string;
    admin_notes?: string;
    created_at: string;
};

interface Toast {
    id: string;
    type: 'success' | 'error';
    message: string;
}

const TYPE_LABELS: Record<string, string> = {
    apply: 'Application',
    prospectus: 'Prospectus',
    plan: 'Plan Selection',
};

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string }> = {
    new:         { label: 'New',         color: 'bg-blue-100 text-blue-700' },
    reviewed:    { label: 'Reviewed',    color: 'bg-yellow-100 text-yellow-700' },
    interviewed: { label: 'Interviewed', color: 'bg-purple-100 text-purple-700' },
    accepted:    { label: 'Accepted',    color: 'bg-green-100 text-green-700' },
    paid:        { label: 'Paid',        color: 'bg-emerald-100 text-emerald-700' },
    waitlisted:  { label: 'Waitlisted',  color: 'bg-orange-100 text-orange-700' },
    rejected:    { label: 'Rejected',    color: 'bg-red-100 text-red-700' },
};

const TYPE_COLORS: Record<string, string> = {
    apply: 'bg-[#0B2C24] text-white',
    prospectus: 'bg-amber-100 text-amber-800',
    plan: 'bg-indigo-100 text-indigo-800',
};

const STAGE_PIPELINE: SubmissionStatus[] = ['new', 'reviewed', 'interviewed', 'accepted', 'paid'];

const STAGE_EMAIL_MAP: Partial<Record<SubmissionStatus, EmailTemplate>> = {
    reviewed: 'reviewed',
    interviewed: 'interview',
    accepted: 'accept',
    paid: 'paid',
    waitlisted: 'waitlist',
    rejected: 'reject',
};

const STAT_KEYS = ['total', 'new', 'reviewed', 'interviewed', 'accepted', 'paid', 'rejected'] as const;

function monthKey(d: string) {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function fmtMonth(key: string) {
    const [y, m] = key.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ToastBar({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
                            t.type === 'success' ? 'bg-green-700 text-white' : 'bg-red-600 text-white'
                        }`}
                    >
                        {t.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{t.message}</span>
                        <button onClick={() => remove(t.id)} className="ml-2 opacity-70 hover:opacity-100">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export default function CatalystWAdminPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');
    const [selected, setSelected] = useState<Submission | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [emailLoading, setEmailLoading] = useState<string | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [adminNotesDraft, setAdminNotesDraft] = useState('');

    const addToast = (type: 'success' | 'error', message: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(p => [...p, { id, type, message }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    };

    const removeToast = (id: string) => setToasts(p => p.filter(t => t.id !== id));

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/catalyst-w');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setSubmissions(data);
        } catch {
            addToast('error', 'Could not load submissions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

    useEffect(() => {
        setAdminNotesDraft(selected?.admin_notes ?? '');
    }, [selected?.id]);

    const patchSubmission = async (id: string, updates: Partial<Submission>) => {
        const res = await fetch('/api/admin/catalyst-w', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
        });
        if (!res.ok) throw new Error('Save failed');
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        setSelected(prev => prev?.id === id ? { ...prev, ...updates } : prev);
    };

    const updateStatus = async (id: string, status: SubmissionStatus) => {
        setSaving(true);
        try {
            await patchSubmission(id, { status });
            addToast('success', `Moved to ${STATUS_CONFIG[status].label}`);
        } catch {
            addToast('error', 'Failed to update status');
        } finally {
            setSaving(false);
        }
    };

    const moveToStage = async (newStatus: SubmissionStatus) => {
        if (!selected) return;
        await updateStatus(selected.id, newStatus);
        const emailTemplate = STAGE_EMAIL_MAP[newStatus];
        if (emailTemplate) {
            const send = window.confirm(
                `Status updated. Send ${STATUS_CONFIG[newStatus].label} notification to ${selected.full_name}?`
            );
            if (send) await sendEmail(emailTemplate, selected);
        }
    };

    const handleNotesSave = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await patchSubmission(selected.id, { admin_notes: adminNotesDraft });
            addToast('success', 'Notes saved');
        } catch {
            addToast('error', 'Failed to save notes');
        } finally {
            setSaving(false);
        }
    };

    const sendEmail = async (template: EmailTemplate, sub?: Submission) => {
        const target = sub ?? selected;
        if (!target) return;

        const labels: Record<EmailTemplate, string> = {
            reviewed: 'under review',
            interview: 'interview invitation',
            accept: 'acceptance',
            paid: 'payment confirmation',
            waitlist: 'waitlist',
            follow_up: 'follow-up',
            reject: 'rejection',
        };

        if (!sub) {
            const confirmed = window.confirm(`Send ${labels[template]} email to ${target.full_name}?`);
            if (!confirmed) return;
        }

        setEmailLoading(template);
        try {
            const res = await fetch('/api/admin/catalyst-w/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: target.email,
                    name: target.full_name.split(' ')[0],
                    business: target.business_name || target.organisation,
                    template,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error ?? 'Send failed');
            }
            addToast('success', `Email sent to ${target.full_name}`);
        } catch (err: any) {
            addToast('error', err.message ?? 'Failed to send email');
        } finally {
            setEmailLoading(null);
        }
    };

    const sendCustomEmail = async (subject: string, body: string) => {
        if (!selected) return;
        setEmailLoading('custom');
        try {
            const res = await fetch('/api/admin/catalyst-w/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: selected.email,
                    name: selected.full_name.split(' ')[0],
                    business: selected.business_name || selected.organisation,
                    template: 'custom',
                    subject,
                    body,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error ?? 'Send failed');
            }
            addToast('success', `Custom email sent to ${selected.full_name}`);
        } catch (err: any) {
            addToast('error', err.message ?? 'Failed to send email');
            throw err;
        } finally {
            setEmailLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        const confirmed = window.confirm(
            `Permanently delete ${selected.full_name}'s submission? This cannot be undone.`
        );
        if (!confirmed) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/catalyst-w?id=${selected.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setSubmissions(prev => prev.filter(s => s.id !== selected.id));
            setSelected(null);
            addToast('success', 'Submission deleted');
        } catch {
            addToast('error', 'Failed to delete submission');
        } finally {
            setDeleting(false);
        }
    };

    const availableMonths = [...new Set(submissions.map(s => monthKey(s.created_at)))].sort().reverse();

    const filtered = submissions.filter(s =>
        (filterType === 'all' || s.type === filterType) &&
        (filterStatus === 'all' || s.status === filterStatus) &&
        (filterMonth === 'all' || monthKey(s.created_at) === filterMonth)
    );

    const stats = {
        total: submissions.length,
        new: submissions.filter(s => s.status === 'new').length,
        reviewed: submissions.filter(s => s.status === 'reviewed').length,
        interviewed: submissions.filter(s => s.status === 'interviewed').length,
        accepted: submissions.filter(s => s.status === 'accepted').length,
        paid: submissions.filter(s => s.status === 'paid').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
    };

    const exportCSV = () => {
        const headers = ['ID', 'Type', 'Status', 'Name', 'Email', 'Country', 'Business', 'Stage', 'Sector', 'Plan', 'Revenue', 'Team', 'Website', 'Organisation', 'Role', 'Heard about us', 'Source detail', 'Date'];
        const rows = filtered.map(s => [
            s.id, s.type, s.status, s.full_name, s.email, s.country || '',
            s.business_name || '', s.business_stage || '', s.sector || '', s.plan_tier || '',
            s.revenue || '', s.team_size || '', s.website || '', s.organisation || '', s.role || '',
            s.referral_source || '', s.referral_detail || '',
            fmtDate(s.created_at),
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catalyst-w-submissions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-[#0B2C24] text-white px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <p className="text-[#F4C430] text-xs font-black uppercase tracking-[0.3em] mb-2">Admin Panel</p>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-black">AgriPro Catalyst W</h1>
                            <p className="text-white/60 mt-1">Programme Submissions · 2026</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={fetchSubmissions} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                                <RefreshCw size={14} /> Refresh
                            </button>
                            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#F4C430] hover:bg-[#D4AF37] text-[#0B2C24] rounded-lg text-sm font-bold transition-colors">
                                <Download size={14} /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
                        {STAT_KEYS.map(key => (
                            <button
                                key={key}
                                onClick={() => key === 'total' ? setFilterStatus('all') : setFilterStatus(key)}
                                className={`p-4 rounded-xl text-left transition-all ${
                                    (key === 'total' && filterStatus === 'all') || filterStatus === key
                                        ? 'bg-[#F4C430] text-[#0B2C24]'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                            >
                                <p className="text-2xl font-black">{stats[key]}</p>
                                <p className="text-xs font-semibold opacity-70 mt-0.5 capitalize">
                                    {key === 'total' ? 'Total' : STATUS_CONFIG[key as SubmissionStatus]?.label ?? key}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 mb-4 flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type:</span>
                        {['all', 'apply', 'prospectus', 'plan'].map(t => (
                            <button key={t} onClick={() => setFilterType(t)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${filterType === t ? 'bg-[#0B2C24] text-white' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                                {t === 'all' ? 'All Types' : TYPE_LABELS[t]}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="px-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 appearance-none bg-white"
                        >
                            <option value="all">All Statuses</option>
                            {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                                <option key={v} value={v}>{c.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <select
                            value={filterMonth}
                            onChange={e => setFilterMonth(e.target.value)}
                            className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 appearance-none bg-white"
                        >
                            <option value="all">All Months</option>
                            {availableMonths.map(m => (
                                <option key={m} value={m}>{fmtMonth(m)}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>

                    <p className="text-xs text-gray-400 ml-auto">
                        Showing {filtered.length} of {submissions.length}
                    </p>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        Loading submissions…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No submissions match your filters.</div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Country</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Business / Org</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                    <th className="px-5 py-3.5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(sub)}>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-900">{sub.full_name}</p>
                                            <p className="text-gray-400 text-xs">{sub.email}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_COLORS[sub.type]}`}>
                                                {TYPE_LABELS[sub.type]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                            <select
                                                value={sub.status}
                                                onClick={e => e.stopPropagation()}
                                                onChange={e => updateStatus(sub.id, e.target.value as SubmissionStatus)}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-green-500/30 max-w-[120px]"
                                            >
                                                {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                                                    <option key={v} value={v}>{c.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{sub.country || '—'}</td>
                                        <td className="px-5 py-4 text-gray-600 hidden lg:table-cell">{sub.business_name || sub.organisation || '—'}</td>
                                        <td className="px-5 py-4 text-gray-400 text-xs hidden lg:table-cell">{fmtDate(sub.created_at)}</td>
                                        <td className="px-5 py-4">
                                            <button onClick={e => { e.stopPropagation(); setSelected(sub); }} className="text-xs font-semibold text-[#0B2C24] hover:underline">
                                                View →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Drawer */}
            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl"
                    >
                        <div className="sticky top-0 bg-[#0B2C24] px-6 py-5 z-10">
                            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10">
                                <X size={18} />
                            </button>
                            <p className="text-[#F4C430] text-[10px] font-black uppercase tracking-[0.3em] mb-1">{TYPE_LABELS[selected.type]}</p>
                            <h2 className="text-white text-xl font-black">{selected.full_name}</h2>
                            <p className="text-white/60 text-sm">{selected.email}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Stage pipeline */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Move Stage</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {STAGE_PIPELINE.map(stage => {
                                        const isActive = selected.status === stage;
                                        return (
                                            <button
                                                key={stage}
                                                onClick={() => !isActive && moveToStage(stage)}
                                                disabled={isActive || saving}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:cursor-default ${
                                                    isActive
                                                        ? `${STATUS_CONFIG[stage].color} ring-2 ring-offset-1 ring-current`
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'
                                                }`}
                                            >
                                                {STATUS_CONFIG[stage].label}
                                            </button>
                                        );
                                    })}
                                    {(['waitlisted', 'rejected'] as const).map(stage => {
                                        const isActive = selected.status === stage;
                                        return (
                                            <button
                                                key={stage}
                                                onClick={() => !isActive && moveToStage(stage)}
                                                disabled={isActive || saving}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:cursor-default ${
                                                    isActive
                                                        ? `${STATUS_CONFIG[stage].color} ring-2 ring-offset-1 ring-current`
                                                        : stage === 'rejected'
                                                            ? 'bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50'
                                                            : 'bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:opacity-50'
                                                }`}
                                            >
                                                {STATUS_CONFIG[stage].label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">Click a stage to update status and optionally send the matching email</p>
                            </div>

                            {/* Status dropdown */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</p>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selected.status}
                                        onChange={e => updateStatus(selected.id, e.target.value as SubmissionStatus)}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                    >
                                        {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                                            <option key={v} value={v}>{c.label}</option>
                                        ))}
                                    </select>
                                    {saving && <Loader2 className="w-4 h-4 text-green-500 animate-spin shrink-0" />}
                                </div>
                            </div>

                            {/* Contact */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact</p>
                                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-green-700 hover:underline text-sm">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                    {selected.email}
                                </a>
                                {selected.phone && <p className="text-sm text-gray-600 mt-1">{selected.phone}</p>}
                            </div>

                            {/* Submission Details */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Submission Details</p>
                                {[
                                    ['Country', selected.country],
                                    ['Business Name', selected.business_name],
                                    ['Business Stage', selected.business_stage],
                                    ['Sector', selected.sector],
                                    ['Plan Tier', selected.plan_tier],
                                    ['Annual Revenue', selected.revenue],
                                    ['Team Size', selected.team_size],
                                    ['Website', selected.website],
                                    ['Organisation', selected.organisation],
                                    ['Role', selected.role],
                                    ['Interest', selected.interest],
                                    ['Heard about us', selected.referral_detail ? `${selected.referral_source} (${selected.referral_detail})` : selected.referral_source],
                                    ['Submitted', new Date(selected.created_at).toLocaleString()],
                                ].filter(([, v]) => v).map(([k, v]) => (
                                    <div key={k as string} className="flex gap-3 py-2.5 border-b border-gray-50">
                                        <span className="text-xs font-semibold text-gray-400 w-32 flex-shrink-0 pt-0.5">{k as string}</span>
                                        <span className="text-sm text-gray-800 flex-1">{v as string}</span>
                                    </div>
                                ))}
                            </div>

                            {selected.why_apply && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Why They Want to Join</p>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{selected.why_apply}</p>
                                </div>
                            )}

                            {/* Admin Notes */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Admin Notes</p>
                                <textarea
                                    value={adminNotesDraft}
                                    onChange={e => setAdminNotesDraft(e.target.value)}
                                    onBlur={handleNotesSave}
                                    rows={3}
                                    placeholder="Add internal notes…"
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">Auto-saves on blur</p>
                            </div>

                            {/* Email actions */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Actions</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'reviewed' as const, label: 'Under Review', icon: Eye, color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
                                        { key: 'interview' as const, label: 'Interview Invite', icon: Users, color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
                                        { key: 'accept' as const, label: 'Send Acceptance', icon: CheckCircle, color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
                                        { key: 'paid' as const, label: 'Payment Confirmed', icon: DollarSign, color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
                                        { key: 'waitlist' as const, label: 'Waitlist Notice', icon: Clock, color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' },
                                        { key: 'follow_up' as const, label: 'Follow Up', icon: Send, color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100' },
                                        { key: 'reject' as const, label: 'Send Rejection', icon: XCircle, color: 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' },
                                    ].map(({ key, label, icon: Icon, color }) => (
                                        <button
                                            key={key}
                                            onClick={() => sendEmail(key)}
                                            disabled={emailLoading !== null}
                                            className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
                                        >
                                            {emailLoading === key ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                            ) : (
                                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                            )}
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-3">
                                    <CustomEmailComposer
                                        recipientName={selected.full_name}
                                        recipientEmail={selected.email}
                                        onSend={sendCustomEmail}
                                        sending={emailLoading === 'custom'}
                                    />
                                </div>
                            </div>

                            {/* Delete */}
                            <div className="pt-1 border-t border-gray-100">
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Delete Submission
                                </button>
                            </div>

                            <p className="text-xs text-gray-300">ID: {selected.id}</p>
                        </div>
                    </motion.div>
                </div>
            )}

            <ToastBar toasts={toasts} remove={removeToast} />
        </div>
    );
}
