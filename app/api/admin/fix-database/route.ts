import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Fixing database schema...')

    // Try to fix the view_duration column type
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Fix view_duration column to handle decimal values
        DO $$
        BEGIN
            -- Check if the table exists and alter the column
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'article_views') THEN
                -- Change view_duration from INTEGER to DECIMAL to handle fractional seconds
                ALTER TABLE article_views ALTER COLUMN view_duration TYPE DECIMAL(10,3);
                RAISE NOTICE 'Updated view_duration column to DECIMAL(10,3)';
            ELSE
                RAISE NOTICE 'article_views table does not exist yet';
            END IF;
            
            -- Also fix article_analytics table if it exists
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'article_analytics') THEN
                ALTER TABLE article_analytics ALTER COLUMN average_view_duration TYPE DECIMAL(10,3);
                RAISE NOTICE 'Updated average_view_duration column to DECIMAL(10,3)';
            END IF;
        END $$;
      `
    })

    if (alterError) {
      console.error('Error fixing database schema:', alterError)
      return NextResponse.json({
        error: 'Failed to fix database schema',
        details: alterError.message,
        suggestion: 'You may need to run the SQL manually in Supabase dashboard'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema fixed successfully',
      details: 'view_duration columns updated to handle decimal values'
    })

  } catch (error) {
    console.error('Fix database error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
