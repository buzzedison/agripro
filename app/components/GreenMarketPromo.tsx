import Link from 'next/link'
import Image from 'next/image'
import { FaLeaf } from 'react-icons/fa'

export default function GreenMarketPromo() {
  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className="p-8 md:p-12">
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-6">
                <FaLeaf className="text-green-600" />
                <span className="text-green-800 font-medium">Coming March 2025</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
                Accra Green Market
              </h2>
              
              <p className="text-gray-600 mb-6 text-lg">
                Join us for Ghana&apos;s largest sustainable marketplace. Connect with eco-conscious vendors, learn from experts, and be part of the green revolution.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Sustainable Products & Services</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Expert Workshops & Talks</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Networking Opportunities</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/greenmarket"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                >
                  Learn More
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link 
                  href="/greenmarket/vendors"
                  className="inline-flex items-center px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-full hover:bg-green-50 transition-colors"
                >
                  Become a Vendor
                </Link>
              </div>
            </div>
            
            {/* Image */}
            <div className="relative h-64 md:h-full min-h-[400px]">
              <Image
                src="/images/greenpromo.jpg"
                alt="Accra Green Market"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent">
                <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-sm p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <span className="text-2xl">🌱</span>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">The Enterprise Village, Dzorwulu</p>
                      <p className="text-sm text-green-600">March 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 