-- AgriPro - Add Threaded Comments with Image Support
-- Run this in Supabase SQL Editor

-- Add parent_comment_id for nested/threaded comments
-- NULL = top-level comment, otherwise = reply to another comment
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE;

-- Add image_url for comment images
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create index for faster nested comment lookups
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.post_comments(parent_comment_id);
