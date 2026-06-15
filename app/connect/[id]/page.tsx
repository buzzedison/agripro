'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { nameToUniqueSlug } from '@/lib/utils/mentions';
import {
    getConnectionStatus,
    sendConnectionRequest,
    acceptConnectionRequest,
    getProfileSecurely,
    ConnectionStatus,
    PrivacySettings
} from '../actions';
import {
    ArrowLeft, MapPin, Mail, Phone, Globe, Linkedin,
    Calendar, Briefcase, CheckCircle, Users, ShoppingBag,
    Lightbulb, Wrench, Loader2, MessageCircle, UserPlus,
    UserCheck, Share2, Youtube, Play, UserMinus, Clock, X,
    FileText, Repeat2, Heart, Store, BookOpen, ExternalLink,
    Award, Star, Handshake, BadgeCheck, Zap, Sparkles
} from 'lucide-react';

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function ensureProtocol(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
}

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    user_type: string;
    organization_name: string | null;
    organization_role: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    value_chains: string[];
    scale: string | null;
    years_experience: number | null;
    certifications: string[];
    specializations: string[];
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    website: string | null;
    linkedin: string | null;
    youtube_url: string | null;
    header_url: string | null;
    is_verified: boolean;
    is_featured: boolean;
    created_at: string;
    privacy_settings: PrivacySettings | null;
    services: { name: string; description?: string; price_range?: string }[] | null;
    achievements: { title: string; year?: string; description?: string }[] | null;
    open_to: string[] | null;
}

interface Stats {
    followers: number;
    following: number;
    connections: number;
    posts: number;
}

interface ProfilePreview {
    id: string;
    full_name: string;
    avatar_url: string | null;
    organization_name: string | null;
    user_type: string | null;
}

const userTypeConfig: Record<string, { icon: any; label: string; bgColor: string; textColor: string }> = {
    farmer: { icon: Users, label: 'Farmer / Producer', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    buyer: { icon: ShoppingBag, label: 'Buyer / Trader', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
    expert: { icon: Lightbulb, label: 'Expert / Advisor', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
    service_provider: { icon: Wrench, label: 'Service Provider', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
};

const scaleLabels: Record<string, string> = {
    small: 'Small Scale',
    medium: 'Medium Scale',
    large: 'Large Scale',
    enterprise: 'Enterprise',
};

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<Stats>({ followers: 0, following: 0, posts: 0, connections: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [catalystFellowSlug, setCatalystFellowSlug] = useState<string | null>(null);

    // Connection State
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
    const [connectionLoading, setConnectionLoading] = useState(false);
    const [connectionId, setConnectionId] = useState<string | null>(null);
    const [activeList, setActiveList] = useState<{ type: 'followers' | 'following' | 'connections'; title: string } | null>(null);
    const [listItems, setListItems] = useState<ProfilePreview[]>([]);
    const [listLoading, setListLoading] = useState(false);

    // Activity
    const [activeActivityTab, setActiveActivityTab] = useState<'posts' | 'reposts' | 'store' | 'articles'>('posts');
    const [activityPosts, setActivityPosts] = useState<any[]>([]);
    const [activityReposts, setActivityReposts] = useState<any[]>([]);
    const [activityStore, setActivityStore] = useState<{ vendor: any; products: any[] } | null>(null);
    const [activityArticles, setActivityArticles] = useState<any[]>([]);
    const [activityLoading, setActivityLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            // Get current user first
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            // Then fetch profile (which will check follow status)
            await fetchProfile(user);
        };
        init();
    }, [params.id]);

    const checkFollowStatus = async (userId: string, profileId: string) => {
        const { data } = await supabase
            .from('connections')
            .select('id')
            .eq('follower_id', userId)
            .eq('following_id', profileId)
            .single();
        setIsFollowing(!!data);

        // Fetch connection status (connect/accept/etc)
        try {
            const status = await getConnectionStatus(profileId);
            setConnectionStatus(status);
            if (status === 'accepted') {
                await fetchConnectionRecord(userId, profileId);
            } else {
                setConnectionId(null);
            }
        } catch (err) {
            console.error("Failed to fetch connection status", err);
        }
    };

    const fetchConnectionRecord = async (viewerId: string, profileId: string) => {
        const { data } = await supabase
            .from('user_connections')
            .select('id')
            .eq('status', 'accepted')
            .or(`and(requester_id.eq.${viewerId},receiver_id.eq.${profileId}),and(requester_id.eq.${profileId},receiver_id.eq.${viewerId})`)
            .maybeSingle();
        setConnectionId(data?.id || null);
        return data?.id || null;
    };

    const fetchProfile = async (user?: any) => {
        setLoading(true);
        setError(null);

        const identifier = params.id as string;

        // Reserved route names that shouldn't be treated as profile slugs
        const reservedRoutes = ['profile', 'dashboard', 'directory', 'onboarding', 'edit'];
        if (reservedRoutes.includes(identifier.toLowerCase())) {
            setError('Profile not found');
            setLoading(false);
            return;
        }

        try {
            const result = await getProfileSecurely(identifier);

            if (result.error || !result.data) {
                console.error('Error fetching profile:', result.error || 'No profile found');
                setError('Profile not found');
            } else {
                setProfile(result.data);
                fetchStats(result.data.id);
                fetchActivity(result.data.id);
                fetchCatalystFellowBadge(result.data.id);
                // Check follow status with the actual profile ID
                if (user) {
                    checkFollowStatus(user.id, result.data.id);
                }
            }
        } catch (err) {
            console.error("Unexpected error fetching profile:", err);
            setError('Profile not found');
        }

        setLoading(false);
    };

    const fetchCatalystFellowBadge = async (profileId: string) => {
        try {
            const { data } = await supabase
                .from('catalyst_fellows_directory')
                .select('slug')
                .eq('user_id', profileId)
                .maybeSingle();
            setCatalystFellowSlug(data?.slug || null);
        } catch {
            setCatalystFellowSlug(null);
        }
    };

    const fetchStats = async (profileId: string) => {
        const [followersRes, followingRes, postsRes, connectionsRes] = await Promise.all([
            // TODO: Update these counts to reflect new Connections table or stick to Follows?
            // Assuming "Follows" are still tracked in 'connections' (renamed or separate?)
            // Based on migration plan: 'connections' table creates NEW 'connect' system.
            // EXISTING 'connections' table from earlier might be for FOLLOWS. 
            // NOTE: The previous existing table for follows was named 'connections' in older migrations.
            // We created a NEW table named 'connections' in migration 016, which MIGHT CONFLICT if strict name collision.
            // If it already exists, it keeps the old schema. 
            // Migration 016: "requester_id, receiver_id, status".
            // Old Migration 002: "follower_id, following_id, status".
            // This is a CONFLICT. Migration 016 will likely FAIL or use existing table if columns differ.
            // I should have checked this.
            // But proceeding with the code assuming we fix DB later if needed.
            // For now, let's assume 'connections' is the NEW relation table, and 'follows' is separate or we migrate.
            // Wait, if I use the SAME table name, it's messy.
            // Let's assume for this code we are using a DIFFERENT table or columns.
            // Actually, best practice suggests 'follows' table for follows, 'connections' for bidirectional.
            // If the old table was named 'connections' but meant for follows, we should probably rename it or use a new table.
            // IMPORTANT: In fetchStats, I should refer to the correct table. 
            // For now, I'll keep existing logic but be aware.
            // NOTE: 'connections' fetches (for Follows) should query the OLD 'connections' table (which might need renaming if we fixed it). 
            // HOWEVER, based on my previous fix, the new table is `user_connections`. The old table `connections` remains for follows.
            // So:
            // Follows -> `connections` table
            // Connections -> `user_connections` table

            supabase.from('connections').select('id', { count: 'exact', head: true }).eq('following_id', profileId),
            supabase.from('connections').select('id', { count: 'exact', head: true }).eq('follower_id', profileId),
            supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', profileId),
            // Connections count: entries in user_connections where (requester OR receiver) is profile AND status is accepted
            supabase.from('user_connections')
                .select('id', { count: 'exact', head: true })
                .or(`and(requester_id.eq.${profileId},status.eq.accepted),and(receiver_id.eq.${profileId},status.eq.accepted)`)
        ]);
        setStats({
            followers: followersRes.count || 0,
            following: followingRes.count || 0,
            posts: postsRes.count || 0,
            connections: connectionsRes.count || 0
        });
    };

    const fetchActivity = async (profileId: string) => {
        setActivityLoading(true);
        try {
            // Posts
            const { data: posts } = await supabase
                .from('posts')
                .select('id, content, image_url, likes_count, comments_count, reposts_count, created_at')
                .eq('user_id', profileId)
                .is('quoted_post_id', null)
                .order('created_at', { ascending: false })
                .limit(6);
            setActivityPosts(posts || []);

            // Reposts
            const { data: repostRows } = await supabase
                .from('post_reposts')
                .select('post_id, created_at')
                .eq('user_id', profileId)
                .order('created_at', { ascending: false })
                .limit(6);

            if (repostRows && repostRows.length > 0) {
                const postIds = repostRows.map(r => r.post_id);
                const { data: repostedPosts } = await supabase
                    .from('posts')
                    .select('id, content, image_url, likes_count, comments_count, reposts_count, created_at, user_id')
                    .in('id', postIds);

                // Get original authors
                const authorIds = [...new Set((repostedPosts || []).map(p => p.user_id))];
                const { data: authors } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', authorIds);
                const authorsMap = new Map((authors || []).map(a => [a.id, a]));

                const enriched = (repostedPosts || []).map(p => ({
                    ...p,
                    original_author: authorsMap.get(p.user_id) || null,
                    reposted_at: repostRows.find(r => r.post_id === p.id)?.created_at,
                }));
                setActivityReposts(enriched);
            } else {
                setActivityReposts([]);
            }

            // Store
            const { data: vendor } = await supabase
                .from('trade_vendors')
                .select('id, business_name, logo_url, cover_image_url, business_type, slug, status, country, city')
                .eq('user_id', profileId)
                .eq('status', 'approved')
                .maybeSingle();

            if (vendor) {
                const { data: products } = await supabase
                    .from('trade_products')
                    .select('id, name, price, unit, images, currency, stock_status')
                    .eq('vendor_id', vendor.id)
                    .eq('is_active', true)
                    .limit(4);
                setActivityStore({ vendor, products: products || [] });
            } else {
                setActivityStore(null);
            }

            // Knowledge Hub articles (Sanity CMS)
            // authors and contributors are arrays — match by name or email
            try {
                const { client: sanityClient } = await import('@/app/lib/client');
                const profileData = await supabase
                    .from('profiles')
                    .select('full_name, email')
                    .eq('id', profileId)
                    .single();
                const name = profileData.data?.full_name || '';
                const email = profileData.data?.email || '';
                if (name || email) {
                    const articles = await sanityClient.fetch(
                        `*[_type == "insight" && (
                            $name in authors[]->name ||
                            $name in contributors[]->name ||
                            $email in authors[]->contact.email ||
                            $email in contributors[]->contact.email
                        )] | order(publishedAt desc)[0...6] {
                            _id, title, slug, excerpt, publishedAt, category
                        }`,
                        { name, email }
                    );
                    setActivityArticles(articles || []);
                }
            } catch {
                setActivityArticles([]);
            }
        } catch (err) {
            console.error('Error fetching activity:', err);
        }
        setActivityLoading(false);
    };

    const fetchListItems = async (type: 'followers' | 'following' | 'connections') => {
        if (!profile) return;
        setListLoading(true);
        try {
            let ids: string[] = [];
            if (type === 'followers') {
                const { data } = await supabase
                    .from('connections')
                    .select('follower_id')
                    .eq('following_id', profile.id);
                ids = (data || []).map((row) => row.follower_id);
            } else if (type === 'following') {
                const { data } = await supabase
                    .from('connections')
                    .select('following_id')
                    .eq('follower_id', profile.id);
                ids = (data || []).map((row) => row.following_id);
            } else {
                const { data } = await supabase
                    .from('user_connections')
                    .select('requester_id, receiver_id')
                    .eq('status', 'accepted')
                    .or(`requester_id.eq.${profile.id},receiver_id.eq.${profile.id}`);
                ids = (data || []).map((row) =>
                    row.requester_id === profile.id ? row.receiver_id : row.requester_id
                );
            }

            if (ids.length === 0) {
                setListItems([]);
                setListLoading(false);
                return;
            }

            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, organization_name, user_type')
                .in('id', ids);

            const indexMap = new Map(ids.map((id, idx) => [id, idx]));
            const items = (profilesData || []).sort(
                (a, b) => (indexMap.get(a.id) ?? 0) - (indexMap.get(b.id) ?? 0)
            );
            setListItems(items);
        } catch (err) {
            console.error('Failed to fetch list', err);
            setListItems([]);
        } finally {
            setListLoading(false);
        }
    };

    const openList = (type: 'followers' | 'following' | 'connections', title: string) => {
        if (!profile) return;
        setActiveList({ type, title });
        fetchListItems(type);
    };

    const closeList = () => {
        setActiveList(null);
        setListItems([]);
    };

    const handleFollow = async () => {
        if (!currentUser || !profile) return;

        setFollowLoading(true);
        try {
            if (isFollowing) {
                await supabase.from('connections').delete() // This refers to the OLD connections table (follows)
                    .eq('follower_id', currentUser.id)
                    .eq('following_id', profile.id);
                setIsFollowing(false);
                setStats(s => ({ ...s, followers: s.followers - 1 }));
            } else {
                await supabase.from('connections').insert({
                    follower_id: currentUser.id,
                    following_id: profile.id
                });
                setIsFollowing(true);
                setStats(s => ({ ...s, followers: s.followers + 1 }));
            }
        } catch (err) {
            console.error('Error following:', err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!currentUser || !profile) return;
        setConnectionLoading(true);
        try {
            await sendConnectionRequest(profile.id);
            setConnectionStatus('pending_sent');
            setConnectionId(null);
        } catch (err) {
            console.error("Error sending request:", err);
        } finally {
            setConnectionLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!currentUser || !profile) return;
        setConnectionLoading(true);
        try {
            await acceptConnectionRequest(profile.id);
            setConnectionStatus('accepted');
            await fetchConnectionRecord(currentUser.id, profile.id);
        } catch (err) {
            console.error("Error accepting:", err);
        } finally {
            setConnectionLoading(false);
        }
    };

    const getLocationString = () => {
        if (!profile) return '';
        // Privacy check for Location
        if (!canViewField('location')) return 'Location Hidden';

        const parts = [profile.city, profile.region, profile.country].filter(Boolean);
        return parts.join(', ');
    };

    // Helper to check privacy
    const canViewField = (field: keyof PrivacySettings) => {
        if (!profile || !currentUser) return false;
        if (currentUser.id === profile.id) return true; // Own profile

        const privacy = profile.privacy_settings?.[field] || 'connections'; // Default to connections if null

        if (privacy === 'public') return true;
        if (privacy === 'private') return false;
        if (privacy === 'connections') {
            return connectionStatus === 'accepted';
        }
        return false;
    };

    // Render Logic
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 mb-6">This profile doesn&apos;t exist or is private.</p>
                    <Link
                        href="/connect/directory"
                        className="inline-flex items-center text-green-600 font-medium hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Directory
                    </Link>
                </div>
            </div>
        );
    }

    const typeConfig = userTypeConfig[profile.user_type] || userTypeConfig.farmer;
    const TypeIcon = typeConfig.icon;
    const isOwnProfile = currentUser?.id === profile.id;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        href="/connect/directory"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Directory
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Cover & Profile Header */}
                    <div className="relative">
                        <div className="h-32 sm:h-48 bg-gradient-to-r from-green-600 to-emerald-500 relative overflow-hidden">
                            {profile.header_url && (
                                <Image
                                    src={profile.header_url}
                                    alt="Cover"
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div className="absolute -bottom-16 left-6 sm:left-8">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-lg">
                                {profile.avatar_url ? (
                                    <Image
                                        src={profile.avatar_url}
                                        alt={profile.full_name}
                                        width={128}
                                        height={128}
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl font-bold text-gray-400">
                                        {profile.full_name.charAt(0)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute bottom-4 right-4 sm:right-8 flex gap-2">
                            {isOwnProfile ? (
                                <Link
                                    href="/connect/profile/edit"
                                    className="px-4 py-2 bg-white text-gray-700 font-medium rounded-full shadow hover:bg-gray-50 transition-colors"
                                >
                                    Edit Profile
                                </Link>
                            ) : currentUser ? (
                                <>
                                    {/* Connection Button */}
                                    {connectionStatus === 'accepted' ? (
                                        <button
                                            className="inline-flex items-center gap-2 px-5 py-2 bg-green-100 text-green-800 font-semibold rounded-full shadow-sm hover:bg-green-200 transition-colors"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                            Connected
                                        </button>
                                    ) : connectionStatus === 'pending_sent' ? (
                                        <button
                                            disabled
                                            className="inline-flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-500 font-medium rounded-full shadow-sm cursor-not-allowed"
                                        >
                                            <Clock className="w-4 h-4" />
                                            Pending
                                        </button>
                                    ) : connectionStatus === 'pending_received' ? (
                                        <button
                                            onClick={handleAccept}
                                            disabled={connectionLoading}
                                            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-full shadow hover:bg-blue-700 transition-colors"
                                        >
                                            {connectionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                            Accept Request
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleConnect}
                                            disabled={connectionLoading}
                                            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-gray-700 font-semibold rounded-full shadow hover:bg-gray-50 transition-colors border border-gray-200"
                                        >
                                            {connectionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                            Connect
                                        </button>
                                    )}

                                    {/* Follow Button - Keep existing logic for feed */}
                                    <button
                                        onClick={handleFollow}
                                        disabled={followLoading}
                                        className={`inline-flex items-center gap-2 px-5 py-2 font-semibold rounded-full shadow transition-colors ${isFollowing
                                            ? 'bg-white text-gray-700 hover:bg-gray-50'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                    >
                                        {followLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : isFollowing ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <Share2 className="w-4 h-4" /> // Changed icon to differentiate
                                        )}
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>

                                    {connectionStatus === 'accepted' && connectionId && (
                                        <Link
                                            href={`/messages?connectionId=${connectionId}`}
                                            className="p-2 bg-white text-gray-600 rounded-full shadow hover:bg-gray-50 transition-colors"
                                            title="Send message"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href={`/auth/login?redirectTo=/connect/${profile.id}`}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white font-semibold rounded-full shadow hover:bg-green-700 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Connect
                                </Link>
                            )}
                            <button className="p-2 bg-white text-gray-600 rounded-full shadow hover:bg-gray-50 transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="pt-20 px-6 sm:px-8 pb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                            {profile.is_verified && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                </span>
                            )}
                            {catalystFellowSlug && (
                                <Link
                                    href={`/fellowship/fellows/${catalystFellowSlug}`}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-100 px-2 py-1 rounded-full hover:bg-amber-200 transition-colors"
                                >
                                    <Sparkles className="w-3 h-3" />
                                    Catalyst Fellow
                                </Link>
                            )}
                        </div>

                        {(profile.organization_role || profile.organization_name) && (
                            <p className="text-gray-600 mb-2">
                                {profile.organization_role && <span>{profile.organization_role}</span>}
                                {profile.organization_role && profile.organization_name && <span> at </span>}
                                {profile.organization_name && <span className="font-medium">{profile.organization_name}</span>}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-3 mb-4">
                            <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                                <TypeIcon className="w-4 h-4" />
                                {typeConfig.label}
                            </span>

                            {/* Location - Privacy Protected */}
                            {canViewField('location') ? (
                                getLocationString() && (
                                    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                        <MapPin className="w-4 h-4" />
                                        {getLocationString()}
                                    </span>
                                )
                            ) : (
                                <span className="inline-flex items-center gap-1 text-sm text-gray-400 italic">
                                    <MapPin className="w-4 h-4" />
                                    Location hidden
                                </span>
                            )}

                            {profile.years_experience && (
                                <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    {profile.years_experience}+ years experience
                                </span>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
                            <StatPill
                                label="Followers"
                                value={stats.followers}
                                onClick={() => openList('followers', 'Followers')}
                            />
                            <StatPill
                                label="Following"
                                value={stats.following}
                                onClick={() => openList('following', 'Following')}
                            />
                            <StatPill
                                label="Connections"
                                value={stats.connections}
                                onClick={() => openList('connections', 'Connections')}
                            />
                            <StatPill label="Posts" value={stats.posts} />
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <div className="px-6 sm:px-8 pb-8">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">About</h2>
                            {canViewField('bio') ? (
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                            ) : (
                                <p className="text-gray-400 italic">Bio is private.</p>
                            )}
                        </div>
                    )}

                    {/* Video Introduction */}
                    {profile.youtube_url && getYouTubeVideoId(profile.youtube_url) && (
                        <div className="px-6 sm:px-8 pb-8 border-t border-gray-100 pt-6">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                Video Introduction
                            </h2>
                            <div className="aspect-video rounded-xl overflow-hidden bg-black">
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(profile.youtube_url)}`}
                                    title="Video introduction"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* Value Chains & Details */}
                    {(profile.value_chains?.length > 0 || profile.scale) && (
                        <div className="px-6 sm:px-8 pb-8 border-t border-gray-100 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {profile.value_chains && profile.value_chains.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Value Chains</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.value_chains.map((chain) => (
                                                <span key={chain} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                                                    {chain}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {profile.scale && (
                                    <div>
                                        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Scale</h2>
                                        <span className="inline-flex items-center gap-1 text-gray-700">
                                            <Briefcase className="w-4 h-4 text-gray-400" />
                                            {scaleLabels[profile.scale] || profile.scale}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Certifications & Specializations */}
                    {((profile.certifications?.length > 0) || (profile.specializations?.length > 0)) && (
                        <div className="px-6 sm:px-8 pb-8 border-t border-gray-100 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {profile.certifications && profile.certifications.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
                                            <BadgeCheck className="w-4 h-4" />
                                            Certifications
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.certifications.map((cert) => (
                                                <span key={cert} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100">
                                                    <BadgeCheck className="w-3.5 h-3.5" />
                                                    {cert}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {profile.specializations && profile.specializations.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
                                            <Star className="w-4 h-4" />
                                            Specializations
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.specializations.map((spec) => (
                                                <span key={spec} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-full border border-amber-100">
                                                    <Star className="w-3.5 h-3.5" />
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* What I'm Open To */}
                    {profile.open_to && profile.open_to.length > 0 && (
                        <div className="px-6 sm:px-8 pb-8 border-t border-gray-100 pt-6">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                Open To
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {profile.open_to.map((item) => (
                                    <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                                        <Zap className="w-3.5 h-3.5" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Services Offered */}
                    {profile.services && profile.services.length > 0 && (
                        <div className="px-6 sm:px-8 pb-8 border-t border-gray-100 pt-6">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
                                <Handshake className="w-4 h-4" />
                                Services Offered
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {profile.services.map((service, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
                                            {service.price_range && (
                                                <span className="text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap border border-green-100">
                                                    {service.price_range}
                                                </span>
                                            )}
                                        </div>
                                        {service.description && (
                                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{service.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Achievements & Milestones */}
                    {profile.achievements && profile.achievements.length > 0 && (
                        <div className="px-6 sm:px-8 pb-8 border-t border-gray-100 pt-6">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Achievements & Milestones
                            </h2>
                            <div className="space-y-3">
                                {profile.achievements.map((achievement, i) => (
                                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Award className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-semibold text-gray-900 text-sm">{achievement.title}</p>
                                                {achievement.year && (
                                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{achievement.year}</span>
                                                )}
                                            </div>
                                            {achievement.description && (
                                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{achievement.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Info - PRIVACY PROTECTED */}
                    {(profile.email || profile.phone || profile.whatsapp || profile.website || profile.linkedin) && (
                        <div className="px-6 sm:px-8 pb-8 border-t border-gray-100 pt-6">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Contact</h2>

                            {/* Privacy Check Overlay / Message */}
                            {(!isOwnProfile && connectionStatus !== 'accepted') ? (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                                    <UserPlus className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                                    <h3 className="font-semibold text-blue-900 mb-1">Connect to view contact info</h3>
                                    <p className="text-blue-700 text-sm mb-4 max-w-sm mx-auto">
                                        You need to be connected with {profile.full_name} to view their contact details and private information.
                                    </p>
                                    <button
                                        onClick={handleConnect}
                                        disabled={connectionLoading || connectionStatus === 'pending_sent'}
                                        className="px-5 py-2 bg-blue-600 text-white font-medium rounded-full shadow hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {connectionStatus === 'pending_sent' ? 'Request Sent' : 'Connect Now'}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Email */}
                                    {canViewField('email') && profile.email ? (
                                        <a
                                            href={`mailto:${profile.email}`}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors group"
                                        >
                                            <Mail className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                                            <span className="text-sm text-gray-700 group-hover:text-green-700 truncate">{profile.email}</span>
                                        </a>
                                    ) : (
                                        profile.email && <div className="p-3 bg-gray-50 rounded-lg opacity-50 flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm text-gray-400">Email hidden</span>
                                        </div>
                                    )}

                                    {/* Phone */}
                                    {canViewField('phone') && profile.phone ? (
                                        <a
                                            href={`tel:${profile.phone}`}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors group"
                                        >
                                            <Phone className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                                            <span className="text-sm text-gray-700 group-hover:text-green-700">{profile.phone}</span>
                                        </a>
                                    ) : (
                                        profile.phone && <div className="p-3 bg-gray-50 rounded-lg opacity-50 flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm text-gray-400">Phone hidden</span>
                                        </div>
                                    )}

                                    {profile.whatsapp && (
                                        <a
                                            href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors group"
                                        >
                                            <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                                            <span className="text-sm text-gray-700 group-hover:text-green-700">WhatsApp</span>
                                        </a>
                                    )}

                                    {profile.website && (
                                        <a
                                            href={ensureProtocol(profile.website)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors group"
                                        >
                                            <Globe className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                                            <span className="text-sm text-gray-700 group-hover:text-green-700 truncate">{profile.website}</span>
                                        </a>
                                    )}

                                    {profile.linkedin && (
                                        <a
                                            href={ensureProtocol(profile.linkedin)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
                                        >
                                            <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                                            <span className="text-sm text-gray-700 group-hover:text-blue-700">LinkedIn Profile</span>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Activity Section */}
                    <div className="px-6 sm:px-8 pb-8 border-t border-gray-100 pt-6">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Activity</h2>

                        {/* Activity Tabs */}
                        <div className="flex gap-1 border-b border-gray-200 mb-5 overflow-x-auto">
                            {[
                                { key: 'posts', label: 'Posts', icon: FileText },
                                { key: 'reposts', label: 'Reposts', icon: Repeat2 },
                                { key: 'store', label: 'Store', icon: Store },
                                { key: 'articles', label: 'Articles', icon: BookOpen },
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveActivityTab(key as any)}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                                        activeActivityTab === key
                                            ? 'border-green-600 text-green-700'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {activityLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                            </div>
                        ) : (
                            <>
                                {/* Posts Tab */}
                                {activeActivityTab === 'posts' && (
                                    activityPosts.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-8">No posts yet</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {activityPosts.map(post => (
                                                <Link key={post.id} href={`/feed`} className="block bg-gray-50 hover:bg-green-50 rounded-xl p-4 transition-colors">
                                                    <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                                                    {post.image_url && (
                                                        <img src={post.image_url} alt="" className="mt-2 rounded-lg max-h-40 object-cover w-full" />
                                                    )}
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post.likes_count}</span>
                                                        <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{post.comments_count}</span>
                                                        <span className="flex items-center gap-1"><Repeat2 className="w-3.5 h-3.5" />{post.reposts_count}</span>
                                                        <span className="ml-auto">{new Date(post.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )
                                )}

                                {/* Reposts Tab */}
                                {activeActivityTab === 'reposts' && (
                                    activityReposts.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-8">No reposts yet</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {activityReposts.map(post => (
                                                <Link key={post.id} href={`/feed`} className="block bg-gray-50 hover:bg-green-50 rounded-xl p-4 transition-colors">
                                                    {post.original_author && (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Repeat2 className="w-3.5 h-3.5 text-green-500" />
                                                            <span className="text-xs text-gray-500">Reposted from <span className="font-medium text-gray-700">{post.original_author.full_name}</span></span>
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post.likes_count}</span>
                                                        <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{post.comments_count}</span>
                                                        <span className="ml-auto">{new Date(post.reposted_at || post.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )
                                )}

                                {/* Store Tab */}
                                {activeActivityTab === 'store' && (
                                    !activityStore ? (
                                        <p className="text-sm text-gray-400 text-center py-8">No store on AgriPro</p>
                                    ) : (
                                        <div>
                                            {/* Vendor Banner */}
                                            <Link href={`/greenmarket/${activityStore.vendor.slug}`} className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-green-50 rounded-xl mb-4 transition-colors group">
                                                {activityStore.vendor.logo_url ? (
                                                    <img src={activityStore.vendor.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                                                        <Store className="w-6 h-6 text-green-600" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 group-hover:text-green-700">{activityStore.vendor.business_name}</p>
                                                    <p className="text-xs text-gray-500">{activityStore.vendor.business_type} · {activityStore.vendor.city || activityStore.vendor.country}</p>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                                            </Link>
                                            {/* Products */}
                                            {activityStore.products.length > 0 && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {activityStore.products.map(product => (
                                                        <div key={product.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                                            {product.images?.[0] && (
                                                                <img src={product.images[0]} alt={product.name} className="w-full h-28 object-cover" />
                                                            )}
                                                            <div className="p-3">
                                                                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                                                <p className="text-xs text-green-700 font-semibold mt-0.5">
                                                                    {product.currency || 'GHS'} {Number(product.price).toLocaleString()} <span className="text-gray-400 font-normal">/ {product.unit}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}

                                {/* Articles Tab */}
                                {activeActivityTab === 'articles' && (
                                    activityArticles.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-8">No articles in Knowledge Hub</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {activityArticles.map((article: any) => (
                                                <Link
                                                    key={article._id}
                                                    href={`/knowledgehub/insights/${article.slug?.current}`}
                                                    className="flex items-start gap-3 p-4 bg-gray-50 hover:bg-green-50 rounded-xl transition-colors group"
                                                >
                                                    <BookOpen className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700 line-clamp-2">{article.title}</p>
                                                        {article.excerpt && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>}
                                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                            {article.category && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{article.category}</span>}
                                                            {article.publishedAt && <span>{new Date(article.publishedAt).toLocaleDateString()}</span>}
                                                        </div>
                                                    </div>
                                                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-500 flex-shrink-0 mt-1" />
                                                </Link>
                                            ))}
                                        </div>
                                    )
                                )}
                            </>
                        )}
                    </div>
            </div>

            {activeList && (
                <ProfileListModal
                    activeList={activeList}
                    items={listItems}
                    loading={listLoading}
                    onClose={closeList}
                />
            )}
        </div>
    );
}

interface StatPillProps {
    label: string;
    value: number;
    onClick?: () => void;
}

function StatPill({ label, value, onClick }: StatPillProps) {
    const clickable = Boolean(onClick);
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!clickable}
            className={`flex flex-col items-center justify-center rounded-2xl border border-gray-100 px-4 py-3 transition-colors ${
                clickable ? 'hover:border-green-200 hover:bg-green-50' : 'cursor-default'
            }`}
        >
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
            {clickable && <span className="text-xs text-green-600 mt-1">View</span>}
        </button>
    );
}

interface ProfileListModalProps {
    activeList: { type: 'followers' | 'following' | 'connections'; title: string };
    items: ProfilePreview[];
    loading: boolean;
    onClose: () => void;
}

function ProfileListModal({ activeList, items, loading, onClose }: ProfileListModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500">Viewing</p>
                        <h3 className="text-lg font-semibold text-gray-900">{activeList.title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-10 px-6 text-sm text-gray-500">
                            No {activeList.title.toLowerCase()} yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {items.map((item) => {
                                const slug = item.full_name
                                    ? nameToUniqueSlug(item.full_name, item.id)
                                    : item.id;
                                return (
                                    <Link
                                        key={item.id}
                                        href={`/connect/${slug}`}
                                        className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {item.avatar_url ? (
                                                <Image
                                                    src={item.avatar_url}
                                                    alt={item.full_name || ''}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="text-base font-semibold text-gray-500">
                                                    {item.full_name?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {item.full_name || 'AgriPro member'}
                                            </p>
                                            {item.organization_name && (
                                                <p className="text-sm text-gray-500 truncate">
                                                    {item.organization_name}
                                                </p>
                                            )}
                                            {item.user_type && (
                                                <p className="text-xs text-gray-400">
                                                    {userTypeConfig[item.user_type]?.label || item.user_type}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
