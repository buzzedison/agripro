'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useContentAccess } from '@/lib/hooks/useContentAccess';
import { nameToUniqueSlug } from '@/lib/utils/mentions';
import {
    FaArrowLeft,
    FaSearch,
    FaUser,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
    FaEnvelope,
    FaMapMarkerAlt,
    FaExternalLinkAlt,
    FaUsers,
    FaUserCheck,
    FaUserTimes
} from 'react-icons/fa';

interface Profile {
    id: string;
    full_name: string;
    email: string | null;
    avatar_url: string | null;
    bio: string | null;
    user_type: string;
    organization_name: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    is_public: boolean;
    is_verified: boolean;
    profile_complete: boolean;
    created_at: string;
}

interface Stats {
    total: number;
    complete: number;
    incomplete: number;
}

const userTypeLabels: Record<string, string> = {
    farmer: 'Farmer / Producer',
    buyer: 'Buyer / Trader',
    expert: 'Expert / Advisor',
    service_provider: 'Service Provider',
};

const userTypeColors: Record<string, string> = {
    farmer: 'bg-green-100 text-green-800',
    buyer: 'bg-blue-100 text-blue-800',
    expert: 'bg-amber-100 text-amber-800',
    service_provider: 'bg-purple-100 text-purple-800',
};

export default function AdminMembersPage() {
    const { user, loading: authLoading } = useContentAccess();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, complete: 0, incomplete: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user && !authLoading) {
            fetchProfiles();
        }
    }, [user, authLoading, statusFilter, userTypeFilter]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== 'all') {
                params.set('status', statusFilter);
            }
            if (userTypeFilter !== 'all') {
                params.set('user_type', userTypeFilter);
            }
            if (searchQuery) {
                params.set('search', searchQuery);
            }

            const response = await fetch(`/api/admin/members?${params}`);
            if (response.ok) {
                const data = await response.json();
                setProfiles(data.profiles || []);
                setStats(data.stats || { total: 0, complete: 0, incomplete: 0 });
            }
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProfiles();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <FaSpinner className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <FaArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
                            <p className="mt-1 text-gray-600">
                                View all signed-up users and their profile status
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaUsers className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Members</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FaUserCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Complete Profiles</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.complete}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <FaUserTimes className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Incomplete Profiles</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.incomplete}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Status Tabs */}
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'complete', label: 'Complete' },
                                { key: 'incomplete', label: 'Incomplete' },
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setStatusFilter(key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === key
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* User Type Filter */}
                        <select
                            value={userTypeFilter}
                            onChange={(e) => setUserTypeFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        >
                            <option value="all">All Types</option>
                            <option value="farmer">Farmers</option>
                            <option value="buyer">Buyers</option>
                            <option value="expert">Experts</option>
                            <option value="service_provider">Service Providers</option>
                        </select>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, email, or organization..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </div>

                {/* Members List */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <FaSpinner className="h-8 w-8 animate-spin text-green-600 mx-auto" />
                        <p className="mt-4 text-gray-600">Loading members...</p>
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <FaUser className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">No members found</h3>
                        <p className="text-gray-600 mt-1">
                            Try adjusting your filters.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Member
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {profiles.map((profile) => (
                                        <tr key={profile.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {profile.avatar_url ? (
                                                            <Image
                                                                src={profile.avatar_url}
                                                                alt={profile.full_name}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <span className="text-gray-500 font-medium">
                                                                    {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {profile.full_name || 'No name'}
                                                            </span>
                                                            {profile.is_verified && (
                                                                <FaCheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                            )}
                                                        </div>
                                                        {profile.email && (
                                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                <FaEnvelope className="w-3 h-3" />
                                                                {profile.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {profile.user_type ? (
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${userTypeColors[profile.user_type] || 'bg-gray-100 text-gray-800'}`}>
                                                        {userTypeLabels[profile.user_type] || profile.user_type}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {profile.country ? (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                                                        {[profile.city, profile.region, profile.country].filter(Boolean).join(', ')}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    {profile.profile_complete ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                            <FaCheckCircle className="w-3 h-3" />
                                                            Complete
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                                                            <FaTimesCircle className="w-3 h-3" />
                                                            Incomplete
                                                        </span>
                                                    )}
                                                    {profile.is_public ? (
                                                        <span className="text-xs text-gray-500">Public</span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Private</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(profile.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/connect/${nameToUniqueSlug(profile.full_name || 'user', profile.id)}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1 text-green-600 hover:text-green-700"
                                                >
                                                    View <FaExternalLinkAlt className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Results count */}
                        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                            <p className="text-sm text-gray-500">
                                Showing {profiles.length} member{profiles.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
