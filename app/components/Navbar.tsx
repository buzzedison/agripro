// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'What we do', href: '/services' },
  { name: 'Impact', href: '/impact' },
  { name: 'Knowledge Hub', href: '/knowledgehub' },
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
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-800 font-semibold hover:text-green-600 px-3 py-2 rounded-md text-sm transition duration-200 ease-in-out"
              >
                {item.name}
              </Link>
            ))}
            <Link href="/getinvolved">
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
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-gray-800 font-semibold hover:text-green-600 py-2 transition duration-200 ease-in-out"
              >
                {item.name}
              </Link>
            ))}
            <Link href="/getinvolved">
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