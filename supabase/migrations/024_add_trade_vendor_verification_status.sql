ALTER TABLE public.trade_vendors
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_submitted'
    CHECK (verification_status IN ('not_submitted', 'pending_review', 'approved', 'rejected'));

UPDATE public.trade_vendors
SET verification_status = CASE
    WHEN verification_level IN ('verified', 'premium') THEN 'approved'
    WHEN verification_submitted_at IS NOT NULL THEN 'pending_review'
    ELSE 'not_submitted'
END
WHERE verification_status IS NULL;
