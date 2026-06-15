-- 035_create_catalyst_fellows.sql
-- AgriPro Catalyst Fellows: the working team behind the fellowship programmes
-- (28 fellows incl. the fellowship director). Each fellow record is pre-created
-- by an admin with name + email, then "claimed" by the fellow when they log in
-- with that email — linking the record to their auth user (and therefore their
-- Connect profile and Knowledge Hub identity).

CREATE TABLE IF NOT EXISTS public.catalyst_fellows (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  slug                 TEXT NOT NULL UNIQUE,
  email                TEXT NOT NULL UNIQUE,
  full_name            TEXT NOT NULL,
  designation          TEXT NOT NULL DEFAULT 'fellow' CHECK (designation IN ('fellow','director')),
  role_in_agripro      TEXT,
  bio                  TEXT,
  expertise            TEXT[] DEFAULT '{}',
  photo_url            TEXT,
  linkedin_url         TEXT,
  twitter_url          TEXT,
  website_url          TEXT,
  country              TEXT,
  city                 TEXT,
  has_business         BOOLEAN DEFAULT FALSE,
  business_name        TEXT,
  business_description TEXT,
  business_sector      TEXT,
  business_stage       TEXT,
  business_website     TEXT,
  status               TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','alumni','inactive')),
  is_public            BOOLEAN DEFAULT TRUE,
  admin_notes          TEXT,
  claimed_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalyst_fellows_status ON public.catalyst_fellows(status);
CREATE INDEX IF NOT EXISTS idx_catalyst_fellows_user   ON public.catalyst_fellows(user_id);
CREATE INDEX IF NOT EXISTS idx_catalyst_fellows_email  ON public.catalyst_fellows(lower(email));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.catalyst_fellows_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_catalyst_fellows_updated_at ON public.catalyst_fellows;
CREATE TRIGGER trg_catalyst_fellows_updated_at
  BEFORE UPDATE ON public.catalyst_fellows
  FOR EACH ROW EXECUTE FUNCTION public.catalyst_fellows_set_updated_at();

-- Admin check (admin_users is the same table the middleware uses)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    lower(coalesce(auth.jwt()->>'email','')) = 'edison@agriprohub.com'
    OR EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE lower(email) = lower(coalesce(auth.jwt()->>'email',''))
        AND coalesce(is_active, true)
    );
$$;

-- Claim flow: a logged-in user whose email matches an unclaimed fellow record
-- links it to their auth account. Idempotent — returns the row if already claimed
-- by the same user, nothing if the email isn't on the roster.
CREATE OR REPLACE FUNCTION public.claim_catalyst_fellow_profile()
RETURNS SETOF public.catalyst_fellows
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.catalyst_fellows
  SET user_id    = auth.uid(),
      claimed_at = COALESCE(claimed_at, NOW())
  WHERE lower(email) = lower(coalesce(auth.jwt()->>'email',''))
    AND (user_id IS NULL OR user_id = auth.uid())
  RETURNING *;
END;
$$;

-- Public directory view: excludes email, phone-free by design, excludes admin_notes.
-- Hidden or deactivated fellows never appear.
CREATE OR REPLACE VIEW public.catalyst_fellows_directory AS
SELECT
  id, slug, user_id, full_name, designation, role_in_agripro, bio, expertise,
  photo_url, linkedin_url, twitter_url, website_url, country, city,
  has_business, business_name, business_description, business_sector,
  business_stage, business_website, status, created_at
FROM public.catalyst_fellows
WHERE is_public AND status <> 'inactive';

GRANT SELECT ON public.catalyst_fellows_directory TO anon, authenticated;

-- RLS on the base table
ALTER TABLE public.catalyst_fellows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fellows_select_own_or_admin" ON public.catalyst_fellows;
CREATE POLICY "fellows_select_own_or_admin" ON public.catalyst_fellows
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR lower(email) = lower(coalesce(auth.jwt()->>'email',''))
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS "fellows_update_own_or_admin" ON public.catalyst_fellows;
CREATE POLICY "fellows_update_own_or_admin" ON public.catalyst_fellows
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_user())
  WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "fellows_insert_admin" ON public.catalyst_fellows;
CREATE POLICY "fellows_insert_admin" ON public.catalyst_fellows
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "fellows_delete_admin" ON public.catalyst_fellows;
CREATE POLICY "fellows_delete_admin" ON public.catalyst_fellows
  FOR DELETE TO authenticated
  USING (public.is_admin_user());
