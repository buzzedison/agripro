'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    User, Users, MapPin, Edit2, Bell, Search, Plus,
    TrendingUp, MessageCircle, Calendar, Briefcase,
    Globe, ChevronRight, Loader2, CheckCircle, BookOpen,
    ShoppingBag, Sprout, ArrowRight, Store
} from 'lucide-react';

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    user_type: string;
    organization_name: string | null;
    country: string | null;
    value_chains: string[];
    is_verified: boolean;
    profile_complete: boolean;
}

interface DirectoryProfile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    user_type: string;
    organization_name: string | null;
    country: string | null;
}

interface VendorStatus {
    id: string;
    business_name: string;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    is_verified: boolean;
    slug: string;
}

const userTypeLabels: Record<string, string> = {
    farmer: 'Farmer',
    buyer: 'Buyer',
    expert: 'Expert',
    service_provider: 'Service Provider',
};

const userTypeColors: Record<string, string> = {
    farmer: 'bg-green-100 text-green-700',
    buyer: 'bg-blue-100 text-blue-700',
    expert: 'bg-amber-100 text-amber-700',
    service_provider: 'bg-purple-100 text-purple-700',
};

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();

    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [recentProfiles, setRecentProfiles] = useState<DirectoryProfile[]>([]);
    const [stats, setStats] = useState({ total: 0, farmers: 0, buyers: 0, experts: 0 });
    const [vendorStatus, setVendorStatus] = useState<VendorStatus | null>(null);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login?redirectTo=/connect/dashboard');
            return;
        }
        setUser(user);
        await Promise.all([
            fetchProfile(user.id),
            fetchRecentProfiles(),
            fetchStats(),
            fetchVendorStatus(user.id),
            fetchPendingRequests(user.id)
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

    const fetchRecentProfiles = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, user_type, organization_name, country')
            .eq('is_public', true)
            .eq('profile_complete', true)
            .order('created_at', { ascending: false })
            .limit(6);
        setRecentProfiles(data || []);
    };

    const fetchStats = async () => {
        const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_complete', true);
        const { count: farmers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'farmer').eq('profile_complete', true);
        const { count: buyers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'buyer').eq('profile_complete', true);
        const { count: experts } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'expert').eq('profile_complete', true);
        setStats({ total: total || 0, farmers: farmers || 0, buyers: buyers || 0, experts: experts || 0 });
    };

    const fetchVendorStatus = async (userId: string) => {
        const { data } = await supabase
            .from('trade_vendors')
            .select('id, business_name, status, is_verified, slug')
            .eq('user_id', userId)
            .single();
        if (data) {
            setVendorStatus(data);
        }
    };

    const fetchPendingRequests = async (userId: string) => {
        const { data } = await supabase
            .from('user_connections')
            .select('id, requester_id, created_at')
            .eq('receiver_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(3);

        const requesterIds = Array.from(new Set((data || []).map((row) => row.requester_id)));
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, organization_name')
            .in('id', requesterIds);

        const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));

        setPendingRequests(
            (data || []).map((row) => ({
                id: row.id,
                requester_id: row.requester_id,
                created_at: row.created_at,
                requester: profileMap.get(row.requester_id) || null
            }))
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                            <span className="text-sm text-gray-500">Welcome back!</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <Bell className="w-5 h-5" />
                            </button>
                            <Link
                                href="/connect/directory"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-600 bg-gray-100 rounded-lg hover:bg-green-50 transition-colors"
                            >
                                <Search className="w-4 h-4" />
                                Search Directory
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            {/* Cover */}
                            <div className="h-24 bg-gradient-to-r from-green-600 to-emerald-500" />

                            {/* Profile Info */}
                            <div className="px-6 pb-6">
                                <div className="relative -mt-12 mb-4">
                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-lg">
                                        {profile?.avatar_url ? (
                                            <Image src={profile.avatar_url} alt="" width={96} height={96} className="object-cover" />
                                        ) : (
                                            <span className="text-3xl font-bold text-gray-400">
                                                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    {profile?.is_verified && (
                                        <div className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>

                                {profile?.profile_complete ? (
                                    <>
                                        <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
                                        {profile.organization_name && (
                                            <p className="text-gray-600">{profile.organization_name}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${userTypeColors[profile.user_type] || 'bg-gray-100 text-gray-700'}`}>
                                                {userTypeLabels[profile.user_type] || profile.user_type}
                                            </span>
                                            {profile.country && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {profile.country}
                                                </span>
                                            )}
                                        </div>
                                        {profile.bio && (
                                            <p className="mt-4 text-sm text-gray-600 line-clamp-3">{profile.bio}</p>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <Link
                                                href={`/connect/${profile.id}`}
                                                className="flex-1 text-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                            >
                                                View Profile
                                            </Link>
                                            <Link
                                                href="/connect/profile/edit"
                                                className="px-3 py-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-600 mb-4">Complete your profile to get discovered</p>
                                        <Link
                                            href="/connect/onboarding"
                                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Complete Profile
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Pending Requests */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Connection requests</p>
                                    <h3 className="text-xl font-bold text-gray-900">{pendingRequests.length || 0}</h3>
                                </div>
                                <Link
                                    href="/connect/requests"
                                    className="text-sm font-semibold text-green-600 hover:text-green-700"
                                >
                                    Review
                                </Link>
                            </div>
                            {pendingRequests.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    Invitations from other members will appear here.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingRequests.map((req) => (
                                        <div key={req.id} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {req.requester?.avatar_url ? (
                                                    <Image
                                                        src={req.requester.avatar_url}
                                                        alt={req.requester.full_name}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-500">
                                                        {req.requester?.full_name?.charAt(0).toUpperCase() || '?'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 truncate">
                                                    {req.requester?.full_name || 'AgriPro member'}
                                                </p>
                                                {req.requester?.organization_name && (
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {req.requester.organization_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Value Chains */}
                        {profile?.value_chains && profile.value_chains.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            >
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Value Chains</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.value_chains.map((chain) => (
                                        <span key={chain} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                                            {chain}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                        >
                            {[
                                { label: 'Total Members', value: stats.total, icon: Users, color: 'green' },
                                { label: 'Farmers', value: stats.farmers, icon: Sprout, color: 'emerald' },
                                { label: 'Buyers', value: stats.buyers, icon: ShoppingBag, color: 'blue' },
                                { label: 'Experts', value: stats.experts, icon: BookOpen, color: 'amber' },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                    <stat.icon className={`w-5 h-5 text-${stat.color}-600 mb-2`} />
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        >
                            <Link
                                href="/connect/directory"
                                className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-green-200 hover:shadow-md transition-all"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                    <Search className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Browse Directory</p>
                                    <p className="text-sm text-gray-500">Find connections</p>
                                </div>
                            </Link>

                            <Link
                                href="/knowledgehub"
                                className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <BookOpen className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Knowledge Hub</p>
                                    <p className="text-sm text-gray-500">Learn & grow</p>
                                </div>
                            </Link>

                            <Link
                                href="/chat"
                                className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-purple-200 hover:shadow-md transition-all"
                            >
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                    <MessageCircle className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">AI Assistant</p>
                                    <p className="text-sm text-gray-500">Get help instantly</p>
                                </div>
                            </Link>

                            </motion.div>

                        {/* Vendor Status Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Store className="w-5 h-5 text-emerald-600" />
                                    Vendor Status
                                </h3>
                            </div>
                            <div className="p-6">
                                {!vendorStatus ? (
                                    // Not a vendor yet
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Store className="w-8 h-8 text-emerald-600" />
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Become a Vendor</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Start selling your agricultural products on Green Market. Reach buyers across Africa!
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                            <Link
                                                href="/greenmarket/become-vendor"
                                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Apply Now
                                            </Link>
                                            <Link
                                                href="/greenmarket"
                                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Learn More
                                            </Link>
                                        </div>
                                    </div>
                                ) : vendorStatus.status === 'pending' ? (
                                    // Application pending
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-amber-600" />
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Application Under Review</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Your vendor application for <strong>{vendorStatus.business_name}</strong> is being reviewed. We&apos;ll notify you within 24-48 hours.
                                        </p>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Pending Review
                                        </div>
                                    </div>
                                ) : vendorStatus.status === 'approved' ? (
                                    // Approved vendor
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <Store className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{vendorStatus.business_name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                                        <CheckCircle className="w-3 h-3" /> Approved
                                                    </span>
                                                    {vendorStatus.is_verified ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                                            <CheckCircle className="w-3 h-3" /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                            Not Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {!vendorStatus.is_verified && (
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 mb-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Briefcase className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="font-semibold text-blue-900 text-sm">Get Verified</h5>
                                                        <p className="text-xs text-blue-700 mb-2">
                                                            Upload your National ID to get the verified badge and build trust with buyers.
                                                        </p>
                                                        <Link
                                                            href="/greenmarket/vendor-dashboard/verify"
                                                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                                        >
                                                            Complete Verification <ArrowRight className="w-3 h-3" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex gap-3">
                                            <Link
                                                href="/greenmarket/vendor-dashboard"
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                                            >
                                                <Store className="w-4 h-4" />
                                                Vendor Dashboard
                                            </Link>
                                            <Link
                                                href={`/greenmarket/vendors/${vendorStatus.slug}`}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                            >
                                                View Store
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    // Rejected or suspended
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Store className="w-8 h-8 text-red-600" />
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Application Status</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Your vendor application needs attention. Please check your vendor dashboard for details.
                                        </p>
                                        <Link
                                            href="/greenmarket/dashboard"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            View Details <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Recent Members */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900">Recent Members</h3>
                                <Link href="/connect/directory" className="text-sm text-green-600 font-medium hover:underline flex items-center">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {recentProfiles.length > 0 ? (
                                    recentProfiles.map((member) => (
                                        <Link
                                            key={member.id}
                                            href={`/connect/${member.id}`}
                                            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {member.avatar_url ? (
                                                    <Image src={member.avatar_url} alt="" width={48} height={48} className="object-cover" />
                                                ) : (
                                                    <span className="text-lg font-semibold text-gray-400">
                                                        {member.full_name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{member.full_name}</p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {member.organization_name || userTypeLabels[member.user_type]}
                                                </p>
                                            </div>
                                            {member.country && (
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {member.country}
                                                </span>
                                            )}
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No members yet. Be the first!</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* CTA Banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 text-white"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="relative">
                                <h3 className="text-xl font-bold mb-2">Grow Your Network</h3>
                                <p className="text-green-100 mb-4">Connect with farmers, buyers, and experts across Africa.</p>
                                <Link
                                    href="/connect/directory"
                                    className="inline-flex items-center px-4 py-2 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
                                >
                                    Explore Directory
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
