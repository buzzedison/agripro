-- ============================================
-- FIX FOR 500 ERROR ON USER SIGNUP
-- ============================================
-- Run this in your Supabase SQL Editor to fix the signup error
-- This creates a trigger that automatically creates user profiles when they sign up

-- Step 1: Drop existing triggers if they exist (all possible names)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- Step 2: Drop existing function with CASCADE to remove any dependencies
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 3: Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically create a profile for the new user
  INSERT INTO public.profiles (
    id,
    full_name,
    user_type,
    email,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    -- Use full_name from signup metadata, or default to 'User'
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    -- Use user_type from metadata, or default to 'farmer'
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'farmer'),
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, you can verify the trigger exists by running:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
