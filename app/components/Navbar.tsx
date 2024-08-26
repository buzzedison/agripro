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
    <nav className="bg-white shadow-lg">
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
                  <button className="text-gray-800 font-semibold hover:text-green-600 focus:outline-none px-3 py-2 rounded-md text-sm transition duration-200 ease-in-out">
                    {item.name}
                    <svg className="w-4 h-4 ml-1 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="absolute z-10 hidden group-hover:block w-48 bg-white shadow-xl rounded-lg mt-2 overflow-hidden"
                  >
                    <div className="py-2">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-4 py-3 text-gray-800 hover:bg-green-50 hover:text-green-600 font-medium transition duration-200 ease-in-out"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-800 font-semibold hover:text-green-600 px-3 py-2 rounded-md text-sm transition duration-200 ease-in-out"
                >
                  {item.name}
                </Link>
              )
            )}
            <Link href="/get-involved">
              <button className="bg-green-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out">
                Get Involved
              </button>
            </Link>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-800 hover:text-green-600 focus:outline-none transition duration-200 ease-in-out"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="md:hidden bg-white shadow-xl py-4 rounded-lg"
        >
          <div className="px-4 pt-2 pb-3 space-y-2">
            {navigation.map((item) =>
              item.subItems ? (
                <div key={item.name} className="relative group">
                  <button className="w-full text-left text-gray-800 font-semibold hover:text-green-600 focus:outline-none py-2 flex items-center justify-between">
                    {item.name}
                    <svg className="w-4 h-4 ml-1 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="pl-6 space-y-2">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block text-gray-800 hover:text-green-600 font-medium py-1 transition duration-200 ease-in-out"
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
                  className="block text-gray-800 font-semibold hover:text-green-600 py-2 transition duration-200 ease-in-out"
                >
                  {item.name}
                </Link>
              )
            )}
            <Link href="/get-involved">
              <button className="w-full bg-green-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out mt-4">
                Get Involved
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}