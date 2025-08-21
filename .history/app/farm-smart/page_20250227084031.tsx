'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { 
  FaSeedling, 
  FaChartLine, 
  FaShieldAlt, 
  FaMoneyBillWave, 
  FaFileAlt, 
  FaHandshake, 
  FaUsers, 
  FaUserTie, 
  FaRegCalendarCheck,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa'
import { submitFarmSmartForm } from './actions'

const FarmForwardPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    business: '',
    experience: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormStatus({})

    try {
      const result = await submitFarmSmartForm(formData)
      
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
          business: '',
          experience: ''
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
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
                <span className="text-green-100">Agribusiness Accelerator</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                  FARM SMART
                </span>
              </h1>
              <p className="text-2xl text-green-100 mb-4">
                AGRIBUSINESS PLANNING TRAINING
              </p>
              <p className="text-xl text-green-100 mb-8 max-w-xl">
                Enhance your Agribusiness skills: build the requisite skills and network needed to succeed in Agribusiness in just one month
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="#signup"
                  className="px-8 py-4 bg-white text-green-800 rounded-full hover:bg-green-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  Sign Up Now
                </Link>
                <Link 
                  href="#overview"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white/10 transition-all duration-300 font-semibold"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative lg:h-[600px] w-full hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl backdrop-blur-sm"></div>
              <Image
                src="/images/farm.jpeg"
                alt="Farm Forward Agribusiness Accelerator"
                fill
                className="object-cover rounded-2xl"
                priority
              />
              <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <FaRegCalendarCheck className="text-2xl text-green-600" />
                  <div>
                    <div className="font-semibold text-green-800">1-Month Program</div>
                    <div className="text-sm text-green-600">Intensive Training</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <FaHandshake className="text-2xl text-green-600" />
                  <div>
                    <div className="font-semibold text-green-800">Investor Ready</div>
                    <div className="text-sm text-green-600">Meet Industry Leaders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Overview Section */}
      <section id="overview" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Program Overview</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              This is not just another conference or over hyped event. The Agribusiness Planning Training is an innovative and interactive program specially designed for individuals at various stages on the Agribusiness ladder.
            </p>
          </div>
          
          <div className="bg-green-50 p-8 rounded-2xl shadow-sm mb-12">
            <h3 className="text-2xl font-bold text-green-800 mb-6">Who Should Attend?</h3>
            <p className="text-lg text-gray-700 mb-6">
              This program is designed for individuals who desire to:
            </p>
            <ul className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: FaSeedling,
                  text: "Gain more insight into what really works in Agribusiness"
                },
                {
                  icon: FaUsers,
                  text: "Gain practical knowledge from insightful people on how to move beyond the status quo"
                },
                {
                  icon: FaHandshake,
                  text: "Network with crucial people for the advancement of their Agribusiness enterprise"
                }
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
                  <div className="text-green-600 text-2xl mt-1">
                    <item.icon />
                  </div>
                  <p className="text-gray-700">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What You Will Gain Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">What You Will Gain</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our comprehensive program equips you with essential skills and connections to thrive in the agribusiness sector.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: FaShieldAlt,
                title: "Masterful knowledge in Risk Assessment for Five Major Food Crops",
                description: "Our risk assessment training will help you acquire insight on the risks you are likely to have as an agripreneur, how to anticipate those risks and proven mitigation strategies to overcome them."
              },
              {
                icon: FaMoneyBillWave,
                title: "Financial Modeling for your Agribusiness Enterprise",
                description: "Our training will provide with the knowledge and tools necessary to build a practical financial model for your business, providing an in-depth guide on projected costs and profits."
              },
              {
                icon: FaFileAlt,
                title: "Expert advice on FDA and Land Rights Certifications",
                description: "The interactive session with personnel from the FDA and Land Rights institutions will shed light on the processes involved in acquiring the necessary certifications that most investors look out for."
              },
              {
                icon: FaUserTie,
                title: "Attract Investors",
                description: "You will get to meet and hear from influential industry players and investors on how to pitch your business to investors."
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-4 rounded-full text-green-600 text-2xl">
                    <benefit.icon />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 mb-3">{benefit.title}</h3>
                    <p className="text-gray-700">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-green-800 to-emerald-900 text-white p-10 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-600/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-600/20 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative">
              <h2 className="text-3xl font-bold mb-6">Is This For You?</h2>
              <p className="text-xl mb-8">
                If you meet the following criteria, then you are eligible:
              </p>
              
              <ul className="space-y-4">
                {[
                  "Upcoming farmer, agripreneur, agribusiness personnel eager to build a successful career",
                  "Experienced farmers, agripreneurs, agribusiness personnel eager to fine-tune their skills",
                  "Anyone who is passionate making a change in agriculture and agribusiness"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <FaChartLine className="text-green-300" />
                    </div>
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sign Up Section */}
      <section id="signup" className="py-16 px-4 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Join Farm Forward Today</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Take the first step toward transforming your agribusiness career. Limited spots available!
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Your last name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Your email address"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Your phone number"
                />
              </div>
              
              <div>
                <label htmlFor="business" className="block text-gray-700 mb-2">Agribusiness Type/Interest</label>
                <input 
                  type="text" 
                  id="business" 
                  value={formData.business}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe your agribusiness or interest"
                />
              </div>
              
              <div>
                <label htmlFor="experience" className="block text-gray-700 mb-2">Experience Level</label>
                <select 
                  id="experience" 
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select your experience level</option>
                  <option value="beginner">Beginner (0-2 years)</option>
                  <option value="intermediate">Intermediate (2-5 years)</option>
                  <option value="experienced">Experienced (5+ years)</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold text-lg shadow-md"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
              
              {formStatus.success && (
                <p className="text-sm text-green-600 text-center mt-4">
                  {formStatus.message}
                </p>
              )}
              {formStatus.success === false && (
                <p className="text-sm text-red-600 text-center mt-4">
                  {formStatus.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FarmForwardPage
