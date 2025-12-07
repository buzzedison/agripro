import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Admin emails to notify when new submissions arrive
const ADMIN_EMAILS = process.env.ADMIN_NOTIFICATION_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) || []

type Status = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published'

export async function sendContributorStatusEmail({
  to,
  status,
  title,
  reviewer,
  note,
  insightSlug,
}: {
  to: string
  status: Status
  title: string
  reviewer?: string
  note?: string
  insightSlug?: string
}) {
  if (!resend) {
    console.warn('Resend API key missing; skipping contributor email notification')
    return
  }

  const subjectMap: Record<Status, string> = {
    draft: `Draft saved: ${title}`,
    submitted: `Submission received: ${title}`,
    approved: `Approved: ${title}`,
    rejected: `Updates requested: ${title}`,
    published: `Published: ${title}`,
  }

  const statusCopy: Record<Status, string> = {
    draft: 'Your draft has been saved — keep editing when you’re ready.',
    submitted: 'Thanks for submitting! Our editorial team will review and respond shortly.',
    approved: 'Great news! Your piece has been approved and will be scheduled for publication.',
    rejected: 'The editorial team has requested some adjustments before we can publish.',
    published: 'Your article is now live on the AgriPro Knowledge Hub.',
  }

  const reviewerLine = reviewer ? `<p><strong>Reviewer:</strong> ${reviewer}</p>` : ''
  const noteBlock = note
    ? `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #16a34a;background:#f0fdf4;"><strong>Reviewer Notes</strong><p style="margin:8px 0 0;">${note}</p></div>`
    : ''
  const liveLink = insightSlug
    ? `<p style="margin-top:16px"><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://agriprohub.com'}/knowledgehub/insights/${insightSlug}" style="color:#15803d;font-weight:600;">View your published article →</a></p>`
    : ''

  await resend.emails.send({
    from: 'AgriPro Knowledge Hub <noreply@agriprohub.com>',
    to,
    subject: subjectMap[status],
    html: `
      <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#064e3b;line-height:1.5;">
        <p>Hi there,</p>
        <p>${statusCopy[status]}</p>
        ${reviewerLine}
        <p><strong>Title:</strong> ${title}</p>
        ${noteBlock}
        ${liveLink}
        <p style="margin-top:24px;">— AgriPro Knowledge Hub Editorial Team</p>
      </div>
    `,
  })
}

/**
 * Send notification to admin editors when a new submission is received
 */
export async function sendAdminNewSubmissionEmail({
  contributorEmail,
  contributorName,
  title,
  submissionType,
  excerpt,
  submissionId,
}: {
  contributorEmail: string
  contributorName?: string
  title: string
  submissionType: string
  excerpt: string
  submissionId: string
}) {
  if (!resend) {
    console.warn('Resend API key missing; skipping admin notification email')
    return
  }

  if (ADMIN_EMAILS.length === 0) {
    console.warn('No admin emails configured; skipping admin notification. Set ADMIN_NOTIFICATION_EMAILS env var.')
    return
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriprohub.com'
  const reviewUrl = `${siteUrl}/admin/knowledge-hub/contributors`

  const submissionTypeLabels: Record<string, string> = {
    insight: 'Insight Article',
    bestPractice: 'Best Practice',
    research: 'Research Summary',
    whitepaper: 'Whitepaper',
  }

  const typeLabel = submissionTypeLabels[submissionType] || submissionType

  await resend.emails.send({
    from: 'AgriPro Knowledge Hub <noreply@agriprohub.com>',
    to: ADMIN_EMAILS,
    subject: `📝 New submission for review: ${title}`,
    html: `
      <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#064e3b;line-height:1.6;">
        <h2 style="color:#065f46;margin-bottom:16px;">New Knowledge Hub Submission</h2>
        
        <p>A contributor has submitted a new article for review.</p>
        
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 8px;"><strong>Title:</strong> ${title}</p>
          <p style="margin:0 0 8px;"><strong>Type:</strong> ${typeLabel}</p>
          <p style="margin:0 0 8px;"><strong>Contributor:</strong> ${contributorName || contributorEmail}</p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${contributorEmail}</p>
        </div>
        
        <div style="background:#fafafa;border-left:3px solid #16a34a;padding:12px 16px;margin:16px 0;">
          <strong>Excerpt:</strong>
          <p style="margin:8px 0 0;color:#374151;">${excerpt}</p>
        </div>
        
        <p style="margin-top:24px;">
          <a href="${reviewUrl}" style="display:inline-block;background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
            Review Submission →
          </a>
        </p>
        
        <p style="margin-top:24px;color:#6b7280;font-size:14px;">
          — AgriPro Knowledge Hub System
        </p>
      </div>
    `,
  })

  console.log(`Admin notification sent to ${ADMIN_EMAILS.length} recipient(s) for submission: ${title}`)
}
