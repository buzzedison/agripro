'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-900 via-teal-900 to-emerald-900">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 min-h-screen">
        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-white z-10 text-center lg:text-left pt-8 lg:pt-0"
        >
          <div className="inline-block mb-4 px-4 py-1 bg-white/10 backdrop-blur-md rounded-full">
            <span className="text-sm font-medium tracking-wider text-emerald-300">WELCOME TO AGRIPRO</span>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent"
            style={{fontFamily: 'Satoshi, sans-serif'}}
          >
            Empowering Agripreneurs, Transforming Agriculture.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-gray-200 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0"
          >
            AgriPro provides the research, advisory, and support services you need to build a successful and sustainable agribusiness.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start"
          >
            <Link 
              href="/services" 
              className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-4 bg-white overflow-hidden rounded-full"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              <span className="relative text-green-900 font-bold group-hover:text-white transition-colors duration-300">
                Explore Our Services
              </span>
            </Link>
            <Link 
              href="/contact" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 text-white hover:text-emerald-300 transition-colors duration-300"
            >
              Contact Us <span className="ml-2">→</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 relative h-[400px] sm:h-[500px] lg:h-[600px] w-full rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent z-10"></div>
          <Image 
            src="/images/modernfarmer.jpg"
            alt="AgriPro hero"
            fill={true}
            className="object-cover rounded-2xl transform hover:scale-105 transition-transform duration-700"
            priority
          />
          <div className="absolute bottom-6 left-6 right-6 p-6 backdrop-blur-md bg-white/10 rounded-xl z-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
              <div>
                <p className="text-white font-medium">Start Growing Today</p>
                <p className="text-emerald-300 text-sm">Join thousands of successful agripreneurs</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}