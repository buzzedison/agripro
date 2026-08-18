import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = 'AgriPro Catalyst W <noreply@agriprohub.com>';

function escapeHtml(s: string) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderEmailHtml(bodyText: string, firstName: string) {
    const greeted = `Hi ${escapeHtml(firstName)},\n\n${bodyText}`;
    const html = escapeHtml(greeted).replace(/\n/g, '<br />');
    return `
        <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#111827;line-height:1.6;">
            <div style="background:#0B2C24;padding:28px 36px;border-radius:12px 12px 0 0;">
                <p style="color:#F4C430;font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;margin:0;">AgriPro Catalyst W</p>
            </div>
            <div style="background:#ffffff;padding:32px 36px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
                <p style="font-size:15px;">${html}</p>
                <p style="margin-top:28px;color:#6b7280;font-size:13px;">
                    Questions? Reply to this email or reach us at
                    <a href="mailto:info@agriprohub.com" style="color:#0B2C24;">info@agriprohub.com</a>
                </p>
            </div>
        </div>
    `;
}

export async function POST(request: NextRequest) {
    if (!resend) {
        return NextResponse.json({ error: 'Email service not configured.' }, { status: 503 });
    }

    const body = await request.json();
    const { rsvpIds, subject, message } = body as { rsvpIds?: string[]; subject?: string; message?: string };

    if (!Array.isArray(rsvpIds) || rsvpIds.length === 0) {
        return NextResponse.json({ error: 'Select at least one registrant.' }, { status: 400 });
    }
    if (!subject?.trim() || !message?.trim()) {
        return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
    }
    if (rsvpIds.length > 500) {
        return NextResponse.json({ error: 'Too many recipients in one send (max 500).' }, { status: 400 });
    }

    const { data: rsvps, error: fetchError } = await supabase
        .from('catalyst_w_webinar_rsvps')
        .select('id, full_name, email')
        .in('id', rsvpIds);

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    if (!rsvps || rsvps.length === 0) {
        return NextResponse.json({ error: 'No matching registrants found.' }, { status: 404 });
    }

    // De-dupe by email — the same person may have RSVP'd to multiple webinars
    // and be selected twice; they should only get one copy of this email.
    const seen = new Set<string>();
    const recipients = rsvps.filter((r) => {
        const key = r.email.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    let sent = 0;
    const failed: string[] = [];

    for (const r of recipients) {
        const firstName = r.full_name?.trim().split(' ')[0] || 'there';
        try {
            const { error } = await resend.emails.send({
                from: FROM,
                to: r.email,
                subject: subject.trim(),
                html: renderEmailHtml(message.trim(), firstName),
            });
            if (error) throw error;
            sent++;
        } catch (err) {
            console.error(`Bulk email failed for ${r.email}:`, err);
            failed.push(r.email);
        }
    }

    return NextResponse.json({ sent, failed, total: recipients.length });
}
