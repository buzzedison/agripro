import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function recalculateAttendanceRate(fellow_id: string, cohort_id: string) {
  // Count completed sessions for this cohort
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

  // Count attendance records for present/late joined to completed sessions
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

// GET - Fetch single fellow by id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('catalyst_w_fellows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fellow not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch fellow' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update fellow (allowed fields only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const ALLOWED = ['status', 'admin_notes', 'bio', 'timezone', 'tags', 'onboarding_complete'];
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const key of ALLOWED) {
      if (key in body) updateData[key] = body[key];
    }

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('catalyst_w_fellows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fellow not found' }, { status: 404 });
      }
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update fellow' }, { status: 500 });
    }

    // Recalculate attendance rate inline
    await recalculateAttendanceRate(id, data.cohort_id);

    // Return updated fellow
    const { data: refreshed } = await supabase
      .from('catalyst_w_fellows')
      .select('*')
      .eq('id', id)
      .single();

    return NextResponse.json(refreshed ?? data);
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
