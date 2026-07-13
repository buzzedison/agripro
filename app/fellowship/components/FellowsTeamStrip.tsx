'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { designationLabel, type FellowDesignation } from '@/lib/fellows/designation';

type StripFellow = {
    id: string;
    slug: string;
    full_name: string;
    designation: FellowDesignation;
    role_in_agripro: string | null;
    photo_url: string | null;
    bio: string | null;
    country: string | null;
};

// Photo-forward strip of the fellows who run the programme.
// Renders nothing until data is available, so the page is unaffected
// if the fellows tables aren't set up yet.
export default function FellowsTeamStrip() {
    const [fellows, setFellows] = useState<StripFellow[]>([]);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('catalyst_fellows_directory')
            .select('id, slug, full_name, designation, role_in_agripro, photo_url, bio, country')
            .eq('status', 'active')
            .then(({ data }) => {
                if (!data || data.length === 0) return;
                // Leadership first (director, then deputy), then prefer profiles with a photo and bio
                const score = (f: StripFellow) =>
                    (f.designation === 'director' ? 10 : f.designation === 'deputy_director' ? 6 : 0) +
                    (f.photo_url ? 2 : 0) + (f.bio ? 1 : 0);
                const sorted = [...(data as StripFellow[])].sort((a, b) => score(b) - score(a));
                setFellows(sorted.slice(0, 6));
            });
    }, []);

    if (fellows.length === 0) return null;

    return (
        <section className="py-24 bg-[#050A08]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12"
                >
                    <div>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-5">
                            The team
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-white">
                            Meet the team behind the programme
                        </h2>
                        <p className="text-gray-400 mt-3 max-w-xl">
                            Catalyst W is planned and run by AgriPro Catalyst Fellows — operators,
                            partnerships leads and organisers across Africa.
                        </p>
                    </div>
                    <Link
                        href="/fellowship/fellows"
                        className="inline-flex items-center gap-2 text-green-400 font-bold text-sm hover:text-green-300 transition-colors shrink-0"
                    >
                        Meet all the fellows <ArrowRight size={14} />
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
                                className="group block rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-green-500/40 transition-colors"
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
                                        <p className="text-green-400 text-xs font-medium mt-0.5">
                                            {designationLabel(fellow.designation, fellow.role_in_agripro)}
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
