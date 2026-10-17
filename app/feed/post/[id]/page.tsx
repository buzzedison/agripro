import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import PostPageClient from './PostPageClient';
import { postMedia } from '@/lib/feed-media';

const KIND_LABELS: Record<string, string> = {
    question: 'Question',
    listing: 'Buy / sell',
    opportunity: 'Opportunity',
};

function clip(text: string, max: number) {
    const clean = text.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
    return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

// Server-rendered link preview (WhatsApp, Facebook, LinkedIn, X) for a shared post.
// Uses the anonymous role, so held, rejected or restricted posts never leak into previews.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const fallback: Metadata = { title: 'Post | AgriPro Network', description: 'Join the AgriPro Network conversation.' };
    if (!/^[0-9a-f-]{36}$/i.test(id) || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return fallback;

    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
        const { data: post } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .eq('moderation_status', 'published')
            .maybeSingle();
        if (!post) return fallback;

        const { data: author } = await supabase.from('profiles').select('full_name').eq('id', post.user_id).maybeSingle();
        const name = author?.full_name || 'An AgriPro member';
        const kind = KIND_LABELS[post.post_kind as string];
        const heading = clip(post.post_details?.title || post.content || '', 70) || 'Shared a post';
        const title = `${kind ? `${kind}: ` : ''}${heading} — ${name} on AgriPro Network`;
        const description = clip(post.content || post.post_details?.title || `${name} shared a post on AgriPro Network.`, 200);
        const image = postMedia(post).find(m => !/\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(m.url));
        const images = image ? [{ url: image.url, alt: image.alt || heading }] : [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'AgriPro Network' }];

        return {
            title,
            description,
            alternates: { canonical: `/feed/post/${id}` },
            openGraph: { type: 'article', url: `/feed/post/${id}`, siteName: 'AgriPro', title, description, images, publishedTime: post.created_at },
            twitter: { card: image ? 'summary_large_image' : 'summary', title, description, images: images.map(i => i.url) },
        };
    } catch {
        return fallback;
    }
}

export default function PostPage() {
    return <PostPageClient />;
}
