'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SUBNAV = [
  { label: 'Overview',   href: '/admin/fellowship/catalyst-w/cohort' },
  { label: 'Fellows',    href: '/admin/fellowship/catalyst-w/cohort/fellows' },
  { label: 'Programme',  href: '/admin/fellowship/catalyst-w/cohort/programme' },
  { label: 'Attendance', href: '/admin/fellowship/catalyst-w/cohort/attendance' },
  { label: 'Comms',      href: '/admin/fellowship/catalyst-w/cohort/comms' },
];

export default function SubNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 px-6">
      <div className="flex gap-0 overflow-x-auto">
        {SUBNAV.map(item => {
          const isActive =
            item.href === '/admin/fellowship/catalyst-w/cohort'
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3.5 text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-b-2 border-green-400 text-green-700 font-semibold'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
