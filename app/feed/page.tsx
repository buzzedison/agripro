'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
    Heart, MessageCircle, Repeat2, Share, MoreHorizontal,
    Image as ImageIcon, Send, Loader2, Users, TrendingUp,
    Search, MapPin, CheckCircle, X, Bookmark, Smile, Camera,
    ChevronDown, ChevronUp, Trash2, Edit3, AlertTriangle,
    Play, ExternalLink, Volume2, VolumeX, Maximize2, Quote, BarChart2
} from 'lucide-react';
import PollCard from './components/PollCard';
import GifPicker from './components/GifPicker';
import LinkPreview, { extractUrls, parseContentWithLinks } from '../components/LinkPreview';
import { parseContentWithLinksAndHashtags, extractHashtags } from '@/lib/utils/hashtags';
import { parseContentWithAll, extractMentions, nameToUniqueSlug } from '@/lib/utils/mentions';
import { toast } from 'sonner';

// Video URL detection helpers
function isVideoUrl(url: string): boolean {
    if (!url) return false;
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i;
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i;
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/i;
    return videoExtensions.test(url) || youtubeRegex.test(url) || vimeoRegex.test(url);
}

function getVideoType(url: string): 'youtube' | 'vimeo' | 'direct' | null {
    if (!url) return null;
    if (/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i.test(url)) return 'youtube';
    if (/vimeo\.com/i.test(url)) return 'vimeo';
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return 'direct';
    return null;
}

function getYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
}

// Extract video URL from post content
function extractVideoUrl(content: string): string | null {
    const urls = extractUrls(content);
    for (const url of urls) {
        if (isVideoUrl(url)) return url;
    }
    return null;
}

// Inline Video Player Component
function InlineVideoPlayer({ url }: { url: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoType = getVideoType(url);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    if (videoType === 'youtube') {
        const videoId = getYouTubeId(url);
        if (!videoId) return null;

        return (
            <div className="relative rounded-xl overflow-hidden mb-3 bg-black group">
                <div className="relative aspect-video">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open on YouTube
                </a>
            </div>
        );
    }

    if (videoType === 'vimeo') {
        const videoId = getVimeoId(url);
        if (!videoId) return null;

        return (
            <div className="relative rounded-xl overflow-hidden mb-3 bg-black group">
                <div className="relative aspect-video">
                    <iframe
                        src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
                        title="Vimeo video"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open on Vimeo
                </a>
            </div>
        );
    }

    if (videoType === 'direct') {
        return (
            <div className="relative rounded-xl overflow-hidden mb-3 bg-black group">
                <video
                    ref={videoRef}
                    src={url}
                    className="w-full max-h-[500px] object-contain"
                    muted={isMuted}
                    playsInline
                    loop
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onClick={handlePlayPause}
                />

                {/* Play overlay when paused */}
                {!isPlaying && (
                    <button
                        onClick={handlePlayPause}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                        </div>
                    </button>
                )}

                {/* Controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePlayPause}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                            >
                                {isPlaying ? (
                                    <span className="text-sm font-bold">❚❚</span>
                                ) : (
                                    <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                                )}
                            </button>
                            <button
                                onClick={toggleMute}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                        </div>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-white text-xs font-medium hover:underline"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open video
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

const FEED_PAGE_SIZE = 20;

function LoadingFeedPlaceholder() {
    const skeletonLine = 'h-3 rounded-full bg-gray-200';
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="hidden lg:block lg:col-span-3 space-y-4">
                        {[1, 2].map((item) => (
                            <div key={`left-${item}`} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse">
                                <div className="h-20 rounded-xl bg-gray-200" />
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className={`${skeletonLine} w-3/4`} />
                                        <div className={`${skeletonLine} w-1/2`} />
                                    </div>
                                </div>
                                <div className={`${skeletonLine} w-full`} />
                                <div className={`${skeletonLine} w-2/3`} />
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-6 space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-200" />
                                <div className="flex-1 space-y-3">
                                    <div className={`${skeletonLine} w-1/2`} />
                                    <div className={`${skeletonLine} w-full`} />
                                    <div className={`${skeletonLine} w-5/6`} />
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="h-48 bg-gray-200 rounded-xl" />
                                <div className="flex gap-2">
                                    <div className="h-8 bg-gray-200 rounded-full flex-1" />
                                    <div className="h-8 bg-gray-200 rounded-full flex-1" />
                                </div>
                            </div>
                        </div>
                        {[1, 2].map((item) => (
                            <div key={`post-${item}`} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className={`${skeletonLine} w-2/3`} />
                                        <div className={`${skeletonLine} w-full`} />
                                    </div>
                                </div>
                                <div className="h-36 bg-gray-200 rounded-xl" />
                                <div className="flex gap-3">
                                    {[1, 2, 3].map((action) => (
                                        <div key={`action-${action}`} className="h-4 w-16 bg-gray-200 rounded-full" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden lg:block lg:col-span-3 space-y-4">
                        {[1, 2].map((item) => (
                            <div key={`right-${item}`} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse">
                                <div className={`${skeletonLine} w-2/3`} />
                                <div className={`${skeletonLine} w-1/2`} />
                                {[1, 2, 3].map((sub) => (
                                    <div key={`right-${item}-${sub}`} className={`${skeletonLine} w-full`} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ResilientImageProps {
    src?: string | null;
    alt: string;
    className?: string;
    fallbackText?: string;
}

function ResilientImage({ src, alt, className = '', fallbackText = 'Media unavailable' }: ResilientImageProps) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className={`${className} flex items-center justify-center bg-gray-100 text-gray-500 text-xs gap-2`}>
                <ImageIcon className="w-4 h-4" />
                <span>{fallbackText}</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
        />
    );
}

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
    gif_url: string | null;
    created_at: string;
    likes_count: number;
    comments_count: number;
    reposts_count: number;
    quoted_post_id?: string | null;
    quoted_post?: {
        id: string;
        content: string;
        image_url: string | null;
        gif_url: string | null;
        created_at: string;
        profile: {
            full_name: string;
            avatar_url: string | null;
            is_verified: boolean;
        };
    } | null;
    profile: {
        full_name: string;
        avatar_url: string | null;
        user_type: string;
        organization_name: string | null;
        is_verified: boolean;
    };
    user_has_liked?: boolean;
    user_has_reposted?: boolean;
    is_poll?: boolean;
    mentioned_users?: Map<string, string>; // Map of full_name -> user_id
}

interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    image_url?: string | null;
    gif_url?: string | null;
    parent_comment_id?: string | null;
    created_at: string;
    likes_count: number;
    user_has_liked?: boolean;
    profile: {
        full_name: string;
        avatar_url: string | null;
        is_verified: boolean;
    };
    replies?: Comment[];
}

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    header_url: string | null;
    bio: string | null;
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
    const prefersReducedMotion = useReducedMotion();

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

    // Poll state
    const [isPollMode, setIsPollMode] = useState(false);
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

    // GIF state
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [selectedGif, setSelectedGif] = useState<string | null>(null);
    const [commentGifs, setCommentGifs] = useState<Record<string, string | null>>({});
    const [showCommentGifPicker, setShowCommentGifPicker] = useState<string | null>(null); // commentId or postId

    // Connection/Social Features State (Restored)
    const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
    const [trendingHashtags, setTrendingHashtags] = useState<{ id: string; name: string; use_count: number }[]>([]);
    const [loadingTrending, setLoadingTrending] = useState(true);
    const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
    const [bookmarkingPost, setBookmarkingPost] = useState<Set<string>>(new Set());
    const [feedOffset, setFeedOffset] = useState(0);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [loadingMorePosts, setLoadingMorePosts] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const displayedTrendingHashtags = selectedHashtag
        ? trendingHashtags.filter((tag) => tag.name !== selectedHashtag)
        : trendingHashtags;

    // Mentions
    const [mentionSearchQuery, setMentionSearchQuery] = useState('');
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);
    const [mentionSuggestions, setMentionSuggestions] = useState<{
        full_name: string;
        id: string;
        avatar_url: string | null;
        user_type?: string;
        organization_name?: string;
        is_verified?: boolean;
    }[]>([]);
    const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Quote Reposts
    const [quoteModal, setQuoteModal] = useState<{ open: boolean; post: Post | null }>({ open: false, post: null });
    const [quoteContent, setQuoteContent] = useState('');

    // Reposts View
    const [repostsModal, setRepostsModal] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });
    const [repostMenuOpen, setRepostMenuOpen] = useState<string | null>(null);
    const [reposters, setReposters] = useState<any[]>([]);
    const [loadingReposters, setLoadingReposters] = useState(false);

    // Comments & Editing
    const [commentImages, setCommentImages] = useState<Record<string, { file: File; preview: string } | null>>({});
    const [saving, setSaving] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });
    const [editModal, setEditModal] = useState<{ open: boolean; post: Post | null }>({ open: false, post: null });
    const [editContent, setEditContent] = useState('');
    const [postMenuOpen, setPostMenuOpen] = useState<string | null>(null);
    const [editCommentModal, setEditCommentModal] = useState<{ open: boolean; comment: Comment | null; postId: string | null }>({ open: false, comment: null, postId: null });
    const [editCommentContent, setEditCommentContent] = useState('');
    const [commentMenuOpen, setCommentMenuOpen] = useState<string | null>(null); // commentId
    const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string; userName: string } | null>(null);
    const [showCommentEmoji, setShowCommentEmoji] = useState<string | null>(null); // postId or commentId logic


    const handleAddPollOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions([...pollOptions, '']);
        }
    };

    const handleRemovePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            const newOptions = [...pollOptions];
            newOptions.splice(index, 1);
            setPollOptions(newOptions);
        }
    };

    const handlePollOptionChange = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    useEffect(() => {
        checkAuth();
        fetchTrendingHashtags();
        fetchBookmarkedPosts();
    }, []);

    // Fetch posts by hashtag when selectedHashtag changes
    useEffect(() => {
        if (!user) return;
        if (selectedHashtag) {
            fetchPostsByHashtag(selectedHashtag);
        } else {
            setFeedOffset(0);
            setHasMorePosts(true);
            fetchPosts(user.id, { offset: 0 });
        }
    }, [selectedHashtag, user]);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login?redirectTo=/feed');
            return;
        }
        setUser(user);
        await Promise.all([
            fetchProfile(user.id),
            fetchPosts(user.id, { offset: 0 }),
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

    const fetchPosts = async (userId: string, options: { offset?: number; append?: boolean } = {}) => {
        const { offset = 0, append = false } = options;
        const limit = FEED_PAGE_SIZE;

        if (append) {
            setLoadingMorePosts(true);
        }

        try {
            // Fetch posts using the new network feed RPC function
            // This prioritizes connections but also returns other posts
            let postsData: any[] = [];

            try {
                const { data, error } = await supabase.rpc('get_network_feed', {
                    p_limit: limit,
                    p_offset: offset
                });

                if (error) {
                    console.error('Error fetching feed via RPC, falling back to basic query:', error);
                    // Fallback to basic query if RPC fails (e.g. migration not run yet)
                    const { data: fallbackData } = await supabase
                        .from('posts')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .range(offset, offset + limit - 1);
                    postsData = fallbackData || [];
                } else {
                    postsData = data || [];
                }
            } catch (err) {
                console.error('Unexpected error fetching feed:', err);
                // Fallback
                const { data: fallbackData } = await supabase
                    .from('posts')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .range(offset, offset + limit - 1);
                postsData = fallbackData || [];
            }

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

                // Check which posts the user has reposted
                const { data: repostsData } = await supabase
                    .from('post_reposts')
                    .select('post_id')
                    .eq('user_id', userId);

                const repostedPostIds = new Set(repostsData?.map(r => r.post_id) || []);

                // Fetch mentioned users for all posts
                const postIds = postsData.map(p => p.id);
                const postMentionsMap = new Map<string, Map<string, string>>();

                // Try to get mentions from post_mentions table first
                try {
                    const { data: mentionsData } = await supabase
                        .from('post_mentions')
                        .select('post_id, mentioned_user_id')
                        .in('post_id', postIds);

                    // Get profiles for mentioned users
                    const mentionedUserIds = [...new Set(mentionsData?.map(m => m.mentioned_user_id) || [])];

                    if (mentionedUserIds.length > 0) {
                        const { data: mentionedProfiles } = await supabase
                            .from('profiles')
                            .select('id, full_name')
                            .in('id', mentionedUserIds);

                        const mentionedProfilesMap = new Map(mentionedProfiles?.map(p => [p.id, p]) || []);

                        // Build mentioned users map per post
                        mentionsData?.forEach(mention => {
                            const profile = mentionedProfilesMap.get(mention.mentioned_user_id);
                            if (profile) {
                                if (!postMentionsMap.has(mention.post_id)) {
                                    postMentionsMap.set(mention.post_id, new Map());
                                }
                                postMentionsMap.get(mention.post_id)!.set(profile.full_name, profile.id);
                            }
                        });
                    }
                } catch (mentionError) {
                    // Table might not exist yet, fall through to extract from content
                    console.log('post_mentions table not available, extracting from content');
                }

                // Fallback: Extract mentions from content and look up users
                // This handles posts created before the mentions table existed
                const mentionRegex = /@([a-zA-Z][a-zA-Z0-9\s]+?)(?=\s|$|[^\w])/g;
                const allMentionNames = new Set<string>();
                postsData.forEach(post => {
                    if (!postMentionsMap.has(post.id)) {
                        const matches = post.content.matchAll(mentionRegex);
                        for (const match of matches) {
                            allMentionNames.add(match[1].trim());
                        }
                    }
                });

                // Look up users by name if we have mentions not in the table
                if (allMentionNames.size > 0) {
                    // Use ilike for case-insensitive partial matching
                    const mentionNamesArray = Array.from(allMentionNames);
                    const { data: usersByName } = await supabase
                        .from('profiles')
                        .select('id, full_name');

                    // Build a map for flexible matching
                    const allProfiles = usersByName || [];

                    // Add to posts that don't have mentions from the table
                    postsData.forEach(post => {
                        if (!postMentionsMap.has(post.id)) {
                            const matches = post.content.matchAll(mentionRegex);
                            const postMentions = new Map<string, string>();
                            for (const match of matches) {
                                const mentionName = match[1].trim().toLowerCase();
                                // Find matching user - try exact match first, then partial
                                const matchedUser = allProfiles.find(u => {
                                    const fullNameLower = u.full_name.toLowerCase();
                                    return fullNameLower === mentionName ||
                                        fullNameLower.startsWith(mentionName) ||
                                        mentionName.startsWith(fullNameLower);
                                });
                                if (matchedUser) {
                                    // Store with full_name as key for proper slug generation
                                    postMentions.set(matchedUser.full_name, matchedUser.id);
                                }
                            }
                            if (postMentions.size > 0) {
                                postMentionsMap.set(post.id, postMentions);
                            }
                        }
                    });
                }

                const postsWithProfiles = postsData.map(post => ({
                    ...post,
                    profile: profilesMap.get(post.user_id) || {
                        full_name: 'AgriPro Member',
                        avatar_url: null,
                        user_type: 'farmer',
                        organization_name: null,
                        is_verified: false,
                        profile_incomplete: true,
                    },
                    user_has_liked: likedPostIds.has(post.id),
                    user_has_reposted: repostedPostIds.has(post.id),
                    mentioned_users: postMentionsMap.get(post.id) || new Map()
                }));

                setPosts(prev => {
                    if (append) {
                        const existingIds = new Set(prev.map(p => p.id));
                        const merged = postsWithProfiles.filter(p => !existingIds.has(p.id));
                        return [...prev, ...merged];
                    }
                    return postsWithProfiles;
                });

                setFeedOffset(offset + postsWithProfiles.length);
                setHasMorePosts(postsWithProfiles.length === limit);
            } else if (!append) {
                setPosts([]);
                setFeedOffset(0);
                setHasMorePosts(false);
            } else {
                setHasMorePosts(false);
            }
        } finally {
            if (append) {
                setLoadingMorePosts(false);
            }
        }
    };

    const loadMorePosts = () => {
        if (!user || loadingMorePosts || !hasMorePosts || selectedHashtag) return;
        fetchPosts(user.id, { offset: feedOffset, append: true });
    };

    const fetchPostsByHashtag = async (hashtag: string) => {
        if (!user) return;

        setLoading(true);
        setHasMorePosts(false);
        try {
            const response = await fetch(`/api/feed/hashtags?tag=${encodeURIComponent(hashtag)}`);
            const data = await response.json();

            if (data.posts && data.posts.length > 0) {
                // Check which posts the user has liked
                const { data: likesData } = await supabase
                    .from('post_likes')
                    .select('post_id')
                    .eq('user_id', user.id);

                const likedPostIds = new Set(likesData?.map(l => l.post_id) || []);

                // Check which posts the user has reposted
                const { data: repostsData } = await supabase
                    .from('post_reposts')
                    .select('post_id')
                    .eq('user_id', user.id);

                const repostedPostIds = new Set(repostsData?.map(r => r.post_id) || []);

                const postsWithLikes = data.posts.map((post: any) => ({
                    ...post,
                    user_has_liked: likedPostIds.has(post.id),
                    user_has_reposted: repostedPostIds.has(post.id)
                }));

                setPosts(postsWithLikes);
                setFeedOffset(postsWithLikes.length);
            } else {
                setPosts([]);
                setFeedOffset(0);
            }
        } catch (error) {
            console.error('Error fetching posts by hashtag:', error);
            setPosts([]);
            setFeedOffset(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrendingHashtags = async () => {
        setLoadingTrending(true);
        try {
            const response = await fetch('/api/feed/trending');
            const data = await response.json();
            setTrendingHashtags(data.hashtags || []);
        } catch (error) {
            console.error('Error fetching trending hashtags:', error);
            setTrendingHashtags([]);
        } finally {
            setLoadingTrending(false);
        }
    };

    const fetchBookmarkedPosts = async () => {
        try {
            const response = await fetch('/api/feed/bookmarks');
            const data = await response.json();
            if (data.posts) {
                const bookmarkedIds = new Set<string>(data.posts.map((p: any) => p.id));
                setBookmarkedPostIds(bookmarkedIds);
            }
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        }
    };

    const handleBookmark = async (postId: string, isBookmarked: boolean) => {
        if (!user) return;

        setBookmarkingPost(prev => new Set(prev).add(postId));

        // Optimistic update
        setBookmarkedPostIds(prev => {
            const newSet = new Set(prev);
            if (isBookmarked) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });

        try {
            if (isBookmarked) {
                // Remove bookmark
                const response = await fetch(`/api/feed/bookmarks?postId=${postId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Failed to remove bookmark');
            } else {
                // Add bookmark
                const response = await fetch('/api/feed/bookmarks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId })
                });
                if (!response.ok) throw new Error('Failed to add bookmark');
            }
        } catch (error) {
            console.error('Error bookmarking post:', error);
            // Revert optimistic update on error
            setBookmarkedPostIds(prev => {
                const newSet = new Set(prev);
                if (isBookmarked) {
                    newSet.add(postId);
                } else {
                    newSet.delete(postId);
                }
                return newSet;
            });
        } finally {
            setBookmarkingPost(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
        }
    };

    const fetchSuggestedUsers = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, header_url, bio, user_type, organization_name, country, is_verified')
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

        // Fetch all comments including replies
        const { data: commentsData } = await supabase
            .from('post_comments')
            .select('*, parent_comment_id, image_url, likes_count')
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

            // Fetch which comments the current user has liked
            const commentIds = commentsData.map(c => c.id);
            let likedCommentIds = new Set<string>();
            if (user && commentIds.length > 0) {
                const { data: likedData } = await supabase
                    .from('comment_likes')
                    .select('comment_id')
                    .eq('user_id', user.id)
                    .in('comment_id', commentIds);
                likedCommentIds = new Set(likedData?.map(l => l.comment_id) || []);
            }

            // Add profiles to all comments
            const allComments = commentsData.map(comment => ({
                ...comment,
                likes_count: comment.likes_count || 0,
                user_has_liked: likedCommentIds.has(comment.id),
                profile: profilesMap.get(comment.user_id) || {
                    full_name: 'AgriPro Member',
                    avatar_url: null,
                    is_verified: false,
                },
                replies: [] as Comment[]
            }));

            // Separate top-level comments and replies
            const topLevelComments: Comment[] = [];
            const repliesMap = new Map<string, Comment[]>();

            allComments.forEach(comment => {
                if (comment.parent_comment_id) {
                    const existing = repliesMap.get(comment.parent_comment_id) || [];
                    existing.push(comment);
                    repliesMap.set(comment.parent_comment_id, existing);
                } else {
                    topLevelComments.push(comment);
                }
            });

            // Attach replies to parent comments
            topLevelComments.forEach(comment => {
                comment.replies = repliesMap.get(comment.id) || [];
            });

            setPostComments(prev => ({ ...prev, [postId]: topLevelComments }));
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

    const handlePostContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNewPostContent(value);

        // Detect @ mention
        const cursorPosition = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const mentionMatch = textBeforeCursor.match(/@([a-zA-Z][a-zA-Z0-9\s]*)$/);

        if (mentionMatch) {
            const query = mentionMatch[1];
            setMentionSearchQuery(query);

            if (query.length >= 1) {
                // Search for users
                try {
                    const response = await fetch(`/api/feed/mentions?q=${encodeURIComponent(query)}`);
                    if (!response.ok) {
                        console.error('Mention search failed:', response.status);
                        setShowMentionDropdown(false);
                        return;
                    }
                    const data = await response.json();
                    setMentionSuggestions(data.users || []);
                    setShowMentionDropdown(data.users && data.users.length > 0);
                    setSelectedMentionIndex(0);
                } catch (error) {
                    console.error('Error searching mentions:', error);
                    setShowMentionDropdown(false);
                    setMentionSuggestions([]);
                }
            } else {
                setShowMentionDropdown(false);
            }
        } else {
            setShowMentionDropdown(false);
            setMentionSuggestions([]);
        }
    };

    const insertMention = (user: any) => {
        if (!textareaRef.current) return;

        const cursorPosition = textareaRef.current.selectionStart;
        const textBeforeCursor = newPostContent.substring(0, cursorPosition);
        const textAfterCursor = newPostContent.substring(cursorPosition);

        // Find the @ symbol position
        const mentionMatch = textBeforeCursor.match(/@([a-zA-Z][a-zA-Z0-9\s]*)$/);
        if (!mentionMatch) return;

        const beforeMention = textBeforeCursor.substring(0, textBeforeCursor.lastIndexOf('@'));
        const newContent = `${beforeMention}@${user.full_name} ${textAfterCursor}`;

        setNewPostContent(newContent);
        setShowMentionDropdown(false);
        setMentionSuggestions([]);

        // Focus back on textarea
        setTimeout(() => {
            if (textareaRef.current) {
                const newCursorPos = beforeMention.length + user.full_name.length + 2;
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handleMentionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showMentionDropdown || mentionSuggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedMentionIndex(prev =>
                prev < mentionSuggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedMentionIndex(prev => prev > 0 ? prev - 1 : 0);
        } else if (e.key === 'Enter' && mentionSuggestions[selectedMentionIndex]) {
            e.preventDefault();
            insertMention(mentionSuggestions[selectedMentionIndex]);
        } else if (e.key === 'Escape') {
            setShowMentionDropdown(false);
        }
    };

    const handlePost = async () => {
        if ((!newPostContent.trim() && !newPostImage && !isPollMode) || !user) return;

        // Validation for poll
        if (isPollMode) {
            if (pollOptions.some(opt => !opt.trim())) {
                toast.error('Please fill in all poll options');
                return;
            }
        }

        setPosting(true);
        setUploadStatus(isPollMode ? 'Preparing your poll...' : 'Preparing your update...');
        try {
            let imageUrl = null;

            // Upload image if present
            if (newPostImage) {
                setUploadStatus('Uploading image...');
                const fileExt = newPostImage.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('post-images')
                    .upload(fileName, newPostImage);

                if (uploadError) {
                    console.error('Image upload error:', uploadError.message);
                    // Continue without image if upload fails
                    toast.error('Image upload failed. Posting without the image.');
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('post-images')
                        .getPublicUrl(fileName);
                    imageUrl = publicUrl;
                }
                setUploadStatus('Publishing your update...');
            } else {
                setUploadStatus('Publishing your update...');
            }

            // Insert the post
            const { data: newPost, error: insertError } = await supabase
                .from('posts')
                .insert({
                    user_id: user.id,
                    content: newPostContent.trim(),
                    image_url: imageUrl,
                    gif_url: selectedGif,
                    is_poll: isPollMode
                })
                .select('*')
                .single();

            if (insertError) {
                console.error('Insert error:', insertError.message);
                throw insertError;
            }

            // Insert Poll Options
            if (isPollMode && newPost) {
                const optionsToInsert = pollOptions.map((opt, index) => ({
                    post_id: newPost.id,
                    option_text: opt,
                    index: index
                }));

                const { error: optionsError } = await supabase
                    .from('poll_options')
                    .insert(optionsToInsert);

                if (optionsError) {
                    console.error('Error creating poll options:', optionsError);
                    toast.error('Poll options failed to save. Please try again.');
                    // Non-fatal, but bad UX.
                }
            }

            // Save hashtags if any exist in the content
            const hashtags = extractHashtags(newPostContent);
            if (hashtags.length > 0 && newPost.id) {
                try {
                    await fetch('/api/feed/hashtags', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            postId: newPost.id,
                            content: newPostContent
                        })
                    });
                } catch (hashtagError) {
                    console.error('Error saving hashtags:', hashtagError);
                }
            }

            // Save mentions and get mentioned user data for display
            let mentionedUsersMap = new Map<string, string>();
            const mentions = extractMentions(newPostContent);
            if (mentions.length > 0 && newPost.id) {
                try {
                    const mentionResponse = await fetch('/api/feed/mentions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            postId: newPost.id,
                            content: newPostContent
                        })
                    });
                    const mentionData = await mentionResponse.json();
                    // Build map from response
                    if (mentionData.mentionedUsers) {
                        mentionData.mentionedUsers.forEach((u: { full_name: string; id: string }) => {
                            mentionedUsersMap.set(u.full_name, u.id);
                        });
                    }
                } catch (mentionError) {
                    console.error('Error saving mentions:', mentionError);
                }
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
                user_has_liked: false,
                mentioned_users: mentionedUsersMap
            };

            setPosts(prev => [postWithProfile, ...prev]);
            setNewPostContent('');
            removeImage();
            setSelectedGif(null);
            setIsPollMode(false);
            setPollOptions(['', '']);
            toast.success('Post shared with your network.');
        } catch (err: any) {
            console.error('Error posting:', err?.message || err);
            toast.error(`Failed to post: ${err?.message || 'Unknown error'}`);
        } finally {
            setPosting(false);
            setUploadStatus(null);
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

    const handleCommentLike = async (postId: string, commentId: string, isLiked: boolean) => {
        if (!user) return;

        // Optimistic update — update the comment in postComments state
        const updateComments = (comments: Comment[]): Comment[] =>
            comments.map(c => {
                if (c.id === commentId) {
                    return {
                        ...c,
                        likes_count: c.likes_count + (isLiked ? -1 : 1),
                        user_has_liked: !isLiked,
                    };
                }
                if (c.replies) {
                    return { ...c, replies: updateComments(c.replies) };
                }
                return c;
            });

        setPostComments(prev => ({
            ...prev,
            [postId]: updateComments(prev[postId] || []),
        }));

        try {
            if (isLiked) {
                await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id);
            } else {
                await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id });
            }
        } catch (err) {
            // Revert on error
            const revertComments = (comments: Comment[]): Comment[] =>
                comments.map(c => {
                    if (c.id === commentId) {
                        return {
                            ...c,
                            likes_count: c.likes_count + (isLiked ? 1 : -1),
                            user_has_liked: isLiked,
                        };
                    }
                    if (c.replies) {
                        return { ...c, replies: revertComments(c.replies) };
                    }
                    return c;
                });

            setPostComments(prev => ({
                ...prev,
                [postId]: revertComments(prev[postId] || []),
            }));
        }
    };

    const handleRepost = async (postId: string, isReposted: boolean) => {
        if (!user) return;

        // Optimistic update
        setPosts(posts.map(p =>
            p.id === postId
                ? { ...p, reposts_count: p.reposts_count + (isReposted ? -1 : 1), user_has_reposted: !isReposted }
                : p
        ));

        try {
            if (isReposted) {
                await supabase.from('post_reposts').delete().eq('post_id', postId).eq('user_id', user.id);
            } else {
                await supabase.from('post_reposts').insert({ post_id: postId, user_id: user.id });
            }
        } catch (err) {
            // Revert on error
            setPosts(posts.map(p =>
                p.id === postId
                    ? { ...p, reposts_count: p.reposts_count + (isReposted ? 1 : -1), user_has_reposted: isReposted }
                    : p
            ));
        }
    };

    const handleQuoteRepost = async () => {
        if (!quoteModal.post || !quoteContent.trim() || !user) return;

        setPosting(true);
        try {
            // Create a new post with the quoted post reference
            const { data: newPost, error: insertError } = await supabase
                .from('posts')
                .insert({
                    user_id: user.id,
                    content: quoteContent.trim(),
                    quoted_post_id: quoteModal.post.id
                })
                .select('*')
                .single();

            if (insertError) throw insertError;

            // Add the quote post to the feed
            const postWithProfile: Post = {
                ...newPost,
                profile: {
                    full_name: profile?.full_name || 'Anonymous',
                    avatar_url: profile?.avatar_url || null,
                    user_type: profile?.user_type || 'farmer',
                    organization_name: profile?.organization_name || null,
                    is_verified: profile?.is_verified || false,
                },
                quoted_post: {
                    id: quoteModal.post.id,
                    content: quoteModal.post.content,
                    image_url: quoteModal.post.image_url,
                    created_at: quoteModal.post.created_at,
                    profile: quoteModal.post.profile
                },
                user_has_liked: false,
                user_has_reposted: false
            };

            setPosts([postWithProfile, ...posts]);

            // Also increment the repost count on the original post
            setPosts(prev => prev.map(p =>
                p.id === quoteModal.post!.id
                    ? { ...p, reposts_count: p.reposts_count + 1 }
                    : p
            ));

            setQuoteModal({ open: false, post: null });
            setQuoteContent('');

            // Save hashtags if any exist in the quote content
            const hashtags = extractHashtags(quoteContent);
            if (hashtags.length > 0 && newPost.id) {
                try {
                    await fetch('/api/feed/hashtags', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            postId: newPost.id,
                            content: quoteContent
                        })
                    });
                } catch (hashtagError) {
                    console.error('Error saving hashtags for quote post:', hashtagError);
                }
            }

            // Save mentions if any exist in the quote content
            const mentions = extractMentions(quoteContent);
            if (mentions.length > 0 && newPost.id) {
                try {
                    await fetch('/api/feed/mentions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            postId: newPost.id,
                            content: quoteContent
                        })
                    });
                } catch (mentionError) {
                    console.error('Error saving mentions for quote post:', mentionError);
                }
            }
        } catch (err: any) {
            console.error('Error creating quote post:', err?.message || err);
        } finally {
            setPosting(false);
        }
    };

    const openQuoteModal = (post: Post) => {
        setQuoteContent('');
        setQuoteModal({ open: true, post });
        setRepostMenuOpen(null);
    };

    const fetchReposters = async (postId: string) => {
        setLoadingReposters(true);
        try {
            // Get all reposts for this post
            const { data: repostsData, error: repostsError } = await supabase
                .from('post_reposts')
                .select('user_id, created_at')
                .eq('post_id', postId)
                .order('created_at', { ascending: false });

            if (repostsError) throw repostsError;

            if (repostsData && repostsData.length > 0) {
                const userIds = repostsData.map(r => r.user_id);

                // Fetch profiles for these users
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, user_type')
                    .in('id', userIds);

                const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

                const repostersWithProfiles = repostsData.map(r => ({
                    id: r.user_id,
                    full_name: profilesMap.get(r.user_id)?.full_name || 'AgriPro Member',
                    avatar_url: profilesMap.get(r.user_id)?.avatar_url || null,
                    user_type: profilesMap.get(r.user_id)?.user_type || 'farmer',
                    created_at: r.created_at
                }));

                setReposters(repostersWithProfiles);
            } else {
                setReposters([]);
            }
        } catch (err) {
            console.error('Error fetching reposters:', err);
            setReposters([]);
        } finally {
            setLoadingReposters(false);
        }
    };

    const openRepostsModal = async (postId: string) => {
        setRepostsModal({ open: true, postId });
        await fetchReposters(postId);
    };

    const handleComment = async (postId: string, parentCommentId?: string) => {
        const inputKey = parentCommentId ? `reply-${parentCommentId}` : postId;
        const content = commentInputs[inputKey]?.trim() || '';
        const hasImage = !!commentImages[inputKey];
        if ((!content && !hasImage) || !user) return;

        setSubmittingComment(prev => new Set(prev).add(inputKey));

        try {
            // Upload image if present
            let imageUrl: string | null = null;
            const commentImage = commentImages[inputKey];
            if (commentImage?.file) {
                const fileExt = commentImage.file.name.split('.').pop();
                const fileName = `comment-${Date.now()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('post-images')
                    .upload(filePath, commentImage.file);

                if (!uploadError) {
                    const { data: publicUrl } = supabase.storage
                        .from('post-images')
                        .getPublicUrl(filePath);
                    imageUrl = publicUrl.publicUrl;
                }
            }

            // Insert the comment
            const { data, error } = await supabase
                .from('post_comments')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content,
                    parent_comment_id: parentCommentId || null,
                    image_url: imageUrl,
                    gif_url: commentGifs[inputKey] || null
                })
                .select('*')
                .single();

            if (error) {
                console.error('Supabase comment error:', error.message, error.code, error.details);
                throw error;
            }

            if (data) {
                // Construct the comment with current user's profile data
                const commentWithProfile: Comment = {
                    ...data,
                    profile: {
                        full_name: profile?.full_name || 'Unknown',
                        avatar_url: profile?.avatar_url || null,
                        is_verified: profile?.is_verified || false,
                    }
                };

                if (parentCommentId) {
                    // Add reply to parent comment (could be top-level or nested)
                    setPostComments(prev => ({
                        ...prev,
                        [postId]: (prev[postId] || []).map(c => {
                            // Check if this is the parent
                            if (c.id === parentCommentId) {
                                return { ...c, replies: [...(c.replies || []), commentWithProfile] };
                            }
                            // Check if parent is in nested replies
                            if (c.replies && c.replies.some(r => r.id === parentCommentId)) {
                                return {
                                    ...c,
                                    replies: c.replies.map(r =>
                                        r.id === parentCommentId
                                            ? { ...r, replies: [...(r.replies || []), commentWithProfile] }
                                            : r
                                    )
                                };
                            }
                            return c;
                        })
                    }));
                } else {
                    // Add as top-level comment
                    setPostComments(prev => ({
                        ...prev,
                        [postId]: [...(prev[postId] || []), commentWithProfile]
                    }));
                }

                // Update comment count
                setPosts(posts.map(p =>
                    p.id === postId
                        ? { ...p, comments_count: p.comments_count + 1 }
                        : p
                ));

                // Save mentions for notifications if comment text includes any
                if (content && data.id) {
                    const mentions = extractMentions(content);
                    if (mentions.length > 0) {
                        try {
                            await fetch('/api/feed/mentions', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    commentId: data.id,
                                    content
                                })
                            });
                        } catch (mentionError) {
                            console.error('Error saving mentions for comment:', mentionError);
                        }
                    }
                }

                setCommentInputs(prev => ({ ...prev, [inputKey]: '' }));
                setCommentImages(prev => ({ ...prev, [inputKey]: null }));
                setCommentGifs(prev => ({ ...prev, [inputKey]: null }));
                setReplyingTo(null);
            }
        } catch (err: any) {
            console.error('Error commenting:', err?.message || err?.code || JSON.stringify(err));
        } finally {
            setSubmittingComment(prev => {
                const next = new Set(prev);
                next.delete(postId);
                return next;
            });
        }
    };

    const handleDeletePost = async (postId: string) => {
        setSaving(true);
        try {
            await supabase.from('posts').delete().eq('id', postId);
            setPosts(posts.filter(p => p.id !== postId));
            setDeleteModal({ open: false, postId: null });
        } catch (err) {
            console.error('Error deleting post:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleEditPost = async () => {
        if (!editModal.post || !editContent.trim()) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('posts')
                .update({ content: editContent.trim() })
                .eq('id', editModal.post.id);

            if (error) throw error;

            setPosts(posts.map(p =>
                p.id === editModal.post!.id
                    ? { ...p, content: editContent.trim() }
                    : p
            ));
            setEditModal({ open: false, post: null });
            setEditContent('');
        } catch (err) {
            console.error('Error editing post:', err);
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (post: Post) => {
        setEditContent(post.content);
        setEditModal({ open: true, post });
        setPostMenuOpen(null);
    };

    const openDeleteModal = (postId: string) => {
        setDeleteModal({ open: true, postId });
        setPostMenuOpen(null);
    };

    const handleEditComment = async () => {
        if (!editCommentModal.comment || !editCommentContent.trim() || !editCommentModal.postId) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('post_comments')
                .update({ content: editCommentContent.trim() })
                .eq('id', editCommentModal.comment.id);

            if (error) throw error;

            // Update comment in state
            setPostComments(prev => ({
                ...prev,
                [editCommentModal.postId!]: prev[editCommentModal.postId!]?.map(c =>
                    c.id === editCommentModal.comment!.id
                        ? { ...c, content: editCommentContent.trim() }
                        : c
                ) || []
            }));

            setEditCommentModal({ open: false, comment: null, postId: null });
            setEditCommentContent('');
        } catch (err) {
            console.error('Error editing comment:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteComment = async (commentId: string, postId: string) => {
        try {
            const { error } = await supabase
                .from('post_comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;

            // Remove comment from state
            setPostComments(prev => ({
                ...prev,
                [postId]: prev[postId]?.filter(c => c.id !== commentId) || []
            }));

            // Update comment count
            setPosts(posts.map(p =>
                p.id === postId
                    ? { ...p, comments_count: Math.max(p.comments_count - 1, 0) }
                    : p
            ));

            setCommentMenuOpen(null);
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const openEditCommentModal = (comment: Comment, postId: string) => {
        setEditCommentContent(comment.content);
        setEditCommentModal({ open: true, comment, postId });
        setCommentMenuOpen(null);
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
        return <LoadingFeedPlaceholder />;
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
                                {/* Header Photo or Gradient */}
                                {profile?.header_url ? (
                                    <div className="h-20 relative overflow-hidden">
                                        <Image
                                            src={profile.header_url}
                                            alt=""
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-16 bg-gradient-to-r from-green-600 to-emerald-500" />
                                )}
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
                                    <Link href={`/connect/${profile?.full_name && user?.id ? nameToUniqueSlug(profile.full_name, user.id) : user?.id}`} className="block">
                                        <h3 className="font-bold text-gray-900 hover:text-green-600">{profile?.full_name || 'Complete Profile'}</h3>
                                    </Link>
                                    {profile?.organization_name && (
                                        <p className="text-sm text-gray-500">{profile.organization_name}</p>
                                    )}
                                    {/* Bio */}
                                    {profile?.bio && (
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{profile.bio}</p>
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
                        {/* Hashtag Filter Indicator */}
                        {selectedHashtag && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Viewing posts tagged with
                                            </p>
                                            <p className="text-lg font-bold text-green-600">
                                                #{selectedHashtag}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedHashtag(null)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear Filter
                                    </button>
                                </div>
                            </div>
                        )}

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
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={textareaRef}
                                        value={newPostContent}
                                        onChange={handlePostContentChange}
                                        onKeyDown={handleMentionKeyDown}
                                        placeholder="Share an update, insight, or question... (Use @ to mention, # for hashtags)"
                                        className="w-full px-0 py-2 text-gray-900 placeholder-gray-400 border-0 resize-none focus:ring-0 focus:outline-none text-[15px]"
                                        rows={3}
                                    />

                                    {/* Mention Autocomplete Dropdown */}
                                    {showMentionDropdown && mentionSuggestions.length > 0 && (
                                        <div className="absolute left-0 top-full mt-1 w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-60 overflow-y-auto">
                                            {mentionSuggestions.map((user, index) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => insertMention(user)}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${index === selectedMentionIndex
                                                        ? 'bg-green-50 text-green-900'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {user.avatar_url ? (
                                                            <Image
                                                                src={user.avatar_url}
                                                                alt=""
                                                                width={40}
                                                                height={40}
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-bold text-gray-400">
                                                                {user.full_name?.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-semibold text-sm">{user.full_name}</p>
                                                            {user.is_verified && (
                                                                <CheckCircle className="w-4 h-4 text-green-600 fill-current" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 capitalize">
                                                            {user.user_type?.replace('_', ' ')}
                                                            {user.organization_name && ` • ${user.organization_name}`}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

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

                                    {/* GIF Preview */}
                                    {selectedGif && (
                                        <div className="relative mt-2 mb-3">
                                            <img
                                                src={selectedGif}
                                                alt="GIF Preview"
                                                className="w-full max-h-80 object-cover rounded-xl"
                                            />
                                            <button
                                                onClick={() => setSelectedGif(null)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {isPollMode && (
                                        <div className="mb-4 space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            {pollOptions.map((option, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder={`Option ${index + 1}`}
                                                        value={option}
                                                        onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                                        className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                                    />
                                                    {pollOptions.length > 2 && (
                                                        <button
                                                            onClick={() => handleRemovePollOption(index)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {pollOptions.length < 4 && (
                                                <button
                                                    onClick={handleAddPollOption}
                                                    className="text-sm font-medium text-green-600 hover:text-green-700 px-2 py-1"
                                                >
                                                    + Add option
                                                </button>
                                            )}
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

                                            {/* GIF Toggle */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowGifPicker(!showGifPicker)}
                                                    aria-expanded={showGifPicker}
                                                    aria-label="Add GIF"
                                                    className={`p-2 rounded-lg transition-colors ${showGifPicker
                                                        ? "text-blue-600 bg-blue-50"
                                                        : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                        }`}
                                                    title="Add GIF"
                                                >
                                                    <span className="text-xs font-bold border rounded px-1 border-current">GIF</span>
                                                </button>
                                                {showGifPicker && (
                                                    <GifPicker
                                                        onSelect={(url) => {
                                                            setSelectedGif(url);
                                                            setShowGifPicker(false);
                                                        }}
                                                        onClose={() => setShowGifPicker(false)}
                                                    />
                                                )}
                                            </div>

                                            {/* Emoji Picker */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Add emoji"
                                                >
                                                    <Smile className="w-5 h-5" />
                                                </button>

                                                {/* Poll Toggle */}
                                                <button
                                                    onClick={() => !newPostImage && setIsPollMode(!isPollMode)}
                                                    disabled={!!newPostImage}
                                                    aria-pressed={isPollMode}
                                                    className={`p-2 rounded-lg transition-colors ${isPollMode
                                                        ? "text-green-600 bg-green-50"
                                                        : "text-gray-400 hover:text-green-600 hover:bg-green-50 disabled:opacity-50"
                                                        }`}
                                                   title="Create poll"
                                               >
                                                    <BarChart2 className="w-5 h-5 transform rotate-90" />
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

                                        <div className="flex flex-col items-end gap-1 text-right">
                                            {uploadStatus && (
                                                <span className="text-xs text-gray-500">{uploadStatus}</span>
                                            )}
                                            <button
                                                onClick={handlePost}
                                                disabled={(!newPostContent.trim() && !newPostImage && !isPollMode) || posting}
                                                className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                {isPollMode ? 'Publish poll' : 'Post'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Posts Feed */}
                        <div className="space-y-4">
                            {posts.length > 0 ? (
                                posts.map((post) => {
                                    const commentsForPost = postComments[post.id] || [];
                                    const commentCount = commentsForPost.length;
                                    const shouldAnimateComments = !prefersReducedMotion && commentCount <= 15;
                                    const hasComments = commentCount > 0;

                                    return (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                        >
                                        <div className="p-4">
                                            {/* Post Header */}
                                            <div className="flex items-start gap-3 mb-3">
                                                <Link href={`/connect/${post.profile?.full_name ? nameToUniqueSlug(post.profile.full_name, post.user_id) : post.user_id}`} className="flex-shrink-0">
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
                                                        <Link href={`/connect/${post.profile?.full_name ? nameToUniqueSlug(post.profile.full_name, post.user_id) : post.user_id}`} className="font-bold text-gray-900 hover:underline truncate">
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
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setPostMenuOpen(postMenuOpen === post.id ? null : post.id)}
                                                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                                        >
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </button>

                                                        <AnimatePresence>
                                                            {postMenuOpen === post.id && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                    className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
                                                                >
                                                                    <button
                                                                        onClick={() => openEditModal(post)}
                                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        <Edit3 className="w-4 h-4" />
                                                                        Edit post
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openDeleteModal(post.id)}
                                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        Delete post
                                                                    </button>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Post Content */}
                                            <p className="text-gray-900 whitespace-pre-wrap mb-3 text-[15px] leading-relaxed">
                                                {parseContentWithAll(
                                                    post.content,
                                                    (hashtag) => {
                                                        setSelectedHashtag(hashtag);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    },
                                                    (mention) => {
                                                        // Fallback: Navigate to user profile search
                                                        router.push(`/connect?search=${encodeURIComponent(mention)}`);
                                                    },
                                                    post.mentioned_users
                                                )}
                                            </p>

                                            {/* Video Player - if video URL found in content */}
                                            {(() => {
                                                const videoUrl = extractVideoUrl(post.content);
                                                if (videoUrl) {
                                                    return <InlineVideoPlayer url={videoUrl} />;
                                                }
                                                return null;
                                            })()}

                                            {/* Link Preview - skip if it's a video URL */}
                                            {extractUrls(post.content)
                                                .filter(url => !isVideoUrl(url))
                                                .slice(0, 1)
                                                .map((url) => (
                                                    <LinkPreview key={url} url={url} />
                                                ))}

                                            {/* Post Image or Video */}
                                            {post.image_url && (
                                                isVideoUrl(post.image_url) ? (
                                                    <InlineVideoPlayer url={post.image_url} />
                                                ) : (
                                                    <div className="rounded-xl overflow-hidden mb-3 bg-gray-100">
                                                        <ResilientImage src={post.image_url} alt="Post media" className="w-full max-h-[500px] object-cover" />
                                                    </div>
                                                )
                                            )}

                                            {/* GIF Display */}
                                            {post.gif_url && (
                                                <div className="rounded-xl overflow-hidden mb-3 bg-gray-100">
                                                    <ResilientImage src={post.gif_url} alt="GIF" className="w-full max-h-[500px] object-cover" fallbackText="GIF unavailable" />
                                                </div>
                                            )}

                                            {/* Poll Display */}
                                            {post.is_poll && (
                                                <PollCard postId={post.id} userId={user?.id || ''} />
                                            )}

                                            {/* Quoted Post Embed */}
                                            {post.quoted_post && (
                                                <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
                                                    <Link href={`/feed#post-${post.quoted_post.id}`} className="block p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                                {post.quoted_post.profile?.avatar_url ? (
                                                                    <Image src={post.quoted_post.profile.avatar_url} alt="" width={24} height={24} className="object-cover" />
                                                                ) : (
                                                                    <span className="text-xs font-bold text-gray-400">
                                                                        {post.quoted_post.profile?.full_name?.charAt(0)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {post.quoted_post.profile?.full_name}
                                                            </span>
                                                            {post.quoted_post.profile?.is_verified && (
                                                                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                            )}
                                                            <span className="text-xs text-gray-400">
                                                                · {formatDistanceToNow(new Date(post.quoted_post.created_at), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 line-clamp-3">{post.quoted_post.content}</p>
                                        {post.quoted_post.image_url && (
                                            <div className="mt-2 rounded-lg overflow-hidden bg-gray-200">
                                                <ResilientImage
                                                    src={post.quoted_post.image_url}
                                                    alt="Quoted post media"
                                                    className="w-full max-h-32 object-cover"
                                                />
                                            </div>
                                        )}
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Post Actions */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleLike(post.id, post.user_has_liked || false)}
                                                    aria-pressed={post.user_has_liked || false}
                                                    aria-label={post.user_has_liked ? 'Unlike post' : 'Like post'}
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
                                                    aria-expanded={expandedComments.has(post.id)}
                                                    aria-controls={`comments-${post.id}`}
                                                    aria-label={expandedComments.has(post.id) ? 'Hide comments' : 'Show comments'}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${expandedComments.has(post.id)
                                                        ? 'text-blue-500 bg-blue-50'
                                                        : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
                                                        }`}
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                    <span className="text-sm font-medium">{post.comments_count || ''}</span>
                                                </button>
                                                {/* Repost Dropdown */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setRepostMenuOpen(repostMenuOpen === post.id ? null : post.id)}
                                                        aria-pressed={post.user_has_reposted || false}
                                                        aria-label={post.user_has_reposted ? 'Undo repost' : 'Repost'}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${post.user_has_reposted
                                                            ? 'text-green-500 bg-green-50'
                                                            : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                                                            }`}
                                                    >
                                                        <Repeat2 className={`w-5 h-5 ${post.user_has_reposted ? 'stroke-[2.5px]' : ''}`} />
                                                        <span className="text-sm font-medium">{post.reposts_count || ''}</span>
                                                    </button>
                                                    <AnimatePresence>
                                                        {repostMenuOpen === post.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                className="absolute left-0 bottom-full mb-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
                                                            >
                                                                <button
                                                                    onClick={() => {
                                                                        handleRepost(post.id, post.user_has_reposted || false);
                                                                        setRepostMenuOpen(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    <Repeat2 className="w-4 h-4" />
                                                                    {post.user_has_reposted ? 'Undo Repost' : 'Repost'}
                                                                </button>
                                                                <button
                                                                    onClick={() => openQuoteModal(post)}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    <Quote className="w-4 h-4" />
                                                                    Quote
                                                                </button>
                                                                {post.reposts_count > 0 && (
                                                                    <>
                                                                        <div className="border-t border-gray-100 my-1" />
                                                                        <button
                                                                            onClick={() => {
                                                                                openRepostsModal(post.id);
                                                                                setRepostMenuOpen(null);
                                                                            }}
                                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                                        >
                                                                            <Users className="w-4 h-4" />
                                                                            View Reposts
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                <button
                                                    onClick={() => handleBookmark(post.id, !!bookmarkedPostIds.has(post.id))}
                                                    disabled={bookmarkingPost.has(post.id)}
                                                    aria-pressed={bookmarkedPostIds.has(post.id)}
                                                    aria-label={bookmarkedPostIds.has(post.id) ? 'Remove bookmark' : 'Save post'}
                                                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${bookmarkedPostIds.has(post.id)
                                                        ? "text-green-600"
                                                        : "text-gray-500 hover:text-green-600"
                                                        }`}
                                                >
                                                    {bookmarkingPost.has(post.id) ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Bookmark className={`w-5 h-5 ${bookmarkedPostIds.has(post.id) ? "fill-current" : ""}`} />
                                                    )}</button>
                                            </div>
                                        </div>

                                        {/* Comments Section */}
                                        <AnimatePresence initial={false}>
                                            {expandedComments.has(post.id) && (
                                                <motion.div
                                                    id={`comments-${post.id}`}
                                                    initial={shouldAnimateComments ? { height: 0, opacity: 0 } : false}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={shouldAnimateComments ? { height: 0, opacity: 0 } : { opacity: 0 }}
                                                    transition={shouldAnimateComments ? { duration: 0.2 } : { duration: 0.15 }}
                                                    className="border-t border-gray-100 bg-gray-50"
                                                >
                                                    <div className="divide-y divide-gray-100">
                                                        {/* Comments List - Twitter Style */}
                                                        {loadingComments.has(post.id) ? (
                                                            <div className="flex justify-center py-8">
                                                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                                            </div>
                                                        ) : hasComments ? (
                                                            <div>
                                                                {commentsForPost.map((comment, commentIndex) => (
                                                                    <div key={comment.id} className="relative">
                                                                        {/* Main Comment */}
                                                                        <div className="flex px-4 py-3 hover:bg-gray-50/50 transition-colors">
                                                                            {/* Avatar Column with Thread Line */}
                                                                            <div className="flex flex-col items-center mr-3">
                                                                                <Link href={`/connect/${comment.profile?.full_name ? nameToUniqueSlug(comment.profile.full_name, comment.user_id) : comment.user_id}`} className="relative z-10">
                                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-white">
                                                                                        {comment.profile?.avatar_url ? (
                                                                                            <Image src={comment.profile.avatar_url} alt="" width={40} height={40} className="object-cover" />
                                                                                        ) : (
                                                                                            <span className="text-sm font-bold text-gray-500">
                                                                                                {comment.profile?.full_name?.charAt(0)}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </Link>
                                                                                {/* Thread line to replies */}
                                                                                {(comment.replies && comment.replies.length > 0) && (
                                                                                    <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-[20px]" />
                                                                                )}
                                                                            </div>

                                                                            {/* Content */}
                                                                            <div className="flex-1 min-w-0">
                                                                                {/* Header */}
                                                                                <div className="flex items-center justify-between gap-2">
                                                                                    <div className="flex items-center gap-1 min-w-0">
                                                                                        <Link href={`/connect/${comment.profile?.full_name ? nameToUniqueSlug(comment.profile.full_name, comment.user_id) : comment.user_id}`} className="font-bold text-[15px] text-gray-900 hover:underline truncate">
                                                                                            {comment.profile?.full_name}
                                                                                        </Link>
                                                                                        {comment.profile?.is_verified && (
                                                                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                                                        )}
                                                                                        <span className="text-gray-500 text-[15px] flex-shrink-0">·</span>
                                                                                        <span className="text-gray-500 text-[15px] flex-shrink-0">
                                                                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: false })}
                                                                                        </span>
                                                                                    </div>
                                                                                    {comment.user_id === user?.id && (
                                                                                        <div className="relative flex-shrink-0">
                                                                                            <button
                                                                                                onClick={() => setCommentMenuOpen(commentMenuOpen === comment.id ? null : comment.id)}
                                                                                                className="p-1.5 -m-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                                                                            >
                                                                                                <MoreHorizontal className="w-4 h-4" />
                                                                                            </button>
                                                                                            <AnimatePresence>
                                                                                                {commentMenuOpen === comment.id && (
                                                                                                    <motion.div
                                                                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                                                                        className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden"
                                                                                                    >
                                                                                                        <button
                                                                                                            onClick={() => openEditCommentModal(comment, post.id)}
                                                                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                                                                        >
                                                                                                            <Edit3 className="w-4 h-4" />
                                                                                                            Edit
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={() => handleDeleteComment(comment.id, post.id)}
                                                                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                                                                                        >
                                                                                                            <Trash2 className="w-4 h-4" />
                                                                                                            Delete
                                                                                                        </button>
                                                                                                    </motion.div>
                                                                                                )}
                                                                                            </AnimatePresence>
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                {/* Comment Text */}
                                                                                <p className="text-[15px] text-gray-900 mt-0.5 whitespace-pre-wrap break-words">
                                                                                    {parseContentWithAll(
                                                                                        comment.content,
                                                                                        (hashtag) => {
                                                                                            setSelectedHashtag(hashtag);
                                                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                                        },
                                                                                        (mention) => {
                                                                                            router.push(`/connect?search=${encodeURIComponent(mention)}`);
                                                                                        }
                                                                                    )}
                                                                                </p>

                                                                                {/* Comment Image */}
                                                                                {comment.image_url && (
                                                                                    <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
                                                                                        <ResilientImage
                                                                                            src={comment.image_url}
                                                                                            alt="Comment image"
                                                                                            className="max-h-80 w-auto object-cover"
                                                                                            fallbackText="Image unavailable"
                                                                                        />
                                                                                    </div>
                                                                                )}

                                                                                {/* Comment GIF */}
                                                                                {comment.gif_url && (
                                                                                    <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
                                                                                        <ResilientImage
                                                                                            src={comment.gif_url}
                                                                                            alt="Comment GIF"
                                                                                            className="max-h-80 w-auto object-cover"
                                                                                            fallbackText="GIF unavailable"
                                                                                        />
                                                                                    </div>
                                                                                )}

                                                                                {/* Actions */}
                                                                                <div className="flex items-center gap-6 mt-3 -ml-2">
                                                                                    <button
                                                                                        onClick={() => setReplyingTo(
                                                                                            replyingTo?.commentId === comment.id
                                                                                                ? null
                                                                                                : { postId: post.id, commentId: comment.id, userName: comment.profile?.full_name || '' }
                                                                                        )}
                                                                                        className="flex items-center gap-1.5 px-2 py-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors group"
                                                                                    >
                                                                                        <MessageCircle className="w-4 h-4" />
                                                                                        {comment.replies && comment.replies.length > 0 && (
                                                                                            <span className="text-xs font-medium">{comment.replies.length}</span>
                                                                                        )}
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleCommentLike(post.id, comment.id, comment.user_has_liked || false)}
                                                                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors ${comment.user_has_liked ? 'text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}
                                                                                    >
                                                                                        <Heart className={`w-4 h-4 ${comment.user_has_liked ? 'fill-current' : ''}`} />
                                                                                        {comment.likes_count > 0 && (
                                                                                            <span className="text-xs font-medium">{comment.likes_count}</span>
                                                                                        )}
                                                                                    </button>
                                                                                </div>

                                                                                {/* Reply Input - Twitter Style */}
                                                                                <AnimatePresence>
                                                                                    {replyingTo?.commentId === comment.id && (
                                                                                        <motion.div
                                                                                            initial={{ opacity: 0, height: 0 }}
                                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                                            exit={{ opacity: 0, height: 0 }}
                                                                                            className="mt-3 overflow-hidden"
                                                                                        >
                                                                                            <div className="flex gap-3">
                                                                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                                                    {profile?.avatar_url ? (
                                                                                                        <Image src={profile.avatar_url} alt="" width={32} height={32} className="object-cover" />
                                                                                                    ) : (
                                                                                                        <span className="text-xs font-bold text-gray-400">
                                                                                                            {profile?.full_name?.charAt(0)}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                                <div className="flex-1">
                                                                                                    <div className="text-xs text-gray-500 mb-1">
                                                                                                        Replying to <span className="text-green-600">@{comment.profile?.full_name?.split(' ')[0]?.toLowerCase()}</span>
                                                                                                    </div>
                                                                                                    <input
                                                                                                        type="text"
                                                                                                        value={commentInputs[`reply-${comment.id}`] || ''}
                                                                                                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [`reply-${comment.id}`]: e.target.value }))}
                                                                                                        onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id, comment.id)}
                                                                                                        placeholder="Post your reply"
                                                                                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                                                                        autoFocus
                                                                                                    />
                                                                                                    {/* Image Preview */}
                                                                                                    {commentImages[`reply-${comment.id}`] && (
                                                                                                        <div className="relative inline-block mt-2">
                                                                                                            <img
                                                                                                                src={commentImages[`reply-${comment.id}`]!.preview}
                                                                                                                alt="Preview"
                                                                                                                className="h-16 rounded-lg object-cover"
                                                                                                            />
                                                                                                            <button
                                                                                                                onClick={() => setCommentImages(prev => ({ ...prev, [`reply-${comment.id}`]: null }))}
                                                                                                                className="absolute -top-1.5 -right-1.5 p-0.5 bg-gray-900 text-white rounded-full hover:bg-gray-700"
                                                                                                            >
                                                                                                                <X className="w-3 h-3" />
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {/* Comment GIF Preview */}
                                                                                                    {commentGifs[`reply-${comment.id}`] && (
                                                                                                        <div className="relative inline-block mt-2">
                                                                                                            <img
                                                                                                                src={commentGifs[`reply-${comment.id}`]!}
                                                                                                                alt="GIF Preview"
                                                                                                                className="h-24 rounded-lg object-cover"
                                                                                                            />
                                                                                                            <button
                                                                                                                onClick={() => setCommentGifs(prev => ({ ...prev, [`reply-${comment.id}`]: null }))}
                                                                                                                className="absolute -top-1.5 -right-1.5 p-0.5 bg-gray-900 text-white rounded-full hover:bg-gray-700"
                                                                                                            >
                                                                                                                <X className="w-3 h-3" />
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    <div className="flex items-center justify-between mt-2">
                                                                                                        <div className="flex items-center gap-1">
                                                                                                            {/* GIF Picker for Reply */}
                                                                                                            <div className="relative">
                                                                                                                <button
                                                                                                                    onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        setShowCommentGifPicker(showCommentGifPicker === `reply-${comment.id}` ? null : `reply-${comment.id}`);
                                                                                                                    }}
                                                                                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                                                                                >
                                                                                                                    <span className="text-[10px] font-bold border rounded px-0.5 border-current">GIF</span>
                                                                                                                </button>
                                                                                                                {showCommentGifPicker === `reply-${comment.id}` && (
                                                                                                                    <div className="absolute left-0 top-full mt-1 z-[60]">
                                                                                                                        <GifPicker
                                                                                                                            onSelect={(url) => {
                                                                                                                                setCommentGifs(prev => ({ ...prev, [`reply-${comment.id}`]: url }));
                                                                                                                                setShowCommentGifPicker(null);
                                                                                                                            }}
                                                                                                                            onClose={() => setShowCommentGifPicker(null)}
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                )}
                                                                                                            </div>

                                                                                                            <label className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors cursor-pointer">
                                                                                                                <Camera className="w-4 h-4" />
                                                                                                                <input
                                                                                                                    type="file"
                                                                                                                    accept="image/*"
                                                                                                                    className="hidden"
                                                                                                                    onChange={(e) => {
                                                                                                                        const file = e.target.files?.[0];
                                                                                                                        if (file) {
                                                                                                                            setCommentImages(prev => ({
                                                                                                                                ...prev,
                                                                                                                                [`reply-${comment.id}`]: {
                                                                                                                                    file,
                                                                                                                                    preview: URL.createObjectURL(file)
                                                                                                                                }
                                                                                                                            }));
                                                                                                                        }
                                                                                                                    }}
                                                                                                                />
                                                                                                            </label>
                                                                                                            <div className="relative">
                                                                                                                <button
                                                                                                                    onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        setShowCommentEmoji(showCommentEmoji === `reply-${comment.id}` ? null : `reply-${comment.id}`);
                                                                                                                    }}
                                                                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                                                                                >
                                                                                                                    <Smile className="w-4 h-4" />
                                                                                                                </button>
                                                                                                                {showCommentEmoji === `reply-${comment.id}` && (
                                                                                                                    <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-[100]">
                                                                                                                        <div className="grid grid-cols-6 gap-1">
                                                                                                                            {['😀', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🙌', '💪', '🌱', '🚀', '✨'].map(emoji => (
                                                                                                                                <button
                                                                                                                                    key={emoji}
                                                                                                                                    onClick={(e) => {
                                                                                                                                        e.stopPropagation();
                                                                                                                                        setCommentInputs(prev => ({
                                                                                                                                            ...prev,
                                                                                                                                            [`reply-${comment.id}`]: (prev[`reply-${comment.id}`] || '') + emoji
                                                                                                                                        }));
                                                                                                                                        setShowCommentEmoji(null);
                                                                                                                                    }}
                                                                                                                                    className="text-xl hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
                                                                                                                                >
                                                                                                                                    {emoji}
                                                                                                                                </button>
                                                                                                                            ))}
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <button
                                                                                                            onClick={() => handleComment(post.id, comment.id)}
                                                                                                            disabled={(!commentInputs[`reply-${comment.id}`]?.trim() && !commentImages[`reply-${comment.id}`]) || submittingComment.has(`reply-${comment.id}`)}
                                                                                                            className="px-4 py-1.5 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                                                        >
                                                                                                            {submittingComment.has(`reply-${comment.id}`) ? (
                                                                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                                                            ) : (
                                                                                                                'Reply'
                                                                                                            )}
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </motion.div>
                                                                                    )}
                                                                                </AnimatePresence>
                                                                            </div>
                                                                        </div>

                                                                        {/* Threaded Replies */}
                                                                        {comment.replies && comment.replies.length > 0 && (
                                                                            <div className="relative">
                                                                                {comment.replies.map((reply, replyIndex) => (
                                                                                    <div key={reply.id} className="flex px-4 py-3 hover:bg-gray-50/50 transition-colors">
                                                                                        {/* Reply Avatar with Thread Line */}
                                                                                        <div className="flex flex-col items-center mr-3">
                                                                                            {/* Connecting line from parent */}
                                                                                            <div className="w-0.5 h-3 bg-gray-200 -mt-3" />
                                                                                            <Link href={`/connect/${reply.profile?.full_name ? nameToUniqueSlug(reply.profile.full_name, reply.user_id) : reply.user_id}`} className="relative z-10">
                                                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-white">
                                                                                                    {reply.profile?.avatar_url ? (
                                                                                                        <Image src={reply.profile.avatar_url} alt="" width={32} height={32} className="object-cover" />
                                                                                                    ) : (
                                                                                                        <span className="text-xs font-bold text-gray-500">
                                                                                                            {reply.profile?.full_name?.charAt(0)}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                            </Link>
                                                                                            {/* Continue line if more replies or if replying to this */}
                                                                                            {(replyIndex < comment.replies!.length - 1 || replyingTo?.commentId === reply.id) && (
                                                                                                <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                                                                                            )}
                                                                                        </div>

                                                                                        {/* Reply Content */}
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <div className="flex items-center justify-between gap-2">
                                                                                                <div className="flex items-center gap-1 min-w-0">
                                                                                                    <Link href={`/connect/${reply.profile?.full_name ? nameToUniqueSlug(reply.profile.full_name, reply.user_id) : reply.user_id}`} className="font-bold text-[14px] text-gray-900 hover:underline truncate">
                                                                                                        {reply.profile?.full_name}
                                                                                                    </Link>
                                                                                                    {reply.profile?.is_verified && (
                                                                                                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                                                                                    )}
                                                                                                    <span className="text-gray-500 text-[14px]">·</span>
                                                                                                    <span className="text-gray-500 text-[14px]">
                                                                                                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: false })}
                                                                                                    </span>
                                                                                                </div>
                                                                                                {reply.user_id === user?.id && (
                                                                                                    <div className="relative flex-shrink-0">
                                                                                                        <button
                                                                                                            onClick={() => setCommentMenuOpen(commentMenuOpen === reply.id ? null : reply.id)}
                                                                                                            className="p-1 -m-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                                                                                        >
                                                                                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                                                                                        </button>
                                                                                                        <AnimatePresence>
                                                                                                            {commentMenuOpen === reply.id && (
                                                                                                                <motion.div
                                                                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                                                                                    className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden"
                                                                                                                >
                                                                                                                    <button
                                                                                                                        onClick={() => handleDeleteComment(reply.id, post.id)}
                                                                                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                                                                                    >
                                                                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                                                                        Delete
                                                                                                                    </button>
                                                                                                                </motion.div>
                                                                                                            )}
                                                                                                        </AnimatePresence>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="text-xs text-gray-500 -mt-0.5">
                                                                                                Replying to <span className="text-green-600">@{comment.profile?.full_name?.split(' ')[0]?.toLowerCase()}</span>
                                                                                            </div>
                                                                                            <p className="text-[14px] text-gray-900 mt-1 whitespace-pre-wrap break-words">
                                                                                                {parseContentWithAll(
                                                                                                    reply.content,
                                                                                                    (hashtag) => {
                                                                                                        setSelectedHashtag(hashtag);
                                                                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                                                    },
                                                                                                    (mention) => {
                                                                                                        router.push(`/connect?search=${encodeURIComponent(mention)}`);
                                                                                                    }
                                                                                                )}
                                                                                            </p>
                                                                                            {reply.image_url && (
                                                                                                <div className="mt-2 rounded-xl overflow-hidden border border-gray-200">
                                                                                                    <ResilientImage
                                                                                                        src={reply.image_url}
                                                                                                        alt="Reply image"
                                                                                                        className="max-h-60 w-auto object-cover"
                                                                                                        fallbackText="Image unavailable"
                                                                                                    />
                                                                                                </div>
                                                                                            )}

                                                                                            {/* Reply Action for nested replies */}
                                                                                            <div className="flex items-center gap-4 mt-2 -ml-1">
                                                                                                <button
                                                                                                    onClick={() => setReplyingTo(
                                                                                                        replyingTo?.commentId === reply.id
                                                                                                            ? null
                                                                                                            : { postId: post.id, commentId: reply.id, userName: reply.profile?.full_name || '' }
                                                                                                    )}
                                                                                                    className="flex items-center gap-1 px-1.5 py-0.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors text-xs"
                                                                                                >
                                                                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                                                                    <span>Reply</span>
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => handleCommentLike(post.id, reply.id, reply.user_has_liked || false)}
                                                                                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-colors text-xs ${reply.user_has_liked ? 'text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}
                                                                                                >
                                                                                                    <Heart className={`w-3.5 h-3.5 ${reply.user_has_liked ? 'fill-current' : ''}`} />
                                                                                                    {reply.likes_count > 0 && (
                                                                                                        <span>{reply.likes_count}</span>
                                                                                                    )}
                                                                                                </button>
                                                                                            </div>

                                                                                            {/* Reply Input for nested comment */}
                                                                                            <AnimatePresence>
                                                                                                {replyingTo?.commentId === reply.id && (
                                                                                                    <motion.div
                                                                                                        initial={{ opacity: 0, height: 0 }}
                                                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                                                        exit={{ opacity: 0, height: 0 }}
                                                                                                        className="mt-3 overflow-hidden"
                                                                                                    >
                                                                                                        <div className="flex gap-2">
                                                                                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                                                                {profile?.avatar_url ? (
                                                                                                                    <Image src={profile.avatar_url} alt="" width={24} height={24} className="object-cover" />
                                                                                                                ) : (
                                                                                                                    <span className="text-[10px] font-bold text-gray-400">
                                                                                                                        {profile?.full_name?.charAt(0)}
                                                                                                                    </span>
                                                                                                                )}
                                                                                                            </div>
                                                                                                            <div className="flex-1">
                                                                                                                <div className="text-[11px] text-gray-500 mb-1">
                                                                                                                    Replying to <span className="text-green-600">@{reply.profile?.full_name?.split(' ')[0]?.toLowerCase()}</span>
                                                                                                                </div>
                                                                                                                <input
                                                                                                                    type="text"
                                                                                                                    value={commentInputs[`reply-${reply.id}`] || ''}
                                                                                                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [`reply-${reply.id}`]: e.target.value }))}
                                                                                                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id, reply.id)}
                                                                                                                    placeholder="Post your reply"
                                                                                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                                                                                    autoFocus
                                                                                                                />
                                                                                                                {/* Image Preview */}
                                                                                                                {commentImages[`reply-${reply.id}`] && (
                                                                                                                    <div className="relative inline-block mt-2">
                                                                                                                        <img
                                                                                                                            src={commentImages[`reply-${reply.id}`]!.preview}
                                                                                                                            alt="Preview"
                                                                                                                            className="h-14 rounded-lg object-cover"
                                                                                                                        />
                                                                                                                        <button
                                                                                                                            onClick={() => setCommentImages(prev => ({ ...prev, [`reply-${reply.id}`]: null }))}
                                                                                                                            className="absolute -top-1 -right-1 p-0.5 bg-gray-900 text-white rounded-full hover:bg-gray-700"
                                                                                                                        >
                                                                                                                            <X className="w-2.5 h-2.5" />
                                                                                                                        </button>
                                                                                                                    </div>
                                                                                                                )}
                                                                                                                <div className="flex items-center justify-between mt-2">
                                                                                                                    <div className="flex items-center gap-1">
                                                                                                                        <label className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors cursor-pointer">
                                                                                                                            <Camera className="w-4 h-4" />
                                                                                                                            <input
                                                                                                                                type="file"
                                                                                                                                accept="image/*"
                                                                                                                                className="hidden"
                                                                                                                                onChange={(e) => {
                                                                                                                                    const file = e.target.files?.[0];
                                                                                                                                    if (file) {
                                                                                                                                        setCommentImages(prev => ({
                                                                                                                                            ...prev,
                                                                                                                                            [`reply-${reply.id}`]: {
                                                                                                                                                file,
                                                                                                                                                preview: URL.createObjectURL(file)
                                                                                                                                            }
                                                                                                                                        }));
                                                                                                                                    }
                                                                                                                                }}
                                                                                                                            />
                                                                                                                        </label>
                                                                                                                        <div className="relative">
                                                                                                                            <button
                                                                                                                                onClick={(e) => {
                                                                                                                                    e.stopPropagation();
                                                                                                                                    setShowCommentEmoji(showCommentEmoji === `reply-${reply.id}` ? null : `reply-${reply.id}`);
                                                                                                                                }}
                                                                                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                                                                                            >
                                                                                                                                <Smile className="w-4 h-4" />
                                                                                                                            </button>
                                                                                                                            {showCommentEmoji === `reply-${reply.id}` && (
                                                                                                                                <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-[100]">
                                                                                                                                    <div className="grid grid-cols-6 gap-1">
                                                                                                                                        {['😀', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🙌', '💪', '🌱', '🚀', '✨'].map(emoji => (
                                                                                                                                            <button
                                                                                                                                                key={emoji}
                                                                                                                                                onClick={(e) => {
                                                                                                                                                    e.stopPropagation();
                                                                                                                                                    setCommentInputs(prev => ({
                                                                                                                                                        ...prev,
                                                                                                                                                        [`reply-${reply.id}`]: (prev[`reply-${reply.id}`] || '') + emoji
                                                                                                                                                    }));
                                                                                                                                                    setShowCommentEmoji(null);
                                                                                                                                                }}
                                                                                                                                                className="text-xl hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
                                                                                                                                            >
                                                                                                                                                {emoji}
                                                                                                                                            </button>
                                                                                                                                        ))}
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <button
                                                                                                                        onClick={() => handleComment(post.id, reply.id)}
                                                                                                                        disabled={(!commentInputs[`reply-${reply.id}`]?.trim() && !commentImages[`reply-${reply.id}`]) || submittingComment.has(`reply-${reply.id}`)}
                                                                                                                        className="px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                                                                    >
                                                                                                                        {submittingComment.has(`reply-${reply.id}`) ? (
                                                                                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                                                                                        ) : (
                                                                                                                            'Reply'
                                                                                                                        )}
                                                                                                                    </button>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </motion.div>
                                                                                                )}
                                                                                            </AnimatePresence>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="py-8 text-center">
                                                                <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                                <p className="text-sm text-gray-500">No comments yet</p>
                                                                <p className="text-xs text-gray-400 mt-1">Be the first to reply!</p>
                                                            </div>
                                                        )}

                                                        {/* New Comment Input - Twitter Style */}
                                                        <div className="p-4 border-t border-gray-100">
                                                            <div className="flex gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                    {profile?.avatar_url ? (
                                                                        <Image src={profile.avatar_url} alt="" width={40} height={40} className="object-cover" />
                                                                    ) : (
                                                                        <span className="text-sm font-bold text-gray-500">
                                                                            {profile?.full_name?.charAt(0)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <input
                                                                        type="text"
                                                                        value={commentInputs[post.id] || ''}
                                                                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleComment(post.id)}
                                                                        placeholder="Post your reply"
                                                                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-[15px] focus:ring-2 focus:ring-green-500 focus:bg-white placeholder-gray-500 transition-colors"
                                                                    />
                                                                    {/* Image Preview */}
                                                                    {commentImages[post.id] && (
                                                                        <div className="relative inline-block mt-3">
                                                                            <img
                                                                                src={commentImages[post.id]!.preview}
                                                                                alt="Preview"
                                                                                className="h-20 rounded-xl object-cover"
                                                                            />
                                                                            <button
                                                                                onClick={() => setCommentImages(prev => ({ ...prev, [post.id]: null }))}
                                                                                className="absolute -top-2 -right-2 p-1 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center justify-between mt-3">
                                                                        <div className="flex items-center gap-1">
                                                                            <label className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors cursor-pointer" title="Add image">
                                                                                <Camera className="w-5 h-5" />
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    className="hidden"
                                                                                    onChange={(e) => {
                                                                                        const file = e.target.files?.[0];
                                                                                        if (file) {
                                                                                            setCommentImages(prev => ({
                                                                                                ...prev,
                                                                                                [post.id]: {
                                                                                                    file,
                                                                                                    preview: URL.createObjectURL(file)
                                                                                                }
                                                                                            }));
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </label>
                                                                            <div className="relative">
                                                                                <button
                                                                                    onClick={() => setShowCommentEmoji(showCommentEmoji === post.id ? null : post.id)}
                                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                                                    title="Add emoji"
                                                                                >
                                                                                    <Smile className="w-5 h-5" />
                                                                                </button>
                                                                                <AnimatePresence>
                                                                                    {showCommentEmoji === post.id && (
                                                                                        <motion.div
                                                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                                                            className="absolute left-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50"
                                                                                        >
                                                                                            <div className="grid grid-cols-6 gap-1">
                                                                                                {['😀', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🙌', '💪', '🌱', '🚀', '✨'].map(emoji => (
                                                                                                    <button
                                                                                                        key={emoji}
                                                                                                        onClick={() => {
                                                                                                            setCommentInputs(prev => ({
                                                                                                                ...prev,
                                                                                                                [post.id]: (prev[post.id] || '') + emoji
                                                                                                            }));
                                                                                                            setShowCommentEmoji(null);
                                                                                                        }}
                                                                                                        className="text-xl hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
                                                                                                    >
                                                                                                        {emoji}
                                                                                                    </button>
                                                                                                ))}
                                                                                            </div>
                                                                                        </motion.div>
                                                                                    )}
                                                                                </AnimatePresence>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleComment(post.id)}
                                                                            disabled={(!commentInputs[post.id]?.trim() && !commentImages[post.id]) || submittingComment.has(post.id)}
                                                                            className="px-5 py-2 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                        >
                                                                            {submittingComment.has(post.id) ? (
                                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                            ) : (
                                                                                'Reply'
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                    );
                                })
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No posts yet</h3>
                                    <p className="text-gray-500 mb-4">Be the first to share something with the community!</p>
                                </div>
                            )}

                            {!selectedHashtag && posts.length > 0 && (
                                <div className="flex justify-center pt-2">
                                    <button
                                        onClick={loadMorePosts}
                                        disabled={!hasMorePosts || loadingMorePosts}
                                        aria-busy={loadingMorePosts}
                                        className="px-5 py-2.5 text-sm font-semibold rounded-full border border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loadingMorePosts ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Loading more posts...
                                            </>
                                        ) : hasMorePosts ? (
                                            'Load more posts'
                                        ) : (
                                            "You're all caught up"
                                        )}
                                    </button>
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
                                    <h3 className="font-bold text-gray-900">
                                        {selectedHashtag ? `Voices in #${selectedHashtag}` : 'People to Connect With'}
                                    </h3>
                                    {selectedHashtag && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Connect with members who often share insights on this topic.
                                        </p>
                                    )}
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {suggestedUsers.map((person) => (
                                        <div key={person.id} className="p-4 flex items-center gap-3">
                                            <Link href={`/connect/${nameToUniqueSlug(person.full_name, person.id)}`} className="flex-shrink-0">
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
                                                <Link href={`/connect/${nameToUniqueSlug(person.full_name, person.id)}`} className="block">
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
                                {selectedHashtag && (
                                    <div className="mb-3 rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-800">
                                        <p className="font-semibold">#{selectedHashtag}</p>
                                        <p className="text-xs text-green-700 mt-1">
                                            Viewing posts tagged with #{selectedHashtag}. Explore related topics or clear the filter.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSelectedHashtag(null);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="mt-3 inline-flex items-center text-xs font-semibold text-green-700 hover:text-green-900"
                                        >
                                            <X className="w-3 h-3 mr-1" />
                                            Clear hashtag filter
                                        </button>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    {loadingTrending ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                                        </div>
                                    ) : displayedTrendingHashtags.length > 0 ? (
                                        displayedTrendingHashtags.slice(0, 5).map((hashtag) => (
                                            <button
                                                key={hashtag.id}
                                                onClick={() => {
                                                    setSelectedHashtag(hashtag.name);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className={`block text-sm transition-colors text-left w-full ${selectedHashtag === hashtag.name
                                                    ? 'text-green-600 font-semibold'
                                                    : 'text-gray-700 hover:text-green-600'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>#{hashtag.name}</span>
                                                    <span className="text-xs text-gray-500">{hashtag.use_count || 0} posts</span>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-2">
                                            {selectedHashtag ? 'No other related topics right now.' : 'No trending topics yet'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setDeleteModal({ open: false, postId: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
                                Delete Post?
                            </h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                This action cannot be undone. Your post will be permanently removed.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModal({ open: false, postId: null })}
                                    className="flex-1 px-4 py-2.5 text-gray-700 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteModal.postId && handleDeletePost(deleteModal.postId)}
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 text-white font-medium bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Post Modal */}
            <AnimatePresence>
                {editModal.open && editModal.post && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setEditModal({ open: false, post: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Edit Post</h3>
                                <button
                                    onClick={() => setEditModal({ open: false, post: null })}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="flex gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {profile?.avatar_url ? (
                                            <Image src={profile.avatar_url} alt="" width={40} height={40} className="object-cover" />
                                        ) : (
                                            <span className="text-lg font-bold text-gray-400">
                                                {profile?.full_name?.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{profile?.full_name}</p>
                                        <p className="text-xs text-gray-500">Editing post</p>
                                    </div>
                                </div>
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    rows={5}
                                    placeholder="What's on your mind?"
                                />
                                {editModal.post.image_url && (
                                    <div className="mt-3 rounded-xl overflow-hidden bg-gray-100">
                                        <img
                                            src={editModal.post.image_url}
                                            alt=""
                                            className="w-full max-h-48 object-cover opacity-50"
                                        />
                                        <p className="text-xs text-center text-gray-500 py-2">
                                            Image cannot be edited
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                                <button
                                    onClick={() => setEditModal({ open: false, post: null })}
                                    className="flex-1 px-4 py-2.5 text-gray-700 font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditPost}
                                    disabled={saving || !editContent.trim()}
                                    className="flex-1 px-4 py-2.5 text-white font-medium bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Comment Modal */}
            <AnimatePresence>
                {editCommentModal.open && editCommentModal.comment && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setEditCommentModal({ open: false, comment: null, postId: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Edit Comment</h3>
                                <button
                                    onClick={() => setEditCommentModal({ open: false, comment: null, postId: null })}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <textarea
                                    value={editCommentContent}
                                    onChange={(e) => setEditCommentContent(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    rows={4}
                                    placeholder="Edit your comment..."
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                                <button
                                    onClick={() => setEditCommentModal({ open: false, comment: null, postId: null })}
                                    className="flex-1 px-4 py-2.5 text-gray-700 font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditComment}
                                    disabled={saving || !editCommentContent.trim()}
                                    className="flex-1 px-4 py-2.5 text-white font-medium bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quote Repost Modal */}
            <AnimatePresence>
                {quoteModal.open && quoteModal.post && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setQuoteModal({ open: false, post: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Quote Post</h3>
                                <button
                                    onClick={() => setQuoteModal({ open: false, post: null })}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* User info */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {profile?.avatar_url ? (
                                            <Image src={profile.avatar_url} alt="" width={40} height={40} className="object-cover" />
                                        ) : (
                                            <span className="text-lg font-bold text-gray-400">
                                                {profile?.full_name?.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{profile?.full_name}</p>
                                        <p className="text-xs text-gray-500">Add your thoughts</p>
                                    </div>
                                </div>
                                {/* Comment textarea */}
                                <textarea
                                    value={quoteContent}
                                    onChange={(e) => setQuoteContent(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    rows={3}
                                    placeholder="Add your thoughts..."
                                    autoFocus
                                />
                                {/* Quoted post preview */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {quoteModal.post.profile?.avatar_url ? (
                                                    <Image src={quoteModal.post.profile.avatar_url} alt="" width={24} height={24} className="object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-400">
                                                        {quoteModal.post.profile?.full_name?.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {quoteModal.post.profile?.full_name}
                                            </span>
                                            {quoteModal.post.profile?.is_verified && (
                                                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 line-clamp-4">{quoteModal.post.content}</p>
                                        {quoteModal.post.image_url && (
                                            <div className="mt-2 rounded-lg overflow-hidden bg-gray-200">
                                                <img
                                                    src={quoteModal.post.image_url}
                                                    alt=""
                                                    className="w-full max-h-24 object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 px-4 py-4 border-t border-gray-100 bg-gray-50">
                                <button
                                    onClick={() => setQuoteModal({ open: false, post: null })}
                                    className="flex-1 px-4 py-2.5 text-gray-700 font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleQuoteRepost}
                                    disabled={posting || !quoteContent.trim()}
                                    className="flex-1 px-4 py-2.5 text-white font-medium bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Quote className="w-4 h-4" />}
                                    Quote
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Reposts Modal */}
            <AnimatePresence>
                {repostsModal.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setRepostsModal({ open: false, postId: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Repeat2 className="w-5 h-5 text-green-600" />
                                    <h3 className="text-lg font-bold text-gray-900">Reposts</h3>
                                </div>
                                <button
                                    onClick={() => setRepostsModal({ open: false, postId: null })}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="overflow-y-auto max-h-[calc(70vh-64px)]">
                                {loadingReposters ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                                    </div>
                                ) : reposters.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Repeat2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                        <p>No reposts yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {reposters.map((reposter) => (
                                            <div key={reposter.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                                <Link href={`/connect/${reposter.id}`} className="flex items-center gap-3 flex-1">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                        {reposter.avatar_url ? (
                                                            <Image src={reposter.avatar_url} alt="" width={40} height={40} className="object-cover" />
                                                        ) : (
                                                            <span className="text-lg font-bold text-gray-400">
                                                                {reposter.full_name?.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 hover:text-green-600">
                                                            {reposter.full_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {userTypeLabels[reposter.user_type] || reposter.user_type}
                                                        </p>
                                                    </div>
                                                </Link>
                                                {user?.id !== reposter.id && (
                                                    <button
                                                        onClick={() => handleFollow(reposter.id)}
                                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${followingIds.has(reposter.id)
                                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            : 'bg-green-600 text-white hover:bg-green-700'
                                                            }`}
                                                    >
                                                        {followingIds.has(reposter.id) ? 'Following' : 'Follow'}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
