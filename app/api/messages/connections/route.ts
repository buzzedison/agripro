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

    const { data: connections, error } = await supabase
        .from('user_connections')
        .select('id, status, requester_id, receiver_id, updated_at')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!connections || connections.length === 0) {
        return NextResponse.json({ conversations: [] });
    }

    const connectionIds = connections.map((c) => c.id);
    const participantIds = Array.from(
        new Set(
            connections
                .map((connection) =>
                    connection.requester_id === user.id ? connection.receiver_id : connection.requester_id
                )
                .filter((id): id is string => Boolean(id))
        )
    );

    let profileMap = new Map<string, { id: string; full_name: string | null; avatar_url: string | null }>();

    if (participantIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', participantIds);

        if (profilesError) {
            return NextResponse.json({ error: profilesError.message }, { status: 500 });
        }

        profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));
    }

    const { data: lastMessagesData } = await supabase
        .from('connection_messages')
        .select('id, connection_id, sender_id, content, created_at')
        .in('connection_id', connectionIds)
        .order('created_at', { ascending: false });

    const lastMessagesMap = new Map<string, any>();
    lastMessagesData?.forEach((message) => {
        if (!lastMessagesMap.has(message.connection_id)) {
            lastMessagesMap.set(message.connection_id, message);
        }
    });

    const { data: unreadRows } = await supabase
        .from('connection_messages')
        .select('connection_id')
        .in('connection_id', connectionIds)
        .eq('recipient_id', user.id)
        .is('read_at', null);

    const unreadCountMap = unreadRows?.reduce<Record<string, number>>((acc, row) => {
        acc[row.connection_id] = (acc[row.connection_id] || 0) + 1;
        return acc;
    }, {}) ?? {};

    const conversations = connections.map((connection) => {
        const participantId =
            connection.requester_id === user.id ? connection.receiver_id : connection.requester_id;
        const participantProfile = participantId ? profileMap.get(participantId) ?? null : null;

        return {
            connectionId: connection.id,
            participant: participantProfile
                ? {
                      id: participantProfile.id,
                      full_name: participantProfile.full_name,
                      avatar_url: participantProfile.avatar_url
                  }
                : null,
            lastMessage: lastMessagesMap.get(connection.id) || null,
            unreadCount: unreadCountMap[connection.id] || 0,
            updated_at: connection.updated_at
        };
    });

    return NextResponse.json({ conversations });
}
