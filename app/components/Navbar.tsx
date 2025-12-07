// components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ArrowRight, MessageSquare, BookOpen, Users, ShoppingBag, Sprout, User, LogOut, LayoutDashboard, Home } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Four Pillars: Knowledge, Connect, Trade, Grow
const navigation = [
  {
    name: 'Knowledge',
    href: '/knowledgehub',
    icon: BookOpen,
    description: 'Insights, resources & learning'
  },
  {
    name: 'Connect',
    href: '/connect',
    icon: Users,
    description: 'Network with farmers, buyers & experts'
  },
  {
    name: 'Trade',
    href: '/greenmarket',
    icon: ShoppingBag,
    description: 'Marketplace & verified vendors'
  },
  {
    name: 'Grow',
    href: '/services',
    icon: Sprout,
    description: 'Advisory, programs & accelerators',
    submenu: [
      { name: 'Advisory Services', href: '/services' },
      { name: 'Farm Smart Program', href: '/farm-smart' },
      { name: 'Green Market', href: '/greenmarket' },
      { name: 'AgriPro Fellowship', href: '/fellowship' },
    ]
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Check auth state
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const toggleSubmenu = (itemName: string) => {
    setActiveSubmenu(activeSubmenu === itemName ? null : itemName);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <motion.img
                src="/images/logo.png"
                alt="AgriPro Logo"
                className="h-10 w-auto lg:h-12"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </Link>

            {/* Desktop Navigation - Four Pillars */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="relative group"
                    onMouseEnter={() => item.submenu && setActiveSubmenu(item.name)}
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-gray-700 hover:text-green-600 hover:bg-green-50"
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                      {item.submenu && (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </Link>

                    {/* Desktop Submenu */}
                    {item.submenu && activeSubmenu === item.name && (
                      <div className="absolute left-0 top-full pt-2 z-50">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[200px]">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                AI
              </Link>

              {loading ? (
                <div className="w-20 h-10 bg-gray-100 rounded-full animate-pulse" />
              ) : user ? (
                // Logged in state
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/feed"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                      >
                        <Home className="w-4 h-4" />
                        Feed
                      </Link>
                      <Link
                        href="/connect/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/connect/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Logged out state
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              {!loading && user && (
                <Link
                  href="/connect/dashboard"
                  className="p-2 text-gray-600 hover:text-green-600 rounded-lg"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 hover:text-green-600 rounded-lg hover:bg-gray-100 transition-colors"
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-0 right-0 z-50 lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <div className="mx-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* User section for mobile */}
                {!loading && (
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    {user ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                          <p className="text-xs text-gray-500">Logged in</p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <LogOut className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Link
                          href="/auth/login"
                          onClick={() => setIsOpen(false)}
                          className="flex-1 text-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/auth/signup"
                          onClick={() => setIsOpen(false)}
                          className="flex-1 text-center px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between">
                          <Link
                            href={item.href}
                            onClick={() => {
                              if (!item.submenu) {
                                setIsOpen(false);
                              }
                            }}
                            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-gray-700 hover:text-green-600 hover:bg-green-50"
                          >
                            <Icon className="w-5 h-5" />
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                          </Link>
                          {item.submenu && (
                            <button
                              onClick={() => toggleSubmenu(item.name)}
                              className="p-3 text-gray-400 hover:text-green-600 rounded-xl hover:bg-green-50 transition-colors"
                            >
                              <ChevronDown className={`w-5 h-5 transition-transform ${activeSubmenu === item.name ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>

                        {/* Mobile Submenu */}
                        <AnimatePresence>
                          {item.submenu && activeSubmenu === item.name && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-12 pb-2">
                                {item.submenu.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile quick links */}
                <div className="p-3 border-t border-gray-100">
                  <Link
                    href="/chat"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl"
                  >
                    <MessageSquare className="w-5 h-5" />
                    AI Assistant
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}