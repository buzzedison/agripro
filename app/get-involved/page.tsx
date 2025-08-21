'use client'

import React from 'react'
import { useFormState } from 'react-dom'
import { submitForm, FormType } from './actions'

export default function GetInvolved() {
  // Work form state handler
  const [workState, workAction] = useFormState(
    async (prevState: any, formData: FormData) => {
      const formValues = {
        type: 'work' as FormType,
        data: {
          firstName: formData.get('firstName')?.toString() || '',
          lastName: formData.get('lastName')?.toString() || '',
          email: formData.get('email')?.toString() || '',
          areaOfInterest: formData.get('areaOfInterest')?.toString() || '',
          cvLink: formData.get('cvLink')?.toString() || '',
          linkedin: formData.get('linkedin')?.toString() || '',
        }
      }
      return await submitForm(formValues)
    },
    null
  )

  // Expert form state handler
  const [expertState, expertAction] = useFormState(
    async (prevState: any, formData: FormData) => {
      const formValues = {
        type: 'expert' as FormType,
        data: {
          firstName: formData.get('firstName')?.toString() || '',
          lastName: formData.get('lastName')?.toString() || '',
          email: formData.get('email')?.toString() || '',
          expertise: formData.get('expertise')?.toString() || '',
          linkedin: formData.get('linkedin')?.toString() || '',
        }
      }
      return await submitForm(formValues)
    },
    null
  )

  // Partner form state handler
  const [partnerState, partnerAction] = useFormState(
    async (prevState: any, formData: FormData) => {
      const formValues = {
        type: 'partner' as FormType,
        data: {
          organization: formData.get('organization')?.toString() || '',
          firstName: formData.get('firstName')?.toString() || '',
          lastName: formData.get('lastName')?.toString() || '',
          email: formData.get('email')?.toString() || '',
          partnershipType: formData.get('partnershipType')?.toString() || '',
        }
      }
      return await submitForm(formValues)
    },
    null
  )

  // Newsletter form state handler
  const [newsletterState, newsletterAction] = useFormState(
    async (prevState: any, formData: FormData) => {
      const formValues = {
        type: 'newsletter' as FormType,
        data: {
          email: formData.get('email')?.toString() || '',
          interests: formData.get('interests')?.toString() || '',
        }
      }
      return await submitForm(formValues)
    },
    null
  )

  // Donation form state handler
  const [donationState, donationAction] = useFormState(
    async (prevState: any, formData: FormData) => {
      const formValues = {
        type: 'donation' as FormType,
        data: {
          firstName: formData.get('firstName')?.toString() || '',
          lastName: formData.get('lastName')?.toString() || '',
          email: formData.get('email')?.toString() || '',
          amount: formData.get('amount')?.toString() || '',
          purpose: formData.get('purpose')?.toString() || '',
        }
      }
      return await submitForm(formValues)
    },
    null
  )

  // Volunteer form state handler (existing code)
  const [volunteerState, volunteerAction] = useFormState(
    async (prevState: any, formData: FormData) => {
      const formValues = {
        type: 'volunteer' as FormType,
        data: {
          firstName: formData.get('firstName')?.toString() || '',
          lastName: formData.get('lastName')?.toString() || '',
          email: formData.get('email')?.toString() || '',
          linkedin: formData.get('linkedin')?.toString() || '',
          volunteerType: formData.get('volunteerType')?.toString() || '',
          availability: formData.get('availability')?.toString() || '',
          location: formData.get('location')?.toString() || '',
        }
      }
      return await submitForm(formValues)
    },
    null
  )

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get Involved in African Agriculture
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Join our community of farmers, experts, and stakeholders working together to transform African agriculture.
            </p>
          </div>
        </div>
      </div>

      {/* Involvement Options */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Expert Registration Form */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-4">Register as an Expert</h2>
            <form action={expertAction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area of Expertise
                </label>
                <select
                  name="expertise"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select your expertise</option>
                  <option value="crop-science">Crop Science</option>
                  <option value="livestock">Livestock Management</option>
                  <option value="agtech">AgTech</option>
                  <option value="economics">Agricultural Economics</option>
                  <option value="soil-science">Soil Science</option>
                  <option value="irrigation">Irrigation Systems</option>
                  <option value="sustainable-farming">Sustainable Farming</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Profile
                </label>
                <input
                  name="linkedin"
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              {expertState?.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{expertState.error}</p>
                </div>
              )}
              {expertState?.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">{expertState.message}</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Register as Expert
              </button>
            </form>
          </div>

          {/* Partnership Form */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-4">Partner with Us</h2>
            <form action={partnerAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  name="organization"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter organization name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Contact first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Contact last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter contact email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partnership Type
                </label>
                <select
                  name="partnershipType"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select partnership type</option>
                  <option value="research">Research Collaboration</option>
                  <option value="funding">Funding Partner</option>
                  <option value="technology">Technology Provider</option>
                  <option value="distribution">Distribution Partner</option>
                  <option value="knowledge">Knowledge Partner</option>
                  <option value="implementation">Implementation Partner</option>
                </select>
              </div>
              {partnerState?.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{partnerState.error}</p>
                </div>
              )}
              {partnerState?.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">{partnerState.message}</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Partnership Request
              </button>
            </form>
          </div>

          {/* Newsletter Form */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <form action={newsletterAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Areas of Interest
                </label>
                <select
                  name="interests"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select your interests</option>
                  <option value="market-updates">Market Updates</option>
                  <option value="best-practices">Best Practices</option>
                  <option value="technology">Agricultural Technology</option>
                  <option value="events">Events & Webinars</option>
                  <option value="research">Research & Innovation</option>
                  <option value="policy">Policy Updates</option>
                  <option value="funding">Funding Opportunities</option>
                </select>
              </div>
              {newsletterState?.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{newsletterState.error}</p>
                </div>
              )}
              {newsletterState?.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">{newsletterState.message}</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Subscribe to Newsletter
              </button>
            </form>
          </div>

          {/* Donations Section */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-4">Make a Donation</h2>
            <p className="text-gray-600 mb-6">
              Support African agriculture through financial contributions to our various initiatives.
            </p>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donation Amount
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Select amount</option>
                  <option value="50">$50</option>
                  <option value="100">$100</option>
                  <option value="250">$250</option>
                  <option value="500">$500</option>
                  <option value="custom">Custom Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donation Purpose
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Select purpose</option>
                  <option value="farmer-support">Farmer Support Programs</option>
                  <option value="research">Agricultural Research</option>
                  <option value="education">Farmer Education</option>
                  <option value="technology">Technology Access</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Proceed to Donate
              </button>
            </form>
          </div>

          {/* Work With Us Section */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-4">Work With Us</h2>
            <p className="text-gray-600 mb-6">
              Join our team and contribute to transforming African agriculture through various career opportunities.
            </p>
            <form action={workAction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area of Interest
                </label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select area</option>
                  <option value="agronomy">Agronomy</option>
                  <option value="research">Research & Development</option>
                  <option value="technology">Agricultural Technology</option>
                  <option value="business">Business Development</option>
                  <option value="operations">Operations</option>
                  <option value="marketing">Marketing & Communications</option>
                  <option value="finance">Finance & Investment</option>
                  <option value="project-management">Project Management</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CV/Resume Link
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://drive.google.com/... or similar"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Share a link to your CV (Google Drive, Dropbox, etc.)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              {workState?.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{workState.error}</p>
                </div>
              )}
              {workState?.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">{workState.message}</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Application
              </button>
            </form>
          </div>

          {/* Volunteer Section */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-4">Volunteer With Us</h2>
            <p className="text-gray-600 mb-6">
              Make a difference by volunteering your time and skills to support African farmers.
            </p>
            <form action={volunteerAction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="linkedin">
                  LinkedIn Profile
                </label>
                <input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="volunteerType">
                  Volunteer Type
                </label>
                <select
                  id="volunteerType"
                  name="volunteerType"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="field-work">Field Work</option>
                  <option value="training">Farmer Training</option>
                  <option value="research">Research Assistant</option>
                  <option value="events">Events & Programs</option>
                  <option value="technical">Technical Support</option>
                  <option value="community">Community Outreach</option>
                  <option value="mentoring">Farmer Mentoring</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="availability">
                  Availability
                </label>
                <select
                  id="availability"
                  name="availability"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select availability</option>
                  <option value="part-time">Part-time</option>
                  <option value="full-time">Full-time</option>
                  <option value="weekends">Weekends Only</option>
                  <option value="flexible">Flexible Hours</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                  Location Preference
                </label>
                <select
                  id="location"
                  name="location"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select location</option>
                  <option value="remote">Remote</option>
                  <option value="local">Local Community</option>
                  <option value="regional">Regional</option>
                  <option value="international">International</option>
                </select>
              </div>

              {volunteerState?.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{volunteerState.error}</p>
                </div>
              )}
              {volunteerState?.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">{volunteerState.message}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Apply to Volunteer
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
} 