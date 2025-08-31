-- Fix Signups - Copy from fellowship_applications to knowledge_hub_signups
-- This will populate your dashboard with the signups you see in Supabase

-- Create the signups table if it doesn't exist
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

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_hub_signups_created_at ON knowledge_hub_signups(created_at);

-- Copy fellowship applicants to signups (only those with emails)
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
  AND email NOT IN (SELECT email FROM knowledge_hub_signups)
ON CONFLICT (email) DO NOTHING;

-- Show the results
SELECT
  'Signups Copied' as status,
  COUNT(*) as count
FROM knowledge_hub_signups
WHERE signup_source = 'fellowship_application';

-- Also show total signups
SELECT
  'Total Signups' as status,
  COUNT(*) as count
FROM knowledge_hub_signups;

-- Show recent signups
SELECT
  email,
  first_name,
  last_name,
  signup_source,
  created_at
FROM knowledge_hub_signups
ORDER BY created_at DESC
LIMIT 5;
