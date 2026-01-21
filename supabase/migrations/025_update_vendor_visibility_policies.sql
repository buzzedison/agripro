-- Ensure only fully approved/verified vendors are public
DROP POLICY IF EXISTS "Approved vendors are viewable by everyone" ON public.trade_vendors;

CREATE POLICY "Approved vendors are viewable by everyone"
ON public.trade_vendors
FOR SELECT
USING (
  status = 'approved'
  AND verification_status = 'approved'
);

-- Update trade_products visibility to match verification gating
DROP POLICY IF EXISTS "Products from approved vendors are viewable" ON public.trade_products;

CREATE POLICY "Products from approved vendors are viewable"
ON public.trade_products
FOR SELECT
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.trade_vendors v
    WHERE v.id = vendor_id
      AND v.status = 'approved'
      AND v.verification_status = 'approved'
  )
);
