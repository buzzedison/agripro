import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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


