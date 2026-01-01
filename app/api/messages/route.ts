import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    if (!connectionId) {
        return NextResponse.json({ error: 'Missing connectionId' }, { status: 400 });
    }

    const { data: connection, error: connectionError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('id', connectionId)
        .single();

    if (connectionError || !connection) {
        return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (
        connection.status !== 'accepted' ||
        (connection.requester_id !== user.id && connection.receiver_id !== user.id)
    ) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: messages, error: messagesError } = await supabase
        .from('connection_messages')
        .select('id, connection_id, sender_id, recipient_id, content, attachment_url, created_at, read_at')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: true });

    if (messagesError) {
        return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }

    await supabase
        .from('connection_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('connection_id', connectionId)
        .eq('recipient_id', user.id)
        .is('read_at', null);

    return NextResponse.json({ messages: messages ?? [] });
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

    const { connectionId, content } = await request.json();

    if (!connectionId || !content?.trim()) {
        return NextResponse.json({ error: 'Message content and connectionId are required' }, { status: 400 });
    }

    const { data: connection, error: connectionError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('id', connectionId)
        .single();

    if (connectionError || !connection) {
        return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (
        connection.status !== 'accepted' ||
        (connection.requester_id !== user.id && connection.receiver_id !== user.id)
    ) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const recipientId = connection.requester_id === user.id ? connection.receiver_id : connection.requester_id;

    const { data: message, error: insertError } = await supabase
        .from('connection_messages')
        .insert({
            connection_id: connectionId,
            sender_id: user.id,
            recipient_id: recipientId,
            content: content.trim()
        })
        .select('id, connection_id, sender_id, recipient_id, content, created_at')
        .single();

    if (insertError || !message) {
        return NextResponse.json({ error: insertError?.message || 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ message });
}
