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
import CropAdvisor from './components/CropAdvisor'

const FarmForwardPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    business: '',
    experience: '',
    interestedInGrant: false,
    grantAmount: ''
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
          experience: '',
          interestedInGrant: false,
          grantAmount: ''
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
              <h2 className="text-2xl text-green-100 mb-4 font-bold">
                Turn Your Farm Vision Into a Fundable Business – in Just 2 Saturdays
              </h2>
              <p className="text-xl text-green-100 mb-4">
                Build a smart, investor-ready agribusiness plan in record time.
              </p>
              <p className="text-lg text-green-100 mb-4">
                We are tired of talk shops. This will be hands-on and practical.
              </p>
              <p className="text-lg text-green-100 mb-8 font-semibold">
                This accelerator is for serious farmers ready to scale or people looking to start serious agribusinesses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="#signup"
                  className="px-8 py-4 bg-white text-green-800 rounded-full hover:bg-green-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  Reserve Your Seat
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
                src="/images/farm-smart.jpeg"
                alt="Farm Forward Agribusiness Accelerator"
                fill
                className="object-cover rounded-2xl"
                priority
              />
              <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <FaRegCalendarCheck className="text-2xl text-green-600" />
                  <div>
                    <div className="font-semibold text-green-800">Two Saturdays</div>
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

      {/* Overview Section */}
      <section id="overview" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block border-b-2 border-green-500 pb-2 mb-4">
              <h2 className="text-4xl font-bold text-gray-800">Only 30 seats available • Two Saturdays: 17 & 24 May 2025 • Accra</h2>
            </div>
          </div>
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">The Real Problem</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Most farmers are working hard, but not growing fast.
            </p>
            <div className="max-w-2xl mx-auto text-left">
              <p className="text-lg text-gray-700 mb-2">If you&apos;re struggling with:</p>
              <ul className="list-none space-y-2 mb-8">
                <li className="flex items-start">
                  <span className="text-lg mr-2">–</span>
                  <span>Rising costs eating into your profits</span>
                </li>
                <li className="flex items-start">
                  <span className="text-lg mr-2">–</span>
                  <span>Confusing certification processes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-lg mr-2">–</span>
                  <span>No clear plan to attract investors</span>
                </li>
              </ul>
              <p className="text-lg text-gray-700">You&apos;re not alone. But you can change that.</p>
            </div>
          </div>
          
          <div className="bg-green-50 p-8 rounded-2xl shadow-sm mb-12">
            <h3 className="text-2xl font-bold text-green-800 mb-6">The Solution: Farm Smart Accelerator</h3>
            <p className="text-lg text-gray-700 mb-6">
              In two weekends, you will:
            </p>
            <ul className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: FaCheck,
                  text: "Build a cash-flow model investors understand"
                },
                {
                  icon: FaCheck,
                  text: "Learn risk-mitigation strategies for your specific crops"
                },
                {
                  icon: FaCheck,
                  text: "Get a clear, simple roadmap for certifications"
                },
                {
                  icon: FaCheck,
                  text: "Practice pitching your business to actual funders"
                },
                {
                  icon: FaCheck,
                  text: "Join a driven community of serious agri-entrepreneurs"
                },
                {
                  icon: FaCheck,
                  text: "Apply for micro grants to support your farm or agribusiness growth"
                }
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
                  <div className="text-green-600 text-2xl mt-1">
                    <item.icon />
                  </div>
                  <p className="text-gray-700 font-medium">{item.text}</p>
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
            <h2 className="text-3xl font-bold text-green-800 mb-4">What You&apos;ll Walk Away With</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              By the end of the second Saturday, you&apos;ll have:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FaFileAlt,
                title: "A practical, investor-ready business plan",
                description: "You'll leave with a complete business plan that's ready to present to potential investors."
              },
              {
                icon: FaUserTie,
                title: "Your pitch reviewed by real mentors",
                description: "Get valuable feedback from experienced mentors who know what investors are looking for."
              },
              {
                icon: FaRegCalendarCheck,
                title: "A step-by-step guide to land and food certifications",
                description: "Navigate the certification process with confidence using our clear roadmap."
              },
              {
                icon: FaMoneyBillWave,
                title: "Access to grant application support",
                description: "Learn how to apply for funding opportunities to support your agribusiness growth."
              },
              {
                icon: FaUsers,
                title: "A support network to help you move faster, smarter",
                description: "Connect with fellow agri-entrepreneurs and industry experts who can help accelerate your success."
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
          
          <div className="mt-16 bg-green-800 text-white p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4 text-center">We Stand by This Promise</h3>
            <p className="text-lg text-center mb-4">
              If you&apos;re not pitch-ready by the end of Day 2, you&apos;ll get a free pass to the next cohort and 50% of your fee back.
            </p>
            <p className="text-lg text-center">
              No questions asked. We&apos;re here to help you win.
            </p>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-green-800 to-emerald-900 text-white p-10 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-600/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-600/20 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative">
              <h2 className="text-3xl font-bold mb-6">Details That Matter</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">📍</div>
                    <span className="text-xl font-bold">Location:</span>
                  </div>
                  <p className="text-lg ml-10">Enterprise Village, Accra</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">📅</div>
                    <span className="text-xl font-bold">Dates:</span>
                  </div>
                  <p className="text-lg ml-10">Saturdays, 17 & 24 May 2025</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">💰</div>
                    <span className="text-xl font-bold">Fee:</span>
                  </div>
                  <p className="text-lg ml-10">₵800</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">→</div>
                    <span className="text-xl font-bold">Early Bird:</span>
                  </div>
                  <p className="text-lg ml-10">Register before 10th May and pay only ₵400</p>
                </div>
              </div>
              
              <div className="bg-white/10 p-5 rounded-xl">
                <p className="text-lg">Spots fill quickly. 18 remaining. Don&apos;t miss out.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sign Up Section */}
      <section id="signup" className="py-16 px-4 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Reserve Your Seat</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Turn your farm vision into a fundable business – in just 2 Saturdays. Limited spots available!
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
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="interestedInGrant"
                      checked={formData.interestedInGrant}
                      onChange={(e) => {
                        const { checked } = e.target
                        setFormData(prev => ({ ...prev, interestedInGrant: checked }))
                      }}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="interestedInGrant" className="ml-2 block text-gray-700">
                      I&apos;m interested in applying for a micro grant
                    </label>
                  </div>
                </div>
                
                {formData.interestedInGrant && (
                  <div>
                    <label htmlFor="grantAmount" className="block text-gray-700 mb-2">How much funding do you need? (₵)</label>
                    <input 
                      type="text" 
                      id="grantAmount" 
                      value={formData.grantAmount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter amount in Ghana Cedis"
                    />
                  </div>
                )}
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

      {/* AI Crop Advisor */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
              AI-powered
            </span>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Ask our AI Crop Advisor</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              Expert agronomic guidance for African farmers — crops, diseases, soil, markets. Free. Instant.
            </p>
          </div>
          <CropAdvisor />
        </div>
      </section>
    </div>
  )
}

export default FarmForwardPage
