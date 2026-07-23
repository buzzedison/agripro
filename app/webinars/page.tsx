import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPublishedWebinars } from '@/lib/catalyst-w/webinar-server';
import WebinarCard from '@/components/catalyst-w/WebinarCard';

export const metadata: Metadata = {
    title: 'Webinars & Events | Catalyst W',
    description:
        'Practical webinars for women-led agribusinesses across Africa — learn how to access markets, prepare for capital, and scale with the right support.',
};

export default async function WebinarsPage() {
    const webinars = await getPublishedWebinars();
    const now = new Date();
    const upcoming = webinars.filter(w => new Date(w.starts_at) >= now);
    const past = [...webinars.filter(w => new Date(w.starts_at) < now)].reverse();

    return (
        <div className="min-h-screen bg-[#F9FAF9] text-[#0B2C24]">
            <section className="bg-[#0B2C24] text-white pt-28 pb-16">
                <div className="container mx-auto px-6 max-w-5xl">
                    <Link
                        href="/womanyear"
                        className="inline-flex items-center gap-2 text-green-300 hover:text-white text-sm mb-8 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Catalyst W
                    </Link>
                    <p className="text-[#F4C430] text-xs font-black uppercase tracking-[0.3em] mb-4">
                        Events & Webinars
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                        Webinars for women agripreneurs
                    </h1>
                    <p className="text-xl text-white/70 max-w-2xl leading-relaxed">
                        Practical sessions to help you become buyer-ready, capital-ready, and growth-ready — before you apply to Catalyst W.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-6 max-w-5xl py-16 space-y-16">
                {webinars.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500 text-lg mb-2">No webinars scheduled yet.</p>
                        <p className="text-gray-400 text-sm mb-6">Check back soon or explore Catalyst W in the meantime.</p>
                        <Link
                            href="/womanyear"
                            className="inline-flex px-6 py-3 bg-[#0B2C24] text-white font-semibold rounded-full text-sm hover:bg-[#06140E] transition-colors"
                        >
                            Explore Catalyst W
                        </Link>
                    </div>
                ) : (
                    <>
                        {upcoming.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-8">Upcoming</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {upcoming.map(w => (
                                        <WebinarCard key={w.id} webinar={w} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {past.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-8 text-gray-700">Past events</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {past.map(w => (
                                        <WebinarCard key={w.id} webinar={w} isPast />
                                    ))}
                                </div>
                            </section>
                        )}

                        {upcoming.length === 0 && past.length > 0 && (
                            <p className="text-center text-gray-500 text-sm">
                                No upcoming webinars right now — browse past sessions below or{' '}
                                <Link href="/womanyear" className="text-[#0B2C24] font-semibold underline">
                                    apply to Catalyst W
                                </Link>
                                .
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
