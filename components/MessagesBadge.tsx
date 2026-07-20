'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

// Polls the unread connection-message count. Shared by the top-bar icon and
// the inline badges inside the dropdown/mobile menus.
function useUnreadMessagesCount() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const fetchCount = async () => {
            try {
                const res = await fetch('/api/messages/unread-count');
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) setCount(data.unreadCount || 0);
            } catch {
                // silent — badge just stays at last known count
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    return count;
}

// Top-bar icon + link, with a small red counter — same visual language as
// NotificationBell's bell icon, but without a dropdown (goes straight to /messages).
export function MessagesNavIcon({ className = '' }: { className?: string }) {
    const count = useUnreadMessagesCount();

    return (
        <Link
            href="/messages"
            className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
            aria-label="Messages"
        >
            <MessageSquare className="w-5 h-5 text-gray-700" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}

// Small inline counter to drop next to an existing "Messages" label
// (dropdown menu item, mobile menu item) without duplicating layout.
export function MessagesInlineBadge() {
    const count = useUnreadMessagesCount();
    if (count === 0) return null;
    return (
        <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1.5">
            {count > 99 ? '99+' : count}
        </span>
    );
}
