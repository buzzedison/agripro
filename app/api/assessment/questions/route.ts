import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Assessment token is required' }, { status: 400 })
    }

    // Verify invitation token and get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('assessment_invitations')
      .select(`
        id,
        application_id,
        first_name,
        last_name,
        status,
        expires_at,
        started_at,
        completed_at,
        fellowship_applications!inner (
          first_name,
          last_name,
          email
        )
      `)
      .eq('invitation_token', token)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired assessment token' }, { status: 404 })
    }

    // Check if assessment has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Assessment has expired' }, { status: 410 })
    }

    // Check if assessment is already completed
    if (invitation.completed_at) {
      return NextResponse.json({ error: 'Assessment has already been completed' }, { status: 409 })
    }

    // Get all questions
    const { data: questions, error: questionsError } = await supabase
      .from('assessment_questions')
      .select('*')
      .order('question_number')

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return NextResponse.json({ error: 'Failed to load assessment questions' }, { status: 500 })
    }

    // Mark assessment as started if not already
    if (!invitation.started_at) {
      await supabase
        .from('assessment_invitations')
        .update({
          status: 'started',
          started_at: new Date().toISOString()
        })
        .eq('id', invitation.id)
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        first_name: invitation.first_name,
        last_name: invitation.last_name,
        status: invitation.status,
        expires_at: invitation.expires_at
      },
      questions: questions,
      total_questions: questions.length
    })

  } catch (error) {
    console.error('Get questions error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
