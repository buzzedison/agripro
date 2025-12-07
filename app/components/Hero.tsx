'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from "next/link"
import { FaUsers, FaBook, FaStore, FaSeedling, FaArrowRight } from 'react-icons/fa'

const pillars = [
  {
    icon: FaBook,
    title: 'Knowledge',
    description: 'Insights & resources',
    href: '/knowledgehub',
  },
  {
    icon: FaUsers,
    title: 'Connect',
    description: 'Network across Africa',
    href: '/connect',
  },
  {
    icon: FaStore,
    title: 'Trade',
    description: 'Buy & sell products',
    href: '/greenmarket',
  },
  {
    icon: FaSeedling,
    title: 'Grow',
    description: 'Scale your business',
    href: '/services',
  },
]

const stats = [
  { value: '20+', label: 'Countries' },
  { value: '1K+', label: 'Members' },
  { value: '500+', label: 'Products' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-green-950 to-gray-900">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white z-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 backdrop-blur-sm rounded-full mb-6"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-green-300">Africa&apos;s Agribusiness Platform</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 leading-[1.1]"
            >
              <span className="text-white">Learn. Connect.</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Trade. Grow.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-300 mb-8 max-w-lg leading-relaxed"
            >
              Africa&apos;s platform for agricultural knowledge, networking,
              trading, and growing your agribusiness.
            </motion.p>

            {/* Four Pillars - Premium Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
            >
              {pillars.map((pillar, index) => (
                <Link
                  key={pillar.title}
                  href={pillar.href}
                  className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-green-500/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
                    <pillar.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <p className="font-bold text-white text-sm sm:text-base mb-0.5">{pillar.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed hidden sm:block">{pillar.description}</p>
                </Link>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5"
              >
                Get Started Free
                <FaArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                href="/greenmarket/marketplace"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300"
              >
                Browse Marketplace
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex items-center gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Main Image */}
            <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl shadow-black/30">
              <Image
                src="/images/modernfarmer.jpg"
                alt="Modern African farmer"
                fill={true}
                className="object-cover"
                priority
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute bottom-6 left-6 right-6 p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-lg">Across Africa</p>
                    <p className="text-gray-300 text-sm">Connecting farmers, buyers & experts</p>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white">
                        {['🇬🇭', '🇳🇬', '🇰🇪'][i - 1]}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl rotate-12 opacity-20 blur-sm"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full opacity-20 blur-sm"></div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
      >
        <span className="text-xs text-gray-400 uppercase tracking-widest">Scroll</span>
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-3 bg-green-500 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}