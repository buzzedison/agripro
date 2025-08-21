import Link from 'next/link'
import { FaHandsHelping, FaProjectDiagram, FaLeaf, FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa'

export default function Careers() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
            Join Our Mission
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Be part of a team dedicated to transforming agriculture in Africa. We are looking for passionate individuals who want to make a difference.
          </p>
        </div>
      </section>

      {/* Current Opportunities */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-green-800 mb-12 text-center">
            Current Opportunities
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Agripro Fellowship */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 border-2 border-green-200">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaGraduationCap className="text-2xl text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-green-800">
                      Agripro Fellowship
                    </h3>
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">NEW</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    6-month venture-backed fellowship for future agribusiness leaders. Build real solutions across agricultural value chains.
                  </p>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>🕒</span> 6 months
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>📍</span> Accra & Field locations
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>🎯</span> Venture-backed
                    </p>
                  </div>
                  <Link 
                    href="/fellowship"
                    className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                  >
                    Learn More 
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Project Management Intern */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaProjectDiagram className="text-2xl text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Project Management Intern
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Join our dynamic team and gain hands-on experience in agricultural project management. Perfect for students or recent graduates.
                  </p>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>🕒</span> Full-time
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>📍</span> Accra, Ghana
                    </p>
                  </div>
                  <Link 
                    href="/careers/project-management-intern"
                    className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                  >
                    Learn More 
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Volunteer Opportunities */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaHandsHelping className="text-2xl text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Volunteer Opportunities
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Support our various initiatives and make a difference in African agriculture. Multiple roles available.
                  </p>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <FaLeaf className="text-green-600" />
                      <span className="text-gray-600">Green Market Support</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaChalkboardTeacher className="text-green-600" />
                      <span className="text-gray-600">Agricultural Education</span>
                    </div>
                  </div>
                  <Link 
                    href="/careers/volunteer"
                    className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                  >
                    View Opportunities
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-green-800 mb-12 text-center">
            Why Join AgriPro Hub?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Make an Impact",
                description: "Be part of transforming agriculture in Africa and supporting local farmers."
              },
              {
                title: "Learn & Grow",
                description: "Gain valuable experience and develop your skills in a supportive environment."
              },
              {
                title: "Great Culture",
                description: "Join a passionate team dedicated to sustainable agriculture and innovation."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-green-800 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 