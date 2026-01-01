'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
    Shield, ArrowLeft, Upload, CheckCircle, AlertCircle,
    FileText, Camera, Loader2, X, Eye, Building2, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Vendor {
    id: string;
    business_name: string;
    verification_level: 'basic' | 'verified' | 'premium';
    id_document_url: string | null;
    id_document_type: string | null;
    business_document_url: string | null;
    business_document_type: string | null;
}

export default function VerifyVendorPage() {
    const router = useRouter();
    const supabase = createClient();
    
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<'id' | 'business' | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [idFile, setIdFile] = useState<File | null>(null);
    const [idPreview, setIdPreview] = useState<string | null>(null);
    const [idType, setIdType] = useState('ghana_card');
    
    const [businessFile, setBusinessFile] = useState<File | null>(null);
    const [businessPreview, setBusinessPreview] = useState<string | null>(null);
    const [businessType, setBusinessType] = useState('business_registration');

    useEffect(() => {
        fetchVendorData();
    }, []);

    const fetchVendorData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            router.push('/auth/login?redirectTo=/greenmarket/vendor-dashboard/verify');
            return;
        }

        const { data: vendorData, error } = await supabase
            .from('trade_vendors')
            .select('id, business_name, verification_level, id_document_url, id_document_type, business_document_url, business_document_type')
            .eq('user_id', user.id)
            .single();

        if (error || !vendorData) {
            router.push('/greenmarket/become-vendor');
            return;
        }

        setVendor(vendorData);
        if (vendorData.id_document_url) {
            setIdPreview(vendorData.id_document_url);
        }
        if (vendorData.business_document_url) {
            setBusinessPreview(vendorData.business_document_url);
        }
        setLoading(false);
    };

    const handleFileSelect = (file: File, type: 'id' | 'business') => {
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a JPG, PNG, WebP, or PDF file');
            return;
        }

        setError('');

        if (type === 'id') {
            setIdFile(file);
            if (file.type.startsWith('image/')) {
                setIdPreview(URL.createObjectURL(file));
            } else {
                setIdPreview(null);
            }
        } else {
            setBusinessFile(file);
            if (file.type.startsWith('image/')) {
                setBusinessPreview(URL.createObjectURL(file));
            } else {
                setBusinessPreview(null);
            }
        }
    };

    const uploadFile = async (file: File, path: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${path}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('vendor-documents')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('vendor-documents')
            .getPublicUrl(fileName);

        return publicUrl;
    };

    const handleSubmitVerification = async () => {
        if (!vendor) return;
        
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const updates: any = {
                verification_submitted_at: new Date().toISOString()
            };

            // Upload ID document if new file selected
            if (idFile) {
                setUploading('id');
                const idUrl = await uploadFile(idFile, `${vendor.id}/id`);
                updates.id_document_url = idUrl;
                updates.id_document_type = idType;
            }

            // Upload business document if new file selected
            if (businessFile) {
                setUploading('business');
                const businessUrl = await uploadFile(businessFile, `${vendor.id}/business`);
                updates.business_document_url = businessUrl;
                updates.business_document_type = businessType;
            }

            // Determine new verification level
            // For now, auto-verify on ID upload (in production, this would be admin-reviewed)
            if (idFile || vendor.id_document_url) {
                updates.verification_level = 'verified';
                updates.is_verified = true;
                updates.id_verified_at = new Date().toISOString();
            }

            if ((businessFile || vendor.business_document_url) && (idFile || vendor.id_document_url)) {
                updates.verification_level = 'premium';
                updates.business_verified_at = new Date().toISOString();
            }

            // Update onboarding step if needed
            if (vendor.verification_level === 'basic') {
                updates.onboarding_step = 4; // Move to next step
            }

            const { error: updateError } = await supabase
                .from('trade_vendors')
                .update(updates)
                .eq('id', vendor.id);

            if (updateError) throw updateError;

            setSuccess('Verification documents submitted successfully!');
            
            // Refresh vendor data
            await fetchVendorData();

            // Redirect after short delay
            setTimeout(() => {
                router.push('/greenmarket/vendor-dashboard?verified=true');
            }, 2000);

        } catch (err: any) {
            console.error('Verification error:', err);
            setError(err.message || 'Failed to submit verification. Please try again.');
        } finally {
            setSubmitting(false);
            setUploading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!vendor) return null;

    const canSubmit = idFile || businessFile;
    const isAlreadyVerified = vendor.verification_level === 'verified' || vendor.verification_level === 'premium';
    const isAlreadyPremium = vendor.verification_level === 'premium';

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/greenmarket/vendor-dashboard"
                        className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-600" />
                        Vendor Verification
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Upload your documents to get verified and build trust with buyers.
                    </p>
                </div>

                {/* Current Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-6 mb-8 ${
                        vendor.verification_level === 'premium'
                            ? 'bg-amber-50 border border-amber-200'
                            : vendor.verification_level === 'verified'
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 border border-gray-200'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            vendor.verification_level === 'premium'
                                ? 'bg-amber-100'
                                : vendor.verification_level === 'verified'
                                ? 'bg-blue-100'
                                : 'bg-gray-200'
                        }`}>
                            {vendor.verification_level === 'premium' ? (
                                <Star className="w-6 h-6 text-amber-600 fill-current" />
                            ) : vendor.verification_level === 'verified' ? (
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                            ) : (
                                <Shield className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">
                                {vendor.verification_level === 'premium'
                                    ? 'Premium Vendor'
                                    : vendor.verification_level === 'verified'
                                    ? 'Verified Vendor'
                                    : 'Basic Vendor'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {vendor.verification_level === 'premium'
                                    ? 'Your business is fully verified with all documents.'
                                    : vendor.verification_level === 'verified'
                                    ? 'Your identity is verified. Add business documents for Premium status.'
                                    : 'Upload your ID to become a Verified Vendor.'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Verification Tiers Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
                >
                    <h3 className="font-bold text-gray-900 mb-4">Verification Levels</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                            <div className="w-3 h-3 bg-gray-400 rounded-full mt-1.5" />
                            <div>
                                <h4 className="font-semibold text-gray-900">Basic Vendor</h4>
                                <p className="text-sm text-gray-600">Can list products and receive inquiries</p>
                            </div>
                        </div>
                        <div className={`flex items-start gap-4 p-4 rounded-lg ${isAlreadyVerified ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                            <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">Verified Vendor</h4>
                                <p className="text-sm text-gray-600">Blue badge, higher search ranking, buyer trust</p>
                                <p className="text-xs text-blue-600 mt-1">Requires: National ID or Passport</p>
                            </div>
                            {isAlreadyVerified && <CheckCircle className="w-5 h-5 text-blue-600" />}
                        </div>
                        <div className={`flex items-start gap-4 p-4 rounded-lg ${isAlreadyPremium ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
                            <div className="w-3 h-3 bg-amber-500 rounded-full mt-1.5" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">Premium Vendor</h4>
                                <p className="text-sm text-gray-600">Gold badge, featured placement, priority support</p>
                                <p className="text-xs text-amber-600 mt-1">Requires: ID + Business Registration</p>
                            </div>
                            {isAlreadyPremium && <Star className="w-5 h-5 text-amber-600 fill-current" />}
                        </div>
                    </div>
                </motion.div>

                {/* Upload Forms */}
                <div className="space-y-6">
                    {/* ID Document Upload */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <h3 className="font-bold text-gray-900">Personal ID Document</h3>
                                        <p className="text-sm text-gray-500">Required for Verified status</p>
                                    </div>
                                </div>
                                {vendor.id_document_url && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        <CheckCircle className="w-3 h-3" /> Uploaded
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Document Type
                                </label>
                                <select
                                    value={idType}
                                    onChange={(e) => setIdType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="national_id">National ID Card</option>
                                    <option value="passport">Passport</option>
                                    <option value="drivers_license">Driver&apos;s License</option>
                                </select>
                            </div>

                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                                    idPreview
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                                onClick={() => document.getElementById('id-upload')?.click()}
                            >
                                {idPreview ? (
                                    <div className="relative">
                                        {idFile?.type.startsWith('image/') || vendor.id_document_url ? (
                                            <div className="relative w-48 h-32 mx-auto rounded-lg overflow-hidden">
                                                <Image
                                                    src={idPreview}
                                                    alt="ID Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <FileText className="w-12 h-12 text-green-600 mx-auto" />
                                        )}
                                        <p className="text-sm text-green-600 font-medium mt-3">
                                            {idFile ? idFile.name : 'Document uploaded'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIdFile(null);
                                                setIdPreview(vendor.id_document_url);
                                            }}
                                            className="mt-2 text-xs text-gray-500 hover:text-red-600"
                                        >
                                            Change file
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-600 font-medium">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            JPG, PNG, WebP or PDF (Max 5MB)
                                        </p>
                                    </>
                                )}
                            </div>
                            <input
                                id="id-upload"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'id')}
                            />
                        </div>
                    </motion.div>

                    {/* Business Document Upload */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-amber-600" />
                                    <div>
                                        <h3 className="font-bold text-gray-900">Business Registration (Optional)</h3>
                                        <p className="text-sm text-gray-500">Required for Premium status</p>
                                    </div>
                                </div>
                                {vendor.business_document_url && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        <CheckCircle className="w-3 h-3" /> Uploaded
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Document Type
                                </label>
                                <select
                                    value={businessType}
                                    onChange={(e) => setBusinessType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="business_registration">Business Registration Certificate</option>
                                    <option value="tax_certificate">Tax Identification Certificate</option>
                                    <option value="trade_license">Trade License</option>
                                    <option value="cooperative_cert">Cooperative Certificate</option>
                                    <option value="other">Other Business Document</option>
                                </select>
                            </div>

                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                                    businessPreview
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50'
                                }`}
                                onClick={() => document.getElementById('business-upload')?.click()}
                            >
                                {businessPreview ? (
                                    <div className="relative">
                                        {businessFile?.type.startsWith('image/') || vendor.business_document_url ? (
                                            <div className="relative w-48 h-32 mx-auto rounded-lg overflow-hidden">
                                                <Image
                                                    src={businessPreview}
                                                    alt="Business Doc Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <FileText className="w-12 h-12 text-green-600 mx-auto" />
                                        )}
                                        <p className="text-sm text-green-600 font-medium mt-3">
                                            {businessFile ? businessFile.name : 'Document uploaded'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setBusinessFile(null);
                                                setBusinessPreview(vendor.business_document_url);
                                            }}
                                            className="mt-2 text-xs text-gray-500 hover:text-red-600"
                                        >
                                            Change file
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-600 font-medium">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            JPG, PNG, WebP or PDF (Max 5MB)
                                        </p>
                                    </>
                                )}
                            </div>
                            <input
                                id="business-upload"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'business')}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        {success}
                    </div>
                )}

                {/* Submit Button */}
                <div className="mt-8">
                    <button
                        onClick={handleSubmitVerification}
                        disabled={!canSubmit || submitting}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {uploading === 'id' ? 'Uploading ID...' : uploading === 'business' ? 'Uploading Business Doc...' : 'Processing...'}
                            </>
                        ) : (
                            <>
                                <Shield className="w-5 h-5" />
                                Submit for Verification
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Your documents are securely stored and used only for verification purposes.
                    </p>
                </div>
            </div>
        </div>
    );
}
