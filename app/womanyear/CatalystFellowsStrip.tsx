'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type StripFellow = {
    id: string;
    slug: string;
    full_name: string;
    designation: 'fellow' | 'director';
    role_in_agripro: string | null;
    photo_url: string | null;
    bio: string | null;
    country: string | null;
};

// Brand-matched (gold / deep-green) strip of the Catalyst Fellows who plan and
// run the accelerator. Renders nothing until data is available, so the page is
// unaffected if the fellows tables aren't populated yet.
export default function CatalystFellowsStrip() {
    const [fellows, setFellows] = useState<StripFellow[]>([]);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('catalyst_fellows_directory')
            .select('id, slug, full_name, designation, role_in_agripro, photo_url, bio, country')
            .eq('status', 'active')
            .then(({ data }) => {
                if (!data || data.length === 0) return;
                // Director first, then prefer profiles with a photo and bio
                const score = (f: StripFellow) =>
                    (f.designation === 'director' ? 4 : 0) + (f.photo_url ? 2 : 0) + (f.bio ? 1 : 0);
                const sorted = [...(data as StripFellow[])].sort((a, b) => score(b) - score(a));
                setFellows(sorted.slice(0, 6));
            });
    }, []);

    if (fellows.length === 0) return null;

    return (
        <section className="py-24 bg-[#0B2C24]">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12"
                >
                    <div className="max-w-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="h-px w-10 bg-[#F4C430]" />
                            <span className="text-[11px] uppercase tracking-[0.28em] text-white/70 font-medium">
                                The team behind it
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            The people who make<br />your connections happen.
                        </h2>
                        <p className="text-white/60 mt-5 leading-relaxed">
                            Catalyst W is planned and run by AgriPro Catalyst Fellows — operators,
                            partnerships leads and organisers across Africa who open the doors and
                            broker the introductions that move your business forward.
                        </p>
                    </div>
                    <Link
                        href="/fellowship/fellows"
                        className="group inline-flex items-center gap-2 text-[#F4C430] font-semibold text-sm hover:text-white transition-colors shrink-0"
                    >
                        Meet all the fellows
                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {fellows.map((fellow, i) => (
                        <motion.div
                            key={fellow.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 }}
                        >
                            <Link
                                href={`/fellowship/fellows/${fellow.slug}`}
                                className="group block rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#F4C430]/50 transition-colors"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    {fellow.photo_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={fellow.photo_url}
                                            alt={fellow.full_name}
                                            className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0B2C24] to-[#1a4a3c]">
                                            <span className="text-4xl font-black text-white/20">
                                                {fellow.full_name
                                                    .split(' ')
                                                    .slice(0, 2)
                                                    .map((part) => part.charAt(0))
                                                    .join('')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-3 px-3">
                                        <p className="text-white font-bold text-sm leading-tight">
                                            {fellow.full_name}
                                        </p>
                                        <p className="text-[#F4C430] text-xs font-medium mt-0.5">
                                            {fellow.designation === 'director'
                                                ? 'Fellowship Director'
                                                : fellow.role_in_agripro || 'Catalyst Fellow'}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
