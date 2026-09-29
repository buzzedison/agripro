-- Database enforcement also covers direct browser writes, edits and alternate feeds.
BEGIN;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_until timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.feed_user_restricted(p_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user AND
    (is_blocked OR (is_suspended AND (suspended_until IS NULL OR suspended_until > now()))));
$$;

CREATE TABLE public.moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL, -- Preserve the audit trail after account deletion.
  user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('suspend', 'block', 'restore', 'delete')),
  reason text NOT NULL,
  suspended_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY moderation_audit_read ON public.moderation_actions FOR SELECT TO authenticated USING (public.is_admin_user());
GRANT SELECT ON public.moderation_actions TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_profile_moderation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin_user() THEN
    IF TG_OP = 'INSERT' THEN
      IF coalesce(NEW.is_suspended, false) OR NEW.is_blocked OR NEW.suspended_until IS NOT NULL THEN
        RAISE EXCEPTION 'Only admins can change moderation status.';
      END IF;
    ELSIF ROW(NEW.is_suspended, NEW.is_blocked, NEW.suspended_until)
      IS DISTINCT FROM ROW(OLD.is_suspended, OLD.is_blocked, OLD.suspended_until) THEN
      RAISE EXCEPTION 'Only admins can change moderation status.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER guard_profile_moderation BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_profile_moderation();

CREATE OR REPLACE FUNCTION public.moderate_feed_user(p_user uuid, p_action text, p_reason text, p_days integer DEFAULT 7)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_until timestamptz;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin_user() THEN RAISE EXCEPTION 'Admin access required.'; END IF;
  IF p_user = auth.uid() THEN RAISE EXCEPTION 'You cannot moderate your own account.'; END IF;
  IF p_action IS NULL OR p_action NOT IN ('suspend','block','restore','delete') THEN RAISE EXCEPTION 'Invalid action.'; END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) < 5 OR length(p_reason) > 1000 THEN RAISE EXCEPTION 'Enter a reason between 5 and 1,000 characters.'; END IF;
  IF EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p_user AND
      (lower(u.email) = 'edison@agriprohub.com' OR EXISTS
       (SELECT 1 FROM public.admin_users a WHERE lower(a.email) = lower(u.email) AND coalesce(a.is_active, true)))) THEN
    RAISE EXCEPTION 'Admin accounts cannot be moderated here.';
  END IF;
  PERFORM 1 FROM public.profiles WHERE id = p_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member no longer exists.'; END IF;
  IF p_action = 'suspend' THEN
    IF p_days IS NULL OR p_days NOT IN (1,7,30) THEN RAISE EXCEPTION 'Choose a 1, 7 or 30 day suspension.'; END IF;
    v_until := now() + make_interval(days => p_days);
  END IF;
  INSERT INTO public.moderation_actions(admin_id,user_id,action,reason,suspended_until)
    VALUES(auth.uid(),p_user,p_action,trim(p_reason),v_until);
  UPDATE public.content_reports SET status = 'actioned', reviewed_by = auth.uid(), reviewed_at = now(), admin_notes = p_action || ': ' || trim(p_reason)
    WHERE status IN ('pending','reviewed') AND (
      (target_type = 'user' AND target_id = p_user) OR
      (target_type = 'post' AND target_id IN (SELECT id FROM public.posts WHERE user_id = p_user)) OR
      (target_type = 'comment' AND target_id IN (SELECT id FROM public.post_comments WHERE user_id = p_user))) AND p_action <> 'restore';
  IF p_action = 'delete' THEN
    -- Atomic: if a dependent record prevents deletion, the audit and report updates roll back.
    DELETE FROM auth.users WHERE id = p_user;
  ELSE
    UPDATE public.profiles SET is_suspended = p_action = 'suspend', is_blocked = p_action = 'block',
      suspended_until = v_until WHERE id = p_user;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.moderate_feed_user(uuid,text,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.moderate_feed_user(uuid,text,text,integer) TO authenticated;

-- Restrictive policies cannot be bypassed by existing permissive SELECT policies.
CREATE POLICY feed_posts_visibility ON public.posts AS RESTRICTIVE FOR SELECT USING
  (public.is_admin_user() OR (NOT public.feed_user_restricted(user_id) AND NOT public.is_blocked_pair(auth.uid(),user_id)));
CREATE POLICY feed_comments_visibility ON public.post_comments AS RESTRICTIVE FOR SELECT USING
  (public.is_admin_user() OR (NOT public.feed_user_restricted(user_id) AND NOT public.is_blocked_pair(auth.uid(),user_id)
    AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id)));

CREATE POLICY feed_reposts_access ON public.post_reposts AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.feed_user_restricted(auth.uid()) AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id));

-- A private ledger prevents delete-and-repost and serializes concurrent submissions.
CREATE TABLE public.feed_submission_log (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX feed_submission_user_time ON public.feed_submission_log(user_id, submitted_at DESC);
ALTER TABLE public.feed_submission_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.feed_submission_log FROM anon, authenticated;

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
CREATE TRIGGER guard_feed_post BEFORE INSERT OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.guard_feed_submission();
CREATE TRIGGER guard_feed_comment BEFORE INSERT OR UPDATE ON public.post_comments FOR EACH ROW EXECUTE FUNCTION public.guard_feed_submission();
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
    WHERE
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
