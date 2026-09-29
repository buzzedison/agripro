'use client';
import { useEffect, useState } from 'react';
import { Pin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { FeedAnnouncement } from '@/lib/feed-community';

export default function Announcements() {
    const [items, setItems] = useState<FeedAnnouncement[]>([]);
    useEffect(() => {
        let cancelled = false;
        createClient().from('feed_announcements').select('id,title,body,active,expires_at').eq('active', true).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order('created_at', { ascending: false }).limit(3)
            .then(({ data }) => { if (!cancelled) setItems(data || []); });
        return () => { cancelled = true; };
    }, []);
    if (!items.length) return null;
    return <section aria-label="Pinned announcements" className="space-y-3">{items.map(item => <article key={item.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800"><Pin className="h-3.5 w-3.5" /> Pinned by AgriPro</p>
        <h2 className="mt-2 font-bold text-gray-900">{item.title}</h2><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">{item.body}</p>
    </article>)}</section>;
}
