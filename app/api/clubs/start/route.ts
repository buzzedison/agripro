import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAILS = ['edison@agriprohub.com', 'info@agriprohub.com'];
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriprohub.com';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            full_name, email, phone, institution,
            city, country, role, estimated_members,
            motivation, referral,
        } = body;

        // Basic validation
        if (!full_name || !email || !institution || !city || !country || !role || !motivation) {
            return NextResponse.json(
                { error: 'Please fill in all required fields.' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from('club_applications')
            .insert({
                full_name: full_name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone?.trim() || null,
                institution: institution.trim(),
                city: city.trim(),
                country,
                role,
                estimated_members: estimated_members || null,
                motivation: motivation.trim(),
                referral: referral || null,
                status: 'pending',
            });

        if (error) {
            console.error('Club application insert error:', error);
            return NextResponse.json(
                { error: 'Failed to save your application. Please try again.' },
                { status: 500 }
            );
        }

        // Send emails (non-blocking — don't fail the request if email errors)
        if (resend) {
            const roleLabels: Record<string, string> = {
                student: 'Student',
                faculty: 'Faculty / Staff',
                alumni: 'Alumni',
                other: 'Other',
            };

            // 1. Confirmation to applicant
            resend.emails.send({
                from: 'AgriPro Clubs <noreply@agriprohub.com>',
                to: email.trim().toLowerCase(),
                subject: 'Your AgriPro Club application — we\'ve received it!',
                html: `
                    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#111827;line-height:1.6;">
                        <div style="background:#050A08;padding:32px 40px;border-radius:12px 12px 0 0;">
                            <img src="${SITE_URL}/logo-white.png" alt="AgriPro" height="32" style="display:block;" onerror="this.style.display='none'" />
                            <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:24px 0 0;">Application received!</h1>
                        </div>
                        <div style="background:#ffffff;padding:32px 40px;border:1px solid #e5e7eb;border-top:none;">
                            <p>Hi ${full_name.trim()},</p>
                            <p>Thanks for applying to start an AgriPro Club at <strong>${institution.trim()}</strong>. We're excited to hear from you!</p>
                            <p>Our team will review your application and get back to you within <strong>5–7 business days</strong>. If we need more information, we'll reach out to you directly at this email address.</p>

                            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;margin:24px 0;">
                                <p style="margin:0 0 12px;font-weight:700;color:#15803d;">What happens next?</p>
                                <ol style="margin:0;padding-left:20px;color:#374151;">
                                    <li style="margin-bottom:8px;">Our clubs team reviews your application</li>
                                    <li style="margin-bottom:8px;">We'll schedule a brief onboarding call with you</li>
                                    <li style="margin-bottom:8px;">Your club gets officially launched with full AgriPro support</li>
                                </ol>
                            </div>

                            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
                                <tr style="border-bottom:1px solid #f3f4f6;">
                                    <td style="padding:10px 0;color:#6b7280;width:40%;">Institution</td>
                                    <td style="padding:10px 0;font-weight:600;">${institution.trim()}</td>
                                </tr>
                                <tr style="border-bottom:1px solid #f3f4f6;">
                                    <td style="padding:10px 0;color:#6b7280;">Location</td>
                                    <td style="padding:10px 0;font-weight:600;">${city.trim()}, ${country}</td>
                                </tr>
                                <tr style="border-bottom:1px solid #f3f4f6;">
                                    <td style="padding:10px 0;color:#6b7280;">Your role</td>
                                    <td style="padding:10px 0;font-weight:600;">${roleLabels[role] || role}</td>
                                </tr>
                                ${estimated_members ? `<tr><td style="padding:10px 0;color:#6b7280;">Estimated members</td><td style="padding:10px 0;font-weight:600;">${estimated_members}</td></tr>` : ''}
                            </table>

                            <p style="margin-top:24px;">Have questions in the meantime? Reply to this email or reach us at <a href="mailto:clubs@agriprohub.com" style="color:#15803d;font-weight:600;">clubs@agriprohub.com</a>.</p>
                            <p style="margin-top:24px;">— The AgriPro Clubs Team</p>
                        </div>
                        <div style="padding:20px 40px;text-align:center;font-size:12px;color:#9ca3af;">
                            <p style="margin:0;">© ${new Date().getFullYear()} AgriPro Hub. All rights reserved.</p>
                            <p style="margin:4px 0 0;">This email was sent because you submitted a club application at <a href="${SITE_URL}" style="color:#15803d;">${SITE_URL}</a>.</p>
                        </div>
                    </div>
                `,
            }).catch((err: unknown) => console.error('Applicant confirmation email error:', err));

            // 2. Admin notification
            resend.emails.send({
                from: 'AgriPro Clubs <noreply@agriprohub.com>',
                to: ADMIN_EMAILS,
                subject: `🌱 New club application — ${institution.trim()} (${city.trim()}, ${country})`,
                html: `
                    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#111827;line-height:1.6;">
                        <h2 style="color:#065f46;margin-bottom:4px;">New Club Application</h2>
                        <p style="color:#6b7280;margin-top:0;font-size:14px;">Submitted ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>

                        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;margin:20px 0;">
                            <p style="margin:0 0 8px;"><strong>Name:</strong> ${full_name.trim()}</p>
                            <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${email.trim()}" style="color:#15803d;">${email.trim()}</a></p>
                            ${phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${phone.trim()}</p>` : ''}
                            <p style="margin:0 0 8px;"><strong>Institution:</strong> ${institution.trim()}</p>
                            <p style="margin:0 0 8px;"><strong>Location:</strong> ${city.trim()}, ${country}</p>
                            <p style="margin:0 0 8px;"><strong>Role:</strong> ${roleLabels[role] || role}</p>
                            ${estimated_members ? `<p style="margin:0 0 8px;"><strong>Estimated members:</strong> ${estimated_members}</p>` : ''}
                            ${referral ? `<p style="margin:0;"><strong>How they heard about us:</strong> ${referral}</p>` : ''}
                        </div>

                        <div style="background:#fafafa;border-left:3px solid #16a34a;padding:12px 16px;margin:16px 0;">
                            <strong style="font-size:13px;color:#374151;">Motivation</strong>
                            <p style="margin:8px 0 0;color:#374151;font-size:14px;white-space:pre-wrap;">${motivation.trim()}</p>
                        </div>

                        <p style="margin-top:24px;color:#6b7280;font-size:13px;">Review all applications in the admin dashboard.</p>
                    </div>
                `,
            }).catch((err: unknown) => console.error('Admin notification email error:', err));
        } else {
            console.warn('Resend API key not configured — skipping club application emails');
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Club application error:', err);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
