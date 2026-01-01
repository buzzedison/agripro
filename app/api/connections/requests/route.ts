import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('user_connections')
        .select('id, requester_id, created_at')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const requesterIds = Array.from(new Set((data || []).map((row) => row.requester_id)));
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, organization_name, user_type')
        .in('id', requesterIds);

    const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));

    const requests = (data || []).map((row) => ({
        connectionId: row.id,
        requesterId: row.requester_id,
        requestedAt: row.created_at,
        profile: profileMap.get(row.requester_id) || null
    }));

    return NextResponse.json({ requests });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requesterId, action } = await request.json();
    if (!requesterId || !['accept', 'reject'].includes(action)) {
        return NextResponse.json({ error: 'Invalid action or requesterId' }, { status: 400 });
    }

    if (action === 'accept') {
        const { error } = await supabase
            .from('user_connections')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('requester_id', requesterId)
            .eq('receiver_id', user.id)
            .eq('status', 'pending');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    }

    const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('requester_id', requesterId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
