'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ChatbotDialog from './chatbot/ChatbotDialog';

export default function HeroSection() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <div className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-green-700/50 border border-green-600 text-green-100 text-sm font-medium mb-6 backdrop-blur-sm">
                The Ultimate Agribusiness Resource
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
                Grow Your Knowledge,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-200">
                  Grow Your Business
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-green-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Access expert insights, proven best practices, whitepapers, and the latest research in African agribusiness.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row flex-wrap justify-center gap-4"
            >
              <button
                onClick={() => document.getElementById('knowledge-content')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-green-900 px-8 py-4 rounded-full font-bold hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <BookOpen className="h-5 w-5" />
                Explore Library
              </button>

              <Link
                href="/knowledgehub/experts"
                className="bg-green-700/80 backdrop-blur-md border border-green-600 text-white px-8 py-4 rounded-full font-bold hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Meet Experts
                <ArrowRight className="h-5 w-5" />
              </Link>

              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-full font-bold hover:from-emerald-400 hover:to-teal-400 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Ask AI Assistant
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <ChatbotDialog isOpen={isChatOpen} onCloseDialog={() => setIsChatOpen(false)} />
    </>
  );
} 