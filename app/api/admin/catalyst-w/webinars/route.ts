import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SELECT_FIELDS = '*';

export async function GET() {
    const { data, error } = await supabase
        .from('catalyst_w_webinars')
        .select(SELECT_FIELDS)
        .order('starts_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const {
        slug, title, subtitle, summary, body_content, image_url,
        starts_at, timezone, duration_minutes, format, venue,
        cost, registration_url, status, featured, meta_description,
    } = body;

    if (!slug || !title || !starts_at) {
        return NextResponse.json({ error: 'slug, title, and starts_at are required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('catalyst_w_webinars')
        .insert({
            slug,
            title,
            subtitle: subtitle || null,
            summary: summary || null,
            body_content: body_content || null,
            image_url: image_url || null,
            starts_at,
            timezone: timezone || 'Africa/Lagos',
            duration_minutes: duration_minutes ?? 75,
            format: format || 'online',
            venue: venue || null,
            cost: cost || 'Free',
            registration_url: registration_url || null,
            status: status || 'draft',
            featured: featured ?? false,
            meta_description: meta_description || null,
        })
        .select(SELECT_FIELDS)
        .single();

    if (error) {
        if (error.code === '23505') {
            return NextResponse.json({ error: 'A webinar with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const allowed = [
        'slug', 'title', 'subtitle', 'summary', 'body_content', 'image_url',
        'starts_at', 'timezone', 'duration_minutes', 'format', 'venue',
        'cost', 'registration_url', 'status', 'featured', 'meta_description',
    ];
    const safe = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));

    const { data, error } = await supabase
        .from('catalyst_w_webinars')
        .update({ ...safe, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(SELECT_FIELDS)
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
        .from('catalyst_w_webinars')
        .delete()
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
