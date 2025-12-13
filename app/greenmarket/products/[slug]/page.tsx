import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    FaArrowLeft,
    FaStore,
    FaCheckCircle,
    FaMapMarkerAlt,
    FaEnvelope,
    FaPhone,
    FaLeaf,
    FaTag,
    FaBox,
    FaEdit
} from 'react-icons/fa';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch product with vendor details
    const { data: product, error } = await supabase
        .from('trade_products')
        .select(`
            *,
            vendor:trade_vendors (
                id,
                business_name,
                owner_name,
                logo_url,
                slug,
                is_verified,
                city,
                region,
                country,
                email,
                phone,
                user_id
            )
        `)
        .eq('slug', slug)
        .single();

    if (error || !product) {
        notFound();
    }

    // Extract vendor and construct location
    // @ts-ignore - Supabase types might verify this but for now we trust the query
    const vendor = product.vendor;
    const location = [vendor.city, vendor.region, vendor.country].filter(Boolean).join(', ');

    // Check if current user is owner
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user && vendor.user_id === user.id;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href={`/greenmarket/vendors/${vendor.slug}`} // Or back to marketplace
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors"
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        Back to Vendor Shop
                    </Link>

                    {isOwner && (
                        <Link
                            href={`/greenmarket/products/${product.slug}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                        >
                            <FaEdit className="w-4 h-4" />
                            Edit Product
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Image Gallery */}
                        <div className="lg:w-1/2 bg-gray-100 min-h-[400px] lg:min-h-[600px] relative">
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    <FaStore className="w-20 h-20" />
                                </div>
                            )}
                            {/* Organic Badge */}
                            {product.is_organic && (
                                <div className="absolute top-6 left-6 px-4 py-2 bg-green-500 text-white rounded-full font-bold shadow-lg flex items-center gap-2">
                                    <FaLeaf className="w-4 h-4" />
                                    Organic Product
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="lg:w-1/2 p-8 lg:p-12">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                        {product.name}
                                    </h1>
                                    <div className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${product.stock_status === 'in_stock' ? 'bg-green-100 text-green-700' :
                                        product.stock_status === 'low_stock' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {product.stock_status === 'in_stock' ? 'In Stock' :
                                            product.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <FaTag className="w-4 h-4" />
                                    <span>Category: </span>
                                    {/* Ideally create a link to category search */}
                                    <span className="text-gray-900 font-medium">Eco Goods</span>
                                    {/* Note: category_id is in product, better to fetch category name if possible or just skip for now */}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-green-700">GHS {product.price.toFixed(2)}</span>
                                    <span className="text-gray-500 font-medium">/ {product.unit}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-10">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>

                            {/* Vendor Card */}
                            <div className="border-t border-gray-100 pt-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Sold by</h3>
                                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-green-200 hover:shadow-md transition-all group">
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 relative overflow-hidden">
                                        {vendor.logo_url ? (
                                            <Image
                                                src={vendor.logo_url}
                                                alt={vendor.business_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <FaStore className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                                {vendor.business_name}
                                            </h4>
                                            {vendor.is_verified && (
                                                <FaCheckCircle className="w-4 h-4 text-green-500" title="Verified Vendor" />
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center gap-3">
                                            <span>{vendor.owner_name}</span>
                                            {location && (
                                                <span className="flex items-center gap-1">
                                                    <FaMapMarkerAlt className="w-3 h-3" />
                                                    {location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        href={`/greenmarket/vendors/${vendor.slug}`}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                                    >
                                        Visit Shop
                                    </Link>
                                </div>

                                {/* Contact Actions */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    {vendor.phone && (
                                        <a
                                            href={`tel:${vendor.phone}`}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold"
                                        >
                                            <FaPhone className="w-4 h-4" />
                                            Call Vendor
                                        </a>
                                    )}
                                    {vendor.email && (
                                        <a
                                            href={`mailto:${vendor.email}`}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-green-600 text-green-700 rounded-xl hover:bg-green-50 transition-colors font-bold"
                                        >
                                            <FaEnvelope className="w-4 h-4" />
                                            Send Email
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
