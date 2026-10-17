import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { requireAdminApi } from '@/lib/admin-auth';
import { buildBrandedEmail, escapeHtml } from '@/lib/email/branded-email';
import { Application, CHASE_COOLDOWN_HOURS, completeness, isActiveApplication } from '@/lib/catalyst-selection';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = 'AgriPro Catalyst W <noreply@agriprohub.com>';
const REPLY_TO = process.env.CATALYST_REPLY_TO || 'edison@agriprohub.com';
const MAX_PER_REQUEST = 100;

// Sends each selected applicant a personal reminder listing what their application is missing.
// The working closing date is not published yet, so the email asks for a prompt reply without a date.
export async function POST(request: NextRequest) {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;
    if (!resend) return NextResponse.json({ error: 'Email is not configured (RESEND_API_KEY).' }, { status: 503 });

    const { ids, force } = await request.json().catch(() => ({}));
    if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: 'Choose at least one applicant.' }, { status: 400 });
    if (ids.length > MAX_PER_REQUEST) return NextResponse.json({ error: `Send at most ${MAX_PER_REQUEST} reminders at a time.` }, { status: 400 });

    const { data, error } = await supabase.from('catalyst_submissions').select('*').in('id', ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const cutoff = Date.now() - CHASE_COOLDOWN_HOURS * 3600_000;
    const sent: string[] = [];
    const skipped: { id: string; reason: string }[] = [];
    const failed: { id: string; reason: string }[] = [];

    for (const app of (data || []) as Application[]) {
        const c = completeness(app);
        if (!isActiveApplication(app)) { skipped.push({ id: app.id, reason: 'excluded or duplicate' }); continue; }
        if (c.missing.length === 0 && c.helpfulMissing.length === 0) { skipped.push({ id: app.id, reason: 'already complete' }); continue; }
        if (!force && app.last_chased_at && new Date(app.last_chased_at).getTime() > cutoff) {
            skipped.push({ id: app.id, reason: `reminded in the last ${CHASE_COOLDOWN_HOURS} hours` });
            continue;
        }
        const needed = c.missing.length ? c.missing : c.helpfulMissing;
        const items = needed.map(m => `<li style="margin:0 0 6px;">${escapeHtml(m)}</li>`).join('');
        const html = buildBrandedEmail({
            headerTitle: 'Help us complete your application',
            subtitle: 'AgriPro Catalyst W — Cohort 2026',
            recipientName: app.full_name.split(' ')[0] || 'there',
            bodyHtml: `<p style="margin:0 0 12px;line-height:1.6;">Thank you for applying to AgriPro Catalyst W${app.business_name ? ` with <strong>${escapeHtml(app.business_name)}</strong>` : ''}. We are reviewing applications now, and yours is missing a few details we need before we can assess it fully:</p>
<ul style="margin:0 0 16px;padding-left:20px;line-height:1.6;">${items}</ul>
<p style="margin:0 0 12px;line-height:1.6;">Please <strong>reply to this email</strong> with this information as soon as you can, ideally within the next five days. A few sentences for each is enough.</p>
<p style="margin:0 0 12px;line-height:1.6;">If you have any questions, just reply and our team will help.</p>`,
            signOff: '— The AgriPro Catalyst W Team',
        });
        try {
            const { error: sendError } = await resend.emails.send({
                from: FROM,
                to: app.email,
                replyTo: REPLY_TO,
                subject: 'A few details needed for your Catalyst W application',
                html,
            });
            if (sendError) throw new Error(sendError.message);
            await supabase.from('catalyst_submissions')
                .update({ last_chased_at: new Date().toISOString(), chase_count: (app.chase_count || 0) + 1 })
                .eq('id', app.id);
            sent.push(app.id);
        } catch (err: any) {
            failed.push({ id: app.id, reason: err?.message || 'send failed' });
        }
    }

    return NextResponse.json({ sent, skipped, failed });
}
