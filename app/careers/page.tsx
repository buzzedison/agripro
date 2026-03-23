"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaHandsHelping, FaProjectDiagram, FaLeaf, FaChalkboardTeacher, FaGraduationCap, FaArrowRight, FaUsers, FaGlobeAfrica, FaSeedling } from 'react-icons/fa'

export default function Careers() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-gray-800 overflow-hidden font-sans">
      {/* Dynamic Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-200/40 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-emerald-100/40 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-yellow-100/30 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 font-semibold text-sm mb-8 shadow-sm border border-green-200"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            We&apos;re Hiring
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-extrabold text-[#064E3B] mb-8 tracking-tight leading-tight"
          >
            Build the Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">
              African Agriculture
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
          >
            Whether you are an experienced professional, a university student, or a recent graduate—join our mission to innovate and create a lasting, sustainable impact.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-green-900/10 border-4 border-white/50 relative h-64 md:h-96"
          >
            <Image
              src="/images/agristudent.png"
              alt="AgriPro Team"
              fill
              className="object-cover object-center"
            />
          </motion.div>
        </div>
      </section>

      {/* Current Opportunities Grid */}
      <section className="py-20 px-4 relative z-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-16"
          >
            <h2 className="text-4xl font-bold text-[#064E3B] tracking-tight">Open Positions</h2>
            <div className="hidden md:flex h-px bg-green-200 flex-1 ml-8"></div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-8"
          >
            {/* Project Associate Role (Featured) */}
            <motion.div variants={itemVariants} className="lg:col-span-2 group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 md:p-10 border border-green-100 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-green-100/80 p-4 rounded-2xl">
                      <FaProjectDiagram className="text-3xl text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                        Project Associate
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-sm font-medium text-gray-500">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">Internship / Entry-Level</span>
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">🚀 Hiring Now</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    Join our dynamic team to collaborate on impactful agricultural initiatives and kickstart your career. Perfect for ambitious university students and recent graduates looking to make a real difference.
                  </p>
                  <div className="flex flex-wrap gap-4 mb-6 md:mb-0">
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                      <span className="text-xl">🕒</span> Full-time
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                      <span className="text-xl">📍</span> Accra, Ghana / Hybrid
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto self-center md:self-end">
                  <Link
                    href="/careers/project-associate"
                    className="group/btn w-full md:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-green-600/30"
                  >
                    View Details
                    <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Operations Intern Role */}
            <motion.div variants={itemVariants} className="lg:col-span-2 group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-400 rounded-3xl blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 md:p-10 border border-amber-100 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-amber-100/80 p-4 rounded-2xl">
                      <FaUsers className="text-3xl text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                        Operations Intern
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-sm font-medium text-gray-500">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">National Service / Attachment</span>
                        <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">✨ Catalyst W 2026</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    The operational spine of AgriPro for 2026. Coordinate our flagship Catalyst W accelerator and manage international logistics for our Rwanda Demo Day. Real ownership from day one.
                  </p>
                  <div className="flex flex-wrap gap-4 mb-6 md:mb-0">
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                      <span className="text-xl">🕒</span> 8 Months
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                      <span className="text-xl">📍</span> Accra / Hybrid
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto self-center md:self-end">
                  <Link
                    href="/careers/operations-intern"
                    className="group/btn w-full md:w-auto inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-amber-600/30"
                  >
                    View Details
                    <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Agripro Fellowship */}
            <motion.div variants={itemVariants} className="group cursor-pointer">
              <Link href="/fellowship" className="block h-full">
                <div className="h-full bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-green-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-emerald-50 p-4 rounded-2xl">
                      <FaGraduationCap className="text-2xl text-emerald-600" />
                    </div>
                    <FaArrowRight className="text-gray-300 group-hover:text-emerald-500 group-hover:-rotate-45 transition-all text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    Agripro Fellowship
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    6-month venture-backed fellowship for future agribusiness leaders. Build real solutions across agricultural value chains.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-sm border border-gray-100">6 Months</span>
                    <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-sm border border-gray-100">Venture-Backed</span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Volunteer */}
            <motion.div variants={itemVariants} className="group cursor-pointer">
              <Link href="/careers/volunteer" className="block h-full">
                <div className="h-full bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-green-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-teal-50 p-4 rounded-2xl">
                      <FaHandsHelping className="text-2xl text-teal-600" />
                    </div>
                    <FaArrowRight className="text-gray-300 group-hover:text-teal-500 group-hover:-rotate-45 transition-all text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors">
                    Volunteer Opportunities
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Support our various initiatives and make a tangible difference in African agriculture. We have multiple roles available for passionate minds.
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100"><FaLeaf className="text-teal-500" /> Green Market</span>
                    <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100"><FaChalkboardTeacher className="text-teal-500" /> Education</span>
                  </div>
                </div>
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Why Join Us Premium Section */}
      <section className="py-24 relative bg-[#022c22] text-white">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Join AgriPro?</h2>
            <p className="text-xl text-green-100/80 font-light">
              We aren&apos;t just offering jobs; we are offering an ecosystem of impact, innovation, and unparalleled personal growth.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaGlobeAfrica className="text-4xl text-emerald-400" />,
                title: "Massive Impact",
                desc: "Directly contribute to transforming the agricultural landscape of Africa and uplifting local farming communities."
              },
              {
                icon: <FaSeedling className="text-4xl text-green-400" />,
                title: "Rapid Growth",
                desc: "Immerse yourself in a challenging yet deeply supportive environment designed to accelerate your career."
              },
              {
                icon: <FaUsers className="text-4xl text-teal-400" />,
                title: "Vibrant Culture",
                desc: "Work alongside passionate visionaries, agritech experts, and innovators who care about you and the mission."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-3xl hover:bg-white/10 transition-colors duration-300"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-green-50/70 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
      </section>
    </div>
  )
}