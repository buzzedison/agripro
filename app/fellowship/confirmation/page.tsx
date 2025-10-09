import Link from 'next/link'
import { FaCheckCircle, FaCalendarAlt, FaEnvelope, FaArrowRight } from 'react-icons/fa'

export default function FellowshipConfirmation() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <FaCheckCircle className="text-4xl text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-green-800 mb-4">Application Submitted!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for applying to the Agripro Fellowship Track. Your application has been received and we&apos;re excited to review it.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6">What Happens Next?</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Application Review</h3>
                <p className="text-gray-600">
                  Our team will carefully review your application, essays, and video introduction. 
                  We&apos;ll also reach out to your references if you advance to the next stage.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Virtual Assessment</h3>
                <p className="text-gray-600 mb-2">
                  <strong>October 27-30, 2025:</strong> Selected candidates will be invited to participate in virtual assessments
                  including case studies and group tasks focused on real agribusiness scenarios.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Final Interview & Placement Matching</h3>
                <p className="text-gray-600">
                  Finalists will have interviews with our team and partner organizations to ensure 
                  the best placement match for your skills and interests.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Decision Notification</h3>
                <p className="text-gray-600 mb-2">
                  <strong>October 31, 2025:</strong> Final decisions will be communicated to all applicants.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                5
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Program Launch</h3>
                <p className="text-gray-600 mb-2">
                  <strong>November 3, 2025:</strong> The fellowship program begins with the intensive launchpad phase.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center mb-4">
              <FaEnvelope className="text-green-600 text-xl mr-3" />
              <h3 className="text-lg font-semibold text-green-800">Check Your Email</h3>
            </div>
            <p className="text-gray-700 text-sm">
              We&apos;ve sent a confirmation email with your application details and timeline. 
              Please check your spam folder if you don&apos;t see it in your inbox.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center mb-4">
              <FaCalendarAlt className="text-blue-600 text-xl mr-3" />
              <h3 className="text-lg font-semibold text-blue-800">Key Dates</h3>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><strong>Oct 24:</strong> Application deadline</li>
              <li><strong>Oct 27-30:</strong> Assessments</li>
              <li><strong>Oct 31:</strong> Final decisions</li>
              <li><strong>Nov 3:</strong> Program lunch</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">While You Wait...</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-lg mb-4 inline-block">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Explore the Knowledge Hub</h3>
              <p className="text-sm text-gray-600 mb-4">
                Learn more about African agriculture and build relevant knowledge.
              </p>
              <Link href="/knowledgehub" className="text-green-600 hover:text-green-700 font-medium text-sm">
                Visit Knowledge Hub →
              </Link>
            </div>

            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-lg mb-4 inline-block">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Connect with the Community</h3>
              <p className="text-sm text-gray-600 mb-4">
                Join our agricultural community and start networking early.
              </p>
              <Link href="/clubs" className="text-green-600 hover:text-green-700 font-medium text-sm">
                Join Clubs →
              </Link>
            </div>

            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-lg mb-4 inline-block">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Practice with Tools</h3>
              <p className="text-sm text-gray-600 mb-4">
                Try our ROI calculator and market analyzer to build relevant skills.
              </p>
              <Link href="/knowledgehub/resources" className="text-green-600 hover:text-green-700 font-medium text-sm">
                Explore Tools →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Questions About Your Application?</h2>
          <p className="text-green-100 mb-6">
            Our team is here to help! Reach out if you have any questions about the process or need to update your application.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="mailto:fellowship@agriprohub.com"
              className="inline-flex items-center px-6 py-3 bg-white text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors"
            >
              <FaEnvelope className="mr-2" />
              Email Us
            </Link>
            <Link 
              href="/fellowship"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-green-700 transition-colors"
            >
              Back to Fellowship Info
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
