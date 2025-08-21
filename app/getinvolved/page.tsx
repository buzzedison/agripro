"use client"
// components/GetInvolvedPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaSeedling, FaHandsHelping, FaLightbulb, FaDollarSign } from 'react-icons/fa';
import Link from 'next/link'

const involvementOptions = [
  {
    icon: <FaSeedling size={40} />,
    title: 'Join an Agribusiness Club',
    description: 'Connect with like-minded individuals and learn about innovative agricultural practices.',
    color: 'bg-green-500',
  },
  {
    icon: <FaHandsHelping size={40} />,
    title: 'Volunteer',
    description: 'Share your skills and time to support our programs and make a difference in communities.',
    color: 'bg-blue-500',
  },
  {
    icon: <FaLightbulb size={40} />,
    title: 'Participate in Innovation Labs',
    description: 'Contribute to groundbreaking agricultural technologies and solutions.',
    color: 'bg-orange-500',
  },
  {
    icon: <FaDollarSign size={40} />,
    title: 'Donate',
    description: 'Support our mission financially and help us reach more aspiring agripreneurs.',
    color: 'bg-purple-500',
  },
];

const GetInvolvedPage: React.FC = () => {
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
            Get Involved in the AgriPro Revolution
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your involvement can make a significant impact on the future of agriculture in Africa. Choose how you&apos;d like to contribute to our mission.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {involvementOptions.map((option, index) => (
            <Link href="/get-involved" key={option.title}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${option.color} rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105`}
              >
                <div className="p-6 text-white">
                  <div className="mb-4">{option.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{option.title}</h3>
                  <p>{option.description}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            Looking for more ways to get involved?
          </h2>
          <p className="text-green-700 mb-4">
            Visit our comprehensive involvement page to discover additional opportunities including expert registration, partnerships, volunteering, and more.
          </p>
          <Link 
            href="/get-involved"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Explore More Opportunities
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 ml-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GetInvolvedPage;