'use client'

import Link from 'next/link'
import { FaLeaf, FaStore, FaGlobe, FaShieldAlt, FaArrowRight } from 'react-icons/fa'
import { motion } from 'framer-motion'

const features = [
  { icon: FaGlobe, text: 'Trade Across Africa' },
  { icon: FaShieldAlt, text: 'Verified Sellers' },
  { icon: FaLeaf, text: 'Sustainable Products' },
]

export default function GreenMarketPromo() {
  return (
    <section className="py-20 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <FaStore className="text-green-400" />
              <span className="text-green-300 font-medium">Africa&apos;s Agricultural Marketplace</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Green Market
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                Buy & Sell Across Africa
              </span>
            </h2>

            <p className="text-xl text-green-100/90 mb-8 leading-relaxed">
              Connect with verified sellers and buyers across the African continent.
              Trade fresh produce, livestock, and sustainable agricultural products.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                >
                  <feature.icon className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/greenmarket/marketplace"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-800 rounded-2xl font-semibold hover:bg-green-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Browse Marketplace
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/greenmarket/vendors"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-2xl font-semibold hover:bg-white/20 transition-all"
              >
                <FaStore className="w-5 h-5" />
                Start Selling
              </Link>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10">
              <p className="text-4xl font-bold text-white mb-1">20+</p>
              <p className="text-green-200">African Countries</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10">
              <p className="text-4xl font-bold text-white mb-1">1K+</p>
              <p className="text-green-200">Products Listed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10">
              <p className="text-4xl font-bold text-white mb-1">100%</p>
              <p className="text-green-200">Verified Sellers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10">
              <p className="text-4xl font-bold text-white mb-1">Free</p>
              <p className="text-green-200">To Join</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}