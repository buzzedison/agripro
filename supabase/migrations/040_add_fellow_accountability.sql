-- 040_add_fellow_accountability.sql
-- Fellow accountability system: each fellow commits a weekly-hours target; after a
-- one-week grace period (from commitment_started_at) an admin rates their
-- performance. Inactive fellows are pruned by setting status = 'inactive'
-- (handled through the existing status column — no schema change needed for that).
--
-- These columns are INTERNAL: the public directory view (catalyst_fellows_directory)
-- does not select them, so ratings never leak to the public site.

ALTER TABLE public.catalyst_fellows
  ADD COLUMN IF NOT EXISTS weekly_hours_committed INTEGER,
  ADD COLUMN IF NOT EXISTS commitment_started_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS performance_rating     TEXT NOT NULL DEFAULT 'unrated',
  ADD COLUMN IF NOT EXISTS rating_updated_at      TIMESTAMPTZ;

ALTER TABLE public.catalyst_fellows
  DROP CONSTRAINT IF EXISTS catalyst_fellows_performance_rating_check;

ALTER TABLE public.catalyst_fellows
  ADD CONSTRAINT catalyst_fellows_performance_rating_check
  CHECK (performance_rating IN ('unrated', 'on_track', 'at_risk', 'underperforming'));
