'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Download,
  ExternalLink,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Search,
  Users,
  X,
} from 'lucide-react';
import SubNav from '../SubNav';

interface Cohort {
  id: string;
  name: string;
  cohort_number?: number;
  status: string;
}

interface Fellow {
  id: string;
  slug: string;
  full_name: string;
  email: string;
  country?: string;
  city?: string;
  role: string;
  linkedin_url?: string;
  status: 'active' | 'alumni' | 'inactive';
  admin_notes?: string;
  is_public?: boolean;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const FELLOW_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  alumni: { label: 'Alumni', color: 'bg-blue-100 text-blue-700' },
  inactive: { label: 'Inactive', color: 'bg-gray-200 text-gray-600' },
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

function mapCatalystFellow(row: any): Fellow {
  return {
    id: row.id,
    slug: row.slug,
    full_name: row.full_name,
    email: row.email,
    country: row.country ?? undefined,
    city: row.city ?? undefined,
    role: row.role_in_agripro ?? (row.designation === 'director' ? 'Fellowship Director' : row.designation === 'deputy_director' ? 'Deputy Fellowship Director' : 'Fellow'),
    linkedin_url: row.linkedin_url ?? undefined,
    status: row.status ?? 'active',
    admin_notes: row.admin_notes ?? undefined,
    is_public: row.is_public ?? false,
  };
}

function locationLabel(fellow: Fellow) {
  return [fellow.city, fellow.country].filter(Boolean).join(', ') || 'Location not set';
}

function exportFellowsCSV(fellows: Fellow[]) {
  const headers = ['ID', 'Full Name', 'Email', 'Country', 'City', 'Role', 'Status', 'Public', 'LinkedIn'];
  const rows = fellows.map(f => [
    f.id,
    f.full_name,
    f.email,
    f.country ?? '',
    f.city ?? '',
    f.role,
    f.status,
    f.is_public ? 'yes' : 'no',
    f.linkedin_url ?? '',
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `catalyst-fellows-${new Date().toISOString().split('T')[0]}.csv`;
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

function FellowPanel({
  fellow,
  onClose,
  onPatch,
  addToast,
}: {
  fellow: Fellow;
  onClose: () => void;
  onPatch: (id: string, patch: Pick<Partial<Fellow>, 'status' | 'admin_notes'>) => Promise<void>;
  addToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [notes, setNotes] = useState(fellow.admin_notes ?? '');
  const [status, setStatus] = useState(fellow.status);
  const [savingStatus, setSavingStatus] = useState(false);

  async function saveStatus(newStatus: Fellow['status']) {
    setSavingStatus(true);
    try {
      await onPatch(fellow.id, { status: newStatus });
      addToast('Status updated');
    } catch (err: any) {
      addToast(err.message, 'error');
      setStatus(fellow.status);
    } finally {
      setSavingStatus(false);
    }
  }

  async function saveNotes() {
    try {
      await onPatch(fellow.id, { admin_notes: notes });
      addToast('Notes saved');
    } catch (err: any) {
      addToast(err.message || 'Failed to save notes', 'error');
    }
  }

  const statusCfg = FELLOW_STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-40 flex flex-col overflow-y-auto"
    >
      <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${avatarColor(fellow.full_name)} flex items-center justify-center text-white font-semibold text-sm`}>
            {fellow.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{fellow.full_name}</h2>
            <p className="text-xs text-gray-500">{fellow.role}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Status</label>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={e => {
                const next = e.target.value as Fellow['status'];
                setStatus(next);
                saveStatus(next);
              }}
              disabled={savingStatus}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Active</option>
              <option value="alumni">Alumni</option>
              <option value="inactive">Inactive</option>
            </select>
            {savingStatus && <Loader2 className="w-4 h-4 text-green-600 animate-spin" />}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Contact</label>
          <div className="space-y-2">
            <a href={`mailto:${fellow.email}`} className="flex items-center gap-2 text-sm text-green-700 hover:underline">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {fellow.email}
            </a>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {locationLabel(fellow)}
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

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Admin Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={4}
            placeholder="Add internal notes about this fellow..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <Link
            href={`/fellowship/fellows/${fellow.slug}`}
            target="_blank"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-green-600 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
          >
            Public Profile
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <a
            href={`mailto:${fellow.email}`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function FellowsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Fellow | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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
      const [cohortRes, fellowsResult] = await Promise.all([
        fetch('/api/admin/fellowship/catalyst-w/cohort'),
        supabase
          .from('catalyst_fellows')
          .select('*')
          .order('designation', { ascending: false })
          .order('full_name', { ascending: true }),
      ]);

      if (cohortRes.ok) {
        const data = await cohortRes.json();
        const cohorts: Cohort[] = Array.isArray(data) ? data : (data.cohorts ?? []);
        setCohort(cohorts.find(c => c.status === 'active') ?? cohorts[0] ?? null);
      }

      if (fellowsResult.error) throw new Error(fellowsResult.error.message);
      setFellows((fellowsResult.data ?? []).map(mapCatalystFellow));
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateFellow(id: string, patch: Pick<Partial<Fellow>, 'status' | 'admin_notes'>) {
    const { data, error } = await supabase
      .from('catalyst_fellows')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    const updated = mapCatalystFellow(data);
    setFellows(fs => fs.map(f => f.id === id ? updated : f));
    setSelected(prev => prev?.id === id ? updated : prev);
  }

  const roleOptions = useMemo(
    () => Array.from(new Set(fellows.map(f => f.role).filter(Boolean))).sort(),
    [fellows],
  );

  const countryOptions = useMemo(
    () => Array.from(new Set(fellows.map(f => f.country).filter(Boolean) as string[])).sort(),
    [fellows],
  );

  const filtered = fellows.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.full_name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q);
    const matchRole = filterRole === 'all' || f.role === filterRole;
    const matchCountry = filterCountry === 'all' || f.country === filterCountry;
    const matchStatus = filterStatus === 'all' || f.status === filterStatus;
    return matchSearch && matchRole && matchCountry && matchStatus;
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
      <header className="bg-[#0B2C24] text-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/fellowship/catalyst-w" className="flex items-center gap-1.5 text-green-300 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Applications
            </Link>
            <span className="text-green-700">|</span>
            <span className="text-sm text-gray-300">Fellows Team</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{cohort?.name ?? 'Catalyst W Accelerator'}</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-700 text-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
              Existing roster
            </span>
          </div>
        </div>
      </header>

      <SubNav />

      <div className="flex h-[calc(100vh-113px)]">
        <div className={`flex flex-col ${selected ? 'w-[calc(100%-440px)]' : 'w-full'} transition-all duration-300`}>
          <div className="px-6 py-4 bg-white border-b border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-700" />
                <span className="font-semibold text-gray-900">Operating Fellows</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{fellows.length} total</span>
              </div>
              <button
                onClick={() => exportFellowsCSV(filtered)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name or email..."
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
                {roleOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <select
                value={filterCountry}
                onChange={e => setFilterCountry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Countries</option>
                {countryOptions.map(country => (
                  <option key={country} value={country}>{country}</option>
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

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-gray-500">No operating fellows found</p>
                <p className="text-sm mt-1">
                  {fellows.length === 0
                    ? 'The Catalyst Fellows roster is empty. Add fellows from the main admin fellows page.'
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
                          {fellow.role} · {locationLabel(fellow)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${fellow.is_public ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {fellow.is_public ? 'Public' : 'Hidden'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setSelected(null)} />
              <FellowPanel
                fellow={selected}
                onClose={() => setSelected(null)}
                onPatch={updateFellow}
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
