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
          <Link href="/">
            <motion.img
              src="/images/logo.png"
              alt="AgriPro Logo"
              className="h-12 w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) =>
              item.subItems ? (
                <div key={item.name} className="relative group">
                  <button className="text-gray-800 font-semibold hover:text-green-600 focus:outline-none px-3 py-2 rounded-md text-sm">
                    {item.name}
                  </button>
                  <div className="absolute z-10 hidden group-hover:block w-48 bg-white shadow-lg rounded-md mt-2 transition-all duration-300 ease-in-out transform origin-top scale-0 group-hover:scale-100">
                    <div className="py-2">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-4 py-2 text-gray-800 hover:bg-green-50 hover:text-green-600 font-medium transition duration-150 ease-in-out"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
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
            <Link href="/get-involved">
              <button className="bg-green-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out">
                Get Involved
              </button>
            </Link>
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
            <Link href="/get-involved">
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out mt-4">
                Get Involved
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}