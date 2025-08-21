import Link from 'next/link'

export default function ProjectManagementIntern() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-4xl font-bold text-green-800 mb-6">
            Project Management Intern (Paid)
          </h1>

          <div className="flex flex-wrap gap-4 mb-8">
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
              Full-time
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
              Accra, Ghana
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
              6 months
            </span>
          </div>

          <div className="prose prose-green max-w-none">
            <h2>About the Role</h2>
            <p>
              We are looking for a motivated Project Management Intern to join our team and assist in coordinating various agricultural initiatives. This is an excellent opportunity for someone interested in sustainable agriculture and project management.
            </p>

            <h2>Responsibilities</h2>
            <ul>
              <li>Assist in planning and executing agricultural projects</li>
              <li>Coordinate with stakeholders and team members</li>
              <li>Help maintain project documentation and reports</li>
              <li>Support the organization of events and workshops</li>
              <li>Contribute to monitoring and evaluation activities</li>
              <li>Assist in preparing project presentations and communications</li>
            </ul>

            <h2>Requirements</h2>
            <ul>
              <li>Currently pursuing or recently completed a degree in Agriculture, Business, or related field</li>
              <li>Strong interest in agricultural development and sustainability</li>
              <li>Excellent organizational and communication skills</li>
              <li>Proficiency with AI, Canva, and other design tools</li>
              <li>Ability to work independently and as part of a team</li>
              <li>Strong attention to detail</li>
            </ul>

            <h2>What We Offer</h2>
            <ul>
              <li>Hands-on experience in agricultural project management</li>
              <li>Mentorship from experienced professionals</li>
              <li>Networking opportunities with industry stakeholders</li>
              <li>Certificate of completion</li>
              <li>Monthly stipend</li>
              <li>Possibility of full-time employment after internship</li>
            </ul>

           
          </div>

          <div className="mt-8 flex gap-4">
            <Link 
              href="https://airtable.com/app0J1BYQpwnlLfwj/pagWOxDvJXw4Uv5uT/form"
              target="_blank"
              rel="noopener noreferrer"
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