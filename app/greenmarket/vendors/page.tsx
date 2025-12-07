'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { submitVendorForm } from './actions'
import {
  FaStore,
  FaCheckCircle,
  FaArrowLeft,
  FaShieldAlt,
  FaUsers,
  FaChartLine,
  FaLeaf
} from 'react-icons/fa'

const benefits = [
  {
    icon: FaShieldAlt,
    title: 'Verified Status',
    description: 'Get a verification badge that builds trust with buyers'
  },
  {
    icon: FaUsers,
    title: 'Pan-African Reach',
    description: 'Connect with buyers across the African continent'
  },
  {
    icon: FaChartLine,
    title: 'Grow Your Business',
    description: 'Expand your market reach and increase sales'
  },
  {
    icon: FaLeaf,
    title: 'Join the Movement',
    description: 'Be part of Africa\'s sustainable trade community'
  },
]

const businessTypes = [
  { value: 'fresh-produce', label: 'Fresh Produce (Fruits, Vegetables, Herbs)' },
  { value: 'livestock', label: 'Livestock & Poultry' },
  { value: 'grains', label: 'Grains & Cereals' },
  { value: 'processed-foods', label: 'Processed Foods & Packaged Goods' },
  { value: 'dairy', label: 'Dairy Products' },
  { value: 'aquaculture', label: 'Fish & Aquaculture' },
  { value: 'eco-products', label: 'Eco-Friendly Products' },
  { value: 'farm-equipment', label: 'Farm Equipment & Tools' },
  { value: 'seeds', label: 'Seeds & Seedlings' },
  { value: 'agro-services', label: 'Agricultural Services' },
  { value: 'other', label: 'Other' },
]

export default function VendorRegistration() {
  const [state, formAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      const data = {
        businessName: formData.get('businessName')?.toString() || '',
        ownerName: formData.get('ownerName')?.toString() || '',
        email: formData.get('email')?.toString() || '',
        phone: formData.get('phone')?.toString() || '',
        businessType: formData.get('businessType')?.toString() || '',
        productDescription: formData.get('productDescription')?.toString() || '',
        sustainabilityPractices: formData.get('sustainabilityPractices')?.toString() || '',
        country: formData.get('country')?.toString() || 'Ghana',
        region: formData.get('region')?.toString() || '',
        city: formData.get('city')?.toString() || '',
        website: formData.get('website')?.toString() || '',
      }
      return await submitVendorForm(data)
    },
    null
  )

  if (state?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Application Submitted!
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              {state.message}
            </p>
            {state.applicationId && (
              <p className="text-sm text-gray-500 mb-8">
                Your application ID: <span className="font-mono font-bold">{state.applicationId}</span>
              </p>
            )}
            <div className="bg-green-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-green-900 mb-3">What happens next?</h3>
              <ol className="text-left text-green-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  Our team will review your application within 2-3 business days
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  We may reach out for additional information if needed
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  Once approved, your business will appear in our marketplace
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  You&apos;ll receive your verified vendor badge
                </li>
              </ol>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/greenmarket/marketplace"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Browse Marketplace
              </Link>
              <Link
                href="/greenmarket"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Green Market
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link
            href="/greenmarket"
            className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-6 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Green Market
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sell Across Africa
            </h1>
            <p className="text-xl text-green-100">
              Join Africa&apos;s marketplace for agricultural products. Connect with buyers
              across the continent. Free to join - no fees!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Benefits Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Why Join Us?</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-100">
                <h3 className="font-semibold text-green-900 mb-2">Free to Join!</h3>
                <p className="text-sm text-green-800">
                  There are no fees to become a seller. We&apos;re building Africa&apos;s
                  largest agricultural marketplace together.
                </p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FaStore className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Vendor Application</h2>
                  <p className="text-sm text-gray-600">Fill in your details to get started</p>
                </div>
              </div>

              <form action={formAction} className="space-y-6">
                {/* Business Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="businessName">
                        Business Name*
                      </label>
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Your business or farm name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ownerName">
                        Your Name*
                      </label>
                      <input
                        id="ownerName"
                        name="ownerName"
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                        Email Address*
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                        Phone Number*
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0XX XXX XXXX"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="website">
                      Website (optional)
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="country">
                        Country
                      </label>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        defaultValue="Ghana"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="region">
                        Region
                      </label>
                      <input
                        id="region"
                        name="region"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g. Greater Accra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
                        City/Town
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g. Accra"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What do you sell?</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="businessType">
                      Business Category*
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select your category</option>
                      {businessTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="productDescription">
                      Describe your products or services*
                    </label>
                    <textarea
                      id="productDescription"
                      name="productDescription"
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tell buyers what you offer. What makes your products special? Include details about quality, variety, pricing, etc."
                    />
                  </div>
                </div>

                {/* Sustainability */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sustainability (Optional)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Tell us about any eco-friendly or sustainable practices you follow. This helps buyers who care about sustainability find you.
                  </p>
                  <textarea
                    id="sustainabilityPractices"
                    name="sustainabilityPractices"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g. Organic farming, minimal packaging, local sourcing, water conservation..."
                  />
                </div>

                {state?.error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600">{state.error}</p>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    <FaStore className="w-5 h-5" />
                    Submit Application
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    By submitting, you agree to our terms of service and privacy policy.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}