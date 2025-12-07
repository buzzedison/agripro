'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useContentAccess } from '@/lib/hooks/useContentAccess';
import {
    FaStore,
    FaUserCheck,
    FaClock,
    FaTimes,
    FaStar,
    FaArrowLeft,
    FaChartLine
} from 'react-icons/fa';

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
    total: number;
    featured: number;
    recentApplications: number;
}

export default function AdminTradeDashboard() {
    const { user, loading: authLoading } = useContentAccess();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && !authLoading) {
            fetchStats();
        }
    }, [user, authLoading]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/trade/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Trade Dashboard...</p>
                </div>
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
                            <h1 className="text-3xl font-bold text-gray-900">Trade Management</h1>
                            <p className="mt-1 text-gray-600">
                                Manage vendor applications and marketplace
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-lg">
                                <FaClock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.pending || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                                <FaUserCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.approved || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
                                <FaTimes className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Rejected</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.rejected || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                                <FaStar className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Featured</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.featured || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Vendor Management */}
                    <Link
                        href="/admin/trade/vendors"
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group relative"
                    >
                        {stats && stats.pending > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white shadow-lg">
                                {stats.pending > 9 ? '9+' : stats.pending}
                            </span>
                        )}
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                <FaStore className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">
                                    Vendor Applications
                                </h3>
                                {stats && stats.pending > 0 && (
                                    <p className="text-xs text-yellow-600 font-medium">
                                        {stats.pending} awaiting review
                                    </p>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Review and manage vendor applications. Approve, reject, or request more information.
                        </p>
                        <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                            Manage Vendors →
                        </div>
                    </Link>

                    {/* Analytics */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 opacity-75">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                                <FaChartLine className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Marketplace Analytics
                                </h3>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                            View marketplace performance, vendor engagement, and product statistics.
                        </p>
                        <div className="mt-4 flex items-center text-gray-400 text-sm font-medium">
                            Coming Soon
                        </div>
                    </div>

                    {/* View Marketplace */}
                    <Link
                        href="/greenmarket/marketplace"
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                <FaStore className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
                                    View Marketplace
                                </h3>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Preview the public marketplace as visitors and customers see it.
                        </p>
                        <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
                            Open Marketplace →
                        </div>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                                <p className="text-sm text-gray-600">Total Applications</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-3xl font-bold text-gray-900">{stats?.recentApplications || 0}</p>
                                <p className="text-sm text-gray-600">This Week</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-3xl font-bold text-green-600">
                                    {stats && stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                                </p>
                                <p className="text-sm text-gray-600">Approval Rate</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
