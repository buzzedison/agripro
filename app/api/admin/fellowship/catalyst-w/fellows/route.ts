import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all fellows with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cohort_id = searchParams.get('cohort_id');
    const role = searchParams.get('role');
    const region = searchParams.get('region');
    const status = searchParams.get('status');

    let query = supabase
      .from('catalyst_w_fellows')
      .select('*')
      .order('full_name', { ascending: true });

    if (cohort_id) query = query.eq('cohort_id', cohort_id);
    if (role) query = query.eq('role', role);
    if (region) query = query.eq('region', region);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch fellows' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a single fellow row
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cohort_id, full_name, email, role, phone, country, region, linkedin_url, application_id, bio, timezone, tags, admin_notes } = body;

    if (!cohort_id || !full_name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields: cohort_id, full_name, email, role' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('catalyst_w_fellows')
      .insert({ cohort_id, full_name, email, role, phone, country, region, linkedin_url, application_id, bio, timezone, tags, admin_notes })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Fellow with this email already exists in this cohort' }, { status: 409 });
      }
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create fellow' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
