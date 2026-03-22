import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      articleId,
      articleType,
      articleTitle,
      viewDuration
    } = body

    if (!articleId || !articleType) {
      return NextResponse.json({ error: 'Article ID and type are required' }, { status: 400 })
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''
    const sessionSupabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await sessionSupabase.auth.getUser()

    // Insert view record
    const { data: viewData, error: viewError } = await supabase
      .from('article_views')
      .insert({
        article_id: articleId,
        article_type: articleType,
        article_title: articleTitle,
        user_email: user?.email ?? null,
        user_id: user?.id ?? null,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        view_duration: viewDuration ? Math.round(Number(viewDuration)) : null
      })
      .select()

    if (viewError) {
      console.error('View tracking error:', viewError)
      return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
    }

    // Update or create article analytics record
    try {
      const { data: existingAnalytics } = await supabase
        .from('article_analytics')
        .select('*')
        .eq('article_id', articleId)
        .single()

      if (existingAnalytics) {
        // Update existing record
        const newTotalViews = existingAnalytics.total_views + 1

        // For unique views, we'll use a simple approach
        // For now, just increment total views. Unique views tracking is complex
        // and requires more sophisticated logic for anonymous users
        await supabase
          .from('article_analytics')
          .update({
            total_views: newTotalViews,
            last_viewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('article_id', articleId)
      } else {
        // Create new record
        await supabase
          .from('article_analytics')
          .insert({
            article_id: articleId,
            article_type: articleType,
            article_title: articleTitle,
            total_views: 1,
            unique_views: user?.email ? 1 : 0,
            last_viewed_at: new Date().toISOString()
          })
      }
    } catch (analyticsError) {
      // If analytics update fails, just log it but don't fail the whole request
      console.error('Analytics update failed:', analyticsError)
    }

    return NextResponse.json({
      success: true,
      viewId: viewData?.[0]?.id
    })
  } catch (error) {
    console.error('Track view API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
