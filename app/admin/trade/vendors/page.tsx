'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useContentAccess } from '@/lib/hooks/useContentAccess';
import {
    FaArrowLeft,
    FaSearch,
    FaCheck,
    FaTimes,
    FaEye,
    FaStar,
    FaClock,
    FaEnvelope,
    FaPhone,
    FaStore,
    FaSpinner,
    FaExclamationTriangle,
    FaShieldAlt
} from 'react-icons/fa';

interface Vendor {
    id: string;
    business_name: string;
    owner_name: string;
    email: string;
    phone: string;
    business_type: string;
    product_description: string;
    sustainability_practices: string;
    booth_preference: string;
    logo_url: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    is_featured: boolean;
    is_verified: boolean;
    admin_notes: string | null;
    rejection_reason: string | null;
    created_at: string;
    verified_at: string | null;
    country: string;
    region: string;
    city: string;
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    suspended: 'bg-gray-100 text-gray-800 border-gray-200',
};

const businessTypeLabels: Record<string, string> = {
    'organic-farm': 'Organic Farm',
    'eco-products': 'Eco-Friendly Products',
    'sustainable-fashion': 'Sustainable Fashion',
    'green-tech': 'Green Technology',
    'food-beverage': 'Food & Beverage',
    'wellness': 'Health & Wellness',
    'other': 'Other',
};

export default function AdminVendorManagement() {
    const { user, loading: authLoading } = useContentAccess();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        if (user && !authLoading) {
            fetchVendors();
        }
    }, [user, authLoading, statusFilter]);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== 'all') {
                params.set('status', statusFilter);
            }
            if (searchQuery) {
                params.set('search', searchQuery);
            }

            const response = await fetch(`/api/admin/trade/vendors?${params}`);
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

    const updateVendorStatus = async (vendorId: string, status: string, notes?: string, reason?: string) => {
        try {
            setActionLoading(true);
            const response = await fetch('/api/admin/trade/vendors', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorId,
                    status,
                    adminNotes: notes || adminNotes,
                    rejectionReason: reason || rejectionReason,
                }),
            });

            if (response.ok) {
                fetchVendors();
                setSelectedVendor(null);
                setShowRejectModal(false);
                setAdminNotes('');
                setRejectionReason('');
            }
        } catch (error) {
            console.error('Error updating vendor:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = (vendor: Vendor) => {
        updateVendorStatus(vendor.id, 'approved');
    };

    const handleReject = () => {
        if (selectedVendor && rejectionReason.trim()) {
            updateVendorStatus(selectedVendor.id, 'rejected', adminNotes, rejectionReason);
        }
    };

    const handleVerify = async (vendor: Vendor) => {
        try {
            setActionLoading(true);
            const response = await fetch('/api/admin/trade/vendors', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorId: vendor.id,
                    status: 'approved', // Status remains approved
                    verify: true // Explicit verification flag
                }),
            });

            if (response.ok) {
                fetchVendors();
                if (selectedVendor?.id === vendor.id) {
                    setSelectedVendor(null);
                }
            }
        } catch (error) {
            console.error('Error verifying vendor:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <FaSpinner className="h-8 w-8 animate-spin text-green-600" />
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
                            href="/admin/trade"
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <FaArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Vendor Applications</h1>
                            <p className="mt-1 text-gray-600">
                                Review and manage vendor applications
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Status Tabs */}
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'pending', 'approved', 'rejected', 'suspended'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </div>

                {/* Vendors List */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <FaSpinner className="h-8 w-8 animate-spin text-green-600 mx-auto" />
                        <p className="mt-4 text-gray-600">Loading vendors...</p>
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <FaStore className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">No vendors found</h3>
                        <p className="text-gray-600 mt-1">
                            {statusFilter === 'pending'
                                ? 'No pending applications at the moment.'
                                : 'Try adjusting your filters.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {vendors.map((vendor) => (
                            <div
                                key={vendor.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Vendor Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {vendor.business_name}
                                                </h3>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[vendor.status]}`}>
                                                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                                                </span>
                                                {vendor.is_featured && (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                                        <FaStar className="inline w-3 h-3 mr-1" />
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {vendor.owner_name} • {businessTypeLabels[vendor.business_type] || vendor.business_type}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <FaEnvelope className="w-3 h-3" />
                                                    {vendor.email}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FaPhone className="w-3 h-3" />
                                                    {vendor.phone}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FaClock className="w-3 h-3" />
                                                    {formatDate(vendor.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 lg:flex-shrink-0">
                                        <button
                                            onClick={() => setSelectedVendor(vendor)}
                                            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <FaEye className="w-4 h-4" />
                                        </button>
                                        {vendor.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(vendor)}
                                                    disabled={actionLoading}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    <FaCheck className="w-4 h-4" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedVendor(vendor);
                                                        setShowRejectModal(true);
                                                    }}
                                                    disabled={actionLoading}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    <FaTimes className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {vendor.status === 'approved' && !vendor.is_verified && (
                                            <button
                                                onClick={() => handleVerify(vendor)}
                                                disabled={actionLoading}
                                                className="px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Verify Vendor"
                                            >
                                                <FaShieldAlt className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Description Preview */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {vendor.product_description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* View Vendor Modal */}
                {selectedVendor && !showRejectModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">Vendor Details</h2>
                                    <button
                                        onClick={() => setSelectedVendor(null)}
                                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                    >
                                        <FaTimes className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Business Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Business Name</label>
                                            <p className="text-gray-900">{selectedVendor.business_name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Owner Name</label>
                                            <p className="text-gray-900">{selectedVendor.owner_name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-gray-900">{selectedVendor.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Phone</label>
                                            <p className="text-gray-900">{selectedVendor.phone}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Business Type</label>
                                            <p className="text-gray-900">{businessTypeLabels[selectedVendor.business_type] || selectedVendor.business_type}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Booth Preference</label>
                                            <p className="text-gray-900">{selectedVendor.booth_preference || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Product/Service Description</h3>
                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedVendor.product_description}</p>
                                </div>

                                {/* Sustainability */}
                                {selectedVendor.sustainability_practices && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sustainability Practices</h3>
                                        <p className="text-gray-700 bg-green-50 p-4 rounded-lg">{selectedVendor.sustainability_practices}</p>
                                    </div>
                                )}

                                {/* Admin Notes */}
                                {selectedVendor.status === 'pending' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Notes</h3>
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add internal notes about this vendor..."
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                )}

                                {/* Rejection reason display */}
                                {selectedVendor.status === 'rejected' && selectedVendor.rejection_reason && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-red-900 mb-3">Rejection Reason</h3>
                                        <p className="text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
                                            {selectedVendor.rejection_reason}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                                {selectedVendor.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowRejectModal(true);
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                        >
                                            <FaTimes className="w-4 h-4" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApprove(selectedVendor)}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {actionLoading ? (
                                                <FaSpinner className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <FaCheck className="w-4 h-4" />
                                            )}
                                            Approve Vendor
                                        </button>
                                    </>
                                )}
                                {selectedVendor.status === 'approved' && !selectedVendor.is_verified && (
                                    <button
                                        onClick={() => handleVerify(selectedVendor)}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {actionLoading ? (
                                            <FaSpinner className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <FaShieldAlt className="w-4 h-4" />
                                        )}
                                        Verify Vendor
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && selectedVendor && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <FaExclamationTriangle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Reject Vendor</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 mb-4">
                                    Please provide a reason for rejecting <strong>{selectedVendor.business_name}</strong>. This will be sent to the vendor.
                                </p>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter rejection reason..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason('');
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading || !rejectionReason.trim()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {actionLoading ? (
                                        <FaSpinner className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <FaTimes className="w-4 h-4" />
                                    )}
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
