-- Public webinars & events for Catalyst W (Woman Year page)
CREATE TABLE IF NOT EXISTS public.catalyst_w_webinars (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT NOT NULL UNIQUE,
  title               TEXT NOT NULL,
  subtitle            TEXT,
  summary             TEXT,
  body_content        TEXT,
  starts_at           TIMESTAMPTZ NOT NULL,
  timezone            TEXT NOT NULL DEFAULT 'Africa/Lagos',
  duration_minutes    INTEGER NOT NULL DEFAULT 75,
  format              TEXT NOT NULL DEFAULT 'online' CHECK (format IN ('online', 'in_person', 'hybrid')),
  venue               TEXT,
  cost                TEXT NOT NULL DEFAULT 'Free',
  registration_url    TEXT,
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  featured            BOOLEAN NOT NULL DEFAULT FALSE,
  meta_description    TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS catalyst_w_webinars_status_idx ON public.catalyst_w_webinars(status);
CREATE INDEX IF NOT EXISTS catalyst_w_webinars_starts_at_idx ON public.catalyst_w_webinars(starts_at DESC);
CREATE INDEX IF NOT EXISTS catalyst_w_webinars_featured_idx ON public.catalyst_w_webinars(featured) WHERE featured = TRUE;

ALTER TABLE public.catalyst_w_webinars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published catalyst w webinars" ON public.catalyst_w_webinars;
CREATE POLICY "Anyone can view published catalyst w webinars"
  ON public.catalyst_w_webinars FOR SELECT TO anon, authenticated
  USING (status = 'published');
