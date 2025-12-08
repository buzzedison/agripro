-- AgriPro - Add Quote Repost Support
-- Run this in Supabase SQL Editor

-- Add quoted_post_id column to posts table for quote reposts
-- If null = regular post, if set = quote repost referencing another post
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS quoted_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL;

-- Create index for faster lookups of posts that quote a specific post
CREATE INDEX IF NOT EXISTS idx_posts_quoted_post_id ON public.posts(quoted_post_id);
