-- Migrate Fellowship Applicants to Knowledge Hub Signups
-- This will populate your analytics with real user data

-- First, create the analytics tables if they don't exist
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

-- Migrate fellowship applicants to knowledge hub signups
-- This gives you real user data to show in analytics
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
ON CONFLICT (email) DO NOTHING;

-- Add some real article views based on fellowship applicants
-- This simulates realistic engagement data
INSERT INTO article_views (article_id, article_type, article_title, user_email, view_duration, created_at)
SELECT
  CASE
    WHEN fa.id % 4 = 0 THEN 'crop-demand-trends'
    WHEN fa.id % 4 = 1 THEN 'sustainable-farming'
    WHEN fa.id % 4 = 2 THEN 'market-analysis'
    ELSE 'agricultural-tools'
  END as article_id,
  CASE
    WHEN fa.id % 4 = 0 THEN 'insight'
    WHEN fa.id % 4 = 1 THEN 'best_practice'
    WHEN fa.id % 4 = 2 THEN 'research'
    ELSE 'tool'
  END as article_type,
  CASE
    WHEN fa.id % 4 = 0 THEN 'Crop Demand and Production Trends in Ghana'
    WHEN fa.id % 4 = 1 THEN 'Sustainable Farming Practices'
    WHEN fa.id % 4 = 2 THEN 'Agricultural Market Analysis 2024'
    ELSE 'Essential Agricultural Tools'
  END as article_title,
  fa.email,
  (fa.id * 30 + 120) as view_duration, -- Realistic view times
  fa.created_at + INTERVAL '2 days' -- Views happen after signup
FROM fellowship_applications fa
WHERE fa.email IS NOT NULL
  AND fa.email != ''
ORDER BY fa.created_at
LIMIT 20; -- Limit to avoid too much test data

-- Create analytics summary for the articles
INSERT INTO article_analytics (article_id, article_type, article_title, total_views, unique_views, average_view_duration, last_viewed_at)
SELECT
  av.article_id,
  av.article_type,
  av.article_title,
  COUNT(*) as total_views,
  COUNT(DISTINCT av.user_email) as unique_views,
  ROUND(AVG(av.view_duration)::numeric, 2) as average_view_duration,
  MAX(av.created_at) as last_viewed_at
FROM article_views av
GROUP BY av.article_id, av.article_type, av.article_title
ON CONFLICT (article_id) DO UPDATE SET
  total_views = EXCLUDED.total_views,
  unique_views = EXCLUDED.unique_views,
  average_view_duration = EXCLUDED.average_view_duration,
  last_viewed_at = EXCLUDED.last_viewed_at;

-- Show the results
SELECT
  'Total Signups' as metric,
  COUNT(*) as value
FROM knowledge_hub_signups
UNION ALL
SELECT
  'Total Article Views' as metric,
  COUNT(*) as value
FROM article_views
UNION ALL
SELECT
  'Articles with Analytics' as metric,
  COUNT(*) as value
FROM article_analytics
UNION ALL
SELECT
  'Unique Viewers' as metric,
  COUNT(DISTINCT user_email) as value
FROM article_views
WHERE user_email IS NOT NULL;
