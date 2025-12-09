-- Migration to add notifications system
-- Notifies users when they're mentioned, liked, commented on, etc.

-- Step 1: Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- who receives the notification
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- who triggered it
  type TEXT NOT NULL CHECK (type IN ('mention', 'like', 'comment', 'repost', 'follow')),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;

-- Step 3: Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 5: Grant permissions
GRANT ALL ON public.notifications TO authenticated;

-- Step 6: Function to create mention notifications
CREATE OR REPLACE FUNCTION public.create_mention_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_name TEXT;
  notification_message TEXT;
BEGIN
  -- Get the name of the person who mentioned
  SELECT full_name INTO post_author_name
  FROM public.profiles
  WHERE id = NEW.mentioned_by_user_id;

  -- Create notification message
  notification_message := post_author_name || ' mentioned you in a post';

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
    NEW.mentioned_user_id,
    NEW.mentioned_by_user_id,
    'mention',
    NEW.post_id,
    notification_message,
    false
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger for mention notifications
DROP TRIGGER IF EXISTS trigger_mention_notification ON public.post_mentions;
CREATE TRIGGER trigger_mention_notification
  AFTER INSERT ON public.post_mentions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_mention_notification();

-- Step 8: Function to create comment mention notifications
CREATE OR REPLACE FUNCTION public.create_comment_mention_notification()
RETURNS TRIGGER AS $$
DECLARE
  commenter_name TEXT;
  notification_message TEXT;
BEGIN
  -- Get the name of the person who mentioned
  SELECT full_name INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.mentioned_by_user_id;

  -- Create notification message
  notification_message := commenter_name || ' mentioned you in a comment';

  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    actor_id,
    type,
    comment_id,
    message,
    read
  )
  VALUES (
    NEW.mentioned_user_id,
    NEW.mentioned_by_user_id,
    'mention',
    NEW.comment_id,
    notification_message,
    false
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger for comment mention notifications
DROP TRIGGER IF EXISTS trigger_comment_mention_notification ON public.comment_mentions;
CREATE TRIGGER trigger_comment_mention_notification
  AFTER INSERT ON public.comment_mentions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_comment_mention_notification();
