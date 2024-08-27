// components/ImpactPage.tsx
"use client"
import { motion } from 'framer-motion';
import { FaUsers, FaChartLine, FaLeaf, FaGlobe } from 'react-icons/fa';
import ImageSlider from '../components/ImageSlider';

const impactData = [
  {
    icon: <FaUsers size={48} />,
    title: 'Young People in Agribusiness',
    description: '10,000 young people engaged through our clubs in five universities.',
    color: '#4CAF50',
  },
  {
    icon: <FaChartLine size={48} />,
    title: 'Youth-led Interventions',
    description: 'Helped more than 50 businesses set up their agribusiness ventures.',
    color: '#2196F3',
  },
  {
    icon: <FaLeaf size={48} />,
    title: 'Tech Platform Users',
    description: 'More than 600 people on our tech platform for poultry farmers.',
    color: '#FFC107',
  },
  {
    icon: <FaGlobe size={48} />,
    title: 'Organic Farmers Market',
    description: 'Started the first organic farmers market in Ghana in 2013.',
    color: '#FF5722',
  },
];

const impactImages = [
    "/images/impact1.jpg",
    "/images/impact2.jpg",
    "/images/impact3.jpg",
    "/images/impact4.jpg",
  ];
  

const futureGoals = [
  {
    title: 'Youth in Agribusiness',
    target: '100,000',
    description: 'Help smart young people join agribusiness ventures.',
  },
  {
    title: 'Profitable Agribusinesses',
    target: '10,000',
    description: 'Help people start profitable agribusinesses in Africa.',
  },
  {
    title: 'Agribusiness Education',
    target: '1 Million',
    description: 'Provide agribusiness education to people across Africa.',
  },
  {
    title: 'Innovation Labs',
    target: '10',
    description: 'Develop innovation labs across Africa.',
  },
];

export default function ImpactPage() {
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
            Our Impact
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            We have made significant strides in empowering young people and promoting agribusiness in Africa. Here&apos;s a glimpse of our impact so far and our ambitious goals for the future.
          </p>
        </motion.div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Impact Achievements</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {impactData.map((impact, index) => (
              <motion.div
                key={impact.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-lg shadow-lg p-6 bg-white`}
              >
                <div className="mb-4 p-4 rounded-full inline-flex items-center justify-center" style={{ backgroundColor: impact.color }}>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                    className="text-white"
                  >
                    {impact.icon}
                  </motion.div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {impact.title}
                </h3>
                <p className="text-gray-600">
                  {impact.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

  
        <div className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <ImageSlider images={impactImages} />
          </motion.div>
        </div>

       

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Future Goals</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {futureGoals.map((goal, index) => (
              <motion.div
                key={goal.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {goal.title}
                </h3>
                <p className="text-4xl font-bold text-green-500 mb-4">
                  {goal.target}
                </p>
                <p className="text-gray-600">
                  {goal.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* <div className="mt-16">
          <img
            src="/images/impact_future_goals.png"
            alt="Future Goals"
            className="w-full h-auto object-cover rounded-lg shadow-md"
          />
        </div> */}

        <div className="mt-16 text-center">
          <p className="text-xl text-gray-600 mb-8">
            Join us in our mission to revolutionize agribusiness in Africa. Together, we can create a sustainable and prosperous future for the continent.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a
              href="/get-involved"
              className="inline-block bg-green-500 text-white px-8 py-4 rounded-full text-xl font-semibold hover:bg-green-600 transition duration-200"
            >
              Get Involved
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}