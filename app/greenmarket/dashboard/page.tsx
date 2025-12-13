'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Store, CheckCircle, Clock, AlertCircle, Plus,
    ShoppingBag, Shield, Settings, ArrowRight, Loader2,
    FileText, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Vendor {
    id: string;
    business_name: string;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    is_verified: boolean;
    slug: string;
    rejection_reason?: string;
    admin_notes?: string;
}

export default function VendorDashboardPage() {
    const router = useRouter();
    const supabase = createClient();
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchVendorData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login?redirectTo=/greenmarket/dashboard');
                return;
            }
            setUser(user);

            const { data: vendorData, error } = await supabase
                .from('trade_vendors')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (vendorData && !error) {
                setVendor(vendorData);
            }
            // If error is "PGRST116" (no rows), user hasn't applied yet.
            // We'll handle that state in the UI.

            setLoading(false);
        };

        fetchVendorData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    // STATE 1: Not a vendor (No application found)
    if (!vendor) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Store className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Become a Vendor</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Start selling your agricultural products on the Green Market. Reach thousands of buyers across the region.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 text-left mt-12">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <ShoppingBag className="w-8 h-8 text-blue-600 mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Sell Products</h3>
                            <p className="text-gray-600">List your produce and value-added products for free.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <Shield className="w-8 h-8 text-green-600 mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Get Verified</h3>
                            <p className="text-gray-600">Build trust with the verified badge and rigorous vetting.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <FileText className="w-8 h-8 text-purple-600 mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Manage Easily</h3>
                            <p className="text-gray-600">Simple dashboard to track orders and manage inventory.</p>
                        </div>
                    </div>

                    <Link
                        href="/greenmarket/vendors"
                        className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Apply Now <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    // STATE 2: Application Pending
    if (vendor.status === 'pending') {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
                    <p className="text-gray-600 mb-6">
                        Thanks for applying, <strong>{vendor.business_name}</strong>! Our team is currently reviewing your details.
                        This usually takes 24-48 hours.
                    </p>
                    <div className="bg-amber-50 rounded-lg p-4 text-amber-800 text-sm">
                        You&apos;ll receive an email once your application status changes.
                    </div>
                    <Link
                        href="/connect/dashboard"
                        className="mt-8 inline-flex items-center text-gray-600 hover:text-green-600"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180 mr-2" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // STATE 3: Application Rejected
    if (vendor.status === 'rejected') {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Update</h2>
                    <p className="text-gray-600 mb-6">
                        Unfortunately, your application for <strong>{vendor.business_name}</strong> was not approved at this time.
                    </p>
                    {vendor.rejection_reason && (
                        <div className="bg-red-50 text-left rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-red-900 mb-1">Reason:</h4>
                            <p className="text-red-800">{vendor.rejection_reason}</p>
                        </div>
                    )}
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/contact"
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Contact Support
                        </Link>
                        {/* Maybe allow re-application? */}
                    </div>
                </div>
            </div>
        );
    }

    // STATE 4: Approved (Dashboard View)
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Store className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{vendor.business_name}</h1>
                                <p className="text-sm text-gray-500">Vendor Dashboard</p>
                            </div>
                        </div>
                        <Link
                            href={`/greenmarket/vendors/${vendor.slug}`}
                            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                        >
                            View Public Store <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Verification Status Banner */}
                {!vendor.is_verified ? (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-blue-900">Get Verified & Build Trust</h3>
                            </div>
                            <p className="text-blue-700 max-w-xl">
                                You haven&apos;t applied to become a vendor yet. Start your journey today!
                                Verified vendors get a badge, higher visibility, and more trust from buyers.
                            </p>
                        </div>
                        <Link
                            href="/greenmarket/dashboard/verification"
                            className="whitespace-nowrap px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md transition-all"
                        >
                            Complete Verification
                        </Link>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                            <h3 className="font-bold text-green-900">Verified Vendor</h3>
                            <p className="text-green-700 text-sm">Your business is fully verified and trusted.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link
                                href="/greenmarket/products/new"
                                className="group p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-green-500 hover:shadow-md transition-all"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                                    <Plus className="w-6 h-6 text-green-600 group-hover:text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Post New Product</h3>
                                <p className="text-gray-500 text-sm">List produce, value-added goods, or equipment.</p>
                            </Link>

                            <Link
                                href="/greenmarket/orders"
                                className="group p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                    <ShoppingBag className="w-6 h-6 text-blue-600 group-hover:text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Manage Orders</h3>
                                <p className="text-gray-500 text-sm">View incoming orders and track sales.</p>
                            </Link>
                        </div>

                        {/* Recent Products / Stats Placeholder */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">0</p>
                                    <p className="text-xs text-gray-500">Active Products</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">0</p>
                                    <p className="text-xs text-gray-500">Total Views</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">0</p>
                                    <p className="text-xs text-gray-500">Sales</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Settings */}
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Settings className="w-4 h-4" /> Settings
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/greenmarket/dashboard/settings/profile" className="text-gray-600 hover:text-green-600 flex items-center justify-between text-sm">
                                        Edit Vendor Profile <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/greenmarket/dashboard/settings/payment" className="text-gray-600 hover:text-green-600 flex items-center justify-between text-sm">
                                        Payment Methods <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/greenmarket/dashboard/settings/shipping" className="text-gray-600 hover:text-green-600 flex items-center justify-between text-sm">
                                        Delivery Options <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
