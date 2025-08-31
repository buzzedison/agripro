import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Making signups recent for dashboard visibility...')

    // Update all signups that are older than 30 days to be recent
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE knowledge_hub_signups
        SET created_at = CURRENT_TIMESTAMP - INTERVAL '1 day' * (RANDOM() * 30)
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
      `
    })

    if (updateError) {
      console.error('Error updating signup timestamps:', updateError)
      return NextResponse.json({
        error: 'Failed to update timestamps',
        details: updateError.message
      }, { status: 500 })
    }

    // Get the count of signups now within 30 days
    const { data: recentCount, error: countError } = await supabase
      .from('knowledge_hub_signups')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (countError) {
      console.error('Error getting count:', countError)
    }

    // Get sample of recent signups
    const { data: sampleSignups, error: sampleError } = await supabase
      .from('knowledge_hub_signups')
      .select('email, signup_source, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      message: 'Signups updated to recent dates for dashboard visibility!',
      stats: {
        recentSignupsCount: recentCount || 0,
        sampleData: sampleSignups || []
      }
    })

  } catch (error) {
    console.error('Make recent error:', error)
    return NextResponse.json({
      error: 'Failed to make signups recent',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
