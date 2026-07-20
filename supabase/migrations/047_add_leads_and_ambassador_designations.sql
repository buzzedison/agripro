-- 047_add_leads_and_ambassador_designations.sql
-- Regional Lead (geography-spanning a whole region) wasn't working, so it's
-- being replaced going forward by:
--   * Three functional leads reporting to the Director/Deputy: Programme
--     Delivery Lead, Growth & Engagement Lead, Partnerships Lead.
--   * Country Ambassadors — narrower scope (one country, not a whole region),
--     reporting directly to the Director/Deputy, no regional layer between.
--     Capped at 10 ambassadors per country (enforced below via trigger, not
--     just in the admin UI, so the cap holds regardless of entry point).
--
-- Existing 'regional_lead' data (that value lives in the fellowship
-- *application* role field, not this designation column — it was never a
-- valid catalyst_fellows.designation) is untouched; no migration needed there.
-- The `country` column already exists on catalyst_fellows (migration 035),
-- reused here for the ambassador's assigned country.

ALTER TABLE public.catalyst_fellows
  DROP CONSTRAINT IF EXISTS catalyst_fellows_designation_check;

ALTER TABLE public.catalyst_fellows
  ADD CONSTRAINT catalyst_fellows_designation_check
  CHECK (designation IN (
    'fellow', 'director', 'deputy_director',
    'programme_delivery_lead', 'growth_engagement_lead', 'partnerships_lead',
    'ambassador'
  ));

CREATE OR REPLACE FUNCTION public.enforce_ambassador_country_cap()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  IF NEW.designation <> 'ambassador' THEN
    RETURN NEW;
  END IF;

  IF NEW.country IS NULL OR trim(NEW.country) = '' THEN
    RAISE EXCEPTION 'An ambassador must have a country set';
  END IF;

  SELECT COUNT(*) INTO current_count
  FROM public.catalyst_fellows
  WHERE designation = 'ambassador'
    AND lower(country) = lower(NEW.country)
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF current_count >= 10 THEN
    RAISE EXCEPTION 'Country % already has 10 ambassadors (the maximum)', NEW.country;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_ambassador_country_cap ON public.catalyst_fellows;
CREATE TRIGGER trg_enforce_ambassador_country_cap
  BEFORE INSERT OR UPDATE ON public.catalyst_fellows
  FOR EACH ROW EXECUTE FUNCTION public.enforce_ambassador_country_cap();
