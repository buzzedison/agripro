-- Add 'pitch' type to aff_submissions
ALTER TABLE public.aff_submissions
  DROP CONSTRAINT IF EXISTS aff_submissions_type_check;

ALTER TABLE public.aff_submissions
  ADD CONSTRAINT aff_submissions_type_check
  CHECK (type IN ('register', 'speaker', 'partner', 'sponsor', 'exhibitor', 'pitch'));
