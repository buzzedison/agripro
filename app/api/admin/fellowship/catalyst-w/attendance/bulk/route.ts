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

// POST - Bulk upsert attendance for a session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, cohort_id, attendances, marked_by } = body;

    if (!session_id || !cohort_id || !Array.isArray(attendances) || attendances.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: session_id, cohort_id, attendances[]' }, { status: 400 });
    }

    const rows = attendances.map(({ fellow_id, status }: { fellow_id: string; status: string }) => ({
      session_id,
      cohort_id,
      fellow_id,
      status,
      marked_by: marked_by ?? null,
    }));

    const { data, error } = await supabase
      .from('catalyst_w_attendance')
      .upsert(rows, { onConflict: 'session_id,fellow_id' })
      .select();

    if (error) {
      console.error('Bulk upsert error:', error);
      return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
    }

    // Recalculate rates for all affected fellows
    const uniqueFellowIds = [...new Set(attendances.map((a: { fellow_id: string }) => a.fellow_id))];
    await Promise.all(uniqueFellowIds.map((fellow_id) => recalculateFellowRate(fellow_id as string, cohort_id)));

    return NextResponse.json({ updated: data?.length ?? rows.length });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
