'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, X, CheckCircle, AlertCircle, Loader2,
  Calendar, Clock, User, ChevronDown, ChevronUp,
  Edit2, Video, FileText, ExternalLink, ChevronRight,
} from 'lucide-react';
import SubNav from '../SubNav';
import { onUrlBlur } from '@/lib/utils/url';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Cohort {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  total_weeks: number;
}

interface Session {
  id: string;
  cohort_id: string;
  week_number: number;
  title: string;
  type: string;
  session_date: string;
  session_time?: string;
  duration_minutes?: number;
  timezone?: string;
  facilitator_name?: string;
  facilitator_org?: string;
  description?: string;
  recording_url?: string;
  materials_url?: string;
  notes?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

type SessionFormData = Omit<Session, 'id' | 'cohort_id'>;

// ─── Constants ─────────────────────────────────────────────────────────────────

const SESSION_TYPES = [
  { value: 'workshop',        label: 'Workshop' },
  { value: 'mentorship_call', label: 'Mentorship Call' },
  { value: 'guest_speaker',   label: 'Guest Speaker' },
  { value: 'networking',      label: 'Networking' },
  { value: 'check_in',        label: 'Check-In' },
  { value: 'masterclass',     label: 'Masterclass' },
  { value: 'group_work',      label: 'Group Work' },
  { value: 'office_hours',    label: 'Office Hours' },
];

const SESSION_STATUSES = [
  { value: 'scheduled',  label: 'Scheduled' },
  { value: 'live',       label: 'Live' },
  { value: 'completed',  label: 'Completed' },
  { value: 'cancelled',  label: 'Cancelled' },
];

const SESSION_TYPE_COLORS: Record<string, string> = {
  workshop:        'bg-blue-100 text-blue-700',
  mentorship_call: 'bg-purple-100 text-purple-700',
  guest_speaker:   'bg-amber-100 text-amber-700',
  networking:      'bg-green-100 text-green-700',
  check_in:        'bg-gray-100 text-gray-600',
  masterclass:     'bg-indigo-100 text-indigo-700',
  group_work:      'bg-rose-100 text-rose-700',
  office_hours:    'bg-teal-100 text-teal-700',
};

const SESSION_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-600',
  live:      'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-500',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtShortDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getWeekDateRange(startDate: string, weekNumber: number): string {
  const start = new Date(startDate);
  const weekStart = new Date(start.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  return `${fmtShortDate(weekStart.toISOString())} – ${fmtShortDate(weekEnd.toISOString())}`;
}

function getCurrentWeekNumber(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  if (diffMs < 0) return 1;
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
}

const EMPTY_FORM: SessionFormData = {
  week_number: 1,
  title: '',
  type: 'workshop',
  session_date: '',
  session_time: '',
  duration_minutes: 90,
  timezone: 'Africa/Lagos',
  facilitator_name: '',
  facilitator_org: '',
  description: '',
  recording_url: '',
  materials_url: '',
  notes: '',
  status: 'scheduled',
};

// ─── Toast ─────────────────────────────────────────────────────────────────────

function ToastBar({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
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

// ─── Session Form Panel ────────────────────────────────────────────────────────

function SessionFormPanel({
  session,
  onClose,
  onSaved,
  cohortId,
  addToast,
}: {
  session: Session | null;
  onClose: () => void;
  onSaved: (s: Session) => void;
  cohortId: string;
  addToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [form, setForm] = useState<SessionFormData>(
    session
      ? {
          week_number: session.week_number,
          title: session.title,
          type: session.type,
          session_date: session.session_date,
          session_time: session.session_time ?? '',
          duration_minutes: session.duration_minutes ?? 90,
          timezone: session.timezone ?? 'Africa/Lagos',
          facilitator_name: session.facilitator_name ?? '',
          facilitator_org: session.facilitator_org ?? '',
          description: session.description ?? '',
          recording_url: session.recording_url ?? '',
          materials_url: session.materials_url ?? '',
          notes: session.notes ?? '',
          status: session.status,
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);

  function set(field: keyof SessionFormData, value: any) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = session
        ? `/api/admin/fellowship/catalyst-w/sessions/${session.id}`
        : '/api/admin/fellowship/catalyst-w/sessions';
      const method = session ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cohort_id: cohortId }),
      });
      if (!res.ok) throw new Error('Failed to save session');
      const data = await res.json();
      onSaved(data.session ?? data);
      addToast(session ? 'Session updated' : 'Session created');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-40 flex flex-col"
    >
      <div className="flex items-center justify-between p-5 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">{session ? 'Edit Session' : 'Add Session'}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Week Number</label>
            <input
              type="number"
              min={1}
              required
              value={form.week_number}
              onChange={e => set('week_number', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              value={form.type}
              onChange={e => set('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {SESSION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Session Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Leadership & Vision Workshop"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
            <input
              type="date"
              required
              value={form.session_date}
              onChange={e => set('session_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
            <input
              type="time"
              value={form.session_time}
              onChange={e => set('session_time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Duration (mins)</label>
            <input
              type="number"
              min={15}
              value={form.duration_minutes}
              onChange={e => set('duration_minutes', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Timezone</label>
            <input
              type="text"
              value={form.timezone}
              onChange={e => set('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Facilitator Name</label>
            <input
              type="text"
              value={form.facilitator_name}
              onChange={e => set('facilitator_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Facilitator Org</label>
            <input
              type="text"
              value={form.facilitator_org}
              onChange={e => set('facilitator_org', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Recording URL</label>
          <input
            type="url"
            value={form.recording_url}
            onChange={e => set('recording_url', e.target.value)}
            onBlur={onUrlBlur((v) => set('recording_url', v))}
            placeholder="https://…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Materials URL</label>
          <input
            type="url"
            value={form.materials_url}
            onChange={e => set('materials_url', e.target.value)}
            onBlur={onUrlBlur((v) => set('materials_url', v))}
            placeholder="https://…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {SESSION_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </form>

      <div className="p-5 border-t border-gray-200 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit as any}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {saving ? 'Saving…' : session ? 'Save Changes' : 'Add Session'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Week Accordion ────────────────────────────────────────────────────────────

function WeekSection({
  weekNumber,
  sessions,
  defaultOpen,
  cohortStartDate,
  onEdit,
  onStatusChange,
}: {
  weekNumber: number;
  sessions: Session[];
  defaultOpen: boolean;
  cohortStartDate: string;
  onEdit: (s: Session) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900">Week {weekNumber}</span>
          <span className="text-sm text-gray-400">{getWeekDateRange(cohortStartDate, weekNumber)}</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 divide-y divide-gray-100">
              {sessions.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-gray-400">No sessions this week</div>
              ) : (
                sessions.map(session => (
                  <div key={session.id} className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`mt-0.5 shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${SESSION_TYPE_COLORS[session.type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {SESSION_TYPES.find(t => t.value === session.type)?.label ?? session.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{session.title}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {fmtDate(session.session_date)}
                            {session.session_time ? ` · ${session.session_time}` : ''}
                          </span>
                          {session.duration_minutes && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.duration_minutes}m
                            </span>
                          )}
                          {session.facilitator_name && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {session.facilitator_name}
                              {session.facilitator_org ? `, ${session.facilitator_org}` : ''}
                            </span>
                          )}
                        </div>
                        {session.status === 'completed' && (session.recording_url || session.materials_url) && (
                          <div className="flex gap-3 mt-1.5">
                            {session.recording_url && (
                              <a href={session.recording_url} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                <Video className="w-3 h-3" /> Recording
                              </a>
                            )}
                            {session.materials_url && (
                              <a href={session.materials_url} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-green-700 hover:underline flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Materials
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={session.status}
                        onChange={e => onStatusChange(session.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 ${SESSION_STATUS_COLORS[session.status] ?? 'bg-gray-100 text-gray-500'}`}
                      >
                        {SESSION_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <button
                        onClick={() => onEdit(session)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ProgrammePage() {
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelSession, setPanelSession] = useState<Session | 'new' | null>(null);
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
          const sessRes = await fetch(`/api/admin/fellowship/catalyst-w/sessions?cohort_id=${active.id}`);
          const sessData = await sessRes.json();
          setSessions(Array.isArray(sessData) ? sessData : (sessData.sessions ?? []));
        }
      } catch (err: any) {
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [addToast]);

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/fellowship/catalyst-w/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setSessions(ss => ss.map(s => s.id === id ? { ...s, status: status as Session['status'] } : s));
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  }

  function handleSaved(saved: Session) {
    setSessions(ss => {
      const idx = ss.findIndex(s => s.id === saved.id);
      if (idx >= 0) {
        const next = [...ss];
        next[idx] = saved;
        return next;
      }
      return [...ss, saved];
    });
    setPanelSession(null);
  }

  // Group sessions by week
  const byWeek: Record<number, Session[]> = {};
  sessions.forEach(s => {
    if (!byWeek[s.week_number]) byWeek[s.week_number] = [];
    byWeek[s.week_number].push(s);
  });

  // Determine all weeks to show (at least 1 through total_weeks)
  const totalWeeks = cohort?.total_weeks ?? 1;
  const currentWeek = cohort ? getCurrentWeekNumber(cohort.start_date) : 1;
  const weekNumbers = Array.from(
    new Set([...Array.from({ length: totalWeeks }, (_, i) => i + 1), ...Object.keys(byWeek).map(Number)])
  ).sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0B2C24] text-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/fellowship/catalyst-w" className="flex items-center gap-1.5 text-green-300 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Applications
            </Link>
            <span className="text-green-700">|</span>
            <span className="text-sm text-gray-300">Programme Schedule</span>
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

      <div className="px-6 py-6 max-w-4xl mx-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-gray-900">Programme Schedule</h2>
            <p className="text-sm text-gray-500 mt-0.5">{sessions.length} sessions across {totalWeeks} weeks</p>
          </div>
          <button
            onClick={() => setPanelSession('new')}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Session
          </button>
        </div>

        {sessions.length === 0 && !loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">No sessions yet</p>
            <p className="text-sm text-gray-400 mt-1">Add sessions to build out the programme schedule.</p>
            <button
              onClick={() => setPanelSession('new')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add First Session
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {weekNumbers.map(wk => (
              <WeekSection
                key={wk}
                weekNumber={wk}
                sessions={byWeek[wk] ?? []}
                defaultOpen={wk === currentWeek}
                cohortStartDate={cohort?.start_date ?? new Date().toISOString().split('T')[0]}
                onEdit={s => setPanelSession(s)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Side panel */}
      <AnimatePresence>
        {panelSession !== null && cohort && (
          <>
            <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setPanelSession(null)} />
            <SessionFormPanel
              session={panelSession === 'new' ? null : panelSession}
              onClose={() => setPanelSession(null)}
              onSaved={handleSaved}
              cohortId={cohort.id}
              addToast={addToast}
            />
          </>
        )}
      </AnimatePresence>

      <ToastBar toasts={toasts} remove={removeToast} />
    </div>
  );
}
