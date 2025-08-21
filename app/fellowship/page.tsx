import Link from 'next/link'
import { FaUsers, FaChartLine, FaTractor, FaGraduationCap, FaArrowRight, FaCheckCircle, FaStar, FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agripro Fellowship & Internship | Venture-Backed Agricultural Leadership Program',
  description: 'A hands-on, venture-backed fellowship for future agribusiness and agtech leaders. Tackle supply chains, market access, and climate-smart solutions with real projects, mentors, and a portfolio that proves impact.',
  keywords: 'agripro fellowship, agricultural internship, agtech leadership, agribusiness training, venture-backed fellowship, africa agriculture',
}

export default function Fellowship() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-green-500/20 rounded-full text-green-100 text-sm font-medium mb-4">
              Agripro Fellowship Track
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Feeding Africa. <span className="text-green-200">Powering Growth.</span>
          </h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-4xl mx-auto mb-12 leading-relaxed">
            Build solutions that move food from farm to market, unlock finance for smallholders, and cut post-harvest losses—while owning outcomes inside high-growth ventures.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link 
              href="/fellowship/apply"
              className="inline-flex items-center px-8 py-4 bg-white text-green-700 font-bold rounded-full hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Apply to Agripro
              <FaArrowRight className="ml-2" />
            </Link>
            <Link 
              href="/fellowship/guide"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-green-700 transition-all"
            >
              Get the Track Guide
            </Link>
          </div>
          
          <p className="text-green-200 text-sm">
            <FaStar className="inline mr-2" />
            Limited spots. Part of the 6-month Taskwit Amplify Fellowship.
          </p>
        </div>
      </section>

      {/* Why Agripro Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-6">Why Agripro Fellowship </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                          Africa imports $75B of food each year—despite abundant land and talent. The gap isn&apos;t potential; it&apos;s execution. 
            Agripro turns you into a doer with the skills, tools, and network to ship solutions that stick.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaTractor className="text-3xl text-green-600" />,
                title: "Real ownership across ag value chains",
                description: "inputs → production → aggregation → processing → distribution"
              },
              {
                icon: <FaChartLine className="text-3xl text-green-600" />,
                title: "Data → action",
                description: "collect, analyze, and operationalize insights in the field and in product sprints"
              },
              {
                icon: <FaUsers className="text-3xl text-green-600" />,
                title: "Market access playbooks",
                description: "that connect farmers to premium buyers"
              },
              {
                icon: <FaGraduationCap className="text-3xl text-green-600" />,
                title: "Fintech for ag exposure",
                description: "credit scoring, agent models, repayments"
              },
              {
                icon: <FaCheckCircle className="text-3xl text-green-600" />,
                title: "Climate-smart ops",
                description: "that reduce waste and improve resilience"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-green-100">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-green-800 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Work On Section */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-green-800 text-center mb-16">What You&apos;ll Work On</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Market Linkages",
                description: "Design and pilot a buyer–farmer matching workflow (pricing, quality, logistics)."
              },
              {
                title: "Post-Harvest Loss Reduction",
                description: "Build a cold-chain or storage utilization model targeting up to 30% loss reduction."
              },
              {
                title: "Ag-Fintech",
                description: "Prototype a micro-credit risk score using farm, weather, and repayment data."
              },
              {
                title: "Supply-Chain Visibility",
                description: "Deploy simple field data tools to track volumes, quality, and on-time delivery."
              },
              {
                title: "Farmer Success Ops",
                description: "Create onboarding, training, and support funnels that scale across districts."
              }
            ].map((project, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-green-800 mb-4">{project.title}</h3>
                <p className="text-gray-600">{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-green-800 text-center mb-16">The Agripro Curriculum</h2>
          
          <div className="space-y-12">
            {/* Launchpad Intensive */}
            <div className="bg-white rounded-xl shadow-sm p-8 border-l-4 border-green-600">
              <h3 className="text-2xl font-bold text-green-800 mb-4">Launchpad Intensive (Weeks 1–2)</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">African food systems & value-chain economics</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Field UX & last-mile product design</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Data collection (ODK/Kobo), QGIS basics, dashboards</span>
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Unit economics for ag ventures</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Climate risk, storage, and quality management</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Communication & stakeholder mapping</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Weekly Skill Sprints */}
            <div className="bg-white rounded-xl shadow-sm p-8 border-l-4 border-green-500">
              <h3 className="text-2xl font-bold text-green-800 mb-4">Weekly Skill Sprints (Throughout)</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Growth in rural/low-connectivity contexts</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Credit & collections in ag markets</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Procurement and inventory control</span>
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Impact measurement: yield, income, and loss metrics</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Partnerships with co-ops, aggregators, and off-takers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Placement Section */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-green-800 text-center mb-16">Where You&apos;ll Be Placed</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-green-800 mb-4">Internal Venture: Agripro</h3>
              <p className="text-gray-600">AI-assisted farm support, market access, and ops tooling.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-green-800 mb-4">Partner Companies</h3>
              <p className="text-gray-600">Agribusiness processors, distributors, logistics providers, ag-fintechs, and social enterprises across Accra and beyond.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Each placement comes with:</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Defined KPIs', 'Mentor support', 'Tooling access', 'Scoped project you&apos;ll ship'].map((item, index) => (
                <div key={index} className="flex items-center">
                  <FaCheckCircle className="text-green-600 mr-2" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tools & Methods Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-green-800 text-center mb-16">Tools & Methods</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Field & Ops",
                tools: ["ODK/KoboToolbox", "WhatsApp workflows", "USSD/SMS flows"]
              },
              {
                title: "Data",
                tools: ["Excel/Google Sheets", "Power BI", "QGIS basics"]
              },
              {
                title: "Product & Delivery",
                tools: ["Agile sprints", "PRDs", "OKRs", "retros", "experiment logs"]
              },
              {
                title: "Impact",
                tools: ["Outcome dashboards", "farmer NPS", "unit-economics tracking"]
              }
            ].map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
                <h3 className="text-lg font-bold text-green-800 mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.tools.map((tool, toolIndex) => (
                    <li key={toolIndex} className="text-gray-600 text-sm">{tool}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes Section */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-green-800 text-center mb-16">Outcomes You Can Expect</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <FaCheckCircle className="text-3xl text-green-600" />,
                title: "Verified Impact Portfolio",
                description: "3–5 shipped artifacts (dashboards, workflows, pilots) with quantified results"
              },
              {
                icon: <FaStar className="text-3xl text-green-600" />,
                title: "Skill Badges",
                description: "Market access, supply-chain ops, ag-fintech, field research, and data storytelling"
              },
              {
                icon: <FaChartLine className="text-3xl text-green-600" />,
                title: "Career Velocity",
                description: "Roles in agtech, operations, product, or growth—with references that matter"
              },
              {
                icon: <FaUsers className="text-3xl text-green-600" />,
                title: "Network",
                description: "Mentors, off-takers, and partner leaders across the agribusiness ecosystem"
              }
            ].map((outcome, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{outcome.icon}</div>
                <h3 className="text-xl font-bold text-green-800 mb-4">{outcome.title}</h3>
                <p className="text-gray-600">{outcome.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Should Apply Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-green-800 mb-8">Who Should Apply</h2>
          <p className="text-xl text-gray-600 mb-12">Students or recent grads (≤ 2 years) who:</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="space-y-4">
              {[
                "Have bias to action and comfort with field realities",
                "Can analyze data and translate it into operational playbooks"
              ].map((criteria, index) => (
                <div key={index} className="flex items-start text-left">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{criteria}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[
                "Communicate clearly with farmers, agents, and executives",
                "Care deeply about food security and inclusive growth"
              ].map((criteria, index) => (
                <div key={index} className="flex items-start text-left">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{criteria}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Nice-to-have:</h3>
            <p className="text-gray-600">local language proficiency, GIS/data experience, prior co-op/field work, or startup exposure.</p>
          </div>
        </div>
      </section>

      {/* Key Dates Section */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-green-800 text-center mb-16">Key Dates (2025)</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <FaCalendarAlt />, title: "Applications Open", date: "Aug 25" },
              { icon: <FaClock />, title: "Deadline", date: "Sept 20 (11:59 PM GMT)" },
              { icon: <FaCheckCircle />, title: "Assessments", date: "Sept 20–28" },
              { icon: <FaStar />, title: "Final Decisions", date: "Sept 30" },
              { icon: <FaGraduationCap />, title: "Program Launch", date: "Oct 2" }
            ].map((milestone, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className="text-green-600 text-2xl mb-3">{milestone.icon}</div>
                <h3 className="font-semibold text-green-800 mb-2">{milestone.title}</h3>
                <p className="text-gray-600">{milestone.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-green-800 text-center mb-16">Application Process</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Digital Application",
                description: "Essays, CV, 90-sec video"
              },
              {
                step: "02", 
                title: "Virtual Assessment",
                description: "Case + group task with an agribusiness scenario"
              },
              {
                step: "03",
                title: "Panel",
                description: "Interview, references, and placement matching"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-green-800 text-center mb-16">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                question: "Is it field-based?",
                answer: "Hybrid. Expect a mix of field validation, partner visits, and virtual sprints."
              },
              {
                question: "Do I need an agriculture degree?",
                answer: "No. We value problem-solvers from business, engineering, data, and design—plus anyone with strong execution in operations."
              },
              {
                question: "Is there a stipend?",
                answer: "Benefits vary by placement and will be confirmed during matching."
              },
              {
                question: "Will I ship a real project?",
                answer: "Yes. Every fellow owns a scoped project with clear KPIs and a go-live or pilot milestone."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-green-800 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Build What Feeds a Continent?</h2>
          <p className="text-xl text-green-100 mb-12">
            If you want to turn data and grit into fewer losses, better prices for farmers, and stronger ag businesses—this is your arena.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/fellowship/apply"
              className="inline-flex items-center px-8 py-4 bg-white text-green-700 font-bold rounded-full hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Apply to Agripro
              <FaArrowRight className="ml-2" />
            </Link>
            <Link 
              href="/fellowship/guide"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-green-700 transition-all"
            >
              Get the Track Guide
            </Link>
            <Link 
              href="/fellowship/waitlist"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-green-700 transition-all"
            >
              Join the Waitlist
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
