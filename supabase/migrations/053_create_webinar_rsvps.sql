-- Webinar RSVP registrations (internal form — meeting links stay admin-only)
CREATE TABLE IF NOT EXISTS public.catalyst_w_webinar_rsvps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id      UUID NOT NULL REFERENCES public.catalyst_w_webinars(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  country         TEXT,
  organisation    TEXT,
  role_title      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (webinar_id, email)
);

CREATE INDEX IF NOT EXISTS catalyst_w_webinar_rsvps_webinar_idx
  ON public.catalyst_w_webinar_rsvps(webinar_id);

CREATE INDEX IF NOT EXISTS catalyst_w_webinar_rsvps_created_at_idx
  ON public.catalyst_w_webinar_rsvps(created_at DESC);

ALTER TABLE public.catalyst_w_webinar_rsvps ENABLE ROW LEVEL SECURITY;

-- No public read; inserts go through API with service role

COMMENT ON COLUMN public.catalyst_w_webinars.registration_url IS
  'Internal meeting/join link for admins — not shown publicly; share with RSVPs manually or via follow-up email';
