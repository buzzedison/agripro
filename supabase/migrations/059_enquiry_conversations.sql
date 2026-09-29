-- Apply after 058. Backfills opening messages only; sends no historical alerts.
BEGIN;
CREATE TABLE public.feed_enquiry_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid NOT NULL REFERENCES public.feed_enquiries(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 2000),
  client_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz,
  UNIQUE(sender_id,client_id)
);
CREATE INDEX enquiry_message_history ON public.feed_enquiry_messages(enquiry_id,created_at DESC,id DESC);
CREATE INDEX enquiry_message_sender_time ON public.feed_enquiry_messages(sender_id,created_at DESC);
ALTER TABLE public.feed_enquiry_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.feed_enquiry_messages FROM anon,authenticated;
GRANT SELECT ON public.feed_enquiry_messages TO authenticated;
-- Membership does not depend on public post visibility: participants retain history to report abuse.
CREATE FUNCTION public.is_enquiry_participant(p_enquiry uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT auth.uid() IS NOT NULL AND EXISTS(SELECT 1 FROM public.feed_enquiries e JOIN public.posts p ON p.id=e.post_id WHERE e.id=p_enquiry AND auth.uid() IN(e.user_id,p.user_id));
$$;
REVOKE ALL ON FUNCTION public.is_enquiry_participant(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_enquiry_participant(uuid) TO authenticated;
CREATE POLICY enquiry_message_participants ON public.feed_enquiry_messages FOR SELECT TO authenticated USING(public.is_enquiry_participant(enquiry_id));
INSERT INTO public.feed_enquiry_messages(id,enquiry_id,sender_id,body,client_id,created_at)
 SELECT id,id,user_id,message,id,created_at FROM public.feed_enquiries;
CREATE FUNCTION public.start_enquiry_conversation() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 INSERT INTO public.feed_enquiry_messages(id,enquiry_id,sender_id,body,client_id,created_at) VALUES(NEW.id,NEW.id,NEW.user_id,NEW.message,NEW.id,NEW.created_at);
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.start_enquiry_conversation() FROM PUBLIC;
CREATE TRIGGER start_enquiry_conversation AFTER INSERT ON public.feed_enquiries FOR EACH ROW EXECUTE FUNCTION public.start_enquiry_conversation();

ALTER TABLE public.feed_preferences ADD COLUMN notify_enquiry_replies boolean NOT NULL DEFAULT true;
CREATE FUNCTION public.save_feed_preferences_v2(p_crops text[],p_topics text[],p_countries text[],p_enquiries boolean,p_updates boolean,p_answers boolean,p_replies boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF p_replies IS NULL THEN RAISE EXCEPTION 'Choose a reply alert preference.'; END IF;
 PERFORM public.save_feed_preferences(p_crops,p_topics,p_countries,p_enquiries,p_updates,p_answers);
 UPDATE public.feed_preferences SET notify_enquiry_replies=p_replies WHERE user_id=auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.save_feed_preferences_v2(text[],text[],text[],boolean,boolean,boolean,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_feed_preferences_v2(text[],text[],text[],boolean,boolean,boolean,boolean) TO authenticated;
ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK(type IN ('mention','like','comment','repost','follow','connection_request','connection_accepted','enquiry','enquiry_update','answer_accepted','enquiry_reply'));
-- One outstanding reply alert per recipient/thread, refreshed instead of piling up.
CREATE UNIQUE INDEX enquiry_reply_notification ON public.notifications(user_id,enquiry_id) WHERE type='enquiry_reply';
CREATE POLICY enquiry_reply_server_only ON public.notifications AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(type<>'enquiry_reply');
CREATE POLICY enquiry_reply_visibility ON public.notifications AS RESTRICTIVE FOR SELECT TO authenticated USING(type<>'enquiry_reply' OR (
 public.is_enquiry_participant(enquiry_id) AND NOT public.feed_user_restricted(actor_id) AND NOT public.is_blocked_pair(auth.uid(),actor_id)
 AND NOT EXISTS(SELECT 1 FROM public.user_mutes m WHERE m.muter_id=auth.uid() AND m.muted_id=actor_id)
));

CREATE FUNCTION public.enquiry_conversation(p_enquiry uuid)
RETURNS TABLE(id uuid,post_id uuid,title text,other_user_id uuid,other_name text,can_reply boolean,reply_notice text,blocked_by_me boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE e public.feed_enquiries; p public.posts; other_id uuid; notice text;
BEGIN
 IF NOT public.is_enquiry_participant(p_enquiry) THEN RAISE EXCEPTION 'This conversation is unavailable.'; END IF;
 SELECT * INTO e FROM public.feed_enquiries WHERE feed_enquiries.id=p_enquiry;
 SELECT * INTO p FROM public.posts WHERE posts.id=e.post_id;
 other_id:=CASE WHEN e.user_id=auth.uid() THEN p.user_id ELSE e.user_id END;
 notice:=CASE WHEN public.is_blocked_pair(auth.uid(),other_id) THEN 'Replies are unavailable because an account block is in place.'
 WHEN public.feed_user_restricted(auth.uid()) OR public.feed_user_restricted(other_id) THEN 'Replies are unavailable while an account is restricted.'
 WHEN p.moderation_status<>'published' THEN 'Replies are paused while this post is unavailable.'
 WHEN e.status='closed' THEN 'This enquiry is closed. The post author can reopen it from My enquiries.' ELSE NULL END;
 RETURN QUERY SELECT e.id,e.post_id,coalesce(p.post_details->>'title','Enquiry'),other_id,coalesce(pr.full_name,'Member'),notice IS NULL,notice,
 EXISTS(SELECT 1 FROM public.user_blocks b WHERE b.blocker_id=auth.uid() AND b.blocked_id=other_id)
 FROM public.profiles pr WHERE pr.id=other_id;
END;
$$;
REVOKE ALL ON FUNCTION public.enquiry_conversation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enquiry_conversation(uuid) TO authenticated;
CREATE FUNCTION public.send_enquiry_reply(p_enquiry uuid,p_body text,p_client_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e public.feed_enquiries; p public.posts; recipient uuid; message_id uuid; previous public.feed_enquiry_messages; enabled boolean;
BEGIN
 IF NOT public.is_enquiry_participant(p_enquiry) THEN RAISE EXCEPTION 'This conversation is unavailable.'; END IF;
 -- Serialize each sender, including concurrent requests to different threads.
 PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
 IF p_client_id IS NULL OR p_body IS NULL OR p_body !~ '[^[:space:]]' OR length(trim(p_body)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Write a reply of 1–2,000 characters.'; END IF;
 SELECT * INTO previous FROM public.feed_enquiry_messages WHERE sender_id=auth.uid() AND client_id=p_client_id;
 IF FOUND THEN
   IF previous.enquiry_id<>p_enquiry OR previous.body<>trim(p_body) THEN RAISE EXCEPTION 'This send request was already used. Refresh the conversation.'; END IF;
   RETURN previous.id;
 END IF;
 SELECT * INTO e FROM public.feed_enquiries WHERE id=p_enquiry FOR SHARE;
 SELECT * INTO p FROM public.posts WHERE id=e.post_id FOR SHARE;
 recipient:=CASE WHEN auth.uid()=e.user_id THEN p.user_id ELSE e.user_id END;
 IF public.feed_user_restricted(auth.uid()) OR public.feed_user_restricted(recipient) OR public.is_blocked_pair(auth.uid(),recipient) THEN RAISE EXCEPTION 'Replies are unavailable for this conversation.'; END IF;
 IF p.moderation_status<>'published' OR e.status='closed' THEN RAISE EXCEPTION 'This conversation is closed or paused.'; END IF;
 IF EXISTS(SELECT 1 FROM public.feed_enquiry_messages WHERE sender_id=auth.uid() AND created_at>now()-interval '5 seconds') THEN RAISE EXCEPTION 'Please wait 5 seconds between replies.'; END IF;
 IF (SELECT count(*) FROM public.feed_enquiry_messages WHERE sender_id=auth.uid() AND created_at>now()-interval '1 hour')>=60 THEN RAISE EXCEPTION 'Reply limit reached. Please try again later.'; END IF;
 IF EXISTS(SELECT 1 FROM public.feed_enquiry_messages WHERE sender_id=auth.uid() AND enquiry_id=p_enquiry AND lower(regexp_replace(trim(body),'[[:space:]]+',' ','g'))=lower(regexp_replace(trim(p_body),'[[:space:]]+',' ','g')) AND created_at>now()-interval '10 minutes') THEN RAISE EXCEPTION 'You already sent this reply. Give the other member time to respond.'; END IF;
 IF (SELECT count(*) FROM regexp_matches(p_body,'(https?://|www\.)','gi'))>3 THEN RAISE EXCEPTION 'Use no more than 3 links per reply.'; END IF;
 INSERT INTO public.feed_enquiry_messages(enquiry_id,sender_id,body,client_id) VALUES(p_enquiry,auth.uid(),trim(p_body),p_client_id) RETURNING id INTO message_id;
 SELECT notify_enquiry_replies INTO enabled FROM public.feed_preferences WHERE user_id=recipient;
 IF coalesce(enabled,true) AND NOT EXISTS(SELECT 1 FROM public.user_mutes WHERE muter_id=recipient AND muted_id=auth.uid()) THEN
  INSERT INTO public.notifications(user_id,actor_id,type,post_id,enquiry_id,message)
   VALUES(recipient,auth.uid(),'enquiry_reply',e.post_id,e.id,'New reply in your private enquiry')
  ON CONFLICT(user_id,enquiry_id) WHERE type='enquiry_reply' DO UPDATE SET read=false,created_at=now(),actor_id=excluded.actor_id;
 END IF;
 RETURN message_id;
END;
$$;
REVOKE ALL ON FUNCTION public.send_enquiry_reply(uuid,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_enquiry_reply(uuid,text,uuid) TO authenticated;

-- Moderators see only messages deliberately submitted in a report, never the whole private thread.
ALTER TABLE public.content_reports DROP CONSTRAINT content_reports_target_type_check;
ALTER TABLE public.content_reports ADD CONSTRAINT content_reports_target_type_check CHECK(target_type IN('post','comment','user','enquiry_message'));
CREATE TABLE public.feed_enquiry_report_evidence (
 report_id uuid PRIMARY KEY REFERENCES public.content_reports(id) ON DELETE CASCADE,
 message_id uuid NOT NULL, sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 body text NOT NULL, sent_at timestamptz NOT NULL
);
ALTER TABLE public.feed_enquiry_report_evidence ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.feed_enquiry_report_evidence FROM anon,authenticated;
GRANT SELECT ON public.feed_enquiry_report_evidence TO authenticated;
CREATE POLICY enquiry_report_evidence_admin ON public.feed_enquiry_report_evidence FOR SELECT TO authenticated USING(public.is_admin_user());
CREATE FUNCTION public.capture_enquiry_report() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m public.feed_enquiry_messages;
BEGIN
 IF NEW.target_type<>'enquiry_message' THEN RETURN NEW; END IF;
 SELECT * INTO m FROM public.feed_enquiry_messages WHERE id=NEW.target_id;
 IF NOT FOUND OR NOT public.is_enquiry_participant(m.enquiry_id) OR m.sender_id=auth.uid() OR m.removed_at IS NOT NULL THEN RAISE EXCEPTION 'Only received messages in your conversations can be reported.'; END IF;
 INSERT INTO public.feed_enquiry_report_evidence(report_id,message_id,sender_id,body,sent_at) VALUES(NEW.id,m.id,m.sender_id,m.body,m.created_at);
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.capture_enquiry_report() FROM PUBLIC;
CREATE TRIGGER capture_enquiry_report AFTER INSERT ON public.content_reports FOR EACH ROW EXECUTE FUNCTION public.capture_enquiry_report();
CREATE POLICY reported_enquiry_message_admin ON public.feed_enquiry_messages FOR SELECT TO authenticated USING(public.is_admin_user() AND EXISTS(SELECT 1 FROM public.feed_enquiry_report_evidence e WHERE e.message_id=id));
CREATE FUNCTION public.remove_reported_enquiry_message(p_report uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE message_id uuid;
BEGIN
 IF NOT public.is_admin_user() THEN RAISE EXCEPTION 'Moderator access required.'; END IF;
 SELECT e.message_id INTO message_id FROM public.feed_enquiry_report_evidence e WHERE report_id=p_report;
 IF NOT FOUND THEN RAISE EXCEPTION 'Reported message unavailable.'; END IF;
 UPDATE public.feed_enquiry_messages SET body='Message removed by a moderator.',removed_at=coalesce(removed_at,now()) WHERE id=message_id;
 -- The opening enquiry is also stored on the legacy dashboard.
 UPDATE public.feed_enquiries SET message='Message removed by a moderator.' WHERE id=message_id;
 UPDATE public.content_reports SET status='actioned',reviewed_by=auth.uid(),reviewed_at=now(),admin_notes='Reported message removed by moderator.' WHERE target_type='enquiry_message' AND target_id=message_id;
END;
$$;
REVOKE ALL ON FUNCTION public.remove_reported_enquiry_message(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_reported_enquiry_message(uuid) TO authenticated;
CREATE FUNCTION public.read_enquiry_messages(p_enquiry uuid,p_before timestamptz DEFAULT NULL,p_before_id uuid DEFAULT NULL)
RETURNS SETOF public.feed_enquiry_messages LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
 SELECT * FROM public.feed_enquiry_messages WHERE enquiry_id=p_enquiry
 AND (p_before IS NULL OR (created_at,id)<(p_before,p_before_id))
 ORDER BY created_at DESC,id DESC LIMIT 50;
$$;
REVOKE ALL ON FUNCTION public.read_enquiry_messages(uuid,timestamptz,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_enquiry_messages(uuid,timestamptz,uuid) TO authenticated;
COMMIT;
