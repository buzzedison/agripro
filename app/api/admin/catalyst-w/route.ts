import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminApi } from '@/lib/admin-auth';
import { EXCLUDED_REASONS } from '@/lib/catalyst-selection';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STATUSES = ['new', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'paid', 'waitlisted', 'rejected'];

export async function GET() {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;

    const { data, error } = await supabase
        .from('catalyst_submissions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}

export async function PATCH(request: NextRequest) {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const allowed = ['status', 'admin_notes', 'duplicate_of', 'excluded_reason', 'business_verified', 'business_verification_notes'];
    const safe: Record<string, unknown> = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));

    if ('status' in safe && !STATUSES.includes(String(safe.status))) {
        return NextResponse.json({ error: 'Unknown status' }, { status: 400 });
    }
    if ('excluded_reason' in safe && safe.excluded_reason !== null && !EXCLUDED_REASONS.some(r => r.value === safe.excluded_reason)) {
        return NextResponse.json({ error: 'Unknown exclusion reason' }, { status: 400 });
    }
    if ('duplicate_of' in safe && safe.duplicate_of === id) {
        return NextResponse.json({ error: 'An application cannot duplicate itself' }, { status: 400 });
    }
    // Who verified the business and when is recorded server-side, not taken from the request.
    if ('business_verified' in safe) {
        safe.business_verified = safe.business_verified === true;
        safe.business_verified_by = safe.business_verified ? auth.email : null;
        safe.business_verified_at = safe.business_verified ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
        .from('catalyst_submissions')
        .update({ ...safe, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, submission: data });
}

export async function DELETE(request: NextRequest) {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
        .from('catalyst_submissions')
        .delete()
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
