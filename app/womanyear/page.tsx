'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CatalystFormModal, { CatalystFormType } from './CatalystFormModal';
import CatalystFellowsStrip from './CatalystFellowsStrip';
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
                <section className="relative min-h-screen flex items-center overflow-hidden bg-[#06140E]">
                    {/* Background image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/catalyst-hero.png"
                            alt="Women agripreneurs across Africa"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Restrained editorial gradient — legible left column, image visible on the right */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#06140E] via-[#06140E]/90 to-[#06140E]/30" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#06140E] via-transparent to-transparent" />
                    </div>

                    <div className="container mx-auto px-6 relative z-20 text-white pt-32 pb-20">
                        <motion.div
                            initial="hidden"
                            animate="show"
                            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
                            className="max-w-3xl"
                        >
                            {/* Kicker */}
                            <motion.div
                                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                                className="flex items-center gap-4 mb-9"
                            >
                                <span className="h-px w-10 bg-[#F4C430]" />
                                <span className="text-[11px] md:text-xs uppercase tracking-[0.28em] text-white/75 font-medium">
                                    Catalyst&nbsp;W · Women&apos;s Agribusiness Accelerator
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
                                className="text-[2.5rem] leading-[1.08] md:text-5xl lg:text-[3.75rem] lg:leading-[1.06] font-semibold tracking-tight mb-8"
                            >
                                The Pan-African launchpad<br className="hidden sm:block" /> for{' '}
                                <span className="text-[#F4C430]">women agripreneurs</span>.
                            </motion.h1>

                            {/* Standfirst */}
                            <motion.p
                                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                className="text-lg md:text-xl text-white/65 max-w-xl leading-relaxed font-light mb-11"
                            >
                                A 12-week, action-oriented accelerator connecting 40 women agribusiness owners directly to the partners, markets and capital they need. Not a course — a catalyst.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                className="flex flex-col sm:flex-row sm:items-center gap-5 mb-16"
                            >
                                <button
                                    onClick={() => openForm('apply')}
                                    className="group px-7 py-3.5 bg-[#F4C430] hover:bg-white text-[#0B2C24] font-semibold rounded-sm transition-colors flex items-center justify-center gap-2.5"
                                >
                                    Apply for Cohort 2026
                                    <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                                <button
                                    onClick={() => openForm('prospectus')}
                                    className="group inline-flex items-center justify-center gap-2.5 text-white/85 hover:text-white font-medium transition-colors"
                                >
                                    <Download size={17} className="text-[#F4C430]" />
                                    Download prospectus
                                </button>
                            </motion.div>

                            {/* Metadata row */}
                            <motion.div
                                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 border-t border-white/15 pt-7 max-w-2xl"
                            >
                                {[
                                    { value: "40", label: "Founders" },
                                    { value: "12 weeks", label: "Sep 1 – Nov 23" },
                                    { value: "4", label: "Impact tracks" },
                                    { value: "Kigali", label: "Summit · December" },
                                ].map((s) => (
                                    <div key={s.label} className="flex flex-col">
                                        <span className="text-xl md:text-2xl font-semibold text-white leading-none">{s.value}</span>
                                        <span className="text-[11px] uppercase tracking-[0.14em] text-white/45 mt-2">{s.label}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Section 1.5: Key Dates Band */}
                <section className="bg-[#0B2C24] border-y border-white/10">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
                            {[
                                { icon: <Calendar className="text-[#F4C430]" size={20} />, label: "Applications open", value: "July 6, 2026" },
                                { icon: <Calendar className="text-[#F4C430]" size={20} />, label: "Applications close", value: "End of Aug 2026" },
                                { icon: <Zap className="text-[#F4C430]" size={20} />, label: "Accelerator (12 weeks)", value: "Sep 1 – Nov 23" },
                                { icon: <Target className="text-[#F4C430]" size={20} />, label: "Africa Food Futures Summit", value: "First week of Dec" },
                            ].map((d, i) => (
                                <div key={i} className="flex flex-col items-center text-center gap-2 py-8 px-3">
                                    <div className="hidden sm:block">{d.icon}</div>
                                    <span className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-green-300/70 font-bold">{d.label}</span>
                                    <span className="text-base md:text-2xl font-black text-white leading-tight">{d.value}</span>
                                </div>
                            ))}
                        </div>
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

                {/* Section 3: Why Our Connections Are Real */}
                <section className="py-24 bg-[#F9FAF9]">
                    <div className="container mx-auto px-6">
                        <div className="max-w-3xl mb-16">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0B2C24]/5 text-[#0B2C24] text-xs font-black uppercase tracking-[0.2em] mb-5">
                                The unfair advantage
                            </span>
                            <motion.h2
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
                            >
                                Most accelerators give you a contact.<br />
                                <span className="text-[#F4C430]">We give you a connection that&apos;s real.</span>
                            </motion.h2>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                A warm intro you chase for months isn&apos;t access. Because AgriPro <span className="font-bold text-[#0B2C24]">operates the market rails</span> — data, logistics, offtake and policy access — the partners we connect you to can actually transact. When we open a door, it&apos;s already open.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    icon: <Zap className="text-[#F4C430]" />,
                                    rail: "Market data",
                                    title: "Real numbers behind your pitch",
                                    desc: "Live pricing and demand data from the Ayeeko platform — so the figures you take to an investor are defensible, not guessed."
                                },
                                {
                                    icon: <Truck className="text-[#F4C430]" />,
                                    rail: "Logistics",
                                    title: "Supply you can actually fulfil",
                                    desc: "Cold storage, aggregation and transport through SmartChain — so a new buyer order is one you can deliver on, at scale."
                                },
                                {
                                    icon: <Handshake className="text-[#F4C430]" />,
                                    rail: "Offtake",
                                    title: "A buyer intro that becomes an order",
                                    desc: "Guaranteed offtake trials and premium pricing via Green Markets — turning a market connection into a real first contract."
                                },
                                {
                                    icon: <Building2 className="text-[#F4C430]" />,
                                    rail: "Policy access",
                                    title: "A seat at the table that sets the rules",
                                    desc: "Direct lines to ministries through our Policy & Insights Lab — so your voice reaches the people who shape the market you operate in."
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-7 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col"
                                >
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <span className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-bold mb-2">{item.rail}</span>
                                    <h4 className="text-lg font-bold mb-3 leading-snug text-[#0B2C24]">{item.title}</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        <p className="text-center text-gray-500 max-w-2xl mx-auto mt-14 text-sm">
                            We own the rails. That&apos;s why the connections we make in the next 12 weeks hold up after the program ends.
                        </p>
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

                {/* Section 5: How It Works — The Engine */}
                <section className="py-24 bg-[#F9FAF9]">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0B2C24]/5 text-[#0B2C24] text-xs font-black uppercase tracking-[0.2em] mb-5">
                                How it works
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                We don&apos;t teach you a curriculum.<br />
                                <span className="text-[#F4C430]">We solve your specific problem.</span>
                            </h2>
                            <p className="text-xl text-gray-600">
                                Every founder enters with a different bottleneck. So we run a simple, repeatable engine on <span className="font-bold text-[#0B2C24]">your</span> business — diagnosing the real constraint, then making the exact connection that breaks it.
                            </p>
                        </div>

                        {/* The 3-step engine */}
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                {
                                    step: "01",
                                    title: "Assess",
                                    desc: "We diagnose your single biggest constraint right now — capital, market access, supply, or compliance. No generic syllabus.",
                                    icon: <Target className="text-[#F4C430]" size={28} />
                                },
                                {
                                    step: "02",
                                    title: "Connect",
                                    desc: "We introduce you directly to the one partner who can move the needle — an investor, an offtake buyer, a logistics provider, or a policymaker.",
                                    icon: <Handshake className="text-[#F4C430]" size={28} />
                                },
                                {
                                    step: "03",
                                    title: "Equip",
                                    desc: "Targeted prep — pitch coaching, data room, term-sheet readiness — so you walk into that connection ready to close, not just talk.",
                                    icon: <Zap className="text-[#F4C430]" size={28} />
                                }
                            ].map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.12 }}
                                    className="relative bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
                                >
                                    <span className="absolute top-6 right-7 text-5xl font-black text-gray-100 select-none">{s.step}</span>
                                    <div className="w-14 h-14 bg-[#0B2C24] rounded-2xl flex items-center justify-center mb-6">
                                        {s.icon}
                                    </div>
                                    <h4 className="text-2xl font-bold mb-3 text-[#0B2C24]">{s.title}</h4>
                                    <p className="text-gray-600 leading-relaxed">{s.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 5b: The 12-Week Timeline */}
                <section className="py-24 bg-[#0B2C24] text-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">12 Weeks of Action.</h2>
                            <p className="text-xl text-green-200">September 1 – November 23, 2026. Then we take it to the Summit.</p>
                        </div>

                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/20 -translate-y-1/2 hidden md:block" />

                            <div className="grid md:grid-cols-4 gap-8 relative z-10">
                                {[
                                    { week: "Weeks 1–3", title: "Diagnose", desc: "Deep-dive on your business. We pinpoint the constraint to break." },
                                    { week: "Weeks 4–7", title: "Matchmake", desc: "Direct introductions to the partner who can unlock your next stage." },
                                    { week: "Weeks 8–10", title: "Prepare", desc: "Pitch, data room and negotiation prep — built for the specific deal." },
                                    { week: "Weeks 11–12", title: "Close", desc: "Convert the connection. Lock in capital, offtake, or partnership." }
                                ].map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors relative"
                                    >
                                        <span className="block text-[#F4C430] font-bold mb-2">{step.week}</span>
                                        <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                                        <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                                        <div className="w-4 h-4 bg-[#F4C430] rounded-full absolute -bottom-2 md:bottom-auto md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-[#0B2C24] hidden md:block" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-12 text-center">
                            <span className="inline-block px-8 py-3 bg-[#F4C430] text-[#0B2C24] font-bold rounded-full text-xl shadow-[0_0_20px_rgba(244,196,48,0.4)]">
                                First Week of December: THE SUMMIT
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
                                    <Calendar size={14} className="text-[#F4C430]" /> First Week of December 2026
                                </span>
                            </div>

                            {/* Theme */}
                            <p className="text-2xl md:text-3xl font-light italic text-white/80 mb-6 border-l-4 border-[#F4C430] pl-6">
                                Where the 40 accelerator founders &amp; 25 fellows turn momentum into deals.
                            </p>
                            <p className="text-lg text-white/70 mb-14 max-w-2xl">
                                Not another conference of abstract panels. The Summit mobilizes every attendee into focused work groups built to deliver tangible support — capital, contracts and commitments — to the founders on stage.
                            </p>

                            {/* Benefit cards */}
                            <ul className="grid sm:grid-cols-3 gap-5 mb-14">
                                <li className="flex flex-col gap-4 p-7 bg-white/8 backdrop-blur-sm rounded-2xl border border-white/15 hover:border-[#F4C430]/50 transition-colors">
                                    <Users size={24} className="text-[#F4C430]" />
                                    <p className="font-semibold text-base leading-snug">Showcase the 40 founders &amp; 25 fellows.</p>
                                </li>
                                <li className="flex flex-col gap-4 p-7 bg-white/8 backdrop-blur-sm rounded-2xl border border-white/15 hover:border-[#F4C430]/50 transition-colors">
                                    <Handshake size={24} className="text-[#F4C430]" />
                                    <p className="font-semibold text-base leading-snug">Mobilize work groups, not just discussions.</p>
                                </li>
                                <li className="flex flex-col gap-4 p-7 bg-white/8 backdrop-blur-sm rounded-2xl border border-white/15 hover:border-[#F4C430]/50 transition-colors">
                                    <Target size={24} className="text-[#F4C430]" />
                                    <p className="font-semibold text-base leading-snug">Leave with tangible commitments secured.</p>
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

                {/* Section 6b: The Fellows who run the accelerator */}
                <CatalystFellowsStrip />

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
                                Applications open <span className="font-bold text-[#F4C430]">July 6, 2026</span> and close end of August. Don&apos;t miss the chance to define the future of food.
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
