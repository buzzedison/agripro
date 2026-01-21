'use client';

import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface SectionAction {
    label: string;
    href: string;
    icon?: LucideIcon;
    subtle?: boolean;
}

interface SectionHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    alignment?: 'left' | 'center';
    action?: SectionAction;
    children?: ReactNode;
}

export default function SectionHeader({
    eyebrow,
    title,
    description,
    action,
    alignment = 'left',
    children
}: SectionHeaderProps) {
    const isCentered = alignment === 'center';
    const ActionIcon = action?.icon || ArrowRight;

    return (
        <div
            className={`w-full flex flex-col gap-3 ${
                isCentered ? 'items-center text-center' : 'items-start text-left'
            }`}
        >
            {eyebrow && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {eyebrow}
                </span>
            )}
            <div className={`${isCentered ? 'max-w-2xl' : 'max-w-3xl'}`}>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
                {description && (
                    <p className="mt-2 text-gray-600 text-base sm:text-lg">{description}</p>
                )}
            </div>
            {children}
            {action && (
                <Link
                    href={action.href}
                    className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                        action.subtle
                            ? 'text-gray-600 hover:text-gray-900'
                            : 'text-emerald-700 hover:text-emerald-900'
                    }`}
                >
                    {action.label}
                    <ActionIcon className="w-4 h-4" />
                </Link>
            )}
        </div>
    );
}
