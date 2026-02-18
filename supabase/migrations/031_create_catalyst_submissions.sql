-- Catalyst W programme submissions
CREATE TABLE IF NOT EXISTS public.catalyst_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('apply', 'prospectus', 'plan')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'accepted', 'rejected', 'waitlisted')),

  -- Common
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT,
  phone TEXT,

  -- Apply-specific
  business_name TEXT,
  business_stage TEXT,
  sector TEXT,
  plan_tier TEXT,           -- which pricing plan they selected (if came from pricing)
  why_apply TEXT,
  revenue TEXT,
  team_size TEXT,
  website TEXT,

  -- Prospectus-specific
  organisation TEXT,
  role TEXT,
  interest TEXT,            -- why they want the prospectus

  -- Admin
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS catalyst_submissions_type_idx ON public.catalyst_submissions(type);
CREATE INDEX IF NOT EXISTS catalyst_submissions_status_idx ON public.catalyst_submissions(status);
CREATE INDEX IF NOT EXISTS catalyst_submissions_created_at_idx ON public.catalyst_submissions(created_at DESC);

-- RLS
ALTER TABLE public.catalyst_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert catalyst submissions"
  ON public.catalyst_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view catalyst submissions"
  ON public.catalyst_submissions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update catalyst submissions"
  ON public.catalyst_submissions FOR UPDATE TO authenticated
  USING (true);
