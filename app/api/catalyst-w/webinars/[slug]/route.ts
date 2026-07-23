import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    const { data, error } = await supabase
        .from('catalyst_w_webinars')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    return NextResponse.json(data);
}
