// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

const navigation = [
  { name: 'Home', href: '/' },
  {
    name: 'Services',
    subItems: [
      { name: 'Agribusiness Research', href: '/services/research' },
      { name: 'Advisory & Mentorship', href: '/services/advisory' },
      { name: 'Training & Capacity Building', href: '/services/training' },
      { name: 'Innovation & Technology', href: '/services/innovation' },
    ],
  },
  { name: 'Impact', href: '/impact' },
  { name: 'Knowledge Hub', href: '/knowledge-hub' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link href="/">
              <motion.img
                src="/logo.svg"
                alt="AgriPro Logo"
                className="h-12 w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) =>
                item.subItems ? (
                  <div key={item.name} className="relative group">
                    <button className="text-gray-800 font-semibold hover:text-green-600 focus:outline-none px-3 py-2 rounded-md text-sm">
                      {item.name}
                    </button>
                    <div className="absolute z-10 hidden group-hover:block w-48 bg-white shadow-lg rounded-md p-4 space-y-2">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block text-gray-800 hover:text-green-600 font-medium"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-800 font-semibold hover:text-green-600 px-3 py-2 rounded-md text-sm"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-800 hover:text-green-600 focus:outline-none"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white shadow-md py-2">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) =>
              item.subItems ? (
                <div key={item.name} className="relative group">
                  <button className="w-full text-left text-gray-800 font-semibold hover:text-green-600 focus:outline-none py-2">
                    {item.name}
                  </button>
                  <div className="pl-4 space-y-2">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block text-gray-800 hover:text-green-600 font-medium py-1"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-800 font-semibold hover:text-green-600 py-2"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}