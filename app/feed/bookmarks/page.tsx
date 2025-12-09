'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, ArrowLeft, Loader2, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { parseContentWithAll } from '@/lib/utils/mentions';

export default function BookmarksPage() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login?redirectTo=/feed/bookmarks');
            return;
        }
        setUser(user);
        await fetchBookmarks();
    };

    const fetchBookmarks = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/feed/bookmarks');
            const data = await response.json();
            setBookmarks(data.posts || []);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (postId: string) => {
        try {
            const response = await fetch(`/api/feed/bookmarks?postId=${postId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setBookmarks(prev => prev.filter(post => post.id !== postId));
            }
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/feed"
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-full">
                                <Bookmark className="w-5 h-5 text-yellow-600 fill-current" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Bookmarks</h1>
                                <p className="text-sm text-gray-500">
                                    {bookmarks.length} saved {bookmarks.length === 1 ? 'post' : 'posts'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookmarks List */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {bookmarks.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <Bookmark className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No bookmarks yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Save posts to read later by clicking the bookmark icon
                        </p>
                        <Link
                            href="/feed"
                            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            Go to Feed
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookmarks.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                            >
                                {/* Post Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex gap-3">
                                        <Link href={`/connect/${post.user_id}`}>
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {post.profile?.avatar_url ? (
                                                    <Image
                                                        src={post.profile.avatar_url}
                                                        alt=""
                                                        width={48}
                                                        height={48}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-lg font-bold text-gray-400">
                                                        {post.profile?.full_name?.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                        <div>
                                            <Link href={`/connect/${post.user_id}`} className="font-semibold text-gray-900 hover:underline">
                                                {post.profile?.full_name || 'AgriPro Member'}
                                            </Link>
                                            <p className="text-sm text-gray-500">
                                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeBookmark(post.id)}
                                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                                        title="Remove bookmark"
                                    >
                                        <Bookmark className="w-5 h-5 fill-current" />
                                    </button>
                                </div>

                                {/* Post Content */}
                                <p className="text-gray-900 whitespace-pre-wrap mb-4 text-[15px] leading-relaxed">
                                    {parseContentWithAll(
                                        post.content,
                                        (hashtag) => router.push(`/feed?hashtag=${hashtag}`),
                                        (mention) => router.push(`/connect?search=${encodeURIComponent(mention)}`)
                                    )}
                                </p>

                                {/* Post Image */}
                                {post.image_url && (
                                    <div className="mb-4 rounded-xl overflow-hidden">
                                        <img
                                            src={post.image_url}
                                            alt="Post image"
                                            className="w-full max-h-96 object-cover"
                                        />
                                    </div>
                                )}

                                {/* Post Stats */}
                                <div className="flex items-center gap-6 text-sm text-gray-500 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4" />
                                        <span>{post.likes_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4" />
                                        <span>{post.comments_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Repeat2 className="w-4 h-4" />
                                        <span>{post.reposts_count || 0}</span>
                                    </div>
                                    <Link
                                        href="/feed"
                                        className="ml-auto text-green-600 hover:text-green-700 font-medium"
                                    >
                                        View in feed →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
