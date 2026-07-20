import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = 'AgriPro Catalyst W <noreply@agriprohub.com>';

const wrap = (title: string, body: string) => `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
<div style="background:#0B2C24;padding:28px 36px;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;font-size:20px;margin:0;">${title}</h1>
<p style="color:#9ca3af;margin:6px 0 0;font-size:14px;">AgriPro Catalyst W — Cohort 2026</p>
</div>
<div style="padding:28px 36px;border:1px solid #e5e7eb;border-top:none;">
${body}
<p style="margin-top:24px;">— The AgriPro Catalyst W Team</p>
</div></div>`;

const TEMPLATES = {
    reviewed: (name: string, business?: string) => ({
        subject: 'Your Catalyst W application is under review',
        html: wrap('Application under review', `
<p>Hi ${name},</p>
<p>Thank you for applying to AgriPro Catalyst W${business ? ` with <strong>${business}</strong>` : ''}. Our team is currently reviewing your submission.</p>
<p>We expect to share an update within 7–10 business days. No action is needed from you at this time.</p>`),
    }),
    interview: (name: string, business?: string) => ({
        subject: 'Interview invitation — AgriPro Catalyst W',
        html: wrap('Interview invitation', `
<p>Hi ${name},</p>
<p>We'd love to invite you to a virtual interview${business ? ` about <strong>${business}</strong>` : ''} as part of your Catalyst W application.</p>
<p>Please reply to this email with your availability over the next 7 days (include your timezone) and we will confirm a time.</p>`),
    }),
    accept: (name: string, business?: string) => ({
        subject: 'Welcome to AgriPro Catalyst W — Cohort 2026',
        html: wrap('Congratulations — you\'re in! 🎉', `
<p>Hi ${name},</p>
<p>We are thrilled to offer you a place in <strong>AgriPro Catalyst W, Cohort 2026</strong>${business ? ` for <strong>${business}</strong>` : ''}.</p>
<p>Your ambition and commitment to building Africa's food future stood out. You will receive onboarding details and next steps within 48 hours.</p>
<p>Please confirm your acceptance by replying to this email within 5 days.</p>`),
    }),
    paid: (name: string, business?: string) => ({
        subject: 'Payment confirmed — AgriPro Catalyst W',
        html: wrap('Payment confirmed ✓', `
<p>Hi ${name},</p>
<p>We have received your programme fee payment. You are now fully confirmed in <strong>AgriPro Catalyst W, Cohort 2026</strong>${business ? ` for <strong>${business}</strong>` : ''}.</p>
<p>Your onboarding pack with programme schedule, cohort details, and access information will be sent within 48 hours.</p>
<p>Welcome aboard!</p>`),
    }),
    waitlist: (name: string) => ({
        subject: 'Catalyst W application update — waitlisted',
        html: wrap('You\'re on our waitlist', `
<p>Hi ${name},</p>
<p>Thank you for applying to AgriPro Catalyst W. While we cannot offer you a place in Cohort 2026 at this time, we have added you to our waitlist.</p>
<p>We will reach out immediately if a spot opens up. We also encourage you to stay connected with AgriPro for future cohorts and summit opportunities.</p>`),
    }),
    follow_up: (name: string, business?: string) => ({
        subject: 'Following up — AgriPro Catalyst W',
        html: wrap('Following up', `
<p>Hi ${name},</p>
<p>We wanted to follow up regarding your Catalyst W application${business ? ` for <strong>${business}</strong>` : ''}.</p>
<p>If you have any outstanding items or questions, please reply to this email at your earliest convenience so we can keep your application moving forward.</p>`),
    }),
    reject: (name: string) => ({
        subject: 'Your AgriPro Catalyst W application',
        html: wrap('Application update', `
<p>Hi ${name},</p>
<p>Thank you for your interest in AgriPro Catalyst W. After careful review, we are unable to move forward with your application for Cohort 2026.</p>
<p>This was a highly competitive process. We encourage you to stay connected — follow AgriPro for future cohorts, summit opportunities, and programmes.</p>
<p>Thank you again for your interest.</p>`),
    }),
};

export async function POST(request: NextRequest) {
    if (!resend) return NextResponse.json({ error: 'Email not configured' }, { status: 503 });

    const { email, name, business, template } = await request.json();
    if (!email || !name || !template) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const t = TEMPLATES[template as keyof typeof TEMPLATES];
    if (!t) return NextResponse.json({ error: 'Unknown template' }, { status: 400 });

    const { subject, html } = t(name, business);

    try {
        await resend.emails.send({ from: FROM, to: email, subject, html });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
