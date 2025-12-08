'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Satellite,
  Brain,
  Sprout,
  Phone,
  Smartphone,
  Wifi,
  WifiOff,
  TrendingUp,
  DollarSign,
  Cloud,
  Shield,
  Zap,
  Users,
  BarChart3,
  Camera,
  MessageSquare,
  Globe,
  CheckCircle,
  ArrowUpRight,
  Leaf,
  AlertTriangle,
  Droplets,
  ThermometerSun,
  ExternalLink
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

export default function AyeekoPage() {
  const technologies = [
    {
      icon: Satellite,
      title: 'Satellite Monitoring',
      emoji: '🛰️',
      description: 'Weekly crop health tracking and early stress detection before problems become visible crises.',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Brain,
      title: 'AI Crop Doctor',
      emoji: '🤖',
      description: 'Diagnose 800+ crop diseases and pests with 95% accuracy. Get step-by-step treatment plans instantly using your smartphone camera.',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: Sprout,
      title: 'Soil Intelligence',
      emoji: '🌱',
      description: 'Real-time NPK, pH, and moisture testing in minutes. No expensive lab tests. Just precision data for better planting decisions.',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }
  ]

  const accessMethods = [
    {
      icon: Phone,
      title: 'Feature Phones',
      description: 'Voice calls, USSD menus, SMS alerts in local languages',
      features: ['Voice-based guidance', 'USSD menu navigation', 'SMS alerts & reminders', 'Local language support']
    },
    {
      icon: Smartphone,
      title: 'Smartphones',
      description: 'Full Ayeeko app with satellite maps, AI camera, and digital reports',
      features: ['Interactive satellite maps', 'AI camera diagnostics', 'Digital farm reports', 'Offline data sync']
    },
    {
      icon: WifiOff,
      title: 'Offline Ready',
      description: 'Core diagnostics work without constant internet',
      features: ['Offline disease detection', 'Cached recommendations', 'Auto-sync when online', 'Low data usage']
    }
  ]

  const impacts = [
    {
      value: '+25%',
      label: 'Yield Increase',
      description: 'With data-driven decisions',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      value: '95%',
      label: 'Diagnostic Accuracy',
      description: 'For 800+ crop diseases',
      icon: Brain,
      color: 'text-purple-600'
    },
    {
      value: '30-50%',
      label: 'Loss Prevention',
      description: 'Through early detection',
      icon: Shield,
      color: 'text-blue-600'
    },
    {
      value: '∞',
      label: 'Credit Access',
      description: 'With documented farm records',
      icon: DollarSign,
      color: 'text-amber-600'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-500/10 to-transparent" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-400/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-teal-400/20 rounded-full blur-xl animate-pulse delay-1000" />
        
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm mb-6">
              <Leaf className="h-4 w-4 text-green-400" />
              <span>AgriPro Digital Platform</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Ayeeko
            </h1>
            <p className="mt-4 text-2xl text-emerald-100 sm:text-3xl font-semibold">
              Stop Guessing. Start Growing.
            </p>
            <p className="mt-6 text-lg text-emerald-200/90 max-w-2xl">
              Precision agriculture intelligence for Africa&apos;s smallholder farmers. 
              Satellite monitoring, AI diagnostics, and soil intelligence—delivered through 
              voice, SMS, USSD, and mobile apps.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="https://ayeeko.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-green-900 shadow-lg hover:bg-green-50 transition-colors"
              >
                Visit Ayeeko.cloud
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="#get-started"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                Learn More
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Key highlight */}
            <div className="mt-10 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-300" />
                <span className="text-sm text-emerald-200">No smartphone required</span>
              </div>
              <span className="text-emerald-400">•</span>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-300" />
                <span className="text-sm text-emerald-200">No literacy barriers</span>
              </div>
              <span className="text-emerald-400">•</span>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-300" />
                <span className="text-sm text-emerald-200">Actionable intelligence</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-red-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <span className="inline-block text-sm font-semibold text-red-600 uppercase tracking-wider mb-4">
                The Problem
              </span>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                30-50% of Potential Yields Lost to Information Gaps
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Africa&apos;s smallholder farmers produce 80% of the continent&apos;s food but operate with a 
                critical data deficit: <span className="font-semibold text-gray-900">inefficient farming practices, 
                wasted inputs, late-arriving advice, and unpredictable climate shocks.</span>
              </p>
            </motion.div>

            <motion.div 
              variants={fadeIn}
              className="mt-12 grid sm:grid-cols-4 gap-6"
            >
              {[
                { icon: BarChart3, label: 'Inefficient Practices', color: 'text-red-500' },
                { icon: DollarSign, label: 'Wasted Inputs', color: 'text-orange-500' },
                { icon: MessageSquare, label: 'Late Advice', color: 'text-amber-500' },
                { icon: Cloud, label: 'Climate Shocks', color: 'text-gray-500' }
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
                  <item.icon className={`h-8 w-8 ${item.color} mx-auto mb-3`} />
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What is Ayeeko */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block text-sm font-semibold text-green-600 uppercase tracking-wider mb-4">
              The Solution
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              What is Ayeeko?
            </h2>
            <p className="mt-6 text-lg text-gray-600">
              Ayeeko combines <span className="font-semibold text-gray-900">satellite monitoring</span>, 
              <span className="font-semibold text-gray-900"> AI crop diagnostics</span>, and 
              <span className="font-semibold text-gray-900"> real-time soil intelligence</span> to help 
              farmers make smarter decisions—delivered through voice, SMS, USSD, and mobile apps.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Three Technologies */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block text-sm font-semibold text-green-600 uppercase tracking-wider mb-4">
              Core Technologies
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Three Technologies, One Platform
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow group"
              >
                <div className={`w-16 h-16 rounded-2xl ${tech.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{tech.emoji}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{tech.title}</h3>
                <p className="text-gray-600 leading-relaxed">{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Every Farmer */}
      <section className="py-20 bg-gradient-to-br from-green-900 to-emerald-800 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block text-sm font-semibold text-green-300 uppercase tracking-wider mb-4">
              Accessibility First
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Built for Every Farmer
            </h2>
            <p className="mt-4 text-lg text-emerald-200">
              Whether you have a basic phone or the latest smartphone, Ayeeko meets you where you are.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {accessMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
              >
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                  <method.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
                <p className="text-emerald-200 mb-6">{method.description}</p>
                <ul className="space-y-2">
                  {method.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-emerald-100">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Impact */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block text-sm font-semibold text-green-600 uppercase tracking-wider mb-4">
              The Impact
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Real Results for Real Farmers
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impacts.map((impact, index) => (
              <motion.div
                key={impact.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8 text-center hover:bg-green-50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:bg-green-100 transition-colors">
                  <impact.icon className={`h-6 w-6 ${impact.color}`} />
                </div>
                <p className={`text-4xl font-bold ${impact.color}`}>{impact.value}</p>
                <p className="mt-2 font-semibold text-gray-900">{impact.label}</p>
                <p className="mt-1 text-sm text-gray-600">{impact.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Additional impact points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto"
          >
            <div className="flex items-start gap-4 p-6 bg-green-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Reduced Input Costs</h3>
                <p className="text-sm text-gray-600 mt-1">Through precision application of fertilizers and pesticides</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Climate Resilience</h3>
                <p className="text-sm text-gray-600 mt-1">Early warnings and real-time intelligence for weather events</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ecosystem Integration */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block text-sm font-semibold text-green-400 uppercase tracking-wider mb-4">
              Ecosystem Integration
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl">
              The Digital Backbone of AgriPro
            </h2>
            <p className="mt-6 text-lg text-gray-300">
              Ayeeko is the digital backbone of the AgriPro ecosystem, powering:
            </p>

            <div className="mt-12 grid sm:grid-cols-3 gap-6">
              <Link 
                href="/impact/trustbridge"
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">TrustBridge</h3>
                <p className="text-sm text-gray-400">Credit decisions powered by verified farm data</p>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-sm mt-3 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">HarvestCircle</h3>
                <p className="text-sm text-gray-400">Farmer profiles and community networks</p>
                <span className="inline-block text-gray-500 text-sm mt-3">Coming soon</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Policy & Insights</h3>
                <p className="text-sm text-gray-400">Data intelligence for agricultural policy</p>
                <span className="inline-block text-gray-500 text-sm mt-3">Coming soon</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold sm:text-4xl">
                Ready to Transform Your Farm?
              </h2>
              <p className="mt-4 text-lg text-green-100">
                Ayeeko is launching soon. Join thousands of farmers getting ready for precision agriculture.
              </p>
              
              <a
                href="https://ayeeko.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-green-900 shadow-lg hover:bg-green-50 transition-colors"
              >
                Visit Ayeeko.cloud
                <ExternalLink className="h-5 w-5" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 text-gray-900"
            >
              <h3 className="text-xl font-bold mb-6">Get Started</h3>
              <div className="space-y-4">
                <a
                  href="https://ayeeko.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Join Farmer Waitlist</p>
                      <p className="text-sm text-gray-600">Be first to access Ayeeko</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>

                <a
                  href="https://ayeeko.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Become an Ayeeko Agent</p>
                      <p className="text-sm text-gray-600">Earn by helping farmers</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>

                <a
                  href="mailto:info@agriprohub.com?subject=Ayeeko Partnership Inquiry"
                  className="flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Partner with Us</p>
                      <p className="text-sm text-gray-600">Collaborate on precision agriculture</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-purple-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="py-12 bg-gray-900 text-center">
        <p className="text-gray-400 max-w-2xl mx-auto px-4">
          Ayeeko is part of the{' '}
          <Link href="/" className="text-green-400 hover:underline">AgriPro Hub</Link>
          {' '}ecosystem, empowering African agriculture through technology, knowledge, and capital.
        </p>
      </section>
    </div>
  )
}
