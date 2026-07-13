-- Operational tracking for Catalyst W accelerator participants/founders.
-- Fellows manage the cohort; participants are the women agribusiness owners
-- whose constraints, partner needs, support requirements, and next actions
-- must be tracked through the 12-week accelerator.

ALTER TABLE public.catalyst_submissions
  ADD COLUMN IF NOT EXISTS cohort_year INTEGER DEFAULT 2026,
  ADD COLUMN IF NOT EXISTS participant_status TEXT DEFAULT 'applicant',
  ADD COLUMN IF NOT EXISTS accelerator_track TEXT,
  ADD COLUMN IF NOT EXISTS primary_constraint TEXT,
  ADD COLUMN IF NOT EXISTS support_needed TEXT,
  ADD COLUMN IF NOT EXISTS support_priority TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS partner_needs TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assigned_fellow_id UUID REFERENCES public.catalyst_fellows(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS readiness_stage TEXT DEFAULT 'diagnosis',
  ADD COLUMN IF NOT EXISTS diagnostic_notes TEXT,
  ADD COLUMN IF NOT EXISTS partner_match_notes TEXT,
  ADD COLUMN IF NOT EXISTS next_action TEXT,
  ADD COLUMN IF NOT EXISTS next_action_due DATE,
  ADD COLUMN IF NOT EXISTS selected_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'catalyst_submissions_participant_status_check'
  ) THEN
    ALTER TABLE public.catalyst_submissions
      ADD CONSTRAINT catalyst_submissions_participant_status_check
      CHECK (participant_status IN ('applicant','selected','onboarding','active','deferred','alumni','dropped'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'catalyst_submissions_support_priority_check'
  ) THEN
    ALTER TABLE public.catalyst_submissions
      ADD CONSTRAINT catalyst_submissions_support_priority_check
      CHECK (support_priority IN ('low','medium','high','critical'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'catalyst_submissions_readiness_stage_check'
  ) THEN
    ALTER TABLE public.catalyst_submissions
      ADD CONSTRAINT catalyst_submissions_readiness_stage_check
      CHECK (readiness_stage IN ('diagnosis','data_room','partner_matching','deal_room','summit_ready','closed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS catalyst_submissions_cohort_year_idx
  ON public.catalyst_submissions(cohort_year);

CREATE INDEX IF NOT EXISTS catalyst_submissions_participant_status_idx
  ON public.catalyst_submissions(participant_status);

CREATE INDEX IF NOT EXISTS catalyst_submissions_support_priority_idx
  ON public.catalyst_submissions(support_priority);

CREATE INDEX IF NOT EXISTS catalyst_submissions_assigned_fellow_idx
  ON public.catalyst_submissions(assigned_fellow_id);
