"use client"
// components/GetInvolvedPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSeedling, FaHandsHelping, FaLightbulb, FaDollarSign } from 'react-icons/fa';

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
    color: 'bg-yellow-500',
  },
  {
    icon: <FaDollarSign size={40} />,
    title: 'Donate',
    description: 'Support our mission financially and help us reach more aspiring agripreneurs.',
    color: 'bg-purple-500',
  },
];

const GetInvolvedPage: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

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
            Your involvement can make a significant impact on the future of agriculture in Africa. Choose how you'd like to contribute to our mission.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {involvementOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${option.color} rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105`}
              onClick={() => setSelectedOption(index)}
            >
              <div className="p-6 text-white">
                <div className="mb-4">{option.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{option.title}</h3>
                <p>{option.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedOption !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-16 bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-3xl font-bold mb-4">
              {involvementOptions[selectedOption].title}
            </h2>
            <p className="text-lg mb-6">
              Great choice! Here's how you can get started:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Fill out our online application form</li>
              <li>Attend a virtual orientation session</li>
              <li>Connect with a mentor in your area of interest</li>
              <li>Start making an impact in agribusiness!</li>
            </ul>
            <button className="bg-green-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-600 transition duration-200">
              Start Your Journey
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GetInvolvedPage;