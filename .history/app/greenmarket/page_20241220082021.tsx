
import Link from 'next/link';
import { FaStore, FaChalkboardTeacher, FaGamepad, FaLightbulb, FaMusic } from 'react-icons/fa';

export default function GreenMarket() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-green-800 mb-4">
            Experience the Future of Green Living
          </h1>
          <p className="text-xl md:text-2xl text-green-700 mb-4">
            Accra Green Market Relaunch | March 2025 | The Enterprise Village, Dzorwulu
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-green-600 mb-8">
            Grow Green, Live Clean
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Celebrate sustainable agriculture, organic farming, and eco-friendly living while supporting innovative green startups in Accra.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#reserve" className="px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl">
              Reserve Your Spot
            </Link>
            <Link href="#vendor" className="px-8 py-4 bg-white text-green-600 border-2 border-green-600 rounded-full hover:bg-green-50 transition-all text-lg font-semibold shadow-lg hover:shadow-xl">
              Become a Vendor
            </Link>
            <Link href="/greenmarket/experts" className="px-8 py-4 bg-green-100 text-green-800 border-2 border-green-600 rounded-full hover:bg-green-200 transition-all text-lg font-semibold shadow-lg hover:shadow-xl">
              Become a Speaker
            </Link>
            <Link href="/greenmarket/volunteers" className="px-8 py-4 bg-green-50 text-green-800 border-2 border-green-600 rounded-full hover:bg-green-100 transition-all text-lg font-semibold shadow-lg hover:shadow-xl">
              Volunteer With Us
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-green-800 mb-8 text-center">What is the Accra Green Market?</h2>
          <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            The Accra Green Market is a vibrant community event that
             brings together farmers, green entrepreneurs, 
             and eco-conscious individuals to showcase sustainable 
             products, share innovative ideas, and inspire
              action. Whether you are a farmer, innovator, or 
              just someone passionate about the planet, 
              this is your chance to be part of the change.
          </p>
        </div>
      </section>

      {/* Event Highlights */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-green-800 mb-12 text-center">Event Highlights</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Green Market Stalls",
                description: "Fresh organic produce, eco-friendly products, and cutting-edge innovations.",
                icon: FaStore
              },
              {
                title: "Workshops & Talks",
                description: "Learn about sustainable farming, waste management, renewable energy, and more.",
                icon: FaChalkboardTeacher
              },
              {
                title: "Games & Activities",
                description: "Interactive challenges, tree planting, and fun for all ages.",
                icon: FaGamepad
              },
              {
                title: "Green Innovation Zone",
                description: "Witness the future of sustainability with pitches and demos from startups.",
                icon: FaLightbulb
              },
              {
                title: "Live Entertainment",
                description: "Music, performances, and plant-based cuisine in a lively atmosphere.",
                icon: FaMusic
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <div className="text-4xl text-green-600 mb-4 flex justify-center">
                  <item.icon className="hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-4 text-center">{item.title}</h3>
                <p className="text-gray-600 text-center">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Attend */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-green-800 mb-12 text-center">Why Attend?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Support Local Farmers",
                description: "Buy fresh, organic produce directly from those who grow it."
              },
              {
                title: "Discover Green Solutions",
                description: "Explore products and practices for sustainable living."
              },
              {
                title: "Learn & Engage",
                description: "Attend hands-on workshops and discussions with experts."
              },
              {
                title: "Have Fun",
                description: "Enjoy games, music, and great food in a family-friendly environment."
              }
            ].map((item, index) => (
              <div key={index} className="bg-green-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold text-green-800 mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Details & CTA */}
      <section className="py-20 px-4 bg-green-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Join the Green Revolution Today!</h2>
          <div className="mb-12">
            <p className="text-xl mb-2">📅 When: March 2025 (Exact date coming soon)</p>
            <p className="text-xl">📍 Where: The Enterprise Village, Dzorwulu, Accra</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#vendor" className="px-8 py-4 bg-white text-green-800 rounded-full hover:bg-green-100 transition-all text-lg font-semibold">
              Become a Vendor
            </Link>
            <Link href="#volunteer" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white hover:text-green-800 transition-all text-lg font-semibold">
              Volunteer
            </Link>
            <Link href="#reserve" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white hover:text-green-800 transition-all text-lg font-semibold">
              Reserve Your Spot
            </Link>
          </div>
        </div>
      </section>

     
    </div>
  );
}
