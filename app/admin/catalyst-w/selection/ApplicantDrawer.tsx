'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { X, Loader2, CalendarPlus, ShieldCheck, ExternalLink } from 'lucide-react';
import {
    Application, Interview, RECOMMENDATIONS, Recommendation, Scorecard, SelectionQuestion,
    completeness, formatInterviewTime, weightedScore,
} from '@/lib/catalyst-selection';

type Props = {
    app: Application;
    me: string;
    questions: SelectionQuestion[];
    interviews: Interview[];
    scorecards: Scorecard[];
    onClose: () => void;
    onApplicationChange: (a: Application) => void;
    onInterviewChange: (i: Interview) => void;
    onScorecardChange: (s: Scorecard) => void;
};

const INTERVIEW_LABELS: Record<Interview['status'], string> = {
    scheduled: 'Scheduled', completed: 'Completed', no_show: 'No-show', cancelled: 'Cancelled',
};

async function selectionAction(body: Record<string, unknown>) {
    const res = await fetch('/api/admin/catalyst-w/selection', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

/** Converts an ISO time to the value a datetime-local input expects, in the admin's own time zone. */
function toLocalInput(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

const Answer = ({ label, value }: { label: string; value?: string | null }) => (
    <div>
        <dt className="text-xs font-semibold text-gray-400">{label}</dt>
        <dd className="whitespace-pre-wrap text-sm text-gray-800">{value?.trim() || <span className="text-gray-400">—</span>}</dd>
    </div>
);

export default function ApplicantDrawer({ app, me, questions, interviews, scorecards, onClose, onApplicationChange, onInterviewChange, onScorecardChange }: Props) {
    const active = questions.filter(q => q.active);
    const mine = scorecards.find(s => s.interviewer_email === me);
    const others = scorecards.filter(s => s.interviewer_email !== me);
    const c = completeness(app);

    // Business verification
    const [verifyNotes, setVerifyNotes] = useState(app.business_verification_notes || '');
    const [verifying, setVerifying] = useState(false);
    const saveVerification = async (verified: boolean) => {
        setVerifying(true);
        try {
            const res = await fetch('/api/admin/catalyst-w', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: app.id, business_verified: verified, business_verification_notes: verifyNotes.trim() || null }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Could not save verification');
            onApplicationChange({ ...app, ...data.submission });
            toast.success(verified ? 'Business marked as verified' : 'Verification saved');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setVerifying(false);
        }
    };

    // Interview scheduling
    const [when, setWhen] = useState('');
    const [duration, setDuration] = useState(30);
    const [interviewer, setInterviewer] = useState(me);
    const [link, setLink] = useState('');
    const [sendInvite, setSendInvite] = useState(true);
    const [scheduling, setScheduling] = useState(false);
    const [reschedule, setReschedule] = useState<{ id: string; value: string } | null>(null);

    const schedule = async () => {
        if (!when) { toast.error('Choose a date and time'); return; }
        setScheduling(true);
        try {
            const data = await selectionAction({
                action: 'schedule_interview', submission_id: app.id, scheduled_at: new Date(when).toISOString(),
                duration_minutes: duration, interviewer_email: interviewer, meeting_link: link, send_invite: sendInvite,
            });
            onInterviewChange(data.interview);
            if (app.status === 'new' || app.status === 'reviewed') onApplicationChange({ ...app, status: 'shortlisted' });
            if (data.inviteError) toast.error(`Interview saved, but the invite failed: ${data.inviteError}`);
            else toast.success(sendInvite ? 'Interview scheduled and invite sent' : 'Interview scheduled');
            setWhen(''); setLink('');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setScheduling(false);
        }
    };

    const updateInterview = async (id: string, patch: Record<string, unknown>, message: string) => {
        try {
            const data = await selectionAction({ action: 'update_interview', id, ...patch });
            onInterviewChange(data.interview);
            if (data.interview.status === 'completed' && ['new', 'reviewed', 'shortlisted'].includes(app.status)) onApplicationChange({ ...app, status: 'interviewed' });
            if (data.inviteError) toast.error(`Saved, but the email failed: ${data.inviteError}`);
            else toast.success(message);
            setReschedule(null);
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    // My scorecard
    const [scores, setScores] = useState<Record<string, number | ''>>(() => Object.fromEntries(active.map(q => [q.id, mine?.scores[q.id] ?? ''])));
    const [recommendation, setRecommendation] = useState<Recommendation | ''>(mine?.recommendation || '');
    const [comments, setComments] = useState(mine?.comments || '');
    const [savingScore, setSavingScore] = useState(false);
    const liveScore = useMemo(() => weightedScore(
        Object.fromEntries(Object.entries(scores).filter(([, v]) => v !== '')) as Record<string, number>, active,
    ), [scores, active]);

    const saveScorecard = async () => {
        setSavingScore(true);
        try {
            const data = await selectionAction({ action: 'save_scorecard', submission_id: app.id, scores, recommendation: recommendation || null, comments });
            onScorecardChange(data.scorecard);
            toast.success('Scorecard saved');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSavingScore(false);
        }
    };

    const appInterviews = interviews.filter(i => i.submission_id === app.id).sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));
    const questionById = new Map(questions.map(q => [q.id, q]));

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
            <aside role="dialog" aria-label={`Selection for ${app.full_name}`} className="h-full w-full max-w-2xl overflow-y-auto bg-white" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-100 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{app.full_name}</h2>
                        <p className="text-sm text-gray-500">{[app.business_name, app.sector, app.country].filter(Boolean).join(' · ')}</p>
                        <p className="text-xs text-gray-400 break-all">{app.email}{app.phone ? ` · ${app.phone}` : ''}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-1 text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
                </div>

                <div className="space-y-6 px-6 py-5">
                    {/* Application */}
                    <section>
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Application · {c.percent}% complete</h3>
                        <dl className="grid gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
                            <Answer label="Stage" value={app.business_stage} />
                            <Answer label="Revenue / team" value={[app.revenue, app.team_size && `${app.team_size} people`].filter(Boolean).join(' · ')} />
                            <Answer label="Plan" value={app.plan_tier} />
                            <div>
                                <dt className="text-xs font-semibold text-gray-400">Website / social</dt>
                                <dd className="text-sm">{app.website ? <a href={/^https?:\/\//.test(app.website) ? app.website : `https://${app.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-700 underline break-all">{app.website} <ExternalLink className="h-3 w-3" /></a> : <span className="text-gray-400">—</span>}</dd>
                            </div>
                            <div className="sm:col-span-2"><Answer label="Why join Catalyst W" value={app.why_apply} /></div>
                            <div className="sm:col-span-2"><Answer label="Main business problem" value={app.primary_constraint} /></div>
                            <div className="sm:col-span-2"><Answer label="Support that would help most" value={app.support_needed} /></div>
                        </dl>
                    </section>

                    {/* Business verification */}
                    <section className={`rounded-lg border p-4 ${app.business_verified ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                        <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-gray-900"><ShieldCheck className="h-4 w-4" /> Business verification</h3>
                        <p className="mb-2 text-xs text-gray-600">
                            {app.business_verified
                                ? `Verified by ${app.business_verified_by} on ${new Date(app.business_verified_at!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}.`
                                : 'Record the evidence that the business is trading: sales records, customers, registration, photos of operations.'}
                        </p>
                        <textarea value={verifyNotes} onChange={e => setVerifyNotes(e.target.value)} rows={2} maxLength={2000} placeholder="Evidence seen (e.g. 3 months of sales receipts, CAC registration, visited stall)" aria-label="Verification evidence" className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                        <div className="flex flex-wrap gap-2">
                            {!app.business_verified && <button disabled={verifying} onClick={() => saveVerification(true)} className="rounded-lg bg-green-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">Mark as verified</button>}
                            <button disabled={verifying} onClick={() => saveVerification(!!app.business_verified)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50">Save notes</button>
                            {app.business_verified && <button disabled={verifying} onClick={() => saveVerification(false)} className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">Remove verification</button>}
                        </div>
                    </section>

                    {/* Interviews */}
                    <section>
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Interviews</h3>
                        {appInterviews.length > 0 && (
                            <ul className="mb-3 space-y-2">
                                {appInterviews.map(iv => (
                                    <li key={iv.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${iv.status === 'completed' ? 'bg-green-100 text-green-700' : iv.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{INTERVIEW_LABELS[iv.status]}</span>
                                            <span className="text-xs text-gray-500">with {iv.interviewer_email}{iv.invite_sent_at ? ' · invite sent' : ''}</span>
                                        </div>
                                        <p className="mt-1.5 text-xs text-gray-700">{formatInterviewTime(iv.scheduled_at)} · {iv.duration_minutes} min</p>
                                        {iv.meeting_link && <a href={iv.meeting_link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-green-700 underline break-all">{iv.meeting_link}</a>}
                                        {iv.status === 'scheduled' && (
                                            reschedule?.id === iv.id ? (
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <input type="datetime-local" value={reschedule.value} onChange={e => setReschedule({ id: iv.id, value: e.target.value })} aria-label="New interview time" className="rounded border border-gray-200 px-2 py-1 text-xs" />
                                                    <button onClick={() => reschedule.value && updateInterview(iv.id, { scheduled_at: new Date(reschedule.value).toISOString(), send_invite: true }, 'Rescheduled and applicant emailed')} className="rounded bg-[#0B2C24] px-2.5 py-1 text-xs font-semibold text-white">Save & email</button>
                                                    <button onClick={() => setReschedule(null)} className="text-xs text-gray-500">Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    <button onClick={() => updateInterview(iv.id, { status: 'completed' }, 'Interview marked completed')} className="rounded border border-green-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50">Mark completed</button>
                                                    <button onClick={() => setReschedule({ id: iv.id, value: toLocalInput(iv.scheduled_at) })} className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">Reschedule</button>
                                                    <button onClick={() => updateInterview(iv.id, { status: 'no_show' }, 'Marked as no-show')} className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">No-show</button>
                                                    <button onClick={() => confirm('Cancel this interview? The applicant is not emailed automatically.') && updateInterview(iv.id, { status: 'cancelled' }, 'Interview cancelled')} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">Cancel</button>
                                                </div>
                                            )
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="rounded-lg border border-dashed border-gray-300 p-3">
                            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-800"><CalendarPlus className="h-4 w-4" /> Schedule an interview</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <label className="text-xs text-gray-600">Date & time (your time zone)
                                    <input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm" />
                                </label>
                                <label className="text-xs text-gray-600">Length
                                    <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm">
                                        {[20, 30, 45, 60].map(m => <option key={m} value={m}>{m} minutes</option>)}
                                    </select>
                                </label>
                                <label className="text-xs text-gray-600">Interviewer email
                                    <input type="email" value={interviewer} onChange={e => setInterviewer(e.target.value)} className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm" />
                                </label>
                                <label className="text-xs text-gray-600">Meeting link (optional)
                                    <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://meet.google.com/…" className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm" />
                                </label>
                            </div>
                            {when && <p className="mt-2 text-[11px] text-gray-500">Applicant sees: {formatInterviewTime(new Date(when).toISOString())}</p>}
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                <label className="flex items-center gap-1.5 text-xs text-gray-600"><input type="checkbox" checked={sendInvite} onChange={e => setSendInvite(e.target.checked)} /> Email the invite to the applicant</label>
                                <button onClick={schedule} disabled={scheduling} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2C24] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
                                    {scheduling && <Loader2 className="h-4 w-4 animate-spin" />} Schedule
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* My scorecard */}
                    <section>
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Your scorecard</h3>
                            <span className="text-sm font-bold text-gray-900">{liveScore == null ? 'Not scored' : `${liveScore} / 100`}</span>
                        </div>
                        {active.length === 0 ? (
                            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">No active selection questions. Add them in the Questions tab.</p>
                        ) : (
                            <ol className="space-y-3">
                                {active.map((q, i) => (
                                    <li key={q.id} className="rounded-lg border border-gray-100 p-3">
                                        <p className="text-sm font-medium text-gray-900">{i + 1}. {q.prompt} {q.weight !== 1 && <span className="text-xs font-normal text-gray-400">(×{q.weight})</span>}</p>
                                        {q.guidance && <p className="mt-0.5 text-xs text-gray-500">{q.guidance}</p>}
                                        <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label={q.prompt}>
                                            {Array.from({ length: q.max_score + 1 }, (_, n) => (
                                                <button
                                                    key={n}
                                                    role="radio"
                                                    aria-checked={scores[q.id] === n}
                                                    onClick={() => setScores(s => ({ ...s, [q.id]: s[q.id] === n ? '' : n }))}
                                                    className={`h-8 w-8 rounded-lg text-sm font-semibold transition-colors ${scores[q.id] === n ? 'bg-[#0B2C24] text-white' : 'border border-gray-200 text-gray-600 hover:border-gray-400'}`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Recommendation">
                            {RECOMMENDATIONS.map(r => (
                                <button key={r.value} role="radio" aria-checked={recommendation === r.value} onClick={() => setRecommendation(recommendation === r.value ? '' : r.value)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${recommendation === r.value ? `${r.color} ring-2 ring-current ring-offset-1` : 'border border-gray-200 text-gray-600'}`}>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                        <textarea value={comments} onChange={e => setComments(e.target.value)} rows={3} maxLength={4000} placeholder="Notes: strengths, concerns, follow-up needed" aria-label="Scorecard comments" className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-gray-400">{mine ? `Last saved ${new Date(mine.updated_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Saved under your login email.'}</p>
                            <button onClick={saveScorecard} disabled={savingScore || active.length === 0} className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                {savingScore && <Loader2 className="h-4 w-4 animate-spin" />} Save scorecard
                            </button>
                        </div>
                    </section>

                    {/* Other interviewers */}
                    {others.length > 0 && (
                        <section>
                            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Other scorecards</h3>
                            <ul className="space-y-2">
                                {others.map(s => {
                                    const rec = RECOMMENDATIONS.find(r => r.value === s.recommendation);
                                    return (
                                        <li key={s.id} className="rounded-lg border border-gray-100 p-3 text-sm">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="font-medium text-gray-800">{s.interviewer_email}</span>
                                                <span className="flex items-center gap-2">
                                                    {rec && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${rec.color}`}>{rec.label}</span>}
                                                    <span className="font-bold">{s.weighted_score ?? '–'}</span>
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {Object.entries(s.scores).map(([qid, v]) => `${questionById.get(qid)?.prompt.slice(0, 28) || 'Removed question'}: ${v}`).join(' · ')}
                                            </p>
                                            {s.comments && <p className="mt-1 whitespace-pre-wrap text-xs text-gray-700">{s.comments}</p>}
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}
                </div>
            </aside>
        </div>
    );
}
