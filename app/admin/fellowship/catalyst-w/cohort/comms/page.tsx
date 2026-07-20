'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mail, Send, CheckCircle, AlertCircle, X,
  Loader2, Users, ChevronDown, Clock, User, History,
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
  email: string;
  role: string;
  region: string;
  status: string;
}

interface CommRecord {
  id: string;
  cohort_id: string;
  subject: string;
  message: string;
  audience: string;
  audience_role?: string;
  audience_region?: string;
  recipient_count: number;
  sent_by?: string;
  created_at: string;
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

const AVATAR_COLORS = [
  'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500',
  'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-cyan-500',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
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

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CommsPage() {
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [history, setHistory] = useState<CommRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Compose state
  const [audienceType, setAudienceType] = useState<'all' | 'role' | 'region'>('all');
  const [audienceRole, setAudienceRole] = useState('');
  const [audienceRegion, setAudienceRegion] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
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
          const [frRes, histRes] = await Promise.all([
            fetch(`/api/admin/fellowship/catalyst-w/fellows?cohort_id=${active.id}`),
            fetch(`/api/admin/fellowship/catalyst-w/comms?cohort_id=${active.id}`),
          ]);
          const frData = await frRes.json();
          const histData = await histRes.json();
          setFellows(Array.isArray(frData) ? frData : (frData.fellows ?? []));
          setHistory(Array.isArray(histData) ? histData : (histData.records ?? histData.comms ?? []));
        }
      } catch (err: any) {
        toast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  // Compute recipients based on audience selection
  const activeFellows = fellows.filter(f => f.status === 'active');

  const recipients = activeFellows.filter(f => {
    if (audienceType === 'all') return true;
    if (audienceType === 'role') return audienceRole ? f.role === audienceRole : true;
    if (audienceType === 'region') return audienceRegion ? f.region === audienceRegion : true;
    return true;
  });

  async function sendMessage() {
    if (!cohort || !subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      const body: Record<string, any> = {
        cohort_id: cohort.id,
        subject,
        message,
        audience: audienceType,
      };
      if (audienceType === 'role' && audienceRole) body.audience_role = audienceRole;
      if (audienceType === 'region' && audienceRegion) body.audience_region = audienceRegion;

      const res = await fetch('/api/admin/fellowship/catalyst-w/comms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to send email');
      const data = await res.json();
      toast(`Email sent to ${recipients.length} fellows`);
      setSubject('');
      setMessage('');
      setAudienceType('all');
      setAudienceRole('');
      setAudienceRegion('');

      // Refresh history
      if (cohort) {
        const histRes = await fetch(`/api/admin/fellowship/catalyst-w/comms?cohort_id=${cohort.id}`);
        const histData = await histRes.json();
        setHistory(Array.isArray(histData) ? histData : (histData.records ?? histData.comms ?? []));
      }
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSending(false);
    }
  }

  function audienceDescription(record: CommRecord): string {
    if (record.audience === 'all') return 'All Operating Fellows';
    if (record.audience === 'role' && record.audience_role) return `Role: ${ROLE_LABELS[record.audience_role] ?? record.audience_role}`;
    if (record.audience === 'region' && record.audience_region) return `Region: ${REGION_LABELS[record.audience_region] ?? record.audience_region}`;
    return record.audience;
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
            <span className="text-sm text-gray-300">Communications</span>
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

      <div className="px-6 py-6 max-w-4xl mx-auto space-y-6">

        {/* Compose section */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Mail className="w-4 h-4 text-green-700" />
            <h2 className="font-semibold text-gray-900">Send Announcement</h2>
          </div>

          {/* Audience toggle */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Audience</label>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { setAudienceType('all'); setAudienceRole(''); setAudienceRegion(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  audienceType === 'all'
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                All Operating Fellows ({activeFellows.length})
              </button>
              <button
                onClick={() => setAudienceType('role')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  audienceType === 'role'
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                By Role
              </button>
              <button
                onClick={() => setAudienceType('region')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  audienceType === 'region'
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                By Region
              </button>
            </div>
          </div>

          <AnimatePresence>
            {audienceType === 'role' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <select
                  value={audienceRole}
                  onChange={e => setAudienceRole(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Roles</option>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </motion.div>
            )}
            {audienceType === 'region' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <select
                  value={audienceRegion}
                  onChange={e => setAudienceRegion(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Regions</option>
                  {Object.entries(REGION_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recipients preview */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3.5 h-3.5 text-green-700" />
              <span className="text-sm font-semibold text-green-800">
                Sending to {recipients.length} operating fellow{recipients.length !== 1 ? 's' : ''}
              </span>
            </div>
            {recipients.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {recipients.slice(0, 20).map(f => (
                  <span key={f.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-green-200 rounded-full text-xs text-gray-700">
                    <span className={`w-4 h-4 rounded-full ${avatarColor(f.full_name)} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                      {f.full_name.charAt(0).toUpperCase()}
                    </span>
                    {f.full_name.split(' ')[0]}
                  </span>
                ))}
                {recipients.length > 20 && (
                  <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500">
                    +{recipients.length - 20} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No operating fellows match this selection</p>
            )}
          </div>

          {/* Subject + message */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Week 3 Update & Resources"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
              <textarea
                rows={6}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your message here. It will be wrapped in the email template automatically."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={sending || !subject.trim() || !message.trim() || recipients.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending…' : `Send to ${recipients.length} operating fellow${recipients.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>

        {/* History section */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-green-700" />
            <h2 className="font-semibold text-gray-900">Sent Announcements</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{history.length}</span>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No announcements sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...history].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(record => (
                <div key={record.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{record.subject}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {fmtDateTime(record.created_at)}
                        </span>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {audienceDescription(record)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {record.recipient_count} recipient{record.recipient_count !== 1 ? 's' : ''}
                        </span>
                        {record.sent_by && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {record.sent_by}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ToastBar toasts={toasts} remove={removeToast} />
    </div>
  );
}
