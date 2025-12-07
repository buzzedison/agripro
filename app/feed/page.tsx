'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
    Heart, MessageCircle, Repeat2, Share, MoreHorizontal,
    Image as ImageIcon, Send, Loader2, Users, TrendingUp,
    Search, MapPin, CheckCircle, X, Bookmark, Smile, Camera,
    ChevronDown, ChevronUp, Trash2
} from 'lucide-react';

// Emoji picker data
const emojiCategories = {
    'Agriculture': ['🌾', '🌽', '🍅', '🥕', '🥬', '🌿', '🌱', '🚜', '🐄', '🐔', '🐖', '🐐', '🌻', '🍎', '🥭', '🍌'],
    'Reactions': ['👍', '❤️', '🔥', '💪', '🙌', '👏', '🎉', '✨', '💡', '🤝', '💯', '⭐'],
    'Nature': ['🌍', '🌤️', '🌧️', '💧', '🌊', '🏞️', '🌳', '🌴', '☀️', '🌈', '🍃', '🌺'],
};

interface Post {
    id: string;
    user_id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    likes_count: number;
    comments_count: number;
    reposts_count: number;
    profile: {
        full_name: string;
        avatar_url: string | null;
        user_type: string;
        organization_name: string | null;
        is_verified: boolean;
    };
    user_has_liked?: boolean;
}

interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    profile: {
        full_name: string;
        avatar_url: string | null;
        is_verified: boolean;
    };
}

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    user_type: string;
    organization_name: string | null;
    country: string | null;
    is_verified: boolean;
}

const userTypeLabels: Record<string, string> = {
    farmer: 'Farmer',
    buyer: 'Buyer',
    expert: 'Expert',
    service_provider: 'Service Provider',
};

export default function FeedPage() {
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
    const [submittingComment, setSubmittingComment] = useState<Set<string>>(new Set());

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login?redirectTo=/feed');
            return;
        }
        setUser(user);
        await Promise.all([
            fetchProfile(user.id),
            fetchPosts(user.id),
            fetchSuggestedUsers(user.id),
            fetchFollowing(user.id)
        ]);
        setLoading(false);
    };

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data);
    };

    const fetchPosts = async (userId: string) => {
        // Fetch posts
        const { data: postsData } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (postsData && postsData.length > 0) {
            // Fetch profiles for post authors
            const authorIds = [...new Set(postsData.map(p => p.user_id))];
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, user_type, organization_name, is_verified')
                .in('id', authorIds);

            const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

            // Check which posts the user has liked
            const { data: likesData } = await supabase
                .from('post_likes')
                .select('post_id')
                .eq('user_id', userId);

            const likedPostIds = new Set(likesData?.map(l => l.post_id) || []);

            const postsWithProfiles = postsData.map(post => ({
                ...post,
                profile: profilesMap.get(post.user_id) || {
                    full_name: 'Unknown',
                    avatar_url: null,
                    user_type: 'farmer',
                    organization_name: null,
                    is_verified: false,
                },
                user_has_liked: likedPostIds.has(post.id)
            }));

            setPosts(postsWithProfiles);
        } else {
            setPosts([]);
        }
    };

    const fetchSuggestedUsers = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, user_type, organization_name, country, is_verified')
            .neq('id', userId)
            .eq('profile_complete', true)
            .eq('is_public', true)
            .limit(5);
        setSuggestedUsers(data || []);
    };

    const fetchFollowing = async (userId: string) => {
        const { data } = await supabase
            .from('connections')
            .select('following_id')
            .eq('follower_id', userId);
        setFollowingIds(new Set(data?.map(c => c.following_id) || []));
    };

    const fetchComments = async (postId: string) => {
        setLoadingComments(prev => new Set(prev).add(postId));

        // Fetch comments
        const { data: commentsData } = await supabase
            .from('post_comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (commentsData && commentsData.length > 0) {
            // Fetch profiles for comment authors
            const authorIds = [...new Set(commentsData.map(c => c.user_id))];
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, is_verified')
                .in('id', authorIds);

            const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

            const commentsWithProfiles = commentsData.map(comment => ({
                ...comment,
                profile: profilesMap.get(comment.user_id) || {
                    full_name: 'Unknown',
                    avatar_url: null,
                    is_verified: false,
                }
            }));

            setPostComments(prev => ({ ...prev, [postId]: commentsWithProfiles }));
        } else {
            setPostComments(prev => ({ ...prev, [postId]: [] }));
        }

        setLoadingComments(prev => {
            const next = new Set(prev);
            next.delete(postId);
            return next;
        });
    };

    const toggleComments = async (postId: string) => {
        if (expandedComments.has(postId)) {
            setExpandedComments(prev => {
                const next = new Set(prev);
                next.delete(postId);
                return next;
            });
        } else {
            setExpandedComments(prev => new Set(prev).add(postId));
            if (!postComments[postId]) {
                await fetchComments(postId);
            }
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewPostImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setNewPostImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const insertEmoji = (emoji: string) => {
        setNewPostContent(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handlePost = async () => {
        if ((!newPostContent.trim() && !newPostImage) || !user) return;

        setPosting(true);
        try {
            let imageUrl = null;

            // Upload image if present
            if (newPostImage) {
                const fileExt = newPostImage.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('post-images')
                    .upload(fileName, newPostImage);

                if (uploadError) {
                    console.error('Image upload error:', uploadError.message);
                    // Continue without image if upload fails
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('post-images')
                        .getPublicUrl(fileName);
                    imageUrl = publicUrl;
                }
            }

            // Insert the post
            const { data: newPost, error: insertError } = await supabase
                .from('posts')
                .insert({
                    user_id: user.id,
                    content: newPostContent.trim(),
                    image_url: imageUrl
                })
                .select('*')
                .single();

            if (insertError) {
                console.error('Insert error:', insertError.message);
                throw insertError;
            }

            // Add the post to the feed with current user's profile
            const postWithProfile: Post = {
                ...newPost,
                profile: {
                    full_name: profile?.full_name || 'Anonymous',
                    avatar_url: profile?.avatar_url || null,
                    user_type: profile?.user_type || 'farmer',
                    organization_name: profile?.organization_name || null,
                    is_verified: profile?.is_verified || false,
                },
                user_has_liked: false
            };

            setPosts([postWithProfile, ...posts]);
            setNewPostContent('');
            removeImage();
        } catch (err: any) {
            console.error('Error posting:', err?.message || err);
            alert('Failed to post: ' + (err?.message || 'Unknown error'));
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId: string, isLiked: boolean) => {
        if (!user) return;

        setPosts(posts.map(p =>
            p.id === postId
                ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1), user_has_liked: !isLiked }
                : p
        ));

        try {
            if (isLiked) {
                await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
            } else {
                await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
            }
        } catch (err) {
            setPosts(posts.map(p =>
                p.id === postId
                    ? { ...p, likes_count: p.likes_count + (isLiked ? 1 : -1), user_has_liked: isLiked }
                    : p
            ));
        }
    };

    const handleComment = async (postId: string) => {
        const content = commentInputs[postId]?.trim();
        if (!content || !user) return;

        setSubmittingComment(prev => new Set(prev).add(postId));

        try {
            const { data, error } = await supabase
                .from('post_comments')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content
                })
                .select(`
          *,
          profile:profiles!user_id (
            full_name, avatar_url, is_verified
          )
        `)
                .single();

            if (error) throw error;

            setPostComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), data]
            }));

            // Update comment count
            setPosts(posts.map(p =>
                p.id === postId
                    ? { ...p, comments_count: p.comments_count + 1 }
                    : p
            ));

            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        } catch (err) {
            console.error('Error commenting:', err);
        } finally {
            setSubmittingComment(prev => {
                const next = new Set(prev);
                next.delete(postId);
                return next;
            });
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            await supabase.from('posts').delete().eq('id', postId);
            setPosts(posts.filter(p => p.id !== postId));
        } catch (err) {
            console.error('Error deleting post:', err);
        }
    };

    const handleFollow = async (targetUserId: string) => {
        if (!user) return;

        const isFollowing = followingIds.has(targetUserId);

        const newFollowingIds = new Set(followingIds);
        if (isFollowing) {
            newFollowingIds.delete(targetUserId);
        } else {
            newFollowingIds.add(targetUserId);
        }
        setFollowingIds(newFollowingIds);

        try {
            if (isFollowing) {
                await supabase.from('connections').delete()
                    .eq('follower_id', user.id)
                    .eq('following_id', targetUserId);
            } else {
                await supabase.from('connections').insert({
                    follower_id: user.id,
                    following_id: targetUserId
                });
            }
        } catch (err) {
            if (isFollowing) {
                newFollowingIds.add(targetUserId);
            } else {
                newFollowingIds.delete(targetUserId);
            }
            setFollowingIds(newFollowingIds);
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
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar - Profile */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-4">
                            {/* Mini Profile Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="h-16 bg-gradient-to-r from-green-600 to-emerald-500" />
                                <div className="px-4 pb-4">
                                    <div className="relative -mt-8 mb-3">
                                        <div className="w-16 h-16 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {profile?.avatar_url ? (
                                                <Image src={profile.avatar_url} alt="" width={64} height={64} className="object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-gray-400">
                                                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link href={`/connect/${user?.id}`} className="block">
                                        <h3 className="font-bold text-gray-900 hover:text-green-600">{profile?.full_name || 'Complete Profile'}</h3>
                                    </Link>
                                    {profile?.organization_name && (
                                        <p className="text-sm text-gray-500">{profile.organization_name}</p>
                                    )}
                                    <Link
                                        href="/connect/dashboard"
                                        className="mt-3 block text-center py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                                    >
                                        View Dashboard
                                    </Link>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                <h3 className="font-bold text-gray-900 mb-3">Quick Links</h3>
                                <nav className="space-y-1">
                                    <Link href="/connect/directory" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm">Browse Directory</span>
                                    </Link>
                                    <Link href="/knowledgehub" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm">Knowledge Hub</span>
                                    </Link>
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-6 space-y-4">
                        {/* Create Post */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {profile?.avatar_url ? (
                                        <Image src={profile.avatar_url} alt="" width={40} height={40} className="object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-gray-400">
                                            {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        placeholder="Share an update, insight, or question..."
                                        className="w-full px-0 py-2 text-gray-900 placeholder-gray-400 border-0 resize-none focus:ring-0 focus:outline-none text-[15px]"
                                        rows={3}
                                    />

                                    {/* Image Preview */}
                                    {imagePreview && (
                                        <div className="relative mt-2 mb-3">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full max-h-80 object-cover rounded-xl"
                                            />
                                            <button
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="flex gap-1">
                                            {/* Image Upload */}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Add image"
                                            >
                                                <Camera className="w-5 h-5" />
                                            </button>

                                            {/* Emoji Picker */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Add emoji"
                                                >
                                                    <Smile className="w-5 h-5" />
                                                </button>

                                                <AnimatePresence>
                                                    {showEmojiPicker && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3 w-72 z-50"
                                                        >
                                                            {Object.entries(emojiCategories).map(([category, emojis]) => (
                                                                <div key={category} className="mb-3 last:mb-0">
                                                                    <p className="text-xs font-medium text-gray-500 mb-1.5">{category}</p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {emojis.map((emoji) => (
                                                                            <button
                                                                                key={emoji}
                                                                                onClick={() => insertEmoji(emoji)}
                                                                                className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition-colors"
                                                                            >
                                                                                {emoji}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePost}
                                            disabled={(!newPostContent.trim() && !newPostImage) || posting}
                                            className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Posts Feed */}
                        <div className="space-y-4">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                    >
                                        <div className="p-4">
                                            {/* Post Header */}
                                            <div className="flex items-start gap-3 mb-3">
                                                <Link href={`/connect/${post.user_id}`} className="flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                        {post.profile?.avatar_url ? (
                                                            <Image src={post.profile.avatar_url} alt="" width={40} height={40} className="object-cover" />
                                                        ) : (
                                                            <span className="text-lg font-bold text-gray-400">
                                                                {post.profile?.full_name?.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <Link href={`/connect/${post.user_id}`} className="font-bold text-gray-900 hover:underline truncate">
                                                            {post.profile?.full_name}
                                                        </Link>
                                                        {post.profile?.is_verified && (
                                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {post.profile?.organization_name || userTypeLabels[post.profile?.user_type]} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                {post.user_id === user?.id && (
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Post Content */}
                                            <p className="text-gray-900 whitespace-pre-wrap mb-3 text-[15px] leading-relaxed">{post.content}</p>

                                            {/* Post Image */}
                                            {post.image_url && (
                                                <div className="rounded-xl overflow-hidden mb-3 bg-gray-100">
                                                    <img src={post.image_url} alt="" className="w-full max-h-[500px] object-cover" />
                                                </div>
                                            )}

                                            {/* Post Actions */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleLike(post.id, post.user_has_liked || false)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${post.user_has_liked
                                                        ? 'text-red-500 bg-red-50'
                                                        : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                                        }`}
                                                >
                                                    <Heart className={`w-5 h-5 ${post.user_has_liked ? 'fill-current' : ''}`} />
                                                    <span className="text-sm font-medium">{post.likes_count || ''}</span>
                                                </button>
                                                <button
                                                    onClick={() => toggleComments(post.id)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${expandedComments.has(post.id)
                                                        ? 'text-blue-500 bg-blue-50'
                                                        : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
                                                        }`}
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                    <span className="text-sm font-medium">{post.comments_count || ''}</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                                                    <Repeat2 className="w-5 h-5" />
                                                </button>
                                                <button className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <Bookmark className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Comments Section */}
                                        <AnimatePresence>
                                            {expandedComments.has(post.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-gray-100 bg-gray-50"
                                                >
                                                    <div className="p-4 space-y-4">
                                                        {/* Comment Input */}
                                                        <div className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {profile?.avatar_url ? (
                                                                    <Image src={profile.avatar_url} alt="" width={32} height={32} className="object-cover" />
                                                                ) : (
                                                                    <span className="text-sm font-bold text-gray-400">
                                                                        {profile?.full_name?.charAt(0)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={commentInputs[post.id] || ''}
                                                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                                    placeholder="Write a comment..."
                                                                    className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                                />
                                                                <button
                                                                    onClick={() => handleComment(post.id)}
                                                                    disabled={!commentInputs[post.id]?.trim() || submittingComment.has(post.id)}
                                                                    className="px-3 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {submittingComment.has(post.id) ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <Send className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Comments List */}
                                                        {loadingComments.has(post.id) ? (
                                                            <div className="flex justify-center py-4">
                                                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                                            </div>
                                                        ) : postComments[post.id]?.length > 0 ? (
                                                            <div className="space-y-3">
                                                                {postComments[post.id].map((comment) => (
                                                                    <div key={comment.id} className="flex gap-3">
                                                                        <Link href={`/connect/${comment.user_id}`} className="flex-shrink-0">
                                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                                                {comment.profile?.avatar_url ? (
                                                                                    <Image src={comment.profile.avatar_url} alt="" width={32} height={32} className="object-cover" />
                                                                                ) : (
                                                                                    <span className="text-sm font-bold text-gray-400">
                                                                                        {comment.profile?.full_name?.charAt(0)}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </Link>
                                                                        <div className="flex-1 bg-white rounded-xl px-3 py-2">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <Link href={`/connect/${comment.user_id}`} className="text-sm font-semibold text-gray-900 hover:underline">
                                                                                    {comment.profile?.full_name}
                                                                                </Link>
                                                                                {comment.profile?.is_verified && (
                                                                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                                                                )}
                                                                                <span className="text-xs text-gray-400">
                                                                                    · {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-center text-sm text-gray-500 py-4">No comments yet. Be the first!</p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No posts yet</h3>
                                    <p className="text-gray-500 mb-4">Be the first to share something with the community!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            {/* People to Follow */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-900">People to Connect With</h3>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {suggestedUsers.map((person) => (
                                        <div key={person.id} className="p-4 flex items-center gap-3">
                                            <Link href={`/connect/${person.id}`} className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    {person.avatar_url ? (
                                                        <Image src={person.avatar_url} alt="" width={40} height={40} className="object-cover" />
                                                    ) : (
                                                        <span className="text-lg font-bold text-gray-400">
                                                            {person.full_name.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/connect/${person.id}`} className="block">
                                                    <p className="font-medium text-gray-900 truncate hover:text-green-600">{person.full_name}</p>
                                                </Link>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {person.organization_name || userTypeLabels[person.user_type]}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleFollow(person.id)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${followingIds.has(person.id)
                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                            >
                                                {followingIds.has(person.id) ? 'Following' : 'Follow'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/connect/directory" className="block p-4 text-center text-sm text-green-600 font-medium hover:bg-gray-50">
                                    View More
                                </Link>
                            </div>

                            {/* Trending Topics */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                <h3 className="font-bold text-gray-900 mb-3">Trending Topics</h3>
                                <div className="space-y-2">
                                    {['🌾 #PoultryFarming', '🌱 #OrganicAgriculture', '🚜 #AgTech', '🛒 #FarmToMarket', '♻️ #SustainableFarming'].map((tag) => (
                                        <button key={tag} className="block text-sm text-gray-700 hover:text-green-600 transition-colors">
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
