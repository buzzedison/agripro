'use client';

import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Video } from 'lucide-react';
import { formatWebinarDate, formatWebinarTime, type CatalystWebinar } from '@/lib/catalyst-w/webinars';

export type WebinarCardData = Pick<
    CatalystWebinar,
    'id' | 'slug' | 'title' | 'subtitle' | 'summary' | 'image_url' | 'starts_at' | 'timezone' | 'duration_minutes' | 'format' | 'cost' | 'registration_url' | 'featured'
>;

const FORMAT_LABELS: Record<string, string> = {
    online: 'Online Webinar',
    in_person: 'In Person',
    hybrid: 'Hybrid',
};

export default function WebinarCard({ webinar, isPast = false }: { webinar: WebinarCardData; isPast?: boolean }) {
    return (
        <article className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
            {webinar.image_url ? (
                <div className="relative aspect-[16/9] bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={webinar.image_url}
                        alt={webinar.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-[#0B2C24]/90 text-[#F4C430] text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5">
                            <Video size={12} />
                            {FORMAT_LABELS[webinar.format] ?? webinar.format}
                        </span>
                        {webinar.featured && (
                            <span className="px-2 py-1 bg-[#F4C430] text-[#0B2C24] text-xs font-bold rounded-full">Featured</span>
                        )}
                        {isPast && (
                            <span className="px-2 py-1 bg-white/90 text-gray-600 text-xs font-bold rounded-full">Past event</span>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-[#0B2C24] px-8 py-6 text-white">
                    <div className="flex items-center gap-2 text-[#F4C430] text-xs font-bold uppercase tracking-wider mb-3 flex-wrap">
                        <Video size={14} />
                        {FORMAT_LABELS[webinar.format] ?? webinar.format}
                        {webinar.featured && (
                            <span className="px-2 py-0.5 bg-[#F4C430] text-[#0B2C24] rounded-full">Featured</span>
                        )}
                        {isPast && (
                            <span className="px-2 py-0.5 bg-white/20 text-white rounded-full">Past event</span>
                        )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold leading-snug">{webinar.title}</h3>
                    {webinar.subtitle && (
                        <p className="text-white/70 text-sm mt-2 leading-relaxed">{webinar.subtitle}</p>
                    )}
                </div>
            )}

            <div className="p-8 flex-1 flex flex-col">
                {webinar.image_url && (
                    <>
                        <h3 className="text-xl font-bold text-[#0B2C24] mb-1 leading-snug">{webinar.title}</h3>
                        {webinar.subtitle && (
                            <p className="text-gray-500 text-sm mb-4 leading-relaxed">{webinar.subtitle}</p>
                        )}
                    </>
                )}
                {webinar.summary && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-4">{webinar.summary}</p>
                )}

                <div className="space-y-2 text-sm text-gray-500 mb-8">
                    <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-[#F4C430] shrink-0" />
                        {formatWebinarDate(webinar.starts_at, webinar.timezone)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={15} className="text-[#F4C430] shrink-0" />
                        {formatWebinarTime(webinar.starts_at, webinar.timezone)} · {webinar.duration_minutes} min · {webinar.cost}
                    </div>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row gap-3">
                    <Link
                        href={`/webinars/${webinar.slug}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-[#0B2C24] text-[#0B2C24] font-semibold rounded-full text-sm hover:bg-[#0B2C24] hover:text-white transition-colors"
                    >
                        Learn more
                    </Link>
                    {webinar.registration_url && !isPast && (
                        <a
                            href={webinar.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#F4C430] text-[#0B2C24] font-bold rounded-full text-sm hover:bg-[#0B2C24] hover:text-white transition-colors"
                        >
                            Register now
                            <ArrowRight size={16} />
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
