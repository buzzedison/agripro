'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Zap, Globe2 } from 'lucide-react';

export default function FlagshipInitiatives() {
    return (
        <section className="py-24 bg-gray-950 relative overflow-hidden">
            {/* Subtle background texture */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[100px]" />

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-5">
                        Flagship Initiatives
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                        Where Africa&apos;s Food Future<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                            Is Being Built.
                        </span>
                    </h2>
                    <p className="mt-5 text-gray-400 text-lg max-w-2xl mx-auto">
                        Two transformative programmes. One mission — to unlock the $1 trillion potential of African agriculture.
                    </p>
                </motion.div>

                {/* Two cards */}
                <div className="grid lg:grid-cols-2 gap-6">

                    {/* Card 1 — Catalyst W */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="group relative rounded-3xl overflow-hidden min-h-[520px] flex flex-col"
                    >
                        {/* Background image */}
                        <div className="absolute inset-0">
                            <Image
                                src="/images/agriwoman.jpeg"
                                alt="AgriPro Catalyst W"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C24] via-[#0B2C24]/70 to-[#0B2C24]/20" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col h-full p-8 sm:p-10">
                            {/* Badge */}
                            <div className="flex items-center gap-2 mb-auto">
                                <div className="w-9 h-9 rounded-xl bg-[#F4C430] flex items-center justify-center">
                                    <Zap size={16} className="text-[#0B2C24]" />
                                </div>
                                <span className="text-[#F4C430] text-xs font-black uppercase tracking-[0.25em]">
                                    Accelerator Programme
                                </span>
                            </div>

                            {/* Main content at bottom */}
                            <div className="mt-auto pt-32">
                                <p className="text-[#F4C430] text-xs font-black uppercase tracking-[0.3em] mb-3">
                                    AgriPro Catalyst W
                                </p>
                                <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                                    The Pan-African Launchpad for Women Agripreneurs.
                                </h3>
                                <p className="text-white/60 text-base leading-relaxed mb-8 max-w-md">
                                    The only accelerator combining Venture Building, Direct Market Infrastructure, and Policy Influence — built for the 2026 UN Year of the Woman Farmer.
                                </p>

                                {/* Stats */}
                                <div className="flex gap-8 mb-8">
                                    {[
                                        { value: '$1T', label: 'Gender Dividend' },
                                        { value: '2026', label: 'Cohort Opens' },
                                        { value: '40+', label: 'Countries' },
                                    ].map((s) => (
                                        <div key={s.label}>
                                            <p className="text-2xl font-black text-white">{s.value}</p>
                                            <p className="text-xs text-white/40 uppercase tracking-wider">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/womanyear"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#F4C430] hover:bg-[#D4AF37] text-[#0B2C24] font-black rounded-full transition-all duration-300 hover:scale-105 text-sm"
                                >
                                    Explore Catalyst W
                                    <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2 — Africa Food Futures */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="group relative rounded-3xl overflow-hidden min-h-[520px] flex flex-col"
                    >
                        {/* Background image */}
                        <div className="absolute inset-0">
                            <Image
                                src="/images/aff-hero.png"
                                alt="Africa Food Futures Summit"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/20" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col h-full p-8 sm:p-10">
                            {/* Badge */}
                            <div className="flex items-center gap-2 mb-auto">
                                <div className="w-9 h-9 rounded-xl bg-[#F4C430] flex items-center justify-center">
                                    <Globe2 size={16} className="text-[#0B2C24]" />
                                </div>
                                <span className="text-[#F4C430] text-xs font-black uppercase tracking-[0.25em]">
                                    Global Summit
                                </span>
                            </div>

                            {/* Main content at bottom */}
                            <div className="mt-auto pt-32">
                                <p className="text-[#F4C430] text-xs font-black uppercase tracking-[0.3em] mb-3">
                                    Africa Food Futures 2026
                                </p>
                                <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                                    Where Women, Capital & Climate Converge.
                                </h3>
                                <p className="text-white/60 text-base leading-relaxed mb-8 max-w-md">
                                    The premier gathering of 2,000+ policy makers, investors, and agri-food innovators from 40+ countries. Kigali, Rwanda · October 2026.
                                </p>

                                {/* Stats */}
                                <div className="flex gap-8 mb-8">
                                    {[
                                        { value: '2,000+', label: 'Delegates' },
                                        { value: '40+', label: 'Countries' },
                                        { value: 'Oct 2026', label: 'Rwanda' },
                                    ].map((s) => (
                                        <div key={s.label}>
                                            <p className="text-2xl font-black text-white">{s.value}</p>
                                            <p className="text-xs text-white/40 uppercase tracking-wider">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/africa-food-futures"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-[#F4C430] text-gray-900 hover:text-[#0B2C24] font-black rounded-full transition-all duration-300 hover:scale-105 text-sm"
                                >
                                    Explore the Summit
                                    <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
