import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriprohub.com';

export async function GET(request: NextRequest) {
    try {
        if (!PAYSTACK_SECRET) {
            return NextResponse.json({ error: 'Payment service not configured.' }, { status: 503 });
        }

        const reference = request.nextUrl.searchParams.get('reference');
        if (!reference) {
            return NextResponse.json({ error: 'Payment reference is required.' }, { status: 400 });
        }

        // Verify with Paystack
        const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        });

        const paystackData = await paystackRes.json();

        if (!paystackData.status || paystackData.data?.status !== 'success') {
            return NextResponse.json({
                verified: false,
                status: paystackData.data?.status || 'failed',
            });
        }

        const txn = paystackData.data;
        const email = txn.customer?.email;
        const amountPaid = txn.amount / 100; // convert from cents
        const currency = txn.currency;
        const donorName = txn.metadata?.donor_name || null;
        const frequency = txn.metadata?.frequency || 'one-time';
        const message = txn.metadata?.message || null;

        // Update donation record to 'completed'
        try {
            const supabase = await createClient();
            await supabase
                .from('donations')
                .update({ status: 'completed', paystack_transaction_id: txn.id })
                .eq('paystack_reference', reference);
        } catch (dbErr) {
            console.error('Donation update error:', dbErr);
        }

        // Send thank-you email (non-blocking)
        if (resend && email) {
            const displayName = donorName || email.split('@')[0];
            resend.emails.send({
                from: 'AgriPro Knowledge Hub <noreply@agriprohub.com>',
                to: email,
                subject: `Thank you for your donation, ${displayName}!`,
                html: `
                    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#111827;line-height:1.6;">
                        <div style="background:#050A08;padding:32px 40px;border-radius:12px 12px 0 0;">
                            <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0;">Thank you!</h1>
                            <p style="color:#9ca3af;margin:8px 0 0;font-size:15px;">Your donation to AgriPro Knowledge Hub</p>
                        </div>
                        <div style="background:#ffffff;padding:32px 40px;border:1px solid #e5e7eb;border-top:none;">
                            <p>Hi ${displayName},</p>
                            <p>Your generosity helps keep the AgriPro Knowledge Hub free and open for agribusiness professionals across Africa. We're genuinely grateful.</p>

                            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;margin:24px 0;">
                                <p style="margin:0 0 10px;font-weight:700;color:#15803d;font-size:14px;">DONATION SUMMARY</p>
                                <table style="width:100%;font-size:14px;border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:6px 0;color:#6b7280;">Amount</td>
                                        <td style="padding:6px 0;font-weight:700;text-align:right;">${currency} ${amountPaid.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 0;color:#6b7280;">Type</td>
                                        <td style="padding:6px 0;font-weight:700;text-align:right;">${frequency === 'monthly' ? 'Monthly recurring' : 'One-time'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 0;color:#6b7280;">Reference</td>
                                        <td style="padding:6px 0;font-weight:600;text-align:right;font-size:12px;color:#9ca3af;">${reference}</td>
                                    </tr>
                                </table>
                            </div>

                            ${message ? `<div style="background:#fafafa;border-left:3px solid #16a34a;padding:12px 16px;margin:16px 0;"><p style="margin:0;font-style:italic;color:#374151;font-size:14px;">"${message}"</p></div>` : ''}

                            <p>Your donation supports free access to research, whitepapers, expert insights, and market intelligence for farmers and agripreneurs across Africa.</p>

                            <p style="margin-top:24px;">
                                <a href="${SITE_URL}/knowledgehub" style="display:inline-block;background:#16a34a;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">
                                    Explore the Knowledge Hub →
                                </a>
                            </p>

                            <p style="margin-top:32px;">With gratitude,<br />— The AgriPro Team</p>
                        </div>
                        <div style="padding:20px 40px;text-align:center;font-size:12px;color:#9ca3af;">
                            <p style="margin:0;">© ${new Date().getFullYear()} AgriPro Hub. All rights reserved.</p>
                            <p style="margin:4px 0 0;">Questions? Email us at <a href="mailto:info@agriprohub.com" style="color:#15803d;">info@agriprohub.com</a></p>
                        </div>
                    </div>
                `,
            }).catch((err: unknown) => console.error('Donation thank-you email error:', err));
        }

        return NextResponse.json({
            verified: true,
            amount: amountPaid,
            currency,
            donorName,
            frequency,
            email,
        });
    } catch (err) {
        console.error('Donation verify error:', err);
        return NextResponse.json({ error: 'Verification failed. Please contact support.' }, { status: 500 });
    }
}
