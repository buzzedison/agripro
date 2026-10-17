'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ArrowUp } from 'lucide-react';

/**
 * Counts newly published posts from other members while the feed is open, using
 * Supabase Realtime (posts RLS applies, so held/restricted posts are not delivered).
 * The feed is not changed underneath the reader; they choose when to load the new posts.
 */
export function useNewPostsSignal(
    supabase: SupabaseClient,
    userId: string | null,
    hiddenAuthorIds: Set<string>,
) {
    const [newPostIds, setNewPostIds] = useState<string[]>([]);
    const hiddenRef = useRef(hiddenAuthorIds);
    hiddenRef.current = hiddenAuthorIds;

    useEffect(() => {
        if (!userId) return;
        const channel = supabase
            .channel('feed-new-posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                const row = payload.new as { id: string; user_id: string; moderation_status?: string };
                if (row.user_id === userId || hiddenRef.current.has(row.user_id)) return;
                if (row.moderation_status && row.moderation_status !== 'published') return;
                setNewPostIds(prev => (prev.includes(row.id) ? prev : [...prev, row.id]));
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [supabase, userId]);

    const reset = useCallback(() => setNewPostIds([]), []);
    return { newPostsCount: newPostIds.length, resetNewPosts: reset };
}

export function NewPostsBanner({ count, onShow }: { count: number; onShow: () => void }) {
    if (count === 0) return null;
    return (
        <div className="sticky top-20 z-30 flex justify-center pointer-events-none">
            <button
                onClick={onShow}
                className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-green-700"
            >
                <ArrowUp className="h-4 w-4" />
                {count === 1 ? '1 new post' : `${count > 20 ? '20+' : count} new posts`}
            </button>
        </div>
    );
}

/** Calls onVisible when the reader scrolls near the end of the list (the button stays as a fallback). */
export function InfiniteScrollSentinel({ onVisible, disabled }: { onVisible: () => void; disabled?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const callback = useRef(onVisible);
    callback.current = onVisible;

    useEffect(() => {
        const node = ref.current;
        if (!node || disabled || typeof IntersectionObserver === 'undefined') return;
        const observer = new IntersectionObserver(
            entries => { if (entries[0]?.isIntersecting) callback.current(); },
            { rootMargin: '600px 0px' },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [disabled]);

    return <div ref={ref} aria-hidden="true" />;
}
