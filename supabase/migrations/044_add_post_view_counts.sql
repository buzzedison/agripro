-- 044_add_post_view_counts.sql
-- Tracks how many times a post has been viewed. Incremented via an atomic
-- RPC (not a read-then-write from the client) so concurrent views don't race.
-- v1 scope: counted once per visitor per post on the permalink page
-- (deduped client-side via sessionStorage) — not per-impression in the feed.

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_post_views(p_post_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.posts
  SET views_count = views_count + 1
  WHERE id = p_post_id
  RETURNING views_count;
$$;

GRANT EXECUTE ON FUNCTION public.increment_post_views(UUID) TO anon, authenticated;
