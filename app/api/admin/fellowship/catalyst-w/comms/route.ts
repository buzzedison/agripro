import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function buildEmailHtml(subject: string, fellow_name: string, body_html: string, cohort_number: number): string {
  return `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
  <div style="background:#0B2C24;padding:24px 32px;border-radius:12px 12px 0 0;">
    <p style="color:#6ee7b7;font-size:12px;font-weight:700;letter-spacing:0.05em;margin:0 0 4px;">WOMEN CATALYST FELLOWSHIP · COHORT ${cohort_number}</p>
    <h1 style="color:#fff;font-size:20px;margin:0;">${subject}</h1>
  </div>
  <div style="padding:28px 32px;border:1px solid #e5e7eb;border-top:none;">
    <p>Hi ${fellow_name},</p>
    ${body_html}
    <p style="margin-top:24px;color:#6b7280;font-size:13px;">— The AgriPro Fellowship Team</p>
  </div>
</div>`;
}

// GET - Fetch announcements for a cohort
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cohort_id = searchParams.get('cohort_id');

    if (!cohort_id) {
      return NextResponse.json({ error: 'cohort_id query param is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('catalyst_w_announcements')
      .select('*')
      .eq('cohort_id', cohort_id)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send announcement to fellows
export async function POST(request: NextRequest) {
  try {
    if (!resend) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { cohort_id, subject, body_html, audience, audience_filter, sent_by } = body;

    if (!cohort_id || !subject || !body_html || !audience || !sent_by) {
      return NextResponse.json({ error: 'Missing required fields: cohort_id, subject, body_html, audience, sent_by' }, { status: 400 });
    }

    // Fetch cohort for cohort_number
    const { data: cohort, error: cohortError } = await supabase
      .from('catalyst_w_cohorts')
      .select('cohort_number')
      .eq('id', cohort_id)
      .single();

    if (cohortError || !cohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }

    // Build fellow query based on audience
    let fellowQuery = supabase
      .from('catalyst_w_fellows')
      .select('id, full_name, email')
      .eq('cohort_id', cohort_id)
      .eq('status', 'active');

    if (audience === 'role' && audience_filter?.role) {
      fellowQuery = fellowQuery.eq('role', audience_filter.role);
    } else if (audience === 'region' && audience_filter?.region) {
      fellowQuery = fellowQuery.eq('region', audience_filter.region);
    }

    const { data: fellows, error: fellowsError } = await fellowQuery;

    if (fellowsError) {
      console.error('Fellows fetch error:', fellowsError);
      return NextResponse.json({ error: 'Failed to fetch fellows' }, { status: 500 });
    }

    if (!fellows || fellows.length === 0) {
      return NextResponse.json({ error: 'No fellows match the audience criteria' }, { status: 400 });
    }

    // Send emails individually (Resend free tier limitation)
    let sent = 0;
    for (const fellow of fellows) {
      try {
        await resend.emails.send({
          from: 'AgriPro Fellowship <noreply@agriprohub.com>',
          to: fellow.email,
          subject,
          html: buildEmailHtml(subject, fellow.full_name, body_html, cohort.cohort_number),
        });
        sent++;
      } catch (emailErr: any) {
        console.error(`Failed to send email to ${fellow.email}:`, emailErr.message);
      }
    }

    // Insert announcement log row
    const { data: announcement, error: insertError } = await supabase
      .from('catalyst_w_announcements')
      .insert({
        cohort_id,
        subject,
        body_html,
        audience,
        audience_filter: audience_filter ?? {},
        recipient_count: sent,
        sent_by,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Announcement log error:', insertError);
      // Don't fail the request — emails were already sent
    }

    return NextResponse.json({
      sent,
      announcement_id: announcement?.id ?? null,
    });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
