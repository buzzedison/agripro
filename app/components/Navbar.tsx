// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

const navigation = [
  { name: 'What we do', href: '/services' },
  { 
    name: 'Impact', 
    href: '/impact',
    submenu: [
      { name: 'Green Market', href: '/greenmarket' }
    ]
  },
  { name: 'Knowledge Hub', href: '/knowledgehub' },
  { name: 'Chat with AI', href: '/chat' },
  { 
    name: 'Careers', 
    href: '/careers',
    submenu: [
      { name: 'All Opportunities', href: '/careers' },
      { name: 'Agripro Fellowship', href: '/fellowship' }
    ]
  },
  { name: 'Clubs', href: '/clubs' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (itemName: string) => {
    if (activeSubmenu === itemName) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(itemName);
    }
  };

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
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <div 
                  className="flex items-center gap-1 cursor-pointer"
                  onMouseEnter={() => item.submenu && toggleSubmenu(item.name)}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <Link
                    href={item.href}
                    className="text-gray-800 font-semibold hover:text-green-600 px-3 py-2 rounded-md text-sm transition duration-200 ease-in-out"
                  >
                    {item.name}
                  </Link>
                  {item.submenu && (
                    <FaChevronDown className="text-xs text-gray-500" />
                  )}
                </div>

                {/* Submenu */}
                {item.submenu && activeSubmenu === item.name && (
                  <div 
                    className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg py-2 z-50"
                    onMouseEnter={() => setActiveSubmenu(item.name)}
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/get-involved">
              <button className="bg-green-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out">
                Get Involved
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
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

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="md:hidden bg-white shadow-xl py-4 rounded-lg"
        >
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                <div 
                  className="flex items-center justify-between"
                  onClick={() => item.submenu && toggleSubmenu(item.name)}
                >
                  <Link
                    href={item.href}
                    className="block text-gray-800 font-semibold hover:text-green-600 py-2 transition duration-200 ease-in-out"
                  >
                    {item.name}
                  </Link>
                  {item.submenu && (
                    <FaChevronDown className={`text-xs text-gray-500 transform transition-transform duration-200 ${
                      activeSubmenu === item.name ? 'rotate-180' : ''
                    }`} />
                  )}
                </div>

                {/* Mobile Submenu */}
                {item.submenu && activeSubmenu === item.name && (
                  <div className="pl-4 py-2 space-y-2">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block text-gray-600 hover:text-green-600 py-2 text-sm"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
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