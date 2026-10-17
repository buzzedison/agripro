-- Run after 062. Catalyst W applicant clean-up and selection: duplicates/exclusions,
-- completion reminders, business verification, interviews and scorecards.
-- Also closes the original policies that let any signed-in member read and edit applications.
BEGIN;

-- Applications hold personal data: only admins may read or change them directly.
-- (The public form and admin APIs use the service role, which bypasses RLS.)
DROP POLICY IF EXISTS "Authenticated users can view catalyst submissions" ON public.catalyst_submissions;
DROP POLICY IF EXISTS "Authenticated users can update catalyst submissions" ON public.catalyst_submissions;
DROP POLICY IF EXISTS catalyst_submissions_admin_read ON public.catalyst_submissions;
DROP POLICY IF EXISTS catalyst_submissions_admin_update ON public.catalyst_submissions;
CREATE POLICY catalyst_submissions_admin_read ON public.catalyst_submissions FOR SELECT TO authenticated USING (public.is_admin_user());
CREATE POLICY catalyst_submissions_admin_update ON public.catalyst_submissions FOR UPDATE TO authenticated
  USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- Pipeline gains a shortlist stage between review and interview.
ALTER TABLE public.catalyst_submissions DROP CONSTRAINT IF EXISTS catalyst_submissions_status_check;
ALTER TABLE public.catalyst_submissions ADD CONSTRAINT catalyst_submissions_status_check
  CHECK (status IN ('new','reviewed','shortlisted','interviewed','accepted','paid','waitlisted','rejected'));

-- Clean-up: records are never deleted here, only marked, so decisions stay auditable.
ALTER TABLE public.catalyst_submissions
  ADD COLUMN IF NOT EXISTS duplicate_of uuid REFERENCES public.catalyst_submissions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS excluded_reason text,
  ADD COLUMN IF NOT EXISTS last_chased_at timestamptz,
  ADD COLUMN IF NOT EXISTS chase_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS business_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS business_verification_notes text,
  ADD COLUMN IF NOT EXISTS business_verified_by text,
  ADD COLUMN IF NOT EXISTS business_verified_at timestamptz;
ALTER TABLE public.catalyst_submissions DROP CONSTRAINT IF EXISTS catalyst_submissions_excluded_reason_check;
ALTER TABLE public.catalyst_submissions ADD CONSTRAINT catalyst_submissions_excluded_reason_check
  CHECK (excluded_reason IS NULL OR excluded_reason IN ('duplicate','test','ineligible','withdrawn','other'));
ALTER TABLE public.catalyst_submissions DROP CONSTRAINT IF EXISTS catalyst_submissions_not_own_duplicate;
ALTER TABLE public.catalyst_submissions ADD CONSTRAINT catalyst_submissions_not_own_duplicate
  CHECK (duplicate_of IS NULL OR duplicate_of <> id);
CREATE INDEX IF NOT EXISTS catalyst_submissions_email_lower_idx ON public.catalyst_submissions(lower(email));

-- Selection questions, editable by the selection team; weights let core criteria count more.
CREATE TABLE IF NOT EXISTS public.catalyst_selection_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_year integer NOT NULL DEFAULT 2026,
  position integer NOT NULL DEFAULT 0,
  prompt text NOT NULL CHECK (length(trim(prompt)) BETWEEN 3 AND 300),
  guidance text CHECK (guidance IS NULL OR length(guidance) <= 1000),
  weight numeric(4,2) NOT NULL DEFAULT 1 CHECK (weight > 0 AND weight <= 5),
  max_score integer NOT NULL DEFAULT 5 CHECK (max_score BETWEEN 2 AND 10),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.catalyst_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.catalyst_submissions(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30 CHECK (duration_minutes BETWEEN 10 AND 180),
  interviewer_email text NOT NULL,
  meeting_link text CHECK (meeting_link IS NULL OR meeting_link ~* '^https?://'),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','no_show','cancelled')),
  notes text,
  invite_sent_at timestamptz,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS catalyst_interviews_submission_idx ON public.catalyst_interviews(submission_id);
CREATE INDEX IF NOT EXISTS catalyst_interviews_scheduled_idx ON public.catalyst_interviews(scheduled_at);

-- One scorecard per interviewer per applicant; scores is {question_id: score}.
CREATE TABLE IF NOT EXISTS public.catalyst_scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.catalyst_submissions(id) ON DELETE CASCADE,
  interviewer_email text NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(scores) = 'object'),
  weighted_score numeric(5,2) CHECK (weighted_score IS NULL OR weighted_score BETWEEN 0 AND 100),
  recommendation text CHECK (recommendation IS NULL OR recommendation IN ('strong_yes','yes','maybe','no')),
  comments text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (submission_id, interviewer_email)
);
CREATE INDEX IF NOT EXISTS catalyst_scorecards_submission_idx ON public.catalyst_scorecards(submission_id);

ALTER TABLE public.catalyst_selection_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalyst_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalyst_scorecards ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.catalyst_selection_questions, public.catalyst_interviews, public.catalyst_scorecards FROM anon;
DROP POLICY IF EXISTS catalyst_questions_admin ON public.catalyst_selection_questions;
DROP POLICY IF EXISTS catalyst_interviews_admin ON public.catalyst_interviews;
DROP POLICY IF EXISTS catalyst_scorecards_admin ON public.catalyst_scorecards;
CREATE POLICY catalyst_questions_admin ON public.catalyst_selection_questions FOR ALL TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY catalyst_interviews_admin ON public.catalyst_interviews FOR ALL TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY catalyst_scorecards_admin ON public.catalyst_scorecards FOR ALL TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- Starter questions for the 2026 cohort (only when none exist yet); edit them on the Selection page.
INSERT INTO public.catalyst_selection_questions(cohort_year,position,prompt,guidance,weight)
SELECT 2026,q.pos,q.prompt,q.guidance,q.weight FROM (VALUES
  (1,'Is the business real and trading?','Evidence of sales, customers, production or a registered business. Confirm during the interview and record it under Business verification.',2.0),
  (2,'How clearly does the founder understand the main constraint?','Can the founder name the specific problem holding the business back, with numbers or examples?',1.5),
  (3,'Traction and growth potential','Revenue, volumes, customers or partnerships, and how far the business could go with support.',1.5),
  (4,'Fit with what Catalyst W offers','Would our partners, market access, finance readiness and peer support move this business forward?',1.0),
  (5,'Commitment and availability','Can the founder attend sessions and country gatherings for the full programme, with workable connectivity?',1.0),
  (6,'Leadership and coachability','Openness to feedback, ability to lead a team and to act on advice.',1.0)
) AS q(pos,prompt,guidance,weight)
WHERE NOT EXISTS (SELECT 1 FROM public.catalyst_selection_questions WHERE cohort_year=2026);

COMMIT;
