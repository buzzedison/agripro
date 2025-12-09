-- Migration to fix mentions RLS policies and enhance notifications
-- The original policy required the user to be the post author, but mentions
-- should be creatable by any authenticated user

-- ============================================
-- CREATE NOTIFICATIONS TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mention', 'like', 'comment', 'repost', 'follow')),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Base RLS policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.notifications TO authenticated;

-- ============================================
-- FIX POST MENTIONS RLS POLICIES
-- ============================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can create mentions in their posts" ON public.post_mentions;

-- Create a more permissive policy - any authenticated user can create mentions
CREATE POLICY "Authenticated users can create mentions"
  ON public.post_mentions
  FOR INSERT
  WITH CHECK (auth.uid() = mentioned_by_user_id);

-- ============================================
-- FIX COMMENT MENTIONS RLS POLICIES
-- ============================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can create mentions in their comments" ON public.comment_mentions;

-- Create a more permissive policy - any authenticated user can create mentions
CREATE POLICY "Authenticated users can create comment mentions"
  ON public.comment_mentions
  FOR INSERT
  WITH CHECK (auth.uid() = mentioned_by_user_id);

-- ============================================
-- ADD INSERT POLICY FOR NOTIFICATIONS
-- ============================================

-- Allow the trigger functions to insert notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Allow users to delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FIX NOTIFICATION TRIGGER TO AVOID SELF-NOTIFICATIONS
-- ============================================

-- Update mention notification function to not notify yourself
CREATE OR REPLACE FUNCTION public.create_mention_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_name TEXT;
  notification_message TEXT;
BEGIN
  -- Don't create notification if user mentions themselves
  IF NEW.mentioned_user_id = NEW.mentioned_by_user_id THEN
    RETURN NEW;
  END IF;

  -- Get the name of the person who mentioned
  SELECT full_name INTO post_author_name
  FROM public.profiles
  WHERE id = NEW.mentioned_by_user_id;

  -- Create notification message
  notification_message := COALESCE(post_author_name, 'Someone') || ' mentioned you in a post';

  -- Insert notification (avoid duplicates)
  INSERT INTO public.notifications (
    user_id,
    actor_id,
    type,
    post_id,
    message,
    read
  )
  VALUES (
    NEW.mentioned_user_id,
    NEW.mentioned_by_user_id,
    'mention',
    NEW.post_id,
    notification_message,
    false
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the mention insert
  RAISE WARNING 'Error creating mention notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update comment mention notification function
CREATE OR REPLACE FUNCTION public.create_comment_mention_notification()
RETURNS TRIGGER AS $$
DECLARE
  commenter_name TEXT;
  notification_message TEXT;
  related_post_id UUID;
BEGIN
  -- Don't create notification if user mentions themselves
  IF NEW.mentioned_user_id = NEW.mentioned_by_user_id THEN
    RETURN NEW;
  END IF;

  -- Get the name of the person who mentioned
  SELECT full_name INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.mentioned_by_user_id;

  -- Get the post_id from the comment
  SELECT post_id INTO related_post_id
  FROM public.post_comments
  WHERE id = NEW.comment_id;

  -- Create notification message
  notification_message := COALESCE(commenter_name, 'Someone') || ' mentioned you in a comment';

  -- Insert notification (avoid duplicates)
  INSERT INTO public.notifications (
    user_id,
    actor_id,
    type,
    post_id,
    comment_id,
    message,
    read
  )
  VALUES (
    NEW.mentioned_user_id,
    NEW.mentioned_by_user_id,
    'mention',
    related_post_id,
    NEW.comment_id,
    notification_message,
    false
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the mention insert
  RAISE WARNING 'Error creating comment mention notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADD LIKE NOTIFICATION TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  liker_name TEXT;
  post_owner_id UUID;
  notification_message TEXT;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id
  FROM public.posts
  WHERE id = NEW.post_id;

  -- Don't notify if user likes their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get the name of the person who liked
  SELECT full_name INTO liker_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Create notification message
  notification_message := COALESCE(liker_name, 'Someone') || ' liked your post';

  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    actor_id,
    type,
    post_id,
    message,
    read
  )
  VALUES (
    post_owner_id,
    NEW.user_id,
    'like',
    NEW.post_id,
    notification_message,
    false
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating like notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for like notifications
DROP TRIGGER IF EXISTS trigger_like_notification ON public.post_likes;
CREATE TRIGGER trigger_like_notification
  AFTER INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_like_notification();

-- ============================================
-- ADD COMMENT NOTIFICATION TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  commenter_name TEXT;
  post_owner_id UUID;
  notification_message TEXT;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id
  FROM public.posts
  WHERE id = NEW.post_id;

  -- Don't notify if user comments on their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get the name of the person who commented
  SELECT full_name INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Create notification message
  notification_message := COALESCE(commenter_name, 'Someone') || ' commented on your post';

  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    actor_id,
    type,
    post_id,
    comment_id,
    message,
    read
  )
  VALUES (
    post_owner_id,
    NEW.user_id,
    'comment',
    NEW.post_id,
    NEW.id,
    notification_message,
    false
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating comment notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comment notifications
DROP TRIGGER IF EXISTS trigger_comment_notification ON public.post_comments;
CREATE TRIGGER trigger_comment_notification
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_comment_notification();

-- ============================================
-- ADD FOLLOW NOTIFICATION TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
  notification_message TEXT;
BEGIN
  -- Get the name of the follower
  SELECT full_name INTO follower_name
  FROM public.profiles
  WHERE id = NEW.follower_id;

  -- Create notification message
  notification_message := COALESCE(follower_name, 'Someone') || ' started following you';

  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    actor_id,
    type,
    message,
    read
  )
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    'follow',
    notification_message,
    false
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating follow notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for follow notifications
DROP TRIGGER IF EXISTS trigger_follow_notification ON public.connections;
CREATE TRIGGER trigger_follow_notification
  AFTER INSERT ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.create_follow_notification();

-- ============================================
-- ADD REPOST NOTIFICATION TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.create_repost_notification()
RETURNS TRIGGER AS $$
DECLARE
  reposter_name TEXT;
  post_owner_id UUID;
  notification_message TEXT;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id
  FROM public.posts
  WHERE id = NEW.post_id;

  -- Don't notify if user reposts their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get the name of the person who reposted
  SELECT full_name INTO reposter_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Create notification message
  notification_message := COALESCE(reposter_name, 'Someone') || ' reposted your post';

  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    actor_id,
    type,
    post_id,
    message,
    read
  )
  VALUES (
    post_owner_id,
    NEW.user_id,
    'repost',
    NEW.post_id,
    notification_message,
    false
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating repost notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for repost notifications
DROP TRIGGER IF EXISTS trigger_repost_notification ON public.post_reposts;
CREATE TRIGGER trigger_repost_notification
  AFTER INSERT ON public.post_reposts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_repost_notification();
