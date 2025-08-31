-- Create Analytics Tables
-- Run this in your Supabase SQL Editor

-- Knowledge Hub Signups Table
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

-- Article Views Table
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

-- Article Analytics Table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_hub_signups_created_at ON knowledge_hub_signups(created_at);
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_created_at ON article_views(created_at);
CREATE INDEX IF NOT EXISTS idx_article_analytics_article_id ON article_analytics(article_id);

-- Verify tables were created
SELECT
  'knowledge_hub_signups' as table_name,
  COUNT(*) as record_count
FROM knowledge_hub_signups
UNION ALL
SELECT
  'article_views' as table_name,
  COUNT(*) as record_count
FROM article_views
UNION ALL
SELECT
  'article_analytics' as table_name,
  COUNT(*) as record_count
FROM article_analytics;
