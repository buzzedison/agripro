import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { webinar_id, slug, full_name, email, phone, country, organisation, role_title } = body;

        if ((!webinar_id && !slug) || !full_name?.trim() || !email?.trim()) {
            return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
        }

        const emailNorm = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailNorm)) {
            return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
        }

        let webinarQuery = supabase
            .from('catalyst_w_webinars')
            .select('id, title, slug, starts_at, status')
            .eq('status', 'published');

        webinarQuery = webinar_id
            ? webinarQuery.eq('id', webinar_id)
            : webinarQuery.eq('slug', slug);

        const { data: webinar, error: webinarError } = await webinarQuery.single();

        if (webinarError || !webinar) {
            return NextResponse.json({ error: 'This webinar is not available for registration.' }, { status: 404 });
        }

        if (new Date(webinar.starts_at) < new Date()) {
            return NextResponse.json({ error: 'Registration for this webinar has closed.' }, { status: 400 });
        }

        const { error: insertError } = await supabase.from('catalyst_w_webinar_rsvps').insert({
            webinar_id: webinar.id,
            full_name: full_name.trim(),
            email: emailNorm,
            phone: phone?.trim() || null,
            country: country?.trim() || null,
            organisation: organisation?.trim() || null,
            role_title: role_title?.trim() || null,
        });

        if (insertError) {
            if (insertError.code === '23505') {
                return NextResponse.json(
                    { error: 'You are already registered for this webinar with this email.' },
                    { status: 409 }
                );
            }
            return NextResponse.json({ error: 'Could not save your registration. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'You are registered! We will email you join details before the session.' });
    } catch {
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
