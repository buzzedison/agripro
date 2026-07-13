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
    const { session_id, marked_by } = body;
    const attendances = body.attendances ?? body.records;
    let cohort_id = body.cohort_id;

    if (!session_id || !Array.isArray(attendances) || attendances.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: session_id, attendances[]' }, { status: 400 });
    }

    if (!cohort_id) {
      const { data: session, error: sessionError } = await supabase
        .from('catalyst_w_sessions')
        .select('cohort_id')
        .eq('id', session_id)
        .single();

      if (sessionError || !session?.cohort_id) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      cohort_id = session.cohort_id;
    }

    const rows = attendances
      .filter(({ status }: { status: string }) => status !== 'absent')
      .map(({ fellow_id, status }: { fellow_id: string; status: string }) => ({
      session_id,
      cohort_id,
      fellow_id,
      status,
      marked_by: marked_by ?? null,
    }));

    const absentFellowIds = attendances
      .filter(({ status }: { status: string }) => status === 'absent')
      .map(({ fellow_id }: { fellow_id: string }) => fellow_id);

    let data: any[] = [];

    if (rows.length > 0) {
      const result = await supabase
        .from('catalyst_w_attendance')
        .upsert(rows, { onConflict: 'session_id,fellow_id' })
        .select();

      if (result.error) {
        console.error('Bulk upsert error:', result.error);
        return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
      }
      data = result.data ?? [];
    }

    if (absentFellowIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('catalyst_w_attendance')
        .delete()
        .eq('session_id', session_id)
        .in('fellow_id', absentFellowIds);

      if (deleteError) {
        console.error('Bulk absent delete error:', deleteError);
        return NextResponse.json({ error: 'Failed to clear absent attendance' }, { status: 500 });
      }
    }

    // Recalculate rates for all affected fellows
    const uniqueFellowIds = [...new Set(attendances.map((a: { fellow_id: string }) => a.fellow_id))];
    await Promise.all(uniqueFellowIds.map((fellow_id) => recalculateFellowRate(fellow_id as string, cohort_id)));

    return NextResponse.json({
      records: data,
      updated: data.length,
      deleted: absentFellowIds.length,
    });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
