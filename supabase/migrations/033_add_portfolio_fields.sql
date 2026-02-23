-- Add portfolio fields to profiles for agribusiness portfolio functionality

-- Services offered: array of objects with name, description, price_range
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb;

-- Achievements & milestones: array of objects with title, year, description
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;

-- What I'm open to: array of strings (tags)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS open_to TEXT[] DEFAULT '{}';
