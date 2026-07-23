import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PUBLIC_FIELDS = 'id, slug, title, subtitle, summary, body_content, image_url, starts_at, timezone, duration_minutes, format, venue, cost, featured, meta_description';

export async function getPublishedWebinars() {
    const { data } = await supabase
        .from('catalyst_w_webinars')
        .select(PUBLIC_FIELDS)
        .eq('status', 'published')
        .order('starts_at', { ascending: true });
    return data ?? [];
}

export async function getWebinarBySlug(slug: string) {
    const { data } = await supabase
        .from('catalyst_w_webinars')
        .select(PUBLIC_FIELDS)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
    return data;
}
