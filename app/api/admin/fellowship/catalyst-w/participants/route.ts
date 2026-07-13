import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UPDATE_FIELDS = [
  'status',
  'admin_notes',
  'cohort_year',
  'participant_status',
  'accelerator_track',
  'primary_constraint',
  'support_needed',
  'support_priority',
  'partner_needs',
  'assigned_fellow_id',
  'readiness_stage',
  'diagnostic_notes',
  'partner_match_notes',
  'next_action',
  'next_action_due',
  'selected_at',
];

function opsMigrationRequired(error: any) {
  const message = String(error?.message ?? '');
  return error?.code === '42703' || error?.code === 'PGRST204' || message.includes('schema cache');
}

function migrationResponse() {
  return NextResponse.json({
    error: 'Participant operations fields are not installed',
    details: 'Run supabase/migrations/038_add_catalyst_w_participant_ops.sql in Supabase SQL Editor, then try again.',
  }, { status: 500 });
}

export async function GET() {
  try {
    const [participantsResult, fellowsResult] = await Promise.all([
      supabase
        .from('catalyst_submissions')
        .select('*')
        .eq('type', 'apply')
        .in('status', ['accepted'])
        .order('created_at', { ascending: false }),
      supabase
        .from('catalyst_fellows')
        .select('id, full_name, email, role_in_agripro, country, status')
        .eq('status', 'active')
        .order('full_name', { ascending: true }),
    ]);

    if (participantsResult.error) {
      console.error('Participant fetch error:', participantsResult.error);
      return NextResponse.json({ error: participantsResult.error.message }, { status: 500 });
    }

    if (fellowsResult.error) {
      console.error('Fellows fetch error:', fellowsResult.error);
      return NextResponse.json({ error: fellowsResult.error.message }, { status: 500 });
    }

    return NextResponse.json({
      participants: participantsResult.data ?? [],
      fellows: fellowsResult.data ?? [],
    });
  } catch (err: any) {
    console.error('Participants API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const safe = Object.fromEntries(Object.entries(fields).filter(([key]) => UPDATE_FIELDS.includes(key)));
    if (Object.keys(safe).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('catalyst_submissions')
      .update({ ...safe, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Participant update error:', error);
      if (opsMigrationRequired(error)) return migrationResponse();
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Participants API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
