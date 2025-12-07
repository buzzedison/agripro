-- AgriPro Connect Pillar - Database Migration
-- Run this in Supabase SQL Editor

-- Create profiles table for the Connect directory
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Basic Info
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  
  -- Role & Type
  user_type TEXT NOT NULL CHECK (user_type IN ('farmer', 'buyer', 'expert', 'service_provider')),
  
  -- Organization (optional)
  organization_name TEXT,
  organization_role TEXT,
  
  -- Location
  country TEXT,
  region TEXT,
  city TEXT,
  
  -- Agriculture Details
  value_chains TEXT[] DEFAULT '{}', -- e.g., ['poultry', 'vegetables', 'grains']
  scale TEXT CHECK (scale IN ('small', 'medium', 'large', 'enterprise')),
  years_experience INTEGER,
  
  -- Certifications & Specializations
  certifications TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  
  -- Contact & Social
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  linkedin TEXT,
  
  -- Visibility & Status
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  profile_complete BOOLEAN DEFAULT false
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON public.profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_value_chains ON public.profiles USING GIN(value_chains);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
