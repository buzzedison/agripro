-- 042_add_submission_referral_source.sql
-- Track where accelerator applicants heard about Catalyst W ("How did you hear
-- about us?"). referral_source holds the chosen option; referral_detail captures
-- the free-text when they pick "Other".

ALTER TABLE public.catalyst_submissions
  ADD COLUMN IF NOT EXISTS referral_source TEXT,
  ADD COLUMN IF NOT EXISTS referral_detail TEXT;

CREATE INDEX IF NOT EXISTS idx_catalyst_submissions_referral
  ON public.catalyst_submissions(referral_source);
