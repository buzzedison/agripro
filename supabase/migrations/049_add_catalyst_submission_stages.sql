-- Extend catalyst_submissions status pipeline with interviewed and paid
ALTER TABLE public.catalyst_submissions
  DROP CONSTRAINT IF EXISTS catalyst_submissions_status_check;

ALTER TABLE public.catalyst_submissions
  ADD CONSTRAINT catalyst_submissions_status_check
  CHECK (status IN ('new', 'reviewed', 'interviewed', 'accepted', 'paid', 'waitlisted', 'rejected'));
