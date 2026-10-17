'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, Search, CalendarClock } from 'lucide-react';
import CatalystAdminHeader from '../components/CatalystAdminHeader';
import ApplicantDrawer from './ApplicantDrawer';
import QuestionsEditor from './QuestionsEditor';
import {
    Application, ApplicationStatus, Interview, RECOMMENDATIONS, Scorecard, SelectionQuestion,
    completeness, isActiveApplication,
} from '@/lib/catalyst-selection';

type Tab = 'shortlist' | 'interviews' | 'questions';
const POOL_STATUSES: ApplicationStatus[] = ['reviewed', 'shortlisted', 'interviewed', 'accepted', 'waitlisted'];
const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
    { value: 'new', label: 'New' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'waitlisted', label: 'Reserve list' },
    { value: 'rejected', label: 'Not selected' },
];
const STATUS_COLORS: Partial<Record<ApplicationStatus, string>> = {
    new: 'bg-blue-100 text-blue-700', reviewed: 'bg-yellow-100 text-yellow-700', shortlisted: 'bg-indigo-100 text-indigo-700',
    interviewed: 'bg-purple-100 text-purple-700', accepted: 'bg-green-100 text-green-700', waitlisted: 'bg-orange-100 text-orange-700',
    rejected: 'bg-red-100 text-red-700', paid: 'bg-emerald-100 text-emerald-700',
};

export default function CatalystSelectionPage() {
    const [apps, setApps] = useState<Application[]>([]);
    const [questions, setQuestions] = useState<SelectionQuestion[]>([]);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [scorecards, setScorecards] = useState<Scorecard[]>([]);
    const [me, setMe] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<Tab>('shortlist');
    const [includeNew, setIncludeNew] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
    const [search, setSearch] = useState('');
    const [openId, setOpenId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [appsRes, selRes] = await Promise.all([
                fetch('/api/admin/catalyst-w', { cache: 'no-store' }),
                fetch('/api/admin/catalyst-w/selection', { cache: 'no-store' }),
            ]);
            const [appsData, selData] = await Promise.all([appsRes.json(), selRes.json()]);
            if (!appsRes.ok) throw new Error(appsData.error || 'Could not load applications.');
            if (!selRes.ok) throw new Error(selData.error || 'Could not load selection data.');
            setApps((appsData as Application[]).filter(isActiveApplication));
            setQuestions(selData.questions);
            setInterviews(selData.interviews);
            setScorecards(selData.scorecards);
            setMe(selData.me);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { void load(); }, [load]);

    const scoresBySubmission = useMemo(() => {
        const m = new Map<string, Scorecard[]>();
        scorecards.forEach(s => m.set(s.submission_id, [...(m.get(s.submission_id) || []), s]));
        return m;
    }, [scorecards]);
    const interviewsBySubmission = useMemo(() => {
        const m = new Map<string, Interview[]>();
        interviews.forEach(i => m.set(i.submission_id, [...(m.get(i.submission_id) || []), i]));
        return m;
    }, [interviews]);

    const ranked = useMemo(() => {
        const q = search.trim().toLowerCase();
        return apps
            .filter(a => (includeNew ? [...POOL_STATUSES, 'new', 'rejected'] : POOL_STATUSES).includes(a.status))
            .filter(a => statusFilter === 'all' || a.status === statusFilter)
            .filter(a => !q || `${a.full_name} ${a.business_name || ''} ${a.country || ''} ${a.sector || ''}`.toLowerCase().includes(q))
            .map(a => {
                const cards = scoresBySubmission.get(a.id) || [];
                const scored = cards.filter(c => c.weighted_score != null);
                const avg = scored.length ? Math.round((scored.reduce((s, c) => s + (c.weighted_score || 0), 0) / scored.length) * 10) / 10 : null;
                const ivs = (interviewsBySubmission.get(a.id) || []).sort((x, y) => x.scheduled_at.localeCompare(y.scheduled_at));
                const next = ivs.find(i => i.status === 'scheduled');
                const done = ivs.some(i => i.status === 'completed');
                return { app: a, cards, avg, next, done };
            })
            // Highest average first; unscored applications follow, verified businesses first.
            .sort((x, y) => (y.avg ?? -1) - (x.avg ?? -1) || Number(!!y.app.business_verified) - Number(!!x.app.business_verified) || x.app.created_at.localeCompare(y.app.created_at));
    }, [apps, includeNew, statusFilter, search, scoresBySubmission, interviewsBySubmission]);

    const stats = useMemo(() => {
        const now = new Date().toISOString();
        const pool = apps.filter(a => POOL_STATUSES.includes(a.status));
        return {
            pool: pool.length,
            shortlisted: apps.filter(a => a.status === 'shortlisted').length,
            upcoming: interviews.filter(i => i.status === 'scheduled' && i.scheduled_at >= now).length,
            interviewed: apps.filter(a => a.status === 'interviewed').length,
            scored: pool.filter(a => (scoresBySubmission.get(a.id) || []).length > 0).length,
            verified: pool.filter(a => a.business_verified).length,
        };
    }, [apps, interviews, scoresBySubmission]);

    const setStatus = async (app: Application, status: ApplicationStatus) => {
        try {
            const res = await fetch('/api/admin/catalyst-w', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: app.id, status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Could not update status');
            setApps(prev => prev.map(a => (a.id === app.id ? { ...a, ...data.submission } : a)));
            toast.success(`${app.full_name}: ${STATUS_OPTIONS.find(s => s.value === status)?.label}`);
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const appById = useMemo(() => new Map(apps.map(a => [a.id, a])), [apps]);
    const open = openId ? appById.get(openId) : null;
    const nowIso = new Date().toISOString();
    const upcoming = interviews.filter(i => i.status === 'scheduled' && i.scheduled_at >= nowIso && appById.has(i.submission_id));
    const overdue = interviews.filter(i => i.status === 'scheduled' && i.scheduled_at < nowIso && appById.has(i.submission_id));

    return (
        <div className="min-h-screen bg-gray-50">
            <CatalystAdminHeader title="Selection & interviews" subtitle="Interview, score and rank founders for the 2026 cohort" onRefresh={load}>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                        { label: 'In selection', value: stats.pool },
                        { label: 'Shortlisted', value: stats.shortlisted },
                        { label: 'Upcoming interviews', value: stats.upcoming },
                        { label: 'Interviewed', value: stats.interviewed },
                        { label: 'Scored', value: stats.scored },
                        { label: 'Business verified', value: stats.verified },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl bg-white/10 p-4">
                            <p className="text-2xl font-black">{loading ? '–' : s.value}</p>
                            <p className="mt-0.5 text-xs font-semibold opacity-70">{s.label}</p>
                        </div>
                    ))}
                </div>
            </CatalystAdminHeader>

            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-4 flex flex-wrap gap-2" role="tablist">
                    {([['shortlist', 'Ranked shortlist'], ['interviews', `Interviews${upcoming.length ? ` (${upcoming.length})` : ''}`], ['questions', 'Questions']] as [Tab, string][]).map(([value, label]) => (
                        <button key={value} role="tab" aria-selected={tab === value} onClick={() => setTab(value)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === value ? 'bg-[#0B2C24] text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-400'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {error ? (
                    <div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error} <button onClick={load} className="ml-2 font-semibold underline">Retry</button></div>
                ) : loading ? (
                    <div role="status" className="flex items-center justify-center gap-2 rounded-xl bg-white p-10 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
                ) : tab === 'questions' ? (
                    <QuestionsEditor questions={questions} onSaved={setQuestions} />
                ) : tab === 'interviews' ? (
                    <div className="space-y-6">
                        {overdue.length > 0 && (
                            <InterviewList title="Needs an outcome" hint="These interviews have passed. Mark them completed or no-show." items={overdue} appById={appById} onOpen={setOpenId} tone="amber" />
                        )}
                        <InterviewList title="Upcoming" hint="Times shown in your browser's time zone." items={upcoming} appById={appById} onOpen={setOpenId} />
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} aria-label="Filter by status" className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                                <option value="all">All stages</option>
                                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" checked={includeNew} onChange={e => setIncludeNew(e.target.checked)} /> Include new and not-selected
                            </label>
                            <label className="relative ml-auto">
                                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search founder, business, country" aria-label="Search" className="w-64 max-w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm" />
                            </label>
                        </div>

                        {ranked.length === 0 ? (
                            <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-500">
                                No applications at these stages yet. Mark applications as Reviewed on the All submissions tab, or tick “Include new”.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                        <tr>
                                            <th className="px-4 py-3">#</th>
                                            <th className="px-4 py-3">Founder</th>
                                            <th className="px-4 py-3">Interview</th>
                                            <th className="px-4 py-3">Score</th>
                                            <th className="px-4 py-3">Recommendations</th>
                                            <th className="px-4 py-3">Stage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {ranked.map(({ app, cards, avg, next, done }, i) => {
                                            const c = completeness(app);
                                            return (
                                                <tr key={app.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setOpenId(app.id)}>
                                                    <td className="px-4 py-3 align-top font-bold text-gray-400">{avg != null ? i + 1 : '–'}</td>
                                                    <td className="px-4 py-3 align-top">
                                                        <button className="text-left font-semibold text-gray-900 hover:underline" onClick={e => { e.stopPropagation(); setOpenId(app.id); }}>{app.full_name}</button>
                                                        <p className="text-xs text-gray-500">{[app.business_name, app.country].filter(Boolean).join(' · ')}</p>
                                                        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                                                            {app.business_verified
                                                                ? <span className="inline-flex items-center gap-0.5 font-semibold text-green-700"><ShieldCheck className="h-3 w-3" /> Verified</span>
                                                                : <span className="text-gray-400">Not verified</span>}
                                                            {!c.complete && <span className="text-red-600">{c.percent}% complete</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 align-top text-xs">
                                                        {next ? (
                                                            <span className="inline-flex items-center gap-1 text-blue-700"><CalendarClock className="h-3.5 w-3.5" /> {new Date(next.scheduled_at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                        ) : done ? <span className="text-green-700">Completed</span> : <span className="text-gray-400">Not scheduled</span>}
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        {avg != null ? <span className="text-base font-black text-gray-900">{avg}</span> : <span className="text-gray-400">–</span>}
                                                        <p className="text-[11px] text-gray-400">{cards.length} scorecard{cards.length === 1 ? '' : 's'}</p>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <div className="flex flex-wrap gap-1">
                                                            {RECOMMENDATIONS.map(r => {
                                                                const n = cards.filter(cd => cd.recommendation === r.value).length;
                                                                return n ? <span key={r.value} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.color}`}>{r.label} {n}</span> : null;
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 align-top" onClick={e => e.stopPropagation()}>
                                                        <select
                                                            value={app.status}
                                                            onChange={e => setStatus(app, e.target.value as ApplicationStatus)}
                                                            aria-label={`Stage for ${app.full_name}`}
                                                            className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[app.status] || ''}`}
                                                        >
                                                            {app.status === 'paid' && <option value="paid">Paid</option>}
                                                            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                        </select>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <p className="mt-3 text-xs text-gray-400">Changing the stage here does not email the founder. Use the All submissions tab to send stage emails. Offers, fees and payment deadlines come in the next phase.</p>
                    </>
                )}
            </div>

            {open && (
                <ApplicantDrawer
                    key={open.id}
                    app={open}
                    me={me}
                    questions={questions}
                    interviews={interviews}
                    scorecards={scoresBySubmission.get(open.id) || []}
                    onClose={() => setOpenId(null)}
                    onApplicationChange={a => setApps(prev => prev.map(x => (x.id === a.id ? a : x)))}
                    onInterviewChange={iv => setInterviews(prev => (prev.some(x => x.id === iv.id) ? prev.map(x => (x.id === iv.id ? iv : x)) : [...prev, iv]))}
                    onScorecardChange={s => setScorecards(prev => (prev.some(x => x.id === s.id) ? prev.map(x => (x.id === s.id ? s : x)) : [...prev, s]))}
                />
            )}
        </div>
    );
}

function InterviewList({ title, hint, items, appById, onOpen, tone }: {
    title: string;
    hint: string;
    items: Interview[];
    appById: Map<string, Application>;
    onOpen: (id: string) => void;
    tone?: 'amber';
}) {
    const sorted = [...items].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
    const byDay = new Map<string, Interview[]>();
    sorted.forEach(i => {
        const day = new Date(i.scheduled_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
        byDay.set(day, [...(byDay.get(day) || []), i]);
    });
    return (
        <section className={`rounded-xl border bg-white p-5 shadow-sm ${tone === 'amber' ? 'border-amber-200' : 'border-gray-100'}`}>
            <h2 className="font-bold text-gray-900">{title}</h2>
            <p className="mb-3 text-xs text-gray-500">{hint}</p>
            {sorted.length === 0 ? <p className="text-sm text-gray-500">No interviews.</p> : (
                <div className="space-y-4">
                    {[...byDay.entries()].map(([day, list]) => (
                        <div key={day}>
                            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">{day}</p>
                            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                                {list.map(iv => {
                                    const app = appById.get(iv.submission_id)!;
                                    return (
                                        <li key={iv.id}>
                                            <button onClick={() => onOpen(app.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2.5 text-left text-sm hover:bg-gray-50">
                                                <span className="w-14 font-bold text-gray-900">{new Date(iv.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="font-medium text-gray-800">{app.full_name}</span>
                                                <span className="text-xs text-gray-500">{[app.business_name, app.country].filter(Boolean).join(' · ')}</span>
                                                <span className="ml-auto text-xs text-gray-500">{iv.interviewer_email} · {iv.duration_minutes} min{iv.invite_sent_at ? '' : ' · invite not sent'}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
            {sorted.length > 0 && <p className="mt-3 text-[11px] text-gray-400">Invite emails show each time in GMT (Ghana), WAT (Nigeria), CAT (Zimbabwe) and EAT (Kenya).</p>}
        </section>
    );
}
