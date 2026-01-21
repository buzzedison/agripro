'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store, CheckCircle, Circle, ArrowRight, Loader2,
    Plus, ShoppingBag, Settings, BarChart3, Package,
    Shield, FileText, Camera, Upload, X, ChevronRight,
    Star, Eye, TrendingUp, Users, AlertCircle, Sparkles,
    Building2, CreditCard, Truck, Bell, ExternalLink, Brush, MessageCircle
} from 'lucide-react';
import VendorModeSwitcher from '@/components/VendorModeSwitcher';

interface Vendor {
    id: string;
    business_name: string;
    owner_name: string;
    email: string;
    phone: string;
    business_type: string;
    product_description: string;
    logo_url: string | null;
    cover_image_url: string | null;
    country: string;
    region: string | null;
    city: string | null;
    status: string;
    is_verified: boolean;
    verification_level: 'basic' | 'verified' | 'premium';
    verification_status: 'not_submitted' | 'pending_review' | 'approved' | 'rejected';
    onboarding_completed: boolean;
    onboarding_step: number;
    profile_completed: boolean;
    id_document_url: string | null;
    business_document_url: string | null;
    slug: string;
    rating: number;
    total_reviews: number;
    total_products: number;
}

const onboardingSteps = [
    {
        id: 1,
        title: 'Create Profile',
        description: 'Basic vendor information',
        icon: Store,
        href: null // Already done
    },
    {
        id: 2,
        title: 'Enhance Profile',
        description: 'Add logo & cover image',
        icon: Camera,
        href: '/greenmarket/vendor-dashboard/profile'
    },
    {
        id: 3,
        title: 'Verify Identity',
        description: 'Upload your National ID',
        icon: Shield,
        href: '/greenmarket/vendor-dashboard/verify'
    },
    {
        id: 4,
        title: 'Add Products',
        description: 'List your first product',
        icon: Package,
        href: '/greenmarket/products/new'
    }
];

const dashboardActions = [
    {
        title: 'Add new product',
        description: 'List fresh inventory or seasonal offers.',
        href: '/greenmarket/products/new',
        icon: Package
    },
    {
        title: 'Complete verification',
        description: 'Upload identity and business docs.',
        href: '/greenmarket/vendor-dashboard/verify',
        icon: Shield
    },
    {
        title: 'Update storefront',
        description: 'Refresh visuals & company story.',
        href: '/greenmarket/vendor-dashboard/profile',
        icon: Brush
    },
    {
        title: 'Respond to messages',
        description: 'Keep buyers warm inside AgriPro.',
        href: '/messages',
        icon: MessageCircle
    }
];

export default function VendorDashboardPage() {
    return (
        <Suspense fallback={<VendorDashboardFallback />}>
            <VendorDashboardContent />
        </Suspense>
    );
}

function VendorDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(false);
    const [stats, setStats] = useState({ products: 0, views: 0, inquiries: 0 });

    useEffect(() => {
        fetchVendorData();
        if (searchParams.get('welcome') === 'true') {
            setShowWelcome(true);
        }
    }, []);

    const fetchVendorData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            router.push('/auth/login?redirectTo=/greenmarket/vendor-dashboard');
            return;
        }

        const { data: vendorData, error } = await supabase
            .from('trade_vendors')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error || !vendorData) {
            router.push('/greenmarket/become-vendor');
            return;
        }

        setVendor(vendorData);

        // Fetch product count
        const { count } = await supabase
            .from('trade_products')
            .select('*', { count: 'exact', head: true })
            .eq('vendor_id', vendorData.id);

        setStats(prev => ({ ...prev, products: count || 0 }));
        setLoading(false);
    };

    const getVerificationBadge = () => {
        if (!vendor) return null;
        
        switch (vendor.verification_level) {
            case 'premium':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                        <Star className="w-3 h-3 fill-current" /> Premium Vendor
                    </span>
                );
            case 'verified':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        <Store className="w-3 h-3" /> Basic Vendor
                    </span>
                );
        }
    };

    const getCurrentStep = () => {
        if (!vendor) return 1;
        if (vendor.onboarding_completed) return 5;
        return vendor.onboarding_step || 2;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!vendor) return null;

    const currentStep = getCurrentStep();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Welcome Modal */}
            <AnimatePresence>
                {showWelcome && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowWelcome(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Welcome to Green Market! 🎉
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Your vendor profile is ready! Complete a few more steps to unlock all features and start selling.
                            </p>
                            <button
                                onClick={() => setShowWelcome(false)}
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                            >
                                Let&apos;s Get Started
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header with Mode Switcher */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <VendorModeSwitcher currentMode="vendor" />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <Bell className="w-5 h-5" />
                            </button>
                            <Link
                                href={`/greenmarket/vendors/${vendor.slug}`}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-600 bg-gray-100 rounded-lg hover:bg-green-50 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                View Public Store
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Vendor Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8"
                >
                    {/* Cover Image */}
                    <div className="h-32 bg-gradient-to-r from-green-600 to-emerald-500 relative">
                        {vendor.cover_image_url && (
                            <Image
                                src={vendor.cover_image_url}
                                alt=""
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                    
                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 relative">
                            {/* Logo */}
                            <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white shadow-lg flex items-center justify-center overflow-hidden">
                                {vendor.logo_url ? (
                                    <Image
                                        src={vendor.logo_url}
                                        alt={vendor.business_name}
                                        width={96}
                                        height={96}
                                        className="object-cover"
                                    />
                                ) : (
                                    <Store className="w-10 h-10 text-gray-400" />
                                )}
                            </div>
                            
                            <div className="flex-1 pt-2 sm:pt-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h1 className="text-2xl font-bold text-gray-900">{vendor.business_name}</h1>
                                    {getVerificationBadge()}
                                </div>
                                <p className="text-gray-600">{vendor.owner_name} • {vendor.city || vendor.region || vendor.country}</p>
                            </div>

                            <Link
                                href="/greenmarket/vendor-dashboard/profile"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Active products', value: stats.products, accent: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Profile views', value: stats.views || 0, accent: 'bg-blue-50 text-blue-700' },
                        { label: 'New inquiries', value: stats.inquiries || 0, accent: 'bg-amber-50 text-amber-700' }
                    ].map((metric) => (
                        <div key={metric.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <p className="text-sm text-gray-500">{metric.label}</p>
                            <p className={`text-3xl font-bold mt-2 ${metric.accent}`}>{metric.value}</p>
                        </div>
                    ))}
                </div>

                {/* Action shortcuts */}
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    {dashboardActions.map((action) => (
                        <Link
                            key={action.title}
                            href={action.href}
                            className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                                <action.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{action.title}</p>
                                <p className="text-sm text-gray-500">{action.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {vendor.verification_status === 'pending_review' && (
                    <div className="mb-8 rounded-2xl border border-amber-200 bg-white p-5 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="text-sm text-gray-700">
                            <p className="font-semibold text-amber-700">Verification pending</p>
                            <p>Your documents are under review. We&apos;ll email you when you&apos;re approved.</p>
                        </div>
                    </div>
                )}

                {/* Onboarding Progress */}
                {!vendor.onboarding_completed && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Complete Your Setup</h2>
                                <p className="text-sm text-gray-600">Finish these steps to unlock all features</p>
                            </div>
                            <span className="text-sm font-medium text-green-600">
                                {Math.min(currentStep - 1, 4)}/4 completed
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                            <motion.div
                                className="h-full bg-green-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            />
                        </div>

                        {/* Steps */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {onboardingSteps.map((step, index) => {
                                const isCompleted = step.id < currentStep;
                                const isCurrent = step.id === currentStep;
                                const isLocked = step.id > currentStep;

                                return (
                                    <div
                                        key={step.id}
                                        className={`relative p-4 rounded-xl border-2 transition-all ${
                                            isCompleted
                                                ? 'border-green-200 bg-green-50'
                                                : isCurrent
                                                ? 'border-green-500 bg-white shadow-md'
                                                : 'border-gray-100 bg-gray-50 opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                isCompleted
                                                    ? 'bg-green-500 text-white'
                                                    : isCurrent
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-200 text-gray-400'
                                            }`}>
                                                {isCompleted ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <step.icon className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-semibold ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
                                                    {step.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                                            </div>
                                        </div>
                                        
                                        {isCurrent && step.href && (
                                            <Link
                                                href={step.href}
                                                className="mt-3 w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Continue <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Verification Upgrade Banner */}
                {vendor.verification_level === 'basic' && vendor.onboarding_completed && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-8"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900">Upgrade to Verified Vendor</h3>
                                    <p className="text-blue-700 text-sm">Upload your National ID to get the verified badge and build trust with buyers.</p>
                                </div>
                            </div>
                            <Link
                                href="/greenmarket/vendor-dashboard/verify"
                                className="whitespace-nowrap px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Shield className="w-4 h-4" />
                                Get Verified
                            </Link>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-3 gap-4"
                        >
                            {[
                                { label: 'Products', value: stats.products, icon: Package, color: 'green' },
                                { label: 'Profile Views', value: stats.views, icon: Eye, color: 'blue' },
                                { label: 'Inquiries', value: stats.inquiries, icon: Users, color: 'purple' },
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
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            <Link
                                href="/greenmarket/products/new"
                                className="group p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-green-500 hover:shadow-md transition-all"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                                    <Plus className="w-6 h-6 text-green-600 group-hover:text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Add New Product</h3>
                                <p className="text-gray-500 text-sm">List produce, goods, or equipment</p>
                            </Link>

                            <Link
                                href="/greenmarket/vendor-dashboard/products"
                                className="group p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                    <Package className="w-6 h-6 text-blue-600 group-hover:text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Manage Products</h3>
                                <p className="text-gray-500 text-sm">Edit, update, or remove listings</p>
                            </Link>
                        </motion.div>

                        {/* Recent Activity / Products Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900">Your Products</h3>
                                <Link href="/greenmarket/vendor-dashboard/products" className="text-sm text-green-600 font-medium hover:underline flex items-center">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            
                            {stats.products === 0 ? (
                                <div className="p-12 text-center">
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h4 className="font-semibold text-gray-900 mb-2">No products yet</h4>
                                    <p className="text-gray-500 text-sm mb-4">Start by adding your first product listing</p>
                                    <Link
                                        href="/greenmarket/products/new"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Product
                                    </Link>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <p className="text-gray-600">You have {stats.products} product(s) listed.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Verification Status */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        >
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-gray-400" />
                                Verification Status
                            </h3>
                            
                            <div className="space-y-3">
                                <div className={`flex items-center justify-between p-3 rounded-lg ${vendor.verification_level !== 'basic' ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <div className="flex items-center gap-2">
                                        {vendor.verification_level !== 'basic' ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-gray-300" />
                                        )}
                                        <span className="text-sm font-medium">ID Verified</span>
                                    </div>
                                    {vendor.verification_level === 'basic' && (
                                        <Link href="/greenmarket/vendor-dashboard/verify" className="text-xs text-blue-600 font-medium">
                                            Verify
                                        </Link>
                                    )}
                                </div>
                                
                                <div className={`flex items-center justify-between p-3 rounded-lg ${vendor.verification_level === 'premium' ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <div className="flex items-center gap-2">
                                        {vendor.verification_level === 'premium' ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-gray-300" />
                                        )}
                                        <span className="text-sm font-medium">Business Verified</span>
                                    </div>
                                    {vendor.verification_level !== 'premium' && (
                                        <Link href="/greenmarket/vendor-dashboard/verify" className="text-xs text-blue-600 font-medium">
                                            Add
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        >
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-400" />
                                Settings
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/greenmarket/vendor-dashboard/profile" className="flex items-center justify-between p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm">
                                        <span className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            Business Profile
                                        </span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/greenmarket/vendor-dashboard/payment" className="flex items-center justify-between p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm">
                                        <span className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            Payment Settings
                                        </span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/greenmarket/vendor-dashboard/shipping" className="flex items-center justify-between p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm">
                                        <span className="flex items-center gap-2">
                                            <Truck className="w-4 h-4" />
                                            Delivery Options
                                        </span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </li>
                            </ul>
                        </motion.div>

                        {/* Help Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white"
                        >
                            <h3 className="font-bold mb-2">Need Help?</h3>
                            <p className="text-gray-300 text-sm mb-4">
                                Check our seller guide or contact support for assistance.
                            </p>
                            <Link
                                href="/help/sellers"
                                className="inline-flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300"
                            >
                                View Seller Guide <ExternalLink className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VendorDashboardFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
    );
}
