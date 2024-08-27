// components/KnowledgeHubPage.tsx
"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaLightbulb, FaUsers } from 'react-icons/fa';

const KnowledgeHubPage: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            Knowledge Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your gateway to agribusiness insights, resources, and expertise.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-lg shadow-xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold text-green-800 mb-4">Coming Soon</h2>
          <p className="text-lg text-gray-600 mb-8">
            We are working hard to bring you a comprehensive knowledge hub. Stay tuned for:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <FaBook className="text-4xl text-green-800 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Research Papers</h3>
              <p className="text-gray-600">Access the latest agribusiness research and insights.</p>
            </div>
            <div className="flex flex-col items-center">
              <FaLightbulb className="text-4xl text-green-800 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Best Practices</h3>
              <p className="text-gray-600">Learn from successful agribusiness case studies.</p>
            </div>
            <div className="flex flex-col items-center">
              <FaUsers className="text-4xl text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Network</h3>
              <p className="text-gray-600">Connect with industry experts and mentors.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-xl text-gray-600 mb-8">
            Want to be notified when our Knowledge Hub launches?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-800 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-600 transition duration-200"
          >
            Join the Waitlist
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default KnowledgeHubPage;