import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Import accepted fellow applications as the operating team for an accelerator cohort
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cohort_id } = body;

    if (!cohort_id) {
      return NextResponse.json({ error: 'Missing required field: cohort_id' }, { status: 400 });
    }

    // Fetch all accepted fellow applications
    const { data: applications, error: fetchError } = await supabase
      .from('catalyst_w_fellowship_applications')
      .select('*')
      .eq('status', 'accepted');

    if (fetchError) {
      console.error('Fetch applications error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({ imported: 0, skipped: 0, total: 0 });
    }

    let imported = 0;
    let skipped = 0;

    for (const app of applications) {
      const fellowData = {
        cohort_id,
        application_id: app.id,
        full_name: app.full_name,
        email: app.email,
        phone: app.phone ?? null,
        country: app.country ?? null,
        region: app.region ?? null,
        role: app.role,
        linkedin_url: app.linkedin_url ?? null,
      };

      const { error: insertError } = await supabase
        .from('catalyst_w_fellows')
        .insert(fellowData);

      if (insertError) {
        // Skip on unique constraint violation (cohort_id + email)
        if (insertError.code === '23505') {
          skipped++;
        } else {
          console.error('Insert fellow error:', insertError, 'for app:', app.id);
          skipped++;
        }
      } else {
        imported++;
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      total: applications.length,
    });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
