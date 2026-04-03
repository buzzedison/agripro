// components/Impact.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';

const stats = [
  { value: '10,000+', label: 'Young people inspired', sub: 'through university agri-clubs' },
  { value: '5', label: 'Universities', sub: 'agribusiness clubs active' },
  { value: '1st', label: "Ghana's first", sub: 'organic farmers market' },
  { value: '20+', label: 'Countries', sub: 'community presence' },
];

export default function Impact() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Our Impact
          </span>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight max-w-2xl">
              Sowing the seeds of change<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                across the continent.
              </span>
            </h2>
            <Link
              href="/impact"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm shrink-0"
            >
              Explore our impact
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border border-gray-100 rounded-2xl p-6 hover:border-green-200 hover:bg-green-50/30 transition-all duration-300"
            >
              <p className="text-3xl sm:text-4xl font-black text-gray-900 mb-1">{stat.value}</p>
              <p className="font-semibold text-gray-800 text-sm">{stat.label}</p>
              <p className="text-gray-400 text-xs mt-0.5">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial + Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gray-100"
        >
          <div className="relative h-72 lg:h-auto min-h-[340px]">
            <Image
              src="/images/kofi.jpeg"
              alt="Kofi Mensah, Green Fields Farm"
              fill
              className="object-cover"
            />
          </div>
          <div className="bg-gray-50 p-8 sm:p-12 flex flex-col justify-center">
            <Quote className="w-10 h-10 text-green-500 mb-6" />
            <p className="text-xl sm:text-2xl font-semibold text-gray-900 leading-relaxed mb-8">
              &ldquo;AgriPro helped me turn my passion for sustainable farming into a thriving business.
              The Accra Green Market connected me with customers who value what I do.&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">Kofi Mensah</p>
                <p className="text-gray-500 text-sm">Founder, Green Fields Farm · Accra, Ghana</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
