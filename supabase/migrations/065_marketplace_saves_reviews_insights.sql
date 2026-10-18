-- Run after 064 (and the marketplace releases 060/061). Saved products and suppliers with
-- alerts, product view counts, buyer reviews that require a real quote conversation, and
-- seller insights. Seller reputation columns on trade_vendors stay protected by the 060 guard;
-- review totals are computed by vendor_review_summary() instead of being written there.
BEGIN;

-- ── Saved products and suppliers ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trade_saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.trade_products(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES public.trade_vendors(id) ON DELETE CASCADE,
  notify boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saved_one_target CHECK (num_nonnulls(product_id, vendor_id) = 1)
);
CREATE UNIQUE INDEX IF NOT EXISTS saved_user_product ON public.trade_saved_items(user_id, product_id) WHERE product_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS saved_user_vendor ON public.trade_saved_items(user_id, vendor_id) WHERE vendor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS saved_product_idx ON public.trade_saved_items(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS saved_vendor_idx ON public.trade_saved_items(vendor_id) WHERE vendor_id IS NOT NULL;
ALTER TABLE public.trade_saved_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.trade_saved_items FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trade_saved_items TO authenticated;
DROP POLICY IF EXISTS saved_own_read ON public.trade_saved_items;
DROP POLICY IF EXISTS saved_own_insert ON public.trade_saved_items;
DROP POLICY IF EXISTS saved_own_update ON public.trade_saved_items;
DROP POLICY IF EXISTS saved_own_delete ON public.trade_saved_items;
CREATE POLICY saved_own_read ON public.trade_saved_items FOR SELECT TO authenticated USING (user_id = auth.uid());
-- Only things the member can currently see can be saved (the subqueries apply marketplace RLS).
CREATE POLICY saved_own_insert ON public.trade_saved_items FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND (
    (product_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.trade_products t WHERE t.id = product_id))
    OR (vendor_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.trade_vendors v WHERE v.id = vendor_id))));
CREATE POLICY saved_own_update ON public.trade_saved_items FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY saved_own_delete ON public.trade_saved_items FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.guard_trade_saved_item() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND ROW(NEW.user_id, NEW.product_id, NEW.vendor_id) IS DISTINCT FROM ROW(OLD.user_id, OLD.product_id, OLD.vendor_id) THEN
    RAISE EXCEPTION 'Only the alert setting of a saved item can change.';
  END IF;
  IF TG_OP = 'INSERT' AND (SELECT count(*) FROM public.trade_saved_items WHERE user_id = NEW.user_id) >= 500 THEN
    RAISE EXCEPTION 'You can save up to 500 products and suppliers.';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_trade_saved_item ON public.trade_saved_items;
CREATE TRIGGER guard_trade_saved_item BEFORE INSERT OR UPDATE ON public.trade_saved_items FOR EACH ROW EXECUTE FUNCTION public.guard_trade_saved_item();

-- ── Alerts for saved items ─────────────────────────────────────────
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.trade_products(id) ON DELETE CASCADE;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'mention','like','comment','repost','follow','connection_request','connection_accepted',
  'enquiry','enquiry_update','answer_accepted','enquiry_reply','saved_item_update','new_review'));
-- Marketplace alerts are created only by the database, never directly by a client.
DROP POLICY IF EXISTS trade_alerts_server_only ON public.notifications;
CREATE POLICY trade_alerts_server_only ON public.notifications AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (type NOT IN ('saved_item_update','new_review') AND product_id IS NULL);

-- Notifies members who saved a product (restock or price drop) or its supplier (new listing).
-- At most one alert per member per product per day; blocks and restrictions suppress alerts.
CREATE OR REPLACE FUNCTION public.notify_saved_trade_item() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v record; reason text; audience text;
BEGIN
  IF NOT NEW.is_active THEN RETURN NEW; END IF;
  SELECT id, user_id, business_name, status INTO v FROM public.trade_vendors WHERE id = NEW.vendor_id;
  IF v.user_id IS NULL OR v.status <> 'approved' OR public.feed_user_restricted(v.user_id) THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    reason := format('%s listed a new product: %s', v.business_name, NEW.name); audience := 'vendor';
  ELSIF NOT OLD.is_active THEN
    reason := format('%s listed a new product: %s', v.business_name, NEW.name); audience := 'vendor';
  ELSIF OLD.stock_status = 'out_of_stock' AND NEW.stock_status IN ('in_stock','low_stock') THEN
    reason := format('%s is back in stock', NEW.name); audience := 'product';
  ELSIF NEW.price IS NOT NULL AND OLD.price IS NOT NULL AND NEW.price < OLD.price AND NEW.currency IS NOT DISTINCT FROM OLD.currency THEN
    reason := format('%s dropped in price to %s %s', NEW.name, coalesce(NEW.currency,'GHS'), trim(to_char(NEW.price, 'FM999G999G990D00'))); audience := 'product';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications(user_id, actor_id, type, product_id, message)
  SELECT DISTINCT s.user_id, v.user_id, 'saved_item_update', NEW.id, reason
  FROM public.trade_saved_items s
  WHERE s.notify
    AND ((audience = 'product' AND s.product_id = NEW.id) OR (audience = 'vendor' AND s.vendor_id = v.id))
    AND s.user_id <> v.user_id
    AND NOT public.feed_user_restricted(s.user_id)
    AND NOT public.is_blocked_pair(s.user_id, v.user_id)
    AND NOT EXISTS (SELECT 1 FROM public.notifications n WHERE n.user_id = s.user_id AND n.product_id = NEW.id
                    AND n.type = 'saved_item_update' AND n.created_at > now() - interval '1 day');
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.notify_saved_trade_item() FROM PUBLIC;
DROP TRIGGER IF EXISTS notify_saved_trade_item ON public.trade_products;
CREATE TRIGGER notify_saved_trade_item AFTER INSERT OR UPDATE OF stock_status, price, is_active ON public.trade_products
  FOR EACH ROW EXECUTE FUNCTION public.notify_saved_trade_item();

-- ── Product views (daily totals, no visitor identities stored) ─────
CREATE TABLE IF NOT EXISTS public.trade_product_views (
  product_id uuid NOT NULL REFERENCES public.trade_products(id) ON DELETE CASCADE,
  day date NOT NULL,
  views integer NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, day)
);
ALTER TABLE public.trade_product_views ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.trade_product_views FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.record_product_view(p_product uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Count only public listings, and never the seller looking at their own product.
  IF NOT EXISTS (
    SELECT 1 FROM public.trade_products t JOIN public.trade_vendors v ON v.id = t.vendor_id
    WHERE t.id = p_product AND t.is_active AND v.status = 'approved' AND NOT public.feed_user_restricted(v.user_id)
      AND (auth.uid() IS NULL OR v.user_id IS DISTINCT FROM auth.uid())) THEN
    RETURN;
  END IF;
  INSERT INTO public.trade_product_views(product_id, day, views) VALUES (p_product, (now() AT TIME ZONE 'UTC')::date, 1)
  ON CONFLICT (product_id, day) DO UPDATE SET views = trade_product_views.views + 1;
END $$;
REVOKE ALL ON FUNCTION public.record_product_view(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_product_view(uuid) TO anon, authenticated;

-- ── Buyer reviews ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trade_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.trade_vendors(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enquiry_id uuid REFERENCES public.feed_enquiries(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL CHECK (length(trim(body)) BETWEEN 20 AND 2000),
  would_trade_again boolean,
  seller_response text CHECK (seller_response IS NULL OR length(trim(seller_response)) BETWEEN 2 AND 1000),
  seller_responded_at timestamptz,
  hidden_at timestamptz,
  hidden_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, buyer_id)
);
CREATE INDEX IF NOT EXISTS trade_reviews_vendor_idx ON public.trade_reviews(vendor_id, created_at DESC);
ALTER TABLE public.trade_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.trade_reviews FROM anon, authenticated;
GRANT SELECT ON public.trade_reviews TO authenticated;
DROP POLICY IF EXISTS trade_reviews_read ON public.trade_reviews;
-- Members read their own review (even if hidden) and admins read all; the public uses vendor_reviews().
CREATE POLICY trade_reviews_read ON public.trade_reviews FOR SELECT TO authenticated USING (buyer_id = auth.uid() OR public.is_admin_user());

/** The most recent quote conversation that makes this buyer eligible: a product enquiry to this seller that the seller has replied to. */
CREATE OR REPLACE FUNCTION public.trade_review_basis(p_vendor uuid, p_buyer uuid) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.id FROM public.feed_enquiries e
  JOIN public.trade_products t ON t.id = e.product_id
  JOIN public.trade_vendors v ON v.id = t.vendor_id
  WHERE t.vendor_id = p_vendor AND e.user_id = p_buyer AND v.user_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.feed_enquiry_messages m WHERE m.enquiry_id = e.id AND m.sender_id = v.user_id AND m.removed_at IS NULL)
  ORDER BY e.created_at DESC LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.trade_review_basis(uuid, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.my_trade_review_status(p_vendor uuid)
RETURNS TABLE(eligible boolean, reason text, review_id uuid, rating integer, body text, would_trade_again boolean, hidden boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v record; r record; basis uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN QUERY SELECT false, 'Sign in to review this supplier.', NULL::uuid, NULL::int, NULL::text, NULL::boolean, false; RETURN; END IF;
  SELECT id, user_id, status INTO v FROM public.trade_vendors WHERE id = p_vendor;
  SELECT * INTO r FROM public.trade_reviews WHERE vendor_id = p_vendor AND buyer_id = auth.uid();
  IF v.user_id = auth.uid() THEN RETURN QUERY SELECT false, 'You cannot review your own business.', NULL::uuid, NULL::int, NULL::text, NULL::boolean, false; RETURN; END IF;
  basis := public.trade_review_basis(p_vendor, auth.uid());
  RETURN QUERY SELECT basis IS NOT NULL OR r.id IS NOT NULL,
    CASE WHEN basis IS NULL AND r.id IS NULL THEN 'Reviews open after you request a quote from this supplier and they reply.' END,
    r.id, r.rating, r.body, r.would_trade_again, r.hidden_at IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.my_trade_review_status(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_trade_review_status(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_trade_review(p_vendor uuid, p_rating integer, p_body text, p_would_trade_again boolean DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v record; basis uuid; existing record; rid uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to leave a review.'; END IF;
  IF public.feed_user_restricted(auth.uid()) THEN RAISE EXCEPTION 'Reviews are unavailable while your account is restricted.'; END IF;
  SELECT id, user_id, status, business_name INTO v FROM public.trade_vendors WHERE id = p_vendor;
  IF NOT FOUND OR v.status <> 'approved' THEN RAISE EXCEPTION 'This supplier is not available for reviews.'; END IF;
  IF v.user_id = auth.uid() THEN RAISE EXCEPTION 'You cannot review your own business.'; END IF;
  IF public.is_blocked_pair(auth.uid(), v.user_id) THEN RAISE EXCEPTION 'Reviews are unavailable because an account block is in place.'; END IF;
  IF p_rating IS NULL OR p_rating NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'Choose a rating from 1 to 5 stars.'; END IF;
  IF length(trim(coalesce(p_body,''))) NOT BETWEEN 20 AND 2000 THEN RAISE EXCEPTION 'Write at least a couple of sentences (20–2,000 characters).'; END IF;
  SELECT * INTO existing FROM public.trade_reviews WHERE vendor_id = p_vendor AND buyer_id = auth.uid() FOR UPDATE;
  basis := public.trade_review_basis(p_vendor, auth.uid());
  IF basis IS NULL AND existing.id IS NULL THEN RAISE EXCEPTION 'Reviews open after you request a quote from this supplier and they reply.'; END IF;
  IF existing.id IS NULL AND (SELECT count(*) FROM public.trade_reviews WHERE buyer_id = auth.uid() AND created_at > now() - interval '1 day') >= 10 THEN
    RAISE EXCEPTION 'You have reached the daily review limit. Please try again tomorrow.';
  END IF;
  IF existing.id IS NOT NULL AND existing.hidden_at IS NOT NULL THEN RAISE EXCEPTION 'A moderator removed this review, so it cannot be edited.'; END IF;

  INSERT INTO public.trade_reviews(vendor_id, buyer_id, enquiry_id, rating, body, would_trade_again)
  VALUES (p_vendor, auth.uid(), basis, p_rating, trim(p_body), p_would_trade_again)
  ON CONFLICT (vendor_id, buyer_id) DO UPDATE SET rating = EXCLUDED.rating, body = EXCLUDED.body,
    would_trade_again = EXCLUDED.would_trade_again, enquiry_id = coalesce(EXCLUDED.enquiry_id, trade_reviews.enquiry_id), updated_at = now()
  RETURNING id INTO rid;

  IF existing.id IS NULL AND v.user_id IS NOT NULL AND NOT public.feed_user_restricted(v.user_id) THEN
    INSERT INTO public.notifications(user_id, actor_id, type, message)
    VALUES (v.user_id, auth.uid(), 'new_review', format('You received a %s-star review for %s', p_rating, v.business_name));
  END IF;
  RETURN rid;
END $$;
REVOKE ALL ON FUNCTION public.submit_trade_review(uuid, integer, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_trade_review(uuid, integer, text, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.respond_trade_review(p_review uuid, p_response text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner uuid;
BEGIN
  SELECT v.user_id INTO owner FROM public.trade_reviews r JOIN public.trade_vendors v ON v.id = r.vendor_id WHERE r.id = p_review;
  IF owner IS NULL OR owner IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Only the supplier can respond to this review.'; END IF;
  IF public.feed_user_restricted(auth.uid()) THEN RAISE EXCEPTION 'Responses are unavailable while your account is restricted.'; END IF;
  IF p_response IS NOT NULL AND length(trim(p_response)) NOT BETWEEN 2 AND 1000 THEN RAISE EXCEPTION 'Keep your response under 1,000 characters.'; END IF;
  UPDATE public.trade_reviews SET seller_response = nullif(trim(p_response), ''),
    seller_responded_at = CASE WHEN nullif(trim(p_response), '') IS NULL THEN NULL ELSE now() END
  WHERE id = p_review;
END $$;
REVOKE ALL ON FUNCTION public.respond_trade_review(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.respond_trade_review(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.moderate_trade_review(p_review uuid, p_hide boolean, p_reason text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_user() THEN RAISE EXCEPTION 'Administrator access required.'; END IF;
  UPDATE public.trade_reviews SET hidden_at = CASE WHEN p_hide THEN now() END, hidden_reason = CASE WHEN p_hide THEN p_reason END WHERE id = p_review;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review not found.'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.moderate_trade_review(uuid, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.moderate_trade_review(uuid, boolean, text) TO authenticated;

-- Public review list: first names only, visible reviews of approved suppliers.
CREATE OR REPLACE FUNCTION public.vendor_reviews(p_vendor uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
RETURNS TABLE(id uuid, rating integer, body text, would_trade_again boolean, reviewer text, reviewer_country text, product_name text,
              seller_response text, seller_responded_at timestamptz, created_at timestamptz, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.rating, r.body, r.would_trade_again,
    coalesce(nullif(split_part(trim(p.full_name), ' ', 1), ''), 'Verified buyer'), p.country, t.name,
    r.seller_response, r.seller_responded_at, r.created_at, r.updated_at
  FROM public.trade_reviews r
  JOIN public.trade_vendors v ON v.id = r.vendor_id
  LEFT JOIN public.profiles p ON p.id = r.buyer_id
  LEFT JOIN public.feed_enquiries e ON e.id = r.enquiry_id
  LEFT JOIN public.trade_products t ON t.id = e.product_id
  WHERE r.vendor_id = p_vendor AND r.hidden_at IS NULL AND v.status = 'approved'
    AND NOT public.feed_user_restricted(r.buyer_id) AND NOT public.is_blocked_pair(auth.uid(), r.buyer_id)
  ORDER BY r.created_at DESC
  LIMIT least(greatest(p_limit, 1), 50) OFFSET greatest(p_offset, 0);
$$;
REVOKE ALL ON FUNCTION public.vendor_reviews(uuid, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vendor_reviews(uuid, integer, integer) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.vendor_review_summary(p_vendor_ids uuid[])
RETURNS TABLE(vendor_id uuid, average numeric, total integer, would_trade_again_pct integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.vendor_id, round(avg(r.rating)::numeric, 2), count(*)::int,
    CASE WHEN count(r.would_trade_again) > 0 THEN round(100.0 * count(*) FILTER (WHERE r.would_trade_again) / count(r.would_trade_again))::int END
  FROM public.trade_reviews r JOIN public.trade_vendors v ON v.id = r.vendor_id
  WHERE r.vendor_id = ANY(p_vendor_ids[1:200]) AND r.hidden_at IS NULL AND v.status = 'approved' AND NOT public.feed_user_restricted(r.buyer_id)
  GROUP BY r.vendor_id;
$$;
REVOKE ALL ON FUNCTION public.vendor_review_summary(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vendor_review_summary(uuid[]) TO anon, authenticated;

-- Reviews can be reported through the existing moderation queue.
ALTER TABLE public.content_reports DROP CONSTRAINT IF EXISTS content_reports_target_type_check;
ALTER TABLE public.content_reports ADD CONSTRAINT content_reports_target_type_check
  CHECK (target_type IN ('post','comment','user','enquiry_message','product','trade_review'));

-- ── Seller insights ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.vendor_insights(p_days integer DEFAULT 30) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v record; since timestamptz; days integer := least(greatest(coalesce(p_days, 30), 7), 365); result jsonb;
BEGIN
  SELECT id, user_id INTO v FROM public.trade_vendors WHERE user_id = auth.uid() LIMIT 1;
  IF v.id IS NULL THEN RAISE EXCEPTION 'You do not have a seller profile.'; END IF;
  since := now() - make_interval(days => days);

  WITH products AS (
    SELECT t.id, t.name, t.slug, t.stock_status, t.is_active FROM public.trade_products t WHERE t.vendor_id = v.id
  ), enq AS (
    SELECT e.id, e.product_id, e.created_at,
      (SELECT min(m.created_at) FROM public.feed_enquiry_messages m WHERE m.enquiry_id = e.id AND m.sender_id = v.user_id) AS first_reply
    FROM public.feed_enquiries e WHERE e.product_id IN (SELECT id FROM products)
  ), per_product AS (
    SELECT p.id, p.name, p.slug, p.stock_status, p.is_active,
      coalesce((SELECT sum(w.views) FROM public.trade_product_views w WHERE w.product_id = p.id AND w.day >= since::date), 0)::int AS views,
      (SELECT count(*) FROM public.trade_saved_items s WHERE s.product_id = p.id)::int AS saves,
      (SELECT count(*) FROM enq WHERE enq.product_id = p.id AND enq.created_at >= since)::int AS enquiries,
      (SELECT count(*) FROM enq WHERE enq.product_id = p.id)::int AS enquiries_total
    FROM products p
  ), period_enq AS (SELECT * FROM enq WHERE created_at >= since)
  SELECT jsonb_build_object(
    'period_days', days,
    'products', coalesce((SELECT jsonb_agg(to_jsonb(pp) ORDER BY pp.views DESC, pp.enquiries DESC) FROM per_product pp), '[]'::jsonb),
    'totals', jsonb_build_object(
      'views', coalesce((SELECT sum(views) FROM per_product), 0),
      'product_saves', coalesce((SELECT sum(saves) FROM per_product), 0),
      'supplier_saves', (SELECT count(*) FROM public.trade_saved_items s WHERE s.vendor_id = v.id),
      'enquiries', (SELECT count(*) FROM period_enq),
      'replied', (SELECT count(*) FROM period_enq WHERE first_reply IS NOT NULL),
      'replied_within_day', (SELECT count(*) FROM period_enq WHERE first_reply <= created_at + interval '1 day'),
      'median_reply_hours', (SELECT round((percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM first_reply - created_at)) / 3600)::numeric, 1)
                             FROM period_enq WHERE first_reply IS NOT NULL),
      'awaiting_reply', (SELECT count(*) FROM enq e JOIN public.feed_enquiries f ON f.id = e.id WHERE e.first_reply IS NULL AND f.status <> 'closed')),
    'reviews', (SELECT jsonb_build_object('average', round(avg(rating)::numeric, 2), 'total', count(*))
                FROM public.trade_reviews WHERE vendor_id = v.id AND hidden_at IS NULL),
    'daily', coalesce((SELECT jsonb_agg(jsonb_build_object('day', d.day, 'views', d.views, 'enquiries', d.enquiries) ORDER BY d.day)
      FROM (SELECT g::date AS day,
              coalesce((SELECT sum(w.views) FROM public.trade_product_views w WHERE w.day = g::date AND w.product_id IN (SELECT id FROM products)), 0)::int AS views,
              (SELECT count(*) FROM enq WHERE enq.created_at::date = g::date)::int AS enquiries
            FROM generate_series(since::date, now()::date, interval '1 day') g) d), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.vendor_insights(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vendor_insights(integer) TO authenticated;

-- Sellers see reviews of their own business, including ones a moderator hid, to respond or appeal.
CREATE OR REPLACE FUNCTION public.my_vendor_reviews() RETURNS TABLE(id uuid, rating integer, body text, would_trade_again boolean, reviewer text,
  product_name text, seller_response text, hidden boolean, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.rating, r.body, r.would_trade_again, coalesce(nullif(split_part(trim(p.full_name), ' ', 1), ''), 'Buyer'), t.name,
    r.seller_response, r.hidden_at IS NOT NULL, r.created_at
  FROM public.trade_reviews r JOIN public.trade_vendors v ON v.id = r.vendor_id
  LEFT JOIN public.profiles p ON p.id = r.buyer_id
  LEFT JOIN public.feed_enquiries e ON e.id = r.enquiry_id LEFT JOIN public.trade_products t ON t.id = e.product_id
  WHERE v.user_id = auth.uid() ORDER BY r.created_at DESC LIMIT 200;
$$;
REVOKE ALL ON FUNCTION public.my_vendor_reviews() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_vendor_reviews() TO authenticated;

COMMIT;
