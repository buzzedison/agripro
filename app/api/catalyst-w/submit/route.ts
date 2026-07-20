import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'AgriPro Catalyst W <noreply@agriprohub.com>'
const ADMIN_EMAIL = (process.env.ADMIN_NOTIFICATION_EMAILS || 'edison@agriprohub.com')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)

const typeLabels: Record<string, string> = {
    apply: 'Cohort 2026 Application',
    prospectus: 'Prospectus Request',
    plan: 'Programme Plan Selection',
}

const confirmationCopy: Record<string, string> = {
    apply: `Thank you for applying to AgriPro Catalyst W — Cohort 2026. We are thrilled by your ambition and commitment to building Africa's food future. Our team will review your application and be in touch within 10 business days. In the meantime, explore the Africa Food Futures summit at agriprohub.com/africa-food-futures.`,
    prospectus: `Your prospectus request has been received. We will send you the full AgriPro Catalyst W programme prospectus within 2 business days. If you have any immediate questions, reply to this email.`,
    plan: `Thank you for selecting your Catalyst W programme plan. Our team will reach out to confirm your place and guide you through the next steps. Applications open March 2026 — we will keep you updated.`,
}

const LEGACY_FIELDS = new Set([
    'full_name',
    'email',
    'country',
    'phone',
    'business_name',
    'business_stage',
    'sector',
    'plan_tier',
    'why_apply',
    'revenue',
    'team_size',
    'website',
    'organisation',
    'role',
    'interest',
])

function normalizeSubmissionFields(fields: Record<string, any>) {
    const next = { ...fields }
    if (typeof next.partner_needs === 'string' && next.partner_needs.trim()) {
        next.partner_needs = [next.partner_needs.trim()]
    }
    if (next.type === 'apply' || fields.primary_constraint || fields.support_needed) {
        next.participant_status = next.participant_status ?? 'applicant'
        next.support_priority = next.support_priority ?? 'medium'
        next.readiness_stage = next.readiness_stage ?? 'diagnosis'
        next.cohort_year = next.cohort_year ?? 2026
    }
    return next
}

function legacyOnly(fields: Record<string, any>) {
    return Object.fromEntries(Object.entries(fields).filter(([key]) => LEGACY_FIELDS.has(key)))
}

function isMissingOpsColumn(error: any) {
    const message = String(error?.message ?? '')
    return error?.code === '42703' || error?.code === 'PGRST204' || message.includes('schema cache')
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { type, ...fields } = body

        if (!type || !fields.full_name || !fields.email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const normalizedFields = normalizeSubmissionFields({ ...fields, type })
        const insertPayload = { type, ...normalizedFields }

        // 1. Save to Supabase
        let { data, error } = await supabase
            .from('catalyst_submissions')
            .insert(insertPayload)
            .select('id')
            .single()

        if (error && isMissingOpsColumn(error)) {
            const retry = await supabase
                .from('catalyst_submissions')
                .insert({ type, ...legacyOnly(fields) })
                .select('id')
                .single()
            data = retry.data
            error = retry.error
        }

        if (error) {
            console.error('Supabase insert error:', error)
            return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
        }

        if (!data) {
            console.error('Supabase insert returned no submission row')
            return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
        }

        const label = typeLabels[type] || type

        // Notifications are best-effort: the submission is already saved, so an
        // email failure (bad key, unverified domain, rate limit) must NOT surface
        // as a failed submission to the applicant.
        try {
        // 2. Admin notification
        const fieldRows = Object.entries(fields)
            .filter(([, v]) => v)
            .map(([k, v]) => `<tr>
        <td style="padding:6px 12px;font-weight:600;color:#374151;white-space:nowrap;border-bottom:1px solid #f3f4f6;text-transform:capitalize">${k.replace(/_/g, ' ')}</td>
        <td style="padding:6px 12px;color:#111827;border-bottom:1px solid #f3f4f6">${v}</td>
      </tr>`)
            .join('')

        await resend.emails.send({
            from: FROM,
            to: ADMIN_EMAIL,
            subject: `[Catalyst W] ${label}: ${fields.full_name}`,
            html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827">
          <div style="background:#0B2C24;padding:24px 32px;border-radius:12px 12px 0 0">
            <p style="color:#F4C430;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px">AgriPro Catalyst W · 2026</p>
            <h1 style="color:white;margin:0;font-size:22px">New ${label}</h1>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;overflow:hidden">
            <table style="width:100%;border-collapse:collapse">${fieldRows}</table>
            <div style="padding:20px 24px;background:#f9fafb;border-top:1px solid #e5e7eb">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/catalyst-w" style="display:inline-block;background:#0B2C24;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
                View in Admin →
              </a>
              <p style="color:#9ca3af;font-size:12px;margin:12px 0 0">Submission ID: ${data.id}</p>
            </div>
          </div>
        </div>
      `,
        })

        // 3. Confirmation to submitter
        await resend.emails.send({
            from: FROM,
            to: [fields.email],
            subject: `We've received your ${label} — AgriPro Catalyst W`,
            html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827">
          <div style="background:#0B2C24;padding:24px 32px;border-radius:12px 12px 0 0">
            <p style="color:#F4C430;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px">AgriPro Catalyst W · Pan-African Accelerator</p>
            <h1 style="color:white;margin:0;font-size:22px">Thank you, ${fields.full_name.split(' ')[0]}!</h1>
          </div>
          <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
            <p style="font-size:16px;line-height:1.7;color:#374151">${confirmationCopy[type] || 'Thank you for your submission. Our team will be in touch shortly.'}</p>
            <div style="margin:28px 0;padding:20px;background:#f0fdf4;border-radius:10px;border-left:4px solid #0B2C24">
              <p style="margin:0;font-size:13px;color:#065f46;font-weight:600">What happens next?</p>
              <p style="margin:8px 0 0;font-size:14px;color:#374151">Our team reviews all submissions within 10 business days. Keep an eye on your inbox — we'll reach out to the email address you provided.</p>
            </div>
            <p style="color:#6b7280;font-size:13px">Questions? Reply to this email or contact us at <a href="mailto:info@agriprohub.com" style="color:#0B2C24">info@agriprohub.com</a></p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0">
            <p style="color:#9ca3af;font-size:12px;margin:0">AgriPro Catalyst W 2026 · The Pan-African Accelerator for Women Agripreneurs<br>Organised by AgriPro Hub</p>
          </div>
        </div>
      `,
        })
        } catch (emailError) {
            console.error('Catalyst notification email failed (submission was saved):', emailError)
        }

        return NextResponse.json({ success: true, id: data.id })
    } catch (err) {
        console.error('Catalyst submission error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
