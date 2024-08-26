'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative flex flex-col md:flex-row min-h-screen overflow-hidden bg-gradient-to-br from-green-900 via-teal-900 to-emerald-900">
      {/* Image Section */}
      <div className="absolute inset-0 md:relative md:w-1/2">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full h-full"
        >
          <Image 
            src="/images/agriprotech.jpeg"
            alt="AgriPro hero"
            fill={true}
            style={{ objectFit: "cover" }}
            priority
          />
        </motion.div>
      </div>

      {/* Text Content Section */}
      <div className="relative flex-grow flex items-center justify-center py-20 px-6 md:py-10 md:px-10 lg:px-20 bg-black bg-opacity-50 md:bg-transparent">
        <div className="text-white max-w-xl">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl lg:text-6xl font-black mb-4"
            style={{fontFamily: 'Satoshi, sans-serif'}}
          >
            Empowering Agripreneurs, Transforming Agriculture.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg lg:text-2xl font-light mb-6"
          >
            AgriPro provides the research, advisory, and support services you need to build a successful and sustainable agribusiness.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link href="#" className="inline-block bg-white text-green-900 py-3 px-6 rounded-full font-bold tracking-wider hover:bg-opacity-90 transition duration-300">
              Explore Our Services
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}