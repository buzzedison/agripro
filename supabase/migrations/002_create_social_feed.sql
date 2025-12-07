-- AgriPro Social Feed - CLEAN INSTALL
-- This will DROP and recreate the social tables
-- Run in Supabase SQL Editor

-- Step 1: Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.post_comments CASCADE;
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;

-- Step 2: Drop existing functions
DROP FUNCTION IF EXISTS update_post_likes_count() CASCADE;
DROP FUNCTION IF EXISTS update_post_comments_count() CASCADE;

-- Step 3: Create posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0
);

-- Step 4: Create connections table
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'following',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Step 5: Create post_likes table
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Step 6: Create post_comments table
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: Create indexes
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_connections_follower ON public.connections(follower_id);
CREATE INDEX idx_connections_following ON public.connections(following_id);
CREATE INDEX idx_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_likes_post_id ON public.post_likes(post_id);

-- Step 8: Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Step 9: Grant permissions
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.connections TO authenticated;
GRANT ALL ON public.post_likes TO authenticated;
GRANT ALL ON public.post_comments TO authenticated;
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.post_comments TO anon;

-- Step 10: Create RLS policies for posts
CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Step 11: Create RLS policies for connections
CREATE POLICY "connections_select" ON public.connections FOR SELECT USING (true);
CREATE POLICY "connections_insert" ON public.connections FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "connections_delete" ON public.connections FOR DELETE USING (auth.uid() = follower_id);

-- Step 12: Create RLS policies for post_likes
CREATE POLICY "likes_select" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Step 13: Create RLS policies for post_comments
CREATE POLICY "comments_select" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update" ON public.post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- Step 14: Create trigger functions
CREATE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 15: Create triggers
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
