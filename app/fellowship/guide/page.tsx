import Link from 'next/link'
import { FaCheckCircle, FaArrowRight, FaCalendarAlt } from 'react-icons/fa'
import DownloadGuide from '../components/DownloadGuide'

export default function FellowshipGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">Agripro Fellowship Track Guide</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about the 6-month venture-backed fellowship for future agricultural leaders
          </p>
          
          <div className="mt-8">
            <Link href="/fellowship" className="text-green-600 hover:text-green-700">
              ← Back to Fellowship Overview
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-green-600 text-white p-6 rounded-xl text-center">
            <h3 className="text-xl font-bold mb-4">Ready to Apply?</h3>
            <p className="mb-6">Applications are open until October 24, 2025</p>
            <Link 
              href="/fellowship/apply"
              className="inline-flex items-center px-6 py-3 bg-white text-green-700 font-bold rounded-lg hover:bg-green-50 transition-colors"
            >
              Start Application
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
          
          <div className="bg-white border-2 border-green-200 p-6 rounded-xl text-center">
            <h3 className="text-xl font-bold text-green-800 mb-4">Download Full Guide</h3>
            <p className="text-gray-600 mb-6">Get the comprehensive 12-page fellowship guide</p>
            <DownloadGuide />
          </div>
        </div>

        {/* Program Overview */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Program Overview</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">6</div>
              <div className="text-gray-700">Months Duration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">20+</div>
              <div className="text-gray-700">Fellow Spots</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">$75B</div>
              <div className="text-gray-700">Food Import Gap</div>
            </div>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed">
            The Agripro Fellowship Track is part of the broader Taskwit Amplify Fellowship program, 
            specifically designed for individuals passionate about transforming African agriculture. 
            You&apos;ll work on real projects within high-growth agribusiness ventures, gaining hands-on 
            experience across the entire agricultural value chain.
          </p>
        </section>

        {/* Selection Criteria */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Selection Criteria</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">What We Look For (100 points total)</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-800">Leadership & Ownership (20 pts)</strong>
                    <p className="text-gray-600 text-sm">Initiative, accountability, and ability to drive projects forward</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-800">Problem-Solving & Analytical Rigor (20 pts)</strong>
                    <p className="text-gray-600 text-sm">Data-driven thinking and systematic approach to challenges</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-800">Execution Velocity (20 pts)</strong>
                    <p className="text-gray-600 text-sm">Speed and quality of implementation</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-800">Communication & Stakeholder Management (15 pts)</strong>
                    <p className="text-gray-600 text-sm">Ability to work with farmers, executives, and partners</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-800">Mission Fit & Grit (15 pts)</strong>
                    <p className="text-gray-600 text-sm">Passion for agriculture and resilience in challenging environments</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-800">Track Skills (10 pts)</strong>
                    <p className="text-gray-600 text-sm">Operations, data, or product experience in agricultural contexts</p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">Ideal Candidate Profile</h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Education</h4>
                  <p className="text-gray-700 text-sm">
                    Bachelor&apos;s degree or equivalent, graduation within 2 years (recent grads preferred)
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Experience</h4>
                  <p className="text-gray-700 text-sm">
                    Some exposure to operations, data analysis, or field work. Agricultural background helpful but not required.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Skills</h4>
                  <p className="text-gray-700 text-sm">
                    Comfort with Excel/data tools, willingness to learn GIS and field data collection methods
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Mindset</h4>
                  <p className="text-gray-700 text-sm">
                    Entrepreneurial thinking, comfort with ambiguity, bias toward action
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Timeline */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Application Timeline & Process</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                <FaCalendarAlt />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Phase 1: Digital Application</h3>
                <p className="text-gray-600 mb-2"><strong>Deadline:</strong> October 24, 2025 (11:59 PM GMT)</p>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Complete online application form</li>
                  <li>• Submit 3 essays (motivation, problem-solving, career goals)</li>
                  <li>• Upload CV/resume and transcript</li>
                  <li>• Record 90-second video introduction</li>
                  <li>• Provide 2 professional/academic references</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                02
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Phase 2: Virtual Assessment</h3>
                <p className="text-gray-600 mb-2"><strong>Dates:</strong> October 27-30, 2025</p>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Case study analysis (agricultural supply chain scenario)</li>
                  <li>• Group collaboration task</li>
                  <li>• Data interpretation exercise</li>
                  <li>• 30-minute behavioral interview</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                03
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Phase 3: Final Panel & Placement</h3>
                <p className="text-gray-600 mb-2"><strong>Dates:</strong> October 31, 2025</p>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Panel interview with Agripro and partner organization representatives</li>
                  <li>• Reference checks conducted</li>
                  <li>• Placement matching based on skills and company needs</li>
                  <li>• Final decisions communicated October 31</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Program Structure */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Program Structure</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">Weeks 1-2: Intensive Launchpad</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• African food systems & value chain economics</li>
                <li>• Field UX & last-mile product design</li>
                <li>• Data collection tools (ODK/Kobo, QGIS)</li>
                <li>• Unit economics for agricultural ventures</li>
                <li>• Climate risk and quality management</li>
                <li>• Stakeholder communication skills</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">Weeks 3-26: Project Execution</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Weekly skill sprints and workshops</li>
                <li>• Hands-on project work with mentor support</li>
                <li>• Field visits and farmer engagement</li>
                <li>• Regular retrospectives and peer learning</li>
                <li>• Quarterly milestone reviews</li>
                <li>• Portfolio development and impact measurement</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Benefits & Outcomes */}
        <section className="bg-green-50 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Benefits & Outcomes</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">What You&apos;ll Gain</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Verified portfolio with 3-5 shipped projects</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Industry certifications and skill badges</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Network of mentors and industry leaders</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Job placement support and references</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">Career Paths</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Agtech startup operations and product roles</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Agricultural finance and investment</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Supply chain and logistics management</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Development organization program management</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                q: "Do I need an agricultural background?",
                a: "No! We welcome applicants from diverse backgrounds including business, engineering, data science, and design. What matters most is your problem-solving ability and passion for agricultural development."
              },
              {
                q: "Is this a paid fellowship?",
                a: "Compensation varies by placement and will be confirmed during the matching process. Some placements offer stipends, others provide valuable equity or project-based compensation."
              },
              {
                q: "Can international students apply?",
                a: "Yes, but you must be eligible to work in Ghana or your placement country. We can provide guidance on visa requirements for selected candidates."
              },
              {
                q: "What if I don't have data analysis experience?",
                a: "Basic Excel/Google Sheets proficiency is sufficient. We'll train you on specialized tools like QGIS, ODK, and agricultural data platforms during the program."
              },
              {
                q: "How much field work is involved?",
                a: "Expect 20-30% field time depending on your project. This includes farmer visits, market research, and data collection in rural areas."
              },
              {
                q: "What happens after the fellowship?",
                a: "Most fellows receive job offers from their placement companies or network partners. We also provide ongoing career support and alumni network access."
              }
            ].map((faq, index) => (
              <div key={index} className="border-l-4 border-green-600 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Apply?</h2>
          <p className="text-xl text-green-100 mb-8">
            Join the next cohort of agricultural leaders building solutions that feed a continent.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/fellowship/apply"
              className="inline-flex items-center px-8 py-4 bg-white text-green-700 font-bold rounded-lg hover:bg-green-50 transition-all transform hover:scale-105"
            >
              Start Application
              <FaArrowRight className="ml-2" />
            </Link>
            <Link 
              href="/fellowship/waitlist"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-green-700 transition-all"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
