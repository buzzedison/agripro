import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      invitationId,
      responses,
      totalScore,
      maxScore,
      resultStatus,
      recommendation,
      reviewerName,
      reviewerNotes,
      qualitativeScore,
      quantitativeScore
    } = body

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 })
    }

    if (!Array.isArray(responses)) {
      return NextResponse.json({ error: 'Responses array is required' }, { status: 400 })
    }

    const responseUpdates = responses.map((response: any) => ({
      id: response.id,
      points_awarded: response.points_awarded ?? 0,
      graded_by: reviewerName || 'Admin',
      graded_at: new Date().toISOString()
    }))

    if (responseUpdates.length > 0) {
      const { error: updateResponsesError } = await supabase
        .from('assessment_responses')
        .upsert(responseUpdates, {
          onConflict: 'id'
        })

      if (updateResponsesError) {
        console.error('Error updating responses:', updateResponsesError)
        return NextResponse.json({
          error: 'Failed to update assessment responses',
          details: updateResponsesError.message
        }, { status: 500 })
      }
    }

    const resultPayload: any = {
      invitation_id: invitationId,
      total_score: totalScore ?? 0,
      max_score: maxScore ?? 0,
      status: resultStatus || 'graded',
      recommendation: recommendation || null,
      reviewer_notes: reviewerNotes || null,
      reviewed_by: reviewerName || null,
      reviewed_at: new Date().toISOString()
    }

    if (qualitativeScore !== undefined && qualitativeScore !== null && qualitativeScore !== '') {
      resultPayload.qualitative_score = Number(qualitativeScore)
    }

    if (quantitativeScore !== undefined && quantitativeScore !== null && quantitativeScore !== '') {
      resultPayload.quantitative_score = Number(quantitativeScore)
    }

    const { error: upsertResultError } = await supabase
      .from('assessment_results')
      .upsert(resultPayload, {
        onConflict: 'invitation_id'
      })

    if (upsertResultError) {
      console.error('Error saving assessment result:', upsertResultError)
      return NextResponse.json({
        error: 'Failed to save assessment result',
        details: upsertResultError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment grading saved successfully'
    })

  } catch (error) {
    console.error('Assessment grading error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}