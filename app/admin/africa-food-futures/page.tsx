'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, RefreshCw, Download, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Submission = {
    id: string
    type: string
    status: string
    full_name: string
    email: string
    organisation: string
    country: string
    phone: string
    message: string
    ticket_tier: string
    talk_title: string
    talk_format: string
    talk_track: string
    bio: string
    linkedin: string
    previous_speaking: string
    package_interest: string
    budget_range: string
    website: string
    admin_notes: string
    created_at: string
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    register: { label: 'Registration', color: 'bg-blue-100 text-blue-800' },
    speaker: { label: 'Speaker', color: 'bg-purple-100 text-purple-800' },
    partner: { label: 'Partner', color: 'bg-teal-100 text-teal-800' },
    sponsor: { label: 'Sponsor', color: 'bg-yellow-100 text-yellow-800' },
    exhibitor: { label: 'Exhibitor', color: 'bg-orange-100 text-orange-800' },
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    new: { label: 'New', icon: <Clock size={14} />, color: 'bg-gray-100 text-gray-700' },
    reviewed: { label: 'Reviewed', icon: <Eye size={14} />, color: 'bg-blue-100 text-blue-700' },
    accepted: { label: 'Accepted', icon: <CheckCircle size={14} />, color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', icon: <XCircle size={14} />, color: 'bg-red-100 text-red-700' },
}

export default function AFFAdminPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selected, setSelected] = useState<Submission | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState(false)

    const fetchSubmissions = useCallback(async () => {
        setLoading(true)
        let query = supabase
            .from('aff_submissions')
            .select('*')
            .order('created_at', { ascending: false })

        if (filterType !== 'all') query = query.eq('type', filterType)
        if (filterStatus !== 'all') query = query.eq('status', filterStatus)

        const { data, error } = await query
        if (!error && data) setSubmissions(data)
        setLoading(false)
    }, [filterType, filterStatus])

    useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

    const updateStatus = async (id: string, status: string) => {
        setUpdatingStatus(true)
        await supabase.from('aff_submissions').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
        await fetchSubmissions()
        setUpdatingStatus(false)
    }

    const exportCSV = () => {
        const headers = ['Type', 'Name', 'Email', 'Organisation', 'Country', 'Status', 'Date']
        const rows = submissions.map(s => [
            s.type, s.full_name, s.email, s.organisation || '', s.country || '', s.status,
            new Date(s.created_at).toLocaleDateString()
        ])
        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'aff-submissions.csv'; a.click()
    }

    // Summary counts
    const counts = submissions.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const newCount = submissions.filter(s => s.status === 'new').length

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/admin" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
                            <ArrowLeft size={14} /> Back to Admin
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Africa Food Futures 2026</h1>
                        <p className="text-gray-500 text-sm mt-1">Form submissions — Registrations, Speakers, Partners, Sponsors & Exhibitors</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchSubmissions} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#0B2C24] text-white rounded-lg text-sm hover:bg-[#0d3a2e]">
                            <Download size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {Object.entries(TYPE_LABELS).map(([type, cfg]) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(filterType === type ? 'all' : type)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${filterType === type ? 'border-[#0B2C24] bg-white shadow-md' : 'border-transparent bg-white shadow-sm hover:shadow-md'}`}
                        >
                            <p className="text-2xl font-black text-gray-900">{counts[type] || 0}</p>
                            <p className="text-xs font-semibold text-gray-500 mt-1">{cfg.label}s</p>
                        </button>
                    ))}
                </div>

                {/* Filters + Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
                        <Filter size={16} className="text-gray-400" />
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'register', 'speaker', 'partner', 'sponsor', 'exhibitor'].map(t => (
                                <button key={t} onClick={() => setFilterType(t)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filterType === t ? 'bg-[#0B2C24] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {t === 'all' ? 'All Types' : TYPE_LABELS[t]?.label}
                                </button>
                            ))}
                        </div>
                        <div className="ml-auto flex gap-2">
                            {['all', 'new', 'reviewed', 'accepted', 'rejected'].map(s => (
                                <button key={s} onClick={() => setFilterStatus(s)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filterStatus === s ? 'bg-[#0B2C24] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {s === 'all' ? 'All Statuses' : STATUS_CONFIG[s]?.label}
                                    {s === 'new' && newCount > 0 && <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">{newCount}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B2C24]" />
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p className="text-lg font-semibold">No submissions yet</p>
                            <p className="text-sm mt-1">Submissions will appear here once forms are filled out.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Organisation</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {submissions.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">{s.full_name}</p>
                                                <p className="text-gray-400 text-xs">{s.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TYPE_LABELS[s.type]?.color}`}>
                                                    {TYPE_LABELS[s.type]?.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{s.organisation || '—'}</td>
                                            <td className="px-6 py-4 text-gray-600">{s.country || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[s.status]?.color}`}>
                                                    {STATUS_CONFIG[s.status]?.icon}
                                                    {STATUS_CONFIG[s.status]?.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">{new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => setSelected(s)} className="text-[#0B2C24] font-semibold text-xs hover:underline">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Drawer */}
            {selected && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40" onClick={() => setSelected(null)} />
                    <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
                        <div className="bg-[#0B2C24] px-6 py-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[#F4C430] text-xs font-bold uppercase tracking-widest mb-1">{TYPE_LABELS[selected.type]?.label}</p>
                                    <h2 className="text-white text-xl font-black">{selected.full_name}</h2>
                                    <p className="text-white/60 text-sm">{selected.email}</p>
                                </div>
                                <button onClick={() => setSelected(null)} className="text-white/50 hover:text-white text-2xl leading-none mt-1">×</button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status update */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</p>
                                <div className="flex gap-2 flex-wrap">
                                    {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                                        <button key={s} disabled={updatingStatus} onClick={() => updateStatus(selected.id, s)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${selected.status === s ? 'border-[#0B2C24] bg-[#0B2C24] text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                                            {cfg.icon} {cfg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* All fields */}
                            <div className="space-y-3">
                                {[
                                    ['Organisation', selected.organisation],
                                    ['Country', selected.country],
                                    ['Phone', selected.phone],
                                    ['Ticket Tier', selected.ticket_tier],
                                    ['Talk Title', selected.talk_title],
                                    ['Talk Format', selected.talk_format],
                                    ['Talk Track', selected.talk_track],
                                    ['LinkedIn', selected.linkedin],
                                    ['Package Interest', selected.package_interest],
                                    ['Budget Range', selected.budget_range],
                                    ['Website', selected.website],
                                    ['Previous Speaking', selected.previous_speaking],
                                ].filter(([, v]) => v).map(([label, value]) => (
                                    <div key={label as string}>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                                        <p className="text-gray-900 mt-0.5">{value}</p>
                                    </div>
                                ))}

                                {selected.bio && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bio</p>
                                        <p className="text-gray-700 mt-0.5 text-sm leading-relaxed">{selected.bio}</p>
                                    </div>
                                )}

                                {selected.message && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Message</p>
                                        <p className="text-gray-700 mt-0.5 text-sm leading-relaxed">{selected.message}</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400">Submitted {new Date(selected.created_at).toLocaleString('en-GB')}</p>
                                <p className="text-xs text-gray-300 mt-0.5">ID: {selected.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
