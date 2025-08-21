'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaSeedling, FaArrowRight } from 'react-icons/fa'

const FarmSmartTeaser = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-6">
              <FaSeedling className="text-green-600" />
              <span className="text-green-800 font-medium">Agribusiness Accelerator</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-900">
              FARM FORWARD
              <span className="block text-xl text-green-700 mt-2 font-normal">
                AGRIBUSINESS PLANNING TRAINING
              </span>
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Enhance your Agribusiness skills: build the requisite skills and network 
              needed to succeed in Agribusiness in just one month. Our program is designed 
              for both beginners and experienced agripreneurs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/farm-smart#signup"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                Join Program <FaArrowRight className="ml-1" />
              </Link>
              <Link 
                href="/farm-smart"
                className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-all duration-300 font-medium flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl relative">
              <Image 
                src="/images/farm-smart.jpeg" 
                alt="Farm Forward Program" 
                width={600} 
                height={450}
                className="object-cover w-full h-full transform transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent flex flex-col justify-end p-6">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs">
                  <p className="text-green-800 font-semibold">Next Cohort Starting Soon</p>
                  <p className="text-gray-700">Limited spots available. Register today!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FarmSmartTeaser
