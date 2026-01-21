'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    accent?: 'emerald' | 'amber' | 'sky' | 'rose';
}

const accentMap: Record<
    NonNullable<QuickActionCardProps['accent']>,
    { border: string; iconBg: string; iconColor: string; hover: string }
> = {
    emerald: {
        border: 'border-emerald-100',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-700',
        hover: 'hover:border-emerald-200 hover:bg-emerald-50/70'
    },
    amber: {
        border: 'border-amber-100',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-700',
        hover: 'hover:border-amber-200 hover:bg-amber-50/70'
    },
    sky: {
        border: 'border-sky-100',
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-700',
        hover: 'hover:border-sky-200 hover:bg-sky-50/70'
    },
    rose: {
        border: 'border-rose-100',
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-700',
        hover: 'hover:border-rose-200 hover:bg-rose-50/70'
    }
};

export default function QuickActionCard({
    title,
    description,
    href,
    icon: Icon,
    accent = 'emerald'
}: QuickActionCardProps) {
    const styles = accentMap[accent];
    return (
        <Link
            href={href}
            className={`flex flex-col gap-3 rounded-2xl border bg-white/80 p-4 transition-all shadow-sm ${styles.border} ${styles.hover}`}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles.iconBg}`}>
                <Icon className={`w-6 h-6 ${styles.iconColor}`} />
            </div>
            <div className="space-y-1">
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
            <span className="text-sm font-semibold text-gray-900">Open</span>
        </Link>
    );
}
