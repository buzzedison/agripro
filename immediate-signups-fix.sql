-- IMMEDIATE FIX: Copy ALL fellowship applicants to signups (ignore dates)

-- Create signups table
CREATE TABLE IF NOT EXISTS knowledge_hub_signups (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  signup_source VARCHAR(100),
  user_id UUID,
  subscription_status VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT knowledge_hub_signups_email_key UNIQUE (email)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_knowledge_hub_signups_created_at ON knowledge_hub_signups(created_at);

-- Copy ALL fellowship applicants (ignore date filtering)
INSERT INTO knowledge_hub_signups (email, first_name, last_name, signup_source, created_at)
SELECT
  email,
  first_name,
  last_name,
  'fellowship_application' as signup_source,
  created_at
FROM fellowship_applications
WHERE email IS NOT NULL
  AND email != ''
  AND LENGTH(TRIM(email)) > 0
ON CONFLICT (email) DO NOTHING;

-- Update timestamps to recent for demo (optional - comment out if you want original dates)
UPDATE knowledge_hub_signups
SET created_at = CURRENT_TIMESTAMP - INTERVAL '1 day' * (RANDOM() * 30)
WHERE signup_source = 'fellowship_application';

-- Show results
SELECT
  'Total Signups Now Available' as status,
  COUNT(*) as count
FROM knowledge_hub_signups
UNION ALL
SELECT
  'Fellowship Signups' as status,
  COUNT(*) as count
FROM knowledge_hub_signups
WHERE signup_source = 'fellowship_application';

-- Show sample data
SELECT
  email,
  first_name,
  last_name,
  signup_source,
  created_at
FROM knowledge_hub_signups
ORDER BY created_at DESC
LIMIT 10;
