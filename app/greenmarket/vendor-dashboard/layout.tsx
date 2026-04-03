'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LayoutDashboard, Package, User, Shield, Settings,
    ExternalLink, Store, LogOut, Bell, Menu, Star, CheckCircle
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/greenmarket/vendor-dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Products', href: '/greenmarket/vendor-dashboard/products', icon: Package },
    { label: 'Profile', href: '/greenmarket/vendor-dashboard/profile', icon: User },
    { label: 'Verify', href: '/greenmarket/vendor-dashboard/verify', icon: Shield },
    { label: 'Settings', href: '/greenmarket/vendor-dashboard/settings', icon: Settings },
];

interface VendorInfo {
    business_name: string;
    slug: string;
    verification_level: 'basic' | 'verified' | 'premium';
}

function VerificationBadge({ level }: { level: string }) {
    if (level === 'agripro_certified') return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            <Star className="w-2.5 h-2.5 fill-current" /> AgriPro Certified
        </span>
    );
    if (level === 'premium') return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            <Shield className="w-2.5 h-2.5" /> Business Verified
        </span>
    );
    if (level === 'verified') return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            <CheckCircle className="w-2.5 h-2.5" /> Identity Verified
        </span>
    );
    return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            Basic
        </span>
    );
}

function SidebarContent({ vendor, pathname, onNav }: {
    vendor: VendorInfo | null;
    pathname: string;
    onNav?: () => void;
}) {
    const isActive = (item: typeof navItems[0]) => {
        if (item.exact) return pathname === item.href;
        return pathname.startsWith(item.href);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="h-16 flex items-center px-5 border-b border-gray-100 shrink-0">
                <Link href="/" className="font-black text-gray-900 text-xl tracking-tight">agripro</Link>
                <span className="ml-2 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Vendor
                </span>
            </div>

            {/* Vendor identity */}
            {vendor && (
                <div className="px-4 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 text-sm truncate leading-tight">{vendor.business_name}</p>
                            <div className="mt-1">
                                <VerificationBadge level={vendor.verification_level} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const active = isActive(item);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNav}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                active
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-green-600' : 'text-gray-400'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom links */}
            <div className="px-3 py-4 border-t border-gray-100 space-y-0.5 shrink-0">
                {vendor?.slug && (
                    <Link
                        href={`/greenmarket/vendors/${vendor.slug}`}
                        target="_blank"
                        onClick={onNav}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4 shrink-0 text-gray-400" />
                        View Public Store
                    </Link>
                )}
                <Link
                    href="/feed"
                    onClick={onNav}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                    <LogOut className="w-4 h-4 shrink-0 text-gray-400" />
                    Back to Feed
                </Link>
            </div>
        </div>
    );
}

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [vendor, setVendor] = useState<VendorInfo | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchVendor = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
                .from('trade_vendors')
                .select('business_name, slug, verification_level')
                .eq('user_id', user.id)
                .single();
            if (data) setVendor(data);
        };
        fetchVendor();
    }, []);

    // Close mobile nav on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 fixed top-0 bottom-0 left-0 z-30">
                <SidebarContent vendor={vendor} pathname={pathname} />
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                >
                    <aside
                        className="w-64 bg-white h-full shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SidebarContent
                            vendor={vendor}
                            pathname={pathname}
                            onNav={() => setMobileOpen(false)}
                        />
                    </aside>
                </div>
            )}

            {/* Main area */}
            <div className="lg:ml-60 flex-1 flex flex-col min-h-screen">

                {/* Mobile top bar */}
                <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-20 h-14 flex items-center justify-between px-4">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-black text-gray-900">agripro</span>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <Bell className="w-5 h-5" />
                    </button>
                </header>

                {/* Page content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
