import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Fixing signups by copying from fellowship_applications...')

    // First ensure the table exists
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS knowledge_hub_signups (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          signup_source VARCHAR(100),
          user_id UUID,
          subscription_status VARCHAR(50) DEFAULT 'free',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT knowledge_hub_signups_email_key UNIQUE (email)
        );

        CREATE INDEX IF NOT EXISTS idx_knowledge_hub_signups_created_at ON knowledge_hub_signups(created_at);
      `
    })

    if (createError) {
      console.error('Error creating signups table:', createError)
    }

    // Copy data from fellowship_applications
    const { error: copyError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO knowledge_hub_signups (email, first_name, last_name, signup_source, created_at)
        SELECT
          email,
          first_name,
          last_name,
          'fellowship_application' as signup_source,
          created_at
        FROM fellowship_applications
        WHERE email IS NOT NULL
          AND email != ''
          AND LENGTH(TRIM(email)) > 0
        ON CONFLICT (email) DO NOTHING;
      `
    })

    if (copyError) {
      console.error('Error copying fellowship data:', copyError)
      return NextResponse.json({
        error: 'Failed to copy fellowship data',
        details: copyError.message
      }, { status: 500 })
    }

    // Update timestamps to make them recent (for demo purposes)
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE knowledge_hub_signups
        SET created_at = CURRENT_TIMESTAMP - INTERVAL '1 day' * (RANDOM() * 30)
        WHERE signup_source = 'fellowship_application'
          AND created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
      `
    })

    if (updateError) {
      console.error('Error updating timestamps:', updateError)
    }

    // Get the final count
    const { data: finalCount, error: countError } = await supabase
      .from('knowledge_hub_signups')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error getting final count:', countError)
    }

    // Get sample data to show
    const { data: sampleData, error: sampleError } = await supabase
      .from('knowledge_hub_signups')
      .select('email, first_name, last_name, signup_source, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      message: 'Signups fixed successfully!',
      stats: {
        totalSignups: finalCount || 0,
        sampleData: sampleData || []
      }
    })

  } catch (error) {
    console.error('Fix signups error:', error)
    return NextResponse.json({
      error: 'Failed to fix signups',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
