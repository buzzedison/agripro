'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Heart, MessageCircle, Loader2, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { POST_KINDS } from '@/lib/practical-feed';
import { PostMediaGallery } from './FeedMedia';

type PreviewPost = {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    post_kind?: string;
    post_details?: Record<string, string>;
    image_url: string | null;
    media_urls?: string[] | null;
    media_alt?: string[] | null;
    gif_url?: string | null;
    country?: string | null;
};

type Author = { id: string; full_name: string; avatar_url: string | null; user_type: string | null; is_verified: boolean };

const SIGNUP = '/auth/signup?redirectTo=/feed';
const LOGIN = '/auth/login?redirectTo=/feed';

/** Read-only look at recent public posts for signed-out visitors, with a prompt to join. */
export default function PublicFeedPreview() {
    const [posts, setPosts] = useState<PreviewPost[]>([]);
    const [authors, setAuthors] = useState<Map<string, Author>>(new Map());
    const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

    useEffect(() => {
        const supabase = createClient();
        (async () => {
            let { data, error } = await supabase.rpc('public_feed_preview', { p_limit: 10 });
            if (error) {
                // Before migration 062: posts RLS still hides restricted authors from anonymous readers
                ({ data, error } = await supabase.from('posts').select('*').eq('moderation_status', 'published')
                    .order('created_at', { ascending: false }).limit(10));
            }
            if (error) { setState('error'); return; }
            const rows = (data || []) as PreviewPost[];
            const ids = [...new Set(rows.map(p => p.user_id))];
            const { data: profiles } = ids.length
                ? await supabase.from('profiles').select('id, full_name, avatar_url, user_type, is_verified').in('id', ids)
                : { data: [] };
            setAuthors(new Map((profiles || []).map((p: Author) => [p.id, p])));
            setPosts(rows);
            setState('ready');
        })();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 pt-24 pb-16">
            <div className="mx-auto max-w-2xl px-4">
                <div className="mb-6 rounded-2xl bg-gradient-to-br from-green-700 to-green-600 p-6 text-white shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-100"><Users className="h-4 w-4" /> AgriPro Network</div>
                    <h1 className="mt-2 text-2xl font-bold">See what African farmers and agribusinesses are talking about</h1>
                    <p className="mt-2 text-sm text-green-50">Ask questions, find buyers and sellers, and hear about grants, training and jobs. Join free to post, comment and react.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <Link href={SIGNUP} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-green-700 hover:bg-green-50">Join free</Link>
                        <Link href={LOGIN} className="rounded-full border border-white/60 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10">Sign in</Link>
                    </div>
                </div>

                {state === 'loading' && (
                    <div role="status" className="flex items-center justify-center gap-2 rounded-2xl bg-white p-8 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading recent posts…
                    </div>
                )}
                {state === 'error' && (
                    <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-600">
                        Recent posts are not available right now. <Link href={LOGIN} className="font-semibold text-green-700 underline">Sign in</Link> to see the full feed.
                    </div>
                )}
                {state === 'ready' && posts.length === 0 && (
                    <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-600">No public posts yet. <Link href={SIGNUP} className="font-semibold text-green-700 underline">Join</Link> and start the conversation.</div>
                )}

                <div className="space-y-4">
                    {posts.map(post => {
                        const author = authors.get(post.user_id);
                        const kind = post.post_kind && post.post_kind !== 'update' ? POST_KINDS.find(k => k.value === post.post_kind)?.label : null;
                        return (
                            <article key={post.id} className="rounded-2xl bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-sm font-bold text-gray-400">
                                        {author?.avatar_url ? <img src={author.avatar_url} alt="" className="h-full w-full object-cover" /> : author?.full_name?.charAt(0) || 'A'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="flex items-center gap-1 font-semibold text-gray-900">
                                            {author?.full_name || 'AgriPro Member'}
                                            {author?.is_verified && <CheckCircle className="h-4 w-4 fill-current text-green-600" aria-label="Verified" />}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                            {post.country && ` · ${post.country}`}
                                        </p>
                                    </div>
                                    {kind && <span className="ml-auto rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{kind}</span>}
                                </div>
                                <Link href={`/feed/post/${post.id}`} className="block">
                                    {post.post_details?.title && <h2 className="mb-1 font-semibold text-gray-900">{post.post_details.title}</h2>}
                                    {post.content && <p className="mb-3 line-clamp-5 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">{post.content}</p>}
                                </Link>
                                <PostMediaGallery post={post} />
                                {post.gif_url && <img src={post.gif_url} alt="GIF" className="mb-3 max-h-80 w-full rounded-xl object-cover" />}
                                <div className="flex items-center gap-5 border-t border-gray-100 pt-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> {post.likes_count || 0}</span>
                                    <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {post.comments_count || 0}</span>
                                    <Link href={SIGNUP} className="ml-auto font-semibold text-green-700 hover:underline">Join to reply</Link>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {posts.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-green-200 bg-white p-6 text-center">
                        <p className="font-semibold text-gray-900">There’s more in the full feed</p>
                        <p className="mt-1 text-sm text-gray-600">Members get personalised posts for their crops and country, plus alerts on enquiries and answers.</p>
                        <Link href={SIGNUP} className="mt-4 inline-block rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700">Create your free account</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
