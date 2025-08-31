-- Make existing signups appear recent (within 30 days) for dashboard testing

-- Update all existing signups to have recent timestamps
UPDATE knowledge_hub_signups
SET created_at = CURRENT_TIMESTAMP - INTERVAL '1 day' * (RANDOM() * 30)
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';

-- Show the updated signups
SELECT
  email,
  signup_source,
  created_at,
  CURRENT_TIMESTAMP - created_at as age
FROM knowledge_hub_signups
ORDER BY created_at DESC
LIMIT 10;

-- Show count of signups within 30 days
SELECT
  'Signups in last 30 days' as status,
  COUNT(*) as count
FROM knowledge_hub_signups
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days';
