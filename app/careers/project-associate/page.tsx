"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaGraduationCap, FaLeaf, FaHandsHelping, FaRocket, FaBriefcase, FaLaptopCode, FaClock, FaMapMarkerAlt, FaCheckCircle, FaStar } from 'react-icons/fa'

export default function ProjectAssociate() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 font-sans selection:bg-green-200">

      {/* Dynamic Glassmorphic Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-[#064e3b]">
        {/* Animated Glow Orbs */}
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-emerald-500 rounded-full blur-[150px] mix-blend-screen opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-green-900 rounded-full blur-[150px] mix-blend-screen opacity-60"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 flex gap-3"
          >
            <Link href="/careers" className="text-emerald-400 hover:text-white transition-colors text-sm font-medium tracking-wider uppercase flex items-center gap-2">
              <span>← Careers</span>
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-emerald-200 text-sm font-medium tracking-wider uppercase">Open Internship</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1]"
          >
            Project Associate
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-emerald-100 max-w-2xl mb-10 font-light leading-relaxed"
          >
            Calling all ambitious university students and recent graduates! Join us at AgriPro and help build sustainable, innovative agricultural solutions that transform Africa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full shadow-lg">
              <FaMapMarkerAlt className="text-emerald-400" />
              <span>Accra, Ghana / Hybrid</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full shadow-lg">
              <FaClock className="text-emerald-400" />
              <span>Full-time Internship</span>
            </div>
            <Link
              href="https://app.taskwit.co/jobs/b20f50c1-68cc-4844-9e53-5f5f0d969e9d"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-[#022c22] px-8 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
            >
              Apply Now <FaRocket />
            </Link>
          </motion.div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-20 relative">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>

          {/* Why AgriPro Section */}
          <motion.section variants={fadeUp} className="mb-20">
            <div className="bg-white rounded-3xl p-10 md:p-14 shadow-xl shadow-gray-100/50 border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700"></div>

              <div className="relative z-10 flex flex-col md:flex-row gap-10">
                <div className="md:w-1/3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 text-green-600 mb-6 shadow-inner">
                    <FaLeaf className="text-3xl" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Why <br className="hidden md:block" />AgriPro?</h2>
                </div>
                <div className="md:w-2/3">
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    AgriPro is at the forefront of agribusiness innovation. We don&apos;t just dream about a food-secure Africa—we are actively building it. When you join us, you&apos;re not just taking on a job; you are stepping into a dynamic ecosystem of entrepreneurs, engineers, and visionaries. You’ll get hands-on experience solving real-world challenges, working on impactful projects that span the entire agricultural value chain. Support local communities, harness the power of AI and tech, and turn your potential into tangible progress.
                  </p>
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-md">
                    <Image
                      src="/images/agripro_project_associate.png"
                      alt="AgriPro Impact"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Role Details and Requirements Grid */}
          <section className="grid lg:grid-cols-12 gap-8 mb-20">

            {/* Responsibilities */}
            <motion.div variants={fadeUp} className="lg:col-span-7 bg-white p-10 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 hover:border-green-200 transition-colors">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <FaBriefcase className="text-xl text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">What You&apos;ll Do</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-8">
                As a <strong>Project Associate</strong>, you will be the engine room of our project execution. You will collaborate with senior leaders to plan, execute, and monitor grassroots and digital agricultural initiatives.
              </p>

              <ul className="space-y-6">
                {[
                  { icon: <FaRocket />, color: "text-purple-500", bg: "bg-purple-50", title: "Drive Milestones", desc: "Take projects from ideation to delivery ensuring high quality." },
                  { icon: <FaHandsHelping />, color: "text-emerald-500", bg: "bg-emerald-50", title: "Collaborate", desc: "Work closely with cross-functional teams and external partners." },
                  { icon: <FaLaptopCode />, color: "text-blue-500", bg: "bg-blue-50", title: "Modern Tech", desc: "Leverage cutting edge tools and technology for tracking." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className={`mt-1 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Who You Are (Requirements) */}
            <motion.div variants={fadeUp} className="lg:col-span-5 bg-gradient-to-b from-[#064e3b] to-[#022c22] p-10 rounded-3xl text-white shadow-xl shadow-green-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-[50px] mix-blend-screen -mr-20 -mt-20"></div>

              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <FaStar className="text-emerald-400" /> Who You Are
              </h3>

              <ul className="space-y-5 relative z-10">
                {[
                  "Current university student or recent graduate ready to make a mark.",
                  "Highly organized, detail-oriented, and a natural problem solver.",
                  "Passionate about sustainability, technology, and agribusiness.",
                  "Excellent communicator who thrives in a collaborative environment."
                ].map((req, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                    <span className="text-emerald-50 text-sm leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

          </section>

          {/* Perks & Benefits Modern Grid */}
          <motion.section variants={fadeUp} className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Perks & Benefits</h2>
            <p className="text-center text-gray-500 mb-12">More than just an internship—we invest in your future.</p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { emoji: "🤝", title: "Mentorship", desc: "Direct guidance from industry leaders and experienced professionals." },
                { emoji: "🌱", title: "Real Impact", desc: "Work that tangibly impacts farming communities and sustainability." },
                { emoji: "💡", title: "Skill Building", desc: "Exposure to project management methodologies and cutting-edge tech." },
                { emoji: "📜", title: "Certification", desc: "Receive an official certificate of completion and excellent references." },
                { emoji: "💰", title: "Stipend", desc: "Competitive monthly stipend to support your learning journey." },
                { emoji: "🚀", title: "Growth", desc: "Potential path to a full-time role based on your incredible performance." }
              ].map((benefit, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-green-200 hover:shadow-lg hover:shadow-green-100 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:bg-green-50 transition-all duration-300">
                    {benefit.emoji}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Final Call to Action */}
          <motion.section variants={fadeUp} className="bg-gradient-to-r from-emerald-50 to-green-100 rounded-[2.5rem] p-10 md:p-16 text-center border border-green-200 shadow-xl shadow-green-100/50 relative overflow-hidden">

            {/* Decorative Patterns */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-emerald-200/50 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
              <div className="inline-block bg-white p-4 rounded-full text-green-600 mb-6 shadow-sm">
                <FaRocket className="text-3xl" />
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#022c22] mb-6 tracking-tight">
                Ready to Shape the Future?
              </h2>
              <p className="text-lg md:text-xl text-green-900/80 mb-10 max-w-2xl mx-auto font-medium">
                Don&apos;t miss this opportunity to start your career with purpose. Hit the button below and submit your application on our portal!
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-5">
                <Link
                  href="https://app.taskwit.co/jobs/b20f50c1-68cc-4844-9e53-5f5f0d969e9d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-[#064e3b] hover:bg-[#022c22] text-white px-10 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-[0_10px_30px_rgba(6,78,59,0.3)]"
                >
                  Submit Application
                </Link>
                <Link
                  href="/careers"
                  className="inline-flex items-center justify-center gap-3 bg-white hover:bg-green-50 text-green-800 px-10 py-4 rounded-full font-bold text-lg border-2 border-green-200 hover:border-green-300 transition-colors"
                >
                  Explore Other Roles
                </Link>
              </div>
            </div>
          </motion.section>

        </motion.div>
      </main>
    </div>
  )
}