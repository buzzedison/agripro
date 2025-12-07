// components/Solutions.tsx
'use client';

import { motion } from 'framer-motion';
import { FaBook, FaUsers, FaStore, FaSeedling, FaArrowRight } from 'react-icons/fa';
import Link from "next/link"

const pillars = [
  {
    icon: FaBook,
    title: 'Knowledge',
    subtitle: 'Learn & Research',
    description: 'Access agricultural insights, market analysis, research reports, and educational resources to make informed decisions.',
    features: ['Market Intelligence', 'Research Reports', 'Best Practices', 'AI Assistant'],
    href: '/knowledgehub',
    cta: 'Explore Resources',
  },
  {
    icon: FaUsers,
    title: 'Connect',
    subtitle: 'Network & Collaborate',
    description: 'Build your network with farmers, buyers, experts, and service providers across Africa. Grow together.',
    features: ['Farmer Profiles', 'Buyer Directory', 'Expert Mentors', 'Community Feed'],
    href: '/connect',
    cta: 'Join Network',
  },
  {
    icon: FaStore,
    title: 'Trade',
    subtitle: 'Buy & Sell',
    description: 'Buy and sell agricultural products across Africa. Connect with verified sellers and reach new markets.',
    features: ['Verified Sellers', 'Product Listings', 'Pan-African Trade', 'Free to Join'],
    href: '/greenmarket',
    cta: 'Start Trading',
  },
  {
    icon: FaSeedling,
    title: 'Grow',
    subtitle: 'Scale Your Business',
    description: 'Access advisory services, training programs, and accelerators designed to help your agribusiness scale and succeed.',
    features: ['Advisory Services', 'Expert Mentorship', 'AgriPro Fellowship', 'Business Planning'],
    href: '/services',
    cta: 'Explore Programs',
  },
];

export default function Solutions() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            Our Platform
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Four Pillars to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Success
            </span>
          </h2>
          <p className="max-w-2xl text-xl text-gray-600 mx-auto">
            Everything African agribusinesses need to learn, connect, trade, and grow—all in one place.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="h-full bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all duration-300">
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
                    <pillar.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="text-2xl font-bold text-gray-900 inline">
                        {pillar.title}
                      </h3>
                      <span className="text-gray-400 ml-2">— {pillar.subtitle}</span>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {pillar.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pillar.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href={pillar.href}
                      className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors"
                    >
                      {pillar.cta}
                      <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-full hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30"
          >
            Get Started Free
            <FaArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <p className="text-gray-500 mt-4">No credit card required</p>
        </motion.div>
      </div>
    </section>
  );
}