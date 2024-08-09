// components/KnowledgeHub.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function KnowledgeHub() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Handle form submission (e.g., send email to a mailing list)
    setEmail('');
  };

  return (
    <section className="bg-green-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-4xl font-extrabold text-green-900 mb-6">
            <span className="block">Unlock Your Agribusiness Potential with the</span>
            <span className="block bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text">
              AgriPro Knowledge Hub
            </span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            We're building a vibrant online space where you can access a wealth of resources, connect with a thriving community of agripreneurs, and gain expert insights to fuel your success. The AgriPro Knowledge Hub is coming soon!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 max-w-lg mx-auto"
        >
          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <h3 className="text-2xl font-extrabold text-green-900 mb-4">
              Be the first to know when we launch!
            </h3>
            <p className="text-gray-500 mb-6">
              Sign up for updates and unlock your agribusiness potential.
            </p>
            <form onSubmit={handleSubmit} className="mb-0 space-y-6">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}