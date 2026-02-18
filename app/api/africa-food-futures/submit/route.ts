import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'edison@agriprohub.com'
const FROM = 'Africa Food Futures <noreply@agriprohub.com>'

const typeLabels: Record<string, string> = {
    register: '🎟️ Registration',
    speaker: '🎤 Speaker Application',
    partner: '🌍 Partnership Enquiry',
    sponsor: '🏆 Sponsorship Enquiry',
    exhibitor: '📊 Exhibition Space',
}

const confirmationCopy: Record<string, string> = {
    register: `Thank you for registering your interest for Africa Food Futures 2026! We've received your details and will be in touch with next steps, including payment and confirmation.`,
    speaker: `Thank you for applying to speak at Africa Food Futures 2026! Our programme team will review your application and get back to you within 10 business days.`,
    partner: `Thank you for your interest in partnering with Africa Food Futures 2026! Our partnerships team will be in touch shortly to discuss how we can work together.`,
    sponsor: `Thank you for your interest in sponsoring Africa Food Futures 2026! Our sponsorship team will reach out with our full packages and pricing guide.`,
    exhibitor: `Thank you for your interest in exhibiting at Africa Food Futures 2026! Our events team will be in touch to discuss available floor space and packages.`,
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { type, ...fields } = body

        if (!type || !fields.full_name || !fields.email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Save to Supabase
        const { data, error } = await supabase
            .from('aff_submissions')
            .insert({ type, ...fields })
            .select('id')
            .single()

        if (error) {
            console.error('Supabase insert error:', error)
            return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
        }

        const label = typeLabels[type] || type

        // 2. Admin notification email
        const fieldRows = Object.entries(fields)
            .filter(([, v]) => v)
            .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:600;color:#374151;white-space:nowrap;border-bottom:1px solid #f3f4f6">${k.replace(/_/g, ' ')}</td><td style="padding:6px 12px;color:#111827;border-bottom:1px solid #f3f4f6">${v}</td></tr>`)
            .join('')

        await resend.emails.send({
            from: FROM,
            to: [ADMIN_EMAIL],
            subject: `${label}: ${fields.full_name} — Africa Food Futures 2026`,
            html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827">
          <div style="background:#0B2C24;padding:24px 32px;border-radius:12px 12px 0 0">
            <p style="color:#F4C430;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px">Africa Food Futures 2026</p>
            <h1 style="color:white;margin:0;font-size:22px">New ${label}</h1>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;overflow:hidden">
            <table style="width:100%;border-collapse:collapse">
              ${fieldRows}
            </table>
            <div style="padding:20px 24px;background:#f9fafb;border-top:1px solid #e5e7eb">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/africa-food-futures" style="display:inline-block;background:#0B2C24;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
                View in Admin →
              </a>
              <p style="color:#9ca3af;font-size:12px;margin:12px 0 0">Submission ID: ${data.id}</p>
            </div>
          </div>
        </div>
      `,
        })

        // 3. Confirmation email to submitter
        await resend.emails.send({
            from: FROM,
            to: [fields.email],
            subject: `We've received your ${label} — Africa Food Futures 2026`,
            html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827">
          <div style="background:#0B2C24;padding:24px 32px;border-radius:12px 12px 0 0">
            <p style="color:#F4C430;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px">Africa Food Futures · Kigali, Rwanda · October 2026</p>
            <h1 style="color:white;margin:0;font-size:22px">Thank you, ${fields.full_name.split(' ')[0]}!</h1>
          </div>
          <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
            <p style="font-size:16px;line-height:1.7;color:#374151">${confirmationCopy[type] || 'Thank you for your submission. Our team will be in touch shortly.'}</p>
            <div style="margin:28px 0;padding:20px;background:#f0fdf4;border-radius:10px;border-left:4px solid #0B2C24">
              <p style="margin:0;font-size:13px;color:#065f46;font-weight:600">What happens next?</p>
              <p style="margin:8px 0 0;font-size:14px;color:#374151">Our team reviews all submissions within 10 business days. Keep an eye on your inbox — we'll reach out to the email address you provided.</p>
            </div>
            <p style="color:#6b7280;font-size:13px">Questions? Reply to this email or contact us at <a href="mailto:summit@agriprohub.com" style="color:#0B2C24">summit@agriprohub.com</a></p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0">
            <p style="color:#9ca3af;font-size:12px;margin:0">Africa Food Futures 2026 · Kigali Convention Centre, Rwanda<br>Organised by AgriPro Hub</p>
          </div>
        </div>
      `,
        })

        return NextResponse.json({ success: true, id: data.id })
    } catch (err) {
        console.error('AFF submission error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
