'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { Calendar, MapPin, BookOpen, ArrowRight } from 'lucide-react';

interface EventItem {
    _id: string;
    title: string;
    date: string;
    locationType?: string;
    venue?: string;
}

interface InsightItem {
    title: string;
    category?: string;
    slug?: { current: string };
}

const eventsQuery = groq`
  *[_type == 'event' && published == true] | order(date asc) [0...3] {
    _id, title, date, locationType, venue
  }
`;

const insightsQuery = groq`
  *[_type == "insight"] | order(publishedAt desc) [0...3] {
    title, category, slug
  }
`;

export default function FeedRightRailExtras() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [insights, setInsights] = useState<InsightItem[]>([]);

    useEffect(() => {
        client.fetch<EventItem[]>(eventsQuery).then(setEvents).catch(() => setEvents([]));
        client.fetch<InsightItem[]>(insightsQuery).then(setInsights).catch(() => setInsights([]));
    }, []);

    if (events.length === 0 && insights.length === 0) return null;

    return (
        <>
            {events.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-sm">Upcoming Events</h3>
                        <Link href="/events" className="text-xs text-green-600 font-medium hover:text-green-700">
                            View all
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {events.map((event) => (
                            <Link
                                key={event._id}
                                href="/events"
                                className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                                        <span className="shrink-0">
                                            {event.date && new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                        {event.venue && (
                                            <span className="flex items-start gap-1 min-w-0">
                                                <MapPin className="w-3 h-3 mt-0.5 ml-1 shrink-0" /> <span className="break-words">{event.venue}</span>
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {insights.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-sm">From the Knowledge Hub</h3>
                        <Link href="/knowledgehub/insights" className="text-xs text-green-600 font-medium hover:text-green-700">
                            View all
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {insights.map((insight, i) => (
                            <Link
                                key={insight.slug?.current || i}
                                href={insight.slug?.current ? `/knowledgehub/insights/${insight.slug.current}` : '/knowledgehub/insights'}
                                className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    {insight.category && (
                                        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5">{insight.category}</p>
                                    )}
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-green-600">{insight.title}</p>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-600 shrink-0 mt-1" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
