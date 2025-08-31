-- Migrate Supabase Auth Users to Knowledge Hub Signups
-- This adds real registered users to your analytics

-- Create analytics tables if they don't exist
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

CREATE TABLE IF NOT EXISTS article_views (
  id SERIAL PRIMARY KEY,
  article_id VARCHAR(255) NOT NULL,
  article_type VARCHAR(50) NOT NULL,
  article_title VARCHAR(500),
  user_email VARCHAR(255),
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  view_duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_analytics (
  id SERIAL PRIMARY KEY,
  article_id VARCHAR(255) NOT NULL UNIQUE,
  article_type VARCHAR(50) NOT NULL,
  article_title VARCHAR(500),
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  average_view_duration DECIMAL(10,3) DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_hub_signups_created_at ON knowledge_hub_signups(created_at);
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_created_at ON article_views(created_at);
CREATE INDEX IF NOT EXISTS idx_article_analytics_article_id ON article_analytics(article_id);

-- Note: Supabase Auth users are in auth.users table which is not directly accessible
-- We'll use the approach of adding users as they sign up through the newsletter
-- or when they register for fellowship

-- For now, let's migrate any existing fellowship applicants that haven't been added yet
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

-- Show current analytics data
SELECT
  'Current Signups' as metric,
  COUNT(*) as value
FROM knowledge_hub_signups
UNION ALL
SELECT
  'Current Article Views' as metric,
  COUNT(*) as value
FROM article_views
UNION ALL
SELECT
  'Current Articles with Analytics' as metric,
  COUNT(*) as value
FROM article_analytics
UNION ALL
SELECT
  'Current Unique Viewers' as metric,
  COUNT(DISTINCT user_email) as value
FROM article_views
WHERE user_email IS NOT NULL;

-- Show recent signups
SELECT
  email,
  first_name,
  last_name,
  signup_source,
  created_at
FROM knowledge_hub_signups
ORDER BY created_at DESC
LIMIT 10;
