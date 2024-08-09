// components/Solutions.tsx
'use client';

import { motion } from 'framer-motion';
import { FaSearch, FaCompass, FaGraduationCap, FaLightbulb } from 'react-icons/fa';

const features = [
  {
    icon: FaSearch,
    title: 'Agribusiness Research',
    description: 'Market analysis, feasibility studies, risk assessments.',
  },
  {
    icon: FaCompass,
    title: 'Advisory & Mentorship',
    description: 'Expert guidance on business planning, operations, and financing.',
  },
  {
    icon: FaGraduationCap,
    title: 'Training & Capacity Building',
    description: 'Workshops and programs on technical and business skills.',
  },
  {
    icon: FaLightbulb,
    title: 'Innovation & Technology',
    description: 'Connecting agripreneurs with cutting-edge solutions and resources.',
  },
];

export default function Solutions() {
  return (
    <section className="bg-gradient-to-b from-white to-green-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-4xl font-extrabold text-green-900 sm:text-5xl mb-6">
            Cultivating Success at Every Stage
          </h2>
          <p className="max-w-2xl text-xl text-gray-500 mx-auto">
            Our comprehensive solutions empower agripreneurs to thrive in their ventures.
          </p>
        </motion.div>

        <div className="mt-32">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="text-center"
              >
                <div className="flow-root bg-white rounded-lg shadow-xl px-6 pb-8 transform transition-all duration-500 hover:scale-105">
                  <div className="-mt-12">
                    <div>
                      <span className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg transform -translate-y-1/2">
                        <feature.icon className="h-8 w-8 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-gray-900 tracking-tight">{feature.title}</h3>
                    <p className="mt-4 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex rounded-full shadow-lg"
          >
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-xl font-medium rounded-full text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Discover How We Can Help
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}