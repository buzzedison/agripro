import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    FaArrowLeft,
    FaCheckCircle,
    FaMapMarkerAlt,
    FaEnvelope,
    FaPhone,
    FaGlobe,
    FaStore,
    FaStar,
    FaLeaf,
    FaShieldAlt
} from 'react-icons/fa';

interface PageProps {
    params: Promise<{ slug: string }>;
}

const businessTypeLabels: Record<string, string> = {
    'organic-farm': 'Organic Farm',
    'eco-products': 'Eco-Friendly Products',
    'sustainable-fashion': 'Sustainable Fashion',
    'green-tech': 'Green Technology',
    'food-beverage': 'Food & Beverage',
    'wellness': 'Health & Wellness',
    'other': 'General',
};

export default async function VendorProfilePage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch vendor by slug
    const { data: vendor, error } = await supabase
        .from('trade_vendors')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'approved')
        .single();

    if (error || !vendor) {
        notFound();
    }

    // Fetch vendor products
    const { data: products } = await supabase
        .from('trade_products')
        .select('*')
        .eq('vendor_id', vendor.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    const location = [vendor.city, vendor.region, vendor.country].filter(Boolean).join(', ');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Cover Image */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600">
                {vendor.cover_image_url ? (
                    <Image
                        src={vendor.cover_image_url}
                        alt={vendor.business_name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Back Button */}
                <div className="absolute top-6 left-6">
                    <Link
                        href="/greenmarket/marketplace"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-colors"
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        Back to Marketplace
                    </Link>
                </div>

                {/* Featured Badge */}
                {vendor.is_featured && (
                    <div className="absolute top-6 right-6">
                        <div className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full font-bold flex items-center gap-2">
                            <FaStar className="w-4 h-4" />
                            Featured Vendor
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="relative -mt-20 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Logo */}
                            <div className="-mt-20 md:-mt-24 flex-shrink-0">
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden ring-4 ring-white">
                                    {vendor.logo_url ? (
                                        <Image
                                            src={vendor.logo_url}
                                            alt={vendor.business_name}
                                            width={128}
                                            height={128}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <FaStore className="w-12 h-12 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                                {vendor.business_name}
                                            </h1>
                                            {vendor.is_verified && (
                                                <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                    <FaCheckCircle className="w-4 h-4" />
                                                    Verified
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-gray-600 mt-1">by {vendor.owner_name}</p>
                                        <div className="flex flex-wrap items-center gap-4 mt-3">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                {businessTypeLabels[vendor.business_type] || vendor.business_type}
                                            </span>
                                            {location && (
                                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                                    <FaMapMarkerAlt className="w-3 h-3" />
                                                    {location}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    {vendor.rating > 0 && (
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <FaStar className="w-6 h-6" />
                                                <span className="text-2xl font-bold text-gray-900">{vendor.rating.toFixed(1)}</span>
                                            </div>
                                            {vendor.total_reviews > 0 && (
                                                <p className="text-sm text-gray-500">{vendor.total_reviews} reviews</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Contact Buttons */}
                                <div className="flex flex-wrap gap-3 mt-6">
                                    {vendor.email && (
                                        <a
                                            href={`mailto:${vendor.email}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                                        >
                                            <FaEnvelope className="w-4 h-4" />
                                            Contact
                                        </a>
                                    )}
                                    {vendor.phone && (
                                        <a
                                            href={`tel:${vendor.phone}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                        >
                                            <FaPhone className="w-4 h-4" />
                                            Call
                                        </a>
                                    )}
                                    {vendor.website && (
                                        <a
                                            href={vendor.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                        >
                                            <FaGlobe className="w-4 h-4" />
                                            Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {vendor.product_description}
                            </p>
                        </div>

                        {/* Sustainability */}
                        {vendor.sustainability_practices && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 border border-green-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <FaLeaf className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-green-900">Sustainability Practices</h2>
                                </div>
                                <p className="text-green-800 whitespace-pre-line leading-relaxed">
                                    {vendor.sustainability_practices}
                                </p>
                            </div>
                        )}

                        {/* Products */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Products & Services</h2>

                            {products && products.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/greenmarket/products/${product.slug}`}
                                            className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow block"
                                        >
                                            {/* Product Image */}
                                            <div className="relative aspect-square bg-gray-100">
                                                {product.images && product.images[0] ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-300">
                                                        <FaStore className="w-8 h-8" />
                                                    </div>
                                                )}
                                                {product.is_organic && (
                                                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                                                        <FaLeaf className="w-3 h-3" />
                                                        Organic
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-1">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-[2.5em]">
                                                    {product.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-gray-900">
                                                        {formatPrice(product.price, product.currency)}
                                                        <span className="text-xs font-normal text-gray-500"> / {product.unit}</span>
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${product.stock_status === 'in_stock' ? 'bg-green-100 text-green-700' :
                                                        product.stock_status === 'low_stock' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {product.stock_status === 'in_stock' ? 'In Stock' :
                                                            product.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <FaStore className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No products listed yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Trust Badge */}
                        {vendor.verification_level && vendor.verification_level !== 'basic' && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                {(vendor.verification_level as string) === 'agripro_certified' ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <FaShieldAlt className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">AgriPro Certified</h3>
                                                <p className="text-xs text-green-600 font-medium">Quality & Sustainability Vetted</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            This vendor has been personally vetted by the AgriPro team and meets our verified standards for product quality, business practices, and sustainability.
                                        </p>
                                    </>
                                ) : vendor.verification_level === 'premium' ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                                <FaShieldAlt className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">Business Verified</h3>
                                                <p className="text-xs text-amber-600 font-medium">Identity & Registration Confirmed</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            This vendor&apos;s identity and business registration have been confirmed by AgriPro.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <FaShieldAlt className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">Identity Verified</h3>
                                                <p className="text-xs text-blue-600 font-medium">ID Confirmed</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            This vendor&apos;s identity has been confirmed by AgriPro.
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Contact Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
                            <div className="space-y-3">
                                {vendor.email && (
                                    <a
                                        href={`mailto:${vendor.email}`}
                                        className="flex items-center gap-3 text-sm text-gray-600 hover:text-green-600 transition-colors"
                                    >
                                        <FaEnvelope className="w-4 h-4" />
                                        {vendor.email}
                                    </a>
                                )}
                                {vendor.phone && (
                                    <a
                                        href={`tel:${vendor.phone}`}
                                        className="flex items-center gap-3 text-sm text-gray-600 hover:text-green-600 transition-colors"
                                    >
                                        <FaPhone className="w-4 h-4" />
                                        {vendor.phone}
                                    </a>
                                )}
                                {vendor.website && (
                                    <a
                                        href={vendor.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-sm text-gray-600 hover:text-green-600 transition-colors"
                                    >
                                        <FaGlobe className="w-4 h-4" />
                                        {vendor.website.replace(/^https?:\/\//, '')}
                                    </a>
                                )}
                                {location && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <FaMapMarkerAlt className="w-4 h-4" />
                                        {location}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded-xl">
                                    <p className="text-2xl font-bold text-gray-900">{vendor.total_products || 0}</p>
                                    <p className="text-xs text-gray-500">Products</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-xl">
                                    <p className="text-2xl font-bold text-gray-900">{vendor.total_reviews || 0}</p>
                                    <p className="text-xs text-gray-500">Reviews</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
const currencySymbols: Record<string, string> = {
    GHS: '₵',
    USD: '$',
    KES: 'KSh',
    NGN: '₦',
    ZAR: 'R',
    EUR: '€'
};

const formatPrice = (price: number, currency?: string) => {
    const symbol = currencySymbols[currency || ''] || currency || 'GHS';
    return `${symbol} ${price.toFixed(2)}`;
};
