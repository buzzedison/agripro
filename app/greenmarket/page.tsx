'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FaStore,
  FaLeaf,
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
  FaStar,
  FaHandshake
} from 'react-icons/fa';
import VendorCard from './components/VendorCard';

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
    icon: FaHandshake,
  },
  {
    step: 3,
    title: 'Trade with Confidence',
    description: 'All vendors are verified for quality - buy and sell across Africa',
    icon: FaShieldAlt,
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-green-500/30 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-green-300 text-sm font-medium mb-6">
                <FaLeaf className="w-4 h-4" />
                Africa&apos;s Sustainable Trade Platform
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Green Market
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                Trade Sustainably
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-green-100/90 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Africa&apos;s marketplace connecting buyers and sellers of agricultural products.
              Trade fresh produce, livestock, and sustainable goods across the continent.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/greenmarket/marketplace"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-800 rounded-2xl font-semibold text-lg hover:bg-green-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Browse Marketplace
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/greenmarket/vendors"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all"
              >
                <FaStore className="w-5 h-5" />
                Become a Vendor
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex items-center gap-6 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-2 text-green-200">
                <FaCheckCircle className="w-5 h-5" />
                <span>Verified Sellers</span>
              </div>
              <div className="flex items-center gap-2 text-green-200">
                <FaShieldAlt className="w-5 h-5" />
                <span>Pan-African Trade</span>
              </div>
              <div className="flex items-center gap-2 text-green-200">
                <FaLeaf className="w-5 h-5" />
                <span>Sustainable Focus</span>
              </div>
            </motion.div>
          </div>

          {/* Floating Cards - Desktop Only */}
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2">
            <motion.div
              className="relative w-80"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="absolute -top-8 -left-8 w-64 h-48 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 transform -rotate-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    🥬
                  </div>
                  <div>
                    <p className="text-white font-semibold">Fresh Produce</p>
                    <p className="text-green-200 text-sm">50+ Vendors</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-20 left-12 w-64 h-48 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 transform rotate-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    🌱
                  </div>
                  <div>
                    <p className="text-white font-semibold">Organic Products</p>
                    <p className="text-green-200 text-sm">Certified Organic</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <p className="text-4xl md:text-5xl font-bold text-green-600">{stat.value}</p>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find what you need from our diverse range of sustainable products and services
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link
                  href={`/greenmarket/marketplace?category=${category.name.toLowerCase().replace(/ /g, '-')}`}
                  className="block p-6 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all group text-center h-full"
                >
                  <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vendors Section */}
      {featuredVendors.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="flex items-center justify-between mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Featured Vendors
                </h2>
                <p className="text-xl text-gray-600">
                  Top-rated vendors on our platform
                </p>
              </div>
              <Link
                href="/greenmarket/marketplace"
                className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                View All
                <FaArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVendors.map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <VendorCard vendor={vendor} variant="featured" />
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <Link
                href="/greenmarket/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                View All Vendors
                <FaArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start trading sustainably in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-100 h-full hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                    <item.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-sm font-bold text-green-600 mb-2">Step {item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-gray-300">
                    <FaArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Join the
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400"> Green Revolution?</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Whether you&apos;re a farmer, producer, or eco-conscious entrepreneur,
              there&apos;s a place for you in our marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/greenmarket/vendors"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-2xl font-semibold text-lg hover:bg-green-700 transition-all"
              >
                <FaStore className="w-5 h-5" />
                Become a Vendor
              </Link>
              <Link
                href="/greenmarket/marketplace"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all"
              >
                Explore Marketplace
                <FaArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
