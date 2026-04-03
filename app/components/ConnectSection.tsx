'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Wheat, ShoppingBag, Lightbulb, Wrench } from 'lucide-react';

const networkTypes = [
  { label: 'Farmers', icon: Wheat, count: '200+', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { label: 'Buyers', icon: ShoppingBag, count: '50+', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { label: 'Experts', icon: Lightbulb, count: '30+', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { label: 'Service Providers', icon: Wrench, count: '40+', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
];

export default function ConnectSection() {
  return (
    <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-6">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              AgriPro Connect
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
              Africa&apos;s agricultural<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                community is here.
              </span>
            </h2>

            <p className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed">
              Build relationships with farmers, buyers, experts, and service providers
              across Africa. The connections you make here grow your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/connect"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/20"
              >
                Join the Network
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                href="/connect/directory"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300"
              >
                Browse Directory
              </Link>
            </div>
          </motion.div>

          {/* Network type cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {networkTypes.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                className={`rounded-2xl p-6 border ${item.border} ${item.bg} hover:bg-white/5 transition-all duration-300 group`}
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="text-2xl font-black text-white mb-1">{item.count}</p>
                <p className="text-sm text-gray-400">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
