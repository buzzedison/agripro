'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle,
  Download,
  Loader2,
  Mail,
  Search,
  Target,
  Users,
  X,
} from 'lucide-react';
import SubNav from '../SubNav';

type ParticipantStatus = 'applicant' | 'selected' | 'onboarding' | 'active' | 'deferred' | 'alumni' | 'dropped';
type SupportPriority = 'low' | 'medium' | 'high' | 'critical';
type ReadinessStage = 'diagnosis' | 'data_room' | 'partner_matching' | 'deal_room' | 'summit_ready' | 'closed';

interface Participant {
  id: string;
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
  admin_notes?: string;
  created_at: string;
  cohort_year?: number;
  participant_status?: ParticipantStatus;
  accelerator_track?: string;
  primary_constraint?: string;
  support_needed?: string;
  support_priority?: SupportPriority;
  partner_needs?: string[];
  assigned_fellow_id?: string;
  readiness_stage?: ReadinessStage;
  diagnostic_notes?: string;
  partner_match_notes?: string;
  next_action?: string;
  next_action_due?: string;
  selected_at?: string;
}

interface Fellow {
  id: string;
  full_name: string;
  email: string;
  role_in_agripro?: string;
  country?: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const PARTICIPANT_STATUS: Record<string, { label: string; color: string }> = {
  applicant: { label: 'Applicant', color: 'bg-gray-100 text-gray-700' },
  selected: { label: 'Selected', color: 'bg-green-100 text-green-700' },
  onboarding: { label: 'Onboarding', color: 'bg-blue-100 text-blue-700' },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  deferred: { label: 'Deferred', color: 'bg-amber-100 text-amber-700' },
  alumni: { label: 'Alumni', color: 'bg-purple-100 text-purple-700' },
  dropped: { label: 'Dropped', color: 'bg-red-100 text-red-600' },
};

const COHORT_PARTICIPANT_STATUSES = ['selected', 'onboarding', 'active', 'deferred', 'alumni', 'dropped'] as const;

const SUPPORT_PRIORITY: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-700' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700' },
};

const READINESS_STAGES = [
  ['diagnosis', 'Diagnosis'],
  ['data_room', 'Data room'],
  ['partner_matching', 'Partner matching'],
  ['deal_room', 'Deal room'],
  ['summit_ready', 'Summit ready'],
  ['closed', 'Closed'],
] as const;

const TRACKS = [
  'Farm Tech',
  'Value Addition',
  'Market Infrastructure',
  'Agri-Fintech',
  'Climate-Smart Agriculture',
  'Other',
];

const PARTNER_NEEDS = [
  'Investor',
  'Offtake buyer',
  'Logistics provider',
  'Equipment supplier',
  'Technical advisor',
  'Policy / compliance',
  'Data room support',
  'Summit showcase',
];

function defaultParticipantStatus(p: Participant): ParticipantStatus {
  if (p.participant_status && p.participant_status !== 'applicant') return p.participant_status;
  if (p.status === 'accepted') return 'selected';
  if (p.status === 'waitlisted') return 'deferred';
  return 'applicant';
}

function defaultPriority(p: Participant): SupportPriority {
  return p.support_priority ?? 'medium';
}

function defaultReadiness(p: Participant): ReadinessStage {
  return p.readiness_stage ?? 'diagnosis';
}

function assignedFellowName(participant: Participant, fellows: Fellow[]) {
  return fellows.find(f => f.id === participant.assigned_fellow_id)?.full_name ?? 'Unassigned';
}

function exportCSV(participants: Participant[], fellows: Fellow[]) {
  const headers = [
    'Name', 'Email', 'Country', 'Business', 'Stage', 'Sector', 'Participant Status',
    'Track', 'Constraint', 'Support Needed', 'Priority', 'Partner Needs', 'Assigned Fellow', 'Next Action', 'Due',
  ];
  const rows = participants.map(p => [
    p.full_name,
    p.email,
    p.country ?? '',
    p.business_name ?? '',
    p.business_stage ?? '',
    p.sector ?? '',
    defaultParticipantStatus(p),
    p.accelerator_track ?? '',
    p.primary_constraint ?? '',
    p.support_needed ?? '',
    defaultPriority(p),
    (p.partner_needs ?? []).join('; '),
    assignedFellowName(p, fellows),
    p.next_action ?? '',
    p.next_action_due ?? '',
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `catalyst-w-participants-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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
            {t.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
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

function ParticipantPanel({
  participant,
  fellows,
  onClose,
  onPatch,
}: {
  participant: Participant;
  fellows: Fellow[];
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Participant>) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Partial<Participant>>({
    participant_status: defaultParticipantStatus(participant),
    accelerator_track: participant.accelerator_track ?? '',
    primary_constraint: participant.primary_constraint ?? '',
    support_needed: participant.support_needed ?? '',
    support_priority: defaultPriority(participant),
    partner_needs: participant.partner_needs ?? [],
    assigned_fellow_id: participant.assigned_fellow_id ?? '',
    readiness_stage: defaultReadiness(participant),
    diagnostic_notes: participant.diagnostic_notes ?? '',
    partner_match_notes: participant.partner_match_notes ?? '',
    next_action: participant.next_action ?? '',
    next_action_due: participant.next_action_due ?? '',
    admin_notes: participant.admin_notes ?? '',
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Participant>(key: K, value: Participant[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  function togglePartnerNeed(value: string) {
    const current = draft.partner_needs ?? [];
    set('partner_needs', current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
  }

  async function save() {
    setSaving(true);
    try {
      await onPatch(participant.id, {
        ...draft,
        assigned_fellow_id: draft.assigned_fellow_id || null as any,
        selected_at: draft.participant_status === 'selected' && !participant.selected_at ? new Date().toISOString() : participant.selected_at,
      });
      onClose();
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
      className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-2xl z-40 flex flex-col"
    >
      <div className="flex items-center justify-between p-5 border-b border-gray-200">
        <div>
          <h2 className="font-semibold text-gray-900">{participant.full_name}</h2>
          <p className="text-xs text-gray-500">{participant.business_name ?? 'Business not provided'} · {participant.country ?? 'Country not set'}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="block text-xs font-medium text-gray-600">Participant Status</span>
            <select value={draft.participant_status} onChange={e => set('participant_status', e.target.value as ParticipantStatus)} className="w-full px-3 py-2 border rounded-lg text-sm">
              {COHORT_PARTICIPANT_STATUSES.map(key => <option key={key} value={key}>{PARTICIPANT_STATUS[key].label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-medium text-gray-600">Readiness Stage</span>
            <select value={draft.readiness_stage} onChange={e => set('readiness_stage', e.target.value as ReadinessStage)} className="w-full px-3 py-2 border rounded-lg text-sm">
              {READINESS_STAGES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="block text-xs font-medium text-gray-600">Accelerator Track</span>
            <select value={draft.accelerator_track} onChange={e => set('accelerator_track', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">Not set</option>
              {TRACKS.map(track => <option key={track} value={track}>{track}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-medium text-gray-600">Support Priority</span>
            <select value={draft.support_priority} onChange={e => set('support_priority', e.target.value as SupportPriority)} className="w-full px-3 py-2 border rounded-lg text-sm">
              {Object.entries(SUPPORT_PRIORITY).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
            </select>
          </label>
        </div>

        <label className="block space-y-1">
          <span className="block text-xs font-medium text-gray-600">Assigned Fellow</span>
          <select value={draft.assigned_fellow_id} onChange={e => set('assigned_fellow_id', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">Unassigned</option>
            {fellows.map(fellow => (
              <option key={fellow.id} value={fellow.id}>{fellow.full_name} · {fellow.role_in_agripro ?? 'Fellow'}</option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="block text-xs font-medium text-gray-600">Primary Constraint</span>
          <textarea value={draft.primary_constraint} onChange={e => set('primary_constraint', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="What is the main business bottleneck to break?" />
        </label>

        <label className="block space-y-1">
          <span className="block text-xs font-medium text-gray-600">Support Needed</span>
          <textarea value={draft.support_needed} onChange={e => set('support_needed', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="What support is required to solve it?" />
        </label>

        <div>
          <span className="block text-xs font-medium text-gray-600 mb-2">Partner Needs</span>
          <div className="flex flex-wrap gap-2">
            {PARTNER_NEEDS.map(need => {
              const active = (draft.partner_needs ?? []).includes(need);
              return (
                <button
                  key={need}
                  type="button"
                  onClick={() => togglePartnerNeed(need)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${active ? 'bg-green-700 border-green-700 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  {need}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block space-y-1">
          <span className="block text-xs font-medium text-gray-600">Diagnostic Notes</span>
          <textarea value={draft.diagnostic_notes} onChange={e => set('diagnostic_notes', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
        </label>

        <label className="block space-y-1">
          <span className="block text-xs font-medium text-gray-600">Partner Match Notes</span>
          <textarea value={draft.partner_match_notes} onChange={e => set('partner_match_notes', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
        </label>

        <div className="grid grid-cols-[1fr_150px] gap-3">
          <label className="space-y-1">
            <span className="block text-xs font-medium text-gray-600">Next Action</span>
            <input value={draft.next_action ?? ''} onChange={e => set('next_action', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Introduce to buyer" />
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-medium text-gray-600">Due</span>
            <input type="date" value={draft.next_action_due ?? ''} onChange={e => set('next_action_due', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="block text-xs font-medium text-gray-600">Admin Notes</span>
          <textarea value={draft.admin_notes} onChange={e => set('admin_notes', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
        </label>
      </div>

      <div className="p-5 border-t border-gray-200 flex gap-3">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
        <button onClick={save} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Save
        </button>
      </div>
    </motion.div>
  );
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [selected, setSelected] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [track, setTrack] = useState('all');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fellowship/catalyst-w/participants');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load participants');
      setParticipants(data.participants ?? []);
      setFellows(data.fellows ?? []);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateParticipant(id: string, patch: Partial<Participant>) {
    const res = await fetch('/api/admin/fellowship/catalyst-w/participants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.details || data.error || 'Failed to update participant');
    setParticipants(ps => ps.map(p => p.id === id ? data : p));
    addToast('Participant updated');
  }

  const filtered = participants.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.business_name ?? '').toLowerCase().includes(q) ||
      (p.country ?? '').toLowerCase().includes(q);
    const matchStatus = status === 'all' || defaultParticipantStatus(p) === status;
    const matchPriority = priority === 'all' || defaultPriority(p) === priority;
    const matchTrack = track === 'all' || p.accelerator_track === track;
    return matchSearch && matchStatus && matchPriority && matchTrack;
  });

  const stats = useMemo(() => {
    const selectedCount = participants.filter(p => ['selected', 'onboarding', 'active'].includes(defaultParticipantStatus(p))).length;
    const criticalCount = participants.filter(p => defaultPriority(p) === 'critical').length;
    const assignedCount = participants.filter(p => p.assigned_fellow_id).length;
    return { selectedCount, criticalCount, assignedCount };
  }, [participants]);

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
            <span className="text-sm text-gray-300">Accelerator Participants</span>
          </div>
          <span className="text-sm font-medium">Accepted 40-founder cohort roster</span>
        </div>
      </header>

      <SubNav />

      <div className="px-6 py-6 max-w-7xl mx-auto space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
            <p className="text-xs text-gray-500">Accepted participants</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-700">{stats.selectedCount}</p>
            <p className="text-xs text-gray-500">Onboarding / Active</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-amber-700">{stats.assignedCount}</p>
            <p className="text-xs text-gray-500">Assigned to fellows</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-600">{stats.criticalCount}</p>
            <p className="text-xs text-gray-500">Critical support</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search founder, business, country..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">All participant statuses</option>
              {COHORT_PARTICIPANT_STATUSES.map(key => <option key={key} value={key}>{PARTICIPANT_STATUS[key].label}</option>)}
            </select>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">All priorities</option>
              {Object.entries(SUPPORT_PRIORITY).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
            </select>
            <select value={track} onChange={e => setTrack(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">All tracks</option>
              {TRACKS.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <button onClick={() => exportCSV(filtered, fellows)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-gray-500">No accepted participants match this view</p>
                <p className="text-sm mt-1">Accept founders from the applications view to add them to this cohort roster.</p>
              </div>
            ) : filtered.map(participant => {
              const participantCfg = PARTICIPANT_STATUS[defaultParticipantStatus(participant)];
              const priorityCfg = SUPPORT_PRIORITY[defaultPriority(participant)];
              return (
                <button key={participant.id} onClick={() => setSelected(participant)} className="w-full text-left p-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-4 items-start">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{participant.full_name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${participantCfg.color}`}>{participantCfg.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{participant.email} · {participant.country ?? 'Country not set'}</p>
                      <p className="text-sm text-gray-700 mt-2">{participant.business_name ?? 'Business not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><BriefcaseBusiness className="w-3 h-3" /> Venture</p>
                      <p className="text-sm text-gray-700 mt-1">{participant.sector ?? 'Sector not set'}</p>
                      <p className="text-xs text-gray-500">{participant.business_stage ?? 'Stage not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Target className="w-3 h-3" /> Constraint</p>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">{participant.primary_constraint || participant.why_apply || 'Not diagnosed yet'}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${priorityCfg.color}`}>{priorityCfg.label}</span>
                      <p className="text-xs text-gray-500">{assignedFellowName(participant, fellows)}</p>
                      {participant.next_action_due && (
                        <p className="text-xs text-gray-400 flex items-center justify-end gap-1"><CalendarClock className="w-3 h-3" /> {participant.next_action_due}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setSelected(null)} />
            <ParticipantPanel
              participant={selected}
              fellows={fellows}
              onClose={() => setSelected(null)}
              onPatch={updateParticipant}
            />
          </>
        )}
      </AnimatePresence>

      <ToastBar toasts={toasts} remove={removeToast} />
    </div>
  );
}
