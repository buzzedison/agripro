// components/ServicesPage.tsx
"use client"
// components/ServicesPage.tsx

import { motion } from 'framer-motion';
import { FaLightbulb, FaChartLine, FaUsers, FaMicroscope } from 'react-icons/fa';

const services = [
  {
    icon: <FaLightbulb size={48} />,
    title: 'Agribusiness Research and Advisory',
    description: "Agriculture can be tough. We're here to make it easy. We provide the insights and guidance you need to make smart decisions and grow your business.",
    color: 'bg-green-700',
  },
  {
    icon: <FaUsers size={48} />,
    title: 'Agribusiness Clubs',
    description: "Join a passionate community of agripreneurs. Our clubs inspire, educate, and connect you with like-minded people. Discover the joy of agriculture and become a better leader.",
    color: 'bg-gray-700',
  },
  {
    icon: <FaChartLine size={48} />,
    title: 'Training and Capacity Building',
    description: "Want to be a successful agripreneur? Our training programs equip you with the skills and knowledge to overcome challenges and succeed in agriculture.",
    color: 'bg-purple-800',
  },
  {
    icon: <FaMicroscope size={48} />,
    title: 'Innovation Labs',
    description: "Innovation transforms agriculture. Our pop-up labs provide a space to experiment, create, and revolutionize food production. Be part of the future.",
    color: 'bg-red-500',
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl font-black text-gray-900 sm:text-6xl mb-8">
            Empowering Agripreneurs, Transforming Agriculture
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
          Cultivating resilient food systems by empowering agripreneurs and driving innovation in agriculture.
            We understand the challenges faced by agripreneurs today, and we're here to provide the tools and guidance you need to thrive.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all duration-300 ${service.color}`}
            >
              <div className="mb-4 p-4 bg-white rounded-full inline-flex items-center justify-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  className="text-gray-800"
                >
                  {service.icon}
                </motion.div>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                {service.title}
              </h2>
              <p className="text-gray-100">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16">
          <img
            src="/images/agriwoman.jpeg"
            alt="AgriPro"
            className="w-full h-96 object-cover rounded-lg shadow-md"
          />
        </div>

        <div className="mt-16 text-center">
          <p className="text-xl text-gray-600 mb-8">
            At AgriPro, we believe every challenge is an opportunity waiting to be seized. Our services are designed to stand by you at every step of your agribusiness journey. Together, we can break barriers and achieve remarkable success.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a
              href="/get-involved"
              className="inline-block bg-green-800 text-white px-8 py-4 rounded-full text-xl font-semibold hover:bg-green-600 transition duration-200"
            >
              Join the AgriPro Movement
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}