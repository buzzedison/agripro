'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaStore, FaStar, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

interface VendorCardProps {
    vendor: {
        id: string;
        business_name: string;
        owner_name?: string;
        business_type: string;
        product_description: string;
        logo_url: string | null;
        cover_image_url?: string | null;
        country?: string;
        region?: string;
        city?: string;
        is_featured: boolean;
        is_verified: boolean;
        rating?: number;
        total_reviews?: number;
        slug: string;
    };
    variant?: 'default' | 'featured' | 'compact';
}

const businessTypeLabels: Record<string, string> = {
    'organic-farm': 'Organic Farm',
    'eco-products': 'Eco Products',
    'sustainable-fashion': 'Sustainable Fashion',
    'green-tech': 'Green Tech',
    'food-beverage': 'Food & Beverage',
    'wellness': 'Health & Wellness',
    'other': 'General',
};

const businessTypeColors: Record<string, string> = {
    'organic-farm': 'bg-green-100 text-green-700',
    'eco-products': 'bg-emerald-100 text-emerald-700',
    'sustainable-fashion': 'bg-purple-100 text-purple-700',
    'green-tech': 'bg-blue-100 text-blue-700',
    'food-beverage': 'bg-orange-100 text-orange-700',
    'wellness': 'bg-pink-100 text-pink-700',
    'other': 'bg-gray-100 text-gray-700',
};

export default function VendorCard({ vendor, variant = 'default' }: VendorCardProps) {
    const location = [vendor.city, vendor.region, vendor.country].filter(Boolean).join(', ');

    if (variant === 'compact') {
        return (
            <Link
                href={`/greenmarket/vendors/${vendor.slug}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow group"
            >
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {vendor.logo_url ? (
                        <Image
                            src={vendor.logo_url}
                            alt={vendor.business_name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <FaStore className="w-5 h-5 text-gray-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate group-hover:text-green-600 transition-colors">
                            {vendor.business_name}
                        </h3>
                        {vendor.is_verified && (
                            <FaCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                        {businessTypeLabels[vendor.business_type] || vendor.business_type}
                    </p>
                </div>
            </Link>
        );
    }

    if (variant === 'featured') {
        return (
            <Link
                href={`/greenmarket/vendors/${vendor.slug}`}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-600">
                    {vendor.cover_image_url ? (
                        <Image
                            src={vendor.cover_image_url}
                            alt={vendor.business_name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Featured Badge */}
                    {vendor.is_featured && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold flex items-center gap-1">
                            <FaStar className="w-3 h-3" />
                            Featured
                        </div>
                    )}

                    {/* Logo */}
                    <div className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden ring-4 ring-white">
                            {vendor.logo_url ? (
                                <Image
                                    src={vendor.logo_url}
                                    alt={vendor.business_name}
                                    width={64}
                                    height={64}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <FaStore className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-12 p-6">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                    {vendor.business_name}
                                </h3>
                                {vendor.is_verified && (
                                    <FaCheckCircle className="w-5 h-5 text-green-500" />
                                )}
                            </div>
                            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${businessTypeColors[vendor.business_type] || businessTypeColors.other}`}>
                                {businessTypeLabels[vendor.business_type] || vendor.business_type}
                            </span>
                        </div>
                        {vendor.rating && vendor.rating > 0 && (
                            <div className="flex items-center gap-1 text-yellow-500">
                                <FaStar className="w-4 h-4" />
                                <span className="font-medium text-gray-900">{vendor.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    <p className="mt-4 text-gray-600 text-sm line-clamp-2">
                        {vendor.product_description}
                    </p>

                    {location && (
                        <div className="mt-4 flex items-center gap-1 text-sm text-gray-500">
                            <FaMapMarkerAlt className="w-3 h-3" />
                            {location}
                        </div>
                    )}
                </div>
            </Link>
        );
    }

    // Default variant
    return (
        <Link
            href={`/greenmarket/vendors/${vendor.slug}`}
            className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
        >
            {/* Header with logo */}
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-gray-50">
                        {vendor.logo_url ? (
                            <Image
                                src={vendor.logo_url}
                                alt={vendor.business_name}
                                width={56}
                                height={56}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <FaStore className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                                {vendor.business_name}
                            </h3>
                            {vendor.is_verified && (
                                <FaCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${businessTypeColors[vendor.business_type] || businessTypeColors.other}`}>
                            {businessTypeLabels[vendor.business_type] || vendor.business_type}
                        </span>
                    </div>
                    {vendor.is_featured && (
                        <div className="p-1.5 bg-yellow-100 rounded-full">
                            <FaStar className="w-4 h-4 text-yellow-600" />
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="px-5 pb-5">
                <p className="text-gray-600 text-sm line-clamp-2">
                    {vendor.product_description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    {location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FaMapMarkerAlt className="w-3 h-3" />
                            {location}
                        </div>
                    )}
                    {vendor.rating && vendor.rating > 0 && (
                        <div className="flex items-center gap-1">
                            <FaStar className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs font-medium text-gray-700">{vendor.rating.toFixed(1)}</span>
                            {vendor.total_reviews && (
                                <span className="text-xs text-gray-400">({vendor.total_reviews})</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
