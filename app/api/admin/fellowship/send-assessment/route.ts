import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { applicationIds } = await request.json()

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json({ error: 'Application IDs are required' }, { status: 400 })
    }

    console.log('Sending assessments to applications:', applicationIds)

    // Get application details for the specified IDs
    const { data: applications, error: appError } = await supabase
      .from('fellowship_applications')
      .select('id, first_name, last_name, email, status')
      .in('id', applicationIds)
      .eq('shortlisted', true)

    if (appError) {
      console.error('Error fetching applications:', appError)
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({ error: 'No shortlisted applications found' }, { status: 404 })
    }

    const sentAssessments = []
    const errors = []

    for (const app of applications) {
      try {
        // Generate unique invitation token
        const token = randomBytes(32).toString('hex')

        // Create assessment invitation
        const { data: invitation, error: inviteError } = await supabase
          .from('assessment_invitations')
          .insert({
            application_id: app.id,
            invitation_token: token,
            email: app.email,
            first_name: app.first_name,
            last_name: app.last_name,
            status: 'sent',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          })
          .select()
          .single()

        if (inviteError) {
          console.error(`Error creating invitation for ${app.email}:`, inviteError)
          errors.push({ email: app.email, error: inviteError.message })
          continue
        }

        // Update application status to assessment_invited
        const { error: statusError } = await supabase
          .from('fellowship_applications')
          .update({ status: 'assessment_invited' })
          .eq('id', app.id)

        if (statusError) {
          console.error(`Error updating status for ${app.email}:`, statusError)
        }

        // Send assessment email
        try {
          const assessmentUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assessment/${token}`

          const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgriProHub Fellowship Assessment</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #166534 0%, #16a34a 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🌾 AgriProHub Fellowship</h1>
        <p style="color: #e8f5e8; margin: 10px 0 0 0; font-size: 16px;">Strategic Assessment Invitation</p>
    </div>

    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; padding: 40px 30px;">
        <h2 style="color: #166534; margin-bottom: 20px;">Congratulations, ${app.first_name}!</h2>

        <p style="margin-bottom: 20px; font-size: 16px;">
            You've been selected to advance to the next stage of the AgriProHub Fellowship selection process.
        </p>

        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 25px 0;">
            <h3 style="color: #166534; margin: 0 0 10px 0;">📋 Strategic Assessment Challenge</h3>
            <p style="margin: 0; font-size: 15px;">
                This assessment evaluates your strategic thinking, market understanding, and problem-solving abilities -
                core competencies needed for the fellowship program.
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${assessmentUrl}"
               style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                🚀 Start Your Assessment
            </a>
        </div>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0;">⏰ Important Details:</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>You have <strong>7 days</strong> to complete the assessment</li>
                <li>The assessment takes approximately <strong>45-60 minutes</strong></li>
                <li>Questions test <strong>strategic thinking and market insight</strong></li>
                <li>You can save progress and return later</li>
                <li>Results will be reviewed within <strong>2-3 business days</strong></li>
            </ul>
        </div>

        <h3 style="color: #166534; margin: 30px 0 15px 0;">📊 Assessment Overview:</h3>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>• Systems Thinking & Market Analysis</span>
                <span style="color: #16a34a; font-weight: bold;">5 Questions</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>• Problem Solving & Prioritization</span>
                <span style="color: #16a34a; font-weight: bold;">3 Questions</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>• Data-Driven Decision Making</span>
                <span style="color: #16a34a; font-weight: bold;">3 Questions</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>• Strategic Thinking</span>
                <span style="color: #16a34a; font-weight: bold;">2 Questions</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>• Applied Problem Solving</span>
                <span style="color: #16a34a; font-weight: bold;">4 Questions</span>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>Total Questions</span>
                <span style="color: #16a34a;">17 Questions (100 points)</span>
            </div>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #166534; margin: 0 0 10px 0;">🎯 Assessment Focus:</h4>
            <p style="margin: 0; color: #166534;">
                This assessment evaluates your ability to think strategically about agricultural challenges,
                understand market dynamics, and propose practical solutions. It tests the same skills you'll
                need to succeed in the AgriProHub Fellowship program.
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${assessmentUrl}" style="color: #16a34a; word-break: break-all;">${assessmentUrl}</a>
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Questions? Contact us at <a href="mailto:fellowship@agriprohub.com" style="color: #16a34a;">fellowship@agriprohub.com</a>
            </p>
        </div>
    </div>
</body>
</html>`

          const emailResult = await resend.emails.send({
            from: 'AgriProHub Fellowship <fellowship@agriprohub.com>',
            to: app.email,
            subject: `🌾 AgriProHub Fellowship - Strategic Assessment Invitation`,
            html: emailHtml,
          })

          console.log(`Assessment invitation email sent to ${app.email}:`, emailResult)

        } catch (emailError) {
          console.error(`Failed to send email to ${app.email}:`, emailError)
          // Don't fail the whole process if email fails
        }

        sentAssessments.push({
          application_id: app.id,
          email: app.email,
          token: token,
          invitation_id: invitation.id
        })

      } catch (err) {
        console.error(`Error processing assessment for ${app.email}:`, err)
        errors.push({ email: app.email, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Assessment invitations sent to ${sentAssessments.length} candidates`,
      sent: sentAssessments,
      errors: errors,
      total: sentAssessments.length + errors.length
    })

  } catch (error) {
    console.error('Send assessment error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
