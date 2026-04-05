import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all sessions with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cohort_id = searchParams.get('cohort_id');
    const week_number = searchParams.get('week_number');
    const status = searchParams.get('status');

    let query = supabase
      .from('catalyst_w_sessions')
      .select('*')
      .order('week_number', { ascending: true })
      .order('session_number', { ascending: true })
      .order('scheduled_date', { ascending: true });

    if (cohort_id) query = query.eq('cohort_id', cohort_id);
    if (week_number) query = query.eq('week_number', parseInt(week_number, 10));
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create session with auto session_number
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cohort_id,
      week_number,
      title,
      type,
      scheduled_date,
      scheduled_time,
      duration_minutes,
      facilitator,
      facilitator_org,
      description,
      timezone,
      notes,
    } = body;

    if (!cohort_id || !week_number || !title) {
      return NextResponse.json({ error: 'Missing required fields: cohort_id, week_number, title' }, { status: 400 });
    }

    // Auto-compute session_number: count existing sessions for that week+cohort then +1
    const { count } = await supabase
      .from('catalyst_w_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('cohort_id', cohort_id)
      .eq('week_number', week_number);

    const session_number = (count ?? 0) + 1;

    const { data, error } = await supabase
      .from('catalyst_w_sessions')
      .insert({
        cohort_id,
        week_number,
        session_number,
        title,
        type,
        scheduled_date,
        scheduled_time,
        duration_minutes,
        facilitator,
        facilitator_org,
        description,
        timezone,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
