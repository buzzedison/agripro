import Link from 'next/link';

export default function CallForExperts() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/greenmarket" className="inline-block text-green-600 hover:text-green-700 mb-8">
            ← Back to Green Market
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
            Call for Experts. Facilitate a Session at the Accra Green Market
          </h1>
          <p className="text-xl text-gray-600">
            Are you passionate about sustainability, green living, or eco-innovation? Share your expertise at our March 2025 event.
          </p>
        </div>

        {/* Why Facilitate Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Why Facilitate a Session?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Inspire Change",
                description: "Share your expertise and spark action toward a greener, more sustainable future."
              },
              {
                title: "Build Your Brand",
                description: "Showcase your knowledge and solutions to a diverse and engaged audience."
              },
              {
                title: "Network",
                description: "Connect with farmers, startups, green entrepreneurs, and policymakers passionate about sustainability."
              },
              {
                title: "Make an Impact",
                description: "Contribute to the education and empowerment of individuals and businesses embracing green living."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-700 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Topics Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Session Topics We're Looking For</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <ul className="space-y-4">
              {[
                "Sustainable Agriculture: Organic farming techniques, soil health, crop diversification, and agribusiness strategies.",
                "Green Living: DIY gardening, waste management, upcycling, and eco-friendly lifestyle practices.",
                "Renewable Energy: Solar, wind, and other clean energy solutions for homes and businesses.",
                "Green Entrepreneurship: Building a sustainable business, accessing funding, and scaling eco-innovations.",
                "Climate Action & Policy: Educating the public on climate change, conservation, and sustainable policy initiatives.",
                "Family & Community Engagement: Creative activities and workshops that make green living fun and accessible."
              ].map((topic, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-gray-700">{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-6">What's In It for You?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Recognition",
                description: "Be featured in our event marketing, including social media, flyers, and press releases."
              },
              {
                title: "Audience Reach",
                description: "Gain exposure to a diverse audience, from farmers to entrepreneurs and eco-conscious families."
              },
              {
                title: "Facilitator Package",
                description: "Enjoy free event access, refreshments, and a certificate of appreciation."
              },
              {
                title: "Networking",
                description: "Build connections with industry leaders, policymakers, and like-minded professionals."
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-green-700 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Session Details */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Session Details</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="text-green-600 mr-2">⏱</span>
                <span className="text-gray-700">Duration: 1 to 2 hours per session</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">📝</span>
                <span className="text-gray-700">Format: Hands-on workshops, interactive discussions, or practical demonstrations</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">👥</span>
                <span className="text-gray-700">Audience Size: Sessions will be conducted in rooms with a capacity of up to 20-50 participants</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Important Dates */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Important Dates</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="text-green-600 mr-2">📅</span>
                <span className="text-gray-700">Application Deadline: January 15, 2025</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">📅</span>
                <span className="text-gray-700">Facilitator Selection Announcement: January 31, 2025</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">📅</span>
                <span className="text-gray-700">Facilitator Orientation: February 15, 2025</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Apply Now Section */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Ready to Share Your Expertise?</h2>
          <div className="space-y-4">
            <p className="text-gray-600 mb-8">
              Submit your proposal through any of these channels:
            </p>
            <div className="space-y-4">
              <p className="text-gray-700">📧 Email us at: <a href="mailto:contact@accragreenmarket.com" className="text-green-600 hover:text-green-700">contact@accragreenmarket.com</a></p>
              <p className="text-gray-700">📞 Call us at: <a href="tel:+233000000000" className="text-green-600 hover:text-green-700">+233 00 000 0000</a></p>
            </div>
            <button className="mt-8 px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl">
              Apply Now
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
