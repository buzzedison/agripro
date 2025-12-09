-- Migration to add bookmarks and mentions functionality
-- Enables users to save posts and tag other users

-- ============================================
-- BOOKMARKS
-- ============================================

-- Step 1: Create post_bookmarks table
CREATE TABLE IF NOT EXISTS public.post_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id) -- prevent duplicate bookmarks
);

-- Step 2: Create indexes for bookmarks
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user_id ON public.post_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_post_id ON public.post_bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_created_at ON public.post_bookmarks(created_at DESC);

-- Step 3: Enable RLS for bookmarks
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for bookmarks
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.post_bookmarks;
DROP POLICY IF EXISTS "Users can create own bookmarks" ON public.post_bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.post_bookmarks;

CREATE POLICY "Users can view own bookmarks"
  ON public.post_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
  ON public.post_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.post_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Grant permissions for bookmarks
GRANT ALL ON public.post_bookmarks TO authenticated;

-- ============================================
-- MENTIONS
-- ============================================

-- Step 6: Create post_mentions table
CREATE TABLE IF NOT EXISTS public.post_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, mentioned_user_id) -- prevent duplicate mentions in same post
);

-- Step 7: Create comment_mentions table
CREATE TABLE IF NOT EXISTS public.comment_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, mentioned_user_id) -- prevent duplicate mentions in same comment
);

-- Step 8: Create indexes for mentions
CREATE INDEX IF NOT EXISTS idx_post_mentions_post_id ON public.post_mentions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_mentions_mentioned_user_id ON public.post_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_post_mentions_mentioned_by_user_id ON public.post_mentions(mentioned_by_user_id);
CREATE INDEX IF NOT EXISTS idx_comment_mentions_comment_id ON public.comment_mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_mentions_mentioned_user_id ON public.comment_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_comment_mentions_mentioned_by_user_id ON public.comment_mentions(mentioned_by_user_id);

-- Step 9: Enable RLS for mentions
ALTER TABLE public.post_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_mentions ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS policies for post mentions
DROP POLICY IF EXISTS "Post mentions are viewable by everyone" ON public.post_mentions;
DROP POLICY IF EXISTS "Users can create mentions in their posts" ON public.post_mentions;
DROP POLICY IF EXISTS "Users can delete mentions from their posts" ON public.post_mentions;

CREATE POLICY "Post mentions are viewable by everyone"
  ON public.post_mentions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create mentions in their posts"
  ON public.post_mentions
  FOR INSERT
  WITH CHECK (
    auth.uid() = mentioned_by_user_id AND
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete mentions from their posts"
  ON public.post_mentions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Step 11: Create RLS policies for comment mentions
DROP POLICY IF EXISTS "Comment mentions are viewable by everyone" ON public.comment_mentions;
DROP POLICY IF EXISTS "Users can create mentions in their comments" ON public.comment_mentions;
DROP POLICY IF EXISTS "Users can delete mentions from their comments" ON public.comment_mentions;

CREATE POLICY "Comment mentions are viewable by everyone"
  ON public.comment_mentions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create mentions in their comments"
  ON public.comment_mentions
  FOR INSERT
  WITH CHECK (
    auth.uid() = mentioned_by_user_id AND
    EXISTS (
      SELECT 1 FROM public.post_comments
      WHERE id = comment_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete mentions from their comments"
  ON public.comment_mentions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.post_comments
      WHERE id = comment_id AND user_id = auth.uid()
    )
  );

-- Step 12: Grant permissions for mentions
GRANT ALL ON public.post_mentions TO authenticated;
GRANT SELECT ON public.post_mentions TO anon;
GRANT ALL ON public.comment_mentions TO authenticated;
GRANT SELECT ON public.comment_mentions TO anon;

-- Step 13: Add helper function to get user by username (for mention autocomplete)
CREATE OR REPLACE FUNCTION public.search_users_for_mention(search_term TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT,
  organization_name TEXT,
  is_verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.avatar_url,
    p.user_type,
    p.organization_name,
    p.is_verified
  FROM public.profiles p
  WHERE
    p.is_public = true AND
    (
      LOWER(p.full_name) LIKE LOWER(search_term || '%') OR
      LOWER(p.full_name) LIKE LOWER('% ' || search_term || '%')
    )
  ORDER BY
    p.is_verified DESC,
    p.full_name ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.search_users_for_mention TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_users_for_mention TO anon;
