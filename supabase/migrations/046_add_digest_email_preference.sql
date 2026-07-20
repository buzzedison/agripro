-- 046_add_digest_email_preference.sql
-- Opt-out flag for the weekly "what you missed" digest email.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS digest_emails_enabled BOOLEAN DEFAULT true;
