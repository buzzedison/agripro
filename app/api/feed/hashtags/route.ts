import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { extractHashtags, normalizeHashtag } from '@/lib/utils/hashtags';

/**
 * POST /api/feed/hashtags
 * Extracts and saves hashtags for a post
 * Body: { postId: string, content: string }
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

    const { postId, content } = await request.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'Missing postId or content' },
        { status: 400 }
      );
    }

    // Verify the post belongs to the user
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (postError || !post || post.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Post not found or unauthorized' },
        { status: 404 }
      );
    }

    // Extract hashtags from content
    const hashtagNames = extractHashtags(content);

    if (hashtagNames.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hashtags found',
        hashtagCount: 0
      });
    }

    // Process each hashtag
    const savedHashtags = [];

    for (const hashtagName of hashtagNames) {
      const normalizedName = normalizeHashtag(hashtagName);

      // Insert or get existing hashtag
      const { data: existingHashtag } = await supabase
        .from('hashtags')
        .select('id')
        .eq('normalized_name', normalizedName)
        .single();

      let hashtagId;

      if (existingHashtag) {
        hashtagId = existingHashtag.id;
      } else {
        // Create new hashtag
        const { data: newHashtag, error: hashtagError } = await supabase
          .from('hashtags')
          .insert({
            name: hashtagName,
            normalized_name: normalizedName,
            use_count: 0,
            last_used_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (hashtagError) {
          console.error('Error creating hashtag:', hashtagError);
          continue;
        }

        hashtagId = newHashtag.id;
      }

      // Link hashtag to post (trigger will update use_count)
      const { error: linkError } = await supabase
        .from('post_hashtags')
        .insert({
          post_id: postId,
          hashtag_id: hashtagId
        });

      if (linkError && linkError.code !== '23505') { // Ignore duplicate key errors
        console.error('Error linking hashtag to post:', linkError);
        continue;
      }

      savedHashtags.push(hashtagName);
    }

    return NextResponse.json({
      success: true,
      message: `Saved ${savedHashtags.length} hashtag(s)`,
      hashtags: savedHashtags,
      hashtagCount: savedHashtags.length
    });

  } catch (error) {
    console.error('Error in hashtags API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feed/hashtags?tag=PoultryFarming
 * Returns posts containing a specific hashtag
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    if (!tag) {
      return NextResponse.json(
        { error: 'Missing tag parameter' },
        { status: 400 }
      );
    }

    const normalizedTag = normalizeHashtag(tag);

    // Get the hashtag
    const { data: hashtag, error: hashtagError } = await supabase
      .from('hashtags')
      .select('id')
      .eq('normalized_name', normalizedTag)
      .single();

    if (hashtagError || !hashtag) {
      return NextResponse.json({ posts: [] });
    }

    // Get posts with this hashtag
    const { data: postHashtags, error: postHashtagsError } = await supabase
      .from('post_hashtags')
      .select(`
        post_id,
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
      .eq('hashtag_id', hashtag.id)
      .order('created_at', { ascending: false });

    if (postHashtagsError) {
      console.error('Error fetching posts by hashtag:', postHashtagsError);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // Extract posts from the join result
    const posts = postHashtags
      ?.map(ph => ph.posts)
      .filter(post => post !== null) || [];

    return NextResponse.json({ posts, count: posts.length });

  } catch (error) {
    console.error('Error in hashtags GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
