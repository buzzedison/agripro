// components/Hero.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex overflow-hidden bg-gradient-to-br from-green-900 via-teal-900 to-emerald-900">
      <div className="absolute top-0 left-0 w-1/2 h-full">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative w-full h-full"
        >
          <Image 
            src="/images/agriprotech.jpeg"
            alt="AgriPro hero"
            fill
            className="object-cover" 
          />
        </motion.div>
      </div>

      <div className="relative w-1/2 ml-auto flex items-center justify-center">
        <div className="text-white px-8 md:px-20 max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl font-black mb-6"
            style={{fontFamily: 'Satoshi, sans-serif'}}
          >
            Empowering Agripreneurs, Transforming Agriculture.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl font-light mb-8"
          >
            AgriPro provides the research, advisory, and support services you need to build a successful and sustainable agribusiness.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <a href="#" className="bg-white text-green-900 py-4 px-8 rounded-full font-bold tracking-wider hover:bg-opacity-90 transition duration-300">
              Explore Our Services
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}