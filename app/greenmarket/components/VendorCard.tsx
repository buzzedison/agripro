'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { FaStore, FaStar, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

interface CardAction {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
    variant?: 'primary' | 'ghost';
}

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
    actions?: CardAction[];
    highlight?: 'new' | 'verified' | 'featured';
}

const businessTypeLabels: Record<string, string> = {
    'fresh-produce': 'Fresh Produce',
    'livestock': 'Livestock',
    'grains': 'Grains & Cereals',
    'processed-foods': 'Processed Foods',
    'dairy': 'Dairy',
    'aquaculture': 'Aquaculture',
    'eco-products': 'Eco Products',
    'farm-equipment': 'Farm Equipment',
    'seeds': 'Seeds & Inputs',
    'agro-services': 'Agro Services',
    other: 'General',
};

const businessTypeColors: Record<string, string> = {
    'fresh-produce': 'bg-green-100 text-green-700',
    'livestock': 'bg-amber-100 text-amber-700',
    'grains': 'bg-yellow-100 text-yellow-700',
    'processed-foods': 'bg-orange-100 text-orange-700',
    'dairy': 'bg-blue-100 text-blue-700',
    'aquaculture': 'bg-cyan-100 text-cyan-700',
    'eco-products': 'bg-emerald-100 text-emerald-700',
    'farm-equipment': 'bg-gray-100 text-gray-700',
    'seeds': 'bg-lime-100 text-lime-700',
    'agro-services': 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-700',
};

export default function VendorCard({
    vendor,
    variant = 'default',
    actions = [],
    highlight
}: VendorCardProps) {
    const location = [vendor.city, vendor.region, vendor.country].filter(Boolean).join(', ');

    const renderActions = () => {
        if (!actions.length) return null;
        return (
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                {actions.map((action) =>
                    action.href ? (
                        <Link
                            key={`${vendor.id}-${action.label}`}
                            href={action.href}
                            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                action.variant === 'ghost'
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                        >
                            {action.icon}
                            {action.label}
                        </Link>
                    ) : (
                        <button
                            key={`${vendor.id}-${action.label}`}
                            onClick={action.onClick}
                            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                action.variant === 'ghost'
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    )
                )}
            </div>
        );
    };

    if (variant === 'compact') {
        return (
            <Link
                href={`/greenmarket/vendors/${vendor.slug}`}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow group"
            >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                        <h3 className="font-medium text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                            {vendor.business_name}
                        </h3>
                        {vendor.is_verified && (
                            <FaCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
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
            <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-50 flex flex-col">
                <Link href={`/greenmarket/vendors/${vendor.slug}`} className="block">
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

                        {(vendor.is_featured || highlight === 'featured') && (
                            <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold flex items-center gap-1">
                                <FaStar className="w-3 h-3" />
                                Featured
                            </div>
                        )}

                        <div className="absolute -bottom-8 left-6">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden ring-4 ring-white">
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
                    <div className="pt-12 p-6">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                        {vendor.business_name}
                                    </h3>
                                    {vendor.is_verified && (
                                        <FaCheckCircle className="w-5 h-5 text-emerald-500" />
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
                        <p className="mt-4 text-gray-600 text-sm line-clamp-2">{vendor.product_description}</p>
                        {location && (
                            <div className="mt-4 flex items-center gap-1 text-sm text-gray-500">
                                <FaMapMarkerAlt className="w-3 h-3" />
                                {location}
                            </div>
                        )}
                    </div>
                </Link>
                <div className="px-6 pb-6">{renderActions()}</div>
            </div>
        );
    }

    return (
        <div className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col">
            <Link href={`/greenmarket/vendors/${vendor.slug}`} className="flex-1">
                <div className="p-5">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-gray-50">
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
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                                    {vendor.business_name}
                                </h3>
                                {vendor.is_verified && (
                                    <FaCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                )}
                            </div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${businessTypeColors[vendor.business_type] || businessTypeColors.other}`}>
                                {businessTypeLabels[vendor.business_type] || vendor.business_type}
                            </span>
                        </div>
                        {(vendor.is_featured || highlight) && (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                                {highlight === 'new'
                                    ? 'New'
                                    : highlight === 'verified'
                                      ? 'Verified'
                                      : 'Featured'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="px-5 pb-5">
                    <p className="text-gray-600 text-sm line-clamp-3">{vendor.product_description}</p>
                    <div className="mt-4 flex items-center justify-between">
                        {location && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FaMapMarkerAlt className="w-3 h-3" />
                                {location}
                            </div>
                        )}
                        {vendor.rating && vendor.rating > 0 && (
                            <div className="flex items-center gap-1 text-yellow-500">
                                <FaStar className="w-3 h-3" />
                                <span className="text-xs font-medium text-gray-700">
                                    {vendor.rating.toFixed(1)}
                                </span>
                                {vendor.total_reviews && (
                                    <span className="text-xs text-gray-400">({vendor.total_reviews})</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Link>
            <div className="px-5 pb-5">{renderActions()}</div>
        </div>
    );
}
