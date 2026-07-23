import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    const { data, error } = await supabase
        .from('catalyst_w_webinars')
        .select('id, slug, title, subtitle, summary, image_url, starts_at, timezone, duration_minutes, format, venue, cost, featured, meta_description')
        .eq('status', 'published')
        .order('starts_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}
