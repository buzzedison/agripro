import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const correctAnswers: Record<number, string> = {
  1: 'b',
  2: 'b',
  3: 'b',
  4: 'c',
  5: 'c',
  6: 'b',
  7: 'c',
  8: 'b',
  9: 'a',
  10: 'b',
  11: 'c'
}

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
      .select('id, application_id, status, expires_at, completed_at')
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
    const submittedResponses: any[] = []
    let autoAwardedScore = 0
    let maxScore = 0

    for (const response of responses) {
      const { questionId, responseText, responseOptions } = response

      // Get question details to validate response
    const { data: question, error: questionError } = await supabase
      .from('assessment_questions')
      .select('id, question_type, max_points')
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
        const correctAnswer = correctAnswers[question.id]
        if (correctAnswer) {
          const normalizedResponse = responseText.trim().charAt(0).toLowerCase()

          if (normalizedResponse === correctAnswer) {
            autoAwardedScore += question.max_points

            const { error: awardError } = await supabase
              .from('assessment_responses')
              .update({
                points_awarded: question.max_points,
                graded_by: 'auto-grader',
                graded_at: new Date().toISOString()
              })
              .eq('id', savedResponse.id)

            if (awardError) {
              console.error(`Error setting auto grade for response ${savedResponse.id}:`, awardError)
            }
          }
        }
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

    // Update application status to reflect assessment completion
    if (invitation.application_id) {
      const { error: appStatusError } = await supabase
        .from('fellowship_applications')
        .update({ status: 'assessment_completed' })
        .eq('id', invitation.application_id)

      if (appStatusError) {
        console.error('Error updating application status to assessment_completed:', appStatusError)
      } else {
        const { error: statusHistoryError } = await supabase
          .from('fellowship_status_history')
          .insert({
            application_id: invitation.application_id,
            new_status: 'assessment_completed',
            changed_by: 'system',
            reason: 'Assessment completed by candidate'
          })

        if (statusHistoryError) {
          console.warn('Failed to log status history for assessment completion:', statusHistoryError)
        }
      }
    }

    // Create initial assessment result record
    const { data: existingResult } = await supabase
      .from('assessment_results')
      .select('id')
      .eq('invitation_id', invitation.id)
      .maybeSingle()

    let result = existingResult

    if (existingResult) {
      const { data: updatedResult, error: updateResultError } = await supabase
        .from('assessment_results')
        .update({
          total_score: autoAwardedScore,
          max_score: maxScore,
          percentage_score: maxScore > 0 ? Number(((autoAwardedScore / maxScore) * 100).toFixed(2)) : null,
          status: 'pending'
        })
        .eq('id', existingResult.id)
        .select()
        .single()

      if (updateResultError) {
        console.error('Error updating existing assessment result:', updateResultError)
      } else {
        result = updatedResult
      }
    } else {
      const { data: newResult, error: newResultError } = await supabase
        .from('assessment_results')
        .insert({
          invitation_id: invitation.id,
          total_score: autoAwardedScore,
          max_score: maxScore,
          percentage_score: maxScore > 0 ? Number(((autoAwardedScore / maxScore) * 100).toFixed(2)) : null,
          status: 'pending'
        })
        .select()
        .single()

      if (newResultError) {
        console.error('Error creating assessment result:', newResultError)
      } else {
        result = newResult
      }
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
      total_score: autoAwardedScore,
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
