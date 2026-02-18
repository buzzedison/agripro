'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CatalystFormModal, { CatalystFormType } from './CatalystFormModal';
import {
    ArrowRight,
    Download,
    MapPin,
    Calendar,
    Users,
    Zap,
    Truck,
    Handshake,
    Building2,
    Globe,
    CheckCircle2,
    TrendingUp,
    CreditCard,
    Target,
    ChevronRight
} from 'lucide-react';

const WomanYearPage = () => {
    const [activeForm, setActiveForm] = useState<CatalystFormType | null>(null);
    const [activePlanTier, setActivePlanTier] = useState<string | undefined>(undefined);

    const openForm = (type: CatalystFormType, tier?: string) => {
        setActivePlanTier(tier);
        setActiveForm(type);
    };
    return (
        <>
            <div className="min-h-screen bg-white text-[#0B2C24] overflow-x-hidden font-sans">
                {/* Section 1: The Hero */}
                <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                    {/* Visual Asset: Video Loop / High-Quality Image */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-black/50 z-10" />
                        <Image
                            src="/images/catalyst-hero.png"
                            alt="AgriPro Hero"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Fallback pattern/gradient if image fails or to enhance it */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C24]/90 via-transparent to-transparent z-10" />
                    </div>

                    <div className="container mx-auto px-6 relative z-20 text-white text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-4xl md:text-7xl font-bold leading-tight mb-4">
                                The Pan-African Launchpad <br />
                                <span className="text-[#F4C430]">for Women Agripreneurs.</span>
                            </h1>
                            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 font-light italic">
                                2026 is the UN International Year of the Woman Farmer. This is your moment to harness the <span className="font-bold text-[#F4C430]">$1 Trillion Gender Dividend.</span>
                            </p>
                            <p className="text-lg md:text-xl font-medium tracking-widest uppercase mb-12">
                                Don’t just pitch your business. Build your legacy.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <button
                                    onClick={() => openForm('apply')}
                                    className="px-8 py-4 bg-[#F4C430] hover:bg-[#D4AF37] text-[#0B2C24] font-bold rounded-full transition-all flex items-center gap-2 transform hover:scale-105 shadow-lg"
                                >
                                    Apply for Cohort 2026
                                    <ArrowRight size={20} />
                                </button>
                                <button
                                    onClick={() => openForm('prospectus')}
                                    className="px-8 py-4 border-2 border-white hover:bg-white hover:text-[#0B2C24] text-white font-bold rounded-full transition-all flex items-center gap-2"
                                >
                                    Download Prospectus
                                    <Download size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Section 2: The Why Now */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-5xl font-bold mb-8 text-[#0B2C24]">History is Calling.</h2>
                                <p className="text-xl mb-8 text-gray-700 leading-relaxed">
                                    We are at a once-in-a-generation inflection point. While women make up 80% of Africa’s agricultural labor, a $100B financing gap holds them back.
                                </p>

                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-red-100 rounded-lg">
                                            <TrendingUp className="text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">The Cost of Inaction:</h4>
                                            <p className="text-gray-600">Stalled progress and millions hungry.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 pt-4">
                                        <div>
                                            <span className="block text-4xl font-bold text-[#0B2C24]">$1 Trillion</span>
                                            <span className="text-sm text-gray-500 uppercase tracking-wider">Potential GDP Increase</span>
                                        </div>
                                        <div>
                                            <span className="block text-4xl font-bold text-[#0B2C24]">45 Million</span>
                                            <span className="text-sm text-gray-500 uppercase tracking-wider">People Lifted from Insecurity</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-[#0B2C24] text-white rounded-2xl shadow-xl">
                                        <h4 className="font-bold text-xl mb-2">The AgriPro Opportunity:</h4>
                                        <p className="text-green-200">
                                            AgriPro Catalyst W is the only accelerator that combines <span className="text-[#F4C430] font-bold italic">Venture Building + Direct Market Infrastructure + Policy Influence.</span>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl"
                            >
                                <Image
                                    src="/images/catalyst-tech-farmer.png"
                                    alt="Confident Female CEO"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C24]/60 to-transparent" />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 3: The AgriPro Difference */}
                <section className="py-24 bg-[#F9FAF9]">
                    <div className="container mx-auto px-6 text-center">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-bold mb-6"
                        >
                            We Don&apos;t Just Offer Advice. <br />
                            <span className="text-[#F4C430]">We Offer Infrastructure.</span>
                        </motion.h2>
                        <p className="text-xl max-w-3xl mx-auto mb-16 text-gray-600">
                            Most accelerators end with a pitch deck. We begin with operations. Through the
                            <span className="font-bold text-[#0B2C24]"> AgriPro Flywheel</span>, you get immediate integration into a living ecosystem:
                        </p>

                        <div className="grid md:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: <Zap className="text-[#F4C430]" />,
                                    title: "The Ayeeko Platform",
                                    desc: "Real-time market data & digital advisory."
                                },
                                {
                                    icon: <Truck className="text-[#F4C430]" />,
                                    title: "SmartChain Infrastructure",
                                    desc: "Access to cold storage, aggregation, and logistics."
                                },
                                {
                                    icon: <Handshake className="text-[#F4C430]" />,
                                    title: "Green Markets",
                                    desc: "Guaranteed offtake trials and premium pricing."
                                },
                                {
                                    icon: <Building2 className="text-[#F4C430]" />,
                                    title: "Policy & Insights Lab",
                                    desc: "Your voice, amplified to government ministers."
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
                                >
                                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                                    <p className="text-gray-600">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Visualizing the Flywheel (simplified placeholder for interactive diagram) */}
                        <div className="mt-20 relative h-96 max-w-2xl mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 border-4 border-dashed border-gray-200 rounded-full animate-spin-slow" />
                            <div className="relative z-10 w-48 h-48 bg-[#0B2C24] text-white rounded-full flex flex-col items-center justify-center shadow-2xl">
                                <Users size={40} className="mb-2" />
                                <span className="font-bold text-center">Female Foundress</span>
                            </div>
                            {/* Pulsing glow effect */}
                            <div className="absolute w-64 h-64 bg-[#F4C430]/20 rounded-full blur-3xl" />
                        </div>
                    </div>
                </section>

                {/* Section 4: Tracks */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">40 Ventures. 4 High-Impact Tracks.</h2>
                            <div className="flex items-center justify-center gap-4 mt-6">
                                <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                    <CheckCircle2 size={16} /> Woman Founder/Co-Founder
                                </span>
                                <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                    <CheckCircle2 size={16} /> Post-Revenue ($5k+)
                                </span>
                                <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                    <CheckCircle2 size={16} /> Scalable Model
                                </span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    tag: "🌱 Farm Tech",
                                    focus: "Climate-smart production, IoT, Drones, Biological inputs.",
                                    you: "Are rewriting the rules of soil and scale.",
                                    img: "/images/farm-smart.jpeg"
                                },
                                {
                                    tag: "🏭 Value Addition",
                                    focus: "Processing, Packaging, Food Safety, Dairy alternatives.",
                                    you: "Are turning raw commodities into global brands.",
                                    img: "/images/catalyst-value-addition.png"
                                },
                                {
                                    tag: "🚚 Market Infrastructure",
                                    focus: "Logistics, Cold Chain, B2B Platforms.",
                                    you: "Are building the rails that move African food.",
                                    img: "/images/catalyst-market.png"
                                },
                                {
                                    tag: "💳 Agri-Fintech",
                                    focus: "Credit, Insurance, Cooperative Tech.",
                                    you: "Are financing the future of farming.",
                                    img: "/images/catalyst-fintech.png"
                                }
                            ].map((track, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="group relative h-[400px] overflow-hidden rounded-3xl"
                                >
                                    <Image
                                        src={track.img}
                                        alt={track.tag}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C24] via-[#0B2C24]/40 to-transparent" />
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                        <h4 className="text-2xl font-bold mb-4">{track.tag}</h4>
                                        <p className="text-sm text-gray-200 mb-2 font-medium">Focus: {track.focus}</p>
                                        <p className="text-[#F4C430] font-bold italic">You: {track.you}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 5: The Journey - Timeline */}
                <section className="py-24 bg-[#0B2C24] text-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">16 Weeks. From Field to Future.</h2>

                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/20 -translate-y-1/2 hidden md:block" />

                            <div className="grid md:grid-cols-5 gap-8 relative z-10">
                                {[
                                    { month: "May 2026", title: "Onboarding", desc: "Ayeeko Setup" },
                                    { month: "June", title: "Sprint 1: Grounding", desc: "Market trials & farm shadowing" },
                                    { month: "July", title: "Sprint 2: Growth", desc: "Unit economics & climate risk modeling" },
                                    { month: "August", title: "Sprint 3: Capital", desc: "Investment readiness & negotiations" },
                                    { month: "Sept", title: "Sprint 4: Scale", desc: "Logistics integration & cross-border expansion" }
                                ].map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                                    >
                                        <span className="block text-[#F4C430] font-bold mb-2">{step.month}</span>
                                        <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                                        <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                                        <div className="w-4 h-4 bg-[#F4C430] rounded-full absolute -bottom-2 md:bottom-auto md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-[#0B2C24] hidden md:block" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-12 text-center">
                            <span className="inline-block px-8 py-3 bg-[#F4C430] text-[#0B2C24] font-bold rounded-full text-xl shadow-[0_0_20px_rgba(244,196,48,0.4)]">
                                October 2026: THE FINALE
                            </span>
                        </div>
                    </div>
                </section>

                {/* Section 6: The Summit */}
                <section className="relative min-h-screen flex items-center overflow-hidden py-24">
                    <div className="absolute inset-0">
                        <Image
                            src="/images/catalyst-cta.png"
                            alt="Kigali Summit"
                            fill
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2C24]/95 via-[#0B2C24]/85 to-[#0B2C24]/50" />
                    </div>

                    <div className="container mx-auto px-6 relative z-10 text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl"
                        >
                            {/* Label */}
                            <p className="text-[#F4C430] text-xs font-black uppercase tracking-[0.4em] mb-6">
                                Culminating at
                            </p>

                            {/* Summit name */}
                            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none mb-8 tracking-tighter">
                                AFRICA<br />FOOD FUTURES
                            </h2>

                            {/* Location & date pills */}
                            <div className="flex flex-wrap items-center gap-4 mb-8">
                                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-sm font-bold uppercase tracking-widest">
                                    <MapPin size={14} className="text-[#F4C430]" /> Kigali, Rwanda
                                </span>
                                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-sm font-bold uppercase tracking-widest">
                                    <Calendar size={14} className="text-[#F4C430]" /> October 2026
                                </span>
                            </div>

                            {/* Theme */}
                            <p className="text-2xl md:text-3xl font-light italic text-white/80 mb-14 border-l-4 border-[#F4C430] pl-6">
                                Theme: Women, Capital &amp; Climate.
                            </p>

                            {/* Benefit cards */}
                            <ul className="grid sm:grid-cols-3 gap-5 mb-14">
                                <li className="flex flex-col gap-4 p-7 bg-white/8 backdrop-blur-sm rounded-2xl border border-white/15 hover:border-[#F4C430]/50 transition-colors">
                                    <Target size={24} className="text-[#F4C430]" />
                                    <p className="font-semibold text-base leading-snug">Pitch to the Terranova LP Consortium.</p>
                                </li>
                                <li className="flex flex-col gap-4 p-7 bg-white/8 backdrop-blur-sm rounded-2xl border border-white/15 hover:border-[#F4C430]/50 transition-colors">
                                    <Globe size={24} className="text-[#F4C430]" />
                                    <p className="font-semibold text-base leading-snug">Secure deals with buyers like Unilever &amp; OCP.</p>
                                </li>
                                <li className="flex flex-col gap-4 p-7 bg-white/8 backdrop-blur-sm rounded-2xl border border-white/15 hover:border-[#F4C430]/50 transition-colors">
                                    <Zap size={24} className="text-[#F4C430]" />
                                    <p className="font-semibold text-base leading-snug">Celebrate at the &quot;She Harvests&quot; Gala.</p>
                                </li>
                            </ul>

                            {/* CTA */}
                            <Link
                                href="/africa-food-futures"
                                className="inline-flex items-center gap-3 px-9 py-4 bg-[#F4C430] hover:bg-white text-[#0B2C24] font-black rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(244,196,48,0.3)] text-sm uppercase tracking-widest"
                            >
                                Explore the Summit
                                <ChevronRight size={18} />
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Section 7: Partners — hidden until confirmed
            <section className="py-20 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6">
                    <h4 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-12 italic">Powered by the Best</h4>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 hover:opacity-100 transition-opacity">
                        {['FAO', 'AfDB', 'IFC', 'Terranova', 'MTN', 'Yara'].map((partner) => (
                            <div key={partner} className="text-2xl font-black text-[#0B2C24]/40 grayscale hover:grayscale-0 transition-all cursor-default">
                                {partner}
                            </div>
                        ))}
                    </div>
                    <p className="text-center mt-12 text-gray-500 max-w-2xl mx-auto">
                        Backed by development giants, corporate leaders, and the AgriPro Ecosystem.
                    </p>
                </div>
            </section>
            */}

                {/* Section 8: Pricing & Commitment */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">An Investment in Your Growth.</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Our fee structure is designed for accessibility, supported by corporate sponsors.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {[
                                {
                                    title: "Standard Access",
                                    price: "$1,000",
                                    desc: "Full program + Summit",
                                    highlight: false
                                },
                                {
                                    title: "Subsidized",
                                    price: "$399",
                                    desc: "For LDCs & Climate-Vulnerable regions",
                                    highlight: true
                                },
                                {
                                    title: "Scholarship",
                                    price: "Fully Funded",
                                    desc: "Limited slots for exceptional founders",
                                    highlight: false
                                }
                            ].map((plan, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className={`p-10 rounded-[2.5rem] flex flex-col items-center text-center transition-all ${plan.highlight
                                        ? 'bg-[#0B2C24] text-white shadow-2xl scale-105 z-10'
                                        : 'bg-gray-50 text-[#0B2C24] border border-gray-100'
                                        }`}
                                >
                                    <h4 className="text-xl font-bold mb-4">{plan.title}</h4>
                                    <div className="text-4xl md:text-5xl font-black mb-6">
                                        {plan.price}
                                    </div>
                                    <p className={`mb-12 ${plan.highlight ? 'text-green-100' : 'text-gray-500'}`}>
                                        {plan.desc}
                                    </p>
                                    <button
                                        onClick={() => openForm('plan', plan.title)}
                                        className={`mt-auto w-full py-4 rounded-full font-bold transition-all ${plan.highlight
                                            ? 'bg-[#F4C430] text-[#0B2C24] hover:shadow-[0_0_15px_rgba(244,196,48,0.5)]'
                                            : 'bg-white border-2 border-[#0B2C24] hover:bg-[#0B2C24] hover:text-white'
                                            }`}>
                                        Select Plan
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                        <p className="text-center mt-12 text-sm text-gray-500 italic italic">
                            *Note: Fees cover curriculum, platform access, and Summit entry. Travel stipends available.
                        </p>
                    </div>
                </section>

                {/* Section 9: Footer & CTA */}
                <section className="relative py-24 overflow-hidden bg-[#0B2C24]">
                    <div className="absolute inset-0 opacity-20">
                        <Image
                            src="/images/catalyst-hero.png"
                            alt="Women in field"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="container mx-auto px-6 relative z-10 text-center text-white">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-5xl md:text-7xl font-bold mb-6">The Harvest is Waiting.</h2>
                            <p className="text-2xl mb-12 text-green-100 max-w-2xl mx-auto">
                                Applications open March 2026. Don&apos;t miss the chance to define the future of food.
                            </p>

                            <button
                                onClick={() => openForm('apply')}
                                className="px-12 py-6 bg-[#F4C430] text-[#0B2C24] text-2xl font-black rounded-full hover:scale-105 transition-transform shadow-3xl">
                                Join the Waitlist / Apply Now
                            </button>
                        </motion.div>
                    </div>
                </section>
            </div>

            {/* Catalyst W Form Modals */}
            {activeForm && (
                <CatalystFormModal
                    type={activeForm as CatalystFormType}
                    planTier={activePlanTier}
                    onClose={() => { setActiveForm(null); setActivePlanTier(undefined); }}
                />
            )}
        </>
    );
};

export default WomanYearPage;
