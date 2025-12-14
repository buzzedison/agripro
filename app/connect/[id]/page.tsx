'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
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
    UserCheck, Share2, Youtube, Play, UserMinus, Clock
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
}

interface Stats {
    followers: number;
    following: number;
    connections: number;
    posts: number;
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

    // Connection State
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
    const [connectionLoading, setConnectionLoading] = useState(false);

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
        } catch (err) {
            console.error("Failed to fetch connection status", err);
        }
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

                                    <button className="p-2 bg-white text-gray-600 rounded-full shadow hover:bg-gray-50 transition-colors">
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
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
                        <div className="flex items-center gap-6 py-4 border-t border-b border-gray-100">
                            <div className="text-center">
                                <p className="text-xl font-bold text-gray-900">{stats.followers}</p>
                                <p className="text-sm text-gray-500">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-gray-900">{stats.following}</p>
                                <p className="text-sm text-gray-500">Following</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-gray-900">{stats.connections}</p>
                                <p className="text-sm text-gray-500">Connections</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-gray-900">{stats.posts}</p>
                                <p className="text-sm text-gray-500">Posts</p>
                            </div>
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
            </div>
        </div>
    );
}
