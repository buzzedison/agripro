-- AgriPro Connection System
-- Run this in Supabase SQL Editor

-- 1. Create user_connections table
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_connections_requester ON public.user_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_receiver ON public.user_connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON public.user_connections(status);

-- 2. Add privacy_settings to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"email": "connections", "phone": "connections", "location": "public", "bio": "public"}'::jsonb;

-- 3. Enable RLS
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for user_connections
-- Users can view their own connections (sent or received)
CREATE POLICY "Users can view own user_connections" 
ON public.user_connections FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Users can insert connection requests
CREATE POLICY "Users can send connection requests" 
ON public.user_connections FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

-- Users can update connections they are part of (accept/reject)
CREATE POLICY "Users can update own connections" 
ON public.user_connections FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Users can delete connections they are part of
CREATE POLICY "Users can delete own connections" 
ON public.user_connections FOR DELETE 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- 5. Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_connections_updated_at ON public.user_connections;
CREATE TRIGGER update_user_connections_updated_at
  BEFORE UPDATE ON public.user_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
