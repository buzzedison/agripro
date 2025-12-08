-- AgriPro - Add Header Photo to Profiles
-- Run this in Supabase SQL Editor

-- Add header_url column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS header_url TEXT;

-- Create index for faster lookups (optional but good for filtering)
-- No index needed for header_url as it won't be filtered on
