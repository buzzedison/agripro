-- Run after 057. No post backfill and no replay of past notifications.
BEGIN;
CREATE TABLE public.feed_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  crops text[] NOT NULL DEFAULT '{}', topics text[] NOT NULL DEFAULT '{}', countries text[] NOT NULL DEFAULT '{}',
  notify_enquiries boolean NOT NULL DEFAULT true,
  notify_enquiry_updates boolean NOT NULL DEFAULT true,
  notify_accepted_answers boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.feed_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY preferences_read ON public.feed_preferences FOR SELECT TO authenticated USING(user_id=auth.uid());
GRANT SELECT ON public.feed_preferences TO authenticated;
CREATE FUNCTION public.save_feed_preferences(p_crops text[],p_topics text[],p_countries text[],p_enquiries boolean,p_updates boolean,p_answers boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to save your interests.'; END IF;
  IF p_crops IS NULL OR p_topics IS NULL OR p_countries IS NULL OR p_enquiries IS NULL OR p_updates IS NULL OR p_answers IS NULL
    OR cardinality(p_crops)>20 OR cardinality(p_topics)>6 OR cardinality(p_countries)>10
    OR EXISTS(SELECT 1 FROM unnest(p_crops||p_topics||p_countries) x WHERE x IS NULL OR length(trim(x)) NOT BETWEEN 2 AND 80)
    OR NOT p_topics <@ ARRAY['general','farming','markets','opportunities','questions','research']::text[]
    THEN RAISE EXCEPTION 'Choose up to 20 crops, 6 topics and 10 countries; each name must be 2–80 characters.'; END IF;
  INSERT INTO public.feed_preferences(user_id,crops,topics,countries,notify_enquiries,notify_enquiry_updates,notify_accepted_answers)
    VALUES(auth.uid(),ARRAY(SELECT DISTINCT lower(trim(x)) FROM unnest(p_crops) x),ARRAY(SELECT DISTINCT x FROM unnest(p_topics) x),ARRAY(SELECT DISTINCT lower(trim(x)) FROM unnest(p_countries) x),p_enquiries,p_updates,p_answers)
  ON CONFLICT(user_id) DO UPDATE SET crops=excluded.crops,topics=excluded.topics,countries=excluded.countries,
    notify_enquiries=excluded.notify_enquiries,notify_enquiry_updates=excluded.notify_enquiry_updates,notify_accepted_answers=excluded.notify_accepted_answers,updated_at=now();
END;
$$;
REVOKE ALL ON FUNCTION public.save_feed_preferences(text[],text[],text[],boolean,boolean,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_feed_preferences(text[],text[],text[],boolean,boolean,boolean) TO authenticated;
CREATE OR REPLACE FUNCTION public.discover_feed_v3(p_limit integer DEFAULT 20,p_offset integer DEFAULT 0,p_topic text DEFAULT NULL,p_country text DEFAULT NULL,p_following boolean DEFAULT false,p_hashtag text DEFAULT NULL,p_kind text DEFAULT NULL,p_include_closed boolean DEFAULT false,p_interests_only boolean DEFAULT false)
RETURNS SETOF public.posts LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT p.* FROM public.posts p LEFT JOIN public.feed_preferences f ON f.user_id=auth.uid()
  CROSS JOIN LATERAL (SELECT
    CASE WHEN lower(trim(coalesce(p.post_details->>'crop',p.post_details->>'commodity',''))) = ANY(coalesce(f.crops,'{}')) THEN 3 ELSE 0 END +
    CASE WHEN p.topic = ANY(coalesce(f.topics,'{}')) THEN 2 ELSE 0 END +
    CASE WHEN lower(trim(p.country)) = ANY(coalesce(f.countries,'{}')) THEN 1 ELSE 0 END AS score) interest
  WHERE (NOT p_interests_only OR interest.score>0) AND p.moderation_status='published'
    AND (p_kind IS NULL OR p.post_kind=p_kind)
    AND (p_include_closed OR (NOT p.is_closed AND (p.expires_at IS NULL OR p.expires_at>now())))
    AND NOT public.feed_user_restricted(p.user_id)
    AND (p_topic IS NULL OR p.topic=p_topic)
    AND (p_country IS NULL OR lower(p.country)=lower(p_country))
    AND (p_hashtag IS NULL OR p.content ~* ('(^|[^[:alnum:]_])#' || regexp_replace(p_hashtag,'[^[:alnum:]_]','','g') || '([^[:alnum:]_]|$)'))
    AND (NOT p_following OR p.user_id=auth.uid() OR EXISTS (SELECT 1 FROM public.connections c WHERE c.follower_id=auth.uid() AND c.following_id=p.user_id))
    AND NOT public.is_blocked_pair(auth.uid(),p.user_id)
    AND NOT EXISTS (SELECT 1 FROM public.user_mutes m WHERE m.muter_id=auth.uid() AND m.muted_id=p.user_id)
  ORDER BY (CASE WHEN NOT p_following AND p.created_at>now()-interval '14 days' THEN interest.score ELSE 0 END) DESC, (CASE WHEN NOT p_following AND p.created_at > now()-interval '24 hours' AND EXISTS
    (SELECT 1 FROM public.user_connections c WHERE c.status='accepted' AND ((c.requester_id=auth.uid() AND c.receiver_id=p.user_id) OR (c.receiver_id=auth.uid() AND c.requester_id=p.user_id))) THEN 1 ELSE 0 END) DESC,
    p.created_at DESC,p.id DESC LIMIT least(greatest(p_limit,1),50) OFFSET greatest(p_offset,0);
$$;

REVOKE ALL ON FUNCTION public.discover_feed_v3(integer,integer,text,text,boolean,text,text,boolean,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.discover_feed_v3(integer,integer,text,text,boolean,text,text,boolean,boolean) TO authenticated;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK(type IN ('mention','like','comment','repost','follow','connection_request','connection_accepted','enquiry','enquiry_update','answer_accepted'));
ALTER TABLE public.notifications ADD COLUMN enquiry_id uuid REFERENCES public.feed_enquiries(id) ON DELETE CASCADE;
-- Separate event ledger prevents repeated status/answer toggles spamming alerts, even after an alert is deleted.
CREATE TABLE public.feed_alert_events(event_key text PRIMARY KEY,post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE);
ALTER TABLE public.feed_alert_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.feed_alert_events FROM anon,authenticated;
CREATE POLICY feed_alerts_server_only ON public.notifications AS RESTRICTIVE FOR INSERT TO authenticated
 WITH CHECK(type NOT IN ('enquiry','enquiry_update','answer_accepted') AND enquiry_id IS NULL);
CREATE POLICY feed_alert_visibility ON public.notifications AS RESTRICTIVE FOR SELECT TO authenticated USING
(type NOT IN ('enquiry','enquiry_update','answer_accepted') OR (
  NOT public.feed_user_restricted(actor_id) AND NOT public.is_blocked_pair(auth.uid(),actor_id)
  AND NOT EXISTS(SELECT 1 FROM public.user_mutes m WHERE m.muter_id=auth.uid() AND m.muted_id=actor_id)
  AND EXISTS(SELECT 1 FROM public.posts p WHERE p.id=post_id AND p.moderation_status='published')
  AND (type<>'answer_accepted' OR EXISTS(SELECT 1 FROM public.feed_accepted_answers a WHERE a.post_id=notifications.post_id AND a.comment_id=notifications.comment_id))
));
CREATE FUNCTION public.notify_practical_feed_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE recipient uuid; actor uuid; owner_id uuid; kind text; body text; event text; enquiry uuid; answer uuid; enabled boolean; claimed text;
BEGIN
  SELECT user_id INTO owner_id FROM public.posts WHERE id=NEW.post_id AND moderation_status='published';
  IF owner_id IS NULL THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME='feed_enquiries' THEN
    enquiry:=NEW.id;
    IF TG_OP='INSERT' THEN
      recipient:=owner_id; actor:=NEW.user_id; kind:='enquiry'; body:='New enquiry about your post';
      SELECT notify_enquiries INTO enabled FROM public.feed_preferences WHERE user_id=recipient;
      event:='enquiry:'||NEW.id;
    ELSE
      IF NEW.status=OLD.status THEN RETURN NEW; END IF;
      recipient:=NEW.user_id; actor:=owner_id; kind:='enquiry_update'; body:='Your enquiry is now marked '||NEW.status;
      SELECT notify_enquiry_updates INTO enabled FROM public.feed_preferences WHERE user_id=recipient;
      event:='enquiry:'||NEW.id||':'||NEW.status;
    END IF;
  ELSE
    answer:=NEW.comment_id;
    SELECT user_id INTO recipient FROM public.post_comments WHERE id=answer;
    actor:=owner_id; kind:='answer_accepted'; body:='Your answer was marked helpful by the question author';
    SELECT notify_accepted_answers INTO enabled FROM public.feed_preferences WHERE user_id=recipient;
    event:='answer:'||NEW.post_id||':'||answer;
  END IF;
  IF recipient IS NULL OR recipient=actor OR enabled=false OR public.feed_user_restricted(recipient) OR public.feed_user_restricted(actor)
    OR public.is_blocked_pair(recipient,actor) OR EXISTS(SELECT 1 FROM public.user_mutes WHERE muter_id=recipient AND muted_id=actor) THEN RETURN NEW; END IF;
  INSERT INTO public.feed_alert_events(event_key,post_id) VALUES(event,NEW.post_id) ON CONFLICT DO NOTHING RETURNING event_key INTO claimed;
  IF claimed IS NOT NULL THEN
    INSERT INTO public.notifications(user_id,actor_id,type,post_id,comment_id,enquiry_id,message)
      VALUES(recipient,actor,kind,NEW.post_id,answer,enquiry,body);
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_practical_feed_event() FROM PUBLIC;
CREATE TRIGGER notify_feed_enquiry AFTER INSERT OR UPDATE OF status ON public.feed_enquiries FOR EACH ROW EXECUTE FUNCTION public.notify_practical_feed_event();
CREATE TRIGGER notify_feed_answer AFTER INSERT OR UPDATE OF comment_id ON public.feed_accepted_answers FOR EACH ROW EXECUTE FUNCTION public.notify_practical_feed_event();
COMMIT;
