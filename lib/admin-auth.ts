import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminAccessByEmail } from '@/lib/knowledge-hub/admin';

// Mirrors the temporary owner bypass in middleware.ts.
const OWNER_EMAIL = 'edison@agriprohub.com';

/**
 * Guards an admin API route. Admin pages are protected by middleware, but /api/admin/*
 * routes are not, and most use the service role, so every handler must call this first.
 */
export async function requireAdminApi(): Promise<{ email: string; response?: undefined } | { email?: undefined; response: NextResponse }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email?.trim().toLowerCase();
    if (!email) return { response: NextResponse.json({ error: 'Please sign in.' }, { status: 401 }) };
    if (email === OWNER_EMAIL) return { email };
    const access = await getAdminAccessByEmail(email);
    if (!access.isAdmin) return { response: NextResponse.json({ error: 'Administrator access required.' }, { status: 403 }) };
    return { email };
}
