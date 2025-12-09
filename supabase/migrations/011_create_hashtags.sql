-- Migration to add hashtag support to the feed
-- This enables hashtag parsing, storage, and trending functionality

-- Step 1: Create hashtags table
CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- hashtag name without # (e.g., 'PoultryFarming')
  normalized_name TEXT NOT NULL, -- lowercase version for matching (e.g., 'poultryfarming')
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  use_count INTEGER DEFAULT 0, -- total times this hashtag has been used
  last_used_at TIMESTAMPTZ DEFAULT NOW() -- last time this hashtag was used in a post
);

-- Step 2: Create post_hashtags junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.post_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, hashtag_id) -- prevent duplicate hashtag entries for same post
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hashtags_normalized_name ON public.hashtags(normalized_name);
CREATE INDEX IF NOT EXISTS idx_hashtags_use_count ON public.hashtags(use_count DESC);
CREATE INDEX IF NOT EXISTS idx_hashtags_last_used_at ON public.hashtags(last_used_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON public.post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag_id ON public.post_hashtags(hashtag_id);

-- Step 4: Enable Row Level Security
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies for hashtags (everyone can read, authenticated can create)
DROP POLICY IF EXISTS "Hashtags are viewable by everyone" ON public.hashtags;
DROP POLICY IF EXISTS "Authenticated users can insert hashtags" ON public.hashtags;
DROP POLICY IF EXISTS "System can update hashtag counts" ON public.hashtags;

CREATE POLICY "Hashtags are viewable by everyone"
  ON public.hashtags
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert hashtags"
  ON public.hashtags
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "System can update hashtag counts"
  ON public.hashtags
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Step 6: Create RLS Policies for post_hashtags
DROP POLICY IF EXISTS "Post hashtags are viewable by everyone" ON public.post_hashtags;
DROP POLICY IF EXISTS "Users can insert hashtags for their posts" ON public.post_hashtags;
DROP POLICY IF EXISTS "Users can delete hashtags from their posts" ON public.post_hashtags;

CREATE POLICY "Post hashtags are viewable by everyone"
  ON public.post_hashtags
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert hashtags for their posts"
  ON public.post_hashtags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete hashtags from their posts"
  ON public.post_hashtags
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Step 7: Function to update hashtag use_count and last_used_at
CREATE OR REPLACE FUNCTION update_hashtag_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Increment use count and update last_used_at when hashtag is added to a post
    UPDATE public.hashtags
    SET use_count = use_count + 1,
        last_used_at = NOW(),
        updated_at = NOW()
    WHERE id = NEW.hashtag_id;
  ELSIF (TG_OP = 'DELETE') THEN
    -- Decrement use count when hashtag is removed from a post
    UPDATE public.hashtags
    SET use_count = GREATEST(0, use_count - 1),
        updated_at = NOW()
    WHERE id = OLD.hashtag_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger to auto-update hashtag stats
DROP TRIGGER IF EXISTS trigger_update_hashtag_stats ON public.post_hashtags;
CREATE TRIGGER trigger_update_hashtag_stats
  AFTER INSERT OR DELETE ON public.post_hashtags
  FOR EACH ROW
  EXECUTE FUNCTION update_hashtag_stats();

-- Step 9: Function to update updated_at timestamp for hashtags
CREATE OR REPLACE FUNCTION update_hashtags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_hashtags_updated_at_trigger ON public.hashtags;
CREATE TRIGGER update_hashtags_updated_at_trigger
  BEFORE UPDATE ON public.hashtags
  FOR EACH ROW
  EXECUTE FUNCTION update_hashtags_updated_at();

-- Step 11: Grant permissions
GRANT ALL ON public.hashtags TO authenticated;
GRANT SELECT ON public.hashtags TO anon;
GRANT ALL ON public.post_hashtags TO authenticated;
GRANT SELECT ON public.post_hashtags TO anon;

-- Step 12: Create view for trending hashtags (frequently used in last 7 days)
CREATE OR REPLACE VIEW public.trending_hashtags AS
SELECT
  h.id,
  h.name,
  h.normalized_name,
  h.use_count,
  h.last_used_at,
  COUNT(DISTINCT ph.post_id) as recent_post_count,
  COUNT(DISTINCT ph.post_id) * 1.0 / NULLIF(
    EXTRACT(EPOCH FROM (NOW() - h.last_used_at)) / 86400, 0
  ) as trend_score
FROM public.hashtags h
LEFT JOIN public.post_hashtags ph ON h.id = ph.hashtag_id
LEFT JOIN public.posts p ON ph.post_id = p.id
WHERE h.last_used_at > NOW() - INTERVAL '7 days'
  AND (p.created_at IS NULL OR p.created_at > NOW() - INTERVAL '7 days')
GROUP BY h.id, h.name, h.normalized_name, h.use_count, h.last_used_at
ORDER BY trend_score DESC, recent_post_count DESC, h.use_count DESC
LIMIT 10;

-- Grant permissions on view
GRANT SELECT ON public.trending_hashtags TO authenticated;
GRANT SELECT ON public.trending_hashtags TO anon;
