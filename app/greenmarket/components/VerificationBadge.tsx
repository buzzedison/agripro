'use client';

import { FaCheckCircle, FaClock, FaShieldAlt } from 'react-icons/fa';

interface VerificationBadgeProps {
    isVerified: boolean;
    verifiedAt?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function VerificationBadge({
    isVerified,
    verifiedAt,
    size = 'md',
    showLabel = true,
}: VerificationBadgeProps) {
    const sizeClasses = {
        sm: 'text-xs gap-1',
        md: 'text-sm gap-1.5',
        lg: 'text-base gap-2',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    if (isVerified) {
        return (
            <div
                className={`inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium ${sizeClasses[size]}`}
                title={verifiedAt ? `Verified on ${new Date(verifiedAt).toLocaleDateString()}` : 'Verified Vendor'}
            >
                <FaCheckCircle className={iconSizes[size]} />
                {showLabel && <span>Verified</span>}
            </div>
        );
    }

    return (
        <div
            className={`inline-flex items-center px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full font-medium ${sizeClasses[size]}`}
            title="Pending Verification"
        >
            <FaClock className={iconSizes[size]} />
            {showLabel && <span>Pending</span>}
        </div>
    );
}

// Trust badge component for vendor profiles
export function TrustBadge() {
    return (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="p-2 bg-green-100 rounded-lg">
                <FaShieldAlt className="w-6 h-6 text-green-600" />
            </div>
            <div>
                <h4 className="font-semibold text-green-900">Verified by Green Market</h4>
                <p className="text-sm text-green-700">
                    This vendor has been reviewed and approved by our team
                </p>
            </div>
        </div>
    );
}
