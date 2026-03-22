import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database state...')

    // Check if tables exist and get basic counts
    const results = []

    // Test knowledge_hub_signups
    try {
      const { count: signupsCount, error: signupsError } = await supabase
        .from('knowledge_hub_signups')
        .select('*', { count: 'exact', head: true })

      results.push({
        table: 'knowledge_hub_signups',
        count: signupsCount || 0,
        error: signupsError?.message || null
      })

      // Also get some sample records to see the date range
      if (!signupsError && (signupsCount || 0) > 0) {
        const { data: sampleSignups } = await supabase
          .from('knowledge_hub_signups')
          .select('email, created_at')
          .order('created_at', { ascending: false })
          .limit(3)

        results.push({
          table: 'knowledge_hub_signups_samples',
          count: sampleSignups?.length || 0,
          sampleData: sampleSignups || [],
          error: null
        })
      }
    } catch (err) {
      results.push({
        table: 'knowledge_hub_signups',
        count: 0,
        error: 'Table does not exist'
      })
    }

    // Test article_views
    try {
      const { data: views, error: viewsError } = await supabase
        .from('article_views')
        .select('count', { count: 'exact', head: true })

      results.push({
        table: 'article_views',
        count: views || 0,
        error: viewsError?.message || null
      })
    } catch (err) {
      results.push({
        table: 'article_views',
        count: 0,
        error: 'Table does not exist'
      })
    }

    // Test article_analytics
    try {
      const { data: analytics, error: analyticsError } = await supabase
        .from('article_analytics')
        .select('count', { count: 'exact', head: true })

      results.push({
        table: 'article_analytics',
        count: analytics || 0,
        error: analyticsError?.message || null
      })
    } catch (err) {
      results.push({
        table: 'article_analytics',
        count: 0,
        error: 'Table does not exist'
      })
    }

    // Test fellowship_applications (should exist)
    try {
      const { count: fellowshipCount, error: fellowshipError } = await supabase
        .from('fellowship_applications')
        .select('*', { count: 'exact', head: true })

      results.push({
        table: 'fellowship_applications',
        count: fellowshipCount || 0,
        error: fellowshipError?.message || null
      })

      // Check if fellowship applicants have emails (potential signups)
      if (!fellowshipError && (fellowshipCount || 0) > 0) {
        const { data: fellowshipWithEmails } = await supabase
          .from('fellowship_applications')
          .select('email, created_at')
          .not('email', 'is', null)
          .neq('email', '')
          .order('created_at', { ascending: false })
          .limit(3)

        results.push({
          table: 'fellowship_with_emails',
          count: fellowshipWithEmails?.length || 0,
          sampleData: fellowshipWithEmails || [],
          error: null
        })
      }
    } catch (err) {
      results.push({
        table: 'fellowship_applications',
        count: 0,
        error: 'Table does not exist'
      })
    }

    // Check for any other tables that might contain signups
    try {
      const { data: tables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%signup%')

      if (tables && tables.length > 0) {
        results.push({
          table: 'other_signup_tables',
          count: tables.length,
          tables: tables.map(t => t.table_name),
          error: null
        })
      }
    } catch (err) {
      // Ignore information_schema errors
    }

    // Test the analytics API endpoint
    let analyticsApiResult = null
    try {
      const response = await fetch(`${request.headers.get('origin') || 'http://localhost:3000'}/api/admin/knowledge-hub?period=30d`, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      })

      if (response.ok) {
        analyticsApiResult = await response.json()
      } else {
        analyticsApiResult = { error: `API returned ${response.status}` }
      }
    } catch (err) {
      analyticsApiResult = { error: 'Failed to call analytics API' }
    }

    return NextResponse.json({
      database_status: results,
      analytics_api: analyticsApiResult,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test data error:', error)
    return NextResponse.json({
      error: 'Failed to test database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
