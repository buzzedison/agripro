import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import WebinarBody from '@/components/catalyst-w/WebinarBody';
import { formatWebinarDate, formatWebinarTime } from '@/lib/catalyst-w/webinars';
import { getWebinarBySlug } from '@/lib/catalyst-w/webinar-server';

const FORMAT_LABELS: Record<string, string> = {
    online: 'Online Webinar',
    in_person: 'In Person',
    hybrid: 'Hybrid',
};

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const webinar = await getWebinarBySlug(slug);
    if (!webinar) return { title: 'Webinar Not Found' };

    return {
        title: `${webinar.title} | Catalyst W`,
        description: webinar.meta_description || webinar.summary || webinar.subtitle,
    };
}

export default async function WebinarDetailPage(
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const webinar = await getWebinarBySlug(slug);
    if (!webinar) notFound();

    const isPast = new Date(webinar.starts_at) < new Date();

    return (
        <div className="min-h-screen bg-white text-[#0B2C24]">
            <section className="bg-[#0B2C24] text-white pt-28 pb-16 relative overflow-hidden">
                {webinar.image_url && (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={webinar.image_url}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2C24] via-[#0B2C24]/90 to-[#0B2C24]/60" />
                    </>
                )}
                <div className="container mx-auto px-6 max-w-4xl relative z-10">
                    <Link
                        href="/webinars"
                        className="inline-flex items-center gap-2 text-green-300 hover:text-white text-sm mb-8 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        All webinars
                    </Link>

                    <p className="text-[#F4C430] text-xs font-black uppercase tracking-[0.3em] mb-4">
                        {FORMAT_LABELS[webinar.format] ?? webinar.format}
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">{webinar.title}</h1>
                    {webinar.subtitle && (
                        <p className="text-xl text-white/70 leading-relaxed max-w-3xl">{webinar.subtitle}</p>
                    )}

                    <div className="mt-10 grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                            <Calendar className="text-[#F4C430] shrink-0" size={18} />
                            <span>{formatWebinarDate(webinar.starts_at, webinar.timezone)}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                            <Clock className="text-[#F4C430] shrink-0" size={18} />
                            <span>{formatWebinarTime(webinar.starts_at, webinar.timezone)} · {webinar.duration_minutes} min</span>
                        </div>
                        {webinar.venue && (
                            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                                <MapPin className="text-[#F4C430] shrink-0" size={18} />
                                <span>{webinar.venue}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                            <span className="text-[#F4C430] font-bold">{webinar.cost}</span>
                        </div>
                    </div>

                    {webinar.registration_url && !isPast && (
                        <a
                            href={webinar.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-[#F4C430] text-[#0B2C24] font-bold rounded-full hover:bg-white transition-colors"
                        >
                            Register for this webinar
                            <ExternalLink size={18} />
                        </a>
                    )}
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-6 max-w-3xl">
                    {webinar.body_content ? (
                        <WebinarBody content={webinar.body_content} />
                    ) : webinar.summary ? (
                        <p className="text-gray-600 leading-relaxed text-lg">{webinar.summary}</p>
                    ) : null}

                    <div className="mt-16 p-8 bg-[#F9FAF9] rounded-2xl border border-gray-100">
                        <h2 className="text-xl font-bold mb-3">About AgriPro Catalyst W</h2>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            AgriPro Catalyst W is a 12-week accelerator for women-led agribusinesses across Africa.
                            After the webinar, eligible participants can explore Catalyst W and apply for Cohort 2026.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/womanyear"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B2C24] text-white font-semibold rounded-full text-sm hover:bg-[#06140E] transition-colors"
                            >
                                Explore Catalyst W
                            </Link>
                            {webinar.registration_url && !isPast && (
                                <a
                                    href={webinar.registration_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#0B2C24] text-[#0B2C24] font-semibold rounded-full text-sm hover:bg-[#0B2C24] hover:text-white transition-colors"
                                >
                                    Register now
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
