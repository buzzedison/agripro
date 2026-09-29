-- Run after 060. Product quotes share the existing private conversation, reporting and alert protections.
BEGIN;
ALTER TABLE public.feed_enquiries ALTER COLUMN post_id DROP NOT NULL;
ALTER TABLE public.feed_enquiries ADD COLUMN product_id uuid REFERENCES public.trade_products(id) ON DELETE CASCADE,
 ADD COLUMN requested_quantity numeric, ADD COLUMN delivery_location text;
ALTER TABLE public.feed_enquiries ADD CONSTRAINT enquiry_one_subject CHECK(num_nonnulls(post_id,product_id)=1);
CREATE UNIQUE INDEX enquiry_product_buyer ON public.feed_enquiries(product_id,user_id) WHERE product_id IS NOT NULL;
CREATE FUNCTION public.enquiry_context(p_enquiry uuid)
RETURNS TABLE(id uuid,buyer_id uuid,owner_id uuid,post_id uuid,product_id uuid,title text,target_url text,available boolean,status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT e.id,e.user_id,coalesce(p.user_id,v.user_id),e.post_id,e.product_id,
 coalesce(t.name,p.post_details->>'title','Enquiry'),
 CASE WHEN e.product_id IS NULL THEN '/feed/post/'||p.id ELSE '/greenmarket/products/'||t.slug END,
 CASE WHEN e.product_id IS NULL THEN p.moderation_status='published' ELSE t.is_active AND v.status='approved' END,e.status
 FROM public.feed_enquiries e LEFT JOIN public.posts p ON p.id=e.post_id LEFT JOIN public.trade_products t ON t.id=e.product_id LEFT JOIN public.trade_vendors v ON v.id=t.vendor_id
 WHERE e.id=p_enquiry AND auth.uid() IS NOT NULL AND auth.uid() IN(e.user_id,coalesce(p.user_id,v.user_id));
$$;
REVOKE ALL ON FUNCTION public.enquiry_context(uuid) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.is_enquiry_participant(p_enquiry uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.enquiry_context(p_enquiry));
$$;
DROP POLICY enquiry_participants ON public.feed_enquiries;
CREATE POLICY enquiry_participants ON public.feed_enquiries FOR SELECT TO authenticated USING(public.is_enquiry_participant(id));
CREATE FUNCTION public.enquiry_conversation_v2(p_enquiry uuid)
RETURNS TABLE(id uuid,post_id uuid,title text,other_user_id uuid,other_name text,can_reply boolean,reply_notice text,blocked_by_me boolean,target_url text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE c record; other_id uuid; notice text;
BEGIN
 SELECT * INTO c FROM public.enquiry_context(p_enquiry);
 IF NOT FOUND THEN RAISE EXCEPTION 'This conversation is unavailable.'; END IF;
 other_id:=CASE WHEN c.buyer_id=auth.uid() THEN c.owner_id ELSE c.buyer_id END;
 notice:=CASE WHEN public.is_blocked_pair(auth.uid(),other_id) THEN 'Replies are unavailable because an account block is in place.'
 WHEN public.feed_user_restricted(auth.uid()) OR public.feed_user_restricted(other_id) THEN 'Replies are unavailable while an account is restricted.'
 WHEN NOT c.available THEN 'Replies are paused while this listing is unavailable.'
 WHEN c.status='closed' THEN 'This enquiry is closed. The seller can reopen it from My enquiries.' ELSE NULL END;
 RETURN QUERY SELECT c.id,c.post_id,c.title,other_id,coalesce(pr.full_name,'Member'),notice IS NULL,notice,
 EXISTS(SELECT 1 FROM public.user_blocks b WHERE b.blocker_id=auth.uid() AND b.blocked_id=other_id),c.target_url FROM public.profiles pr WHERE pr.id=other_id;
END;
$$;
REVOKE ALL ON FUNCTION public.enquiry_conversation_v2(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enquiry_conversation_v2(uuid) TO authenticated;
CREATE FUNCTION public.my_enquiry_conversations(p_id uuid DEFAULT NULL)
RETURNS TABLE(id uuid,post_id uuid,product_id uuid,user_id uuid,owner_id uuid,title text,target_url text,message text,status text,created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT e.id,e.post_id,e.product_id,e.user_id,c.owner_id,c.title,c.target_url,e.message,e.status,e.created_at
 FROM public.feed_enquiries e CROSS JOIN LATERAL public.enquiry_context(e.id) c
 WHERE p_id IS NULL OR e.id=p_id ORDER BY e.created_at DESC,e.id DESC LIMIT 100;
$$;
REVOKE ALL ON FUNCTION public.my_enquiry_conversations(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_enquiry_conversations(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.update_feed_enquiry(p_enquiry uuid,p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c record;
BEGIN
 IF auth.uid() IS NULL OR public.feed_user_restricted(auth.uid()) THEN RAISE EXCEPTION 'Active feed access is required.'; END IF;
 IF p_status IS NULL OR p_status NOT IN('new','contacted','closed') THEN RAISE EXCEPTION 'Choose a valid enquiry status.'; END IF;
 SELECT * INTO c FROM public.enquiry_context(p_enquiry);
 IF NOT FOUND OR c.owner_id<>auth.uid() THEN RAISE EXCEPTION 'Only the seller or post author can update this enquiry.'; END IF;
 UPDATE public.feed_enquiries SET status=p_status WHERE id=p_enquiry;
END;
$$;
CREATE FUNCTION public.request_product_quote(p_product uuid,p_quantity numeric,p_destination text,p_message text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE t public.trade_products; v public.trade_vendors; result uuid;
BEGIN
 IF auth.uid() IS NULL OR public.feed_user_restricted(auth.uid()) THEN RAISE EXCEPTION 'Sign in with an active account to request a quote.'; END IF;
 PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Complete your member profile before requesting a quote.'; END IF;
 SELECT * INTO t FROM public.trade_products WHERE id=p_product FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'This product is unavailable.'; END IF;
 SELECT * INTO v FROM public.trade_vendors WHERE id=t.vendor_id FOR SHARE;
 IF v.user_id IS NULL OR v.user_id=auth.uid() OR v.status<>'approved' OR public.feed_user_restricted(v.user_id) OR public.is_blocked_pair(auth.uid(),v.user_id) THEN RAISE EXCEPTION 'This seller is not accepting enquiries.'; END IF;
 SELECT id INTO result FROM public.feed_enquiries WHERE product_id=p_product AND user_id=auth.uid();
 IF FOUND THEN RETURN result; END IF;
 IF NOT t.is_active OR t.stock_status='out_of_stock' THEN RAISE EXCEPTION 'This product is not currently available for a new quote.'; END IF;
 IF p_quantity IS NULL OR p_quantity<greatest(coalesce(t.min_order_quantity,1),1) OR p_quantity>1000000000 OR p_quantity::text IN('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Enter a valid quantity at or above the minimum order.'; END IF;
 IF p_destination IS NULL OR length(trim(p_destination)) NOT BETWEEN 2 AND 120 OR p_message IS NULL OR length(trim(p_message)) NOT BETWEEN 20 AND 700 THEN RAISE EXCEPTION 'Add a delivery location and a message of 20–700 characters.'; END IF;
 IF (SELECT count(*) FROM regexp_matches(p_message,'(https?://|www\.)','gi'))>3 THEN RAISE EXCEPTION 'Use no more than 3 links.'; END IF;
 IF (SELECT count(*) FROM public.feed_enquiries WHERE user_id=auth.uid() AND created_at>now()-interval '1 hour')>=10 THEN RAISE EXCEPTION 'You can send up to 10 enquiries per hour.'; END IF;
 INSERT INTO public.feed_enquiries(product_id,user_id,requested_quantity,delivery_location,message)
 VALUES(p_product,auth.uid(),p_quantity,trim(p_destination),'Quantity: '||p_quantity||' '||coalesce(t.unit,'units')||E'\nDelivery: '||trim(p_destination)||E'\n\n'||trim(p_message)) RETURNING id INTO result;
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.request_product_quote(uuid,numeric,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_product_quote(uuid,numeric,text,text) TO authenticated;
CREATE TABLE public.product_enquiry_events(enquiry_id uuid REFERENCES public.feed_enquiries(id) ON DELETE CASCADE,event text,PRIMARY KEY(enquiry_id,event));
ALTER TABLE public.product_enquiry_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.product_enquiry_events FROM anon,authenticated;
CREATE FUNCTION public.notify_product_enquiry() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE recipient uuid; actor uuid; enabled boolean; kind text; claimed text;
BEGIN
 IF NEW.product_id IS NULL THEN RETURN NEW; END IF;
 SELECT v.user_id INTO actor FROM public.trade_products t JOIN public.trade_vendors v ON v.id=t.vendor_id WHERE t.id=NEW.product_id;
 IF TG_OP='INSERT' THEN recipient:=actor;actor:=NEW.user_id;kind:='enquiry';SELECT notify_enquiries INTO enabled FROM public.feed_preferences WHERE user_id=recipient;
 ELSE
  IF NEW.status=OLD.status THEN RETURN NEW; END IF;
  recipient:=NEW.user_id;kind:='enquiry_update';SELECT notify_enquiry_updates INTO enabled FROM public.feed_preferences WHERE user_id=recipient;
 END IF;
 IF recipient IS NULL OR actor IS NULL OR public.feed_user_restricted(recipient) OR public.feed_user_restricted(actor) OR public.is_blocked_pair(recipient,actor) OR NOT coalesce(enabled,true) OR EXISTS(SELECT 1 FROM public.user_mutes WHERE muter_id=recipient AND muted_id=actor) THEN RETURN NEW; END IF;
 INSERT INTO public.product_enquiry_events(enquiry_id,event) VALUES(NEW.id,kind||':'||NEW.status) ON CONFLICT DO NOTHING RETURNING event INTO claimed;
 IF claimed IS NOT NULL THEN
 INSERT INTO public.notifications(user_id,actor_id,type,enquiry_id,message) VALUES(recipient,actor,kind,NEW.id,CASE WHEN TG_OP='INSERT' THEN 'New quote request for your product' ELSE 'Your product enquiry is now marked '||NEW.status END);
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_product_enquiry() FROM PUBLIC;
CREATE TRIGGER notify_product_enquiry AFTER INSERT OR UPDATE OF status ON public.feed_enquiries FOR EACH ROW EXECUTE FUNCTION public.notify_product_enquiry();
DROP POLICY feed_alert_visibility ON public.notifications;
CREATE POLICY feed_alert_visibility ON public.notifications AS RESTRICTIVE FOR SELECT TO authenticated USING
(type NOT IN ('enquiry','enquiry_update','answer_accepted') OR (
 NOT public.feed_user_restricted(actor_id) AND NOT public.is_blocked_pair(auth.uid(),actor_id)
 AND NOT EXISTS(SELECT 1 FROM public.user_mutes m WHERE m.muter_id=auth.uid() AND m.muted_id=actor_id)
 AND (EXISTS(SELECT 1 FROM public.posts p WHERE p.id=post_id AND p.moderation_status='published')
   OR (type IN('enquiry','enquiry_update') AND EXISTS(SELECT 1 FROM public.feed_enquiries e WHERE e.id=notifications.enquiry_id AND e.product_id IS NOT NULL)))
 AND (type<>'answer_accepted' OR EXISTS(SELECT 1 FROM public.feed_accepted_answers a WHERE a.post_id=notifications.post_id AND a.comment_id=notifications.comment_id))
));
CREATE OR REPLACE FUNCTION public.send_enquiry_reply(p_enquiry uuid,p_body text,p_client_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e public.feed_enquiries; p public.posts; recipient uuid; message_id uuid; previous public.feed_enquiry_messages; enabled boolean; context record;
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
 IF e.product_id IS NULL THEN
  PERFORM 1 FROM public.posts WHERE id=e.post_id FOR SHARE;
 ELSE
  PERFORM 1 FROM public.trade_products WHERE id=e.product_id FOR SHARE;
  PERFORM 1 FROM public.trade_vendors WHERE id=(SELECT vendor_id FROM public.trade_products WHERE id=e.product_id) FOR SHARE;
 END IF;
 SELECT * INTO context FROM public.enquiry_context(p_enquiry);
 IF NOT FOUND THEN RAISE EXCEPTION 'This conversation is unavailable.'; END IF;
 recipient:=CASE WHEN auth.uid()=e.user_id THEN context.owner_id ELSE e.user_id END;
 IF public.feed_user_restricted(auth.uid()) OR public.feed_user_restricted(recipient) OR public.is_blocked_pair(auth.uid(),recipient) THEN RAISE EXCEPTION 'Replies are unavailable for this conversation.'; END IF;
 IF NOT context.available OR e.status='closed' THEN RAISE EXCEPTION 'This conversation is closed or paused.'; END IF;
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

ALTER TABLE public.content_reports DROP CONSTRAINT content_reports_target_type_check;
ALTER TABLE public.content_reports ADD CONSTRAINT content_reports_target_type_check CHECK(target_type IN('post','comment','user','enquiry_message','product'));
COMMIT;
