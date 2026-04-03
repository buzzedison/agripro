'use client';

import { CheckCircle, Star, Shield, Store } from 'lucide-react';

type VerificationLevel = 'basic' | 'verified' | 'premium' | 'agripro_certified';

interface VerificationBadgeProps {
    level: VerificationLevel;
    size?: 'sm' | 'md' | 'lg';
}

const config: Record<VerificationLevel, {
    label: string;
    icon: React.ElementType;
    className: string;
}> = {
    basic: {
        label: 'Basic',
        icon: Store,
        className: 'bg-gray-100 text-gray-500',
    },
    verified: {
        label: 'Identity Verified',
        icon: CheckCircle,
        className: 'bg-blue-50 text-blue-700',
    },
    premium: {
        label: 'Business Verified',
        icon: Shield,
        className: 'bg-amber-50 text-amber-700',
    },
    agripro_certified: {
        label: 'AgriPro Certified',
        icon: Star,
        className: 'bg-green-50 text-green-700',
    },
};

const iconSizes = { sm: 'w-3 h-3', md: 'w-3.5 h-3.5', lg: 'w-4 h-4' };
const textSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };

export default function VerificationBadge({ level, size = 'md' }: VerificationBadgeProps) {
    const { label, icon: Icon, className } = config[level] ?? config.basic;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${textSizes[size]} ${className}`}>
            <Icon className={iconSizes[size]} />
            {label}
        </span>
    );
}
