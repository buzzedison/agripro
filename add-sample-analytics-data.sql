-- Add Sample Analytics Data
-- Run this after creating the analytics tables

-- Add some sample signups
INSERT INTO knowledge_hub_signups (email, first_name, last_name, signup_source, user_id)
VALUES
  ('john.doe@example.com', 'John', 'Doe', 'newsletter', NULL),
  ('jane.smith@example.com', 'Jane', 'Smith', 'paywall', NULL),
  ('bob.wilson@example.com', 'Bob', 'Wilson', 'direct', NULL),
  ('alice.brown@example.com', 'Alice', 'Brown', 'newsletter', NULL),
  ('charlie.davis@example.com', 'Charlie', 'Davis', 'paywall', NULL)
ON CONFLICT (email) DO NOTHING;

-- Add some sample article views
INSERT INTO article_views (article_id, article_type, article_title, user_email, ip_address, view_duration)
VALUES
  ('crop-demand-trends', 'insight', 'Crop Demand and Production Trends in Ghana', 'john.doe@example.com', '192.168.1.100', 245),
  ('crop-demand-trends', 'insight', 'Crop Demand and Production Trends in Ghana', 'jane.smith@example.com', '192.168.1.101', 189),
  ('crop-demand-trends', 'insight', 'Crop Demand and Production Trends in Ghana', 'bob.wilson@example.com', '192.168.1.102', 312),
  ('sustainable-farming', 'best_practice', 'Sustainable Farming Practices', 'alice.brown@example.com', '192.168.1.103', 156),
  ('sustainable-farming', 'best_practice', 'Sustainable Farming Practices', 'charlie.davis@example.com', '192.168.1.104', 278),
  ('market-analysis', 'research', 'Agricultural Market Analysis 2024', 'john.doe@example.com', '192.168.1.100', 423),
  ('market-analysis', 'research', 'Agricultural Market Analysis 2024', 'jane.smith@example.com', '192.168.1.101', 198)
ON CONFLICT DO NOTHING;

-- Add analytics summary data
INSERT INTO article_analytics (article_id, article_type, article_title, total_views, unique_views, average_view_duration, last_viewed_at)
VALUES
  ('crop-demand-trends', 'insight', 'Crop Demand and Production Trends in Ghana', 3, 3, 248.667, CURRENT_TIMESTAMP),
  ('sustainable-farming', 'best_practice', 'Sustainable Farming Practices', 2, 2, 217.000, CURRENT_TIMESTAMP),
  ('market-analysis', 'research', 'Agricultural Market Analysis 2024', 2, 2, 310.500, CURRENT_TIMESTAMP)
ON CONFLICT (article_id) DO UPDATE SET
  total_views = EXCLUDED.total_views,
  unique_views = EXCLUDED.unique_views,
  average_view_duration = EXCLUDED.average_view_duration,
  last_viewed_at = EXCLUDED.last_viewed_at;

-- Verify the data was added
SELECT
  'signups' as data_type,
  COUNT(*) as count
FROM knowledge_hub_signups
UNION ALL
SELECT
  'views' as data_type,
  COUNT(*) as count
FROM article_views
UNION ALL
SELECT
  'analytics' as data_type,
  COUNT(*) as count
FROM article_analytics;
