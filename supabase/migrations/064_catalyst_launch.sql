-- Run after 063. Catalyst W launch workstreams: scholarships (need assessed separately from
-- admission), offers and payments, partners and budget, country gatherings, founder groups,
-- the founder portal link and launch settings. Admin-only tables; founders reach their own
-- record through a private portal token handled by the server.
BEGIN;

ALTER TABLE public.catalyst_submissions
  ADD COLUMN IF NOT EXISTS portal_token text,
  ADD COLUMN IF NOT EXISTS reserve_rank integer CHECK (reserve_rank IS NULL OR reserve_rank > 0),
  ADD COLUMN IF NOT EXISTS scholarship_invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS welcome_sent_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS catalyst_submissions_portal_token_idx ON public.catalyst_submissions(portal_token) WHERE portal_token IS NOT NULL;
ALTER TABLE public.catalyst_submissions DROP CONSTRAINT IF EXISTS catalyst_submissions_portal_token_len;
ALTER TABLE public.catalyst_submissions ADD CONSTRAINT catalyst_submissions_portal_token_len CHECK (portal_token IS NULL OR length(portal_token) >= 40);

-- Cohort-level numbers the team sets: places by funding type, cohort target, offer window.
CREATE TABLE IF NOT EXISTS public.catalyst_launch_settings (
  cohort_year integer PRIMARY KEY,
  target_cohort_size integer NOT NULL DEFAULT 0 CHECK (target_cohort_size >= 0),
  scholarship_199_places integer NOT NULL DEFAULT 0 CHECK (scholarship_199_places >= 0),
  fully_funded_places integer NOT NULL DEFAULT 0 CHECK (fully_funded_places >= 0),
  standard_fee_usd numeric(8,2) NOT NULL DEFAULT 399 CHECK (standard_fee_usd >= 0),
  offer_response_days integer NOT NULL DEFAULT 5 CHECK (offer_response_days BETWEEN 1 AND 30),
  launch_date date NOT NULL DEFAULT '2026-11-30',
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.catalyst_launch_settings(cohort_year) VALUES (2026) ON CONFLICT DO NOTHING;

-- Scholarships: a founder's financial-need request and the team's separate decision.
CREATE TABLE IF NOT EXISTS public.catalyst_scholarship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL UNIQUE REFERENCES public.catalyst_submissions(id) ON DELETE CASCADE,
  requested text NOT NULL CHECK (requested IN ('fully_funded','scholarship_199')),
  can_contribute_usd numeric(8,2) NOT NULL DEFAULT 0 CHECK (can_contribute_usd BETWEEN 0 AND 10000),
  monthly_revenue_band text CHECK (monthly_revenue_band IS NULL OR length(monthly_revenue_band) <= 60),
  dependants integer CHECK (dependants IS NULL OR dependants BETWEEN 0 AND 30),
  circumstances text NOT NULL CHECK (length(trim(circumstances)) BETWEEN 20 AND 3000),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  decision text NOT NULL DEFAULT 'pending' CHECK (decision IN ('pending','fully_funded','scholarship_199','declined')),
  decision_notes text,
  decided_by text,
  decided_at timestamptz
);

-- Offers: one per founder, with the assigned fee or subsidy and a payment deadline.
CREATE TABLE IF NOT EXISTS public.catalyst_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL UNIQUE REFERENCES public.catalyst_submissions(id) ON DELETE CASCADE,
  plan_label text NOT NULL DEFAULT 'Catalyst W Programme' CHECK (length(plan_label) <= 120),
  fee_usd numeric(8,2) NOT NULL CHECK (fee_usd >= 0 AND fee_usd <= 10000),
  funding text NOT NULL DEFAULT 'standard' CHECK (funding IN ('standard','scholarship_199','fully_funded','custom_subsidy')),
  subsidy_note text CHECK (subsidy_note IS NULL OR length(subsidy_note) <= 500),
  payment_deadline date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','confirmed','declined','expired','withdrawn')),
  sent_at timestamptz,
  responded_at timestamptz,
  decline_reason text CHECK (decline_reason IS NULL OR length(decline_reason) <= 1000),
  confirmed_at timestamptz,
  amount_paid_usd numeric(8,2) CHECK (amount_paid_usd IS NULL OR amount_paid_usd >= 0),
  payment_method text CHECK (payment_method IS NULL OR payment_method IN ('paystack','bank_transfer','mobile_money','waived','other')),
  payment_reference text,
  reminder_sent_at timestamptz,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS catalyst_offers_payment_reference_idx ON public.catalyst_offers(payment_reference) WHERE payment_reference IS NOT NULL;

-- Every payment attempt/confirmation, for reconciliation and to make webhooks idempotent.
CREATE TABLE IF NOT EXISTS public.catalyst_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.catalyst_offers(id) ON DELETE CASCADE,
  reference text NOT NULL UNIQUE,
  provider text NOT NULL DEFAULT 'paystack',
  amount_usd numeric(8,2),
  status text NOT NULL DEFAULT 'initialized' CHECK (status IN ('initialized','success','failed','abandoned')),
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Partners and the launch budget (Faith's budget lines, with what is funded and by whom).
CREATE TABLE IF NOT EXISTS public.catalyst_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_year integer NOT NULL DEFAULT 2026,
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 160),
  kind text NOT NULL DEFAULT 'funder' CHECK (kind IN ('funder','delivery','country_host','recruitment','media','other')),
  status text NOT NULL DEFAULT 'to_contact' CHECK (status IN ('to_contact','asked','in_discussion','confirmed','declined')),
  contact_name text, contact_email text,
  owner text,
  contribution text CHECK (contribution IS NULL OR length(contribution) <= 1000),
  amount_usd numeric(10,2) CHECK (amount_usd IS NULL OR amount_usd >= 0),
  next_step text, next_step_due date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.catalyst_budget_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_year integer NOT NULL DEFAULT 2026,
  item text NOT NULL CHECK (length(trim(item)) BETWEEN 2 AND 160),
  category text,
  budget_usd numeric(10,2) NOT NULL DEFAULT 0 CHECK (budget_usd >= 0),
  funded_usd numeric(10,2) NOT NULL DEFAULT 0 CHECK (funded_usd >= 0),
  essential boolean NOT NULL DEFAULT false,
  partner_id uuid REFERENCES public.catalyst_partners(id) ON DELETE SET NULL,
  funding_source text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Country gatherings: host, local coordinator, capacity and the first useful activity.
CREATE TABLE IF NOT EXISTS public.catalyst_countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_year integer NOT NULL DEFAULT 2026,
  country text NOT NULL,
  priority integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','host_confirmed','ready')),
  host_name text, host_org text, host_contact text,
  host_capacity integer CHECK (host_capacity IS NULL OR host_capacity >= 0),
  coordinator_name text, coordinator_contact text,
  venue text,
  first_activity text,
  first_activity_date date,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_year, country)
);
INSERT INTO public.catalyst_countries(cohort_year,country,priority,active,notes) VALUES
  (2026,'Ghana',1,true,NULL),(2026,'Nigeria',1,true,NULL),(2026,'Zimbabwe',1,true,NULL),(2026,'Kenya',1,true,NULL),
  (2026,'South Africa',2,false,'Add when founder numbers and host capacity support it.')
ON CONFLICT (cohort_year,country) DO NOTHING;

-- Founder groups, each with a venture lead and a contact person.
CREATE TABLE IF NOT EXISTS public.catalyst_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_year integer NOT NULL DEFAULT 2026,
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 80),
  country text,
  venture_lead_name text, venture_lead_email text,
  contact_name text, contact_email text, contact_phone text,
  meeting_rhythm text CHECK (meeting_rhythm IS NULL OR length(meeting_rhythm) <= 300),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_year, name)
);
ALTER TABLE public.catalyst_submissions ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.catalyst_groups(id) ON DELETE SET NULL;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['catalyst_launch_settings','catalyst_scholarship_requests','catalyst_offers','catalyst_payments','catalyst_partners','catalyst_budget_lines','catalyst_countries','catalyst_groups'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user())', t || '_admin', t);
  END LOOP;
END $$;

COMMIT;
