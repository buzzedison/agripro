'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Wheat, ShoppingBag, Lightbulb, Wrench, ArrowRight, ArrowUpRight, UserPlus, Search, Handshake } from 'lucide-react';

const roles = [
    {
        id: 'farmer',
        title: 'Farmers & Producers',
        description: 'Showcase your farm, connect with buyers, and unlock new markets across Africa.',
        icon: Wheat,
        count: '200+',
    },
    {
        id: 'buyer',
        title: 'Buyers & Traders',
        description: 'Source quality produce directly from verified African farmers and cooperatives.',
        icon: ShoppingBag,
        count: '50+',
    },
    {
        id: 'expert',
        title: 'Experts & Advisors',
        description: 'Share your expertise and connect with agripreneurs who need your guidance.',
        icon: Lightbulb,
        count: '30+',
    },
    {
        id: 'service_provider',
        title: 'Service Providers',
        description: 'Offer logistics, finance, agri-tech, and more to a continent-wide client base.',
        icon: Wrench,
        count: '40+',
    },
];

const steps = [
    {
        num: '01',
        icon: UserPlus,
        title: 'Create your profile',
        description: 'Tell us your role, what you do, and who you want to reach. Takes under 3 minutes.',
    },
    {
        num: '02',
        icon: Search,
        title: 'Get discovered',
        description: 'Your profile goes live in our directory — searchable by buyers, partners, and collaborators.',
    },
    {
        num: '03',
        icon: Handshake,
        title: 'Connect & grow',
        description: 'Message members directly, get matched to opportunities, and build lasting relationships.',
    },
];

const flags = ['🇬🇭', '🇳🇬', '🇰🇪', '🇪🇹', '🇷🇼', '🇺🇬', '🇿🇦', '🇸🇳'];

export default function ConnectPage() {
    return (
        <div className="min-h-screen bg-white">

            {/* ── Hero ── */}
            <section className="relative bg-[#050A08] overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-green-950/40 to-transparent" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-sm text-gray-300 font-medium">AgriPro Connect</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.02] tracking-tight mb-6">
                            The people behind<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                African agriculture.
                            </span>
                        </h1>

                        <p className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed">
                            One network for farmers, buyers, experts, and service providers.
                            Find the right people and build relationships that move business.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-14">
                            <Link
                                href="/connect/onboarding"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-green-50 transition-all duration-300 shadow-xl shadow-black/20"
                            >
                                Join the Network
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/connect/directory"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300"
                            >
                                Browse Directory
                            </Link>
                        </div>

                        {/* Live community strip */}
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex -space-x-2">
                                {flags.map((flag, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#050A08] flex items-center justify-center text-xs">
                                        {flag}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-6 divide-x divide-white/10">
                                {[
                                    { value: '500+', label: 'Members' },
                                    { value: '15+', label: 'Countries' },
                                    { value: '25+', label: 'Value chains' },
                                ].map((s) => (
                                    <div key={s.label} className="pl-6 first:pl-0">
                                        <span className="text-white font-black text-xl">{s.value}</span>
                                        <span className="text-gray-500 text-sm ml-2">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Who's here ── */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12"
                    >
                        <div>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-5">
                                Who&apos;s on AgriPro Connect
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                                Join as your role<br />in the value chain.
                            </h2>
                        </div>
                        <Link
                            href="/connect/directory"
                            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm shrink-0"
                        >
                            Browse all members
                            <ArrowUpRight size={15} />
                        </Link>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {roles.map((role, index) => (
                            <motion.div
                                key={role.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                            >
                                <Link
                                    href={`/connect/onboarding?type=${role.id}`}
                                    className="group flex flex-col h-full bg-white rounded-2xl p-7 border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                        <role.icon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h3 className="font-black text-gray-900 text-base mb-2">{role.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed flex-1">{role.description}</p>
                                    <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
                                        <span className="text-xs font-bold text-gray-400">{role.count} members</span>
                                        <span className="inline-flex items-center gap-1 text-sm font-bold text-green-600 group-hover:gap-2 transition-all">
                                            Join <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-14"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-gray-100 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-5">
                            How it works
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                            Up and running<br />in minutes.
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.num}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative bg-gray-50 rounded-2xl p-8 border border-gray-100"
                            >
                                <span className="absolute top-6 right-7 text-6xl font-black text-gray-900/[0.04] select-none leading-none">
                                    {step.num}
                                </span>
                                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-6">
                                    <step.icon className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="font-black text-gray-900 text-lg mb-3">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-gray-950 rounded-3xl px-8 py-16 sm:px-16 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-green-500/10 rounded-full blur-[80px]" />
                        <div className="relative">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                                Ready to build your<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                    African network?
                                </span>
                            </h2>
                            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                                Join hundreds of agripreneurs already connecting, trading, and growing together.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/connect/onboarding"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-green-50 transition-all duration-300"
                                >
                                    Create Your Profile
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href="/connect/directory"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300"
                                >
                                    Browse Directory
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}
