'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaEnvelope, FaSpinner, FaCheckCircle } from 'react-icons/fa'
import { submitWaitlistSignup } from '../actions'

export default function FellowshipWaitlist() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    graduationYear: '',
    interests: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const result = await submitWaitlistSignup(formData)
      setSubmitStatus(result)
      
      if (result.success) {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          graduationYear: '',
          interests: ''
        })
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'An error occurred. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">Join the Waitlist</h1>
          <p className="text-xl text-gray-600">
            Be the first to know about future Agripro Fellowship opportunities and updates
          </p>
          
          <div className="mt-8">
            <Link href="/fellowship" className="text-green-600 hover:text-green-700">
              ← Back to Fellowship Overview
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-100 p-6 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Early Access</h3>
            <p className="text-gray-700 text-sm">
              Get notified when applications open for the next cohort, plus access to exclusive prep materials.
            </p>
          </div>
          
          <div className="bg-blue-100 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Future Cohorts</h3>
            <p className="text-gray-700 text-sm">
              We plan to run 2 fellowship cohorts per year. Stay updated on all upcoming opportunities.
            </p>
          </div>
        </div>

        {/* Waitlist Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center mb-6">
            <FaEnvelope className="text-green-600 text-2xl mr-3" />
            <h2 className="text-2xl font-bold text-green-800">Join the Waitlist</h2>
          </div>

          {submitStatus.success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">You&apos;re on the list!</h3>
              <p className="text-gray-600 mb-6">
                We&apos;ll notify you about future fellowship opportunities and send you exclusive prep materials.
              </p>
              <Link 
                href="/fellowship"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Back to Fellowship Info
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Graduation Year</label>
                <select
                  value={formData.graduationYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select year</option>
                  <option value="2023">2023 (Recent Graduate)</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What interests you most about agricultural development?
                </label>
                <textarea
                  rows={4}
                  value={formData.interests}
                  onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                  placeholder="Tell us about your interests in agriculture, technology, or development..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {submitStatus.message && !submitStatus.success && (
                <div className="p-4 bg-red-100 text-red-800 rounded-lg">
                  {submitStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Joining waitlist...
                  </>
                ) : (
                  'Join Waitlist'
                )}
              </button>

              <p className="text-sm text-gray-600 text-center">
                We respect your privacy and will only send updates about the fellowship program.
              </p>
            </form>
          )}
        </div>

        {/* Additional Info */}
        {!submitStatus.success && (
          <div className="mt-8 bg-green-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-3">What to Expect</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Fellowship application opening announcements</li>
              <li>• Prep materials and skill-building resources</li>
              <li>• Information about partner organizations and placements</li>
              <li>• Updates on program curriculum and requirements</li>
              <li>• Exclusive webinars and Q&A sessions</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
