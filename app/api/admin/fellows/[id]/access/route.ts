import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFellowsAdminClient } from '@/lib/fellows/server';

type Context = { params: Promise<{ id: string }> };

async function resolveAccess(context: Context) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: 'Please sign in.' }, { status: 401 }) };
    const { data: allowed, error } = await supabase.rpc('is_admin_user');
    if (error || !allowed) return { error: NextResponse.json({ error: 'Administrator access required.' }, { status: 403 }) };
    const { id } = await context.params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return { error: NextResponse.json({ error: 'Invalid fellow.' }, { status: 400 }) };
    }
    const admin = createFellowsAdminClient();
    if (!admin) return { error: NextResponse.json({ error: 'Admin access management is not configured.' }, { status: 503 }) };
    const { data: fellow, error: fellowError } = await admin.from('catalyst_fellows')
        .select('id, user_id, email, full_name, status').eq('id', id).maybeSingle();
    if (fellowError) throw fellowError;
    if (!fellow) return { error: NextResponse.json({ error: 'Fellow not found.' }, { status: 404 }) };
    // Resolve the real login identity; never grant access to an arbitrary email in a request.
    if (!fellow.user_id) return { error: NextResponse.json({ error: 'This fellow must sign in and claim their fellow profile first.' }, { status: 409 }) };
    const { data: account, error: accountError } = await admin.auth.admin.getUserById(fellow.user_id);
    if (accountError) throw accountError;
    const email = account.user?.email?.trim().toLowerCase();
    if (!email || !account.user?.email_confirmed_at || email !== fellow.email.trim().toLowerCase()) {
        return { error: NextResponse.json({ error: 'The fellow needs a verified login email matching their fellow profile.' }, { status: 409 }) };
    }
    const { data: access, error: accessError } = await admin.from('admin_users')
        .select('id, email, role, is_active').eq('email', email).maybeSingle();
    if (accessError) throw accessError;
    const protectedAccount = email === 'edison@agriprohub.com' || access?.role === 'super_admin' || account.user.id === user.id;
    return { admin, fellow, email, access, protectedAccount };
}

export async function GET(_request: NextRequest, context: Context) {
    try {
        const result = await resolveAccess(context);
        if (result.error) return result.error;
        return NextResponse.json({
            isAdmin: result.email === 'edison@agriprohub.com' || result.access?.is_active === true,
            email: result.email,
            protectedAccount: result.protectedAccount,
            canPromote: result.fellow.status === 'active',
        }, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
        return NextResponse.json({ error: 'Could not load admin access. Please retry.' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, context: Context) {
    try {
        const result = await resolveAccess(context);
        if (result.error) return result.error;
        const body = await request.json().catch(() => null);
        if (!body || typeof body.enabled !== 'boolean') return NextResponse.json({ error: 'Choose whether admin access is enabled.' }, { status: 400 });
        const { admin, fellow, email, access, protectedAccount } = result;
        if (protectedAccount) return NextResponse.json({ error: 'Your own access and super administrator accounts cannot be changed here.' }, { status: 403 });
        if (body.enabled && fellow.status !== 'active') return NextResponse.json({ error: 'Only active fellows can be promoted.' }, { status: 409 });
        // Do not overwrite an existing role (for example editor) when revoking access.
        if (access) {
            const { error } = await admin.from('admin_users').update({
                is_active: body.enabled,
                ...(body.enabled ? { role: 'admin' } : {}),
                updated_at: new Date().toISOString(),
            }).eq('id', access.id);
            if (error) throw error;
        } else if (body.enabled) {
            const { error } = await admin.from('admin_users').insert({
                email, first_name: fellow.full_name, role: 'admin', is_active: true,
            });
            if (error) throw error;
        }
        return NextResponse.json({ isAdmin: body.enabled, email, protectedAccount, canPromote: fellow.status === 'active' });
    } catch {
        return NextResponse.json({ error: 'Could not update admin access. Refresh and try again.' }, { status: 500 });
    }
}
