import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getKnowledgeHubSession, requireAdmin } from '@/lib/knowledge-hub/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Get knowledge hub analytics
export async function GET(request: NextRequest) {
  try {
    const auth = await getKnowledgeHubSession()
    if (!auth.ok) {
      return auth.response
    }

    const forbidden = requireAdmin(auth.session.adminAccess)
    if (forbidden) {
      return forbidden
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d

    console.log('Fetching analytics for period:', period)

    // Calculate date range
    const now = new Date()
    const periodMap: { [key: string]: number } = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    }
    const days = periodMap[period] || 30
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    console.log('Date range:', startDate.toISOString(), 'to', now.toISOString())
    console.log('Current date:', now.toISOString())

    // Get total signups (try both tables and combine)
    let signups = []
    let signupsError = null

    // First try knowledge_hub_signups (without date filter to debug)
    const { data: khSignupsAll, error: khErrorAll } = await supabase
      .from('knowledge_hub_signups')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('KH Signups ALL (no date filter):', {
      count: khSignupsAll?.length,
      error: khErrorAll,
      sample: khSignupsAll?.slice(0, 3)
    })

    // Now with date filter
    const { data: khSignups, error: khError } = await supabase
      .from('knowledge_hub_signups')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    console.log('KH Signups with date filter:', { count: khSignups?.length, error: khError })

    // If no signups in knowledge_hub_signups, try fellowship_applications
    if ((!khSignups || khSignups.length === 0) && !khError) {
      const { data: fellowshipSignups, error: fellowshipError } = await supabase
        .from('fellowship_applications')
        .select('email, first_name, last_name, created_at')
        .not('email', 'is', null)
        .neq('email', '')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      console.log('Fellowship Signups result:', { count: fellowshipSignups?.length, error: fellowshipError })

      if (fellowshipSignups && !fellowshipError) {
        // Transform fellowship data to match expected format
        signups = fellowshipSignups.map(app => ({
          ...app,
          signup_source: 'fellowship_application',
          id: app.email // Use email as ID for now
        }))
        console.log('Using fellowship data as signups:', signups.length)
      }
    } else if (khSignups) {
      signups = khSignups
    }

    if (signupsError) {
      console.error('Signups error:', signupsError)
      // Don't fail the whole request, just return empty array
    }

    // Get article views
    const { data: views, error: viewsError } = await supabase
      .from('article_views')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    console.log('Views result:', { count: views?.length, error: viewsError })

    if (viewsError) {
      console.error('Views error:', viewsError)
      // Don't fail the whole request, just return empty array
    }

    // Get article analytics (only articles that have been viewed recently)
    const { data: analytics, error: analyticsError } = await supabase
      .from('article_analytics')
      .select('*')
      .gte('last_viewed_at', startDate.toISOString())
      .order('total_views', { ascending: false })
      .limit(50)

    console.log('Analytics result:', { count: analytics?.length, error: analyticsError })

    if (analyticsError) {
      console.error('Analytics error:', analyticsError)
      // Don't fail the whole request, just return empty array
    }

    // Calculate summary stats
    const totalSignups = signups?.length || 0
    const totalViews = views?.length || 0
    const uniqueViewers = new Set(views?.map(v => v.user_email || v.ip_address).filter(Boolean)).size

    // Group views by article type
    const viewsByType: { [key: string]: number } = {}
    views?.forEach(view => {
      viewsByType[view.article_type] = (viewsByType[view.article_type] || 0) + 1
    })

    // Group signups by source
    const signupsBySource: { [key: string]: number } = {}
    signups?.forEach(signup => {
      const source = signup.signup_source || 'fellowship_application'
      signupsBySource[source] = (signupsBySource[source] || 0) + 1
    })

    // Get recent activity (last 10 items)
    const recentActivity = [
      ...(signups?.slice(0, 5).map(s => ({
        type: 'signup',
        title: `${s.first_name || s.last_name || 'Anonymous'} signed up`,
        email: s.email,
        timestamp: s.created_at,
        source: s.signup_source || 'fellowship_application'
      })) || []),
      ...(views?.slice(0, 5).map(v => ({
        type: 'view',
        title: `Article viewed: ${v.article_title || v.article_id}`,
        email: v.user_email || 'Anonymous',
        timestamp: v.created_at,
        article_type: v.article_type
      })) || [])
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    return NextResponse.json({
      summary: {
        totalSignups,
        totalViews,
        uniqueViewers,
        period
      },
      signups: signups || [],
      views: views || [],
      analytics: analytics || [],
      charts: {
        viewsByType,
        signupsBySource
      },
      recentActivity
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
