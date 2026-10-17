import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { requireAdminApi } from '@/lib/admin-auth';
import { buildBrandedEmail, escapeHtml } from '@/lib/email/branded-email';
import { COHORT_YEAR, RECOMMENDATIONS, SelectionQuestion, formatInterviewTime, weightedScore } from '@/lib/catalyst-selection';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = 'AgriPro Catalyst W <noreply@agriprohub.com>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTERVIEW_STATUSES = ['scheduled', 'completed', 'no_show', 'cancelled'];

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

async function activeQuestions(): Promise<SelectionQuestion[]> {
    const { data, error } = await supabase.from('catalyst_selection_questions')
        .select('*').eq('cohort_year', COHORT_YEAR).order('position');
    if (error) throw error;
    return (data || []).map(q => ({ ...q, weight: Number(q.weight) }));
}

async function sendInvite(interview: { scheduled_at: string; duration_minutes: number; meeting_link: string | null; interviewer_email: string }, app: { full_name: string; email: string; business_name?: string | null }, rescheduled: boolean) {
    if (!resend) throw new Error('Email is not configured (RESEND_API_KEY).');
    const html = buildBrandedEmail({
        headerTitle: rescheduled ? 'Your interview has a new time' : 'Interview invitation',
        subtitle: 'AgriPro Catalyst W — Cohort 2026',
        recipientName: app.full_name.split(' ')[0] || 'there',
        bodyHtml: `<p style="margin:0 0 12px;line-height:1.6;">${rescheduled ? 'Your Catalyst W interview has been moved.' : `Thank you for applying to AgriPro Catalyst W${app.business_name ? ` with <strong>${escapeHtml(app.business_name)}</strong>` : ''}. We would like to invite you to a short interview.`}</p>
<p style="margin:0 0 6px;"><strong>When:</strong> ${escapeHtml(formatInterviewTime(interview.scheduled_at))}</p>
<p style="margin:0 0 6px;"><strong>Length:</strong> about ${interview.duration_minutes} minutes</p>
${interview.meeting_link ? `<p style="margin:0 0 12px;"><strong>Join:</strong> <a href="${escapeHtml(interview.meeting_link)}">${escapeHtml(interview.meeting_link)}</a></p>` : '<p style="margin:0 0 12px;">We will send the meeting link before the interview.</p>'}
<p style="margin:0 0 12px;line-height:1.6;">We will talk about your business, the main problem you want to solve and how Catalyst W could help. Please have any evidence of trading to hand, such as recent sales, customers or registration documents.</p>
<p style="margin:0 0 12px;line-height:1.6;">If this time does not work, reply to this email with two or three alternatives.</p>`,
        signOff: '— The AgriPro Catalyst W Team',
    });
    const { error } = await resend.emails.send({
        from: FROM,
        to: app.email,
        replyTo: interview.interviewer_email,
        subject: rescheduled ? 'New time for your Catalyst W interview' : 'Interview invitation — AgriPro Catalyst W',
        html,
    });
    if (error) throw new Error(error.message);
}

/** Moves an application forward (never backward) when interviews are booked or held. */
async function advanceStatus(submissionId: string, to: 'shortlisted' | 'interviewed') {
    const from = to === 'shortlisted' ? ['new', 'reviewed'] : ['new', 'reviewed', 'shortlisted'];
    await supabase.from('catalyst_submissions')
        .update({ status: to, updated_at: new Date().toISOString() })
        .eq('id', submissionId).in('status', from);
}

export async function GET() {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;
    try {
        const [questions, interviews, scorecards] = await Promise.all([
            activeQuestions(),
            supabase.from('catalyst_interviews').select('*').order('scheduled_at'),
            supabase.from('catalyst_scorecards').select('*'),
        ]);
        if (interviews.error) throw interviews.error;
        if (scorecards.error) throw scorecards.error;
        return NextResponse.json({
            me: auth.email,
            questions,
            interviews: interviews.data || [],
            scorecards: (scorecards.data || []).map(s => ({ ...s, weighted_score: s.weighted_score == null ? null : Number(s.weighted_score) })),
        });
    } catch (err: any) {
        return bad(err?.message || 'Could not load selection data. Has migration 063 been applied?', 500);
    }
}

export async function POST(request: NextRequest) {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;
    const body = await request.json().catch(() => null);
    if (!body?.action) return bad('Missing action');

    try {
        switch (body.action) {
            case 'save_questions': {
                const list = Array.isArray(body.questions) ? body.questions : [];
                if (list.length === 0 || list.length > 20) return bad('Keep between 1 and 20 questions.');
                const rows = list.map((q: any, i: number) => ({
                    ...(q.id ? { id: q.id } : {}),
                    cohort_year: COHORT_YEAR,
                    position: i + 1,
                    prompt: String(q.prompt || '').trim(),
                    guidance: q.guidance ? String(q.guidance).trim() : null,
                    weight: Number(q.weight) || 1,
                    max_score: Number(q.max_score) || 5,
                    active: q.active !== false,
                    updated_at: new Date().toISOString(),
                }));
                if (rows.some((r: any) => r.prompt.length < 3)) return bad('Every question needs some text.');
                // Questions are never deleted here (scorecards refer to them); turn them off instead.
                const { error } = await supabase.from('catalyst_selection_questions').upsert(rows);
                if (error) throw error;
                return NextResponse.json({ questions: await activeQuestions() });
            }

            case 'schedule_interview': {
                const { submission_id, scheduled_at, duration_minutes, interviewer_email, meeting_link, send_invite } = body;
                const when = new Date(scheduled_at);
                if (!submission_id || Number.isNaN(when.getTime())) return bad('Choose a valid date and time.');
                const interviewer = String(interviewer_email || auth.email).trim().toLowerCase();
                if (!EMAIL_RE.test(interviewer)) return bad('Interviewer email looks invalid.');
                const { data: app, error: appError } = await supabase.from('catalyst_submissions')
                    .select('id, full_name, email, business_name, excluded_reason, duplicate_of').eq('id', submission_id).single();
                if (appError || !app) return bad('Application not found.', 404);
                if (app.excluded_reason || app.duplicate_of) return bad('This application is excluded or marked as a duplicate.');
                const { data: interview, error } = await supabase.from('catalyst_interviews').insert({
                    submission_id,
                    scheduled_at: when.toISOString(),
                    duration_minutes: Number(duration_minutes) || 30,
                    interviewer_email: interviewer,
                    meeting_link: meeting_link?.trim() || null,
                    created_by: auth.email,
                }).select('*').single();
                if (error) throw error;
                await advanceStatus(submission_id, 'shortlisted');
                let inviteError: string | null = null;
                if (send_invite) {
                    try {
                        await sendInvite(interview, app, false);
                        await supabase.from('catalyst_interviews').update({ invite_sent_at: new Date().toISOString() }).eq('id', interview.id);
                        interview.invite_sent_at = new Date().toISOString();
                    } catch (e: any) { inviteError = e?.message || 'Invite email failed'; }
                }
                return NextResponse.json({ interview, inviteError });
            }

            case 'update_interview': {
                const { id, status, scheduled_at, notes, meeting_link, interviewer_email, send_invite } = body;
                if (!id) return bad('Missing interview');
                const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
                if (status !== undefined) {
                    if (!INTERVIEW_STATUSES.includes(status)) return bad('Unknown interview status');
                    patch.status = status;
                }
                if (scheduled_at !== undefined) {
                    const when = new Date(scheduled_at);
                    if (Number.isNaN(when.getTime())) return bad('Choose a valid date and time.');
                    patch.scheduled_at = when.toISOString();
                    patch.status = patch.status ?? 'scheduled';
                }
                if (notes !== undefined) patch.notes = notes ? String(notes) : null;
                if (meeting_link !== undefined) patch.meeting_link = meeting_link?.trim() || null;
                if (interviewer_email !== undefined) {
                    const e = String(interviewer_email).trim().toLowerCase();
                    if (!EMAIL_RE.test(e)) return bad('Interviewer email looks invalid.');
                    patch.interviewer_email = e;
                }
                const { data: interview, error } = await supabase.from('catalyst_interviews').update(patch).eq('id', id).select('*').single();
                if (error) throw error;
                if (interview.status === 'completed') await advanceStatus(interview.submission_id, 'interviewed');
                let inviteError: string | null = null;
                if (send_invite && interview.status === 'scheduled') {
                    const { data: app } = await supabase.from('catalyst_submissions').select('full_name, email, business_name').eq('id', interview.submission_id).single();
                    try {
                        if (!app) throw new Error('Application not found');
                        await sendInvite(interview, app, true);
                        await supabase.from('catalyst_interviews').update({ invite_sent_at: new Date().toISOString() }).eq('id', id);
                    } catch (e: any) { inviteError = e?.message || 'Invite email failed'; }
                }
                return NextResponse.json({ interview, inviteError });
            }

            case 'save_scorecard': {
                const { submission_id, scores, recommendation, comments } = body;
                if (!submission_id || typeof scores !== 'object' || scores === null) return bad('Missing scores');
                if (recommendation != null && !RECOMMENDATIONS.some(r => r.value === recommendation)) return bad('Unknown recommendation');
                const questions = (await activeQuestions()).filter(q => q.active);
                const clean: Record<string, number> = {};
                for (const q of questions) {
                    const v = Number(scores[q.id]);
                    if (scores[q.id] === '' || scores[q.id] == null || Number.isNaN(v)) continue;
                    if (v < 0 || v > q.max_score) return bad(`Scores for “${q.prompt}” must be 0–${q.max_score}.`);
                    clean[q.id] = v;
                }
                // Each admin owns exactly one scorecard per applicant, keyed by their login email.
                const { data: scorecard, error } = await supabase.from('catalyst_scorecards').upsert({
                    submission_id,
                    interviewer_email: auth.email,
                    scores: clean,
                    weighted_score: weightedScore(clean, questions),
                    recommendation: recommendation || null,
                    comments: comments ? String(comments).slice(0, 4000) : null,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'submission_id,interviewer_email' }).select('*').single();
                if (error) throw error;
                return NextResponse.json({ scorecard: { ...scorecard, weighted_score: scorecard.weighted_score == null ? null : Number(scorecard.weighted_score) } });
            }

            default:
                return bad('Unknown action');
        }
    } catch (err: any) {
        return bad(err?.message || 'Something went wrong.', 500);
    }
}
