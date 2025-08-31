-- Check database state and table existence

-- List all tables in the public schema
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check specific tables we care about
SELECT
  'knowledge_hub_signups' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'knowledge_hub_signups'
  ) THEN 'EXISTS' ELSE 'DOES NOT EXIST' END as status,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'knowledge_hub_signups'
  ) THEN (SELECT COUNT(*) FROM knowledge_hub_signups)::text ELSE '0' END as record_count;

SELECT
  'article_views' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'article_views'
  ) THEN 'EXISTS' ELSE 'DOES NOT EXIST' END as status,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'article_views'
  ) THEN (SELECT COUNT(*) FROM article_views)::text ELSE '0' END as record_count;

SELECT
  'fellowship_applications' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'fellowship_applications'
  ) THEN 'EXISTS' ELSE 'DOES NOT EXIST' END as status,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'fellowship_applications'
  ) THEN (SELECT COUNT(*) FROM fellowship_applications)::text ELSE '0' END as record_count;

-- Show sample data from each table
SELECT 'Sample from knowledge_hub_signups:' as info;
SELECT email, signup_source, created_at FROM knowledge_hub_signups LIMIT 3;

SELECT 'Sample from article_views:' as info;
SELECT article_title, user_email, created_at FROM article_views LIMIT 3;

SELECT 'Sample from fellowship_applications:' as info;
SELECT email, created_at FROM fellowship_applications LIMIT 3;
