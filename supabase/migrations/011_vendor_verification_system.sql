-- Vendor Verification System Migration
-- Adds verification levels and onboarding tracking for vendors

-- Add new columns to trade_vendors for tiered verification
ALTER TABLE public.trade_vendors 
ADD COLUMN IF NOT EXISTS verification_level TEXT DEFAULT 'basic' CHECK (verification_level IN ('basic', 'verified', 'premium')),
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS id_document_type TEXT,
ADD COLUMN IF NOT EXISTS id_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS business_document_url TEXT,
ADD COLUMN IF NOT EXISTS business_document_type TEXT,
ADD COLUMN IF NOT EXISTS business_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Update existing approved vendors to have basic verification level
UPDATE public.trade_vendors 
SET verification_level = 'basic', 
    onboarding_completed = true,
    profile_completed = true
WHERE status = 'approved';

-- Update verified vendors to have verified level
UPDATE public.trade_vendors 
SET verification_level = 'verified'
WHERE is_verified = true;

-- Create index for verification level queries
CREATE INDEX IF NOT EXISTS idx_trade_vendors_verification_level ON public.trade_vendors(verification_level);

-- Comment explaining the verification levels:
-- basic: Completed signup, can list products (Regular Vendor)
-- verified: Uploaded and verified ID document (Verified Vendor badge)
-- premium: Verified + Business registration verified (Premium Vendor badge)
