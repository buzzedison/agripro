import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all cohorts ordered by cohort_number desc
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('catalyst_w_cohorts')
      .select('*')
      .order('cohort_number', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch cohorts' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new cohort
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, cohort_number, start_date, end_date, total_weeks, description } = body;

    if (!name || !cohort_number || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields: name, cohort_number, start_date, end_date' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('catalyst_w_cohorts')
      .insert({ name, cohort_number, start_date, end_date, total_weeks, description })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create cohort' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update cohort by id
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing cohort id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('catalyst_w_cohorts')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update cohort' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
