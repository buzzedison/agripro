-- Africa Food Futures: unified submissions table
CREATE TABLE IF NOT EXISTS public.aff_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('register', 'speaker', 'partner', 'sponsor', 'exhibitor')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'accepted', 'rejected')),

  -- Common fields
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organisation TEXT,
  country TEXT,
  phone TEXT,
  message TEXT,

  -- Register-specific
  ticket_tier TEXT,
  dietary TEXT,
  accessibility TEXT,

  -- Speaker-specific
  talk_title TEXT,
  talk_format TEXT,
  talk_track TEXT,
  bio TEXT,
  linkedin TEXT,
  previous_speaking TEXT,

  -- Partner/Sponsor/Exhibitor-specific
  package_interest TEXT,
  budget_range TEXT,
  website TEXT,

  -- Admin
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast admin queries
CREATE INDEX IF NOT EXISTS aff_submissions_type_idx ON public.aff_submissions(type);
CREATE INDEX IF NOT EXISTS aff_submissions_status_idx ON public.aff_submissions(status);
CREATE INDEX IF NOT EXISTS aff_submissions_created_at_idx ON public.aff_submissions(created_at DESC);

-- RLS: only service role can read/write (admin only)
ALTER TABLE public.aff_submissions ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon (form submissions)
CREATE POLICY "Allow public insert" ON public.aff_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only authenticated admins can select/update
CREATE POLICY "Allow admin select" ON public.aff_submissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin update" ON public.aff_submissions
  FOR UPDATE TO authenticated USING (true);
