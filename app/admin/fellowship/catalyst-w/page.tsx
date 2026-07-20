'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import CustomEmailComposer from '@/components/admin/CustomEmailComposer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Filter, Download, Mail, ChevronDown,
    X, ArrowLeft, Sparkles, Loader2, CheckCircle, Clock,
    XCircle, Star, MapPin, Phone, Globe, Linkedin,
    RefreshCw, Send, FileText, BarChart3, TrendingUp, Eye,
    AlertCircle, ChevronUp, ExternalLink, Trash2, Calendar, DollarSign
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Application {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    country?: string;
    region?: string;
    role: string;
    linkedin_url?: string;
    motivation: string;
    experience?: string;
    availability?: string;
    status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'accepted' | 'paid' | 'rejected';
    admin_notes?: string;
    ai_score?: number;
    ai_summary?: string;
    created_at: string;
}

interface AIResult {
    score: number;
    summary: string;
    strengths: string[];
    concerns: string[];
    recommendation: 'accept' | 'shortlist' | 'reject';
}

interface Toast {
    id: string;
    type: 'success' | 'error';
    message: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
    fellowship_director: 'Fellowship Director',
    regional_lead: 'Regional Lead',
    partnerships_fellow: 'Partnerships Fellow',
    outreach_fellow: 'Outreach Fellow',
    operations_fellow: 'Operations Fellow',
    content_comms_fellow: 'Content & Comms Fellow',
    ambassador: 'Country Ambassador',
};

const REGION_LABELS: Record<string, string> = {
    west_africa: 'West Africa',
    east_africa: 'East Africa',
    southern_africa: 'Southern Africa',
    central_africa: 'Central Africa',
    north_africa: 'North Africa',
    open: 'Open / Remote',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending:     { label: 'Pending',     color: 'bg-gray-100 text-gray-600',     icon: Clock },
    reviewing:   { label: 'Reviewing',   color: 'bg-blue-100 text-blue-700',     icon: Eye },
    shortlisted: { label: 'Shortlisted', color: 'bg-amber-100 text-amber-700',   icon: Star },
    interviewed: { label: 'Interviewed', color: 'bg-purple-100 text-purple-700', icon: Users },
    accepted:    { label: 'Accepted',    color: 'bg-green-100 text-green-700',   icon: CheckCircle },
    paid:        { label: 'Paid',        color: 'bg-emerald-100 text-emerald-700', icon: DollarSign },
    rejected:    { label: 'Rejected',    color: 'bg-red-100 text-red-600',       icon: XCircle },
};

type AppStatus = Application['status'];
type EmailTemplate = 'shortlist' | 'interview' | 'accept' | 'reject' | 'reviewing' | 'follow_up' | 'paid';

const STAGE_PIPELINE: AppStatus[] = ['pending', 'reviewing', 'shortlisted', 'interviewed', 'accepted', 'paid'];

const STAGE_EMAIL_MAP: Partial<Record<AppStatus, EmailTemplate>> = {
    reviewing: 'reviewing',
    shortlisted: 'shortlist',
    interviewed: 'interview',
    accepted: 'accept',
    paid: 'paid',
    rejected: 'reject',
};

const STAT_KEYS = ['total', 'pending', 'shortlisted', 'interviewed', 'accepted', 'paid', 'rejected'] as const;

const STAT_CONFIG = {
    total:       { label: 'Total Applications', border: 'border-l-gray-400',   text: 'text-gray-800' },
    pending:     { label: 'Pending',             border: 'border-l-gray-400',   text: 'text-gray-700' },
    shortlisted: { label: 'Shortlisted',         border: 'border-l-amber-500',  text: 'text-amber-700' },
    interviewed: { label: 'Interviewed',         border: 'border-l-purple-500', text: 'text-purple-700' },
    accepted:    { label: 'Accepted',            border: 'border-l-green-500',  text: 'text-green-700' },
    paid:        { label: 'Paid',                border: 'border-l-emerald-500', text: 'text-emerald-700' },
    rejected:    { label: 'Rejected',            border: 'border-l-red-400',    text: 'text-red-600' },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function monthKey(d: string) {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function fmtMonth(key: string) {
    const [y, m] = key.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function scoreColor(score: number) {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-amber-600';
    return 'text-red-500';
}

function scoreBg(score: number) {
    if (score >= 7) return 'bg-green-50 border-green-200';
    if (score >= 5) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
}

function recoBadge(r: string) {
    if (r === 'accept') return 'bg-green-100 text-green-700';
    if (r === 'shortlist') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-600';
}

function exportCSV(apps: Application[]) {
    const headers = [
        'ID', 'Full Name', 'Email', 'Phone', 'Country', 'Region',
        'Role', 'LinkedIn', 'Status', 'AI Score', 'Availability', 'Applied',
    ];
    const rows = apps.map(a => [
        a.id,
        a.full_name,
        a.email,
        a.phone ?? '',
        a.country ?? '',
        REGION_LABELS[a.region ?? ''] ?? (a.region ?? ''),
        ROLE_LABELS[a.role] ?? a.role,
        a.linkedin_url ?? '',
        a.status,
        a.ai_score != null ? String(a.ai_score) : '',
        a.availability ?? '',
        fmtDate(a.created_at),
    ]);
    const csv = [headers, ...rows]
        .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalyst-w-applications-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ─── Toast Component ──────────────────────────────────────────────────────────

function ToastBar({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
                            t.type === 'success'
                                ? 'bg-green-700 text-white'
                                : 'bg-red-600 text-white'
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

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-100 text-gray-600', icon: Clock };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CatalystWAdmin() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Application | null>(null);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterRegion, setFilterRegion] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');
    const [deleting, setDeleting] = useState(false);
    const [sort, setSort] = useState<{ field: string; dir: 'asc' | 'desc' }>({ field: 'created_at', dir: 'desc' });
    const [aiLoading, setAiLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [adminNotesDraft, setAdminNotesDraft] = useState('');
    const notesRef = useRef<HTMLTextAreaElement>(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/fellowship/catalyst-w');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setApplications(data);
        } catch {
            addToast('error', 'Could not load applications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchApplications(); }, [fetchApplications]);

    // Sync admin notes draft when selected changes
    useEffect(() => {
        setAdminNotesDraft(selected?.admin_notes ?? '');
    }, [selected?.id]);

    // ── Toast ──────────────────────────────────────────────────────────────────

    const addToast = (type: 'success' | 'error', message: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(p => [...p, { id, type, message }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    };

    const removeToast = (id: string) => setToasts(p => p.filter(t => t.id !== id));

    // ── Filter + Sort ──────────────────────────────────────────────────────────

    const availableMonths = [...new Set(applications.map(a => monthKey(a.created_at)))].sort().reverse();

    const filtered = applications
        .filter(a => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                a.full_name.toLowerCase().includes(q) ||
                a.email.toLowerCase().includes(q) ||
                (a.country ?? '').toLowerCase().includes(q);
            const matchRole = filterRole === 'all' || a.role === filterRole;
            const matchRegion = filterRegion === 'all' || a.region === filterRegion;
            const matchStatus = filterStatus === 'all' || a.status === filterStatus;
            const matchMonth = filterMonth === 'all' || monthKey(a.created_at) === filterMonth;
            return matchSearch && matchRole && matchRegion && matchStatus && matchMonth;
        })
        .sort((a, b) => {
            let av: any, bv: any;
            if (sort.field === 'full_name') { av = a.full_name; bv = b.full_name; }
            else if (sort.field === 'role') { av = a.role; bv = b.role; }
            else if (sort.field === 'status') { av = a.status; bv = b.status; }
            else { av = a.created_at; bv = b.created_at; }
            if (av < bv) return sort.dir === 'asc' ? -1 : 1;
            if (av > bv) return sort.dir === 'asc' ? 1 : -1;
            return 0;
        });

    const stats = {
        total:       applications.length,
        pending:     applications.filter(a => a.status === 'pending').length,
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
        interviewed: applications.filter(a => a.status === 'interviewed').length,
        accepted:    applications.filter(a => a.status === 'accepted').length,
        paid:        applications.filter(a => a.status === 'paid').length,
        rejected:    applications.filter(a => a.status === 'rejected').length,
    };

    // ── Sort toggle ────────────────────────────────────────────────────────────

    const toggleSort = (field: string) => {
        setSort(s => s.field === field
            ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' }
            : { field, dir: 'asc' }
        );
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sort.field !== field) return <ChevronDown className="w-3 h-3 opacity-30 ml-1 inline" />;
        return sort.dir === 'asc'
            ? <ChevronUp className="w-3 h-3 text-green-600 ml-1 inline" />
            : <ChevronDown className="w-3 h-3 text-green-600 ml-1 inline" />;
    };

    // ── Save helpers ───────────────────────────────────────────────────────────

    const patchApplication = async (id: string, updates: Partial<Application>) => {
        const res = await fetch('/api/admin/fellowship/catalyst-w', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
        });
        if (!res.ok) throw new Error('Save failed');
        // Update local state
        setApplications(prev =>
            prev.map(a => a.id === id ? { ...a, ...updates } : a)
        );
        setSelected(prev => prev?.id === id ? { ...prev, ...updates } : prev);
    };

    const handleStatusChange = async (newStatus: AppStatus, app?: Application) => {
        const target = app ?? selected;
        if (!target) return;
        setSaving(true);
        try {
            await patchApplication(target.id, { status: newStatus });
            addToast('success', `Moved to ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`);
        } catch {
            addToast('error', 'Failed to update status');
        } finally {
            setSaving(false);
        }
    };

    const moveToStage = async (newStatus: AppStatus) => {
        if (!selected) return;
        await handleStatusChange(newStatus);
        const emailTemplate = STAGE_EMAIL_MAP[newStatus];
        if (emailTemplate) {
            const send = window.confirm(`Status updated. Send ${STATUS_CONFIG[newStatus]?.label ?? newStatus} notification email to ${selected.full_name}?`);
            if (send) await sendEmail(emailTemplate, selected);
        }
    };

    const handleInlineStatusChange = async (app: Application, newStatus: AppStatus) => {
        if (app.status === newStatus) return;
        setSaving(true);
        try {
            await patchApplication(app.id, { status: newStatus });
            addToast('success', `${app.full_name} → ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`);
        } catch {
            addToast('error', 'Failed to update status');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        const confirmed = window.confirm(
            `Permanently delete ${selected.full_name}'s application? This cannot be undone.`
        );
        if (!confirmed) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/fellowship/catalyst-w?id=${selected.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setApplications(prev => prev.filter(a => a.id !== selected.id));
            setSelected(null);
            addToast('success', 'Application deleted');
        } catch {
            addToast('error', 'Failed to delete application');
        } finally {
            setDeleting(false);
        }
    };

    const handleNotesSave = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await patchApplication(selected.id, { admin_notes: adminNotesDraft });
            addToast('success', 'Notes saved');
        } catch {
            addToast('error', 'Failed to save notes');
        } finally {
            setSaving(false);
        }
    };

    // ── AI Scoring ─────────────────────────────────────────────────────────────

    const handleAIScore = async () => {
        if (!selected) return;
        setAiLoading(true);
        try {
            const res = await fetch('/api/admin/fellowship/catalyst-w/ai-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    motivation: selected.motivation,
                    experience: selected.experience,
                    role: ROLE_LABELS[selected.role] ?? selected.role,
                }),
            });
            if (!res.ok) throw new Error('AI scoring failed');
            const aiResult: AIResult = await res.json();

            // Save to DB
            await patchApplication(selected.id, {
                ai_score: aiResult.score,
                ai_summary: aiResult.summary,
            });

            // Store full result in session storage for display
            sessionStorage.setItem(`ai-result-${selected.id}`, JSON.stringify(aiResult));
            setAiFullResult(aiResult);
            addToast('success', `Scored ${aiResult.score}/10 — ${aiResult.recommendation}`);
        } catch {
            addToast('error', 'AI scoring failed');
        } finally {
            setAiLoading(false);
        }
    };

    const [aiFullResult, setAiFullResult] = useState<AIResult | null>(null);

    // Load cached AI result when selected changes
    useEffect(() => {
        if (selected) {
            const cached = sessionStorage.getItem(`ai-result-${selected.id}`);
            setAiFullResult(cached ? JSON.parse(cached) : null);
        } else {
            setAiFullResult(null);
        }
    }, [selected?.id]);

    // ── Email ──────────────────────────────────────────────────────────────────

    const sendEmail = async (template: EmailTemplate, app?: Application) => {
        const target = app ?? selected;
        if (!target) return;
        const labels: Record<EmailTemplate, string> = {
            shortlist: 'shortlist',
            interview: 'interview invitation',
            accept: 'offer',
            reject: 'rejection',
            reviewing: 'under review',
            follow_up: 'follow-up',
            paid: 'payment confirmation',
        };
        if (!app) {
            const confirmed = window.confirm(`Send ${labels[template]} email to ${target.full_name}?`);
            if (!confirmed) return;
        }

        setEmailLoading(template);
        try {
            const res = await fetch('/api/admin/fellowship/catalyst-w/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: target.email,
                    name: target.full_name.split(' ')[0],
                    role: ROLE_LABELS[target.role] ?? target.role,
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
            const res = await fetch('/api/admin/fellowship/catalyst-w/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: selected.email,
                    name: selected.full_name.split(' ')[0],
                    role: ROLE_LABELS[selected.role] ?? selected.role,
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

    // ── Loading state ──────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Loading applications…</p>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Header ── */}
            <div style={{ background: '#0B2C24' }} className="px-6 py-5">
                <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/fellowship"
                            className="flex items-center gap-1.5 text-green-300 hover:text-white text-sm transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Fellowship Admin
                        </Link>
                        <div className="w-px h-5 bg-white/20" />
                        <div>
                            <h1 className="text-white font-semibold text-lg leading-tight">Women Catalyst Fellowship</h1>
                            <p className="text-green-300 text-xs mt-0.5">Cohort 2 — Application Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-green-300 text-sm">{applications.length} applications</span>
                        <button
                            onClick={fetchApplications}
                            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-6 py-6">

                {/* ── Stats bar ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                    {STAT_KEYS.map(key => {
                        const cfg = STAT_CONFIG[key];
                        return (
                            <div
                                key={key}
                                className={`bg-white rounded-xl border border-gray-100 border-l-4 ${cfg.border} px-4 py-3 shadow-sm`}
                            >
                                <div className={`text-2xl font-bold ${cfg.text}`}>{stats[key]}</div>
                                <div className="text-gray-500 text-xs mt-0.5">{cfg.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Toolbar ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 mb-4 flex flex-wrap gap-3 items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name, email, country…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                        />
                    </div>

                    {/* Role filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <select
                            value={filterRole}
                            onChange={e => setFilterRole(e.target.value)}
                            className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 appearance-none bg-white"
                        >
                            <option value="all">All Roles</option>
                            {Object.entries(ROLE_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Region filter */}
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <select
                            value={filterRegion}
                            onChange={e => setFilterRegion(e.target.value)}
                            className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 appearance-none bg-white"
                        >
                            <option value="all">All Regions</option>
                            {Object.entries(REGION_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="px-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 appearance-none bg-white"
                        >
                            <option value="all">All Statuses</option>
                            {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                                <option key={v} value={v}>{c.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Month filter */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <select
                            value={filterMonth}
                            onChange={e => setFilterMonth(e.target.value)}
                            className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 appearance-none bg-white"
                        >
                            <option value="all">All Months</option>
                            {availableMonths.map(m => (
                                <option key={m} value={m}>{fmtMonth(m)}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={() => exportCSV(filtered)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors font-medium"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* ── Table + Panel ── */}
                <div className="flex gap-4 items-start">

                    {/* ── Applications Table ── */}
                    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ${selected ? 'flex-1 min-w-0' : 'w-full'}`}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th
                                            onClick={() => toggleSort('full_name')}
                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 whitespace-nowrap"
                                        >
                                            Applicant <SortIcon field="full_name" />
                                        </th>
                                        <th
                                            onClick={() => toggleSort('role')}
                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 whitespace-nowrap"
                                        >
                                            Role <SortIcon field="role" />
                                        </th>
                                        {!selected && (
                                            <>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Region</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Country</th>
                                            </>
                                        )}
                                        <th
                                            onClick={() => toggleSort('status')}
                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 whitespace-nowrap"
                                        >
                                            Status <SortIcon field="status" />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">AI Score</th>
                                        <th
                                            onClick={() => toggleSort('created_at')}
                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 whitespace-nowrap"
                                        >
                                            Applied <SortIcon field="created_at" />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center text-gray-400 text-sm">
                                                No applications match your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map(app => (
                                            <tr
                                                key={app.id}
                                                onClick={() => setSelected(app)}
                                                className={`cursor-pointer transition-colors hover:bg-green-50/40 ${selected?.id === app.id ? 'bg-green-50' : ''}`}
                                            >
                                                {/* Applicant */}
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900 truncate max-w-[160px]">{app.full_name}</div>
                                                    <div className="text-gray-400 text-xs truncate max-w-[160px]">{app.email}</div>
                                                </td>

                                                {/* Role */}
                                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                    {ROLE_LABELS[app.role] ?? app.role}
                                                </td>

                                                {/* Region + Country (hidden when panel open) */}
                                                {!selected && (
                                                    <>
                                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                            {REGION_LABELS[app.region ?? ''] ?? (app.region ?? '—')}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                            {app.country ?? '—'}
                                                        </td>
                                                    </>
                                                )}

                                                {/* Status */}
                                                <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                                    <select
                                                        value={app.status}
                                                        onClick={e => e.stopPropagation()}
                                                        onChange={e => handleInlineStatusChange(app, e.target.value as AppStatus)}
                                                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-green-500/30 max-w-[120px]"
                                                    >
                                                        {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                                                            <option key={v} value={v}>{c.label}</option>
                                                        ))}
                                                    </select>
                                                </td>

                                                {/* AI Score */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {app.ai_score != null ? (
                                                        <span className={`font-semibold ${scoreColor(app.ai_score)}`}>
                                                            {app.ai_score}/10
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                                                    {fmtDate(app.created_at)}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); setSelected(app); }}
                                                        className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium text-xs"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">
                            Showing {filtered.length} of {applications.length} applications
                        </div>
                    </div>

                    {/* ── Detail Panel ── */}
                    <AnimatePresence>
                        {selected && (
                            <motion.div
                                initial={{ x: 60, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 60, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="w-[480px] shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-y-auto"
                                style={{ maxHeight: 'calc(100vh - 160px)', position: 'sticky', top: '24px' }}
                            >
                                {/* Panel Header */}
                                <div className="flex items-start justify-between p-5 border-b border-gray-100">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-base font-semibold text-gray-900 truncate">{selected.full_name}</h2>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                            {ROLE_LABELS[selected.role] ?? selected.role}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="ml-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-5 space-y-5">

                                    {/* Stage pipeline */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Move Stage</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {STAGE_PIPELINE.map(stage => {
                                                const cfg = STATUS_CONFIG[stage];
                                                const isActive = selected.status === stage;
                                                return (
                                                    <button
                                                        key={stage}
                                                        onClick={() => !isActive && moveToStage(stage)}
                                                        disabled={isActive || saving}
                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:cursor-default ${
                                                            isActive
                                                                ? `${cfg.color} ring-2 ring-offset-1 ring-current`
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'
                                                        }`}
                                                    >
                                                        {cfg.label}
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => selected.status !== 'rejected' && moveToStage('rejected')}
                                                disabled={selected.status === 'rejected' || saving}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                    selected.status === 'rejected'
                                                        ? 'bg-red-100 text-red-600 ring-2 ring-offset-1 ring-red-400'
                                                        : 'bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50'
                                                }`}
                                            >
                                                Rejected
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1.5">Click a stage to update status and optionally send the matching email</p>
                                    </div>

                                    {/* Status selector */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={selected.status}
                                                onChange={e => handleStatusChange(e.target.value as AppStatus)}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                                            >
                                                {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                                                    <option key={v} value={v}>{c.label}</option>
                                                ))}
                                            </select>
                                            {saving && <Loader2 className="w-4 h-4 text-green-500 animate-spin shrink-0" />}
                                        </div>
                                    </div>

                                    {/* Contact info */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contact</label>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-green-700 hover:underline col-span-2 truncate">
                                                <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                                {selected.email}
                                            </a>
                                            {selected.phone && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                                    {selected.phone}
                                                </div>
                                            )}
                                            {selected.country && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                                    {selected.country}
                                                    {selected.region && ` · ${REGION_LABELS[selected.region] ?? selected.region}`}
                                                </div>
                                            )}
                                            {selected.linkedin_url && (
                                                <a
                                                    href={selected.linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:underline col-span-2 truncate"
                                                >
                                                    <Linkedin className="w-3.5 h-3.5 shrink-0" />
                                                    LinkedIn Profile
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Motivation */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Motivation Essay</label>
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed max-h-40 overflow-y-auto border border-gray-100">
                                            {selected.motivation || <span className="text-gray-400 italic">Not provided</span>}
                                        </div>
                                    </div>

                                    {/* Experience */}
                                    {selected.experience && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Relevant Experience</label>
                                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed max-h-32 overflow-y-auto border border-gray-100">
                                                {selected.experience}
                                            </div>
                                        </div>
                                    )}

                                    {/* Availability */}
                                    {selected.availability && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Availability</label>
                                            <p className="text-sm text-gray-600">{selected.availability}</p>
                                        </div>
                                    )}

                                    {/* Admin Notes */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Admin Notes</label>
                                        <textarea
                                            ref={notesRef}
                                            value={adminNotesDraft}
                                            onChange={e => setAdminNotesDraft(e.target.value)}
                                            onBlur={handleNotesSave}
                                            rows={3}
                                            placeholder="Add internal notes…"
                                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Auto-saves on blur</p>
                                    </div>

                                    {/* AI Score section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Evaluation</label>
                                            {selected.ai_score == null && !aiLoading && (
                                                <button
                                                    onClick={handleAIScore}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors font-medium"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    Score with AI
                                                </button>
                                            )}
                                        </div>

                                        {aiLoading && (
                                            <div className="flex items-center gap-2 text-purple-600 text-sm py-3">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Evaluating application…
                                            </div>
                                        )}

                                        {!aiLoading && selected.ai_score != null && (
                                            <div className={`rounded-xl border p-4 ${scoreBg(selected.ai_score)}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className={`text-3xl font-bold ${scoreColor(selected.ai_score)}`}>{selected.ai_score}</span>
                                                        <span className="text-gray-400 text-sm">/10</span>
                                                    </div>
                                                    {aiFullResult && (
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${recoBadge(aiFullResult.recommendation)}`}>
                                                            {aiFullResult.recommendation.charAt(0).toUpperCase() + aiFullResult.recommendation.slice(1)}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={handleAIScore}
                                                        className="text-xs text-gray-500 hover:text-purple-600 flex items-center gap-1"
                                                    >
                                                        <RefreshCw className="w-3 h-3" />
                                                        Re-score
                                                    </button>
                                                </div>

                                                {selected.ai_summary && (
                                                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{selected.ai_summary}</p>
                                                )}

                                                {aiFullResult && (
                                                    <>
                                                        {aiFullResult.strengths?.length > 0 && (
                                                            <div className="mb-2">
                                                                <p className="text-xs font-semibold text-gray-500 mb-1">Strengths</p>
                                                                <ul className="space-y-0.5">
                                                                    {aiFullResult.strengths.map((s, i) => (
                                                                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                                                                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                                                            {s}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {aiFullResult.concerns?.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 mb-1">Concerns</p>
                                                                <ul className="space-y-0.5">
                                                                    {aiFullResult.concerns.map((c, i) => (
                                                                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                                                                            <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                                                                            {c}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email actions */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email Actions</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { key: 'reviewing' as const, label: 'Under Review', icon: Eye, color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
                                                { key: 'shortlist' as const, label: 'Send Shortlist', icon: Star, color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
                                                { key: 'interview' as const, label: 'Interview Invite', icon: Users, color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
                                                { key: 'accept' as const, label: 'Send Offer', icon: CheckCircle, color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
                                                { key: 'paid' as const, label: 'Payment Confirmed', icon: DollarSign, color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
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
                                            Delete Application
                                        </button>
                                    </div>

                                    {/* Applied date */}
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Applied {fmtDate(selected.created_at)} · ID: <span className="font-mono">{selected.id.slice(0, 8)}</span>
                                        </p>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Toasts */}
            <ToastBar toasts={toasts} remove={removeToast} />
        </div>
    );
}
