'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Video } from 'lucide-react';
import { formatWebinarDate, formatWebinarTime, type CatalystWebinar } from '@/lib/catalyst-w/webinars';

export type WebinarStripItem = Pick<
    CatalystWebinar,
    'id' | 'slug' | 'title' | 'subtitle' | 'starts_at' | 'timezone' | 'duration_minutes' | 'format' | 'cost' | 'registration_url' | 'image_url' | 'featured'
>;

function StripCard({ webinar, isPast }: { webinar: WebinarStripItem; isPast?: boolean }) {
    return (
        <article className="flex-shrink-0 w-[min(100%,320px)] snap-start group">
            <Link
                href={`/webinars/${webinar.slug}`}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
            >
                {webinar.image_url ? (
                    <div className="relative h-28 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={webinar.image_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C24]/80 to-transparent" />
                    </div>
                ) : (
                    <div className="h-20 flex items-center justify-center bg-white/[0.04] border-b border-white/10">
                        <Video size={22} className="text-[#F4C430]/70" />
                    </div>
                )}

                <div className="p-4 flex flex-col flex-1 gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4C430]">
                            {webinar.format === 'online' ? 'Webinar' : webinar.format.replace('_', ' ')}
                        </span>
                        {webinar.featured && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Featured</span>
                        )}
                        {isPast && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Past</span>
                        )}
                    </div>

                    <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#F4C430] transition-colors">
                        {webinar.title}
                    </h3>

                    <div className="mt-auto space-y-1 text-[11px] text-white/50">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={11} className="text-[#F4C430]/80 shrink-0" />
                            <span className="truncate">{formatWebinarDate(webinar.starts_at, webinar.timezone)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={11} className="text-[#F4C430]/80 shrink-0" />
                            <span className="truncate">
                                {formatWebinarTime(webinar.starts_at, webinar.timezone)} · {webinar.duration_minutes}m · {webinar.cost}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>

            {!isPast && webinar.registration_url && (
                <a
                    href={webinar.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="mt-2 block text-center text-[11px] font-bold uppercase tracking-wider text-[#F4C430] hover:text-white transition-colors"
                >
                    Register →
                </a>
            )}
        </article>
    );
}

interface Props {
    webinars: WebinarStripItem[];
}

export default function CatalystWebinarsSection({ webinars }: Props) {
    if (webinars.length === 0) return null;

    const now = new Date();
    const upcoming = webinars.filter(w => new Date(w.starts_at) >= now);
    const display = upcoming.length > 0 ? upcoming : webinars.slice(0, 4);

    return (
        <section className="bg-[#0B2C24] border-t border-white/10">
            <div className="container mx-auto px-6 py-8 md:py-10">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3 min-w-0">
                        <Video size={16} className="text-[#F4C430] shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Events & Webinars</p>
                            <p className="text-sm md:text-base font-semibold text-white truncate">
                                {upcoming.length > 0 ? 'Upcoming sessions' : 'Recent sessions'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/webinars"
                        className="inline-flex items-center gap-1.5 text-[#F4C430] text-xs font-bold uppercase tracking-wider hover:text-white transition-colors shrink-0"
                    >
                        View all
                        <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent [-ms-overflow-style:none] [scrollbar-width:thin]">
                    {display.map(webinar => (
                        <StripCard
                            key={webinar.id}
                            webinar={webinar}
                            isPast={new Date(webinar.starts_at) < now}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
