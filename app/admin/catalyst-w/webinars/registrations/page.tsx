'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, RefreshCw, Loader2, Download, Search, Users,
    Calendar, Mail, ExternalLink, Send, X, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { formatWebinarDate, formatWebinarTime } from '@/lib/catalyst-w/webinars';

interface WebinarRef {
    id: string;
    title: string;
    slug: string;
    starts_at: string;
    timezone: string;
    status: string;
    registration_url?: string | null;
}

interface Registration {
    id: string;
    webinar_id: string;
    full_name: string;
    email: string;
    phone?: string | null;
    country?: string | null;
    organisation?: string | null;
    role_title?: string | null;
    created_at: string;
    webinar: WebinarRef | WebinarRef[] | null;
}

function webinarOf(r: Registration): WebinarRef | null {
    if (!r.webinar) return null;
    return Array.isArray(r.webinar) ? r.webinar[0] ?? null : r.webinar;
}

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

export default function WebinarRegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterWebinar, setFilterWebinar] = useState('all');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [composeOpen, setComposeOpen] = useState(false);

    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/catalyst-w/webinars/rsvps');
            if (!res.ok) throw new Error('Failed to fetch');
            setRegistrations(await res.json());
        } catch {
            setRegistrations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

    const webinars = [...new Map(
        registrations
            .map(r => webinarOf(r))
            .filter(Boolean)
            .map(w => [w!.id, w!])
    ).values()].sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());

    const filtered = registrations.filter(r => {
        const w = webinarOf(r);
        const q = search.toLowerCase();
        const matchSearch = !q ||
            r.full_name.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            (r.organisation ?? '').toLowerCase().includes(q) ||
            (r.country ?? '').toLowerCase().includes(q) ||
            (w?.title ?? '').toLowerCase().includes(q);
        const matchWebinar = filterWebinar === 'all' || r.webinar_id === filterWebinar;
        return matchSearch && matchWebinar;
    });

    const allFilteredSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));

    const toggleOne = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleAllFiltered = () => {
        setSelected(prev => {
            if (allFilteredSelected) {
                const next = new Set(prev);
                filtered.forEach(r => next.delete(r.id));
                return next;
            }
            const next = new Set(prev);
            filtered.forEach(r => next.add(r.id));
            return next;
        });
    };

    const exportCsv = () => {
        const headers = ['Webinar', 'Event Date', 'Name', 'Email', 'Phone', 'Country', 'Organisation', 'Role', 'Registered'];
        const rows = filtered.map(r => {
            const w = webinarOf(r);
            return [
                w?.title ?? '',
                w ? formatWebinarDate(w.starts_at, w.timezone) : '',
                r.full_name,
                r.email,
                r.phone ?? '',
                r.country ?? '',
                r.organisation ?? '',
                r.role_title ?? '',
                fmtDate(r.created_at),
            ];
        });
        const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `webinar-registrations-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-[#0B2C24] text-white px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    <Link
                        href="/admin/catalyst-w/webinars"
                        className="inline-flex items-center gap-2 text-green-300 hover:text-white text-sm mb-4"
                    >
                        <ArrowLeft size={14} />
                        Webinars & Events
                    </Link>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-black">Webinar Registrations</h1>
                            <p className="text-white/60 text-sm mt-1">
                                All RSVP submissions across Catalyst W webinars
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={fetchRegistrations}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
                            >
                                <RefreshCw size={14} /> Refresh
                            </button>
                            <button
                                onClick={exportCsv}
                                disabled={filtered.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm disabled:opacity-50"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                            <button
                                onClick={() => setComposeOpen(true)}
                                disabled={selected.size === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-[#F4C430] text-[#0B2C24] font-bold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={14} /> Email selected {selected.size > 0 ? `(${selected.size})` : ''}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 max-w-lg">
                        <div className="bg-white/10 rounded-xl px-4 py-3">
                            <p className="text-2xl font-black">{registrations.length}</p>
                            <p className="text-xs text-white/60">Total registrations</p>
                        </div>
                        <div className="bg-white/10 rounded-xl px-4 py-3">
                            <p className="text-2xl font-black">{webinars.length}</p>
                            <p className="text-xs text-white/60">Webinars with RSVPs</p>
                        </div>
                        <div className="bg-white/10 rounded-xl px-4 py-3 col-span-2 sm:col-span-1">
                            <p className="text-2xl font-black">{filtered.length}</p>
                            <p className="text-xs text-white/60">Showing (filtered)</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 mb-4 flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name, email, organisation, webinar…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                        />
                    </div>
                    <select
                        value={filterWebinar}
                        onChange={e => setFilterWebinar(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 bg-white min-w-48"
                    >
                        <option value="all">All webinars</option>
                        {webinars.map(w => (
                            <option key={w.id} value={w.id}>{w.title}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">
                        {registrations.length === 0 ? 'No registrations yet.' : 'No registrations match your filters.'}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                                    <th className="px-5 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            checked={allFilteredSelected}
                                            onChange={toggleAllFiltered}
                                            className="w-4 h-4 rounded border-gray-300 text-[#0B2C24] focus:ring-[#0B2C24]/30"
                                            aria-label="Select all filtered registrants"
                                        />
                                    </th>
                                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Registrant</th>
                                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Webinar</th>
                                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Details</th>
                                    <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Registered</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(r => {
                                    const w = webinarOf(r);
                                    return (
                                        <tr key={r.id} className={`hover:bg-gray-50/80 ${selected.has(r.id) ? 'bg-green-50/40' : ''}`}>
                                            <td className="px-5 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(r.id)}
                                                    onChange={() => toggleOne(r.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-[#0B2C24] focus:ring-[#0B2C24]/30"
                                                    aria-label={`Select ${r.full_name}`}
                                                />
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-gray-900">{r.full_name}</p>
                                                <a href={`mailto:${r.email}`} className="text-green-700 hover:underline text-xs flex items-center gap-1 mt-0.5">
                                                    <Mail size={11} />
                                                    {r.email}
                                                </a>
                                                {r.phone && (
                                                    <p className="text-xs text-gray-400 mt-0.5">{r.phone}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell">
                                                {w ? (
                                                    <>
                                                        <p className="font-medium text-gray-800 line-clamp-2">{w.title}</p>
                                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                            <Calendar size={11} />
                                                            {formatWebinarDate(w.starts_at, w.timezone)}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 hidden lg:table-cell text-gray-600">
                                                <div className="space-y-0.5 text-xs">
                                                    {r.country && <p>{r.country}</p>}
                                                    {r.organisation && <p>{r.organisation}</p>}
                                                    {r.role_title && <p className="text-gray-400">{r.role_title}</p>}
                                                    {!r.country && !r.organisation && !r.role_title && '—'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 hidden sm:table-cell text-gray-400 text-xs whitespace-nowrap">
                                                {fmtDate(r.created_at)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {w && (
                                                    <a
                                                        href={`/webinars/${w.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B2C24] hover:underline"
                                                    >
                                                        Event
                                                        <ExternalLink size={12} />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {composeOpen && (
                <ComposeModal
                    rsvpIds={[...selected]}
                    count={selected.size}
                    onClose={() => setComposeOpen(false)}
                    onSent={() => {
                        setSelected(new Set());
                        setComposeOpen(false);
                    }}
                />
            )}
        </div>
    );
}

function ComposeModal({
    rsvpIds,
    count,
    onClose,
    onSent,
}: {
    rsvpIds: string[];
    count: number;
    onClose: () => void;
    onSent: () => void;
}) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ sent: number; failed: string[]; total: number; errorMessage?: string | null } | null>(null);

    const handleSend = async () => {
        setError('');
        if (!subject.trim() || !message.trim()) {
            setError('Subject and message are both required.');
            return;
        }
        setSending(true);
        try {
            const res = await fetch('/api/admin/catalyst-w/webinars/bulk-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rsvpIds, subject, message }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to send.');
                return;
            }
            setResult(data);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
            <div
                className="w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                    <h2 className="font-bold text-gray-900">
                        {result ? 'Email sent' : `Email ${count} registrant${count === 1 ? '' : 's'}`}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {result ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-7 h-7 text-green-600" />
                            </div>
                            <p className="text-gray-900 font-semibold mb-1">
                                Sent to {result.sent} of {result.total} registrant{result.total === 1 ? '' : 's'}
                            </p>
                            {result.failed.length > 0 && (
                                <div className="mt-3 text-left bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                    <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1.5">
                                        <AlertCircle size={12} /> {result.failed.length} failed to send
                                    </p>
                                    {result.errorMessage && (
                                        <p className="text-xs text-red-700 font-mono bg-red-100/60 rounded px-2 py-1.5 mb-2 break-words">
                                            {result.errorMessage}
                                        </p>
                                    )}
                                    <p className="text-xs text-red-600 break-words">{result.failed.join(', ')}</p>
                                </div>
                            )}
                            <button
                                onClick={onSent}
                                className="mt-5 px-6 py-2.5 bg-[#0B2C24] text-white font-bold rounded-full text-sm"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">
                                Sending to <span className="font-semibold text-gray-800">{count}</span> selected registrant{count === 1 ? '' : 's'}. De-duplicated by email automatically.
                            </p>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Webinar rescheduled to Aug 18"
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C24]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={8}
                                    placeholder={"Hi there — quick update on the webinar...\n\nWe've moved it to August 18 at the same time. The link stays the same.\n\nSee you there!"}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C24]/20 resize-none"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">
                                    Each email opens with &ldquo;Hi [First name],&rdquo; — write the rest below. Plain text; line breaks are preserved.
                                </p>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 px-3.5 py-2.5 rounded-lg">{error}</p>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={onClose}
                                    disabled={sending}
                                    className="px-5 py-2.5 text-gray-600 font-semibold text-sm rounded-full hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={sending || !subject.trim() || !message.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#F4C430] text-[#0B2C24] font-bold rounded-full text-sm disabled:opacity-50"
                                >
                                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    {sending ? 'Sending…' : `Send to ${count}`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
