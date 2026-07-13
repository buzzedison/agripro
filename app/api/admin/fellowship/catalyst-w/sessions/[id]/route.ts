import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function normalizeSession(row: any) {
  if (!row) return row;
  return {
    ...row,
    session_date: row.scheduled_date,
    session_time: row.scheduled_time,
    facilitator_name: row.facilitator,
  };
}

function normalizeUpdateBody(body: Record<string, unknown>) {
  const next = { ...body };
  if ('session_date' in next && !('scheduled_date' in next)) {
    next.scheduled_date = next.session_date;
  }
  if ('session_time' in next && !('scheduled_time' in next)) {
    next.scheduled_time = next.session_time;
  }
  if ('facilitator_name' in next && !('facilitator' in next)) {
    next.facilitator = next.facilitator_name;
  }
  return next;
}

// GET - Fetch single session
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('catalyst_w_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
    }

    return NextResponse.json(normalizeSession(data));
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update session (allowed fields only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = normalizeUpdateBody(await request.json());
    const ALLOWED = [
      'title', 'type', 'scheduled_date', 'scheduled_time', 'duration_minutes',
      'facilitator', 'facilitator_org', 'description', 'recording_url',
      'materials_url', 'notes', 'status', 'timezone',
    ];

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of ALLOWED) {
      if (key in body) updateData[key] = body[key];
    }

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('catalyst_w_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    return NextResponse.json(normalizeSession(data));
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete session
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('catalyst_w_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
