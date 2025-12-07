'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSearch, FaFilter, FaTh, FaList, FaStore, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import VendorCard from '../components/VendorCard';

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
    { id: 'wellness', label: 'Health & Wellness', icon: '🌿' },
];

export default function MarketplacePage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchVendors();
    }, []);

    useEffect(() => {
        fetchVendors();
    }, [selectedCategory, showFeaturedOnly]);

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

            const response = await fetch(`/api/trade/vendors?${params}`);
            if (response.ok) {
                const data = await response.json();
                setVendors(data.vendors || []);
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

    const featuredVendors = vendors.filter(v => v.is_featured);
    const regularVendors = vendors.filter(v => !v.is_featured);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <Link
                        href="/greenmarket"
                        className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-6 transition-colors"
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        Back to Green Market
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        African Marketplace
                    </h1>
                    <p className="text-xl text-green-100 max-w-2xl mb-8">
                        Buy and sell agricultural products across Africa. Connect with verified sellers offering fresh produce, livestock, and sustainable goods.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-2xl">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search vendors, products, or services..."
                                className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-2xl shadow-lg focus:ring-4 focus:ring-white/30 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === ''
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:bg-green-50'
                            }`}
                    >
                        All Sellers
                    </button>
                    {businessTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedCategory(type.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${selectedCategory === type.id
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:bg-green-50'
                                }`}
                        >
                            <span>{type.icon}</span>
                            {type.label}
                        </button>
                    ))}
                </div>

                {/* Filters & View Toggle */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showFeaturedOnly}
                                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            Featured only
                        </label>
                        <span className="text-sm text-gray-500">
                            {vendors.length} seller{vendors.length !== 1 ? 's' : ''} found
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <FaTh className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <FaList className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <FaSpinner className="w-8 h-8 animate-spin text-green-600 mb-4" />
                        <p className="text-gray-600">Loading vendors...</p>
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaStore className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No vendors found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery || selectedCategory
                                ? 'Try adjusting your search or filters'
                                : 'Be the first to join our marketplace!'}
                        </p>
                        <Link
                            href="/greenmarket/vendors"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                        >
                            Start Selling
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Featured Vendors Section */}
                        {featuredVendors.length > 0 && !showFeaturedOnly && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    ⭐ Featured Vendors
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {featuredVendors.map((vendor) => (
                                        <VendorCard key={vendor.id} vendor={vendor} variant="featured" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Vendors Grid */}
                        <div>
                            {featuredVendors.length > 0 && !showFeaturedOnly && regularVendors.length > 0 && (
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">All Vendors</h2>
                            )}
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {(showFeaturedOnly ? featuredVendors : regularVendors).map((vendor) => (
                                        <VendorCard key={vendor.id} vendor={vendor} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(showFeaturedOnly ? featuredVendors : regularVendors).map((vendor) => (
                                        <VendorCard key={vendor.id} vendor={vendor} variant="compact" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                <div className="mt-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-white text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to sell across Africa?</h2>
                    <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
                        Join thousands of sellers reaching buyers across the continent.
                        List your products for free!
                    </p>
                    <Link
                        href="/greenmarket/vendors"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-700 rounded-xl hover:bg-green-50 transition-colors font-semibold text-lg"
                    >
                        <FaStore className="w-5 h-5" />
                        Start Selling Today
                    </Link>
                </div>
            </div>
        </div>
    );
}
