'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  Users,
  ShoppingBag,
  Globe2,
  Sparkles,
  GraduationCap,
  Bug,
  Settings,
  ChevronRight,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string;
  disabled?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/knowledge-hub', label: 'Knowledge Hub', icon: BookOpen },
      { href: '/admin/knowledge-hub/contributors', label: 'Contributor Review', icon: FileCheck, badge: 'pending' },
    ],
  },
  {
    label: 'Catalyst W',
    items: [
      { href: '/admin/catalyst-w', label: 'Accelerator', icon: Sparkles },
      { href: '/admin/fellowship/catalyst-w', label: 'Fellowship Applications', icon: GraduationCap },
      { href: '/admin/fellowship/catalyst-w/cohort', label: 'Cohort Management', icon: Users },
    ],
  },
  {
    label: 'Fellowship',
    items: [
      { href: '/admin/fellowship', label: 'All Fellowships', icon: GraduationCap },
      { href: '/admin/fellows', label: 'Catalyst Fellows', icon: Sparkles },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/admin/members', label: 'Members', icon: Users },
      { href: '/admin/trade', label: 'Vendors & Trade', icon: ShoppingBag },
      { href: '/admin/africa-food-futures', label: 'Africa Food Futures', icon: Globe2 },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/debug', label: 'Debug', icon: Bug },
      { href: '/admin/settings', label: 'Settings', icon: Settings, disabled: true },
    ],
  },
];

interface Props {
  pendingSubmissions?: number;
}

export default function AdminSidebar({ pendingSubmissions = 0 }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 shrink-0 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">AgriPro</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                const showBadge = item.badge === 'pending' && pendingSubmissions > 0;

                if (item.disabled) {
                  return (
                    <div
                      key={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 cursor-not-allowed"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                      <span className="ml-auto text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">Soon</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm group ${
                      active
                        ? 'bg-green-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {showBadge && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {pendingSubmissions > 9 ? '9+' : pendingSubmissions}
                      </span>
                    )}
                    {active && <ChevronRight className="w-3 h-3 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          View Site
        </Link>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
