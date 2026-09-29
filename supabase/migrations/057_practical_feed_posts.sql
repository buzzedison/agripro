-- Run after 056. Transactional, with no content backfill or rate-limit reset.
BEGIN;
ALTER TABLE public.posts ADD COLUMN post_kind text NOT NULL DEFAULT 'update' CHECK (post_kind IN ('update','question','listing','opportunity'));
ALTER TABLE public.posts ADD COLUMN post_details jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.posts ADD COLUMN is_closed boolean NOT NULL DEFAULT false;
ALTER TABLE public.posts ADD COLUMN expires_at timestamptz;
CREATE INDEX posts_kind_date ON public.posts(post_kind,created_at DESC) WHERE moderation_status='published';

CREATE OR REPLACE FUNCTION public.validate_practical_post()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d jsonb; k text; v_date date; v_changed boolean;
BEGIN
  d := NEW.post_details;
  IF d IS NULL OR jsonb_typeof(d)<>'object' OR octet_length(d::text)>12000 THEN RAISE EXCEPTION 'Post details must be an object under 12,000 bytes.'; END IF;
  IF TG_OP='UPDATE' THEN
    IF NEW.post_kind IS DISTINCT FROM OLD.post_kind THEN RAISE EXCEPTION 'A published post type cannot be changed. Create a new post instead.'; END IF;
    v_changed := NEW.post_details IS DISTINCT FROM OLD.post_details;
  ELSE v_changed := true;
  END IF;
  IF NEW.post_kind='update' THEN
    IF d<>'{}'::jsonb THEN RAISE EXCEPTION 'Updates cannot contain listing details.'; END IF;
    NEW.expires_at:=NULL; RETURN NEW;
  END IF;
  IF NEW.is_poll OR NEW.quoted_post_id IS NOT NULL THEN RAISE EXCEPTION 'Questions, listings and opportunities cannot also be polls or quote posts.'; END IF;
  -- Reject unknown keys and non-string values so links cannot hide in unused fields.
  FOR k IN SELECT jsonb_object_keys(d) LOOP
    IF k NOT IN ('title','crop','location','listing_type','commodity','quantity','unit','price','currency','available_from','deadline','opportunity_type','eligibility','url') OR jsonb_typeof(d->k)<>'string' THEN
      RAISE EXCEPTION 'Invalid post detail: %',k;
    END IF;
    IF length(d->>k)>1000 THEN RAISE EXCEPTION 'Keep individual post fields under 1,000 characters.'; END IF;
  END LOOP;
  IF coalesce(length(trim(d->>'title')),0) NOT BETWEEN 5 AND 160 THEN RAISE EXCEPTION 'Enter a title between 5 and 160 characters.'; END IF;
  IF coalesce(length(trim(d->>'location')),0) NOT BETWEEN 2 AND 120 THEN RAISE EXCEPTION 'Enter a location between 2 and 120 characters.'; END IF;
  IF coalesce(length(trim(NEW.country)),0) NOT BETWEEN 2 AND 80 THEN RAISE EXCEPTION 'Choose a country for this post.'; END IF;
  IF NEW.post_kind='question' THEN
    IF coalesce(length(trim(d->>'crop')),0) NOT BETWEEN 2 AND 80 THEN RAISE EXCEPTION 'Enter a crop or area of expertise.'; END IF;
    NEW.topic := 'questions'; NEW.expires_at:=NULL;
  ELSIF NEW.post_kind='listing' THEN
    IF coalesce(d->>'listing_type','') NOT IN ('buy','sell') THEN RAISE EXCEPTION 'Choose whether you are buying or selling.'; END IF;
    IF coalesce(length(trim(d->>'commodity')),0) NOT BETWEEN 2 AND 80 THEN RAISE EXCEPTION 'Enter a commodity.'; END IF;
    IF coalesce(d->>'quantity','') !~ '^[0-9]+(\.[0-9]+)?$' THEN RAISE EXCEPTION 'Enter a positive quantity.'; END IF;
    IF (d->>'quantity')::numeric<=0 OR (d->>'quantity')::numeric>1000000000 THEN RAISE EXCEPTION 'Enter a quantity between 0 and 1 billion.'; END IF;
    IF coalesce(d->>'unit','') NOT IN ('kg','tonnes','bags','crates','litres','units','hectares') THEN RAISE EXCEPTION 'Choose a quantity unit.'; END IF;
    IF coalesce(d->>'currency','') !~ '^[A-Z]{3}$' THEN RAISE EXCEPTION 'Enter a three-letter currency code.'; END IF;
    IF coalesce(d->>'price','')<>'' THEN
      IF (d->>'price') !~ '^[0-9]+(\.[0-9]{1,2})?$' THEN RAISE EXCEPTION 'Enter a valid price per unit.'; END IF;
      IF (d->>'price')::numeric<=0 OR (d->>'price')::numeric>1000000000 THEN RAISE EXCEPTION 'Price must be greater than zero and no more than 1 billion.'; END IF;
    END IF;
    IF coalesce(d->>'available_from','') !~ '^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'Choose an availability date.'; END IF;
    PERFORM (d->>'available_from')::date;
    NEW.topic:='markets';
  ELSIF NEW.post_kind='opportunity' THEN
    IF coalesce(d->>'opportunity_type','') NOT IN ('grant','job','training','tender','funding','event') THEN RAISE EXCEPTION 'Choose an opportunity category.'; END IF;
    IF coalesce(length(trim(d->>'eligibility')),0) NOT BETWEEN 10 AND 1000 THEN RAISE EXCEPTION 'Explain who can apply in 10–1,000 characters.'; END IF;
    IF coalesce(d->>'url','') !~* '^https?://[^[:space:]]+$' THEN RAISE EXCEPTION 'Enter a complete http or https application link.'; END IF;
    NEW.topic:='opportunities';
  END IF;
  IF NEW.post_kind IN ('listing','opportunity') THEN
    IF coalesce(d->>'deadline','') !~ '^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'Choose a closing date.'; END IF;
    v_date := (d->>'deadline')::date;
    NEW.expires_at := (v_date+1)::timestamp AT TIME ZONE 'UTC';
    IF v_changed AND NEW.expires_at<=now() THEN RAISE EXCEPTION 'Choose a closing date that has not passed.'; END IF;
    IF NEW.post_kind='listing' AND (d->>'available_from')::date>v_date THEN RAISE EXCEPTION 'Availability must start before the listing closes.'; END IF;
  END IF;
  IF TG_OP='UPDATE' AND v_changed THEN NEW.updated_at:=clock_timestamp(); END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER a_validate_practical_post BEFORE INSERT OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.validate_practical_post();

CREATE TABLE public.feed_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL CHECK (length(trim(message)) BETWEEN 20 AND 1000),
  status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','closed')),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(post_id,user_id)
);
CREATE INDEX feed_enquiry_user_time ON public.feed_enquiries(user_id,created_at DESC);
ALTER TABLE public.feed_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY enquiry_participants ON public.feed_enquiries FOR SELECT TO authenticated USING
  (user_id=auth.uid() OR EXISTS(SELECT 1 FROM public.posts p WHERE p.id=post_id AND p.user_id=auth.uid()));
GRANT SELECT ON public.feed_enquiries TO authenticated;
CREATE OR REPLACE FUNCTION public.send_feed_enquiry(p_post uuid,p_message text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.posts;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to send an enquiry.'; END IF;
  PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
  IF public.feed_user_restricted(auth.uid()) THEN RAISE EXCEPTION 'Your feed access is restricted.'; END IF;
  SELECT * INTO p FROM public.posts WHERE id=p_post FOR SHARE;
  IF NOT FOUND OR p.post_kind NOT IN ('listing','opportunity') OR p.moderation_status<>'published' OR p.is_closed OR p.expires_at<=now() OR public.feed_user_restricted(p.user_id) OR public.is_blocked_pair(auth.uid(),p.user_id) THEN RAISE EXCEPTION 'This post is not accepting enquiries.'; END IF;
  IF p.user_id=auth.uid() THEN RAISE EXCEPTION 'You cannot enquire about your own post.'; END IF;
  IF p_message IS NULL OR length(trim(p_message)) NOT BETWEEN 20 AND 1000 THEN RAISE EXCEPTION 'Describe your enquiry in 20–1,000 characters.'; END IF;
  IF (SELECT count(*) FROM public.feed_enquiries WHERE user_id=auth.uid() AND created_at>now()-interval '1 hour')>=10 THEN RAISE EXCEPTION 'You can send up to 10 enquiries per hour.'; END IF;
  INSERT INTO public.feed_enquiries(post_id,user_id,message) VALUES(p_post,auth.uid(),trim(p_message));
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'You already sent an enquiry for this post. Track it in My enquiries.';
END;
$$;
CREATE OR REPLACE FUNCTION public.update_feed_enquiry(p_enquiry uuid,p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.feed_user_restricted(auth.uid()) THEN RAISE EXCEPTION 'Active feed access is required.'; END IF;
  IF p_status IS NULL OR p_status NOT IN ('new','contacted','closed') THEN RAISE EXCEPTION 'Choose a valid enquiry status.'; END IF;
  UPDATE public.feed_enquiries e SET status=p_status FROM public.posts p
    WHERE e.id=p_enquiry AND e.post_id=p.id AND p.user_id=auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Only the post author can update this enquiry.'; END IF;
END;
$$;
CREATE OR REPLACE FUNCTION public.close_feed_post(p_post uuid,p_closed boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.feed_user_restricted(auth.uid()) THEN RAISE EXCEPTION 'Active feed access is required.'; END IF;
  IF p_closed IS NULL THEN RAISE EXCEPTION 'Choose an open or closed state.'; END IF;
  UPDATE public.posts SET is_closed=p_closed WHERE id=p_post AND user_id=auth.uid() AND post_kind IN ('listing','opportunity') AND (p_closed OR expires_at>now());
  IF NOT FOUND THEN RAISE EXCEPTION 'Only the author can close this post. Expired posts cannot reopen.'; END IF;
END;
$$;

CREATE TABLE public.feed_accepted_answers (
  post_id uuid PRIMARY KEY REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id uuid NOT NULL UNIQUE REFERENCES public.post_comments(id) ON DELETE CASCADE,
  accepted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.feed_accepted_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY accepted_answers_read ON public.feed_accepted_answers FOR SELECT USING
  (EXISTS(SELECT 1 FROM public.posts p WHERE p.id=post_id) AND EXISTS(SELECT 1 FROM public.post_comments c WHERE c.id=comment_id));
GRANT SELECT ON public.feed_accepted_answers TO anon,authenticated;
-- An endorsement applies to the answer/question that was actually reviewed.
CREATE OR REPLACE FUNCTION public.clear_changed_accepted_answer()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF ROW(NEW.content,to_jsonb(NEW)->'image_url',to_jsonb(NEW)->'gif_url',to_jsonb(NEW)->'post_details')
     IS DISTINCT FROM ROW(OLD.content,to_jsonb(OLD)->'image_url',to_jsonb(OLD)->'gif_url',to_jsonb(OLD)->'post_details') THEN
    IF TG_TABLE_NAME='posts' THEN DELETE FROM public.feed_accepted_answers WHERE post_id=NEW.id;
    ELSE DELETE FROM public.feed_accepted_answers WHERE comment_id=NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER clear_edited_question_answer AFTER UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.clear_changed_accepted_answer();
CREATE TRIGGER clear_edited_accepted_answer AFTER UPDATE ON public.post_comments FOR EACH ROW EXECUTE FUNCTION public.clear_changed_accepted_answer();
CREATE OR REPLACE FUNCTION public.accept_feed_answer(p_post uuid,p_comment uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.posts; c public.post_comments;
BEGIN
  IF auth.uid() IS NULL OR public.feed_user_restricted(auth.uid()) THEN RAISE EXCEPTION 'Active feed access is required.'; END IF;
  SELECT * INTO p FROM public.posts WHERE id=p_post FOR UPDATE;
  IF NOT FOUND OR p.user_id<>auth.uid() OR p.post_kind<>'question' OR p.moderation_status<>'published' THEN RAISE EXCEPTION 'Only the author of a published question can select an answer.'; END IF;
  IF p_comment IS NULL THEN DELETE FROM public.feed_accepted_answers WHERE post_id=p_post; RETURN; END IF;
  SELECT * INTO c FROM public.post_comments WHERE id=p_comment FOR SHARE;
  IF NOT FOUND OR c.post_id<>p_post OR coalesce(to_jsonb(c)->>'parent_comment_id','')<>'' OR public.feed_user_restricted(c.user_id) OR public.is_blocked_pair(auth.uid(),c.user_id) THEN RAISE EXCEPTION 'Choose a visible top-level answer to this question.'; END IF;
  INSERT INTO public.feed_accepted_answers(post_id,comment_id) VALUES(p_post,p_comment)
    ON CONFLICT(post_id) DO UPDATE SET comment_id=excluded.comment_id,accepted_at=now();
END;
$$;
REVOKE ALL ON FUNCTION public.send_feed_enquiry(uuid,text),public.update_feed_enquiry(uuid,text),public.close_feed_post(uuid,boolean),public.accept_feed_answer(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_feed_enquiry(uuid,text),public.update_feed_enquiry(uuid,text),public.close_feed_post(uuid,boolean),public.accept_feed_answer(uuid,uuid) TO authenticated;

-- Structured-field edits are submissions; metadata-only changes still bypass the guard.
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
    v_changed := ROW(NEW.content,NEW.image_url,NEW.gif_url,NEW.post_details) IS DISTINCT FROM ROW(OLD.content,OLD.image_url,OLD.gif_url,OLD.post_details);
    IF v_changed THEN NEW.updated_at := clock_timestamp(); END IF;
    IF NOT v_changed THEN RETURN NEW; END IF;
    IF OLD.moderation_status IN ('pending','rejected') AND NOT public.is_admin_user() THEN
      NEW.moderation_status := 'pending'; NEW.moderation_feedback := NULL; RETURN NEW;
    END IF;
  END IF;
  IF NOT public.is_admin_user() THEN
    PERFORM 1 FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
    SELECT count(*) INTO v_count FROM (SELECT 1 FROM public.posts WHERE user_id = NEW.user_id AND id <> NEW.id AND moderation_status = 'published' LIMIT 3) p;
    IF v_count < 3 AND (coalesce(NEW.content,'') || ' ' || NEW.post_details::text) ~* '(https?://|www\.|whatsapp|telegram|guaranteed[[:space:]]+(returns|profit)|dm[[:space:]]+me)' THEN
      NEW.moderation_status := 'pending';
      NEW.moderation_feedback := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
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
    VALUES(p_post,v_post.user_id,auth.uid(),p_decision,trim(p_feedback),v_post.content || E'\n' || v_post.post_details::text);
  UPDATE public.posts SET moderation_status = p_decision, moderation_feedback = trim(p_feedback) WHERE id = p_post;
END;
$$;
CREATE OR REPLACE FUNCTION public.discover_feed_v2(p_limit integer DEFAULT 20,p_offset integer DEFAULT 0,p_topic text DEFAULT NULL,p_country text DEFAULT NULL,p_following boolean DEFAULT false,p_hashtag text DEFAULT NULL,p_kind text DEFAULT NULL,p_include_closed boolean DEFAULT false)
RETURNS SETOF public.posts LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT p.* FROM public.posts p WHERE p.moderation_status='published'
    AND (p_kind IS NULL OR p.post_kind=p_kind)
    AND (p_include_closed OR (NOT p.is_closed AND (p.expires_at IS NULL OR p.expires_at>now())))
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
CREATE OR REPLACE FUNCTION public.discover_feed(p_limit integer DEFAULT 20,p_offset integer DEFAULT 0,p_topic text DEFAULT NULL,p_country text DEFAULT NULL,p_following boolean DEFAULT false,p_hashtag text DEFAULT NULL)
RETURNS SETOF public.posts LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT * FROM public.discover_feed_v2(p_limit,p_offset,p_topic,p_country,p_following,p_hashtag,NULL,false);
$$;
REVOKE ALL ON FUNCTION public.discover_feed_v2(integer,integer,text,text,boolean,text,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.discover_feed_v2(integer,integer,text,text,boolean,text,text,boolean) TO authenticated;
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
        SELECT id,user_id,auth.uid(),'appeal_accepted',trim(p_response),content || E'\n' || post_details::text FROM public.posts WHERE id=v_appeal.post_id;
    END IF;
  END IF;
  UPDATE public.feed_appeals SET status=CASE WHEN p_accept THEN 'accepted' ELSE 'rejected' END,response=trim(p_response),reviewed_at=now(),reviewed_by=auth.uid() WHERE id=p_appeal;
END;
$$;
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
    WHERE p.moderation_status = 'published' AND NOT p.is_closed AND (p.expires_at IS NULL OR p.expires_at>now()) AND
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


CREATE OR REPLACE FUNCTION public.search_practical_feed(p_query text)
RETURNS SETOF public.posts LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT p.* FROM public.posts p WHERE p.moderation_status='published' AND NOT p.is_closed
    AND (p.expires_at IS NULL OR p.expires_at>now()) AND NOT public.feed_user_restricted(p.user_id)
    AND length(trim(p_query)) BETWEEN 2 AND 100
    AND position(lower(trim(p_query)) IN lower(p.content || ' ' || p.post_details::text))>0
    AND NOT public.is_blocked_pair(auth.uid(),p.user_id)
    AND NOT EXISTS(SELECT 1 FROM public.user_mutes m WHERE m.muter_id=auth.uid() AND m.muted_id=p.user_id)
  ORDER BY p.created_at DESC LIMIT 5;
$$;
REVOKE ALL ON FUNCTION public.search_practical_feed(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_practical_feed(text) TO authenticated;
COMMIT;

