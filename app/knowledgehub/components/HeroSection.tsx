'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import ChatbotDialog from './chatbot/ChatbotDialog';

export default function HeroSection() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Agribusiness Knowledge Hub
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8">
              Access expert insights, best practices, and the latest research in agribusiness
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-green-800 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                Explore Resources
              </button>
              <Link href="/knowledgehub/experts" className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.196M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.196M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Meet Our Experts
              </Link>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-400 hover:to-teal-500 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <Sparkles className="h-5 w-5" />
                AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ChatbotDialog isOpen={isChatOpen} onCloseDialog={() => setIsChatOpen(false)} />
    </>
  );
} 