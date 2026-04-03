import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAILS = ['edison@agriprohub.com', 'info@agriprohub.com'];
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriprohub.com';

const ROLE_LABELS: Record<string, string> = {
    fellowship_director: 'Fellowship Director',
    regional_lead: 'Regional Lead',
    partnerships_fellow: 'Partnerships Fellow',
    outreach_fellow: 'Outreach & Recruitment Fellow',
    operations_fellow: 'Operations Fellow',
    content_comms_fellow: 'Content & Comms Fellow',
};

const REGION_LABELS: Record<string, string> = {
    west_africa: 'West Africa',
    east_africa: 'East Africa',
    southern_africa: 'Southern Africa',
    central_africa: 'Central Africa',
    north_africa: 'North Africa',
    open: 'Open / Remote',
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { full_name, email, phone, country, region, role, linkedin_url, motivation, experience, availability } = body;

        if (!full_name || !email || !role || !motivation) {
            return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
        }

        const supabase = await createClient();

        const { error: dbError } = await supabase.from('catalyst_w_fellowship_applications').insert({
            full_name: full_name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || null,
            country: country || null,
            region: region || null,
            role,
            linkedin_url: linkedin_url?.trim() || null,
            motivation: motivation.trim(),
            experience: experience?.trim() || null,
            availability: availability || null,
            status: 'pending',
        });

        if (dbError) {
            if (dbError.code === '23505') {
                return NextResponse.json({ error: 'An application from this email already exists.' }, { status: 409 });
            }
            console.error('Catalyst W fellowship insert error:', dbError);
            return NextResponse.json({ error: 'Failed to save your application. Please try again.' }, { status: 500 });
        }

        const roleLabel = ROLE_LABELS[role] || role;
        const regionLabel = REGION_LABELS[region] || region || 'Not specified';

        // Confirmation to applicant
        if (resend) {
            resend.emails.send({
                from: 'AgriPro Fellowship <noreply@agriprohub.com>',
                to: email.trim().toLowerCase(),
                subject: 'Your Women Catalyst Fellowship application — received!',
                html: `
                    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#111827;line-height:1.6;">
                        <div style="background:#050A08;padding:32px 40px;border-radius:12px 12px 0 0;">
                            <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0;">Application received.</h1>
                            <p style="color:#9ca3af;margin:8px 0 0;font-size:15px;">Women Catalyst Fellowship — AgriPro Cohort 2</p>
                        </div>
                        <div style="background:#ffffff;padding:32px 40px;border:1px solid #e5e7eb;border-top:none;">
                            <p>Hi ${full_name.trim()},</p>
                            <p>Thank you for applying to the AgriPro Women Catalyst Fellowship. We've received your application for the <strong>${roleLabel}</strong> role and our team will review it carefully.</p>

                            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;margin:24px 0;">
                                <p style="margin:0 0 12px;font-weight:700;color:#15803d;font-size:14px;">WHAT HAPPENS NEXT</p>
                                <ol style="margin:0;padding-left:20px;color:#374151;font-size:14px;">
                                    <li style="margin-bottom:8px;">Our fellowship committee reviews all applications (within 2 weeks)</li>
                                    <li style="margin-bottom:8px;">Shortlisted candidates are invited to a 30-minute virtual interview</li>
                                    <li style="margin-bottom:8px;">Final offers are sent with onboarding details and your fellowship agreement</li>
                                </ol>
                            </div>

                            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
                                <tr style="border-bottom:1px solid #f3f4f6;">
                                    <td style="padding:10px 0;color:#6b7280;width:40%;">Role applied for</td>
                                    <td style="padding:10px 0;font-weight:600;">${roleLabel}</td>
                                </tr>
                                <tr style="border-bottom:1px solid #f3f4f6;">
                                    <td style="padding:10px 0;color:#6b7280;">Region</td>
                                    <td style="padding:10px 0;font-weight:600;">${regionLabel}</td>
                                </tr>
                                ${country ? `<tr><td style="padding:10px 0;color:#6b7280;">Country</td><td style="padding:10px 0;font-weight:600;">${country}</td></tr>` : ''}
                            </table>

                            <p style="margin-top:24px;">Questions? Reply to this email or reach us at <a href="mailto:fellowship@agriprohub.com" style="color:#15803d;font-weight:600;">fellowship@agriprohub.com</a>.</p>
                            <p style="margin-top:8px;">— The AgriPro Fellowship Team</p>
                        </div>
                        <div style="padding:20px 40px;text-align:center;font-size:12px;color:#9ca3af;">
                            <p style="margin:0;">© ${new Date().getFullYear()} AgriPro Hub. All rights reserved.</p>
                        </div>
                    </div>
                `,
            }).catch((e: unknown) => console.error('Applicant email error:', e));

            // Admin notification
            resend.emails.send({
                from: 'AgriPro Fellowship <noreply@agriprohub.com>',
                to: ADMIN_EMAILS,
                subject: `🌱 New Catalyst W Fellowship application — ${roleLabel} (${regionLabel})`,
                html: `
                    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#111827;line-height:1.6;">
                        <h2 style="color:#065f46;">New Women Catalyst Fellowship Application</h2>
                        <p style="color:#6b7280;font-size:14px;">Submitted ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>

                        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;margin:20px 0;">
                            <p style="margin:0 0 8px;"><strong>Name:</strong> ${full_name.trim()}</p>
                            <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${email.trim()}" style="color:#15803d;">${email.trim()}</a></p>
                            ${phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${phone.trim()}</p>` : ''}
                            <p style="margin:0 0 8px;"><strong>Role:</strong> ${roleLabel}</p>
                            <p style="margin:0 0 8px;"><strong>Region:</strong> ${regionLabel}</p>
                            ${country ? `<p style="margin:0 0 8px;"><strong>Country:</strong> ${country}</p>` : ''}
                            ${linkedin_url ? `<p style="margin:0 0 8px;"><strong>LinkedIn:</strong> <a href="${linkedin_url}" style="color:#15803d;">${linkedin_url}</a></p>` : ''}
                            ${availability ? `<p style="margin:0;"><strong>Availability:</strong> ${availability}</p>` : ''}
                        </div>

                        <div style="background:#fafafa;border-left:3px solid #16a34a;padding:12px 16px;margin:16px 0;">
                            <strong style="font-size:13px;">Motivation</strong>
                            <p style="margin:8px 0 0;color:#374151;font-size:14px;white-space:pre-wrap;">${motivation.trim()}</p>
                        </div>

                        ${experience ? `
                        <div style="background:#fafafa;border-left:3px solid #6b7280;padding:12px 16px;margin:16px 0;">
                            <strong style="font-size:13px;">Relevant Experience</strong>
                            <p style="margin:8px 0 0;color:#374151;font-size:14px;white-space:pre-wrap;">${experience.trim()}</p>
                        </div>` : ''}
                    </div>
                `,
            }).catch((e: unknown) => console.error('Admin email error:', e));
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Catalyst W fellowship application error:', err);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
