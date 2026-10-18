'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

const TABS = [
    { href: '/admin/catalyst-w', label: 'All submissions' },
    { href: '/admin/catalyst-w/clean-up', label: 'Clean-up' },
    { href: '/admin/catalyst-w/selection', label: 'Selection & interviews' },
    { href: '/admin/catalyst-w/scholarships', label: 'Scholarships' },
    { href: '/admin/catalyst-w/offers', label: 'Offers & places' },
    { href: '/admin/catalyst-w/funding', label: 'Partners & funding' },
    { href: '/admin/catalyst-w/countries', label: 'Countries' },
    { href: '/admin/catalyst-w/groups', label: 'Groups & welcome' },
    { href: '/admin/catalyst-w/readiness', label: 'Launch readiness' },
];

export default function CatalystAdminHeader({ title, subtitle, onRefresh, children }: {
    title: string;
    subtitle: string;
    onRefresh?: () => void;
    children?: React.ReactNode;
}) {
    const pathname = usePathname();
    return (
        <div className="bg-[#0B2C24] text-white px-6 pt-8 pb-0">
            <div className="max-w-7xl mx-auto">
                <p className="text-[#F4C430] text-xs font-black uppercase tracking-[0.3em] mb-2">Catalyst W · Cohort 2026</p>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-black">{title}</h1>
                        <p className="text-white/60 mt-1">{subtitle}</p>
                    </div>
                    {onRefresh && (
                        <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                            <RefreshCw size={14} /> Refresh
                        </button>
                    )}
                </div>
                {children}
                <nav className="mt-6 flex gap-1 overflow-x-auto" aria-label="Catalyst W admin sections">
                    {TABS.map(t => {
                        const active = pathname === t.href;
                        return (
                            <Link
                                key={t.href}
                                href={t.href}
                                aria-current={active ? 'page' : undefined}
                                className={`whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-gray-50 text-[#0B2C24]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            >
                                {t.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
