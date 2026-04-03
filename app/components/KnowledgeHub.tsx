'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, BarChart2, Users, Cpu, ArrowRight } from 'lucide-react';

const resources = [
  {
    icon: BookOpen,
    title: 'Research & Reports',
    description: 'In-depth market research, agronomic studies, and sector analysis from across the continent.',
    count: '200+ papers',
  },
  {
    icon: BarChart2,
    title: 'Market Intelligence',
    description: 'Commodity prices, trade flow data, and demand forecasts across African markets.',
    count: 'Live data',
  },
  {
    icon: Users,
    title: 'Expert Insights',
    description: 'Articles and practical advice from agronomists, economists, and industry leaders.',
    count: '50+ experts',
  },
  {
    icon: Cpu,
    title: 'AI Assistant',
    description: 'Ask questions, get agronomic advice, and analyse your farm data — instantly.',
    count: 'Available 24/7',
  },
];

export default function KnowledgeHub() {
  return (
    <section className="bg-gray-950 py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-5">
              Knowledge Hub
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Everything you need to<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                make better decisions.
              </span>
            </h2>
          </div>
          <Link
            href="/knowledgehub"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 text-sm shrink-0"
          >
            Explore all resources
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative rounded-2xl p-6 border border-white/8 bg-white/5 hover:bg-white/8 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">{item.description}</p>
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">{item.count}</span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
