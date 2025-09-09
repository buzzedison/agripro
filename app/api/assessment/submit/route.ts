import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { token, responses } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Assessment token is required' }, { status: 400 })
    }

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: 'Assessment responses are required' }, { status: 400 })
    }

    console.log('Submitting assessment for token:', token)

    // Verify invitation token
    const { data: invitation, error: inviteError } = await supabase
      .from('assessment_invitations')
      .select('id, status, expires_at, completed_at')
      .eq('invitation_token', token)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invalid assessment token' }, { status: 404 })
    }

    // Check if assessment has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Assessment has expired' }, { status: 410 })
    }

    // Check if assessment is already completed
    if (invitation.completed_at) {
      return NextResponse.json({ error: 'Assessment has already been completed' }, { status: 409 })
    }

    // Process each response
    const submittedResponses = []
    let totalScore = 0
    let maxScore = 0

    for (const response of responses) {
      const { questionId, responseText, responseOptions } = response

      // Get question details to validate response
      const { data: question, error: questionError } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('id', questionId)
        .single()

      if (questionError || !question) {
        console.error(`Question ${questionId} not found`)
        continue
      }

      maxScore += question.max_points

      // For now, we'll store responses without automatic grading
      // Admin will need to manually grade essay and ranking questions
      const { data: savedResponse, error: responseError } = await supabase
        .from('assessment_responses')
        .upsert({
          invitation_id: invitation.id,
          question_id: questionId,
          response_text: responseText,
          response_options: responseOptions,
          points_awarded: 0 // Will be graded by admin
        }, {
          onConflict: 'invitation_id,question_id'
        })
        .select()
        .single()

      if (responseError) {
        console.error(`Error saving response for question ${questionId}:`, responseError)
        continue
      }

      submittedResponses.push(savedResponse)

      // Basic auto-grading for multiple choice questions (you can expand this)
      if (question.question_type === 'multiple_choice' && responseText) {
        // For now, we'll leave grading to admins
        // You can add correct answers and auto-grading logic here
      }
    }

    // Update invitation status to completed
    const { error: updateError } = await supabase
      .from('assessment_invitations')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error updating invitation status:', updateError)
    }

    // Create initial assessment result record
    const { data: result, error: resultError } = await supabase
      .from('assessment_results')
      .insert({
        invitation_id: invitation.id,
        total_score: totalScore,
        max_score: maxScore,
        status: 'pending'
      })
      .select()
      .single()

    if (resultError) {
      console.error('Error creating assessment result:', resultError)
    }

    // Send confirmation email with results
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/assessment/send-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitation_id: invitation.id,
          result_id: result?.id
        }),
      })

      if (!emailResponse.ok) {
        console.error('Failed to send results email')
      }
    } catch (emailError) {
      console.error('Error sending results email:', emailError)
      // Don't fail the submission if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment submitted successfully',
      responses_submitted: submittedResponses.length,
      total_score: totalScore,
      max_score: maxScore,
      result_id: result?.id
    })

  } catch (error) {
    console.error('Submit assessment error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
