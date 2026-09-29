BEGIN;

-- Repair the guard before any backfill; also normalize duplicate legacy triggers.
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
           to_jsonb(NEW)->'post_id', to_jsonb(NEW)->'parent_comment_id')
       IS NOT DISTINCT FROM
       ROW(OLD.content, to_jsonb(OLD)->'image_url', to_jsonb(OLD)->'gif_url',
           to_jsonb(OLD)->'quoted_post_id', to_jsonb(OLD)->'is_poll',
           to_jsonb(OLD)->'post_id', to_jsonb(OLD)->'parent_comment_id') THEN
      RETURN NEW;
    END IF;
  END IF;
  -- Lock the same member row as moderation so posting and suspension cannot race.
  PERFORM 1 FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
  IF public.feed_user_restricted(NEW.user_id) THEN RAISE EXCEPTION 'Your feed access is restricted. Contact support to appeal.'; END IF;
  IF TG_OP = 'INSERT' THEN NEW.created_at := now(); END IF;
  v_text := lower(regexp_replace(trim(coalesce(NEW.content,'')), '[[:space:]]+', ' ', 'g'));
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

ALTER TABLE public.posts ADD COLUMN topic text NOT NULL DEFAULT 'general' CHECK (topic IN ('general','farming','markets','opportunities','questions','research'));
ALTER TABLE public.posts ADD COLUMN country text CHECK (length(country) <= 80);
ALTER TABLE public.posts ADD COLUMN moderation_status text NOT NULL DEFAULT 'published' CHECK (moderation_status IN ('published','pending','rejected'));
ALTER TABLE public.posts ADD COLUMN moderation_feedback text;
CREATE INDEX posts_discovery ON public.posts(topic, country, created_at DESC) WHERE moderation_status = 'published';
CREATE INDEX posts_review_queue ON public.posts(created_at) WHERE moderation_status = 'pending';

UPDATE public.posts p SET country = pr.country FROM public.profiles pr WHERE pr.id = p.user_id;

CREATE OR REPLACE FUNCTION public.guard_post_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count integer; v_changed boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_changed := true;
    IF NOT public.is_admin_user() THEN NEW.moderation_status := 'published'; NEW.moderation_feedback := NULL; END IF;
    IF NEW.country IS NULL THEN SELECT country INTO NEW.country FROM public.profiles WHERE id = NEW.user_id; END IF;
  ELSE
    IF NOT public.is_admin_user() AND ROW(NEW.moderation_status,NEW.moderation_feedback) IS DISTINCT FROM ROW(OLD.moderation_status,OLD.moderation_feedback) THEN
      RAISE EXCEPTION 'Only moderators can change review decisions.';
    END IF;
    v_changed := ROW(NEW.content,NEW.image_url,NEW.gif_url) IS DISTINCT FROM ROW(OLD.content,OLD.image_url,OLD.gif_url);
    IF v_changed THEN NEW.updated_at := clock_timestamp(); END IF;
    IF NOT v_changed THEN RETURN NEW; END IF;
    IF OLD.moderation_status IN ('pending','rejected') AND NOT public.is_admin_user() THEN
      NEW.moderation_status := 'pending'; NEW.moderation_feedback := NULL; RETURN NEW;
    END IF;
  END IF;
  IF NOT public.is_admin_user() THEN
    PERFORM 1 FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
    SELECT count(*) INTO v_count FROM (SELECT 1 FROM public.posts WHERE user_id = NEW.user_id AND id <> NEW.id AND moderation_status = 'published' LIMIT 3) p;
    IF v_count < 3 AND coalesce(NEW.content,'') ~* '(https?://|www\.|whatsapp|telegram|guaranteed[[:space:]]+(returns|profit)|dm[[:space:]]+me)' THEN
      NEW.moderation_status := 'pending';
      NEW.moderation_feedback := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER z_guard_post_review BEFORE INSERT OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.guard_post_review();
CREATE POLICY posts_review_visibility ON public.posts AS RESTRICTIVE FOR SELECT USING
  (moderation_status = 'published' OR user_id = auth.uid() OR public.is_admin_user());
CREATE POLICY hashtags_published_parent ON public.post_hashtags AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.posts WHERE id=post_id AND moderation_status='published'));
CREATE POLICY comments_published_parent ON public.post_comments AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.posts WHERE id=post_id AND moderation_status='published'));
CREATE POLICY likes_published_parent ON public.post_likes AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.feed_user_restricted(auth.uid()) AND EXISTS (SELECT 1 FROM public.posts WHERE id=post_id AND moderation_status='published'));
CREATE POLICY reposts_published_parent ON public.post_reposts AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.posts WHERE id=post_id AND moderation_status='published'));
CREATE POLICY post_mentions_published_parent ON public.post_mentions AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.feed_user_restricted(auth.uid()) AND EXISTS (SELECT 1 FROM public.posts WHERE id=post_id AND moderation_status='published'));
CREATE POLICY comment_mentions_published_parent ON public.comment_mentions AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.feed_user_restricted(auth.uid()) AND EXISTS (SELECT 1 FROM public.post_comments c JOIN public.posts p ON p.id=c.post_id WHERE c.id=comment_id AND p.moderation_status='published'));
CREATE POLICY posts_update_moderator ON public.posts FOR UPDATE TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE TABLE public.post_review_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid, author_id uuid NOT NULL,
  moderator_id uuid NOT NULL, decision text NOT NULL, feedback text NOT NULL, content_snapshot text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.post_review_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY post_review_audit ON public.post_review_history FOR SELECT TO authenticated USING (public.is_admin_user());
GRANT SELECT ON public.post_review_history TO authenticated;
CREATE OR REPLACE FUNCTION public.review_feed_post(p_post uuid, p_decision text, p_feedback text, p_updated_at timestamptz)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_post public.posts;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin_user() THEN RAISE EXCEPTION 'Admin access required.'; END IF;
  IF p_decision IS NULL OR p_decision NOT IN ('published','rejected') OR p_feedback IS NULL OR length(trim(p_feedback)) NOT BETWEEN 5 AND 1000 THEN RAISE EXCEPTION 'Choose a decision and enter feedback (5–1,000 characters).'; END IF;
  SELECT * INTO v_post FROM public.posts WHERE id = p_post FOR UPDATE;
  IF NOT FOUND OR v_post.moderation_status <> 'pending' THEN RAISE EXCEPTION 'This post is no longer awaiting review.'; END IF;
  IF p_updated_at IS DISTINCT FROM v_post.updated_at THEN RAISE EXCEPTION 'This post changed. Refresh before reviewing it.'; END IF;
  INSERT INTO public.post_review_history(post_id,author_id,moderator_id,decision,feedback,content_snapshot)
    VALUES(p_post,v_post.user_id,auth.uid(),p_decision,trim(p_feedback),v_post.content);
  UPDATE public.posts SET moderation_status = p_decision, moderation_feedback = trim(p_feedback) WHERE id = p_post;
END;
$$;
REVOKE ALL ON FUNCTION public.review_feed_post(uuid,text,text,timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_feed_post(uuid,text,text,timestamptz) TO authenticated;

CREATE TABLE public.feed_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL CHECK (length(trim(title)) BETWEEN 3 AND 120),
  body text NOT NULL CHECK (length(trim(body)) BETWEEN 5 AND 2000),
  created_by uuid NOT NULL DEFAULT auth.uid(), created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz, active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.feed_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY announcements_read ON public.feed_announcements FOR SELECT USING ((active AND (expires_at IS NULL OR expires_at > now())) OR public.is_admin_user());
CREATE POLICY announcements_admin ON public.feed_announcements FOR ALL TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
GRANT SELECT ON public.feed_announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.feed_announcements TO authenticated;

-- Only the safe status projection is exposed to reporters; admin notes remain private.
CREATE OR REPLACE FUNCTION public.my_feed_reports()
RETURNS TABLE(id uuid,target_type text,target_id uuid,reason text,status text,created_at timestamptz,reviewed_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id,target_type,target_id,reason,status,created_at,reviewed_at FROM public.content_reports WHERE reporter_id = auth.uid() ORDER BY created_at DESC LIMIT 50;
$$;
REVOKE ALL ON FUNCTION public.my_feed_reports() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_feed_reports() TO authenticated;
CREATE OR REPLACE FUNCTION public.guard_report_submission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NEW.reporter_id <> auth.uid() THEN RAISE EXCEPTION 'Sign in to report content.'; END IF;
  PERFORM 1 FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
  IF length(coalesce(NEW.details,'')) > 2000 THEN RAISE EXCEPTION 'Keep report details under 2,000 characters.'; END IF;
  IF EXISTS (SELECT 1 FROM public.content_reports WHERE reporter_id=auth.uid() AND target_type=NEW.target_type AND target_id=NEW.target_id AND status IN ('pending','reviewed')) THEN RAISE EXCEPTION 'You already have an open report for this content.'; END IF;
  IF (SELECT count(*) FROM public.content_reports WHERE reporter_id=auth.uid() AND created_at > now()-interval '1 hour') >= 10 THEN RAISE EXCEPTION 'Report limit reached. Please try again later.'; END IF;
  NEW.status := 'pending'; NEW.admin_notes := NULL; NEW.reviewed_at := NULL; NEW.reviewed_by := NULL; NEW.created_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_report_submission BEFORE INSERT ON public.content_reports FOR EACH ROW EXECUTE FUNCTION public.guard_report_submission();

CREATE TABLE public.feed_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE, moderation_action_id uuid REFERENCES public.moderation_actions(id),
  message text NOT NULL CHECK (length(trim(message)) BETWEEN 20 AND 2000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  response text, created_at timestamptz NOT NULL DEFAULT now(), reviewed_at timestamptz, reviewed_by uuid
);
CREATE UNIQUE INDEX appeal_account_open ON public.feed_appeals(user_id) WHERE post_id IS NULL AND status = 'pending';
CREATE UNIQUE INDEX appeal_post_open ON public.feed_appeals(post_id) WHERE post_id IS NOT NULL AND status = 'pending';
ALTER TABLE public.feed_appeals ENABLE ROW LEVEL SECURITY;
CREATE POLICY appeals_read ON public.feed_appeals FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.is_admin_user());
GRANT SELECT ON public.feed_appeals TO authenticated;
CREATE OR REPLACE FUNCTION public.submit_feed_appeal(p_message text, p_post uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_action uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to appeal.'; END IF;
  PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
  IF p_message IS NULL OR length(trim(p_message)) NOT BETWEEN 20 AND 2000 THEN RAISE EXCEPTION 'Explain your appeal in 20–2,000 characters.'; END IF;
  IF p_post IS NULL THEN
    IF NOT public.feed_user_restricted(auth.uid()) THEN RAISE EXCEPTION 'Your account has no active feed restriction.'; END IF;
    SELECT id INTO v_action FROM public.moderation_actions WHERE user_id=auth.uid() ORDER BY created_at DESC,id DESC LIMIT 1;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE id=p_post AND user_id=auth.uid() AND moderation_status='rejected') THEN RAISE EXCEPTION 'You can only appeal your own rejected posts.'; END IF;
  END IF;
  IF (SELECT count(*) FROM public.feed_appeals WHERE user_id=auth.uid() AND created_at > now()-interval '24 hours') >= 3 THEN RAISE EXCEPTION 'You can send up to 3 appeals a day.'; END IF;
  INSERT INTO public.feed_appeals(user_id,post_id,moderation_action_id,message) VALUES(auth.uid(),p_post,v_action,trim(p_message));
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'You already have an appeal awaiting review.';
END;
$$;
CREATE OR REPLACE FUNCTION public.review_feed_appeal(p_appeal uuid,p_accept boolean,p_response text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_appeal public.feed_appeals; v_latest uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin_user() THEN RAISE EXCEPTION 'Admin access required.'; END IF;
  IF p_accept IS NULL OR p_response IS NULL OR length(trim(p_response)) NOT BETWEEN 5 AND 1000 THEN RAISE EXCEPTION 'Enter a response (5–1,000 characters).'; END IF;
  SELECT * INTO v_appeal FROM public.feed_appeals WHERE id=p_appeal FOR UPDATE;
  IF NOT FOUND OR v_appeal.status <> 'pending' THEN RAISE EXCEPTION 'This appeal has already been reviewed.'; END IF;
  IF p_accept THEN
    IF v_appeal.post_id IS NULL THEN
      PERFORM 1 FROM public.profiles WHERE id=v_appeal.user_id FOR UPDATE;
      SELECT id INTO v_latest FROM public.moderation_actions WHERE user_id=v_appeal.user_id ORDER BY created_at DESC,id DESC LIMIT 1;
      IF v_latest IS DISTINCT FROM v_appeal.moderation_action_id THEN RAISE EXCEPTION 'The account restriction changed. Review the latest action before resolving this appeal.'; END IF;
      PERFORM public.moderate_feed_user(v_appeal.user_id,'restore',p_response,7);
    ELSE
      UPDATE public.posts SET moderation_status='published',moderation_feedback=trim(p_response) WHERE id=v_appeal.post_id AND moderation_status='rejected';
      IF NOT FOUND THEN RAISE EXCEPTION 'The post changed. Review it in the post queue.'; END IF;
      INSERT INTO public.post_review_history(post_id,author_id,moderator_id,decision,feedback,content_snapshot)
        SELECT id,user_id,auth.uid(),'appeal_accepted',trim(p_response),content FROM public.posts WHERE id=v_appeal.post_id;
    END IF;
  END IF;
  UPDATE public.feed_appeals SET status=CASE WHEN p_accept THEN 'accepted' ELSE 'rejected' END,response=trim(p_response),reviewed_at=now(),reviewed_by=auth.uid() WHERE id=p_appeal;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_feed_appeal(text,uuid), public.review_feed_appeal(uuid,boolean,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_feed_appeal(text,uuid), public.review_feed_appeal(uuid,boolean,text) TO authenticated;

-- Discovery filters run before pagination. Keep the legacy RPC for other callers.
CREATE OR REPLACE FUNCTION public.discover_feed(p_limit integer DEFAULT 20,p_offset integer DEFAULT 0,p_topic text DEFAULT NULL,p_country text DEFAULT NULL,p_following boolean DEFAULT false,p_hashtag text DEFAULT NULL)
RETURNS SETOF public.posts LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT p.* FROM public.posts p WHERE p.moderation_status='published'
    AND NOT public.feed_user_restricted(p.user_id)
    AND (p_topic IS NULL OR p.topic=p_topic)
    AND (p_country IS NULL OR lower(p.country)=lower(p_country))
    AND (p_hashtag IS NULL OR p.content ~* ('(^|[^[:alnum:]_])#' || regexp_replace(p_hashtag,'[^[:alnum:]_]','','g') || '([^[:alnum:]_]|$)'))
    AND (NOT p_following OR p.user_id=auth.uid() OR EXISTS (SELECT 1 FROM public.connections c WHERE c.follower_id=auth.uid() AND c.following_id=p.user_id))
    AND NOT public.is_blocked_pair(auth.uid(),p.user_id)
    AND NOT EXISTS (SELECT 1 FROM public.user_mutes m WHERE m.muter_id=auth.uid() AND m.muted_id=p.user_id)
  ORDER BY (CASE WHEN NOT p_following AND p.created_at > now()-interval '24 hours' AND EXISTS
    (SELECT 1 FROM public.user_connections c WHERE c.status='accepted' AND ((c.requester_id=auth.uid() AND c.receiver_id=p.user_id) OR (c.receiver_id=auth.uid() AND c.requester_id=p.user_id))) THEN 1 ELSE 0 END) DESC,
    p.created_at DESC,p.id DESC LIMIT least(greatest(p_limit,1),50) OFFSET greatest(p_offset,0);
$$;
CREATE OR REPLACE FUNCTION public.feed_countries()
RETURNS SETOF text LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT DISTINCT country FROM public.posts WHERE country IS NOT NULL AND country<>'' AND moderation_status='published' AND NOT public.feed_user_restricted(user_id) ORDER BY country;
$$;
REVOKE ALL ON FUNCTION public.discover_feed(integer,integer,text,text,boolean,text),public.feed_countries() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.discover_feed(integer,integer,text,text,boolean,text),public.feed_countries() TO authenticated;
CREATE OR REPLACE FUNCTION get_network_feed(p_limit INTEGER DEFAULT 50, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    content TEXT,
    image_url TEXT,
    gif_url TEXT,
    is_poll BOOLEAN,
    created_at TIMESTAMPTZ,
    likes_count INTEGER,
    comments_count INTEGER,
    reposts_count INTEGER,
    views_count INTEGER,
    quoted_post_id UUID,
    is_connection BOOLEAN
) AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    RETURN QUERY
    WITH connected_users AS (
        SELECT requester_id AS user_id FROM public.user_connections
        WHERE receiver_id = v_user_id AND status = 'accepted'
        UNION
        SELECT receiver_id AS user_id FROM public.user_connections
        WHERE requester_id = v_user_id AND status = 'accepted'
    )
    SELECT
        p.id,
        p.user_id,
        p.content,
        p.image_url,
        p.gif_url,
        p.is_poll,
        p.created_at,
        p.likes_count,
        p.comments_count,
        p.reposts_count,
        p.views_count,
        p.quoted_post_id,
        CASE WHEN cu.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_connection
    FROM public.posts p
    LEFT JOIN connected_users cu ON p.user_id = cu.user_id
    WHERE p.moderation_status = 'published' AND
        (v_user_id IS NULL OR NOT public.is_blocked_pair(v_user_id, p.user_id))
        AND (v_user_id IS NULL OR NOT EXISTS (
            SELECT 1 FROM public.user_mutes um
            WHERE um.muter_id = v_user_id AND um.muted_id = p.user_id
        ))
        AND NOT public.feed_user_restricted(p.user_id)
    ORDER BY
        (CASE WHEN cu.user_id IS NOT NULL AND p.created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) DESC,
        p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;


COMMIT;
