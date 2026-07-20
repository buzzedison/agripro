import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { buildBrandedEmail, plainTextToHtml } from '@/lib/email/branded-email';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const TEMPLATES = {
    shortlist: (name: string, role: string) => ({
        subject: 'You\'ve been shortlisted — Women Catalyst Fellowship',
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
<div style="background:#050A08;padding:28px 36px;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;font-size:20px;margin:0;">You've been shortlisted! 🌱</h1>
<p style="color:#9ca3af;margin:6px 0 0;font-size:14px;">Women Catalyst Fellowship — AgriPro Cohort 2</p>
</div>
<div style="padding:28px 36px;border:1px solid #e5e7eb;border-top:none;">
<p>Hi ${name},</p>
<p>Congratulations! After reviewing your application for the <strong>${role}</strong> position, our fellowship committee has shortlisted you for the next stage.</p>
<p><strong>Next step:</strong> You will receive a separate email with a link to schedule your 30-minute virtual interview within the next 48 hours.</p>
<p>Well done and we look forward to speaking with you.</p>
<p>— The AgriPro Fellowship Team</p>
</div></div>`,
    }),
    accept: (name: string, role: string) => ({
        subject: 'Welcome to the Women Catalyst Fellowship — Offer letter',
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
<div style="background:#050A08;padding:28px 36px;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;font-size:20px;margin:0;">Welcome to Catalyst W! 🎉</h1>
<p style="color:#9ca3af;margin:6px 0 0;font-size:14px;">Women Catalyst Fellowship — AgriPro Cohort 2</p>
</div>
<div style="padding:28px 36px;border:1px solid #e5e7eb;border-top:none;">
<p>Hi ${name},</p>
<p>We are thrilled to offer you a place in the <strong>AgriPro Women Catalyst Fellowship, Cohort 2</strong> as a <strong>${role}</strong>.</p>
<p>Your passion, experience and motivation stood out and we believe you'll make an incredible contribution to the programme.</p>
<p>You will receive your onboarding pack and fellowship agreement shortly. Please confirm your acceptance by replying to this email within 5 days.</p>
<p>Welcome to the team!</p>
<p>— The AgriPro Fellowship Team</p>
</div></div>`,
    }),
    reject: (name: string) => ({
        subject: 'Your Women Catalyst Fellowship application',
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
<div style="background:#050A08;padding:28px 36px;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;font-size:20px;margin:0;">Application update</h1>
<p style="color:#9ca3af;margin:6px 0 0;font-size:14px;">Women Catalyst Fellowship — AgriPro Cohort 2</p>
</div>
<div style="padding:28px 36px;border:1px solid #e5e7eb;border-top:none;">
<p>Hi ${name},</p>
<p>Thank you for taking the time to apply to the AgriPro Women Catalyst Fellowship. After careful review, we are unable to move forward with your application for this cohort.</p>
<p>This was a highly competitive process and we encourage you to apply again for future cohorts. We'd also love to stay connected — follow AgriPro for upcoming programmes and opportunities.</p>
<p>Thank you again for your interest.</p>
<p>— The AgriPro Fellowship Team</p>
</div></div>`,
    }),
    interview: (name: string, role: string) => ({
        subject: 'Interview invitation — Women Catalyst Fellowship',
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
<div style="background:#050A08;padding:28px 36px;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;font-size:20px;margin:0;">Interview invitation</h1>
<p style="color:#9ca3af;margin:6px 0 0;font-size:14px;">Women Catalyst Fellowship — AgriPro Cohort 2</p>
</div>
<div style="padding:28px 36px;border:1px solid #e5e7eb;border-top:none;">
<p>Hi ${name},</p>
<p>We'd love to invite you to a 30-minute virtual interview for the <strong>${role}</strong> position in the Women Catalyst Fellowship.</p>
<p>Please reply to this email with your availability over the next 7 days (include your timezone) and we will confirm a time.</p>
<p>— The AgriPro Fellowship Team</p>
</div></div>`,
    }),
    reviewing: (name: string, role: string) => ({
        subject: 'Your application is under review — Women Catalyst Fellowship',
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
<div style="background:#050A08;padding:28px 36px;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;font-size:20px;margin:0;">Application under review</h1>
<p style="color:#9ca3af;margin:6px 0 0;font-size:14px;">Women Catalyst Fellowship — AgriPro Cohort 2</p>
</div>
<div style="padding:28px 36px;border:1px solid #e5e7eb;border-top:none;">
<p>Hi ${name},</p>
<p>Thank you for your patience. Your application for the <strong>${role}</strong> position is currently being reviewed by our fellowship committee.</p>
<p>We expect to share an update within the next 7–10 days. No action is needed from you at this time.</p>
<p>— The AgriPro Fellowship Team</p>
</div></div>`,
    }),
    follow_up: (name: string, role: string) => ({
        subject: 'Following up — Women Catalyst Fellowship',
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
<div style="background:#050A08;padding:28px 36px;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;font-size:20px;margin:0;">Following up</h1>
<p style="color:#9ca3af;margin:6px 0 0;font-size:14px;">Women Catalyst Fellowship — AgriPro Cohort 2</p>
</div>
<div style="padding:28px 36px;border:1px solid #e5e7eb;border-top:none;">
<p>Hi ${name},</p>
<p>We wanted to follow up regarding your application for the <strong>${role}</strong> position in the Women Catalyst Fellowship.</p>
<p>If you have any outstanding items or questions, please reply to this email at your earliest convenience. We want to make sure we have everything we need to move your application forward.</p>
<p>— The AgriPro Fellowship Team</p>
</div></div>`,
    }),
    paid: (name: string, role: string) => ({
        subject: 'Payment confirmed — Women Catalyst Fellowship',
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
<div style="background:#050A08;padding:28px 36px;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;font-size:20px;margin:0;">Payment confirmed ✓</h1>
<p style="color:#9ca3af;margin:6px 0 0;font-size:14px;">Women Catalyst Fellowship — AgriPro Cohort 2</p>
</div>
<div style="padding:28px 36px;border:1px solid #e5e7eb;border-top:none;">
<p>Hi ${name},</p>
<p>We have received your fellowship fee payment. You are now fully confirmed as a <strong>${role}</strong> in the AgriPro Women Catalyst Fellowship, Cohort 2.</p>
<p>Your onboarding pack with programme schedule, access details, and fellowship agreement will be sent within 48 hours.</p>
<p>Welcome aboard!</p>
<p>— The AgriPro Fellowship Team</p>
</div></div>`,
    }),
};

export async function POST(request: NextRequest) {
    if (!resend) return NextResponse.json({ error: 'Email not configured' }, { status: 503 });

    const { email, name, role, template, subject: customSubject, body: customBody } = await request.json();
    if (!email || !name || !template) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    if (template === 'custom') {
        if (!customSubject?.trim() || !customBody?.trim()) {
            return NextResponse.json({ error: 'Subject and body required for custom emails' }, { status: 400 });
        }
        const html = buildBrandedEmail({
            headerTitle: customSubject.trim(),
            subtitle: 'Women Catalyst Fellowship — AgriPro Cohort 2',
            recipientName: name.split(' ')[0],
            bodyHtml: plainTextToHtml(customBody),
            signOff: '— The AgriPro Fellowship Team',
            headerBg: '#050A08',
        });
        try {
            await resend.emails.send({
                from: 'AgriPro Fellowship <noreply@agriprohub.com>',
                to: email,
                subject: customSubject.trim(),
                html,
            });
            return NextResponse.json({ success: true });
        } catch (err: any) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    }

    const roleLabel = role || 'Fellow';
    const t = TEMPLATES[template as keyof typeof TEMPLATES];
    if (!t) return NextResponse.json({ error: 'Unknown template' }, { status: 400 });

    const { subject, html } = t(name, roleLabel);

    try {
        await resend.emails.send({
            from: 'AgriPro Fellowship <noreply@agriprohub.com>',
            to: email,
            subject,
            html,
        });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
