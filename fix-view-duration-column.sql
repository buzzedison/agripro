-- Fix view_duration column to handle decimal values
-- Run this in your Supabase SQL editor

-- If the article_views table exists, alter the column type
DO $$
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'article_views') THEN
        -- Change view_duration from INTEGER to DECIMAL to handle fractional seconds
        ALTER TABLE article_views ALTER COLUMN view_duration TYPE DECIMAL(10,3);
        
        RAISE NOTICE 'Updated view_duration column to DECIMAL(10,3)';
    ELSE
        RAISE NOTICE 'article_views table does not exist yet';
    END IF;
END $$;
