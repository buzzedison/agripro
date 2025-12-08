-- AgriPro Social Feed - Add Reposts Table
-- Run this in Supabase SQL Editor

-- Step 1: Create post_reposts table (similar to post_likes)
CREATE TABLE IF NOT EXISTS public.post_reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reposts_post_id ON public.post_reposts(post_id);
CREATE INDEX IF NOT EXISTS idx_reposts_user_id ON public.post_reposts(user_id);

-- Step 3: Enable RLS
ALTER TABLE public.post_reposts ENABLE ROW LEVEL SECURITY;

-- Step 4: Grant permissions
GRANT ALL ON public.post_reposts TO authenticated;
GRANT SELECT ON public.post_reposts TO anon;

-- Step 5: Create RLS policies for post_reposts
CREATE POLICY "reposts_select" ON public.post_reposts FOR SELECT USING (true);
CREATE POLICY "reposts_insert" ON public.post_reposts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reposts_delete" ON public.post_reposts FOR DELETE USING (auth.uid() = user_id);

-- Step 6: Create trigger function to update reposts_count
CREATE OR REPLACE FUNCTION update_post_reposts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET reposts_count = reposts_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET reposts_count = GREATEST(reposts_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger
DROP TRIGGER IF EXISTS trigger_update_reposts_count ON public.post_reposts;
CREATE TRIGGER trigger_update_reposts_count
  AFTER INSERT OR DELETE ON public.post_reposts
  FOR EACH ROW EXECUTE FUNCTION update_post_reposts_count();
