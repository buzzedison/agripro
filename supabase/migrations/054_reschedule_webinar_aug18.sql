-- 054_reschedule_webinar_aug18.sql
-- Reschedule "How Women-Led Agribusinesses Can Access Markets, Capital, and
-- Scale Support" from Aug 11 to Aug 18, 2026 — same time (17:00 UTC).

UPDATE public.catalyst_w_webinars
SET starts_at = '2026-08-18T17:00:00+00:00'
WHERE slug = 'how-women-led-agribusinesses-can-access-markets-capital-and-scale-support'
  AND starts_at = '2026-08-11T17:00:00+00:00';
