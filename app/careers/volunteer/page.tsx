import Link from 'next/link'
import { FaLeaf, FaChalkboardTeacher, FaHandsHelping, FaCamera } from 'react-icons/fa'

export default function VolunteerOpportunities() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-4xl font-bold text-green-800 mb-6">
            Volunteer Opportunities
          </h1>

          <div className="prose prose-green max-w-none">
            <p className="text-xl text-gray-600 mb-8">
              Join our community of volunteers and help us make a difference in African agriculture. We have various opportunities available for passionate individuals.
            </p>

            {/* Available Positions */}
            <div className="space-y-8 mb-12">
              {/* Green Market Support */}
              <div className="border border-green-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FaLeaf className="text-2xl text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-800 m-0">Green Market Support</h2>
                </div>
                <div className="flex flex-wrap gap-4 mb-4">
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                    Flexible Hours
                  </span>
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                    Accra
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Help organize and run our monthly Green Market events. Perfect for those interested in event management and sustainable agriculture.
                </p>
                <h3 className="text-lg font-semibold mb-2">Responsibilities:</h3>
                <ul className="list-disc pl-5 mb-4">
                  <li>Assist with vendor coordination</li>
                  <li>Help with event setup and breakdown</li>
                  <li>Support visitor engagement activities</li>
                  <li>Assist with social media coverage</li>
                </ul>
              </div>

              {/* Agricultural Education */}
              <div className="border border-green-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FaChalkboardTeacher className="text-2xl text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-800 m-0">Agricultural Education</h2>
                </div>
                <div className="flex flex-wrap gap-4 mb-4">
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                    Part-time
                  </span>
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                    Various Locations
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Support our educational initiatives by helping teach sustainable farming practices to local communities.
                </p>
                <h3 className="text-lg font-semibold mb-2">Responsibilities:</h3>
                <ul className="list-disc pl-5 mb-4">
                  <li>Assist in workshop facilitation</li>
                  <li>Help develop educational materials</li>
                  <li>Support community outreach programs</li>
                  <li>Document learning outcomes</li>
                </ul>
              </div>

              {/* Content Creation */}
              <div className="border border-green-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FaCamera className="text-2xl text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-800 m-0">Content Creation</h2>
                </div>
                <div className="flex flex-wrap gap-4 mb-4">
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                    Remote Possible
                  </span>
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                    Project-based
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Help create engaging content about sustainable agriculture and our initiatives for social media and website.
                </p>
                <h3 className="text-lg font-semibold mb-2">Responsibilities:</h3>
                <ul className="list-disc pl-5 mb-4">
                  <li>Create photo and video content</li>
                  <li>Write blog posts and articles</li>
                  <li>Design social media graphics</li>
                  <li>Help maintain our online presence</li>
                </ul>
              </div>
            </div>

            {/* General Requirements */}
            <h2>General Requirements</h2>
            <ul>
              <li>Passion for sustainable agriculture and community development</li>
              <li>Strong communication skills</li>
              <li>Ability to commit to at least 3 months</li>
              <li>Team player with a positive attitude</li>
              <li>Previous volunteer experience is a plus</li>
            </ul>

            {/* Benefits */}
            <h2>What You Will Gain</h2>
            <ul>
              <li>Valuable experience in the agricultural sector</li>
              <li>Certificate of volunteering</li>
              <li>Networking opportunities</li>
              <li>Training and skill development</li>
              <li>Reference letter upon completion</li>
              <li>Transport allowance for on-site activities</li>
            </ul>

            {/* How to Apply */}
            <h2>How to Apply</h2>
            <p>
              Please send an email to volunteer@agriprohub.com with:
            </p>
            <ul>
              <li>Your CV</li>
              <li>A brief letter explaining which role interests you and why</li>
              <li>Your available time commitment</li>
              <li>Any relevant experience or skills</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link 
              href="mailto:volunteers@agriprohub.com?subject=Volunteer%20Application"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              Apply Now
            </Link>
            <Link 
              href="/careers"
              className="inline-flex items-center px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-full hover:bg-green-50 transition-colors"
            >
              Back to Careers
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 