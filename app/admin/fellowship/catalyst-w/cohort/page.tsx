'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, CalendarDays, BarChart3, CheckCircle,
  Clock, AlertCircle, X, Calendar, Plus, ChevronRight,
  Edit2, ClipboardList, TrendingUp, Loader2,
} from 'lucide-react';
import SubNav from './SubNav';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Cohort {
  id: string;
  name: string;
  cohort_number?: number;
  year?: number;
  status: 'active' | 'completed' | 'upcoming';
  start_date: string;
  end_date: string;
  total_weeks: number;
}

interface Fellow {
  id: string;
  full_name: string;
  role: string;
  region: string;
  country?: string;
  status: string;
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
  facilitator_name?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
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
  scheduled:  'bg-blue-50 text-blue-600',
  live:       'bg-green-100 text-green-700',
  completed:  'bg-gray-100 text-gray-600',
  cancelled:  'bg-red-50 text-red-500',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtShortDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getWeeksElapsed(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
}

function getCurrentWeekNumber(startDate: string): number {
  return getWeeksElapsed(startDate);
}

function getWeekDateRange(startDate: string, weekNumber: number): string {
  const start = new Date(startDate);
  const weekStart = new Date(start.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  return `${fmtShortDate(weekStart.toISOString())} – ${fmtShortDate(weekEnd.toISOString())}`;
}

function toTitleCase(str: string) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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

// ─── Create Cohort Form ────────────────────────────────────────────────────────

function CreateCohortForm({ onCreated }: { onCreated: (c: Cohort, sessions?: Session[]) => void }) {
  const [form, setForm] = useState({
    name: 'AgriPro Catalyst W · Cohort 2026',
    cohort_number: 2026,
    start_date: '2026-09-01',
    end_date: '2026-11-23',
    total_weeks: 12,
    description: 'A 12-week, action-oriented accelerator for 40 women agribusiness owners.',
    seed_programme: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/fellowship/catalyst-w/cohort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'active' }),
      });
      if (!res.ok) throw new Error('Failed to create cohort');
      const data = await res.json();
      onCreated(data.cohort ?? data, data.sessions ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Set Up Your Cohort</h2>
            <p className="text-sm text-gray-500">No active accelerator cohort found. Create one to get started.</p>
          </div>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cohort Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Cohort 2 · 2025"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cohort Number</label>
            <input
              type="number"
              required
              min={1}
              value={form.cohort_number}
              onChange={e => setForm(f => ({ ...f, cohort_number: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Weeks</label>
            <input
              type="number"
              required
              min={1}
              max={52}
              value={form.total_weeks}
              onChange={e => setForm(f => ({ ...f, total_weeks: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
          <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.seed_programme}
              onChange={e => setForm(f => ({ ...f, seed_programme: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-500"
            />
            <span>
              <span className="font-medium text-gray-900">Create starter programme</span>
              <span className="block text-xs text-gray-500">Adds the 12-week schedule from Diagnose through Summit readiness.</span>
            </span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? 'Creating…' : 'Create Cohort'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CohortOverview() {
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
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
        if (!res.ok) throw new Error('Failed to fetch cohorts');
        const data = await res.json();
        const cohorts: Cohort[] = Array.isArray(data) ? data : (data.cohorts ?? []);
        const active = cohorts.find(c => c.status === 'active') ?? cohorts[0] ?? null;
        setCohort(active);

        if (active) {
          const [frRes, sessRes] = await Promise.all([
            fetch(`/api/admin/fellowship/catalyst-w/fellows?cohort_id=${active.id}`),
            fetch(`/api/admin/fellowship/catalyst-w/sessions?cohort_id=${active.id}`),
          ]);
          const frData = await frRes.json();
          const sessData = await sessRes.json();
          setFellows(Array.isArray(frData) ? frData : (frData.fellows ?? []));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
      </div>
    );
  }

  if (!cohort) {
    return <CreateCohortForm onCreated={(c, seededSessions) => {
      setCohort(c);
      if (seededSessions) setSessions(seededSessions);
    }} />;
  }

  const weeksElapsed = Math.min(getWeeksElapsed(cohort.start_date), cohort.total_weeks);
  const currentWeek = getCurrentWeekNumber(cohort.start_date);
  const progressPct = Math.min(Math.round((weeksElapsed / cohort.total_weeks) * 100), 100);
  const weeksLeft = Math.max(cohort.total_weeks - weeksElapsed, 0);

  const activeFellows = fellows.filter(f => f.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const thisWeekSessions = sessions.filter(s => s.week_number === currentWeek);

  // Attendance rate: use a simple placeholder since we don't fetch attendance here
  const avgAttendance = '--';

  // Breakdowns
  const roleCounts: Record<string, number> = {};
  const regionCounts: Record<string, number> = {};
  fellows.forEach(f => {
    roleCounts[f.role] = (roleCounts[f.role] ?? 0) + 1;
    regionCounts[f.region] = (regionCounts[f.region] ?? 0) + 1;
  });

  const stats = [
    { label: 'Fellows Team', value: fellows.length, border: 'border-l-green-500', text: 'text-green-700' },
    { label: 'Active Fellows', value: activeFellows.length, border: 'border-l-blue-500', text: 'text-blue-700' },
    { label: 'Sessions Done', value: completedSessions.length, border: 'border-l-purple-500', text: 'text-purple-700' },
    { label: 'Avg Attendance', value: avgAttendance, border: 'border-l-amber-500', text: 'text-amber-700' },
    { label: 'Weeks Completed', value: weeksElapsed, border: 'border-l-teal-500', text: 'text-teal-700' },
    { label: 'Weeks Left',    value: weeksLeft, border: 'border-l-gray-400', text: 'text-gray-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0B2C24] text-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/fellowship/catalyst-w"
              className="flex items-center gap-1.5 text-green-300 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Applications
            </Link>
            <span className="text-green-700">|</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">
                {cohort.cohort_number ? `Cohort ${cohort.cohort_number}` : 'Cohort'} · Catalyst W Accelerator
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white">{cohort.name}</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-700 text-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
              Active
            </span>
          </div>
        </div>
      </header>

      {/* Sub-nav */}
      <SubNav />

      <div className="px-6 py-6 max-w-6xl mx-auto space-y-6">

        {/* Progress card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-900">{cohort.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {fmtDate(cohort.start_date)} → {fmtDate(cohort.end_date)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-green-700">Week {currentWeek} of {cohort.total_weeks}</p>
              <p className="text-xs text-gray-400 mt-0.5">{progressPct}% complete</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-gray-400">
            <span>Start</span>
            <span>End</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map(s => (
            <div
              key={s.label}
              className={`bg-white rounded-xl border border-gray-200 border-l-4 ${s.border} p-4`}
            >
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* This Week */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-700" />
              <h3 className="font-semibold text-gray-900">
                This Week
                {cohort.start_date && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    {getWeekDateRange(cohort.start_date, currentWeek)}
                  </span>
                )}
              </h3>
            </div>
            <Link
              href="/admin/fellowship/catalyst-w/cohort/programme"
              className="text-sm text-green-700 hover:text-green-800 flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {thisWeekSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No sessions scheduled this week.</p>
              <Link
                href="/admin/fellowship/catalyst-w/cohort/programme"
                className="text-sm text-green-700 hover:underline mt-1 inline-block"
              >
                Add one →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {thisWeekSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SESSION_TYPE_COLORS[session.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {toTitleCase(session.type)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.title}</p>
                      <p className="text-xs text-gray-400">
                        {fmtShortDate(session.session_date)}
                        {session.session_time ? ` · ${session.session_time}` : ''}
                        {session.facilitator_name ? ` · ${session.facilitator_name}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SESSION_STATUS_COLORS[session.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {toTitleCase(session.status)}
                    </span>
                    <Link
                      href="/admin/fellowship/catalyst-w/cohort/programme"
                      className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/admin/fellowship/catalyst-w/cohort/attendance"
                      className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Attendance"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Breakdowns row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-green-700" />
              <h3 className="font-semibold text-gray-900">Fellows Team by Role</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ROLE_LABELS).map(([key, label]) => {
                const count = roleCounts[key] ?? 0;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm"
                  >
                    <span className="font-medium text-gray-900">{label}</span>
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">{count}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Region breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-green-700" />
              <h3 className="font-semibold text-gray-900">Fellows Team by Region</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(REGION_LABELS).map(([key, label]) => {
                const count = regionCounts[key] ?? 0;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm"
                  >
                    <span className="font-medium text-gray-900">{label}</span>
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">{count}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ToastBar toasts={toasts} remove={removeToast} />
    </div>
  );
}
