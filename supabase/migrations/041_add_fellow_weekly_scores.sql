-- 041_add_fellow_weekly_scores.sql
-- Weekly task performance for fellows. Tasks themselves live in Stride; here an
-- admin records, per fellow per week, how many of those tasks were done. Each
-- week yields points that accumulate into a running total, and the completion
-- ratio auto-derives that week's rating. The fellow's overall performance_rating
-- reflects their most recent scored week.
--
-- Internal only — none of this is exposed through the public directory view.

-- Running points total on the fellow (kept in sync by trigger below).
ALTER TABLE public.catalyst_fellows
  ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.catalyst_fellow_weekly_scores (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fellow_id      UUID NOT NULL REFERENCES public.catalyst_fellows(id) ON DELETE CASCADE,
  week_start     DATE NOT NULL,                       -- Monday of the scored week
  tasks_done     INTEGER NOT NULL DEFAULT 0,
  tasks_assigned INTEGER,                             -- from Stride; null = unknown
  points         INTEGER NOT NULL DEFAULT 0,
  rating         TEXT NOT NULL DEFAULT 'unrated'
                   CHECK (rating IN ('unrated','on_track','at_risk','underperforming')),
  note           TEXT,
  recorded_by    UUID,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (fellow_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_cw_weekly_scores_fellow ON public.catalyst_fellow_weekly_scores(fellow_id);
CREATE INDEX IF NOT EXISTS idx_cw_weekly_scores_week   ON public.catalyst_fellow_weekly_scores(week_start);

-- Derive this row's rating from completion ratio, default points to tasks_done.
CREATE OR REPLACE FUNCTION public.catalyst_weekly_score_before()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  IF NEW.points IS NULL THEN
    NEW.points := COALESCE(NEW.tasks_done, 0);
  END IF;
  NEW.rating := CASE
    WHEN NEW.tasks_assigned IS NULL OR NEW.tasks_assigned = 0 THEN 'unrated'
    WHEN NEW.tasks_done::numeric / NEW.tasks_assigned >= 0.8 THEN 'on_track'
    WHEN NEW.tasks_done::numeric / NEW.tasks_assigned >= 0.4 THEN 'at_risk'
    ELSE 'underperforming'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cw_weekly_score_before ON public.catalyst_fellow_weekly_scores;
CREATE TRIGGER trg_cw_weekly_score_before
  BEFORE INSERT OR UPDATE ON public.catalyst_fellow_weekly_scores
  FOR EACH ROW EXECUTE FUNCTION public.catalyst_weekly_score_before();

-- Roll totals + latest rating up onto the parent fellow.
CREATE OR REPLACE FUNCTION public.catalyst_weekly_score_rollup()
RETURNS TRIGGER AS $$
DECLARE
  fid UUID := COALESCE(NEW.fellow_id, OLD.fellow_id);
BEGIN
  UPDATE public.catalyst_fellows f
  SET
    total_points = COALESCE((SELECT SUM(points) FROM public.catalyst_fellow_weekly_scores WHERE fellow_id = fid), 0),
    performance_rating = COALESCE(
      (SELECT rating FROM public.catalyst_fellow_weekly_scores
       WHERE fellow_id = fid ORDER BY week_start DESC LIMIT 1),
      'unrated'
    )
  WHERE f.id = fid;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cw_weekly_score_rollup ON public.catalyst_fellow_weekly_scores;
CREATE TRIGGER trg_cw_weekly_score_rollup
  AFTER INSERT OR UPDATE OR DELETE ON public.catalyst_fellow_weekly_scores
  FOR EACH ROW EXECUTE FUNCTION public.catalyst_weekly_score_rollup();

-- RLS: admins manage everything; a fellow may read their own weekly scores.
ALTER TABLE public.catalyst_fellow_weekly_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "weekly_scores_select_own_or_admin" ON public.catalyst_fellow_weekly_scores;
CREATE POLICY "weekly_scores_select_own_or_admin" ON public.catalyst_fellow_weekly_scores
  FOR SELECT TO authenticated
  USING (
    public.is_admin_user()
    OR EXISTS (
      SELECT 1 FROM public.catalyst_fellows f
      WHERE f.id = fellow_id
        AND (f.user_id = auth.uid() OR lower(f.email) = lower(coalesce(auth.jwt()->>'email','')))
    )
  );

DROP POLICY IF EXISTS "weekly_scores_write_admin" ON public.catalyst_fellow_weekly_scores;
CREATE POLICY "weekly_scores_write_admin" ON public.catalyst_fellow_weekly_scores
  FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());
