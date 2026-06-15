-- 037_add_fellow_social_links.sql
-- More social platforms for Catalyst Fellow profiles (portal + public pages).

ALTER TABLE public.catalyst_fellows ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.catalyst_fellows ADD COLUMN IF NOT EXISTS facebook_url  TEXT;
ALTER TABLE public.catalyst_fellows ADD COLUMN IF NOT EXISTS youtube_url   TEXT;
ALTER TABLE public.catalyst_fellows ADD COLUMN IF NOT EXISTS tiktok_url    TEXT;

-- Recreate the public directory view to expose the new columns
DROP VIEW IF EXISTS public.catalyst_fellows_directory;
CREATE VIEW public.catalyst_fellows_directory AS
SELECT
  id, slug, user_id, full_name, designation, role_in_agripro, bio, expertise,
  photo_url, linkedin_url, twitter_url, website_url,
  instagram_url, facebook_url, youtube_url, tiktok_url,
  country, city,
  has_business, business_name, business_description, business_sector,
  business_stage, business_website, status, created_at
FROM public.catalyst_fellows
WHERE is_public AND status <> 'inactive';

GRANT SELECT ON public.catalyst_fellows_directory TO anon, authenticated;
