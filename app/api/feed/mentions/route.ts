import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/feed/mentions/search?q=john
 * Search for users to mention (autocomplete)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Try using the database function first
    let data, error;

    try {
      const result = await supabase
        .rpc('search_users_for_mention', {
          search_term: query,
          limit_count: 10
        });
      data = result.data;
      error = result.error;
    } catch (rpcError) {
      // If RPC function doesn't exist, use direct query as fallback
      console.log('RPC function not found, using direct query');
      const result = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_type, organization_name, is_verified')
        .ilike('full_name', `%${query}%`)
        .eq('is_public', true)
        .order('is_verified', { ascending: false })
        .order('full_name', { ascending: true })
        .limit(10);
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error searching users for mention:', error);
      return NextResponse.json(
        { error: 'Failed to search users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users: data || [] });

  } catch (error) {
    console.error('Error in mentions search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feed/mentions
 * Save mentions for a post or comment
 * Body: { postId?: string, commentId?: string, content: string }
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

    const { postId, commentId, content } = await request.json();

    if (!content || (!postId && !commentId)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract mentions from content (match @username pattern)
    const mentionRegex = /@([a-zA-Z][a-zA-Z0-9\s]+?)(?=\s|$|[^\w])/g;
    const matches = content.matchAll(mentionRegex);
    const mentionNames = [...new Set(Array.from(matches, (m: RegExpMatchArray) => m[1].trim()))];

    if (mentionNames.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No mentions found',
        mentionCount: 0
      });
    }

    // Find users by full_name
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('full_name', mentionNames);

    if (usersError) {
      console.error('Error finding mentioned users:', usersError);
      return NextResponse.json(
        { error: 'Failed to process mentions' },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No valid users found to mention',
        mentionCount: 0
      });
    }

    const savedMentions: { id: string; full_name: string }[] = [];

    // Save mentions
    for (const mentionedUser of users) {
      if (postId) {
        // Save post mention
        const { error: insertError } = await supabase
          .from('post_mentions')
          .insert({
            post_id: postId,
            mentioned_user_id: mentionedUser.id,
            mentioned_by_user_id: user.id
          });

        if (insertError && insertError.code !== '23505') { // Ignore duplicates
          console.error('Error saving post mention:', insertError);
          continue;
        }
      } else if (commentId) {
        // Save comment mention
        const { error: insertError } = await supabase
          .from('comment_mentions')
          .insert({
            comment_id: commentId,
            mentioned_user_id: mentionedUser.id,
            mentioned_by_user_id: user.id
          });

        if (insertError && insertError.code !== '23505') { // Ignore duplicates
          console.error('Error saving comment mention:', insertError);
          continue;
        }
      }

      savedMentions.push({ id: mentionedUser.id, full_name: mentionedUser.full_name });
    }

    return NextResponse.json({
      success: true,
      message: `Mentioned ${savedMentions.length} user(s)`,
      mentions: savedMentions.map(m => m.full_name),
      mentionedUsers: savedMentions, // Include full user data for linking
      mentionCount: savedMentions.length
    });

  } catch (error) {
    console.error('Error in mentions POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
