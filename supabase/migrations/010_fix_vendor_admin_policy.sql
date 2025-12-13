-- Fix RLS policy for vendor management
-- Adds policy to allow admins to manage all vendors

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all vendors" ON public.trade_vendors;
DROP POLICY IF EXISTS "Admins can update all vendors" ON public.trade_vendors;

-- Policy for admins to VIEW all vendors (including pending)
-- Uses admin_users table to check if user email is an active admin
CREATE POLICY "Admins can view all vendors" 
  ON public.trade_vendors 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (SELECT auth.email()) 
        AND is_active = true
    )
  );

-- Policy for admins to UPDATE all vendors (for approving/rejecting)
CREATE POLICY "Admins can update all vendors" 
  ON public.trade_vendors 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (SELECT auth.email()) 
        AND is_active = true
    )
  );

-- Policy for admins to DELETE vendors if needed
CREATE POLICY "Admins can delete vendors" 
  ON public.trade_vendors 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (SELECT auth.email()) 
        AND is_active = true
    )
  );
