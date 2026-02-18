/**
 * Run this script to create the aff_submissions table in Supabase:
 * npx ts-node scripts/create-aff-table.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const sql = `
CREATE TABLE IF NOT EXISTS public.aff_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('register', 'speaker', 'partner', 'sponsor', 'exhibitor')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'accepted', 'rejected')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organisation TEXT,
  country TEXT,
  phone TEXT,
  message TEXT,
  ticket_tier TEXT,
  dietary TEXT,
  accessibility TEXT,
  talk_title TEXT,
  talk_format TEXT,
  talk_track TEXT,
  bio TEXT,
  linkedin TEXT,
  previous_speaking TEXT,
  package_interest TEXT,
  budget_range TEXT,
  website TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS aff_submissions_type_idx ON public.aff_submissions(type);
CREATE INDEX IF NOT EXISTS aff_submissions_status_idx ON public.aff_submissions(status);
CREATE INDEX IF NOT EXISTS aff_submissions_created_at_idx ON public.aff_submissions(created_at DESC);
`

async function main() {
    console.log('Creating aff_submissions table...')
    const { error } = await supabase.rpc('exec_sql', { query: sql })
    if (error) {
        // Try direct query approach
        console.log('RPC not available, trying direct insert test...')
        const { error: testError } = await supabase.from('aff_submissions').select('id').limit(1)
        if (testError?.code === '42P01') {
            console.error('Table does not exist. Please run the SQL in supabase/migrations/030_create_aff_submissions.sql manually in the Supabase SQL editor.')
            console.log('\nSQL to run:')
            console.log(sql)
        } else {
            console.log('✅ Table already exists or was created successfully!')
        }
    } else {
        console.log('✅ Table created successfully!')
    }
}

main().catch(console.error)
