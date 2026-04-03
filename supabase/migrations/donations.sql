-- Donations table for Knowledge Hub support
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  frequency TEXT DEFAULT 'one-time', -- 'one-time' | 'monthly'
  message TEXT,
  paystack_reference TEXT UNIQUE,
  paystack_transaction_id BIGINT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'completed' | 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast reference lookups (used during verification)
CREATE INDEX IF NOT EXISTS idx_donations_reference ON donations(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

-- Allow public inserts (server-side API uses service role, but keep RLS open for server calls)
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage donations" ON donations
  USING (true) WITH CHECK (true);
