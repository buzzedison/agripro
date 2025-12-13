'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Upload, CheckCircle, AlertCircle, FileText, Camera } from 'lucide-react';

export default function VerificationPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSubmitting(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents Received</h2>
                    <p className="text-gray-600 mb-8">
                        To ensure the safety and trust of our marketplace, we need to verify your identity and business details.
                        This process is quick and helps you build trust with buyers. You&apos;ll be notified via email.
                    </p>
                    <Link
                        href="/greenmarket/dashboard"
                        className="inline-flex items-center text-green-600 font-medium hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/greenmarket/dashboard"
                        className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-600" />
                        Vendor Verification
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Get verified to build trust, unlock premium features, and boost your sales.
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-blue-800">
                    <h3 className="font-bold flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        Why verify?
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
                        <li>Official &quot;Verified Vendor&quot; badge on your store and products</li>
                        <li>Higher ranking in search results</li>
                        <li>Access to bulk buyers and B2B opportunities</li>
                        <li>Increased buyer confidence</li>
                    </ul>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100 p-6 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Upload Documents</h3>
                            <span className="text-sm text-gray-500">Step 1 of 1</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                        {/* ID Upload */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                1. Personal Identification
                            </h4>
                            <p className="text-sm text-gray-500">
                                Upload a clear photo of your National ID, Passport, or Driver&apos;s License.
                            </p>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer text-center group">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3 group-hover:text-green-500" />
                                <p className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-400 mt-1">PG, PNG or PDF (Max 5MB)</p>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Business Doc Upload */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                2. Business Registration (Optional)
                                <p className="text-xs text-gray-500 mt-1">
                                    Accepted formats: PDF, JPG, PNG (Max 5MB)
                                </p>
                            </h4>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer text-center group">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3 group-hover:text-green-500" />
                                <p className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>Submit Documents</>
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4">
                                Your information is securely stored and used only for verification purposes.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
