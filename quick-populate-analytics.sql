-- Quick Populate Analytics - Run this in Supabase SQL Editor
-- This will give you immediate data to see in your dashboard

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS knowledge_hub_signups (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  signup_source VARCHAR(100),
  user_id UUID,
  subscription_status VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Clear existing data for clean test
TRUNCATE TABLE knowledge_hub_signups CASCADE;
TRUNCATE TABLE article_views CASCADE;
TRUNCATE TABLE article_analytics CASCADE;

-- Add sample signups (replace with your real users)
INSERT INTO knowledge_hub_signups (email, first_name, last_name, signup_source, created_at)
VALUES
  ('john.doe@example.com', 'John', 'Doe', 'newsletter', NULL),
  ('jane.smith@example.com', 'Jane', 'Smith', 'direct', NULL),
  ('bob.wilson@example.com', 'Bob', 'Wilson', 'fellowship', NULL),
  ('alice.brown@example.com', 'Alice', 'Brown', 'newsletter', NULL),
  ('charlie.davis@example.com', 'Charlie', 'Davis', 'paywall', NULL),
  ('maria.garcia@example.com', 'Maria', 'Garcia', 'newsletter', NULL),
  ('david.chen@example.com', 'David', 'Chen', 'direct', NULL),
  ('sarah.johnson@example.com', 'Sarah', 'Johnson', 'fellowship', NULL);

-- Add sample article views
INSERT INTO article_views (article_id, article_type, article_title, user_email, view_duration, created_at)
VALUES
  ('crop-demand-trends', 'insight', 'Crop Demand and Production Trends in Ghana', 'john.doe@example.com', 245, CURRENT_TIMESTAMP - INTERVAL '2 days'),
  ('crop-demand-trends', 'insight', 'Crop Demand and Production Trends in Ghana', 'jane.smith@example.com', 189, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('crop-demand-trends', 'insight', 'Crop Demand and Production Trends in Ghana', 'bob.wilson@example.com', 312, CURRENT_TIMESTAMP - INTERVAL '6 hours'),
  ('sustainable-farming', 'best_practice', 'Sustainable Farming Practices', 'alice.brown@example.com', 156, CURRENT_TIMESTAMP - INTERVAL '3 hours'),
  ('sustainable-farming', 'best_practice', 'Sustainable Farming Practices', 'charlie.davis@example.com', 278, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('market-analysis', 'research', 'Agricultural Market Analysis 2024', 'john.doe@example.com', 423, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
  ('market-analysis', 'research', 'Agricultural Market Analysis 2024', 'maria.garcia@example.com', 198, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('agricultural-tools', 'tool', 'Essential Agricultural Tools', 'david.chen@example.com', 145, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
  ('agricultural-tools', 'tool', 'Essential Agricultural Tools', 'sarah.johnson@example.com', 267, CURRENT_TIMESTAMP - INTERVAL '1 hour');

-- Create analytics summaries
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
GROUP BY av.article_id, av.article_type, av.article_title;

-- Show results
SELECT
  '✅ Ready!' as status,
  COUNT(*) as signups
FROM knowledge_hub_signups
UNION ALL
SELECT
  'Article Views' as status,
  COUNT(*) as signups
FROM article_views
UNION ALL
SELECT
  'Analytics Records' as status,
  COUNT(*) as signups
FROM article_analytics;

-- Now go to /admin/knowledge-hub to see your data!
