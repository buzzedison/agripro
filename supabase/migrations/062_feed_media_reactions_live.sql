-- Run after 061. Multi-photo posts with alt text, uploaded video, typed reactions,
-- live new-post signals and a signed-out feed preview. Existing rows keep their values.
BEGIN;

-- Media: up to four photos or one uploaded video. image_url stays the first item so
-- older readers (bookmarks, search, duplicate guard, review triggers) keep working unchanged.
-- No backfill: readers fall back to image_url when media_urls is empty, and an UPDATE
-- here would re-run the post validation/review triggers on historical rows.
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_urls text[] NOT NULL DEFAULT '{}',
 ADD COLUMN IF NOT EXISTS media_alt text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_media_limits;
ALTER TABLE public.posts ADD CONSTRAINT posts_media_limits CHECK(
  cardinality(media_urls)<=4 AND cardinality(media_alt)<=cardinality(media_urls)
  AND coalesce(length(array_to_string(media_alt,'')),0)<=2000
  AND coalesce(array_to_string(media_urls,' ') ~ '^(https://[^ ]+/storage/v1/object/public/post-images/[^ ]+ ?)*$',true));

-- Media cannot be swapped after posting (the edit form does not change media), so
-- approved posts cannot gain new images that skipped review.
CREATE OR REPLACE FUNCTION public.guard_post_media() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF ROW(NEW.media_urls,NEW.media_alt) IS DISTINCT FROM ROW(OLD.media_urls,OLD.media_alt) AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Post media cannot be changed after posting.';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_post_media ON public.posts;
CREATE TRIGGER guard_post_media BEFORE UPDATE OF media_urls,media_alt ON public.posts FOR EACH ROW EXECUTE FUNCTION public.guard_post_media();

-- Uploads: photos (compressed client-side) and short videos, 50 MB cap per file.
UPDATE storage.buckets SET file_size_limit=52428800,
 allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif','video/mp4','video/webm','video/quicktime']
 WHERE id='post-images';

-- Reactions: a like row now carries a type; likes_count still counts every reaction.
ALTER TABLE public.post_likes ADD COLUMN IF NOT EXISTS reaction text NOT NULL DEFAULT 'like';
ALTER TABLE public.post_likes DROP CONSTRAINT IF EXISTS post_likes_reaction_check;
ALTER TABLE public.post_likes ADD CONSTRAINT post_likes_reaction_check CHECK(reaction IN ('like','useful','insightful','support'));
DROP POLICY IF EXISTS likes_update ON public.post_likes;
CREATE POLICY likes_update ON public.post_likes FOR UPDATE TO authenticated
  USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
DROP POLICY IF EXISTS likes_update_published_parent ON public.post_likes;
CREATE POLICY likes_update_published_parent ON public.post_likes AS RESTRICTIVE FOR UPDATE TO authenticated
  WITH CHECK (NOT public.feed_user_restricted(auth.uid()) AND EXISTS (SELECT 1 FROM public.posts WHERE id=post_id AND moderation_status='published'));

CREATE OR REPLACE FUNCTION public.post_reaction_counts(p_post_ids uuid[])
RETURNS TABLE(post_id uuid,reaction text,total bigint) LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT l.post_id,l.reaction,count(*) FROM public.post_likes l
  WHERE l.post_id=ANY(p_post_ids[1:50]) GROUP BY l.post_id,l.reaction;
$$;
REVOKE ALL ON FUNCTION public.post_reaction_counts(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.post_reaction_counts(uuid[]) TO anon,authenticated;

-- Live signals: Realtime applies posts RLS, so held and restricted posts are not broadcast to others.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime')
     AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='posts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  END IF;
END $$;

-- Signed-out preview: newest open, published posts from unrestricted authors only.
CREATE OR REPLACE FUNCTION public.public_feed_preview(p_limit integer DEFAULT 10)
RETURNS SETOF public.posts LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT p.* FROM public.posts p
  WHERE p.moderation_status='published' AND NOT p.is_closed AND (p.expires_at IS NULL OR p.expires_at>now())
    AND NOT public.feed_user_restricted(p.user_id)
  ORDER BY p.created_at DESC,p.id DESC LIMIT least(greatest(p_limit,1),20);
$$;
REVOKE ALL ON FUNCTION public.public_feed_preview(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_feed_preview(integer) TO anon,authenticated;

COMMIT;
