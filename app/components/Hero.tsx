'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const stats = [
  { value: '20+', label: 'Countries' },
  { value: '1K+', label: 'Members' },
  { value: '500+', label: 'Products' },
];

const flags = ['🇬🇭', '🇳🇬', '🇰🇪', '🇿🇦', '🇪🇹'];

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050A08]">
      {/* Clean directional gradients — no blob soup */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-green-950/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-[#050A08] to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">

          {/* ── Left: Copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-white z-10"
          >
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8"
            >
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300 font-medium">Africa&apos;s Agribusiness Platform</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-[4.25rem] xl:text-[5rem] font-black leading-[1.02] tracking-tight mb-6"
            >
              <span className="text-white">The platform</span><br />
              <span className="text-white">built for </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                African
              </span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                agribusiness.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg text-gray-400 mb-10 max-w-md leading-relaxed"
            >
              Learn, connect, trade, and grow — one platform for every
              agripreneur across the continent.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-green-50 transition-all duration-300 shadow-xl shadow-black/30 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/greenmarket/marketplace"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300"
              >
                Browse Marketplace
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="flex items-center gap-4"
            >
              <div className="flex -space-x-2.5">
                {flags.map((flag, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-gray-800 border-2 border-[#050A08] flex items-center justify-center text-sm"
                  >
                    {flag}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">1,000+ agripreneurs</p>
                <p className="text-gray-500 text-xs">across 20+ African countries</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Image + floating UI ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="relative hidden lg:block"
          >
            {/* Main image */}
            <div className="relative h-[620px] rounded-[2rem] overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60">
              <Image
                src="/images/modernfarmer.jpg"
                alt="Modern African farmer"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050A08]/70 via-transparent to-transparent" />
            </div>

            {/* Floating stats card — bottom left */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute -bottom-5 -left-6 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 shadow-2xl"
            >
              <div className="flex items-center divide-x divide-white/10 gap-5">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center first:pl-0 pl-5">
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating activity pill — top right */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="absolute top-6 -right-5 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm shrink-0">
                  🌍
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Active across Africa</p>
                  <p className="text-gray-400 text-xs">Farmers · Buyers · Experts</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
      >
        <div className="w-5 h-9 border border-gray-700 rounded-full flex justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-green-500 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
