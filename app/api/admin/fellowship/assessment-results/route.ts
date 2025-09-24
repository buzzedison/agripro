import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('application_id')

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    // Find latest invitation for this application
    const { data: invitations, error: inviteError } = await supabase
      .from('assessment_invitations')
      .select(`
        id,
        application_id,
        invitation_token,
        status,
        sent_at,
        started_at,
        completed_at,
        expires_at,
        fellowship_applications!inner (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('application_id', parseInt(applicationId))
      .order('created_at', { ascending: false })
      .limit(1)

    if (inviteError) {
      console.error('Error fetching invitation:', inviteError)
      return NextResponse.json({ error: 'Failed to fetch assessment invitation' }, { status: 500 })
    }

    const invitation = invitations?.[0] || null

    if (!invitation) {
      return NextResponse.json({ error: 'No assessment found for this application' }, { status: 404 })
    }

    // Get assessment responses
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select(`
        id,
        invitation_id,
        question_id,
        response_text,
        response_options,
        points_awarded,
        graded_by,
        graded_at,
        created_at,
        updated_at,
        assessment_questions (
          id,
          question_number,
          section,
          question_type,
          question,
          options,
          max_points
        )
      `)
      .eq('invitation_id', invitation.id)
      .order('question_id')

    if (responsesError) {
      console.error('Error fetching responses:', responsesError)
      return NextResponse.json({ error: 'Failed to fetch assessment responses' }, { status: 500 })
    }

    // Get assessment result
    const { data: result, error: resultError } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('invitation_id', invitation.id)
      .single()

    const getQuestionMeta = (response: any) => {
      const question = Array.isArray(response.assessment_questions)
        ? response.assessment_questions[0]
        : response.assessment_questions
      return question || null
    }

    const sortedResponses = (responses || []).sort((a: any, b: any) => {
      const qa = getQuestionMeta(a)?.question_number ?? 0
      const qb = getQuestionMeta(b)?.question_number ?? 0
      return qa - qb
    })

    const normalizedResponses = sortedResponses.map((response: any) => ({
      ...response,
      assessment_questions: getQuestionMeta(response)
    }))

    return NextResponse.json({
      success: true,
      invitation: invitation,
      responses: normalizedResponses,
      result: result || null
    })

  } catch (error) {
    console.error('Get assessment results error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
