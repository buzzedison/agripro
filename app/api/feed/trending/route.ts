import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/feed/trending
 * Returns trending hashtags based on recent usage and engagement
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get trending hashtags from the view
    const { data: trendingHashtags, error } = await supabase
      .from('trending_hashtags')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Error fetching trending hashtags:', error);

      // Fallback: get most used hashtags if view doesn't exist
      const { data: fallbackHashtags, error: fallbackError } = await supabase
        .from('hashtags')
        .select('id, name, normalized_name, use_count, last_used_at')
        .order('use_count', { ascending: false })
        .limit(10);

      if (fallbackError) {
        return NextResponse.json(
          { error: 'Failed to fetch trending hashtags' },
          { status: 500 }
        );
      }

      return NextResponse.json({ hashtags: fallbackHashtags || [] });
    }

    return NextResponse.json({ hashtags: trendingHashtags || [] });
  } catch (error) {
    console.error('Error in trending hashtags API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
