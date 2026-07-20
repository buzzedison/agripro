-- Add 'paid' to allowed application statuses
ALTER TABLE public.catalyst_w_fellowship_applications
  DROP CONSTRAINT IF EXISTS catalyst_w_fellowship_applications_status_check;

ALTER TABLE public.catalyst_w_fellowship_applications
  ADD CONSTRAINT catalyst_w_fellowship_applications_status_check
  CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'interviewed', 'accepted', 'paid', 'rejected'));
