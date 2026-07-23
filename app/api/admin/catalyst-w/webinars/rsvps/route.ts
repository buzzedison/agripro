import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const webinarId = searchParams.get('webinar_id');

    let query = supabase
        .from('catalyst_w_webinar_rsvps')
        .select(`
            id,
            webinar_id,
            full_name,
            email,
            phone,
            country,
            organisation,
            role_title,
            created_at,
            webinar:catalyst_w_webinars (
                id,
                title,
                slug,
                starts_at,
                timezone,
                status,
                registration_url
            )
        `)
        .order('created_at', { ascending: false });

    if (webinarId) {
        query = query.eq('webinar_id', webinarId);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}
