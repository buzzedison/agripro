-- Run after 059 and the existing trade migrations. No automatic promotion of legacy vendors.
BEGIN;
CREATE TABLE public.trade_vendor_reviews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), vendor_id uuid REFERENCES public.trade_vendors(id) ON DELETE SET NULL,
 actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, action text NOT NULL, notes text, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trade_vendor_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY trade_reviews_admin ON public.trade_vendor_reviews FOR SELECT TO authenticated USING(public.is_admin_user());
REVOKE ALL ON public.trade_vendor_reviews FROM anon,authenticated;
GRANT SELECT ON public.trade_vendor_reviews TO authenticated;
-- Older code set badges without completing the document-review fields. Keep approved
-- storefronts visible, but return unsupported badges to review instead of inventing evidence.
INSERT INTO public.trade_vendor_reviews(vendor_id,action,notes)
 SELECT id,'verification_review_required','Legacy badge lacked a complete recorded identity review.' FROM public.trade_vendors
 WHERE is_verified AND (verification_status IS DISTINCT FROM 'approved' OR verified_by IS NULL OR id_verified_at IS NULL OR id_document_url IS NULL);
UPDATE public.trade_vendors SET is_verified=false,verification_level='basic',verification_status=CASE WHEN id_document_url IS NULL THEN 'not_submitted' ELSE 'pending_review' END
 WHERE is_verified AND (verification_status IS DISTINCT FROM 'approved' OR verified_by IS NULL OR id_verified_at IS NULL OR id_document_url IS NULL);
CREATE FUNCTION public.guard_trade_vendor() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF public.is_admin_user() OR (auth.uid() IS NULL AND current_setting('request.jwt.claim.role',true)='service_role') THEN RETURN NEW; END IF;
 IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() OR public.feed_user_restricted(auth.uid()) THEN RAISE EXCEPTION 'Active member access is required.'; END IF;
 IF length(trim(NEW.business_name)) NOT BETWEEN 3 AND 160 OR length(trim(NEW.product_description)) NOT BETWEEN 10 AND 5000 OR length(NEW.email)>254 OR length(NEW.phone)>60 OR (coalesce(NEW.website,'')<>'' AND NEW.website !~ '^https?://') THEN RAISE EXCEPTION 'Check your business name, description, contact details and website URL.'; END IF;
 IF TG_OP='INSERT' THEN
  PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
  IF EXISTS(SELECT 1 FROM public.trade_vendors WHERE user_id=auth.uid()) THEN RAISE EXCEPTION 'You already have a seller profile.'; END IF;
  NEW.status:='pending'; NEW.is_verified:=false; NEW.verification_status:='not_submitted'; NEW.verification_level:='basic';
  NEW.is_featured:=false; NEW.display_order:=0; NEW.rating:=0; NEW.total_reviews:=0; NEW.total_products:=0;
  NEW.admin_notes:=NULL; NEW.rejection_reason:=NULL; NEW.verified_at:=NULL; NEW.verified_by:=NULL;
  NEW.id_verified_at:=NULL; NEW.business_verified_at:=NULL; NEW.verification_notes:=NULL;
  NEW.id_document_url:=NULL; NEW.business_document_url:=NULL; NEW.verification_submitted_at:=NULL;
  NEW.created_at:=now();
 ELSE
  IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.id<>OLD.id THEN RAISE EXCEPTION 'Seller ownership cannot be changed.'; END IF;
  IF ROW(NEW.status,NEW.is_verified,NEW.verification_level,NEW.is_featured,NEW.display_order,NEW.rating,NEW.total_reviews,NEW.admin_notes,NEW.rejection_reason,NEW.verified_at,NEW.verified_by,NEW.id_verified_at,NEW.business_verified_at,NEW.verification_notes,NEW.created_at)
   IS DISTINCT FROM ROW(OLD.status,OLD.is_verified,OLD.verification_level,OLD.is_featured,OLD.display_order,OLD.rating,OLD.total_reviews,OLD.admin_notes,OLD.rejection_reason,OLD.verified_at,OLD.verified_by,OLD.id_verified_at,OLD.business_verified_at,OLD.verification_notes,OLD.created_at) THEN RAISE EXCEPTION 'Only moderators can change approval, verification or reputation.'; END IF;
  -- Document submission is the only member-controlled verification transition.
  IF ROW(NEW.id_document_url,NEW.business_document_url,NEW.id_document_type,NEW.business_document_type,NEW.verification_submitted_at,NEW.verification_status)
   IS DISTINCT FROM ROW(OLD.id_document_url,OLD.business_document_url,OLD.id_document_type,OLD.business_document_type,OLD.verification_submitted_at,OLD.verification_status) THEN
   IF OLD.verification_status='approved' THEN RAISE EXCEPTION 'Contact a moderator to replace approved verification documents.'; END IF;
   IF NEW.verification_status<>'pending_review' OR NEW.id_document_url IS NULL THEN RAISE EXCEPTION 'Submit an identity document for review.'; END IF;
   IF NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='vendor-documents' AND name=NEW.id_document_url AND split_part(name,'/',1)=NEW.id::text)
     OR (NEW.business_document_url IS NOT NULL AND NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='vendor-documents' AND name=NEW.business_document_url AND split_part(name,'/',1)=NEW.id::text)) THEN RAISE EXCEPTION 'Upload documents to your own seller folder.'; END IF;
   NEW.verification_submitted_at:=now();
  END IF;
  -- Product counts are derived, never supplied by the seller.
  NEW.total_products:=OLD.total_products;
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_trade_vendor() FROM PUBLIC;
CREATE TRIGGER guard_trade_vendor BEFORE INSERT OR UPDATE ON public.trade_vendors FOR EACH ROW EXECUTE FUNCTION public.guard_trade_vendor();
DROP POLICY IF EXISTS "Anyone can insert vendor application" ON public.trade_vendors;
CREATE POLICY "Members apply for own vendor profile" ON public.trade_vendors FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid());
REVOKE INSERT ON public.trade_vendors FROM anon;
-- Existing private documents use the vendor UUID as their first path segment.
CREATE FUNCTION public.can_manage_vendor_document(p_name text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT auth.uid() IS NOT NULL AND EXISTS(SELECT 1 FROM public.trade_vendors v WHERE v.id::text=split_part(p_name,'/',1) AND v.user_id=auth.uid());
$$;
REVOKE ALL ON FUNCTION public.can_manage_vendor_document(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_vendor_document(text) TO authenticated;
DROP POLICY IF EXISTS "Authenticated can upload vendor documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view vendor documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete vendor documents" ON storage.objects;
CREATE POLICY vendor_documents_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='vendor-documents' AND (public.can_manage_vendor_document(name) OR public.is_admin_user()));
CREATE POLICY vendor_documents_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='vendor-documents' AND public.can_manage_vendor_document(name));
-- Submitted evidence cannot be overwritten or deleted by its uploader; reviewers can remove it.
CREATE POLICY vendor_documents_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id='vendor-documents' AND public.is_admin_user());
CREATE POLICY vendor_documents_anon_guard ON storage.objects AS RESTRICTIVE FOR SELECT TO anon USING(bucket_id<>'vendor-documents');
CREATE POLICY vendor_documents_read_guard ON storage.objects AS RESTRICTIVE FOR SELECT TO authenticated USING(bucket_id<>'vendor-documents' OR public.can_manage_vendor_document(name) OR public.is_admin_user());
CREATE POLICY vendor_documents_insert_guard ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(bucket_id<>'vendor-documents' OR public.can_manage_vendor_document(name));
CREATE POLICY vendor_documents_update_guard ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated USING(bucket_id<>'vendor-documents' OR public.is_admin_user()) WITH CHECK(bucket_id<>'vendor-documents' OR public.is_admin_user());
CREATE POLICY vendor_documents_delete_guard ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated USING(bucket_id<>'vendor-documents' OR public.is_admin_user());
UPDATE storage.buckets SET public=false, file_size_limit=5242880,allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp','application/pdf'] WHERE id='vendor-documents';

CREATE FUNCTION public.review_trade_vendor(p_vendor uuid,p_status text,p_verify boolean DEFAULT false,p_notes text DEFAULT NULL,p_reason text DEFAULT NULL,p_expected_updated_at timestamptz DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.trade_vendors;
BEGIN
 IF NOT public.is_admin_user() THEN RAISE EXCEPTION 'Administrator access required.'; END IF;
 IF p_status IS NULL OR p_status NOT IN('pending','approved','rejected','suspended') OR length(coalesce(p_notes,''))>2000 OR length(coalesce(p_reason,''))>2000 THEN RAISE EXCEPTION 'Choose a valid decision and notes under 2,000 characters.'; END IF;
 SELECT * INTO v FROM public.trade_vendors WHERE id=p_vendor FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Seller not found.'; END IF;
 IF (p_verify AND p_expected_updated_at IS NULL) OR (p_expected_updated_at IS NOT NULL AND v.updated_at IS DISTINCT FROM p_expected_updated_at) THEN RAISE EXCEPTION 'Seller details changed. Refresh and review the current documents.'; END IF;
 IF p_verify AND (p_status<>'approved' OR v.id_document_url IS NULL) THEN RAISE EXCEPTION 'Review an identity document before verifying this seller.'; END IF;
 UPDATE public.trade_vendors SET status=p_status, admin_notes=p_notes,
   rejection_reason=CASE WHEN p_status='rejected' THEN p_reason ELSE NULL END,
   is_verified=CASE WHEN p_status<>'approved' THEN false WHEN p_verify THEN true ELSE is_verified END,
   verification_status=CASE WHEN p_status='rejected' THEN 'rejected' WHEN p_verify THEN 'approved' ELSE verification_status END,
   verification_level=CASE WHEN p_verify THEN 'verified' WHEN p_status<>'approved' THEN 'basic' ELSE verification_level END,
   verified_at=CASE WHEN p_verify THEN now() ELSE verified_at END,
   verified_by=CASE WHEN p_verify THEN auth.uid() ELSE verified_by END,
   id_verified_at=CASE WHEN p_verify THEN now() ELSE id_verified_at END
 WHERE id=p_vendor;
 INSERT INTO public.trade_vendor_reviews(vendor_id,actor_id,action,notes) VALUES(p_vendor,auth.uid(),CASE WHEN p_verify THEN 'identity_verified' ELSE p_status END,p_notes);
END;
$$;
REVOKE ALL ON FUNCTION public.review_trade_vendor(uuid,text,boolean,text,text,timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_trade_vendor(uuid,text,boolean,text,text,timestamptz) TO authenticated;
-- Approval controls listing visibility. Identity verification is a separate, optional reviewed badge.
DROP POLICY IF EXISTS "Approved vendors are viewable by everyone" ON public.trade_vendors;
CREATE POLICY "Approved vendors are viewable by everyone" ON public.trade_vendors FOR SELECT USING(status='approved' AND NOT public.feed_user_restricted(user_id) AND NOT public.is_blocked_pair(auth.uid(),user_id));
DROP POLICY IF EXISTS "Products from approved vendors are viewable" ON public.trade_products;
CREATE POLICY "Products from approved vendors are viewable" ON public.trade_products FOR SELECT USING(is_active AND EXISTS(SELECT 1 FROM public.trade_vendors v WHERE v.id=vendor_id AND v.status='approved' AND NOT public.feed_user_restricted(v.user_id) AND NOT public.is_blocked_pair(auth.uid(),v.user_id)));
CREATE POLICY trade_products_admin ON public.trade_products FOR ALL TO authenticated USING(public.is_admin_user()) WITH CHECK(public.is_admin_user());
CREATE TABLE public.trade_listing_log(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),vendor_id uuid NOT NULL REFERENCES public.trade_vendors(id) ON DELETE CASCADE,submitted_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX trade_listing_log_vendor_time ON public.trade_listing_log(vendor_id,submitted_at DESC);
ALTER TABLE public.trade_listing_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.trade_listing_log FROM anon,authenticated;
INSERT INTO public.trade_listing_log(vendor_id,submitted_at) SELECT vendor_id,created_at FROM public.trade_products WHERE created_at>now()-interval '1 hour';
CREATE FUNCTION public.guard_trade_product() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.trade_vendors;
BEGIN
 IF public.is_admin_user() THEN RETURN NEW; END IF;
 SELECT * INTO v FROM public.trade_vendors WHERE id=NEW.vendor_id FOR UPDATE;
 IF auth.uid() IS NULL OR v.user_id IS DISTINCT FROM auth.uid() OR v.status IN('rejected','suspended') OR public.feed_user_restricted(auth.uid()) THEN RAISE EXCEPTION 'Active seller access is required.'; END IF;
 IF TG_OP='UPDATE' AND ROW(NEW.vendor_id,NEW.id,NEW.created_at,NEW.slug) IS DISTINCT FROM ROW(OLD.vendor_id,OLD.id,OLD.created_at,OLD.slug) THEN RAISE EXCEPTION 'Product ownership and publication date cannot be changed.'; END IF;
 IF TG_OP='INSERT' THEN
  IF NEW.slug IS NULL OR NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' OR length(NEW.slug)>200 THEN RAISE EXCEPTION 'A valid product URL is required.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.slug,0));
  IF EXISTS(SELECT 1 FROM public.trade_products WHERE slug=NEW.slug) THEN RAISE EXCEPTION 'This product URL is already in use. Please try again.'; END IF;
  IF (SELECT count(*) FROM public.trade_listing_log WHERE vendor_id=NEW.vendor_id AND submitted_at>now()-interval '1 hour')>=30 THEN RAISE EXCEPTION 'You can create up to 30 listings per hour.'; END IF;
  NEW.is_featured:=false; NEW.created_at:=now();
 ELSIF NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN RAISE EXCEPTION 'Only moderators can feature products.'; END IF;
 IF TG_OP='UPDATE' AND (to_jsonb(NEW)-ARRAY['is_active','updated_at'])=(to_jsonb(OLD)-ARRAY['is_active','updated_at']) THEN RETURN NEW; END IF;
 IF length(trim(coalesce(NEW.name,''))) NOT BETWEEN 3 AND 160 OR length(trim(coalesce(NEW.description,''))) NOT BETWEEN 10 AND 5000 OR NEW.price IS NULL OR NEW.price<=0 OR NEW.price::text IN('NaN','Infinity','-Infinity') OR NEW.min_order_quantity IS NULL OR NEW.min_order_quantity<1 OR NEW.images IS NULL OR cardinality(NEW.images) NOT BETWEEN 1 AND 8 OR EXISTS(SELECT 1 FROM unnest(NEW.images) url WHERE url IS NULL OR url !~ '^https://') THEN RAISE EXCEPTION 'Add a valid name, description, positive price, minimum quantity and 1–8 images.'; END IF;
 IF TG_OP='INSERT' AND EXISTS(SELECT 1 FROM public.trade_listing_log WHERE vendor_id=NEW.vendor_id AND submitted_at>now()-interval '15 seconds') THEN RAISE EXCEPTION 'Please wait 15 seconds between product listings.'; END IF;
 IF TG_OP='INSERT' THEN
  DELETE FROM public.trade_listing_log WHERE vendor_id=NEW.vendor_id AND submitted_at<now()-interval '24 hours';
  INSERT INTO public.trade_listing_log(vendor_id) VALUES(NEW.vendor_id);
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_trade_product() FROM PUBLIC;
CREATE TRIGGER guard_trade_product BEFORE INSERT OR UPDATE ON public.trade_products FOR EACH ROW EXECUTE FUNCTION public.guard_trade_product();
-- Deleting a moderated account must not leave an ownerless public storefront behind.
CREATE FUNCTION public.remove_deleted_seller_store() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 DELETE FROM public.trade_vendors WHERE user_id=OLD.id;
 RETURN OLD;
END;
$$;
REVOKE ALL ON FUNCTION public.remove_deleted_seller_store() FROM PUBLIC;
CREATE TRIGGER remove_deleted_seller_store BEFORE DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.remove_deleted_seller_store();
COMMIT;
