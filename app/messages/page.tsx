/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import {
    Loader2,
    MessageSquare,
    Send,
    Shield,
    Users,
    Inbox,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface ConversationSummary {
    connectionId: string;
    participant: {
        id: string;
        full_name: string;
        avatar_url: string | null;
    } | null;
    lastMessage: {
        id: string;
        sender_id: string;
        content: string;
        created_at: string;
    } | null;
    unreadCount: number;
    updated_at: string;
}

interface Message {
    id: string;
    connection_id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    attachment_url?: string | null;
    created_at: string;
    read_at: string | null;
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<MessagesPageFallback />}>
            <MessagesPageContent />
        </Suspense>
    );
}

function MessagesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preferredConnectionId = searchParams.get('connectionId');
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [conversationsLoading, setConversationsLoading] = useState(false);
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeConversation = useMemo(
        () => conversations.find((conv) => conv.connectionId === selectedConnectionId) || null,
        [conversations, selectedConnectionId]
    );

    const fetchConversations = useCallback(async (preferredId?: string) => {
        setConversationsLoading(true);
        try {
            const response = await fetch('/api/messages/connections');
            if (response.status === 401) {
                router.push('/auth/login?redirectTo=/messages');
                return;
            }
            const data = await response.json();
            if (response.ok) {
                const list: ConversationSummary[] = data.conversations || [];
                setConversations(list);
                if (preferredId && list.some((conv) => conv.connectionId === preferredId)) {
                    setSelectedConnectionId(preferredId);
                } else if (
                    selectedConnectionId &&
                    list.some((conv) => conv.connectionId === selectedConnectionId)
                ) {
                    // keep current selection
                } else if (list.length > 0) {
                    setSelectedConnectionId(list[0].connectionId);
                } else {
                    setSelectedConnectionId(null);
                }
            } else {
                setError(data.error || 'Failed to load conversations');
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to load conversations');
        } finally {
            setConversationsLoading(false);
        }
    }, [router, selectedConnectionId]);

    const fetchMessages = useCallback(
        async (connectionId: string) => {
            setMessagesLoading(true);
            try {
                const response = await fetch(`/api/messages?connectionId=${connectionId}`);
                if (response.status === 401) {
                    router.push('/auth/login?redirectTo=/messages');
                    return;
                }
                const data = await response.json();
                if (response.ok) {
                    setMessages(data.messages || []);
                    setConversations((prev) =>
                        prev.map((conv) =>
                            conv.connectionId === connectionId ? { ...conv, unreadCount: 0 } : conv
                        )
                    );
                } else {
                    setError(data.error || 'Failed to load messages');
                }
            } catch (err: any) {
                setError(err?.message || 'Failed to load messages');
            } finally {
                setMessagesLoading(false);
            }
        },
        [router]
    );

    const handleSendMessage = async () => {
        if (!selectedConnectionId || !newMessage.trim()) return;
        setSending(true);
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId: selectedConnectionId, content: newMessage })
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Failed to send message');
                return;
            }
            setMessages((prev) => [...prev, data.message]);
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.connectionId === selectedConnectionId
                        ? { ...conv, lastMessage: data.message, updated_at: data.message.created_at }
                        : conv
                )
            );
            setNewMessage('');
        } catch (err: any) {
            setError(err?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const {
                data: { user: currentUser }
            } = await supabase.auth.getUser();
            if (!currentUser) {
                router.push('/auth/login?redirectTo=/messages');
                return;
            }
            setUser(currentUser);
            await fetchConversations(preferredConnectionId || undefined);
            setLoadingUser(false);
        };
        init();
    }, [fetchConversations, preferredConnectionId, router, supabase]);

    useEffect(() => {
        if (selectedConnectionId) {
            fetchMessages(selectedConnectionId);
        } else {
            setMessages([]);
        }
    }, [selectedConnectionId, fetchMessages]);

    useEffect(() => {
        if (!selectedConnectionId) return;
        const channel = supabase
            .channel(`connection-messages-${selectedConnectionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'connection_messages',
                    filter: `connection_id=eq.${selectedConnectionId}`
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedConnectionId, fetchConversations]);

    const renderConversationItem = (conv: ConversationSummary) => {
        const participant = conv.participant;
        const lastMessageTime = conv.lastMessage
            ? formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })
            : 'No messages yet';

        return (
            <button
                key={conv.connectionId}
                onClick={() => {
                    setSelectedConnectionId(conv.connectionId);
                    setError(null);
                }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                    conv.connectionId === selectedConnectionId ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
            >
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {participant?.avatar_url ? (
                        <Image
                            src={participant.avatar_url}
                            alt={participant.full_name || ''}
                            width={48}
                            height={48}
                            className="object-cover"
                        />
                    ) : (
                        <span className="text-lg font-semibold text-gray-500">
                            {participant?.full_name?.charAt(0).toUpperCase() || '?'}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-900 truncate">
                            {participant?.full_name || 'AgriPro member'}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage
                            ? conv.lastMessage.content
                            : 'Start a conversation with your connection.'}
                    </p>
                </div>
                {conv.unreadCount > 0 && (
                    <span className="ml-2 text-xs font-semibold bg-green-600 text-white rounded-full px-2 py-0.5">
                        {conv.unreadCount}
                    </span>
                )}
            </button>
        );
    };

    if (loadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    <p className="text-sm text-gray-500">
                        Reach out to your accepted connections and keep collaborations moving.
                    </p>
                </div>
                {error && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
                        <span>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="text-xs font-semibold underline hover:text-red-900"
                        >
                            Dismiss
                        </button>
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <div>
                                <p className="font-semibold text-gray-900">Conversations</p>
                                <p className="text-xs text-gray-500">
                                    Only people you’re connected with can message you.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    fetchConversations(selectedConnectionId || undefined);
                                }}
                                className="p-2 rounded-full text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                                title="Refresh"
                                aria-label="Refresh conversations"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                        {conversationsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="px-6 py-12 text-center text-sm text-gray-500 space-y-3">
                                <Inbox className="w-10 h-10 text-gray-400 mx-auto" />
                                <div>
                                    <p className="font-semibold text-gray-900">No messages yet</p>
                                    <p>Send connection requests to start conversations.</p>
                                </div>
                                <Link
                                    href="/connect/directory"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 rounded-full hover:bg-green-100"
                                >
                                    <Users className="w-4 h-4 mr-1.5" />
                                    Find connections
                                </Link>
                            </div>
                        ) : (
                            <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">
                                {conversations.map(renderConversationItem)}
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-2">
                        {selectedConnectionId && activeConversation ? (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[70vh]">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {activeConversation.participant?.avatar_url ? (
                                            <Image
                                                src={activeConversation.participant.avatar_url}
                                                alt={activeConversation.participant.full_name || ''}
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg font-semibold text-gray-600">
                                                {activeConversation.participant?.full_name
                                                    ?.charAt(0)
                                                    .toUpperCase() || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {activeConversation.participant?.full_name || 'AgriPro member'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Connected partner ·{' '}
                                            {formatDistanceToNow(
                                                new Date(activeConversation.updated_at || new Date()),
                                                { addSuffix: true }
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50">
                                    {messagesLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 text-sm space-y-3">
                                            <MessageSquare className="w-10 h-10 text-gray-400 mx-auto" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Start the conversation</p>
                                                <p>Introduce yourself or share how you can collaborate.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        messages.map((message) => {
                                            const isMe = message.sender_id === user?.id;
                                            return (
                                                <div key={message.id} className="flex flex-col">
                                                    <div
                                                        className={`inline-flex max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                                            isMe
                                                                ? 'bg-green-600 text-white self-end rounded-br-sm'
                                                                : 'bg-white text-gray-900 self-start rounded-bl-sm border border-gray-100'
                                                        }`}
                                                    >
                                                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                                    </div>
                                                    <span
                                                        className={`text-xs text-gray-400 mt-1 ${
                                                            isMe ? 'self-end' : 'self-start'
                                                        }`}
                                                    >
                                                        {formatDistanceToNow(new Date(message.created_at), {
                                                            addSuffix: true
                                                        })}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                <div className="border-t border-gray-100 p-4 bg-white">
                                    <div className="flex items-end gap-3">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            rows={2}
                                            placeholder="Write a message..."
                                            className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim() || sending}
                                            className="inline-flex items-center justify-center rounded-2xl bg-green-600 text-white px-4 py-3 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {sending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-1" />
                                                    Send
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5" />
                                        Messages are private between accepted connections.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center space-y-4">
                                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Select a conversation</h3>
                                    <p className="text-sm text-gray-500">
                                        Choose a connection from the list to view your discussion. Need more contacts?
                                    </p>
                                </div>
                                <Link
                                    href="/connect/directory"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 rounded-full hover:bg-green-100"
                                >
                                    <Users className="w-4 h-4 mr-1.5" />
                                    Explore members
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MessagesPageFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
    );
}
