import Link from 'next/link'
import { Calendar, MapPin, Users } from 'lucide-react'

export default function PartyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-lg mb-4">AGRIPRO UG INVITES YOU TO</p>
          <h1 className="text-6xl md:text-8xl font-bold mb-8">BRUNCH</h1>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
          <p className="text-xl">COME EAT AND CONNECT!</p>
        </div>
      </div>

      {/* Event Details */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Date, Time, Location */}
                      <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="flex items-center space-x-4">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-semibold text-black">Date & Time</h3>
                  <p className="text-black">July 5 | 12PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-semibold text-black">Location</h3>
                  <p className="text-black">The Enterprise Village, Dzorwulu</p>
                </div>
              </div>
            </div>

          {/* Event Description */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">Join Us for an Epic Brunch Party!</h2>
            <p className="text-lg text-black mb-6">
              Get ready for an unforgettable brunch experience! Connect with fellow agriculture 
              enthusiasts, students, and professionals while enjoying delicious food, dancing to 
              amazing music, and participating in fun interactive games. This isn&apos;t just networking 
              - it&apos;s a full celebration where you&apos;ll build meaningful relationships in the 
              agricultural community while having the time of your life!
            </p>
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-green-800 font-semibold">
                🎉 Expect live music, dance floor, team games, and plenty of surprises!
              </p>
            </div>
          </div>

                      {/* What to Expect */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6">What to Expect</h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2 text-green-800">Networking</h4>
                  <p className="text-black text-sm">Meet like-minded agri-professionals</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-4xl mb-4">🍳</div>
                  <h4 className="font-semibold mb-2 text-orange-800">Great Food</h4>
                  <p className="text-black text-sm">Delicious brunch with fresh ingredients</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-4xl mb-4">🎵</div>
                  <h4 className="font-semibold mb-2 text-purple-800">Dancing</h4>
                  <p className="text-black text-sm">Dance to amazing music and let loose</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-4xl mb-4">🎲</div>
                  <h4 className="font-semibold mb-2 text-blue-800">Fun Games</h4>
                  <p className="text-black text-sm">Interactive games and team activities</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-4xl mb-4">💡</div>
                  <h4 className="font-semibold mb-2 text-yellow-800">Ideas Exchange</h4>
                  <p className="text-black text-sm">Share and learn innovative concepts</p>
                </div>
              </div>
            </div>

                     {/* RSVP Section */}
           <div className="text-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-8 border-2 border-green-200 shadow-xl">
             <div className="text-6xl mb-4">🎊</div>
             <h3 className="text-3xl font-bold mb-4 text-green-800">Ready to Party with Us?</h3>
             <p className="text-black mb-6 text-lg">
               Don&apos;t miss out on the most exciting AgriPro event of the year! 
               <br />
               <span className="font-semibold text-red-600">⚡ Limited spaces available - First come, first served!</span>
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
               <div className="flex items-center text-green-700">
                 <span className="text-2xl mr-2">🎵</span>
                 <span className="font-medium">Live DJ</span>
               </div>
               <div className="flex items-center text-purple-700">
                 <span className="text-2xl mr-2">🎲</span>
                 <span className="font-medium">Fun Games</span>
               </div>
               <div className="flex items-center text-orange-700">
                 <span className="text-2xl mr-2">🍳</span>
                 <span className="font-medium">Amazing Food</span>
               </div>
             </div>
             <Link 
               href="https://airtable.com/app0J1BYQpwnlLfwj/pagrLFxEkZAoomS9d/form"
               target="_blank"
               rel="noopener noreferrer"
               className="inline-block px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-full hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
             >
               🎉 RSVP NOW - LET&apos;S PARTY! 🎉
             </Link>
             <p className="text-sm text-red-600 mt-4 font-semibold">
               ⏰ Registration closes 48 hours before the event - Don&apos;t wait!
             </p>
           </div>
        </div>
      </div>
    </div>
  )
} 