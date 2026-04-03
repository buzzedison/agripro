// components/Solutions.tsx
'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, Store, Sprout, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const pillars = [
  {
    num: '01',
    icon: BookOpen,
    title: 'Knowledge',
    description: 'Market intelligence, research reports, and AI-powered insights — everything you need to make sharper decisions.',
    features: ['Market Data', 'Research Reports', 'AI Assistant'],
    href: '/knowledgehub',
    col: 'lg:col-span-3',
  },
  {
    num: '02',
    icon: Users,
    title: 'Connect',
    description: 'Build real relationships with farmers, buyers, and experts across the continent.',
    features: ['Farmer Profiles', 'Buyer Network', 'Expert Mentors'],
    href: '/connect',
    col: 'lg:col-span-2',
  },
  {
    num: '03',
    icon: Store,
    title: 'Trade',
    description: 'Buy and sell agricultural products with verified partners across 20+ African countries.',
    features: ['Verified Sellers', 'Pan-African Reach', 'Free to Join'],
    href: '/greenmarket',
    col: 'lg:col-span-2',
  },
  {
    num: '04',
    icon: Sprout,
    title: 'Grow',
    description: 'Accelerators, advisory services, and mentorship programmes built to scale your agribusiness.',
    features: ['AgriPro Fellowship', 'Advisory', 'Business Planning'],
    href: '/services',
    col: 'lg:col-span-3',
  },
];

export default function Solutions() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-5">
              The Platform
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
              One platform.<br />Four superpowers.
            </h2>
          </div>
          <p className="text-gray-500 text-lg max-w-sm leading-relaxed lg:text-right">
            Every tool an African agripreneur needs — built into one place.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid lg:grid-cols-5 gap-4">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`${pillar.col} group`}
            >
              <Link href={pillar.href} className="block h-full">
                <div className="relative h-full bg-white rounded-2xl p-7 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden min-h-[260px] flex flex-col">

                  {/* Number watermark */}
                  <span className="absolute top-4 right-6 text-7xl font-black text-gray-900/[0.04] select-none leading-none">
                    {pillar.num}
                  </span>

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <pillar.icon className="w-5 h-5 text-green-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-gray-900 mb-2">{pillar.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5">{pillar.description}</p>

                    {/* Feature chips */}
                    <div className="flex flex-wrap gap-2">
                      {pillar.features.map((f) => (
                        <span
                          key={f}
                          className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-end mt-5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 transition-colors duration-300">
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
        >
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-700 transition-all duration-300"
          >
            Get Started Free
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <p className="text-gray-400 text-sm">No credit card required</p>
        </motion.div>

      </div>
    </section>
  );
}
