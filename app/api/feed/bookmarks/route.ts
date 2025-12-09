import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/feed/bookmarks
 * Returns all bookmarked posts for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get bookmarked posts
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('post_bookmarks')
      .select(`
        post_id,
        created_at,
        posts:post_id (
          id,
          user_id,
          content,
          image_url,
          created_at,
          likes_count,
          comments_count,
          reposts_count,
          quoted_post_id,
          profile:profiles!posts_user_id_fkey (
            full_name,
            avatar_url,
            user_type,
            organization_name,
            is_verified
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (bookmarksError) {
      console.error('Error fetching bookmarks:', bookmarksError);
      return NextResponse.json(
        { error: 'Failed to fetch bookmarks' },
        { status: 500 }
      );
    }

    // Extract posts from bookmarks
    const posts = bookmarks
      ?.map(b => b.posts)
      .filter(post => post !== null) || [];

    return NextResponse.json({ posts, count: posts.length });

  } catch (error) {
    console.error('Error in bookmarks GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feed/bookmarks
 * Bookmark a post
 * Body: { postId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: 'Missing postId' },
        { status: 400 }
      );
    }

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create bookmark
    const { error: insertError } = await supabase
      .from('post_bookmarks')
      .insert({
        user_id: user.id,
        post_id: postId
      });

    if (insertError) {
      // Check if it's a duplicate key error (already bookmarked)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Post already bookmarked' },
          { status: 409 }
        );
      }
      console.error('Error creating bookmark:', insertError);
      return NextResponse.json(
        { error: 'Failed to bookmark post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post bookmarked successfully'
    });

  } catch (error) {
    console.error('Error in bookmarks POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/feed/bookmarks?postId=xxx
 * Remove bookmark from a post
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Missing postId' },
        { status: 400 }
      );
    }

    // Delete bookmark
    const { error: deleteError } = await supabase
      .from('post_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId);

    if (deleteError) {
      console.error('Error removing bookmark:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove bookmark' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bookmark removed successfully'
    });

  } catch (error) {
    console.error('Error in bookmarks DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
