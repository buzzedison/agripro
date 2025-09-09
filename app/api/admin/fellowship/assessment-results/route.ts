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

    // Get assessment invitation for this application
    const { data: invitation, error: inviteError } = await supabase
      .from('assessment_invitations')
      .select(`
        id,
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
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'No assessment found for this application' }, { status: 404 })
    }

    // Get assessment responses
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select(`
        id,
        response_text,
        response_options,
        points_awarded,
        graded_by,
        graded_at,
        created_at,
        assessment_questions!inner (
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
      .order('assessment_questions(question_number)')

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

    return NextResponse.json({
      success: true,
      invitation: invitation,
      responses: responses || [],
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
