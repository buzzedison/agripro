'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaStore,
  FaLeaf,
  FaArrowRight,
  FaMapMarkerAlt,
  FaStar
} from 'react-icons/fa';
import SectionHeader from '@/components/trade/SectionHeader';
import QuickActionCard from '@/components/trade/QuickActionCard';
import VendorCard from './components/VendorCard';
import { MessageSquare, ShieldCheck, Users as UsersIcon, ShoppingBag as BagIcon } from 'lucide-react';

interface Vendor {
  id: string;
  business_name: string;
  owner_name: string;
  business_type: string;
  product_description: string;
  logo_url: string | null;
  cover_image_url: string | null;
  country: string;
  region: string;
  city: string;
  is_featured: boolean;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  slug: string;
}

const categories = [
  { icon: '🥬', name: 'Fresh Produce', description: 'Farm-fresh fruits & vegetables' },
  { icon: '🌱', name: 'Sustainable Products', description: 'Green & eco-conscious goods' },
  { icon: '🐄', name: 'Livestock', description: 'Poultry, cattle & more' },
  { icon: '🌾', name: 'Grains & Cereals', description: 'Rice, maize, millet' },
  { icon: '♻️', name: 'Eco Solutions', description: 'Environmentally friendly products' },
  { icon: '🚜', name: 'Farm Equipment', description: 'Tools & machinery' },
];

const stats = [
  { value: '50+', label: 'Verified Vendors' },
  { value: '1,000+', label: 'Products Listed' },
  { value: '20+', label: 'African Countries' },
  { value: '15+', label: 'Categories' },
];

const quickActions = [
  {
    title: 'Browse Marketplace',
    description: 'Shop curated produce & agro products from trusted vendors.',
    href: '/greenmarket/marketplace',
    icon: BagIcon,
    accent: 'emerald' as const,
  },
  {
    title: 'Become a Vendor',
    description: 'List your products, verify your business, and reach buyers.',
    href: '/greenmarket/become-vendor',
    icon: ShieldCheck,
    accent: 'amber' as const,
  },
  {
    title: 'Verified Network',
    description: 'Meet vetted suppliers, processors, and eco innovators.',
    href: '/connect/directory?focus=vendors',
    icon: UsersIcon,
    accent: 'sky' as const,
  },
  {
    title: 'Message Buyers',
    description: 'Use private messaging once connected to close deals.',
    href: '/messages',
    icon: MessageSquare,
    accent: 'rose' as const,
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Browse Vendors',
    description: 'Explore verified sellers from across Africa offering sustainable products',
    icon: FaStore,
  },
  {
    step: 2,
    title: 'Connect Directly',
    description: 'Contact sellers directly to discuss your needs, pricing, and delivery',
    icon: UsersIcon,
  },
  {
    step: 3,
    title: 'Trade with Confidence',
    description: 'All vendors are verified for quality - buy and sell across Africa',
    icon: ShieldCheck,
  },
];

export default function GreenMarketPage() {
  const [featuredVendors, setFeaturedVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedVendors();
  }, []);

  const fetchFeaturedVendors = async () => {
    try {
      const response = await fetch('/api/trade/vendors?featured=true&limit=3');
      if (response.ok) {
        const data = await response.json();
        setFeaturedVendors(data.vendors || []);
      }
    } catch (error) {
      console.error('Error fetching featured vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5fbf6] to-white">
      <section className="relative overflow-hidden bg-[#041b0f] text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-emerald-100 text-sm font-semibold"
              >
                <FaLeaf className="w-4 h-4" />
                Africa&apos;s Sustainable Trade Platform
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl font-bold leading-tight mt-6"
              >
                Green Market
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                  Trade like an app.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-emerald-100/90 mt-6 leading-relaxed"
              >
                A modern trading hub for African agriculture. Discover verified vendors,
                manage conversations, and grow climate-smart supply chains—all in one
                experience.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 mt-8"
              >
                <Link
                  href="/greenmarket/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-emerald-900 font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Explore Marketplace
                  <FaArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/greenmarket/become-vendor"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  <FaStore className="w-4 h-4" />
                  Become a Vendor
                </Link>
              </motion.div>
              <div className="mt-10 grid sm:grid-cols-3 gap-4 text-emerald-100">
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur">
                  <p className="text-sm text-emerald-200">Active connections</p>
                  <p className="text-2xl font-bold">2,300+</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur">
                  <p className="text-sm text-emerald-200">Requests this week</p>
                  <p className="text-2xl font-bold">180</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur">
                  <p className="text-sm text-emerald-200">Avg. response time</p>
                  <p className="text-2xl font-bold">3h</p>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur space-y-6"
            >
              <div className="bg-white rounded-2xl p-4 shadow-2xl text-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Live vendor</p>
                    <p className="text-lg font-semibold">Akwaba Fresh Hub</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    Verified
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Organic pineapples • Dried mango • Export ready
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-500">
                    <FaMapMarkerAlt className="w-3 h-3" />
                    Accra, Ghana
                  </span>
                  <span className="flex items-center gap-1 text-yellow-500">
                    <FaStar className="w-3 h-3" />
                    4.9
                  </span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 text-sm">
                <p className="font-semibold text-white">Instant trade snapshot</p>
                <ul className="mt-3 space-y-2 text-emerald-100/90">
                  <li>• 12 new vendors onboarding this week</li>
                  <li>• 40+ product updates in fresh produce</li>
                  <li>• Messaging unlocked for connected partners</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionHeader
            eyebrow="Command center"
            title="Run your trade workflows from one hub"
            description="Skip the patchy spreadsheets. Switch between discovery, vendor management, and messaging just like an app."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <QuickActionCard key={action.title} {...action} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-emerald-50 p-5 shadow-sm text-center"
              >
                <p className="text-3xl font-bold text-emerald-700">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#f4faf4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionHeader
            eyebrow="Verified lineup"
            title="Featured vendors—ready to message now"
            description="Tap into a curated roster of regenerative farmers, processors, and eco-innovators."
            action={{ label: 'View all vendors', href: '/greenmarket/marketplace' }}
          />
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-80 rounded-3xl bg-white animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
              {featuredVendors.map((vendor) => (
                <div key={vendor.id} className="snap-start min-w-[280px] md:min-w-[320px]">
                  <VendorCard
                    vendor={vendor}
                    variant="featured"
                    actions={[
                      { label: 'View profile', href: `/greenmarket/vendors/${vendor.slug}` },
                      {
                        label: 'Connect',
                        href: `/connect/directory?vendor=${vendor.slug}`,
                        variant: 'ghost'
                      }
                    ]}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionHeader
            eyebrow="Browse by need"
            title="Handpicked categories for modern agribusiness"
            description="Discover certified supply across value chains, regenerative products, and supporting services."
            action={{ label: 'Open marketplace', href: '/greenmarket/marketplace' }}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                <p className="text-gray-600 mt-2 text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#041b0f] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SectionHeader
            eyebrow="Playbook"
            title="Trade without the friction"
            description="Green Market feels like an app: swipe through vendors, tap to connect, message when you’re approved."
            alignment="center"
            action={{ label: 'See dashboard', href: '/greenmarket/vendor-dashboard', subtle: true }}
          />
          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((step) => (
              <div key={step.step} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-semibold">
                  {step.step}
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <step.icon className="w-6 h-6 text-emerald-300" />
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm text-emerald-100 mt-3">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <SectionHeader
            eyebrow="Ready to join?"
            title="Trade smarter with an app-like workflow"
            description="Browse. Connect. Message. Everything for your sustainable supply chain lives inside AgriPro."
            alignment="center"
          />
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/greenmarket/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-700 transition-colors"
            >
              Start exploring
              <FaArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/greenmarket/become-vendor"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
            >
              List my products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
