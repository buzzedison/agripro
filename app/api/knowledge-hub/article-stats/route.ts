import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Get article analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('article_analytics')
      .select('*')
      .eq('article_id', articleId)
      .single()

    if (analyticsError && analyticsError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Analytics error:', analyticsError)
      return NextResponse.json({ error: 'Failed to fetch article stats' }, { status: 500 })
    }

    // Get recent views for additional stats
    const { data: recentViews, error: viewsError } = await supabase
      .from('article_views')
      .select('view_duration')
      .eq('article_id', articleId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    if (viewsError) {
      console.error('Views error:', viewsError)
    }

    // Calculate average view duration
    const validDurations = recentViews?.filter(v => v.view_duration && v.view_duration > 0) || []
    const averageViewDuration = validDurations.length > 0
      ? validDurations.reduce((sum, v) => sum + v.view_duration, 0) / validDurations.length
      : null

    const stats = {
      totalViews: analytics?.total_views || 0,
      uniqueViews: analytics?.unique_views || 0,
      averageViewDuration: averageViewDuration,
      lastViewedAt: analytics?.last_viewed_at
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Article stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
