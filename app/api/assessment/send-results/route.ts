import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { invitation_id, result_id } = await request.json()

    if (!invitation_id) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 })
    }

    // Get invitation details with fellowship application info
    const { data: invitation, error: inviteError } = await supabase
      .from('assessment_invitations')
      .select(`
        *,
        fellowship_applications (
          first_name,
          last_name,
          email,
          phone,
          country,
          current_role,
          organization
        )
      `)
      .eq('id', invitation_id)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Get assessment result
    const { data: result, error: resultError } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('invitation_id', invitation_id)
      .single()

    if (resultError || !result) {
      return NextResponse.json({ error: 'Assessment result not found' }, { status: 404 })
    }

    // Get response count
    const { count: responseCount, error: countError } = await supabase
      .from('assessment_responses')
      .select('*', { count: 'exact', head: true })
      .eq('invitation_id', invitation_id)

    const applicant = invitation.fellowship_applications

    // Send results email
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AgriProHub Fellowship Assessment Results</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px 20px; border-radius: 0 0 10px 10px; }
    .result-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
    .status-pending { background: #fef3c7; color: #d97706; }
    .next-steps { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 AgriProHub Fellowship</h1>
      <h2>Assessment Submission Confirmed</h2>
    </div>

    <div class="content">
      <p>Dear ${applicant.first_name} ${applicant.last_name},</p>

      <p>Thank you for completing the AgriProHub Fellowship strategic assessment! We have successfully received your responses.</p>

      <div class="result-box">
        <h3>📊 Your Assessment Summary</h3>
        <ul>
          <li><strong>Questions Answered:</strong> ${responseCount || 0} of 15</li>
          <li><strong>Submission Date:</strong> ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</li>
          <li><strong>Current Status:</strong> <span class="status-badge status-pending">Under Review</span></li>
        </ul>
      </div>

      <div class="next-steps">
        <h3>🚀 What's Next?</h3>
        <ol>
          <li><strong>Expert Review (2-3 business days):</strong> Our assessment panel will carefully review your responses to our strategic questions</li>
          <li><strong>Detailed Feedback:</strong> You will receive comprehensive feedback highlighting your strengths and areas for development</li>
          <li><strong>Interview Invitation:</strong> If shortlisted, you may be invited for a virtual interview with our selection committee</li>
          <li><strong>Final Results:</strong> All candidates will receive their final fellowship decisions within 1 week</li>
        </ol>
      </div>

      <p><strong>About the AgriProHub Fellowship:</strong></p>
      <p>The AgriProHub Fellowship is designed to identify and nurture the next generation of African agricultural leaders. Through this program, fellows gain access to:</p>
      <ul>
        <li>• Mentorship from industry experts</li>
        <li>• Hands-on project experience</li>
        <li>• Professional development workshops</li>
        <li>• Networking opportunities with key stakeholders</li>
        <li>• Potential funding for innovative agricultural solutions</li>
      </ul>

      <p>If you have any questions about your submission or the fellowship program, please don't hesitate to contact us at <a href="mailto:fellowship@agriprohub.com">fellowship@agriprohub.com</a>.</p>

      <p>Best regards,<br>
      <strong>The AgriProHub Fellowship Team</strong></p>

      <div class="footer">
        <p>This email was sent to ${applicant.email}</p>
        <p>AgriProHub | Transforming African Agriculture</p>
      </div>
    </div>
  </div>
</body>
</html>`

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'AgriProHub Fellowship <fellowship@updates.agriprohub.com>',
      to: [applicant.email],
      subject: 'AgriProHub Fellowship Assessment - Submission Confirmed',
      html: emailHtml,
    })

    if (emailError) {
      console.error('Error sending results email:', emailError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    console.log('Results email sent successfully:', emailData)

    return NextResponse.json({
      success: true,
      message: 'Results email sent successfully',
      email_id: emailData?.id
    })

  } catch (error) {
    console.error('Send results email error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
