'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Globe, BarChart2, ArrowRight } from 'lucide-react';

const pillars = [
    { icon: BookOpen, label: '200+ free resources' },
    { icon: Globe, label: '15+ countries served' },
    { icon: BarChart2, label: 'Live market intelligence' },
];

export default function DonateCTA() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gray-950 rounded-3xl overflow-hidden my-10"
        >
            <div className="relative px-8 py-12 sm:px-14 lg:px-16">
                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[160px] bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    {/* Left */}
                    <div className="max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full mb-5">
                            <Heart className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Support the Knowledge Hub</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                            This hub is free.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                Your donation keeps it that way.
                            </span>
                        </h2>
                        <p className="text-gray-400 text-base leading-relaxed mb-6">
                            Research, market intelligence, expert insights — free for agribusiness professionals across Africa. Help us keep it open for everyone.
                        </p>

                        <div className="flex flex-wrap gap-3 mb-8">
                            {pillars.map((p) => (
                                <div key={p.label} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                                    <p.icon className="w-3.5 h-3.5 text-green-400" />
                                    <span className="text-xs text-gray-400 font-medium">{p.label}</span>
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/knowledgehub/donate"
                            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 font-bold rounded-full hover:bg-green-50 transition-all text-sm"
                        >
                            <Heart size={15} />
                            Make a donation
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Right — quick amounts */}
                    <div className="shrink-0 bg-white/5 border border-white/10 rounded-2xl p-6 lg:w-64">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Quick donate</p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {[5, 10, 25, 50].map((amt) => (
                                <Link
                                    key={amt}
                                    href={`/knowledgehub/donate`}
                                    className="py-2.5 rounded-xl border border-white/10 text-white text-sm font-bold text-center hover:border-green-500/50 hover:bg-green-500/10 transition-all"
                                >
                                    ${amt}
                                </Link>
                            ))}
                        </div>
                        <Link
                            href="/knowledgehub/donate"
                            className="block w-full py-2.5 rounded-xl border border-white/10 text-gray-500 text-sm font-medium text-center hover:border-white/20 hover:text-gray-400 transition-all"
                        >
                            Custom amount →
                        </Link>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
