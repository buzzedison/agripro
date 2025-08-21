"use client"

import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'
import Image from 'next/image'
import { urlFor } from './urlFor'
import Link from 'next/link'

const eventsQuery = groq`
  *[_type == 'event' && published == true] | order(date desc) {
    _id,
    title,
    description,
    date,
    time,
    locationType,
    venue,
    rsvpLink,
    contactPhone,
    speakers,
    image
  }
`

async function getEvents() {
  return await client.fetch(eventsQuery)
}

import { useEffect, useState } from 'react'

export default function EventsPageWrapper() {
  const [events, setEvents] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'online' | 'physical'>('all')

  useEffect(() => {
    (async () => {
      const fetched = await getEvents()
      setEvents(fetched)
    })()
  }, [])

  const filteredEvents =
    filter === 'all'
      ? events
      : events.filter(e => e.locationType === filter)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 text-center tracking-tight">Upcoming Events</h1>
        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
          {['all', 'online', 'physical'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-3 py-1.5 rounded-full font-medium border transition-all duration-200 text-sm flex items-center gap-1
                ${filter === type ? 'bg-green-700 text-white border-green-700 shadow scale-105' : 'bg-white text-gray-700 border-gray-200 hover:border-green-700 hover:text-green-800 hover:shadow'}`}
            >
              {type === 'all' ? <IconGrid /> : type === 'online' ? <IconWifi /> : <IconLocation />}
              {type === 'all' ? 'All Events' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        {filteredEvents.length === 0 && (
          <div className="text-center text-gray-500 py-16">No events found for this category.</div>
        )}
        <div className="grid grid-cols-1 gap-10">
          {filteredEvents.map((event: any) => (
            <div
              key={event._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 ease-in-out group border border-gray-100"
            >
              {event.image && (
  <div className="w-full bg-gray-100 relative aspect-[4/3] md:aspect-[16/7]">
    <Image
      src={urlFor(event.image).width(1200).height(900).fit('clip').url()}
      alt={event.title}
      fill
      className="object-contain w-full h-full"
      sizes="100vw"
      priority={true}
    />
    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold shadow flex items-center gap-1 backdrop-blur-sm bg-white/80
      ${event.locationType === 'online' ? 'text-blue-700' : 'text-orange-700'}`}
    >
      {event.locationType === 'online' ? <IconWifi size={14} /> : <IconLocation size={14} />}
      {event.locationType === 'online' ? 'Online' : 'Physical'}
    </span>
  </div>
)}
              <div className="flex-1 flex flex-col p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-800 group-hover:text-green-800 transition-colors">
                  {event.title}
                </h2>
                <div className="mb-4 text-gray-600 whitespace-pre-line text-sm md:text-base leading-relaxed">
                  {event.description}
                </div>
                <div className="flex flex-wrap gap-3 items-center text-sm mb-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    <IconMapPin size={14} /> {event.venue}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    <IconCalendar size={14} />
                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    {event.time && ` • ${event.time}`}
                  </span>
                </div>
                {event.speakers && event.speakers.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-500"><span className="font-medium text-gray-700">Speakers: </span>
                    {event.speakers.map((s: any, i: number) => (
                      <span key={i} className="inline-block mr-2">
                        {s.name}{s.role ? ` (${s.role})` : ''}{i < event.speakers.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div></div>
                )}
                <div className="flex flex-wrap gap-3 items-center mt-auto">
                  {event.rsvpLink && (
                    <Link
                      href={event.rsvpLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-5 py-2 bg-green-700 text-white rounded-full font-semibold text-sm hover:bg-green-800 transition duration-200 ease-in-out shadow-sm hover:shadow-md"
                    >
                      RSVP / Register
                    </Link>
                  )}
                  {event.contactPhone && (
                    <a
                      href={`tel:${event.contactPhone}`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-200 transition duration-200 ease-in-out border border-gray-200 hover:border-gray-300"
                    >
                      Call: {event.contactPhone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const IconWifi = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
);
const IconLocation = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const IconGrid = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
);
const IconMapPin = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const IconCalendar = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
