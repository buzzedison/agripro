'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaSeedling, FaUsers, FaLightbulb, FaGlobe, FaBrain, FaRocket, FaLeaf, FaHandshake, FaChalkboardTeacher } from 'react-icons/fa'

const ClubsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <section className="relative py-20 px-4 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-green-600/10 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <FaSeedling className="text-green-300" />
                <span className="text-green-100">Join Our Growing Community</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Join Africa&apos;s Next Generation of{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                  Agribusiness Leaders
                </span>
              </h1>
              <p className="text-xl text-green-100 mb-8 max-w-xl">
                Connect with like-minded youth, gain hands-on experience, and build innovative solutions for Africa&apos;s agricultural future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="https://airtable.com/app0J1BYQpwnlLfwj/pagcXaGt1K9Zu8P7n/form"
                  className="px-8 py-4 bg-white text-green-800 rounded-full hover:bg-green-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  Join a Club
                </Link>
                <Link 
                  href="https://airtable.com/app0J1BYQpwnlLfwj/pagcXaGt1K9Zu8P7n/form"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white/10 transition-all duration-300 font-semibold"
                >
                  Start a Club
                </Link>
              </div>
            </div>
            <div className="relative lg:h-[600px] w-full hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl backdrop-blur-sm"></div>
              <Image
                src="/images/agristudent.png"
                alt="Young African agribusiness leaders"
                fill
                className="object-cover rounded-2xl"
                priority
              />
              <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <FaUsers className="text-2xl text-green-600" />
                  <div>
                    <div className="font-semibold text-green-800">Community</div>
                    <div className="text-sm text-green-600">Growing Network</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <FaRocket className="text-2xl text-green-600" />
                  <div>
                    <div className="font-semibold text-green-800">Innovation</div>
                    <div className="text-sm text-green-600">Future of Farming</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 p-8 rounded-xl">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Vision</h2>
              <p className="text-gray-700">
                To create a network of empowered, innovative, and globally competitive youth agripreneurs who transform agriculture in Africa.
              </p>
            </div>
            <div className="bg-green-50 p-8 rounded-xl">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Mission</h2>
              <p className="text-gray-700">
                To inspire and equip youth with the knowledge, skills, networks, and tools needed to lead successful and impactful agribusiness ventures across the continent.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-green-800 mb-12 text-center">Strategic Focus Areas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FaLightbulb,
                title: "Innovation and Technology",
                points: [
                  "Introduction of Agribusiness Innovation Labs for agri-tech experimentation",
                  "Partnerships with agri-tech startups for practical exposure",
                  "Digital Innovation Challenge for tech-based solutions"
                ]
              },
              {
                icon: FaRocket,
                title: "Entrepreneurship Development",
                points: [
                  "Agripreneur Bootcamps for business creation",
                  "Agribusiness Pitch Competitions with funding",
                  "Access to comprehensive Startup Toolkit"
                ]
              },
              {
                icon: FaLeaf,
                title: "Hands-On Learning",
                points: [
                  "Partnership with local farms and urban gardens",
                  "Organic farming market projects",
                  "Farm-to-table program implementation"
                ]
              },
              {
                icon: FaGlobe,
                title: "Global and Local Connections",
                points: [
                  "Agripro Clubs Global Network (ACGN)",
                  "Cross-institutional exchange programs",
                  "Virtual workshops and networking"
                ]
              },
              {
                icon: FaBrain,
                title: "Thought Leadership and Research",
                points: [
                  "Agripro Think Tanks establishment",
                  "Agricultural research initiatives",
                  "Bi-annual Agribusiness Trends Report"
                ]
              }
            ].map((area, index) => (
              <div key={index} className="bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-6">
                <div className="text-green-600 text-3xl mb-4">
                  <area.icon />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-4">{area.title}</h3>
                <ul className="space-y-3">
                  {area.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <span className="mt-2 w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-green-800 mb-12 text-center">Flagship Programs</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: FaRocket,
                title: "Agri-Talent Incubator",
                description: "6-month structured program with mentorship, training, and funding",
                points: [
                  "Mentorship and technical training",
                  "Financial support for ventures",
                  "High-impact Demo Day"
                ]
              },
              {
                icon: FaLightbulb,
                title: "Smart Agribusiness Challenge",
                description: "Continental competition for innovative food system solutions",
                points: [
                  "Grants and funding opportunities",
                  "Expert mentorship",
                  "Visibility and networking"
                ]
              },
              {
                icon: FaLeaf,
                title: "Innovation Pop-Up Labs",
                description: "Mobile technology showcases across campuses",
                points: [
                  "Hydroponics demonstrations",
                  "Drone farming systems",
                  "IoT in agriculture"
                ]
              },
              {
                icon: FaHandshake,
                title: "Agribusiness Leadership Summit",
                description: "Annual gathering of industry leaders and innovators",
                points: [
                  "Expert speakers and panels",
                  "Networking sessions",
                  "Innovation showcases"
                ]
              },
              {
                icon: FaUsers,
                title: "Youth-Driven Organic Markets",
                description: "Student-led local market initiatives",
                points: [
                  "Local produce sales",
                  "Practical business experience",
                  "Community engagement"
                ]
              }
            ].map((program, index) => (
              <div key={index} className="bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-green-600 text-3xl">
                    <program.icon />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-green-800 mb-2">{program.title}</h3>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                    <ul className="space-y-2">
                      {program.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-600">
                          <span className="mt-2 w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-green-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Transform Agriculture?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="https://airtable.com/app0J1BYQpwnlLfwj/pagcXaGt1K9Zu8P7n/form"
              className="px-8 py-4 bg-white text-green-800 rounded-full hover:bg-green-100 transition-colors font-semibold"
            >
              Join a Club
            </Link>
            <Link 
              href="https://airtable.com/app0J1BYQpwnlLfwj/pagcXaGt1K9Zu8P7n/form"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white/10 transition-colors font-semibold"
            >
              Start a Club
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ClubsPage