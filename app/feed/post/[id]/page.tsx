'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import PollCard from '../../components/PollCard';
import { parseContentWithAll, nameToUniqueSlug } from '@/lib/utils/mentions';
import { toast } from 'sonner';
import {
    ArrowLeft, Heart, MessageCircle, Share2, Copy, Loader2,
    CheckCircle, Image as ImageIcon, Trash2, Send, AlertTriangle,
    MoreHorizontal, Flag, UserX, BellOff, Eye,
} from 'lucide-react';
import ReportModal from '@/components/ReportModal';
import { blockUser, muteUser } from '@/lib/moderation';

const userTypeLabels: Record<string, string> = {
    farmer: 'Farmer',
    buyer: 'Buyer',
    expert: 'Expert',
    service_provider: 'Service Provider',
};

function isVideoUrl(url: string): boolean {
    if (!url) return false;
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i;
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i;
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/i;
    return videoExtensions.test(url) || youtubeRegex.test(url) || vimeoRegex.test(url);
}

function getYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
}

function MediaPreview({ url }: { url: string }) {
    const [failed, setFailed] = useState(false);

    if (isVideoUrl(url)) {
        const youtubeId = getYouTubeId(url);
        const vimeoId = getVimeoId(url);
        if (youtubeId) {
            return (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }
        if (vimeoId) {
            return (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                        src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }
        return (
            <video src={url} controls className="w-full max-h-[500px] rounded-xl bg-black" />
        );
    }

    if (failed) {
        return (
            <div className="w-full h-48 rounded-xl bg-gray-100 flex items-center justify-center gap-2 text-gray-400 text-sm">
                <ImageIcon className="w-4 h-4" /> Media unavailable
            </div>
        );
    }

    // eslint-disable-next-line @next/next/no-img-element
    return (
        <img
            src={url}
            alt="Post media"
            className="w-full max-h-[600px] object-cover rounded-xl"
            onError={() => setFailed(true)}
        />
    );
}

interface AuthorProfile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    user_type?: string;
    organization_name?: string | null;
    is_verified?: boolean;
}

interface PostData {
    id: string;
    user_id: string;
    content: string;
    image_url: string | null;
    gif_url: string | null;
    is_poll?: boolean;
    quoted_post_id?: string | null;
    created_at: string;
    likes_count: number;
    comments_count: number;
    reposts_count: number;
    views_count?: number;
    profile?: AuthorProfile;
    quoted_post?: (PostData & { profile?: AuthorProfile }) | null;
}

interface CommentData {
    id: string;
    post_id: string;
    user_id: string;
    parent_comment_id: string | null;
    content: string;
    image_url: string | null;
    created_at: string;
    likes_count: number;
    profile?: AuthorProfile;
    liked?: boolean;
}

function Avatar({ profile, size = 40 }: { profile?: AuthorProfile; size?: number }) {
    return (
        <div
            className="rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0"
            style={{ width: size, height: size }}
        >
            {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
                <span className="font-bold text-gray-400" style={{ fontSize: size * 0.4 }}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </span>
            )}
        </div>
    );
}

function profileHref(profile?: AuthorProfile) {
    if (!profile) return '#';
    return `/connect/${nameToUniqueSlug(profile.full_name, profile.id)}`;
}

export default function PostPermalinkPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const supabase = createClient();
    const postId = params.id;

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [post, setPost] = useState<PostData | null>(null);
    const [liked, setLiked] = useState(false);
    const [likeBusy, setLikeBusy] = useState(false);
    const [comments, setComments] = useState<CommentData[]>([]);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [shareOpen, setShareOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/feed/post/${postId}` : '';

    const fetchProfiles = useCallback(async (ids: string[]) => {
        if (ids.length === 0) return new Map<string, AuthorProfile>();
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, user_type, organization_name, is_verified')
            .in('id', ids);
        return new Map((data || []).map((p) => [p.id, p as AuthorProfile]));
    }, [supabase]);

    const load = useCallback(async () => {
        setLoading(true);
        setNotFound(false);

        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        const { data: postRow, error: postError } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .maybeSingle();

        if (postError || !postRow) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        const idsToFetch = [postRow.user_id];
        let quotedRow: any = null;
        if (postRow.quoted_post_id) {
            const { data } = await supabase.from('posts').select('*').eq('id', postRow.quoted_post_id).maybeSingle();
            quotedRow = data;
            if (quotedRow) idsToFetch.push(quotedRow.user_id);
        }

        const { data: commentRows } = await supabase
            .from('post_comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        (commentRows || []).forEach((c) => idsToFetch.push(c.user_id));

        const profilesMap = await fetchProfiles([...new Set(idsToFetch)]);

        let likedByMe = false;
        let likedCommentIds = new Set<string>();
        if (currentUser) {
            const { data: likeRow } = await supabase
                .from('post_likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', currentUser.id)
                .maybeSingle();
            likedByMe = !!likeRow;

            if ((commentRows || []).length > 0) {
                const { data: commentLikes } = await supabase
                    .from('comment_likes')
                    .select('comment_id')
                    .eq('user_id', currentUser.id)
                    .in('comment_id', (commentRows || []).map((c) => c.id));
                likedCommentIds = new Set((commentLikes || []).map((l) => l.comment_id));
            }
        }

        setPost({
            ...postRow,
            profile: profilesMap.get(postRow.user_id),
            quoted_post: quotedRow ? { ...quotedRow, profile: profilesMap.get(quotedRow.user_id) } : null,
        });
        setLiked(likedByMe);
        setComments(
            (commentRows || []).map((c) => ({
                ...c,
                profile: profilesMap.get(c.user_id),
                liked: likedCommentIds.has(c.id),
            }))
        );
        setLoading(false);
    }, [postId, supabase, fetchProfiles]);

    useEffect(() => {
        load();
    }, [load]);

    // Count a view once per visitor per post (deduped via sessionStorage), only
    // after we know the post actually exists.
    useEffect(() => {
        if (!post) return;
        const key = `viewed_post_${post.id}`;
        if (typeof window === 'undefined' || sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, '1');
        supabase.rpc('increment_post_views', { p_post_id: post.id }).then(({ data, error }) => {
            if (!error && typeof data === 'number') {
                setPost((p) => (p ? { ...p, views_count: data } : p));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [post?.id]);

    const requireAuth = () => {
        if (!user) {
            toast.error('Sign in to do that');
            router.push(`/auth/login?redirectTo=/feed/post/${postId}`);
            return false;
        }
        return true;
    };

    const toggleLike = async () => {
        if (!requireAuth() || !post || likeBusy) return;
        setLikeBusy(true);
        const wasLiked = liked;
        setLiked(!wasLiked);
        setPost((p) => (p ? { ...p, likes_count: Math.max(0, p.likes_count + (wasLiked ? -1 : 1)) } : p));

        try {
            if (wasLiked) {
                await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
            } else {
                await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
            }
        } catch {
            // revert on failure
            setLiked(wasLiked);
            setPost((p) => (p ? { ...p, likes_count: Math.max(0, p.likes_count + (wasLiked ? 1 : -1)) } : p));
            toast.error('Something went wrong');
        } finally {
            setLikeBusy(false);
        }
    };

    const toggleCommentLike = async (comment: CommentData) => {
        if (!requireAuth()) return;
        const wasLiked = comment.liked;
        setComments((prev) =>
            prev.map((c) =>
                c.id === comment.id
                    ? { ...c, liked: !wasLiked, likes_count: Math.max(0, c.likes_count + (wasLiked ? -1 : 1)) }
                    : c
            )
        );
        try {
            if (wasLiked) {
                await supabase.from('comment_likes').delete().eq('comment_id', comment.id).eq('user_id', user.id);
            } else {
                await supabase.from('comment_likes').insert({ comment_id: comment.id, user_id: user.id });
            }
        } catch {
            toast.error('Something went wrong');
            load();
        }
    };

    const submitComment = async (content: string, parentCommentId: string | null) => {
        if (!requireAuth() || !content.trim()) return;
        const isReply = !!parentCommentId;
        if (isReply) setSubmittingComment(true); else setSubmittingComment(true);

        try {
            const { error } = await supabase.from('post_comments').insert({
                post_id: postId,
                user_id: user.id,
                content: content.trim(),
                parent_comment_id: parentCommentId,
            });
            if (error) throw error;
            setCommentText('');
            setReplyText('');
            setReplyTo(null);
            setPost((p) => (p ? { ...p, comments_count: p.comments_count + 1 } : p));
            await load();
        } catch {
            toast.error('Could not post your comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const deleteComment = async (comment: CommentData) => {
        if (!user || comment.user_id !== user.id) return;
        if (!confirm('Delete this comment?')) return;
        try {
            await supabase.from('post_comments').delete().eq('id', comment.id);
            setPost((p) => (p ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p));
            setComments((prev) => prev.filter((c) => c.id !== comment.id && c.parent_comment_id !== comment.id));
        } catch {
            toast.error('Could not delete comment');
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied');
        } catch {
            toast.error('Could not copy link');
        }
        setShareOpen(false);
    };

    const shareToWhatsApp = () => {
        const text = post?.content ? `${post.content.slice(0, 120)}${post.content.length > 120 ? '…' : ''}\n\n${shareUrl}` : shareUrl;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        setShareOpen(false);
    };

    const nativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: 'AgriPro', text: post?.content?.slice(0, 100), url: shareUrl });
            } catch {
                // user cancelled — no-op
            }
        }
        setShareOpen(false);
    };

    const handleBlock = async () => {
        if (!requireAuth() || !post?.profile) return;
        const name = post.profile.full_name;
        if (!confirm(`Block ${name}? They won't be able to see your posts or message you, and you won't see theirs.`)) return;
        setMoreOpen(false);
        try {
            await blockUser(user.id, post.profile.id);
            toast.success(`Blocked ${name}`);
            router.push('/feed');
        } catch {
            toast.error('Could not block this user');
        }
    };

    const handleMute = async () => {
        if (!requireAuth() || !post?.profile) return;
        const name = post.profile.full_name;
        setMoreOpen(false);
        try {
            await muteUser(user.id, post.profile.id);
            toast.success(`Muted ${name}. Their posts won't show in your feed.`);
        } catch {
            toast.error('Could not mute this user');
        }
    };

    const topLevelComments = comments.filter((c) => !c.parent_comment_id);
    const repliesFor = (commentId: string) => comments.filter((c) => c.parent_comment_id === commentId);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-lg font-bold text-gray-900 mb-1">Post not found</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        This post may have been removed, or the link is incorrect.
                    </p>
                    <Link
                        href="/feed"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to feed
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-6">
                <button
                    onClick={() => router.push('/feed')}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to feed
                </button>

                {/* Post card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                    <div className="flex items-start gap-3 mb-3">
                        <Link href={profileHref(post.profile)}>
                            <Avatar profile={post.profile} />
                        </Link>
                        <div className="min-w-0">
                            <Link href={profileHref(post.profile)} className="font-bold text-gray-900 hover:text-green-600 flex items-center gap-1">
                                {post.profile?.full_name || 'Unknown'}
                                {post.profile?.is_verified && <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />}
                            </Link>
                            <p className="text-xs text-gray-500">
                                {post.profile?.organization_name || userTypeLabels[post.profile?.user_type || ''] || ''}
                                {' · '}
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    {post.content && (
                        <p className="text-gray-800 whitespace-pre-wrap mb-3 leading-relaxed">
                            {parseContentWithAll(post.content, undefined, undefined)}
                        </p>
                    )}

                    {post.image_url && <div className="mb-3"><MediaPreview url={post.image_url} /></div>}
                    {post.gif_url && (
                        <div className="mb-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={post.gif_url} alt="GIF" className="w-full max-h-[500px] object-cover rounded-xl" />
                        </div>
                    )}
                    {post.is_poll && (
                        <div className="mb-3">
                            <PollCard postId={post.id} userId={user?.id || ''} />
                        </div>
                    )}

                    {post.quoted_post && (
                        <div className="mb-3 border border-gray-200 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Avatar profile={post.quoted_post.profile} size={24} />
                                <span className="text-sm font-semibold text-gray-900">{post.quoted_post.profile?.full_name}</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3">{post.quoted_post.content}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-6 pt-3 mt-1 border-t border-gray-100 relative">
                        <button
                            onClick={toggleLike}
                            disabled={likeBusy}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                        >
                            <Heart className={`w-4.5 h-4.5 ${liked ? 'fill-red-500' : ''}`} />
                            {post.likes_count}
                        </button>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                            <MessageCircle className="w-4.5 h-4.5" />
                            {post.comments_count}
                        </span>
                        {typeof post.views_count === 'number' && (
                            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-400" title="Views">
                                <Eye className="w-4.5 h-4.5" />
                                {post.views_count}
                            </span>
                        )}
                        <div className="relative">
                            <button
                                onClick={() => setShareOpen((s) => !s)}
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
                            >
                                <Share2 className="w-4.5 h-4.5" /> Share
                            </button>
                            {shareOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShareOpen(false)} />
                                    <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20">
                                        <button onClick={copyLink} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <Copy className="w-4 h-4" /> Copy link
                                        </button>
                                        <button onClick={shareToWhatsApp} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.148.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.934-1.395A9.94 9.94 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.94 7.94 0 01-4.052-1.107l-.29-.172-3.011.85.815-2.928-.19-.303A7.94 7.94 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" /></svg>
                                            WhatsApp
                                        </button>
                                        {typeof navigator !== 'undefined' && !!navigator.share && (
                                            <button onClick={nativeShare} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                <Share2 className="w-4 h-4" /> More options
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        {user?.id !== post.user_id && (
                            <div className="relative ml-auto">
                                <button
                                    onClick={() => setMoreOpen((s) => !s)}
                                    aria-label="Post options"
                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <MoreHorizontal className="w-4.5 h-4.5" />
                                </button>
                                {moreOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                                        <div className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20">
                                            <button
                                                onClick={() => { setMoreOpen(false); if (requireAuth()) setReportOpen(true); }}
                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Flag className="w-4 h-4" /> Report post
                                            </button>
                                            <button
                                                onClick={handleMute}
                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <BellOff className="w-4 h-4" /> Mute {post.profile?.full_name?.split(' ')[0] || 'user'}
                                            </button>
                                            <button
                                                onClick={handleBlock}
                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <UserX className="w-4 h-4" /> Block {post.profile?.full_name?.split(' ')[0] || 'user'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {reportOpen && user && (
                    <ReportModal
                        reporterId={user.id}
                        targetType="post"
                        targetId={post.id}
                        targetLabel="this post"
                        onClose={() => setReportOpen(false)}
                    />
                )}

                {/* Comment composer */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
                    {user ? (
                        <div className="flex items-start gap-3">
                            <Avatar profile={{ id: user.id, full_name: user.email, avatar_url: null }} size={36} />
                            <div className="flex-1">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    rows={2}
                                    placeholder="Write a comment..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={() => submitComment(commentText, null)}
                                        disabled={submittingComment || !commentText.trim()}
                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                        Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-1">
                            <Link href={`/auth/login?redirectTo=/feed/post/${postId}`} className="text-green-600 font-semibold hover:underline">
                                Sign in
                            </Link>{' '}
                            to like or comment.
                        </p>
                    )}
                </div>

                {/* Comments list */}
                <div className="space-y-3">
                    {topLevelComments.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-6">No comments yet. Be the first to reply.</p>
                    ) : (
                        topLevelComments.map((comment) => (
                            <div key={comment.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                <div className="flex items-start gap-3">
                                    <Link href={profileHref(comment.profile)}>
                                        <Avatar profile={comment.profile} size={32} />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-gray-50 rounded-xl px-3 py-2">
                                            <Link href={profileHref(comment.profile)} className="font-semibold text-sm text-gray-900 hover:text-green-600">
                                                {comment.profile?.full_name || 'Unknown'}
                                            </Link>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1.5 px-1">
                                            <span className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                            </span>
                                            <button
                                                onClick={() => toggleCommentLike(comment)}
                                                className={`text-xs font-medium flex items-center gap-1 ${comment.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                            >
                                                <Heart className={`w-3 h-3 ${comment.liked ? 'fill-red-500' : ''}`} />
                                                {comment.likes_count > 0 ? comment.likes_count : 'Like'}
                                            </button>
                                            <button
                                                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                                className="text-xs font-medium text-gray-500 hover:text-green-600"
                                            >
                                                Reply
                                            </button>
                                            {user?.id === comment.user_id && (
                                                <button
                                                    onClick={() => deleteComment(comment)}
                                                    className="text-xs font-medium text-gray-400 hover:text-red-500 flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Delete
                                                </button>
                                            )}
                                        </div>

                                        {replyTo === comment.id && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder={`Reply to ${comment.profile?.full_name || 'this comment'}...`}
                                                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') submitComment(replyText, comment.id);
                                                    }}
                                                />
                                                <button
                                                    onClick={() => submitComment(replyText, comment.id)}
                                                    disabled={submittingComment || !replyText.trim()}
                                                    className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Replies */}
                                        {repliesFor(comment.id).length > 0 && (
                                            <div className="mt-3 space-y-2 pl-3 border-l-2 border-gray-100">
                                                {repliesFor(comment.id).map((reply) => (
                                                    <div key={reply.id} className="flex items-start gap-2.5">
                                                        <Link href={profileHref(reply.profile)}>
                                                            <Avatar profile={reply.profile} size={26} />
                                                        </Link>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="bg-gray-50 rounded-xl px-3 py-1.5">
                                                                <Link href={profileHref(reply.profile)} className="font-semibold text-xs text-gray-900 hover:text-green-600">
                                                                    {reply.profile?.full_name || 'Unknown'}
                                                                </Link>
                                                                <p className="text-xs text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1 px-1">
                                                                <span className="text-[11px] text-gray-400">
                                                                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                                                </span>
                                                                {user?.id === reply.user_id && (
                                                                    <button
                                                                        onClick={() => deleteComment(reply)}
                                                                        className="text-[11px] font-medium text-gray-400 hover:text-red-500"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
