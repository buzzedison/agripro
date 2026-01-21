'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    FaSearch,
    FaFilter,
    FaTh,
    FaList,
    FaSpinner,
    FaCheckCircle,
    FaStar
} from 'react-icons/fa';
import { X } from 'lucide-react';
import VendorCard from '../components/VendorCard';
import SectionHeader from '@/components/trade/SectionHeader';

interface Vendor {
    id: string;
    business_name: string;
    owner_name: string;
    business_type: string;
    product_description: string;
    logo_url: string | null;
    cover_image_url: string | null;
    country: string;
    region: string;
    city: string;
    is_featured: boolean;
    is_verified: boolean;
    rating: number;
    total_reviews: number;
    slug: string;
    created_at: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
}

const businessTypes = [
    { id: 'organic-farm', label: 'Organic Farm', icon: '🌱' },
    { id: 'eco-products', label: 'Eco Products', icon: '♻️' },
    { id: 'sustainable-fashion', label: 'Sustainable Fashion', icon: '👕' },
    { id: 'green-tech', label: 'Green Tech', icon: '💡' },
    { id: 'food-beverage', label: 'Food & Beverage', icon: '🍽️' },
    { id: 'wellness', label: 'Health & Wellness', icon: '🌿' }
];

export default function MarketplacePage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchVendors();
    }, [selectedCategory, showFeaturedOnly, verifiedOnly]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/trade/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            if (selectedCategory) params.set('category', selectedCategory);
            if (showFeaturedOnly) params.set('featured', 'true');

            const response = await fetch(`/api/trade/vendors?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                let list: Vendor[] = data.vendors || [];
                if (verifiedOnly) {
                    list = list.filter((vendor) => vendor.is_verified);
                }
                setVendors(list);
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchVendors();
    };

    const featuredVendors = vendors.filter((vendor) => vendor.is_featured).slice(0, 4);
    const regularVendors = vendors.filter((vendor) => !vendor.is_featured);

    return (
        <div className="min-h-screen bg-[#f7faf7]">
            <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
                    <Link
                        href="/greenmarket"
                        className="inline-flex items-center gap-2 text-emerald-100 hover:text-white text-sm"
                    >
                        ← Back to Green Market
                    </Link>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold">African Marketplace</h1>
                            <p className="text-emerald-100 mt-4 text-lg">
                                Buy and sell agricultural products across Africa. Connect with verified
                                sellers offering fresh produce, livestock, and sustainable goods.
                            </p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-5">
                            <form onSubmit={handleSearch} className="relative">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search vendors, products, or services..."
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 shadow-lg focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                                >
                                    Search
                                </button>
                            </form>
                            <div className="flex flex-wrap gap-3 mt-4 text-sm text-emerald-100">
                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <FaFilter className="w-3 h-3" />
                                    Advanced filters
                                </button>
                                <span>Live listings update every hour.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                            selectedCategory === ''
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-gray-200 hover:border-emerald-300'
                        }`}
                    >
                        All sellers
                    </button>
                    {businessTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedCategory(type.id)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors ${
                                selectedCategory === type.id
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-gray-200 hover:border-emerald-300'
                            }`}
                        >
                            <span>{type.icon}</span>
                            {type.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-sm">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showFeaturedOnly}
                                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                                className="rounded text-emerald-600"
                            />
                            Featured vendors
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={verifiedOnly}
                                onChange={(e) => setVerifiedOnly(e.target.checked)}
                                className="rounded text-emerald-600"
                            />
                            Verified only
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-full border ${
                                viewMode === 'grid' ? 'border-emerald-500 text-emerald-600' : 'border-gray-200'
                            }`}
                        >
                            <FaTh />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-full border ${
                                viewMode === 'list' ? 'border-emerald-500 text-emerald-600' : 'border-gray-200'
                            }`}
                        >
                            <FaList />
                        </button>
                    </div>
                </div>

                {featuredVendors.length > 0 && (
                    <div className="space-y-6">
                        <SectionHeader
                            eyebrow="Spotlight"
                            title="Featured & trending vendors"
                            description="Tap into trusted suppliers fast. Preview, connect, and message from here."
                        />
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featuredVendors.map((vendor) => (
                                <VendorCard
                                    key={vendor.id}
                                    vendor={vendor}
                                    variant="featured"
                                    actions={[
                                        {
                                            label: 'Quick preview',
                                            onClick: () => setSelectedVendor(vendor),
                                            variant: 'ghost'
                                        },
                                        { label: 'Open profile', href: `/greenmarket/vendors/${vendor.slug}` }
                                    ]}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <SectionHeader
                        eyebrow="Directory"
                        title="All vendors"
                        description="Filters stay sticky so you can scan like an app directory."
                    />
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <FaSpinner className="w-6 h-6 animate-spin text-emerald-600" />
                        </div>
                    ) : vendors.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-600">No vendors match your filters yet.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {regularVendors.map((vendor) => (
                                <VendorCard
                                    key={vendor.id}
                                    vendor={vendor}
                                    actions={[
                                        {
                                            label: 'Quick preview',
                                            onClick: () => setSelectedVendor(vendor),
                                            variant: 'ghost'
                                        },
                                        { label: 'View', href: `/greenmarket/vendors/${vendor.slug}` }
                                    ]}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {regularVendors.map((vendor) => (
                                <div
                                    key={vendor.id}
                                    className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-4"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
                                            {vendor.logo_url ? (
                                                <Image
                                                    src={vendor.logo_url}
                                                    alt={vendor.business_name}
                                                    width={64}
                                                    height={64}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <span className="text-2xl text-gray-400">{vendor.business_name[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{vendor.business_name}</h3>
                                                {vendor.is_verified && (
                                                    <FaCheckCircle className="w-4 h-4 text-emerald-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">{vendor.product_description}</p>
                                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                                <span>
                                                    {vendor.city}, {vendor.country}
                                                </span>
                                                {vendor.rating > 0 && (
                                                    <span className="flex items-center gap-1 text-yellow-500">
                                                        <FaStar className="w-3 h-3" />
                                                        {vendor.rating.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedVendor(vendor)}
                                            className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold hover:border-emerald-300 flex-1"
                                        >
                                            Preview
                                        </button>
                                        <Link
                                            href={`/greenmarket/vendors/${vendor.slug}`}
                                            className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold flex-1 text-center"
                                        >
                                            Open
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showFilters && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">Advanced filters</h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Featured vendors only</span>
                                <input
                                    type="checkbox"
                                    checked={showFeaturedOnly}
                                    onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                                    className="rounded text-emerald-600"
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Verified vendors only</span>
                                <input
                                    type="checkbox"
                                    checked={verifiedOnly}
                                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                                    className="rounded text-emerald-600"
                                />
                            </label>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowFilters(false);
                                    fetchVendors();
                                }}
                                className="flex-1 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold"
                            >
                                Apply filters
                            </button>
                            <button
                                onClick={() => {
                                    setShowFilters(false);
                                    setShowFeaturedOnly(false);
                                    setVerifiedOnly(false);
                                }}
                                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 font-semibold"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedVendor && (
                <VendorPreviewModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />
            )}
        </div>
    );
}

function VendorPreviewModal({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
    const location = [vendor.city, vendor.region, vendor.country].filter(Boolean).join(', ');
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
                <div className="relative h-40 bg-gradient-to-br from-emerald-500 to-teal-500">
                    {vendor.cover_image_url && (
                        <Image
                            src={vendor.cover_image_url}
                            alt={vendor.business_name}
                            fill
                            className="object-cover"
                        />
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl bg-white flex items-center justify-center overflow-hidden ring-4 ring-white">
                        {vendor.logo_url ? (
                            <Image
                                src={vendor.logo_url}
                                alt={vendor.business_name}
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <span className="text-3xl text-gray-400">{vendor.business_name[0]}</span>
                        )}
                    </div>
                </div>
                <div className="pt-14 px-6 pb-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-semibold">{vendor.business_name}</h3>
                        {vendor.is_verified && <FaCheckCircle className="w-5 h-5 text-emerald-500" />}
                    </div>
                    <p className="text-sm text-gray-600">{vendor.product_description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        {location && <span>{location}</span>}
                        {vendor.rating > 0 && (
                            <span className="flex items-center gap-1 text-yellow-500">
                                <FaStar className="w-4 h-4" />
                                {vendor.rating.toFixed(1)}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        <Link
                            href={`/greenmarket/vendors/${vendor.slug}`}
                            className="w-full text-center px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold"
                        >
                            Open full profile
                        </Link>
                        <Link
                            href={`/connect/directory?vendor=${vendor.slug}`}
                            className="w-full text-center px-4 py-3 rounded-2xl border border-gray-200 text-gray-900 font-semibold hover:border-emerald-300"
                        >
                            Connect & message
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
