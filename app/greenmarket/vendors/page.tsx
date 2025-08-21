'use client'

import { useFormState } from 'react-dom'
import { submitVendorForm } from './actions'

export default function VendorRegistration() {
  const [state, formAction] = useFormState(
    async (prevState: any, formData: FormData) => {
      const data = {
        businessName: formData.get('businessName')?.toString() || '',
        ownerName: formData.get('ownerName')?.toString() || '',
        email: formData.get('email')?.toString() || '',
        phone: formData.get('phone')?.toString() || '',
        businessType: formData.get('businessType')?.toString() || '',
        productDescription: formData.get('productDescription')?.toString() || '',
        sustainabilityPractices: formData.get('sustainabilityPractices')?.toString() || '',
        boothPreference: formData.get('boothPreference')?.toString() || '',
      }
      return await submitVendorForm(data)
    },
    null
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
            Become a Green Market Vendor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join us in promoting sustainable products and practices at the Accra Green Market. Complete the form below to apply for a vendor spot.
          </p>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <form action={formAction} className="space-y-6">
            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="businessName">
                  Business Name*
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ownerName">
                  Owner&apos;s Name*
                </label>
                <input
                  id="ownerName"
                  name="ownerName"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email Address*
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your phone number"
                />
              </div>
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="businessType">
                Business Type*
              </label>
              <select
                id="businessType"
                name="businessType"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select your business type</option>
                <option value="organic-farm">Organic Farm</option>
                <option value="eco-products">Eco-Friendly Products</option>
                <option value="sustainable-fashion">Sustainable Fashion</option>
                <option value="green-tech">Green Technology</option>
                <option value="food-beverage">Food & Beverage</option>
                <option value="wellness">Health & Wellness</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="productDescription">
                Product/Service Description*
              </label>
              <textarea
                id="productDescription"
                name="productDescription"
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe your products or services"
              />
            </div>

            {/* Sustainability Practices */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sustainabilityPractices">
                Sustainability Practices
              </label>
              <textarea
                id="sustainabilityPractices"
                name="sustainabilityPractices"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe your sustainability practices and commitments"
              />
            </div>

            {/* Booth Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="boothPreference">
                Booth Preference*
              </label>
              <select
                id="boothPreference"
                name="boothPreference"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select booth type</option>
                <option value="small">Small Table (2 chairs) - GHS 200</option>
                <option value="large">Big Table (3 chairs) - GHS 350</option>
                <option value="advert">Advertisement Only (No products/flyers) - GHS 100</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                All booths include basic setup. Advertisement option allows business listing in our directory without physical presence.
              </p>
            </div>

            {state?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{state.error}</p>
              </div>
            )}
            {state?.success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">{state.message}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 