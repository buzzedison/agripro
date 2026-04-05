import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function recalculateFellowRate(fellow_id: string, cohort_id: string) {
  const { count: totalCompleted } = await supabase
    .from('catalyst_w_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('cohort_id', cohort_id)
    .eq('status', 'completed');

  if (!totalCompleted || totalCompleted === 0) {
    await supabase
      .from('catalyst_w_fellows')
      .update({ attendance_rate: 0, total_sessions_attended: 0, updated_at: new Date().toISOString() })
      .eq('id', fellow_id);
    return;
  }

  const { data: attendanceRows } = await supabase
    .from('catalyst_w_attendance')
    .select('session_id, status, catalyst_w_sessions!inner(cohort_id, status)')
    .eq('fellow_id', fellow_id)
    .in('status', ['present', 'late'])
    .eq('catalyst_w_sessions.cohort_id', cohort_id)
    .eq('catalyst_w_sessions.status', 'completed');

  const attended = attendanceRows?.length ?? 0;
  const rate = Math.round((attended / totalCompleted) * 10000) / 100;

  await supabase
    .from('catalyst_w_fellows')
    .update({
      attendance_rate: rate,
      total_sessions_attended: attended,
      updated_at: new Date().toISOString(),
    })
    .eq('id', fellow_id);
}

// GET - Fetch attendance records with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');
    const fellow_id = searchParams.get('fellow_id');
    const cohort_id = searchParams.get('cohort_id');

    let query = supabase
      .from('catalyst_w_attendance')
      .select('*');

    if (session_id) query = query.eq('session_id', session_id);
    if (fellow_id) query = query.eq('fellow_id', fellow_id);
    if (cohort_id) query = query.eq('cohort_id', cohort_id);

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Upsert attendance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, fellow_id, cohort_id, status, marked_by } = body;

    if (!session_id || !fellow_id || !cohort_id || !status) {
      return NextResponse.json({ error: 'Missing required fields: session_id, fellow_id, cohort_id, status' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('catalyst_w_attendance')
      .upsert(
        { session_id, fellow_id, cohort_id, status, marked_by: marked_by ?? null },
        { onConflict: 'session_id,fellow_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Upsert error:', error);
      return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
    }

    // Recalculate attendance rate for the fellow
    await recalculateFellowRate(fellow_id, cohort_id);

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove attendance record and recalculate rate
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, fellow_id } = body;

    if (!session_id || !fellow_id) {
      return NextResponse.json({ error: 'Missing required fields: session_id, fellow_id' }, { status: 400 });
    }

    // Fetch the record to get cohort_id before deleting
    const { data: existing } = await supabase
      .from('catalyst_w_attendance')
      .select('cohort_id')
      .eq('session_id', session_id)
      .eq('fellow_id', fellow_id)
      .single();

    const { error } = await supabase
      .from('catalyst_w_attendance')
      .delete()
      .eq('session_id', session_id)
      .eq('fellow_id', fellow_id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete attendance record' }, { status: 500 });
    }

    // Recalculate rate if we had the cohort_id
    if (existing?.cohort_id) {
      await recalculateFellowRate(fellow_id, existing.cohort_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
