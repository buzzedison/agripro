import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/feed/notifications
 * Fetch notifications for the current user
 * Query params:
 *   - unread: boolean - if true, only fetch unread notifications
 *   - limit: number - max notifications to fetch (default 20)
 */
export async function GET(request: NextRequest) {
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
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    // Get actor profiles for the notifications
    if (notifications && notifications.length > 0) {
      const actorIds = [...new Set(notifications.map(n => n.actor_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, is_verified')
        .in('id', actorIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const notificationsWithProfiles = notifications.map(n => ({
        ...n,
        actor: profilesMap.get(n.actor_id) || {
          full_name: 'AgriPro User',
          avatar_url: null,
          is_verified: false
        }
      }));

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      return NextResponse.json({
        notifications: notificationsWithProfiles,
        unreadCount: unreadCount || 0
      });
    }

    return NextResponse.json({
      notifications: [],
      unreadCount: 0
    });

  } catch (error) {
    console.error('Error in notifications GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/feed/notifications
 * Mark notifications as read
 * Body: { notificationIds?: string[], markAllRead?: boolean }
 */
export async function PATCH(request: NextRequest) {
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

    const { notificationIds, markAllRead } = await request.json();

    if (markAllRead) {
      // Mark all notifications as read for this user
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json(
          { error: 'Failed to mark notifications as read' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    }

    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Mark specific notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds)
        .eq('user_id', user.id); // Ensure user owns these notifications

      if (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json(
          { error: 'Failed to mark notifications as read' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `${notificationIds.length} notification(s) marked as read`
      });
    }

    return NextResponse.json(
      { error: 'No notifications specified' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in notifications PATCH API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/feed/notifications
 * Delete a notification
 * Query params: id - notification ID to delete
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
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id); // Ensure user owns this notification

    if (error) {
      console.error('Error deleting notification:', error);
      return NextResponse.json(
        { error: 'Failed to delete notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    console.error('Error in notifications DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
