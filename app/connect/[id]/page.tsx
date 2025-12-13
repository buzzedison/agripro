'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft, MapPin, Mail, Phone, Globe, Linkedin,
    Calendar, Briefcase, CheckCircle, Users, ShoppingBag,
    Lightbulb, Wrench, Loader2, MessageCircle, UserPlus,
    UserCheck, Share2, Youtube, Play
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
}

interface Stats {
    followers: number;
    following: number;
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
    const [stats, setStats] = useState<Stats>({ followers: 0, following: 0, posts: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

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

        // Check if it's a UUID or a name-based slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

        let data = null;
        let error = null;

        if (isUUID) {
            // Lookup by ID
            const result = await supabase
                .from('profiles')
                .select('*')
                .eq('id', identifier)
                .single();
            data = result.data;
            error = result.error;
        } else {
            // Slug format: "john-doe-abc12345" where last segment is short UUID
            const parts = identifier.split('-');
            const shortId = parts[parts.length - 1];

            // Check if last part looks like a short UUID (8 hex chars)
            const hasShortId = /^[0-9a-f]{8}$/i.test(shortId);

            if (hasShortId) {
                // Search by short ID prefix - fetch all and filter client-side
                // since Supabase UUID columns don't support text pattern matching
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('*');

                const matchedProfile = profiles?.find(p =>
                    p.id.toLowerCase().startsWith(shortId.toLowerCase())
                );

                if (matchedProfile) {
                    data = matchedProfile;
                }
            }

            // Fallback: try name-based search
            if (!data) {
                const nameSearch = hasShortId
                    ? parts.slice(0, -1).join(' ')  // Remove short ID
                    : identifier.replace(/-/g, ' ');

                // Try exact match first (case-insensitive)
                let result = await supabase
                    .from('profiles')
                    .select('*')
                    .ilike('full_name', nameSearch)
                    .maybeSingle();

                // If no exact match, try with wildcard
                if (!result.data) {
                    result = await supabase
                        .from('profiles')
                        .select('*')
                        .ilike('full_name', `%${nameSearch}%`)
                        .maybeSingle();
                }

                if (!data) {
                    data = result.data;
                    error = result.error;
                }
            }
        }

        if (error || !data) {
            console.error('Error fetching profile:', error || 'No profile found');
            setError('Profile not found');
        } else {
            setProfile(data);
            fetchStats(data.id);
            // Check follow status with the actual profile ID
            if (user) {
                checkFollowStatus(user.id, data.id);
            }
        }

        setLoading(false);
    };

    const fetchStats = async (profileId: string) => {
        const [followersRes, followingRes, postsRes] = await Promise.all([
            supabase.from('connections').select('id', { count: 'exact', head: true }).eq('following_id', profileId),
            supabase.from('connections').select('id', { count: 'exact', head: true }).eq('follower_id', profileId),
            supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', profileId),
        ]);
        setStats({
            followers: followersRes.count || 0,
            following: followingRes.count || 0,
            posts: postsRes.count || 0,
        });
    };

    const handleFollow = async () => {
        if (!currentUser || !profile) return;

        setFollowLoading(true);
        try {
            if (isFollowing) {
                await supabase.from('connections').delete()
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

    const getLocationString = () => {
        if (!profile) return '';
        const parts = [profile.city, profile.region, profile.country].filter(Boolean);
        return parts.join(', ');
    };

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
                                            <UserCheck className="w-4 h-4" />
                                        ) : (
                                            <UserPlus className="w-4 h-4" />
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
                                    Follow
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

                            {getLocationString() && (
                                <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4" />
                                    {getLocationString()}
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
                                <p className="text-xl font-bold text-gray-900">{stats.posts}</p>
                                <p className="text-sm text-gray-500">Posts</p>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <div className="px-6 sm:px-8 pb-8">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">About</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
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

                    {/* Contact Info */}
                    {(profile.email || profile.phone || profile.whatsapp || profile.website || profile.linkedin) && (
                        <div className="px-6 sm:px-8 pb-8 border-t border-gray-100 pt-6">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Contact</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {profile.email && (
                                    <a
                                        href={`mailto:${profile.email}`}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors group"
                                    >
                                        <Mail className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                                        <span className="text-sm text-gray-700 group-hover:text-green-700 truncate">{profile.email}</span>
                                    </a>
                                )}

                                {profile.phone && (
                                    <a
                                        href={`tel:${profile.phone}`}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors group"
                                    >
                                        <Phone className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                                        <span className="text-sm text-gray-700 group-hover:text-green-700">{profile.phone}</span>
                                    </a>
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
