'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import './ayeeko.css'
import { 
  FaMicrophone, 
  FaMobile, 
  FaLeaf, 
  FaCloudSun, 
  FaBell, 
  FaUsers, 
  FaHandsHelping, 
  FaUniversity,
  FaCheck,
  FaExclamationTriangle,
  FaMoneyBillWave
} from 'react-icons/fa'
import { submitAyeekoForm } from './actions'

const AyeekoPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    role: '',
    supportType: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormStatus({})

    try {
      const result = await submitAyeekoForm(formData)
      
      if (result.success) {
        setFormStatus({
          success: true,
          message: 'Your application has been submitted successfully! Check your email for confirmation.'
        })
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          organization: '',
          role: '',
          supportType: '',
          message: ''
        })
      } else {
        setFormStatus({
          success: false,
          message: result.error || 'Something went wrong. Please try again.'
        })
      }
    } catch (error) {
      setFormStatus({
        success: false,
        message: 'An unexpected error occurred. Please try again later.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-green-600/10 to-transparent"></div>
          <div className="decorative-circle w-32 h-32 top-20 left-[10%] animate-float"></div>
          <div className="decorative-circle w-24 h-24 bottom-20 right-[15%] animate-float delay-400"></div>
          <div className="decorative-dots w-full h-full opacity-5"></div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`text-center lg:text-left ${isLoaded ? 'animate-fadeIn' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg">
                <FaMicrophone className="text-green-300" />
                <span className="text-green-100">Voice-First Farming Assistant</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                  AYEEKO
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-2xl">
                &quot;Well done, farmer.&quot; An inclusive, AI-powered farming assistant by Agripro
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="#get-involved" className="btn-primary px-8 py-3 rounded-full font-semibold text-lg shadow-lg text-white">
                  Get Involved
                </Link>
                <Link href="#learn-more" className="btn-secondary text-white px-8 py-3 rounded-full font-semibold text-lg">
                  Learn More
                </Link>
              </div>
            </div>
            <div className={`relative hidden lg:block ${isLoaded ? 'animate-slideUp delay-300' : 'opacity-0'}`}>
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                <Image 
                  src="/images/ayeeko/ayeeko2.png" 
                  alt="Farmer using Ayeeko voice assistant" 
                  fill
                  className="object-cover image-hover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="learn-more" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-6 section-title">Our Vision</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              A world where every smallholder farmer—regardless of location, education, or device—grows food with confidence, makes data-driven decisions, and secures a resilient livelihood.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-float">
              <FaLeaf className="text-green-600 text-4xl" />
            </div>
          </div>
        </div>
      </section>
      
      <div className="section-divider"></div>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-green-50 relative overflow-hidden">
        <div className="decorative-dots w-full h-full absolute inset-0"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-6 section-title">The Problem</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Smallholder farmers face significant challenges that current technology solutions don&apos;t adequately address.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FaCloudSun,
                title: "Unpredictable Weather",
                description: "Farmers face increasingly erratic weather patterns and climate change impacts."
              },
              {
                icon: FaLeaf,
                title: "Pests & Diseases",
                description: "Limited access to timely information for identifying and treating crop issues."
              },
              {
                icon: FaUsers,
                title: "Limited Extension Support",
                description: "Scarce, locality-specific farming advice and few extension officers."
              },
              {
                icon: FaMobile,
                title: "Digital Divide",
                description: "Low literacy and little or no smartphone/internet penetration in rural areas."
              }
            ].map((item, index) => (
              <div key={index} className="feature-card bg-white p-8 rounded-xl shadow-md card-hover">
                <div className="text-green-600 text-4xl mb-6 bg-green-50 w-16 h-16 rounded-full flex items-center justify-center">
                  <item.icon />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center p-6 bg-white rounded-xl shadow-md max-w-2xl mx-auto">
            <p className="text-xl text-green-800 font-medium">
              Most ag-tech assumes literacy, connectivity, and smartphones. <span className="font-bold">Ayeeko does not.</span>
            </p>
          </div>
        </div>
      </section>
      
      <div className="section-divider transform rotate-180"></div>

      {/* Solution Section */}
      <section className="py-20 px-4 relative">
        <div className="decorative-circle w-64 h-64 -top-32 -right-32 opacity-5"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-6 section-title">The Solution</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Ayeeko is a full-stack, voice-first farm support system that fuses AI, low-cost sensors, and offline access to deliver real-time, personalized guidance.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 mt-12">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-10 rounded-2xl shadow-md card-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 rounded-bl-full opacity-50"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <div className="bg-white p-4 rounded-full shadow-md mr-4">
                    <FaMobile className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-800">Ayeeko Lite</h3>
                </div>
                <p className="text-green-800 mb-6 font-medium">For feature-phone users</p>
                <ul className="space-y-5">
                  {[
                    "Local-language voice calls",
                    "USSD menus",
                    "Weekly kiosk print-outs",
                    "GSM soil-weather sensors",
                    "Smart ID card"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                        <FaCheck className="text-green-600 flex-shrink-0" />
                      </div>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-10 rounded-2xl shadow-md card-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 rounded-bl-full opacity-50"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <div className="bg-white p-4 rounded-full shadow-md mr-4">
                    <FaMobile className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-800">Ayeeko Smart</h3>
                </div>
                <p className="text-green-800 mb-6 font-medium">For smartphone users</p>
                <ul className="space-y-5">
                  {[
                    "Offline PWA dashboard",
                    "WhatsApp voice & text bot",
                    "Photo-based disease diagnosis",
                    "Alerts & planning tools",
                    "Community board"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                        <FaCheck className="text-green-600 flex-shrink-0" />
                      </div>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="section-divider"></div>

      {/* Key Features */}
      <section className="py-20 px-4 bg-green-50 relative overflow-hidden">
        <div className="decorative-dots w-full h-full absolute inset-0"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-6 section-title">Key Features</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Ayeeko combines cutting-edge technology with practical, accessible solutions for farmers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FaMicrophone,
                title: "Ayeeko Bot",
                description: "IVR/WhatsApp voice assistant in local dialects"
              },
              {
                icon: FaCloudSun,
                title: "SmartFarm Sensors",
                description: "Solar GSM sticks (moisture, pH, temp, pest risk)"
              },
              {
                icon: FaBell,
                title: "Early-Warning AI",
                description: "Predicts disease, drought & pest threats"
              },
              {
                icon: FaLeaf,
                title: "Farm Profile",
                description: "Auto-kept records of crops, inputs, yields"
              },
              {
                icon: FaMobile,
                title: "Offline-First",
                description: "Works without data; syncs when connected"
              },
              {
                icon: FaUsers,
                title: "Kiosk Mode",
                description: "Solar station for reports, charging & helpdesk"
              },
              {
                icon: FaHandsHelping,
                title: "Agent Dashboard",
                description: "Extension officers see risk scores & act fast"
              }
            ].map((item, index) => (
              <div key={index} className="feature-card bg-white p-8 rounded-xl shadow-md card-hover">
                <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <item.icon className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <div className="section-divider transform rotate-180"></div>

      {/* Why We're Different */}
      <section className="py-20 px-4 relative">
        <div className="decorative-circle w-40 h-40 top-20 left-[5%] opacity-10"></div>
        <div className="decorative-circle w-40 h-40 bottom-20 right-[5%] opacity-10"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-6 section-title">Why We&apos;re Different</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Our approach is fundamentally different from traditional agricultural technology solutions.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-5 max-w-4xl mx-auto">
            {[
              {
                text: "Voice-first",
                color: "from-green-500 to-green-600"
              },
              {
                text: "Literacy-independent",
                color: "from-emerald-500 to-emerald-600"
              },
              {
                text: "Works on any phone",
                color: "from-teal-500 to-teal-600"
              },
              {
                text: "Sensor-integrated",
                color: "from-green-500 to-green-600"
              },
              {
                text: "Built local-first",
                color: "from-emerald-500 to-emerald-600"
              },
              {
                text: "Anchored in co-ops & youth ambassadors",
                color: "from-teal-500 to-teal-600"
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-r ${item.color} px-8 py-4 rounded-full text-white font-semibold shadow-md card-hover text-center`}
              >
                {item.text}
              </div>
            ))}
          </div>
          
          <div className="mt-16 p-8 bg-green-50 rounded-2xl shadow-md max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">Our Commitment</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              We believe that technology should adapt to farmers, not the other way around. By meeting farmers where they are—with the devices they already have and the languages they already speak—we&apos;re creating a truly inclusive agricultural support system.
            </p>
          </div>
        </div>
      </section>
      
      <div className="section-divider"></div>

      {/* Pilot Section */}
      <section className="py-20 px-4 bg-green-50 relative overflow-hidden">
        <div className="decorative-dots w-full h-full absolute inset-0"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-6 section-title">Pilot Program</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Our 90-day pilot program will demonstrate the impact of Ayeeko in real farming communities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FaUsers,
                title: "Location",
                value: "2 villages, Ghana"
              },
              {
                icon: FaLeaf,
                title: "Farmers",
                value: "15"
              },
              {
                icon: FaCloudSun,
                title: "Hardware",
                value: "5 SmartFarm sticks + 1 solar kiosk"
              },
              {
                icon: FaMoneyBillWave,
                title: "Budget",
                value: "US $1,725 start-up + US $225/mo ops"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md card-hover text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <item.icon className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-3">{item.title}</h3>
                <p className="text-gray-700 font-medium text-xl">{item.value}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-green-800 mb-6 text-center">Success Targets</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  value: "≥80%",
                  label: "weekly engagement"
                },
                {
                  value: "+10%",
                  label: "maize yield"
                },
                {
                  value: "<30s",
                  label: "advice latency"
                }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">{item.value}</div>
                  <div className="text-gray-700">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <div className="section-divider transform rotate-180"></div>

      {/* Roadmap */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Roadmap</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Micro-insurance & micro-finance add-ons",
                image: "/images/ayeeko/roadmap1.png"
              },
              {
                title: "More crops & dialects",
                image: "/images/ayeeko/roadmap2.png"
              },
              {
                title: "100+ kiosks across Ghana",
                image: "/images/ayeeko/roadmap3.png"
              },
              {
                title: "Ayeeko Youth Ambassador training network",
                image: "/images/ayeeko/ayeeko1.png"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="relative h-48 w-full">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-green-800">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Partners & Support Needed</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FaUniversity,
                title: "Ministries & Research Institutes",
                description: "Ministries of Agriculture & research institutes"
              },
              {
                icon: FaUniversity,
                title: "Universities",
                description: "Engineering & agricultural universities"
              },
              {
                icon: FaHandsHelping,
                title: "NGOs",
                description: "Food-security NGOs & development agencies"
              },
              {
                icon: FaHandsHelping,
                title: "Corporate Sponsors",
                description: "For sensors, kiosks & data credits"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-green-600 text-3xl mb-4">
                  <item.icon />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Involved Form Section */}
      <section id="get-involved" className="py-24 px-4 relative">
        <div className="decorative-circle w-96 h-96 -top-48 -left-48 opacity-5 animate-pulse"></div>
        <div className="decorative-circle w-96 h-96 -bottom-48 -right-48 opacity-5 animate-pulse"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-6 section-title">Get Involved</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Join us—volunteer, partner, or fund—to put a trusted, talking farm assistant in every field and let every farmer hear: &quot;Well done.&quot;
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <FaHandsHelping className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-green-800">Join the Ayeeko Movement</h3>
              <p className="text-gray-600 mt-2">Fill out the form below to get involved with our mission</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg form-input-focus bg-gray-50"
                    placeholder="Your first name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg form-input-focus bg-gray-50"
                    placeholder="Your last name"
                    required
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg form-input-focus bg-gray-50"
                    placeholder="Your email address"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg form-input-focus bg-gray-50"
                    placeholder="Your phone number"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="organization" className="block text-gray-700 font-medium mb-2">Organization (if applicable)</label>
                <input 
                  type="text" 
                  id="organization" 
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg form-input-focus bg-gray-50"
                  placeholder="Your organization name"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="role" className="block text-gray-700 font-medium mb-2">Your Role</label>
                  <input 
                    type="text" 
                    id="role" 
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg form-input-focus bg-gray-50"
                    placeholder="Your role or position"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="supportType" className="block text-gray-700 font-medium mb-2">How would you like to support?</label>
                  <select 
                    id="supportType" 
                    value={formData.supportType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg form-input-focus bg-gray-50"
                    required
                  >
                    <option value="">Select how you&apos;d like to help</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="partner">Partner Organization</option>
                    <option value="funder">Funder/Sponsor</option>
                    <option value="technical">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message (Optional)</label>
                <textarea 
                  id="message" 
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg form-input-focus bg-gray-50 min-h-[150px]"
                  placeholder="Tell us more about how you'd like to get involved"
                ></textarea>
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 btn-primary text-white rounded-lg font-semibold text-lg shadow-md flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : "Submit Application"}
                </button>
              </div>
              
              {formStatus.success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-6 flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <p>
                    {formStatus.message}
                  </p>
                </div>
              )}
              {formStatus.success === false && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6 flex items-start">
                  <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                  <p>
                    {formStatus.message}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Ayeeko Movement</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
              Together, we can revolutionize farming for those who need it most. Let&apos;s help every farmer hear: &quot;Well done.&quot;
          </p>
          <Link href="#get-involved" className="bg-white text-green-800 hover:bg-green-100 transition-colors px-8 py-3 rounded-full font-semibold text-lg shadow-lg inline-block">
            Get Involved Today
          </Link>
        </div>
      </section>
    </div>
  )
}

export default AyeekoPage
