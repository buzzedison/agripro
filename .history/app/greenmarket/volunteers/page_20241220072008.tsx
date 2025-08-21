import Link from 'next/link';
import Image from 'next/image';

export default function Volunteers() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/greenmarket" className="inline-block text-green-600 hover:text-green-700 mb-8">
            ← Back to Green Market
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
            Join Our Volunteer Team <br/> 
            <span className="font-normal text-3xl">Be Part of the Green Revolution</span>
          </h1>
          
          {/* Hero Image */}
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-8">
            <Image
              src="/images/volunteers-hero.jpg"
              alt="Volunteers working together"
              fill
              style={{ objectFit: 'cover' }}
              className="brightness-90"
            />
          </div>
        </div>

        {/* Why Volunteer Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Why Volunteer?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Make a Difference",
                description: "Contribute to the success of an impactful event promoting sustainability and green innovation in Accra.",
                image: "/images/volunteer-impact.jpg"
              },
              {
                title: "Learn & Grow",
                description: "Gain hands-on experience in event planning, project management, and community engagement.",
                image: "/images/volunteer-learn.jpg"
              },
              {
                title: "Network",
                description: "Connect with like-minded individuals, green startups, and thought leaders in sustainability.",
                image: "/images/volunteer-network.jpg"
              },
              {
                title: "Be Part of a Movement",
                description: "Help shape a greener, cleaner future for Accra.",
                image: "/images/volunteer-movement.jpg"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-green-700 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Roles Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Volunteer Roles and Responsibilities</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Event Planning & Coordination",
                tasks: [
                  "Assist in logistics planning, vendor coordination, and workshop scheduling",
                  "Help with site layout, booth arrangement, and managing event timelines"
                ]
              },
              {
                title: "Marketing & Outreach",
                tasks: [
                  "Support social media campaigns and digital promotions",
                  "Distribute flyers and reach out to community groups, schools, and local businesses"
                ]
              },
              {
                title: "Vendor & Sponsor Liaison",
                tasks: [
                  "Communicate with vendors and sponsors to ensure their needs are met",
                  "Help with booth setup and provide day-of-event assistance"
                ]
              },
              {
                title: "Workshop & Activity Support",
                tasks: [
                  "Coordinate workshop schedules and ensure smooth execution",
                  "Assist facilitators with materials and logistics"
                ]
              },
              {
                title: "Event Day Operations",
                tasks: [
                  "Manage registration desks and welcome attendees",
                  "Oversee games, activities, and crowd management",
                  "Ensure waste management and recycling initiatives are followed"
                ]
              },
              {
                title: "Photography & Content Creation",
                tasks: [
                  "Capture event highlights through photos and videos",
                  "Create content for social media during and after the event"
                ]
              }
            ].map((role, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-700 mb-3">{role.title}</h3>
                <ul className="space-y-2">
                  {role.tasks.map((task, taskIndex) => (
                    <li key={taskIndex} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span className="text-gray-700">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Volunteer Benefits</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <ul className="space-y-4">
              {[
                "Certificate of appreciation and recognition",
                "Networking opportunities with vendors, startups, and environmental leaders",
                "Free access to workshops and activities",
                "Exclusive Accra Green Market volunteer t-shirt"
              ].map((benefit, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Key Dates */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Key Dates</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="text-green-600 mr-2">📅</span>
                <span className="text-gray-700">Volunteer Recruitment Deadline: December 20, 2024</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">📅</span>
                <span className="text-gray-700">Orientation Session: January 15, 2025</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">📅</span>
                <span className="text-gray-700">Event Planning Meetings: January - March 2025</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">📅</span>
                <span className="text-gray-700">Event Day: March 2025</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Apply Now Section */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Ready to Make a Difference?</h2>
          <div className="space-y-4">
            <p className="text-gray-600 mb-8">
              Join us in creating an unforgettable event that inspires change and promotes sustainability in Accra.
            </p>
            <div className="space-y-4">
              <p className="text-gray-700">📧 Email us at: <a href="mailto:info@agriprohub.com" className="text-green-600 hover:text-green-700">info@agriprohub.com</a></p>
              <p className="text-gray-700">📞 Call us at: <a href="tel:+233245600275" className="text-green-600 hover:text-green-700">+233 245600275</a></p>
            </div>
            <button className="mt-8 px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl">
              Sign Up to Volunteer
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
