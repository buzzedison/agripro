'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageSquare, ArrowLeft, BookOpen, FileText, Lightbulb, Video, Users } from 'lucide-react';
import ChatbotDialog from './chatbot/ChatbotDialog';

const navigation = [
  { name: 'Best Practices', href: '/knowledgehub/practices', icon: BookOpen },
  { name: 'Whitepapers', href: '/knowledgehub/whitepapers', icon: FileText },
  { name: 'Insights', href: '/knowledgehub/insights', icon: Lightbulb },
  { name: 'Videos', href: '/knowledgehub/videos', icon: Video },
  { name: 'Contributor Portal', href: '/knowledgehub/contributors', icon: Users },
];

export default function KnowledgeHubNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = isOpen ? 'hidden' : '';
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
      if (url.searchParams.get('chatbot') === 'open') {
        setIsChatOpen(true);
      }
    }
  }, []);

  return (
    <>
      <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link href="/knowledgehub" className="flex items-center gap-3 flex-shrink-0">
              <motion.img
                src="/images/logo.png"
                alt="AgriPro Logo"
                className="h-9 w-auto lg:h-11"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-bold text-green-800 leading-tight">Knowledge Hub</h1>
                <p className="text-[10px] lg:text-xs text-gray-500 leading-tight">Africa&apos;s Agribusiness Platform</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const isContributorLink = item.href === '/knowledgehub/contributors';
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isContributorLink
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                      }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                aria-label="Open AI Assistant"
              >
                <MessageSquare className="w-4 h-4" />
                Ask AI
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Back to AgriPro"
              >
                <ArrowLeft className="w-4 h-4" />
                AgriPro
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setIsChatOpen(true)}
                className="p-2 text-green-700 bg-green-50 rounded-lg"
                aria-label="Open AI Assistant"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 hover:text-green-700 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-0 right-0 z-50 lg:hidden"
            >
              <div className="mx-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isContributorLink = item.href === '/knowledgehub/contributors';
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${isContributorLink
                            ? 'bg-green-600 text-white'
                            : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
                <div className="border-t border-gray-100 p-2">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to AgriPro
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chatbot Dialog */}
      <ChatbotDialog
        isOpen={isChatOpen}
        onCloseDialog={() => setIsChatOpen(false)}
      />
    </>
  );
}
