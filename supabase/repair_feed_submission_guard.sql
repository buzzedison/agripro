-- Run this once in Supabase SQL Editor before retrying migration 056.
-- Safe to rerun. Preserves posts, moderation rules, and rate-limit history.
BEGIN;
CREATE OR REPLACE FUNCTION public.guard_feed_submission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_text text; v_fingerprint text; v_count integer;
BEGIN
  -- Counter updates from likes/comments must continue to work.
  IF TG_OP = 'UPDATE' THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Author and publication date cannot be changed.';
    END IF;
    -- Only user-authored content changes are submissions. Schema backfills,
    -- moderation decisions and counters must never consume the posting quota.
    IF ROW(NEW.content, to_jsonb(NEW)->'image_url', to_jsonb(NEW)->'gif_url',
           to_jsonb(NEW)->'quoted_post_id', to_jsonb(NEW)->'is_poll',
           to_jsonb(NEW)->'post_id', to_jsonb(NEW)->'parent_comment_id',
           to_jsonb(NEW)->'post_kind', to_jsonb(NEW)->'post_details')
       IS NOT DISTINCT FROM
       ROW(OLD.content, to_jsonb(OLD)->'image_url', to_jsonb(OLD)->'gif_url',
           to_jsonb(OLD)->'quoted_post_id', to_jsonb(OLD)->'is_poll',
           to_jsonb(OLD)->'post_id', to_jsonb(OLD)->'parent_comment_id',
           to_jsonb(OLD)->'post_kind', to_jsonb(OLD)->'post_details') THEN
      RETURN NEW;
    END IF;
  END IF;
  -- Lock the same member row as moderation so posting and suspension cannot race.
  PERFORM 1 FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
  IF public.feed_user_restricted(NEW.user_id) THEN RAISE EXCEPTION 'Your feed access is restricted. Contact support to appeal.'; END IF;
  IF TG_OP = 'INSERT' THEN NEW.created_at := now(); END IF;
  v_text := lower(regexp_replace(trim(coalesce(NEW.content,'') || CASE WHEN coalesce(to_jsonb(NEW)->'post_details','{}'::jsonb)<>'{}'::jsonb THEN ' ' || (to_jsonb(NEW)->'post_details')::text ELSE '' END), '[[:space:]]+', ' ', 'g'));
  IF length(NEW.content) > 5000 THEN RAISE EXCEPTION 'Keep your message under 5,000 characters.'; END IF;
  SELECT count(*) INTO v_count FROM regexp_matches(v_text, '(https?://|www\.)', 'g');
  IF v_count > 3 THEN RAISE EXCEPTION 'Use no more than 3 links per message.'; END IF;
  v_fingerprint := md5(CASE WHEN v_text <> '' THEN v_text ELSE coalesce(to_jsonb(NEW)->>'image_url','') || coalesce(to_jsonb(NEW)->>'gif_url','') END);
  IF EXISTS (SELECT 1 FROM public.feed_submission_log WHERE user_id = NEW.user_id AND submitted_at > now() - interval '15 seconds') THEN
    RAISE EXCEPTION 'Please wait 15 seconds between posts, comments or edits.';
  END IF;
  SELECT count(*) INTO v_count FROM public.feed_submission_log WHERE user_id = NEW.user_id AND submitted_at > now() - interval '1 hour';
  IF v_count >= 30 THEN RAISE EXCEPTION 'You have reached the hourly limit of 30 messages. Please try again later.'; END IF;
  IF (v_text <> '' OR coalesce(to_jsonb(NEW)->>'image_url', to_jsonb(NEW)->>'gif_url') IS NOT NULL) AND EXISTS (SELECT 1 FROM public.feed_submission_log WHERE user_id = NEW.user_id AND fingerprint = v_fingerprint AND submitted_at > now() - interval '24 hours') THEN
    RAISE EXCEPTION 'You already shared this message in the last 24 hours. Add something new.';
  END IF;
  DELETE FROM public.feed_submission_log WHERE user_id = NEW.user_id AND submitted_at < now() - interval '24 hours';
  INSERT INTO public.feed_submission_log(user_id,fingerprint) VALUES(NEW.user_id,v_fingerprint);
  RETURN NEW;
END;
$$;

-- Replace only triggers attached to this specific spam-guard function.
-- Lock both tables so writes cannot slip between trigger replacement steps.
LOCK TABLE public.posts, public.post_comments IN SHARE ROW EXCLUSIVE MODE;
DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT tgname, tgrelid::regclass AS relation
    FROM pg_trigger
    WHERE NOT tgisinternal
      AND tgfoid = 'public.guard_feed_submission()'::regprocedure
      AND tgrelid IN ('public.posts'::regclass, 'public.post_comments'::regclass)
  LOOP
    EXECUTE format('DROP TRIGGER %I ON %s', t.tgname, t.relation);
  END LOOP;
END;
$$;
CREATE TRIGGER guard_feed_post BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.guard_feed_submission();
CREATE TRIGGER guard_feed_comment BEFORE INSERT OR UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.guard_feed_submission();

COMMIT;
