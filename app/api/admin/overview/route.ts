import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching admin overview stats...')

    // Get total users (from knowledge_hub_signups)
    const signupsResult = await supabase
      .from('knowledge_hub_signups')
      .select('*', { count: 'exact', head: true })
    const signupsCount = signupsResult.count || 0
    const signupsError = signupsResult.error

    console.log('Signups query result:', { count: signupsCount, error: signupsError })

    // Get page views (from article_views)
    const viewsResult = await supabase
      .from('article_views')
      .select('*', { count: 'exact', head: true })
    const viewsCount = viewsResult.count || 0
    const viewsError = viewsResult.error

    console.log('Views query result:', { count: viewsCount, error: viewsError })

    // Get applications (from fellowship_applications)
    const applicationsResult = await supabase
      .from('fellowship_applications')
      .select('*', { count: 'exact', head: true })
    const applicationsCount = applicationsResult.count || 0
    const applicationsError = applicationsResult.error

    console.log('Applications query result:', { count: applicationsCount, error: applicationsError })

    // Get unique viewers - use a more efficient query
    let uniqueCount = 0
    let uniqueError = null

    try {
      // Use a more efficient query to count distinct user_emails
      const { data: uniqueViewers, error: uniqueErr } = await supabase
        .from('article_views')
        .select('user_email')
        .not('user_email', 'is', null)
        .limit(1000) // Limit to avoid performance issues

      uniqueError = uniqueErr

      if (uniqueViewers) {
        const uniqueEmails = new Set(uniqueViewers.map(v => v.user_email).filter(Boolean))
        uniqueCount = uniqueEmails.size
      }
    } catch (err) {
      console.log('Error calculating unique viewers:', err instanceof Error ? err.message : 'Unknown error')
      uniqueCount = 0
    }

    console.log('Admin overview results:', {
      signups: signupsCount || 0,
      views: viewsCount || 0,
      applications: applicationsCount || 0,
      uniqueViewers: uniqueCount,
      errors: {
        signups: signupsError?.message,
        views: viewsError?.message,
        applications: applicationsError?.message,
        unique: uniqueError?.message
      }
    })

    // If counts are still 0, try direct SQL queries as fallback
    let finalSignupsCount = signupsCount || 0
    let finalViewsCount = viewsCount || 0
    let finalApplicationsCount = applicationsCount || 0

    if (finalSignupsCount === 0) {
      try {
        const { data: directSignups } = await supabase.rpc('exec_sql', {
          sql: 'SELECT COUNT(*) as count FROM knowledge_hub_signups'
        })
        finalSignupsCount = parseInt(directSignups?.[0]?.count || '0')
        console.log('Direct SQL signups count:', finalSignupsCount)
      } catch (err) {
        console.log('Direct SQL fallback failed for signups')
      }
    }

    if (finalViewsCount === 0) {
      try {
        const { data: directViews } = await supabase.rpc('exec_sql', {
          sql: 'SELECT COUNT(*) as count FROM article_views'
        })
        finalViewsCount = parseInt(directViews?.[0]?.count || '0')
        console.log('Direct SQL views count:', finalViewsCount)
      } catch (err) {
        console.log('Direct SQL fallback failed for views')
      }
    }

    if (finalApplicationsCount === 0) {
      try {
        const { data: directApps } = await supabase.rpc('exec_sql', {
          sql: 'SELECT COUNT(*) as count FROM fellowship_applications'
        })
        finalApplicationsCount = parseInt(directApps?.[0]?.count || '0')
        console.log('Direct SQL applications count:', finalApplicationsCount)
      } catch (err) {
        console.log('Direct SQL fallback failed for applications')
      }
    }

    return NextResponse.json({
      totalUsers: finalSignupsCount,
      pageViews: finalViewsCount,
      applications: finalApplicationsCount,
      signups: finalSignupsCount, // Same as totalUsers for this dashboard
      uniqueViewers: uniqueCount,
      success: true
    })

  } catch (error) {
    console.error('Admin overview error:', error)
    return NextResponse.json({
      error: 'Failed to fetch admin stats',
      totalUsers: 0,
      pageViews: 0,
      applications: 0,
      signups: 0,
      uniqueViewers: 0,
      success: false
    }, { status: 500 })
  }
}
