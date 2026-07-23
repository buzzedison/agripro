-- 050_add_donation_campaign.sql
-- The `donations` table (donations.sql) was built for one cause (Knowledge
-- Hub). Adding `campaign` so the same Paystack pipeline can serve multiple
-- causes — starting with Catalyst W + the Africa Food Futures Summit —
-- without duplicating the initialize/verify routes or the donations table.

ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS campaign TEXT NOT NULL DEFAULT 'knowledge_hub';

CREATE INDEX IF NOT EXISTS idx_donations_campaign ON public.donations(campaign);
