'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Users,
  Smartphone,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Target,
  Globe,
  Sprout,
  Building2,
  LineChart,
  Shield,
  Zap,
  MapPin,
  Calendar,
  ChevronRight,
  Mail,
  ArrowUpRight,
  Leaf,
  Handshake,
  PiggyBank,
  BarChart3
} from 'lucide-react'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function TrustBridgePage() {
  const [activePhase, setActivePhase] = useState(1)

  const howItWorks = [
    {
      step: 1,
      title: 'Digital Profiling',
      description: 'Farmers are mapped and verified using our Ayeeko App and community validation',
      icon: Smartphone,
      color: 'bg-blue-500'
    },
    {
      step: 2,
      title: 'Smart Disbursement',
      description: 'No cash given—farmers receive digital vouchers redeemable only for quality inputs',
      icon: ShoppingBag,
      color: 'bg-purple-500'
    },
    {
      step: 3,
      title: 'Continuous Support',
      description: 'Real-time agronomic advice delivered twice weekly via the app',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      step: 4,
      title: 'Harvest Settlement',
      description: 'Farmers repay in produce, not cash; we aggregate and deliver to pre-secured buyers',
      icon: Sprout,
      color: 'bg-amber-500'
    },
    {
      step: 5,
      title: 'Instant Payment',
      description: 'Farmers receive their profit (market price minus loan) immediately after delivery',
      icon: DollarSign,
      color: 'bg-emerald-500'
    }
  ]

  const hypotheses = [
    {
      hypothesis: 'Farmers will repay when markets are guaranteed',
      target: '>98% repayment rate',
      icon: Shield
    },
    {
      hypothesis: 'Quality inputs + advice increases yield',
      target: '+20% vs. regional average',
      icon: TrendingUp
    },
    {
      hypothesis: 'Aggregation removes middlemen margins',
      target: '+25% farmer income increase',
      icon: DollarSign
    }
  ]

  const phases = [
    {
      phase: 1,
      title: 'Sandbox Pilot',
      status: 'Now',
      items: [
        'Validate the model with 50 farmers',
        'Build the track record banks require',
        'Refine our Ayeeko App and SOPs'
      ]
    },
    {
      phase: 2,
      title: 'TrustBridge Fund',
      status: 'Next',
      items: [
        '$500K pilot fund backed by institutional investors',
        '500+ farmers across 10 locations',
        'Partner with local banks using our data as credit enhancement'
      ]
    },
    {
      phase: 3,
      title: 'Terranova at Scale',
      status: 'Future',
      items: [
        'Commercial investment vehicle ($10M+)',
        '50,000+ farmers',
        'Full financial inclusion ecosystem'
      ]
    }
  ]

  const partnerTypes = [
    {
      title: 'Impact Investors',
      description: 'Measurable, scalable impact with structural risk mitigation',
      icon: PiggyBank
    },
    {
      title: 'Philanthropic Partners',
      description: 'Proving the model unlocks billions in future capital',
      icon: Handshake
    },
    {
      title: 'Corporate Partners',
      description: 'Secure, sustainable agricultural supply chains',
      icon: Building2
    },
    {
      title: 'DFI/Multilaterals',
      description: 'Innovative approaches to the financing gap',
      icon: Globe
    },
    {
      title: 'Technology Partners',
      description: 'AI-driven agricultural advisory at scale',
      icon: Zap
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-green-500/10 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm mb-6">
              <Leaf className="h-4 w-4 text-green-400" />
              <span>AgriPro Impact Initiative</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              TrustBridge
            </h1>
            <p className="mt-4 text-xl text-emerald-100 sm:text-2xl">
              Bridging the Gap Between African Farmers and Impact Capital
            </p>
            <p className="mt-6 text-lg text-emerald-200/90 max-w-2xl">
              A revolutionary approach to agricultural finance: data-driven, closed-loop financing
              that eliminates default risk while dramatically increasing farmer income.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#get-involved"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-emerald-900 shadow-lg hover:bg-emerald-50 transition-colors"
              >
                Get Involved
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8"
          >
            {[
              { value: '5', label: 'Cities' },
              { value: '50', label: 'Farmers' },
              { value: '$7.5K', label: 'Pilot Investment' },
              { value: '9', label: 'Months' }
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-emerald-200">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Challenge */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeIn}>
              <span className="inline-block text-sm font-semibold text-red-600 uppercase tracking-wider mb-4">
                The Challenge
              </span>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                80% of Africa&apos;s Food, 0% of Formal Finance
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                African smallholder farmers produce 80% of the continent&apos;s food but remain locked out
                of formal finance. Traditional lenders see them as &quot;too risky&quot; while farmers lack the
                credit history and collateral banks require.
              </p>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                This creates a vicious cycle: <span className="font-semibold text-gray-900">no credit means no quality inputs,
                  which means low yields, which reinforces the perception of risk.</span>
              </p>
              <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-emerald-800 font-medium text-lg italic">
                  &quot;What if we could prove the risk doesn&apos;t exist—when the model is designed correctly?&quot;
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                      <Building2 className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Banks Say</h3>
                    <p className="mt-2 text-sm text-gray-600">&quot;Too risky, no collateral, no credit history&quot;</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Low Yields</h3>
                    <p className="mt-2 text-sm text-gray-600">Without quality inputs, productivity suffers</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                      <DollarSign className="h-6 w-6 text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">No Credit</h3>
                    <p className="mt-2 text-sm text-gray-600">Can&apos;t afford seeds, fertilizer, or equipment</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">$65B Gap</h3>
                    <p className="mt-2 text-sm text-gray-600">African agriculture financing deficit</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">
              The TrustBridge Solution
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Zero cash touches farmers&apos; hands until they&apos;ve already repaid.
              <span className="font-semibold text-gray-900"> Default becomes structurally impossible.</span>
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-green-500 to-emerald-500 -translate-y-1/2" />

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
            >
              {howItWorks.map((item, index) => (
                <motion.div
                  key={item.step}
                  variants={fadeIn}
                  className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 text-white`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Result callout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-8 text-center text-white"
          >
            <Shield className="h-12 w-12 mx-auto mb-4 text-emerald-200" />
            <h3 className="text-2xl font-bold">The Result</h3>
            <p className="mt-2 text-lg text-emerald-100 max-w-2xl mx-auto">
              Zero cash touches farmers&apos; hands until they&apos;ve already repaid.
              Default becomes structurally impossible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Pilot */}
      <section className="py-20 bg-emerald-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block text-sm font-semibold text-emerald-300 uppercase tracking-wider mb-4">
              The Pilot
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl">
              5 Cities, 50 Farmers, 6 Months
            </h2>
            <p className="mt-4 text-lg text-emerald-200">
              We&apos;re starting small to prove the model works at scale.
            </p>
          </motion.div>

          {/* 5-1-10 Strategy */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { number: '5', label: 'Cities', desc: 'Across Africa (locations selected with local fellows)' },
              { number: '1', label: 'Crop', desc: 'Per location (short-cycle, high-demand, secured buyer)' },
              { number: '10', label: 'Farmers', desc: 'Per city (statistically valid, manually manageable)' }
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
              >
                <p className="text-5xl font-bold text-white">{item.number}</p>
                <p className="mt-2 text-xl font-semibold text-emerald-300">{item.label}</p>
                <p className="mt-2 text-sm text-emerald-200">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Investment breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 text-gray-900 max-w-3xl mx-auto"
          >
            <h3 className="text-xl font-bold text-center mb-6">Total Investment: $7,500</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">$5,000</p>
                  <p className="text-sm text-gray-600">Revolving loan capital (comes back after harvest)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">$2,500</p>
                  <p className="text-sm text-gray-600">Operational costs (field support, monitoring, logistics)</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-center gap-2 text-gray-600">
              <Calendar className="h-5 w-5" />
              <span>Duration: 9 months (3 months prep + 6 months implementation)</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We&apos;re Proving */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">
              What We&apos;re Proving
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Three Bold Hypotheses
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Testing assumptions that will reshape agricultural finance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {hypotheses.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                  <item.icon className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-3">{item.hypothesis}</h3>
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-semibold">
                  <Target className="h-4 w-4" />
                  {item.target}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white"
          >
            <p className="text-xl font-medium">
              If we hit these targets, we&apos;ll have empirical proof that{' '}
              <span className="text-emerald-400">African smallholder farmers are not high-risk</span>
              —the traditional model is high-risk.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">
              Why This Matters
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Impact for Everyone
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* For Farmers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Farmers</h3>
              <ul className="space-y-3">
                {[
                  'Access to quality inputs they couldn&apos;t afford before',
                  'Technical support that increases their yields',
                  'Fair market prices without exploitative middlemen',
                  'Immediate cash payment after harvest'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* For Investors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center mb-6">
                <LineChart className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Investors</h3>
              <ul className="space-y-3">
                {[
                  'Near-zero default risk (structural, not aspirational)',
                  'Measurable social and environmental impact',
                  'Proof-of-concept for continental scalability',
                  'Clear path to commercial sustainability'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* For Africa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mb-6">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Africa</h3>
              <ul className="space-y-3">
                {[
                  'Food security through increased productivity',
                  'Financial inclusion for millions of smallholders',
                  'Blueprint for bridging the $65B financing gap',
                  'Data infrastructure that unlocks future investment'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Path Forward */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
              The Path Forward
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Our Roadmap
            </h2>
          </motion.div>

          <div className="flex justify-center gap-4 mb-12">
            {phases.map((phase) => (
              <button
                key={phase.phase}
                onClick={() => setActivePhase(phase.phase)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${activePhase === phase.phase
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
              >
                Phase {phase.phase}
              </button>
            ))}
          </div>

          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">
                {phases[activePhase - 1].status}
              </span>
              <h3 className="text-2xl font-bold">{phases[activePhase - 1].title}</h3>
            </div>
            <ul className="space-y-4">
              {phases[activePhase - 1].items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <ChevronRight className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/90">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Who We&apos;re Looking For */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">
              Who We&apos;re Looking For
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Partner With Us
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerTypes.map((partner, index) => (
              <motion.div
                key={partner.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 hover:bg-emerald-50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <partner.icon className="h-6 w-6 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{partner.title}</h3>
                <p className="text-sm text-gray-600">{partner.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Involved CTA */}
      <section id="get-involved" className="py-20 bg-gradient-to-br from-emerald-600 to-green-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold sm:text-4xl">
                Get Involved
              </h2>
              <p className="mt-4 text-lg text-emerald-100">
                TrustBridge isn&apos;t just about financing farmers—it&apos;s about building the data
                infrastructure that makes African agriculture bankable.
              </p>
              <p className="mt-4 text-xl font-semibold text-white">
                Join us in proving that smallholder farmers aren&apos;t the problem. They&apos;re the solution.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 text-gray-900"
            >
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Invest</h3>
                    <p className="text-sm text-gray-600">Join our $7,500 pilot and get first access to Phase 2 opportunities</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Handshake className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Partner</h3>
                    <p className="text-sm text-gray-600">Provide technical support, market linkages, or matched funding</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Learn More</h3>
                    <p className="text-sm text-gray-600">Download our full pilot documentation or schedule a conversation</p>
                  </div>
                </div>

                <a
                  href="mailto:info@agriprohub.com?subject=TrustBridge Partnership Inquiry"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  Contact Us
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="py-12 bg-gray-900 text-center">
        <p className="text-gray-400 max-w-2xl mx-auto px-4">
          TrustBridge is an initiative of{' '}
          <Link href="/" className="text-emerald-400 hover:underline">AgriPro Hub</Link>
          , empowering African agriculture through technology, knowledge, and capital.
        </p>
      </section>
    </div>
  )
}
