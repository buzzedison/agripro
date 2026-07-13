'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { X, Download, RefreshCw, ChevronDown } from 'lucide-react';

type Submission = {
    id: string;
    type: 'apply' | 'prospectus' | 'plan';
    status: 'new' | 'reviewed' | 'accepted' | 'rejected' | 'waitlisted';
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

const TYPE_LABELS: Record<string, string> = {
    apply: 'Application',
    prospectus: 'Prospectus',
    plan: 'Plan Selection',
};

const STATUS_COLORS: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    reviewed: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    waitlisted: 'bg-purple-100 text-purple-700',
};

const TYPE_COLORS: Record<string, string> = {
    apply: 'bg-[#0B2C24] text-white',
    prospectus: 'bg-amber-100 text-amber-800',
    plan: 'bg-indigo-100 text-indigo-800',
};

export default function CatalystWAdminPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selected, setSelected] = useState<Submission | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const supabase = createClient();

    const fetchSubmissions = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('catalyst_submissions')
            .select('*')
            .order('created_at', { ascending: false });
        setSubmissions(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchSubmissions(); }, []);

    const updateStatus = async (id: string, status: string) => {
        setUpdatingStatus(true);
        await supabase.from('catalyst_submissions').update({ status }).eq('id', id);
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: status as Submission['status'] } : s));
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as Submission['status'] } : null);
        setUpdatingStatus(false);
    };

    const exportCSV = () => {
        const headers = ['ID', 'Type', 'Status', 'Name', 'Email', 'Country', 'Business', 'Stage', 'Sector', 'Plan', 'Revenue', 'Team', 'Website', 'Organisation', 'Role', 'Heard about us', 'Source detail', 'Date'];
        const rows = filtered.map(s => [
            s.id, s.type, s.status, s.full_name, s.email, s.country || '',
            s.business_name || '', s.business_stage || '', s.sector || '', s.plan_tier || '',
            s.revenue || '', s.team_size || '', s.website || '', s.organisation || '', s.role || '',
            s.referral_source || '', s.referral_detail || '',
            new Date(s.created_at).toLocaleDateString(),
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'catalyst-w-submissions.csv'; a.click();
    };

    const filtered = submissions.filter(s =>
        (filterType === 'all' || s.type === filterType) &&
        (filterStatus === 'all' || s.status === filterStatus)
    );

    const counts = {
        all: submissions.length,
        apply: submissions.filter(s => s.type === 'apply').length,
        prospectus: submissions.filter(s => s.type === 'prospectus').length,
        plan: submissions.filter(s => s.type === 'plan').length,
        new: submissions.filter(s => s.status === 'new').length,
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

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
                        {[
                            { label: 'Total', value: counts.all, key: 'all' },
                            { label: 'Applications', value: counts.apply, key: 'apply' },
                            { label: 'Prospectus', value: counts.prospectus, key: 'prospectus' },
                            { label: 'Plan Selections', value: counts.plan, key: 'plan' },
                            { label: 'New / Unread', value: counts.new, key: 'new' },
                        ].map(card => (
                            <button
                                key={card.key}
                                onClick={() => card.key === 'new' ? setFilterStatus('new') : setFilterType(card.key)}
                                className={`p-4 rounded-xl text-left transition-all ${filterType === card.key || (card.key === 'new' && filterStatus === 'new') ? 'bg-[#F4C430] text-[#0B2C24]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                            >
                                <p className="text-2xl font-black">{card.value}</p>
                                <p className="text-xs font-semibold opacity-70 mt-0.5">{card.label}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type:</span>
                        {['all', 'apply', 'prospectus', 'plan'].map(t => (
                            <button key={t} onClick={() => setFilterType(t)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${filterType === t ? 'bg-[#0B2C24] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                                {t === 'all' ? 'All Types' : TYPE_LABELS[t]}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status:</span>
                        {['all', 'new', 'reviewed', 'accepted', 'waitlisted', 'rejected'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${filterStatus === s ? 'bg-[#0B2C24] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                                {s === 'all' ? 'All Statuses' : s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading submissions...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No submissions found.</div>
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
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-900">{sub.full_name}</p>
                                            <p className="text-gray-400 text-xs">{sub.email}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_COLORS[sub.type]}`}>
                                                {TYPE_LABELS[sub.type]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[sub.status]}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{sub.country || '—'}</td>
                                        <td className="px-5 py-4 text-gray-600 hidden lg:table-cell">{sub.business_name || sub.organisation || '—'}</td>
                                        <td className="px-5 py-4 text-gray-400 text-xs hidden lg:table-cell">
                                            {new Date(sub.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <button onClick={() => setSelected(sub)} className="text-xs font-semibold text-[#0B2C24] hover:underline">
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
                        {/* Drawer header */}
                        <div className="sticky top-0 bg-[#0B2C24] px-6 py-5 z-10">
                            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10">
                                <X size={18} />
                            </button>
                            <p className="text-[#F4C430] text-[10px] font-black uppercase tracking-[0.3em] mb-1">{TYPE_LABELS[selected.type]}</p>
                            <h2 className="text-white text-xl font-black">{selected.full_name}</h2>
                            <p className="text-white/60 text-sm">{selected.email}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status management */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {(['new', 'reviewed', 'accepted', 'waitlisted', 'rejected'] as const).map(s => (
                                        <button
                                            key={s}
                                            disabled={updatingStatus || selected.status === s}
                                            onClick={() => updateStatus(selected.id, s)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all disabled:opacity-50 ${selected.status === s ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* All fields */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Submission Details</p>
                                {[
                                    ['Country', selected.country],
                                    ['Phone', selected.phone],
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

                            {/* Why apply — full text */}
                            {selected.why_apply && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Why They Want to Join</p>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{selected.why_apply}</p>
                                </div>
                            )}

                            {/* Submission ID */}
                            <p className="text-xs text-gray-300">ID: {selected.id}</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
