'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import { MessageSquare, Search, ArrowLeft } from 'lucide-react';
import ChatbotDialog from './chatbot/ChatbotDialog';

const navigation = [
  { name: 'Best Practices', href: '/knowledgehub/practices' },
  { name: 'Whitepapers', href: '/knowledgehub/whitepapers' },
  { name: 'Insights', href: '/knowledgehub/insights' },
  { name: 'Videos', href: '/knowledgehub/videos' }, // Changed from 'Back to AgriPro'
];

export default function KnowledgeHubNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  // Effect to check if chatbot should be opened from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('chatbot') && url.searchParams.get('chatbot') === 'open') {
        setIsChatOpen(true);
      }
    }
  }, []);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/knowledgehub">
            <div className="flex items-center">
              <motion.img
                src="/images/logo.png"
                alt="AgriPro Logo"
                className="h-10 w-auto sm:h-12"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
              <div className="ml-2 sm:ml-3">
                <h1 className="text-base sm:text-xl font-bold text-green-800 leading-tight">Knowledge Hub</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 leading-tight">Africa&apos;s Agribusiness Knowledge Platform</p>
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Chatbot Button for Desktop */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-green-700 transition-colors"
              aria-label="Open AI Assistant"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI</span>
            </button>

            {/* Back to AgriPro Button for Desktop (formerly Advanced Search) */}
            <Link
              href="/"
              className="bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-green-800 transition-colors"
              aria-label="Back to AgriPro"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to AgriPro</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-green-600 text-white p-2 rounded-md mr-2"
              aria-label="Open AI Assistant"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            
            <Link
              href="/"
              className="bg-green-700 text-white p-2 rounded-md mr-2"
              aria-label="Back to AgriPro"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-green-600 focus:outline-none"
            >
              {isOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay and dropdown */}
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-30 transition-opacity md:hidden" onClick={() => setIsOpen(false)} />
      )}
      {/* Dropdown */}
      <div className={`fixed top-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ${isOpen ? 'translate-y-0' : '-translate-y-full'} w-full`}>
        <div className="mx-2 mt-2 rounded-xl shadow-2xl bg-gradient-to-br from-green-50 to-green-100 px-4 pt-4 pb-6 space-y-2 relative">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-green-700 hover:text-green-900 rounded-full p-2 focus:outline-none bg-white/70 shadow"
            aria-label="Close menu"
          >
            <FaTimes className="h-6 w-6" />
          </button>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-gray-700 hover:text-green-600 block px-4 py-3 rounded-lg text-base font-medium text-center transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {/* Back to AgriPro Link in Mobile Menu (formerly Advanced Search) */}
          <Link
            href="/"
            className="text-gray-700 hover:text-green-600 px-4 py-3 rounded-lg text-base font-medium flex items-center justify-center transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to AgriPro
          </Link>
        </div>
      </div>
      
      {/* Chatbot Dialog */}
      <ChatbotDialog 
        isOpen={isChatOpen} 
        onCloseDialog={() => setIsChatOpen(false)} 
      />
    </nav>
  );
}
