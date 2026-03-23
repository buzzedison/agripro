"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaRocket, FaBriefcase, FaClock, FaMapMarkerAlt, FaCheckCircle, FaStar, FaGlobeAfrica, FaUsers, FaCalendarAlt, FaEnvelopeOpenText } from 'react-icons/fa'

export default function OperationsIntern() {
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
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 font-sans selection:bg-amber-200">

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
            <span className="text-emerald-200 text-sm font-medium tracking-wider uppercase">National Service / Attachment</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1]"
          >
            Operations Intern
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-emerald-100 max-w-2xl mb-10 font-light leading-relaxed"
          >
            Become the operational spine of AgriPro for 2026. Coordinate a Pan-African accelerator, manage international event logistics, and build something real.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full shadow-lg">
              <FaMapMarkerAlt className="text-emerald-400" />
              <span>Accra, Ghana (Hybrid)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full shadow-lg">
              <FaClock className="text-emerald-400" />
              <span>May – Dec 2026 (8 Months)</span>
            </div>
            <Link
              href="https://app.taskwit.co/jobs/c818a9ea-022a-4ad1-a738-555948e213b2"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-[#022c22] px-8 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
            >
              Apply by April 25 <FaRocket />
            </Link>
          </motion.div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-20 relative">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>

          {/* Critical Context Section */}
          <motion.section variants={fadeUp} className="mb-20">
            <div className="bg-amber-50 border-l-8 border-amber-400 rounded-3xl p-8 md:p-12 shadow-inner">
               <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-3">
                 <FaStar className="text-amber-500" /> Read this before you apply
               </h2>
               <p className="text-amber-800 text-lg leading-relaxed">
                 AgriPro runs a lean team in 2026. There is no big team around you. <strong>You will be the only operations person.</strong> That means real ownership — not busywork. You will coordinate a live accelerator programme, manage Rwanda event logistics, and keep the platform running. This role suits someone who is self-starting, comfortable with ambiguity, and wants to build something real.
               </p>
            </div>
          </motion.section>

          {/* About & Role Section */}
          <motion.section variants={fadeUp} className="mb-20">
            <div className="bg-white rounded-3xl p-10 md:p-14 shadow-xl shadow-gray-100/50 border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700"></div>

              <div className="relative z-10 flex flex-col md:flex-row gap-10">
                <div className="md:w-1/3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 text-green-600 mb-6 shadow-inner">
                    <FaGlobeAfrica className="text-3xl" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">The <br className="hidden md:block" />Operational Spine</h2>
                </div>
                <div className="md:w-2/3">
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    AgriPro is a Pan-African agribusiness platform building Africa’s next generation of agricultural entrepreneurs. In 2026, our headline programme is <strong>Catalyst W</strong> — a 12-week accelerator for women-led agribusinesses, culminating in a Demo Day in <strong>Kigali, Rwanda</strong>.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    You keep things moving: tracking tasks, chasing updates, managing logistics, and making sure nothing falls through the cracks between the Founder, Program Fellows, and the cohort. You are the connective tissue that makes everything work.
                  </p>
                  <div className="relative h-72 w-full rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="/images/agripro_operations_intern.png"
                      alt="Operations at AgriPro"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Responsibilities Grid */}
          <section className="grid lg:grid-cols-2 gap-8 mb-20">
            
            {/* Catalyst W */}
            <motion.div variants={fadeUp} className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 hover:border-emerald-200 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <FaRocket className="text-xl text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Catalyst W Programme</h3>
              </div>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                  <span>Manage application portal & track submissions</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                  <span>Drive applicant recruitment and communications</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                  <span>Coordinate WhatsApp groups & weekly schedules</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                  <span>Arrange mentor sessions & onboarding materials</span>
                </li>
              </ul>
            </motion.div>

            {/* Rwanda Event */}
            <motion.div variants={fadeUp} className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 hover:border-blue-200 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <FaCalendarAlt className="text-xl text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Rwanda Demo Day</h3>
              </div>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>Manage venue, catering, AV & accommodation</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>Send & track press invitations</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>Coordinate speaker travel & press packs</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>On-the-ground execution in Kigali (Oct 2026)</span>
                </li>
              </ul>
            </motion.div>

            {/* Platform & Content */}
            <motion.div variants={fadeUp} className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 hover:border-purple-200 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                  <FaUsers className="text-xl text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Platform & Social</h3>
              </div>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-500 mt-1 flex-shrink-0" />
                  <span>Post 3× per week on AgriPro Connect platform</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-500 mt-1 flex-shrink-0" />
                  <span>Upload Knowledge Hub content from partners</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-500 mt-1 flex-shrink-0" />
                  <span>Keep the digital community active & professional</span>
                </li>
              </ul>
            </motion.div>

            {/* General Coordination */}
            <motion.div variants={fadeUp} className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 hover:border-amber-200 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <FaBriefcase className="text-xl text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">General Coordination</h3>
              </div>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-amber-500 mt-1 flex-shrink-0" />
                  <span>Run weekly check-ins with Program Fellows</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-amber-500 mt-1 flex-shrink-0" />
                  <span>Maintain the master project tracker</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-amber-500 mt-1 flex-shrink-0" />
                  <span>Draft emails, partner communications & updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-amber-500 mt-1 flex-shrink-0" />
                  <span>Support Founder with fundraising admin</span>
                </li>
              </ul>
            </motion.div>

          </section>

          {/* Requirements & Nice to Have */}
          <section className="grid lg:grid-cols-12 gap-8 mb-20">
            <motion.div variants={fadeUp} className="lg:col-span-12 bg-gradient-to-br from-[#064e3b] to-[#022c22] p-10 md:p-14 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row gap-12">
                <div className="md:w-1/2">
                   <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <FaStar className="text-emerald-400" /> What We're Looking For
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Final-year student or recent graduate (Agribusiness, Admin, Comms)",
                      "Superbly organized — nothing gets lost on your watch",
                      "Strong written English for emails and community updates",
                      "Proficient in Google Workspace & WhatsApp coordination",
                      "Passion for agribusiness and women's entrepreneurship",
                      "Able to work independently without daily supervision"
                    ].map((req, i) => (
                      <li key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                        <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                        <span className="text-emerald-50 text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:w-1/2">
                   <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <FaEnvelopeOpenText className="text-emerald-400" /> Nice to Have
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Experience coordinating events or student programmes",
                      "Familiarity with Notion, Trello, or Asana",
                      "Previous exposure to accelerators or fellowships"
                    ].map((nice, i) => (
                      <li key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                        <FaStar className="text-emerald-400 mt-1 flex-shrink-0" />
                        <span className="text-emerald-50 text-sm">{nice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Benefits */}
          <motion.section variants={fadeUp} className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Rewards for Excellence</h2>
            <p className="text-center text-gray-500 mb-12">Impactful work deserves meaningful recognition.</p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { emoji: "📜", title: "Reference Letter", desc: "A strong, specific letter signed by the Founder on AgriPro letterhead." },
                { emoji: "✈️", title: "Kigali Trip", desc: "Travel to and participation in the Rwanda press conference and Demo Day." },
                { emoji: "📈", title: "Credit", desc: "Named in AgriPro’s 2026 Annual Report and public communications." },
                { emoji: "💼", title: "Hiring Priority", desc: "First access to paid roles at AgriPro when funding is secured in 2027." },
                { emoji: "🎓", title: "Real Experience", desc: "Demonstrable experience coordinating an international programme." },
                { emoji: "💰", title: "Monthly Stipend", desc: "Financial support throughout your 8-month internship journey." }
              ].map((benefit, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-300">
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
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-emerald-200/50 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
              <div className="inline-block bg-white p-4 rounded-full text-green-600 mb-6 shadow-sm">
                <FaRocket className="text-3xl" />
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#022c22] mb-6 tracking-tight">
                Ready to Join Catalyst W?
              </h2>
              <p className="text-lg md:text-xl text-green-900/80 mb-10 max-w-2xl mx-auto font-medium">
                Applications are reviewed on a rolling basis. If you're a fit, you'll hear from us within 5 working days.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-5">
                <Link
                  href="https://app.taskwit.co/jobs/c818a9ea-022a-4ad1-a738-555948e213b2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-[#064e3b] hover:bg-[#022c22] text-white px-10 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-[0_10px_30px_rgba(6,78,59,0.3)]"
                >
                  Apply via TaskWit
                </Link>
                <Link
                  href="/careers"
                  className="inline-flex items-center justify-center gap-3 bg-white hover:bg-green-50 text-green-800 px-10 py-4 rounded-full font-bold text-lg border-2 border-green-200 hover:border-green-300 transition-colors"
                >
                   All Openings
                </Link>
              </div>
            </div>
          </motion.section>

        </motion.div>
      </main>
    </div>
  )
}
