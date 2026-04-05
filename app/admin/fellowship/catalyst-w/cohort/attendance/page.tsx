'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, AlertCircle, X, Loader2,
  ClipboardList, LayoutGrid, List, CheckSquare,
  Save, Users,
} from 'lucide-react';
import SubNav from '../SubNav';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Cohort {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  total_weeks: number;
}

interface Fellow {
  id: string;
  full_name: string;
  role: string;
  region: string;
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
  status: string;
}

interface AttendanceRecord {
  id?: string;
  session_id: string;
  fellow_id: string;
  status: 'present' | 'late' | 'excused' | 'absent';
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

const ATTENDANCE_STATUSES: Array<{ value: AttendanceRecord['status']; label: string; color: string }> = [
  { value: 'present', label: 'Present', color: 'text-green-700' },
  { value: 'late',    label: 'Late',    color: 'text-amber-600' },
  { value: 'excused', label: 'Excused', color: 'text-gray-500' },
  { value: 'absent',  label: 'Absent',  color: 'text-red-500' },
];

const CELL_DISPLAY: Record<string, { symbol: string; color: string }> = {
  present: { symbol: '✓', color: 'text-green-600 bg-green-50' },
  late:    { symbol: '◐', color: 'text-amber-600 bg-amber-50' },
  excused: { symbol: '~', color: 'text-gray-400 bg-gray-50' },
  absent:  { symbol: '–', color: 'text-gray-300 bg-white' },
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

function fmtShortDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
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

// ─── Session View ──────────────────────────────────────────────────────────────

function SessionView({
  sessions,
  fellows,
  attendance,
  onSave,
  addToast,
}: {
  sessions: Session[];
  fellows: Fellow[];
  attendance: AttendanceRecord[];
  onSave: (records: AttendanceRecord[]) => void;
  addToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id ?? '');
  const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceRecord['status']>>({});
  const [saving, setSaving] = useState(false);

  // Init local attendance from records when session changes
  useEffect(() => {
    if (!selectedSessionId) return;
    const init: Record<string, AttendanceRecord['status']> = {};
    fellows.forEach(f => {
      const rec = attendance.find(a => a.session_id === selectedSessionId && a.fellow_id === f.id);
      init[f.id] = rec?.status ?? 'absent';
    });
    setLocalAttendance(init);
  }, [selectedSessionId, attendance, fellows]);

  function setStatus(fellowId: string, status: AttendanceRecord['status']) {
    setLocalAttendance(prev => ({ ...prev, [fellowId]: status }));
  }

  function markAllPresent() {
    const all: Record<string, AttendanceRecord['status']> = {};
    fellows.forEach(f => { all[f.id] = 'present'; });
    setLocalAttendance(all);
  }

  async function saveAttendance() {
    setSaving(true);
    try {
      const records = fellows
        .filter(f => localAttendance[f.id] && localAttendance[f.id] !== 'absent')
        .map(f => ({ session_id: selectedSessionId, fellow_id: f.id, status: localAttendance[f.id] }));
      const res = await fetch('/api/admin/fellowship/catalyst-w/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: selectedSessionId, records }),
      });
      if (!res.ok) throw new Error('Failed to save attendance');
      const data = await res.json();
      onSave(data.records ?? records);
      addToast('Attendance saved');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  // Group sessions by week for the dropdown
  const grouped: Record<number, Session[]> = {};
  sessions.forEach(s => {
    if (!grouped[s.week_number]) grouped[s.week_number] = [];
    grouped[s.week_number].push(s);
  });

  const presentCount = Object.values(localAttendance).filter(s => s === 'present' || s === 'late').length;

  return (
    <div className="space-y-4">
      {/* Session selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Session</label>
        <select
          value={selectedSessionId}
          onChange={e => setSelectedSessionId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {sessions.length === 0 && <option value="">No sessions available</option>}
          {Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([wk, wkSessions]) => (
              <optgroup key={wk} label={`Week ${wk}`}>
                {wkSessions.map(s => (
                  <option key={s.id} value={s.id}>
                    Wk{wk} · {s.type.replace(/_/g, ' ')} · {s.title} · {fmtShortDate(s.session_date)}
                  </option>
                ))}
              </optgroup>
            ))}
        </select>
      </div>

      {selectedSessionId && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-4 h-4 text-green-700" />
              <span className="font-medium text-gray-900">Attendance Register</span>
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-green-700">{presentCount}</span> / {fellows.length} marked present
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllPresent}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Mark All Present
              </button>
              <button
                onClick={saveAttendance}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Attendance
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {fellows.map(fellow => {
              const currentStatus = localAttendance[fellow.id] ?? 'absent';
              return (
                <div key={fellow.id} className="flex items-center gap-4 px-5 py-3">
                  <div className={`w-8 h-8 rounded-full ${avatarColor(fellow.full_name)} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                    {fellow.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{fellow.full_name}</p>
                    <p className="text-xs text-gray-400">
                      {ROLE_LABELS[fellow.role] ?? fellow.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {ATTENDANCE_STATUSES.map(opt => (
                      <label key={opt.value} className="flex items-center gap-1 cursor-pointer group">
                        <input
                          type="radio"
                          name={`attendance-${fellow.id}`}
                          value={opt.value}
                          checked={currentStatus === opt.value}
                          onChange={() => setStatus(fellow.id, opt.value)}
                          className="sr-only"
                        />
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          currentStatus === opt.value
                            ? opt.value === 'present' ? 'bg-green-100 border-green-400 text-green-700'
                            : opt.value === 'late' ? 'bg-amber-100 border-amber-400 text-amber-700'
                            : opt.value === 'excused' ? 'bg-gray-100 border-gray-400 text-gray-600'
                            : 'bg-red-50 border-red-300 text-red-500'
                            : 'bg-white border-gray-200 text-gray-400 hover:border-gray-400'
                        }`}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Matrix View ───────────────────────────────────────────────────────────────

function MatrixView({
  sessions,
  fellows,
  attendance,
}: {
  sessions: Session[];
  fellows: Fellow[];
  attendance: AttendanceRecord[];
}) {
  // Build a lookup: [fellowId][sessionId] → status
  const lookup: Record<string, Record<string, AttendanceRecord['status']>> = {};
  attendance.forEach(a => {
    if (!lookup[a.fellow_id]) lookup[a.fellow_id] = {};
    lookup[a.fellow_id][a.session_id] = a.status;
  });

  // Session short labels: "W1·S1"
  const sessionLabels: Record<string, string> = {};
  const weekSessionCount: Record<number, number> = {};
  sessions.forEach(s => {
    weekSessionCount[s.week_number] = (weekSessionCount[s.week_number] ?? 0) + 1;
    sessionLabels[s.id] = `W${s.week_number}·S${weekSessionCount[s.week_number]}`;
  });

  // Attendance rates per fellow
  function fellowRate(fellowId: string): number {
    if (sessions.length === 0) return 0;
    const attended = sessions.filter(s => {
      const st = lookup[fellowId]?.[s.id];
      return st === 'present' || st === 'late';
    }).length;
    return Math.round((attended / sessions.length) * 100);
  }

  // Session totals
  function sessionTotal(sessionId: string): string {
    const count = fellows.filter(f => {
      const st = lookup[f.id]?.[sessionId];
      return st === 'present' || st === 'late';
    }).length;
    return `${count}/${fellows.length}`;
  }

  if (sessions.length === 0 || fellows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <LayoutGrid className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm text-gray-400">No data to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="text-xs w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-600 min-w-[180px] whitespace-nowrap">
                Fellow
              </th>
              {sessions.map(s => (
                <th key={s.id} className="px-2 py-3 font-semibold text-gray-500 whitespace-nowrap min-w-[52px] text-center"
                  title={`${s.title} · ${fmtShortDate(s.session_date)}`}>
                  {sessionLabels[s.id]}
                </th>
              ))}
              <th className="px-3 py-3 font-semibold text-gray-600 whitespace-nowrap text-right min-w-[56px]">Rate %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fellows.map(fellow => {
              const rate = fellowRate(fellow.id);
              return (
                <tr key={fellow.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white hover:bg-gray-50 px-4 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${avatarColor(fellow.full_name)} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                        {fellow.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-xs">{fellow.full_name}</p>
                        <p className="text-gray-400 text-[10px]">{ROLE_LABELS[fellow.role] ?? fellow.role}</p>
                      </div>
                    </div>
                  </td>
                  {sessions.map(s => {
                    const st = lookup[fellow.id]?.[s.id] ?? 'absent';
                    const display = CELL_DISPLAY[st] ?? CELL_DISPLAY.absent;
                    return (
                      <td key={s.id} className="text-center py-2.5">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${display.color}`}>
                          {display.symbol}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-semibold ${
                      rate >= 70 ? 'text-green-700' : rate >= 50 ? 'text-amber-600' : 'text-red-500'
                    }`}>{rate}%</span>
                  </td>
                </tr>
              );
            })}

            {/* Totals row */}
            <tr className="bg-gray-50 font-semibold">
              <td className="sticky left-0 bg-gray-50 px-4 py-2.5 text-gray-600 text-xs">Session Totals</td>
              {sessions.map(s => (
                <td key={s.id} className="text-center py-2.5 text-xs text-gray-600">{sessionTotal(s.id)}</td>
              ))}
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
        <span className="font-medium text-gray-600">Legend:</span>
        {Object.entries(CELL_DISPLAY).map(([key, v]) => (
          <span key={key} className="flex items-center gap-1">
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${v.color}`}>{v.symbol}</span>
            <span className="capitalize">{key}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'session' | 'matrix'>('session');
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
          const [sessRes, frRes, attRes] = await Promise.all([
            fetch(`/api/admin/fellowship/catalyst-w/sessions?cohort_id=${active.id}`),
            fetch(`/api/admin/fellowship/catalyst-w/fellows?cohort_id=${active.id}&status=active`),
            fetch(`/api/admin/fellowship/catalyst-w/attendance?cohort_id=${active.id}`),
          ]);
          const sessData = await sessRes.json();
          const frData = await frRes.json();
          const attData = await attRes.json();
          setSessions(Array.isArray(sessData) ? sessData : (sessData.sessions ?? []));
          setFellows(Array.isArray(frData) ? frData : (frData.fellows ?? []));
          setAttendance(Array.isArray(attData) ? attData : (attData.records ?? attData.attendance ?? []));
        }
      } catch (err: any) {
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [addToast]);

  function handleSave(records: AttendanceRecord[]) {
    setAttendance(prev => {
      const sessionId = records[0]?.session_id;
      if (!sessionId) return prev;
      const filtered = prev.filter(a => a.session_id !== sessionId);
      return [...filtered, ...records];
    });
  }

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
            <span className="text-sm text-gray-300">Attendance</span>
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

      <div className="px-6 py-6 max-w-6xl mx-auto">
        {/* View toggle */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-gray-900">Attendance Management</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {attendance.filter(a => a.status === 'present').length} present records across {sessions.length} sessions
            </p>
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('session')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'session' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Session View
            </button>
            <button
              onClick={() => setView('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'matrix' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Matrix View
            </button>
          </div>
        </div>

        {view === 'session' ? (
          <SessionView
            sessions={sessions}
            fellows={fellows}
            attendance={attendance}
            onSave={handleSave}
            addToast={addToast}
          />
        ) : (
          <MatrixView
            sessions={sessions}
            fellows={fellows}
            attendance={attendance}
          />
        )}
      </div>

      <ToastBar toasts={toasts} remove={removeToast} />
    </div>
  );
}
