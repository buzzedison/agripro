'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Search, Download, Upload, X, CheckCircle,
  AlertCircle, Mail, Phone, MapPin, Linkedin, ExternalLink,
  ChevronDown, Loader2, Send, Edit2, BarChart3,
} from 'lucide-react';
import SubNav from '../SubNav';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Cohort {
  id: string;
  name: string;
  cohort_number?: number;
  status: string;
  start_date: string;
  end_date: string;
  total_weeks: number;
}

interface Fellow {
  id: string;
  cohort_id: string;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  region: string;
  role: string;
  linkedin_url?: string;
  status: 'active' | 'on_leave' | 'graduated' | 'removed';
  admin_notes?: string;
  attendance_rate?: number;
  sessions_attended?: number;
  sessions_total?: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  fellowship_director: 'Fellowship Director',
  regional_lead: 'Regional Lead',
  partnerships_fellow: 'Partnerships Fellow',
  outreach_fellow: 'Outreach Fellow',
  operations_fellow: 'Operations Fellow',
  content_comms_fellow: 'Content & Comms Fellow',
};

const REGION_LABELS: Record<string, string> = {
  west_africa: 'West Africa',
  east_africa: 'East Africa',
  southern_africa: 'Southern Africa',
  central_africa: 'Central Africa',
  north_africa: 'North Africa',
  open: 'Open / Remote',
};

const FELLOW_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:    { label: 'Active',    color: 'bg-green-100 text-green-700' },
  on_leave:  { label: 'On Leave',  color: 'bg-amber-100 text-amber-700' },
  graduated: { label: 'Graduated', color: 'bg-blue-100 text-blue-700' },
  removed:   { label: 'Removed',   color: 'bg-red-100 text-red-600' },
};

const AVATAR_COLORS = [
  'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500',
  'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-cyan-500',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function exportFellowsCSV(fellows: Fellow[]) {
  const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Country', 'Region', 'Role', 'Status', 'Attendance Rate', 'LinkedIn'];
  const rows = fellows.map(f => [
    f.id, f.full_name, f.email, f.phone ?? '', f.country ?? '',
    REGION_LABELS[f.region] ?? f.region,
    ROLE_LABELS[f.role] ?? f.role,
    f.status,
    f.attendance_rate != null ? `${f.attendance_rate}%` : '',
    f.linkedin_url ?? '',
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fellows-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

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
              t.type === 'success' ? 'bg-green-700 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {t.type === 'success'
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
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

// ─── Fellow Detail Panel ───────────────────────────────────────────────────────

function FellowPanel({
  fellow,
  onClose,
  onUpdate,
  addToast,
}: {
  fellow: Fellow;
  onClose: () => void;
  onUpdate: (f: Fellow) => void;
  addToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [notes, setNotes] = useState(fellow.admin_notes ?? '');
  const [status, setStatus] = useState(fellow.status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  async function saveStatus(newStatus: string) {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/fellowship/catalyst-w/fellows/${fellow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const data = await res.json();
      onUpdate({ ...fellow, status: newStatus as Fellow['status'], ...(data.fellow ?? {}) });
      addToast('Status updated');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSavingStatus(false);
    }
  }

  async function saveNotes() {
    try {
      await fetch(`/api/admin/fellowship/catalyst-w/fellows/${fellow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes }),
      });
      onUpdate({ ...fellow, admin_notes: notes });
      addToast('Notes saved');
    } catch {
      addToast('Failed to save notes', 'error');
    }
  }

  async function sendEmail() {
    if (!emailSubject.trim() || !emailMessage.trim()) return;
    setSendingEmail(true);
    try {
      const res = await fetch('/api/admin/fellowship/catalyst-w/comms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cohort_id: fellow.cohort_id,
          subject: emailSubject,
          message: emailMessage,
          audience: 'custom',
          recipient_ids: [fellow.id],
        }),
      });
      if (!res.ok) throw new Error('Failed to send email');
      addToast(`Email sent to ${fellow.full_name}`);
      setShowEmail(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSendingEmail(false);
    }
  }

  const attendanceRate = fellow.attendance_rate ?? 0;
  const statusCfg = FELLOW_STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' };
  const roleCfg = ROLE_LABELS[fellow.role] ?? fellow.role;
  const regionCfg = REGION_LABELS[fellow.region] ?? fellow.region;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-40 flex flex-col overflow-y-auto"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${avatarColor(fellow.full_name)} flex items-center justify-center text-white font-semibold text-sm`}>
            {fellow.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{fellow.full_name}</h2>
            <p className="text-xs text-gray-500">{roleCfg}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Status</label>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={e => { setStatus(e.target.value as Fellow['status']); saveStatus(e.target.value); }}
              disabled={savingStatus}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="graduated">Graduated</option>
              <option value="removed">Removed</option>
            </select>
            {savingStatus && <Loader2 className="w-4 h-4 text-green-600 animate-spin" />}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
          </div>
        </div>

        {/* Contact info */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Contact</label>
          <div className="space-y-2">
            <a href={`mailto:${fellow.email}`} className="flex items-center gap-2 text-sm text-green-700 hover:underline">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {fellow.email}
            </a>
            {fellow.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {fellow.phone}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {[fellow.country, regionCfg].filter(Boolean).join(', ')}
            </div>
            {fellow.linkedin_url && (
              <a
                href={fellow.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <Linkedin className="w-3.5 h-3.5" />
                LinkedIn Profile
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Attendance */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Attendance</label>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-bold text-green-700">{attendanceRate}%</span>
            {fellow.sessions_attended != null && fellow.sessions_total != null && (
              <span className="text-sm text-gray-500">{fellow.sessions_attended} of {fellow.sessions_total} sessions</span>
            )}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>

        {/* Admin notes */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Admin Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={3}
            placeholder="Add internal notes about this fellow…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/admin/fellowship/catalyst-w/cohort/fellows/${fellow.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-green-600 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
          >
            View Full Profile
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setShowEmail(v => !v)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Send Email
          </button>
        </div>

        {/* Compose email */}
        <AnimatePresence>
          {showEmail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Compose Email</p>
                <input
                  type="text"
                  placeholder="Subject"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <textarea
                  placeholder="Message…"
                  rows={4}
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
                <button
                  onClick={sendEmail}
                  disabled={sendingEmail || !emailSubject.trim() || !emailMessage.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sendingEmail ? 'Sending…' : 'Send'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function FellowsPage() {
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Fellow | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [importing, setImporting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/fellowship/catalyst-w/cohort');
        const data = await res.json();
        const cohorts: Cohort[] = Array.isArray(data) ? data : (data.cohorts ?? []);
        const active = cohorts.find(c => c.status === 'active') ?? cohorts[0] ?? null;
        setCohort(active);
        if (active) {
          const frRes = await fetch(`/api/admin/fellowship/catalyst-w/fellows?cohort_id=${active.id}`);
          const frData = await frRes.json();
          setFellows(Array.isArray(frData) ? frData : (frData.fellows ?? []));
        }
      } catch (err: any) {
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [addToast]);

  async function importFellows() {
    if (!cohort) return;
    setImporting(true);
    try {
      const res = await fetch('/api/admin/fellowship/catalyst-w/fellows/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohort_id: cohort.id }),
      });
      const data = await res.json();
      addToast(`${data.imported ?? 0} fellows imported, ${data.existing ?? 0} already existed`);
      // Refresh list
      const frRes = await fetch(`/api/admin/fellowship/catalyst-w/fellows?cohort_id=${cohort.id}`);
      const frData = await frRes.json();
      setFellows(Array.isArray(frData) ? frData : (frData.fellows ?? []));
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setImporting(false);
    }
  }

  const filtered = fellows.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.full_name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q);
    const matchRole = filterRole === 'all' || f.role === filterRole;
    const matchRegion = filterRegion === 'all' || f.region === filterRegion;
    const matchStatus = filterStatus === 'all' || f.status === filterStatus;
    return matchSearch && matchRole && matchRegion && matchStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0B2C24] text-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/fellowship/catalyst-w" className="flex items-center gap-1.5 text-green-300 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Applications
            </Link>
            <span className="text-green-700">|</span>
            <span className="text-sm text-gray-300">Fellows Roster</span>
          </div>
          {cohort && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{cohort.name}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-700 text-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                Active
              </span>
            </div>
          )}
        </div>
      </header>

      <SubNav />

      <div className="flex h-[calc(100vh-113px)]">
        {/* Left panel */}
        <div className={`flex flex-col ${selected ? 'w-[calc(100%-440px)]' : 'w-full'} transition-all duration-300`}>
          {/* Toolbar */}
          <div className="px-6 py-4 bg-white border-b border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-700" />
                <span className="font-semibold text-gray-900">Fellows</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{fellows.length} total</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={importFellows}
                  disabled={importing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Import from Applications
                </button>
                <button
                  onClick={() => exportFellowsCSV(filtered)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Roles</option>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                value={filterRegion}
                onChange={e => setFilterRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Regions</option>
                {Object.entries(REGION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Statuses</option>
                {Object.entries(FELLOW_STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fellows list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-gray-500">No fellows found</p>
                <p className="text-sm mt-1">
                  {fellows.length === 0
                    ? 'Import fellows from accepted applications to get started.'
                    : 'Try adjusting your filters.'}
                </p>
              </div>
            ) : (
              filtered.map(fellow => {
                const statusCfg = FELLOW_STATUS_CONFIG[fellow.status] ?? { label: fellow.status, color: 'bg-gray-100 text-gray-600' };
                const isSelected = selected?.id === fellow.id;
                return (
                  <button
                    key={fellow.id}
                    onClick={() => setSelected(isSelected ? null : fellow)}
                    className={`w-full text-left p-4 bg-white rounded-xl border transition-all ${
                      isSelected
                        ? 'border-green-500 shadow-md ring-1 ring-green-200'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${avatarColor(fellow.full_name)} flex items-center justify-center text-white font-semibold text-sm shrink-0`}>
                        {fellow.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm">{fellow.full_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {ROLE_LABELS[fellow.role] ?? fellow.role} · {REGION_LABELS[fellow.region] ?? fellow.region}
                          {fellow.country ? `, ${fellow.country}` : ''}
                        </p>
                      </div>
                      {fellow.attendance_rate != null && (
                        <div className="text-right shrink-0">
                          <span className={`text-sm font-semibold ${
                            fellow.attendance_rate >= 70 ? 'text-green-700' :
                            fellow.attendance_rate >= 50 ? 'text-amber-600' : 'text-red-500'
                          }`}>
                            {fellow.attendance_rate}%
                          </span>
                          <p className="text-xs text-gray-400">attendance</p>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right panel */}
        <AnimatePresence>
          {selected && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setSelected(null)} />
              <FellowPanel
                fellow={selected}
                onClose={() => setSelected(null)}
                onUpdate={updated => {
                  setFellows(fs => fs.map(f => f.id === updated.id ? updated : f));
                  setSelected(updated);
                }}
                addToast={addToast}
              />
            </>
          )}
        </AnimatePresence>
      </div>

      <ToastBar toasts={toasts} remove={removeToast} />
    </div>
  );
}
