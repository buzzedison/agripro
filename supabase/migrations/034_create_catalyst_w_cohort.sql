-- 034_create_catalyst_w_cohort.sql
-- Cohort management for Women Catalyst Fellowship

CREATE TABLE IF NOT EXISTS public.catalyst_w_cohorts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  cohort_number INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','completed','archived')),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  total_weeks   INTEGER NOT NULL DEFAULT 10,
  description   TEXT,
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.catalyst_w_fellows (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id                UUID NOT NULL REFERENCES public.catalyst_w_cohorts(id) ON DELETE CASCADE,
  application_id           UUID REFERENCES public.catalyst_w_fellowship_applications(id) ON DELETE SET NULL,
  full_name                TEXT NOT NULL,
  email                    TEXT NOT NULL,
  phone                    TEXT,
  country                  TEXT,
  region                   TEXT,
  role                     TEXT NOT NULL,
  linkedin_url             TEXT,
  status                   TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','on_leave','dropped_out','graduated','removed')),
  onboarding_complete      BOOLEAN DEFAULT FALSE,
  bio                      TEXT,
  timezone                 TEXT,
  tags                     TEXT[] DEFAULT '{}',
  admin_notes              TEXT,
  total_sessions_attended  INTEGER DEFAULT 0,
  attendance_rate          NUMERIC(5,2) DEFAULT 0,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (cohort_id, email)
);

CREATE TABLE IF NOT EXISTS public.catalyst_w_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id        UUID NOT NULL REFERENCES public.catalyst_w_cohorts(id) ON DELETE CASCADE,
  week_number      INTEGER NOT NULL CHECK (week_number >= 1),
  session_number   INTEGER NOT NULL DEFAULT 1,
  title            TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'workshop' CHECK (type IN ('workshop','mentorship_call','guest_speaker','networking','check_in','masterclass','group_work','office_hours')),
  scheduled_date   DATE,
  scheduled_time   TIME,
  duration_minutes INTEGER DEFAULT 90,
  timezone         TEXT DEFAULT 'Africa/Lagos',
  description      TEXT,
  facilitator      TEXT,
  facilitator_org  TEXT,
  recording_url    TEXT,
  materials_url    TEXT,
  notes            TEXT,
  status           TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','completed','cancelled','postponed')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.catalyst_w_attendance (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES public.catalyst_w_sessions(id) ON DELETE CASCADE,
  fellow_id    UUID NOT NULL REFERENCES public.catalyst_w_fellows(id) ON DELETE CASCADE,
  cohort_id    UUID NOT NULL REFERENCES public.catalyst_w_cohorts(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present','excused','late')),
  notes        TEXT,
  marked_by    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, fellow_id)
);

CREATE TABLE IF NOT EXISTS public.catalyst_w_announcements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id        UUID NOT NULL REFERENCES public.catalyst_w_cohorts(id) ON DELETE CASCADE,
  subject          TEXT NOT NULL,
  body_html        TEXT NOT NULL,
  audience         TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all','role','region')),
  audience_filter  JSONB DEFAULT '{}'::jsonb,
  recipient_count  INTEGER DEFAULT 0,
  sent_by          TEXT NOT NULL,
  sent_at          TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cw_fellows_cohort    ON public.catalyst_w_fellows(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cw_fellows_status    ON public.catalyst_w_fellows(status);
CREATE INDEX IF NOT EXISTS idx_cw_sessions_cohort   ON public.catalyst_w_sessions(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cw_sessions_week     ON public.catalyst_w_sessions(cohort_id, week_number);
CREATE INDEX IF NOT EXISTS idx_cw_attendance_sess   ON public.catalyst_w_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_cw_attendance_fellow ON public.catalyst_w_attendance(fellow_id);

ALTER TABLE public.catalyst_w_cohorts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalyst_w_fellows      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalyst_w_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalyst_w_attendance   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalyst_w_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_cohorts"       ON public.catalyst_w_cohorts       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_fellows"       ON public.catalyst_w_fellows        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_sessions"      ON public.catalyst_w_sessions       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_attendance"    ON public.catalyst_w_attendance      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_announcements" ON public.catalyst_w_announcements   FOR ALL TO authenticated USING (true) WITH CHECK (true);
