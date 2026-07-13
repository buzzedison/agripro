import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_COHORT = {
  name: 'AgriPro Catalyst W · Cohort 2026',
  cohort_number: 2026,
  start_date: '2026-09-01',
  end_date: '2026-11-23',
  total_weeks: 12,
  description:
    'A 12-week, action-oriented accelerator for 40 women agribusiness owners across Farm Tech, Value Addition, Market Infrastructure, and Agri-Fintech.',
};

const STARTER_PROGRAMME = [
  { week_number: 1, title: 'Founder Diagnostic & Constraint Mapping', type: 'workshop', description: 'Assess each venture and identify the single constraint to break first.' },
  { week_number: 2, title: 'Venture Deep Dive & KPI Baseline', type: 'workshop', description: 'Clarify traction, revenue, operations, and the evidence behind each growth target.' },
  { week_number: 3, title: 'Data Room Sprint', type: 'masterclass', description: 'Build the documents, numbers, and proof points needed for investor and buyer conversations.' },
  { week_number: 4, title: 'Market Access Matchmaking', type: 'networking', description: 'Map priority buyers, offtake opportunities, logistics needs, and warm introductions.' },
  { week_number: 5, title: 'Capital Readiness Clinic', type: 'masterclass', description: 'Prepare funding asks, use of funds, and investor-ready narratives.' },
  { week_number: 6, title: 'Offtake & Logistics Partner Sessions', type: 'guest_speaker', description: 'Connect founders to buyers, cold chain, aggregation, and transport partners.' },
  { week_number: 7, title: 'Policy & Compliance Roundtable', type: 'guest_speaker', description: 'Surface regulatory issues and connect founders to policy and standards support.' },
  { week_number: 8, title: 'Pitch Narrative Workshop', type: 'workshop', description: 'Shape a concise story around the deal, market, traction, and ask.' },
  { week_number: 9, title: 'Term Sheet & Negotiation Prep', type: 'masterclass', description: 'Prepare founders to negotiate investment, offtake, and partnership terms.' },
  { week_number: 10, title: 'Deal Room Rehearsal', type: 'group_work', description: 'Run live practice sessions for investor, buyer, and partner meetings.' },
  { week_number: 11, title: 'Closing Sprint', type: 'office_hours', description: 'Follow up on warm connections and convert momentum into commitments.' },
  { week_number: 12, title: 'Demo Day & Summit Readiness', type: 'networking', description: 'Package founder showcases for the Africa Food Futures Summit in Kigali.' },
] as const;

function addWeeks(date: string, weeks: number) {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + weeks * 7);
  return next.toISOString().slice(0, 10);
}

async function getFallbackCohortNumber(startDate: string) {
  const year = Number(startDate.slice(0, 4));
  if (Number.isFinite(year) && year > 2000) return year;

  const { data } = await supabase
    .from('catalyst_w_cohorts')
    .select('cohort_number')
    .order('cohort_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.cohort_number ?? 0) + 1;
}

async function seedStarterProgramme(cohortId: string, startDate: string) {
  const rows = STARTER_PROGRAMME.map((session, index) => ({
    cohort_id: cohortId,
    ...session,
    session_number: 1,
    scheduled_date: addWeeks(startDate, index),
    scheduled_time: '14:00',
    duration_minutes: 90,
    timezone: 'Africa/Lagos',
    facilitator: 'AgriPro Catalyst W Team',
    facilitator_org: 'AgriPro',
    status: 'scheduled',
  }));

  return supabase.from('catalyst_w_sessions').insert(rows).select();
}

function normalizeSession(row: any) {
  if (!row) return row;
  return {
    ...row,
    session_date: row.scheduled_date,
    session_time: row.scheduled_time,
    facilitator_name: row.facilitator,
  };
}

function cohortTablesMissingResponse() {
  return NextResponse.json({
    error: 'Catalyst W cohort tables are not installed',
    details: 'Run supabase/migrations/034_create_catalyst_w_cohort.sql in the Supabase SQL editor, then try again.',
  }, { status: 500 });
}

// GET - Fetch all cohorts ordered by cohort_number desc
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('catalyst_w_cohorts')
      .select('*')
      .order('cohort_number', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      if (error.code === '42P01') return cohortTablesMissingResponse();
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
    const start_date = body.start_date || DEFAULT_COHORT.start_date;
    const end_date = body.end_date || DEFAULT_COHORT.end_date;
    const total_weeks = Number(body.total_weeks ?? DEFAULT_COHORT.total_weeks);
    const cohort_number = Number(body.cohort_number ?? await getFallbackCohortNumber(start_date));
    const seed_programme = body.seed_programme !== false;
    const insertData = {
      name: body.name || DEFAULT_COHORT.name,
      cohort_number,
      status: body.status || 'active',
      start_date,
      end_date,
      total_weeks,
      description: body.description ?? DEFAULT_COHORT.description,
      admin_notes: body.admin_notes ?? null,
    };

    if (!insertData.name || !insertData.cohort_number || !insertData.start_date || !insertData.end_date) {
      return NextResponse.json({ error: 'Missing required fields: name, cohort_number, start_date, end_date' }, { status: 400 });
    }

    if (!Number.isInteger(insertData.cohort_number) || insertData.cohort_number <= 0) {
      return NextResponse.json({ error: 'cohort_number must be a positive integer' }, { status: 400 });
    }

    if (!Number.isInteger(insertData.total_weeks) || insertData.total_weeks < 1) {
      return NextResponse.json({ error: 'total_weeks must be a positive integer' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('catalyst_w_cohorts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      if (error.code === '42P01') return cohortTablesMissingResponse();
      return NextResponse.json({ error: 'Failed to create cohort' }, { status: 500 });
    }

    if (!seed_programme) {
      return NextResponse.json(data, { status: 201 });
    }

    const { data: sessions, error: sessionsError } = await seedStarterProgramme(data.id, data.start_date);
    if (sessionsError) {
      console.error('Starter programme insert error:', sessionsError);
      return NextResponse.json({
        cohort: data,
        sessions: [],
        warning: 'Cohort created, but starter programme sessions could not be created.',
      }, { status: 201 });
    }

    return NextResponse.json({ cohort: data, sessions: (sessions ?? []).map(normalizeSession) }, { status: 201 });
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
