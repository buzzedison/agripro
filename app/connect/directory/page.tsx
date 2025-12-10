'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import {
    Search, Filter, MapPin, Users, ShoppingBag,
    Lightbulb, Wrench, ChevronDown, X, Loader2,
    Globe, CheckCircle
} from 'lucide-react';
import { nameToUniqueSlug } from '@/lib/utils/mentions';

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    user_type: string;
    organization_name: string | null;
    country: string | null;
    region: string | null;
    value_chains: string[];
    scale: string | null;
    years_experience: number | null;
    is_verified: boolean;
}

const userTypeConfig: Record<string, { icon: any; label: string; color: string }> = {
    farmer: { icon: Users, label: 'Farmer', color: 'green' },
    buyer: { icon: ShoppingBag, label: 'Buyer', color: 'blue' },
    expert: { icon: Lightbulb, label: 'Expert', color: 'amber' },
    service_provider: { icon: Wrench, label: 'Service Provider', color: 'purple' },
};

const valueChainOptions = [
    'Poultry', 'Vegetables', 'Grains & Cereals', 'Fruits', 'Dairy',
    'Livestock', 'Aquaculture', 'Cocoa', 'Coffee', 'Cashew',
    'Shea', 'Oil Palm', 'Cassava', 'Yam', 'Rice', 'Maize'
];

const countryOptions = [
    'Ghana', 'Nigeria', 'Kenya', 'Tanzania', 'Uganda', 'Ethiopia',
    'South Africa', 'Côte d\'Ivoire', 'Senegal', 'Rwanda'
];

function DirectoryContent() {
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [showWelcome, setShowWelcome] = useState(searchParams.get('welcome') === 'true');

    const [filters, setFilters] = useState({
        search: '',
        userType: '',
        country: '',
        valueChain: '',
    });

    useEffect(() => {
        fetchProfiles();
    }, [filters]);

    const fetchProfiles = async () => {
        setLoading(true);

        let query = supabase
            .from('profiles')
            .select('*')
            .eq('is_public', true)
            .eq('profile_complete', true)
            .order('created_at', { ascending: false });

        if (filters.userType) {
            query = query.eq('user_type', filters.userType);
        }
        if (filters.country) {
            query = query.eq('country', filters.country);
        }
        if (filters.valueChain) {
            query = query.contains('value_chains', [filters.valueChain]);
        }
        if (filters.search) {
            query = query.or(`full_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%,organization_name.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching profiles:', error);
        } else {
            setProfiles(data || []);
        }

        setLoading(false);
    };

    const clearFilters = () => {
        setFilters({ search: '', userType: '', country: '', valueChain: '' });
    };

    const hasActiveFilters = filters.userType || filters.country || filters.valueChain;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Welcome Toast */}
            {showWelcome && (
                <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Welcome! Your profile is now live.</span>
                    <button onClick={() => setShowWelcome(false)} className="ml-2">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Directory</h1>
                            <p className="text-gray-600 mt-1">
                                Discover farmers, buyers, experts, and service providers
                            </p>
                        </div>
                        <Link
                            href="/connect/onboarding"
                            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Join the Network
                        </Link>
                    </div>

                    {/* Search & Filters */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                placeholder="Search by name, organization, or bio..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${hasActiveFilters ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <Filter className="w-5 h-5" />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                                    {[filters.userType, filters.country, filters.valueChain].filter(Boolean).length}
                                </span>
                            )}
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                                    <select
                                        value={filters.userType}
                                        onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">All Types</option>
                                        <option value="farmer">Farmers</option>
                                        <option value="buyer">Buyers</option>
                                        <option value="expert">Experts</option>
                                        <option value="service_provider">Service Providers</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                    <select
                                        value={filters.country}
                                        onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">All Countries</option>
                                        {countryOptions.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Value Chain</label>
                                    <select
                                        value={filters.valueChain}
                                        onChange={(e) => setFilters(prev => ({ ...prev, valueChain: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">All Value Chains</option>
                                        {valueChainOptions.map(chain => (
                                            <option key={chain} value={chain}>{chain}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No profiles found</h3>
                        <p className="text-gray-600 mb-6">
                            {hasActiveFilters ? 'Try adjusting your filters' : 'Be the first to join the network!'}
                        </p>
                        {hasActiveFilters ? (
                            <button
                                onClick={clearFilters}
                                className="text-green-600 font-medium hover:underline"
                            >
                                Clear filters
                            </button>
                        ) : (
                            <Link
                                href="/connect/onboarding"
                                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                            >
                                Create Your Profile
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="text-gray-600 mb-6">{profiles.length} profile{profiles.length !== 1 ? 's' : ''} found</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profiles.map((profile) => {
                                const typeConfig = userTypeConfig[profile.user_type] || userTypeConfig.farmer;
                                const TypeIcon = typeConfig.icon;

                                return (
                                    <Link
                                        key={profile.id}
                                        href={`/connect/${nameToUniqueSlug(profile.full_name, profile.id)}`}
                                        className="group bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {profile.avatar_url ? (
                                                        <Image
                                                            src={profile.avatar_url}
                                                            alt={profile.full_name}
                                                            width={64}
                                                            height={64}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-2xl font-bold text-gray-400">
                                                            {profile.full_name.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-gray-900 truncate group-hover:text-green-700 transition-colors">
                                                            {profile.full_name}
                                                        </h3>
                                                        {profile.is_verified && (
                                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    {profile.organization_name && (
                                                        <p className="text-sm text-gray-600 truncate">{profile.organization_name}</p>
                                                    )}
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-${typeConfig.color}-50 text-${typeConfig.color}-700`}>
                                                            <TypeIcon className="w-3 h-3" />
                                                            {typeConfig.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {profile.bio && (
                                                <p className="mt-4 text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
                                            )}

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {profile.country && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                        <MapPin className="w-3 h-3" />
                                                        {profile.country}
                                                    </span>
                                                )}
                                                {profile.years_experience && (
                                                    <span className="text-xs text-gray-500">
                                                        {profile.years_experience}+ years
                                                    </span>
                                                )}
                                            </div>

                                            {profile.value_chains && profile.value_chains.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    {profile.value_chains.slice(0, 3).map((chain) => (
                                                        <span
                                                            key={chain}
                                                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                                        >
                                                            {chain}
                                                        </span>
                                                    ))}
                                                    {profile.value_chains.length > 3 && (
                                                        <span className="text-xs px-2 py-1 text-gray-500">
                                                            +{profile.value_chains.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function DirectoryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        }>
            <DirectoryContent />
        </Suspense>
    );
}
