'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    MapPin,
    Calendar,
    Users,
    Trophy,
    BarChart3,
    Globe2,
    Mic2,
    ChevronRight,
    ArrowUpRight,
    ShieldCheck,
    Star,
    Hotel
} from 'lucide-react';
import AFFFormModal from './AFFFormModal';
import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';

type FormType = 'register' | 'speaker' | 'partner' | 'sponsor' | 'exhibitor';

interface AFFContent {
    heroTagline?: string;
    heroTitle?: string;
    heroSubheading?: string;
    eventDates?: string;
    eventLocation?: string;
    finalCtaHeadline?: string;
    footerNote?: string;
    pillars?: { title: string; description: string }[];
    speakerIntroText?: string;
    speakerTracks?: string[];
    agendaDays?: { dayNumber: string; date: string; theme: string; description: string }[];
    kigaliTagline?: string;
    registrationTiers?: { name: string; price: string; features: string[]; highlighted?: boolean }[];
    getInvolvedRoles?: { title: string; description: string; ctaLabel: string; formType: string }[];
}

const AFF_QUERY = groq`*[_type == "africaFoodFutures"][0]{
    heroTagline, heroTitle, heroSubheading, eventDates, eventLocation,
    finalCtaHeadline, footerNote, pillars, speakerIntroText, speakerTracks,
    agendaDays, kigaliTagline, registrationTiers, getInvolvedRoles
}`;

const AfricaFoodFuturesPage = () => {
    const [activeForm, setActiveForm] = useState<FormType | null>(null);
    const [cms, setCms] = useState<AFFContent>({});

    useEffect(() => {
        client.fetch<AFFContent>(AFF_QUERY)
            .then((data) => { if (data) setCms(data); })
            .catch(() => {});
    }, []);

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggeringContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <>
            <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#F4C430] selection:text-[#0B2C24]">
                {/* Section 1: Hero - The Immersive Entry */}
                <section id="about" className="relative h-screen flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/aff-hero.png"
                            alt="Africa Food Futures Summit"
                            fill
                            className="object-cover scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0B2C24]/80 via-[#0B2C24]/60 to-white z-10" />
                    </div>

                    <div className="container mx-auto px-6 relative z-20 text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggeringContainer}
                        >
                            <motion.span
                                variants={fadeInUp}
                                className="inline-block px-4 py-1.5 rounded-full bg-[#F4C430]/20 border border-[#F4C430]/30 text-[#F4C430] font-bold text-sm tracking-[0.2em] uppercase mb-8"
                            >
                                {cms.heroTagline ?? 'The Premier Global Gathering'}
                            </motion.span>
                            <motion.h1
                                variants={fadeInUp}
                                className="text-5xl md:text-8xl font-black text-white leading-[1.1] mb-6 tracking-tight"
                            >
                                {cms.heroTitle ?? <>AFRICA FOOD <br /><span className="text-[#F4C430]">FUTURES 2026.</span></>}
                            </motion.h1>
                            <motion.p
                                variants={fadeInUp}
                                className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
                            >
                                {cms.heroSubheading ?? "Where Women, Capital, and Climate converge to redefine the $1 Trillion African agricultural legacy."}
                            </motion.p>

                            <motion.div
                                variants={fadeInUp}
                                className="flex flex-col sm:flex-row items-center justify-center gap-6"
                            >
                                <button onClick={() => setActiveForm('register')} className="px-10 py-5 bg-[#F4C430] hover:bg-[#D4AF37] text-[#0B2C24] font-black rounded-full transition-all flex items-center gap-3 transform hover:scale-105 shadow-[0_20px_40px_rgba(244,196,48,0.3)]">
                                    SECURE YOUR DELEGATE PASS
                                    <ArrowUpRight size={22} />
                                </button>
                                <div className="flex items-center gap-8 text-white/90 font-medium">
                                    <div className="flex flex-col items-start px-6 border-l border-white/20">
                                        <span className="text-[#F4C430] font-bold uppercase text-xs tracking-widest">When</span>
                                        <span>{cms.eventDates ?? 'Oct 14-16, 2026'}</span>
                                    </div>
                                    <div className="flex flex-col items-start px-6 border-l border-white/20">
                                        <span className="text-[#F4C430] font-bold uppercase text-xs tracking-widest">Where</span>
                                        <span>{cms.eventLocation ?? 'Kigali, Rwanda'}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:block"
                    >
                        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                            <motion.div
                                animate={{ y: [0, 12, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-1.5 h-1.5 bg-white rounded-full"
                            />
                        </div>
                    </motion.div>
                </section>

                {/* Section 2: The Core Pillars - World Class Vision */}
                <section className="py-32 bg-white relative overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                            >
                                <h2 className="text-4xl md:text-6xl font-black text-[#0B2C24] mb-8 leading-tight">
                                    Beyond the <span className="text-slate-400">Ordinary</span>.<br />
                                    For the <span className="italic underline decoration-[#F4C430] underline-offset-8">Visionaries</span>.
                                </h2>
                                <p className="text-xl text-slate-600 leading-relaxed mb-12">
                                    Africa Food Futures is not just a summit; it is a high-level orchestration of policy, finance, and grassroots ingenuity. We are assembling the architects of the next agricultural revolution.
                                </p>

                                <div className="space-y-10">
                                    {[
                                        { icon: <Users />, title: "The Gender Dividend", desc: "Unlocking the $100B financing gap for women-led agribusinesses." },
                                        { icon: <BarChart3 />, title: "Capital Ecosystem", desc: "Direct matchmaking between Terranova LPs and post-revenue ventures." },
                                        { icon: <Globe2 />, title: "Climate Resilience", desc: "Scaling IoT and biological inputs for a sustainable future." }
                                    ].map((pillar, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="w-14 h-14 shrink-0 bg-[#0B2C24] text-[#F4C430] rounded-2xl flex items-center justify-center group-hover:bg-[#F4C430] group-hover:text-[#0B2C24] transition-colors duration-300">
                                                {pillar.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold mb-2">{pillar.title}</h4>
                                                <p className="text-slate-500">{pillar.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <div className="relative">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                    className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl"
                                >
                                    <Image src="/images/aff-woman-leader.png" alt="Visionary Leader" width={800} height={1000} className="object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0B2C24]/40 to-transparent" />
                                </motion.div>
                                {/* Decorative element */}
                                <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#F4C430]/10 rounded-full blur-3xl -z-0" />
                                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#0B2C24]/5 rounded-full blur-2xl -z-0" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Keynote Speakers */}
                <section id="speakers" className="py-32 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-20">
                            <span className="text-[#0B2C24] font-black uppercase text-sm tracking-[0.3em]">The Voices of Impact</span>
                            <h2 className="text-4xl md:text-6xl font-black mt-4">2026 KEYNOTE SPEAKERS</h2>
                            <p className="text-slate-500 mt-6 max-w-2xl mx-auto text-lg">
                                We are curating 50+ world-class voices across policy, investment, climate, and agri-tech. Speaker announcements begin Q1 2026.
                            </p>
                        </div>

                        {/* Speaker placeholder grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                            {[
                                { track: "Policy & Governance" },
                                { track: "Investment & Capital" },
                                { track: "Climate & AgriTech" },
                                { track: "Women in Agriculture" },
                                { track: "Trade & Markets" },
                                { track: "Food Systems" },
                                { track: "Youth & Innovation" },
                                { track: "Global Partnerships" },
                            ].map((slot, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.07 }}
                                    className="group"
                                >
                                    <div className="aspect-[3/4] rounded-3xl overflow-hidden relative mb-4 shadow-md">
                                        <Image
                                            src="/images/aff-speaker-placeholder.png"
                                            alt="Speaker to be confirmed"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-[#0B2C24]/0 group-hover:bg-[#0B2C24]/30 transition-colors duration-300" />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-[#F4C430] text-[#0B2C24] rounded-full text-[10px] font-black uppercase tracking-widest">{slot.track}</span>
                                        </div>
                                    </div>
                                    <p className="font-black text-[#0B2C24] text-sm">Speaker Yet to Be Confirmed</p>
                                    <p className="text-slate-400 text-xs mt-1 italic">Announcement coming Q1 2026</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Call for Speakers CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-20 bg-[#0B2C24] rounded-[3rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10"
                        >
                            <div className="text-white text-center md:text-left">
                                <span className="text-[#F4C430] font-black uppercase text-xs tracking-[0.3em] block mb-4">Open Application</span>
                                <h3 className="text-3xl md:text-5xl font-black mb-4">Are You a Thought Leader?</h3>
                                <p className="text-white/60 max-w-xl text-lg font-light leading-relaxed">
                                    We are actively seeking speakers who are shaping the future of African food systems — from the field to the boardroom.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4 shrink-0">
                                <button onClick={() => setActiveForm('speaker')} className="px-10 py-5 bg-[#F4C430] text-[#0B2C24] font-black rounded-full hover:scale-105 transition-transform whitespace-nowrap">
                                    APPLY TO SPEAK
                                </button>
                                <button onClick={() => setActiveForm('speaker')} className="px-10 py-5 border-2 border-white/20 text-white font-bold rounded-full hover:border-[#F4C430] hover:text-[#F4C430] transition-all whitespace-nowrap text-sm">
                                    NOMINATE A SPEAKER
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Section 4: The Experience - Interactive Agenda */}
                <section id="agenda" className="py-32 bg-[#0B2C24] text-white">
                    <div className="container mx-auto px-6">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-black mb-16 text-center italic">Three Days of Transformation.</h2>

                            <div className="space-y-8">
                                {/* Day 1 */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="relative flex flex-col md:flex-row gap-8 p-10 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default"
                                >
                                    <div className="md:w-1/3">
                                        <span className="text-[#F4C430] font-black tracking-widest block mb-1">Day 01 | Oct 14</span>
                                        <h4 className="text-2xl font-bold group-hover:text-[#F4C430] transition-colors">THE OPENING BELL</h4>
                                    </div>
                                    <div className="md:w-2/3">
                                        <p className="text-slate-400 text-lg leading-relaxed">Gala reception followed by the &apos;State of the Harvest&apos; address.</p>
                                    </div>
                                    <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-all">
                                        <Mic2 className="text-[#F4C430]" />
                                    </div>
                                </motion.div>

                                {/* Day 2 */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="relative flex flex-col md:flex-row gap-8 p-10 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default"
                                >
                                    <div className="md:w-1/3">
                                        <span className="text-[#F4C430] font-black tracking-widest block mb-1">Day 02 | Oct 15</span>
                                        <h4 className="text-2xl font-bold group-hover:text-[#F4C430] transition-colors">CAPITAL &amp; CLIMATE</h4>
                                    </div>
                                    <div className="md:w-2/3">
                                        <p className="text-slate-400 text-lg leading-relaxed">Private investor roundtables, Tech Expo, and the Regional Policy Harmonization workshop.</p>
                                    </div>
                                    <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-all">
                                        <Mic2 className="text-[#F4C430]" />
                                    </div>
                                </motion.div>

                                {/* Day 3 — with Gala image */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="relative overflow-hidden rounded-[2rem] border border-white/10 group cursor-default"
                                >
                                    {/* Gala background image */}
                                    <div className="absolute inset-0 z-0">
                                        <Image src="/images/aff-gala.png" alt="She Harvests Gala" fill className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2C24]/95 via-[#0B2C24]/80 to-[#0B2C24]/40" />
                                    </div>
                                    <div className="relative z-10 flex flex-col md:flex-row gap-8 p-10">
                                        <div className="md:w-1/3">
                                            <span className="text-[#F4C430] font-black tracking-widest block mb-1">Day 03 | Oct 16</span>
                                            <h4 className="text-2xl font-bold group-hover:text-[#F4C430] transition-colors">SHE HARVESTS GALA</h4>
                                        </div>
                                        <div className="md:w-2/3">
                                            <p className="text-slate-300 text-lg leading-relaxed">The Pan-African Pitch Perfect finals and the prestigious Woman Farmer of the Year Awards. An evening of celebration, culture, and commitment.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 5: Kigali Spotlight */}
                <section id="kigali" className="py-32 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="rounded-[3rem] overflow-hidden shadow-2xl relative h-[600px]"
                            >
                                <Image src="/images/aff-kcc.png" alt="Kigali Convention Centre at Dusk" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute bottom-10 left-10 text-white">
                                    <h5 className="font-bold flex items-center gap-2"><MapPin size={18} /> KIGALI, RWANDA</h5>
                                    <p className="text-white/80">Africa&apos;s safest, cleanest, and fastest-growing hub.</p>
                                </div>
                            </motion.div>

                            <div>
                                <span className="text-[#0B2C24] font-black uppercase text-sm tracking-[0.3em] mb-4 block">The Host City</span>
                                <h2 className="text-4xl md:text-6xl font-black mb-8">Why Kigali?</h2>
                                <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                                    Known as the &quot;Silicon Valley of Africa,&quot; Kigali offers a world-class infrastructure that mirrors the ambition of Africa Food Futures. Experience the hospitality of the land of a thousand hills.
                                </p>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <ShieldCheck className="text-[#0B2C24] mb-3" />
                                        <h6 className="font-bold mb-1">90-Day Visa Free</h6>
                                        <p className="text-xs text-slate-500">For all African, Commonwealth, and OIF citizens.</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <Hotel className="text-[#0B2C24] mb-3" />
                                        <h6 className="font-bold mb-1">Luxury Logistics</h6>
                                        <p className="text-xs text-slate-500">Curated stay at Marriott, Serena, or Radisson Blu.</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <Globe2 className="text-[#0B2C24] mb-3" />
                                        <h6 className="font-bold mb-1">Sustainability First</h6>
                                        <p className="text-xs text-slate-500">A carbon-neutral summit in a plastic-free city.</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <Trophy className="text-[#0B2C24] mb-3" />
                                        <h6 className="font-bold mb-1">Tech Ecosystem</h6>
                                        <p className="text-xs text-slate-500">Home to Norrsken House and global innovators.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 6: Registration - Premium Tiers */}
                <section id="register" className="py-32 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-7xl font-black mb-6">Choose Your Access.</h2>
                            <p className="text-slate-500 max-w-2xl mx-auto text-xl">
                                Join policy makers, global investors, and tech leaders in October 2026.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                {
                                    tier: "Delegate",
                                    price: "$499",
                                    features: ["All Sessions & Panels", "Tech Expo Access", "Delegate Lunch", "Event Documentation"],
                                    icon: <Users size={32} />
                                },
                                {
                                    tier: "Investor / VIP",
                                    price: "$1,499",
                                    features: ["Priority VIP Seating", "Private LP Dinners", "Deal-Flow Matchmaking", "Airport Transfers"],
                                    popular: true,
                                    icon: <Star size={32} />
                                },
                                {
                                    tier: "Exhibitor",
                                    price: "$2,999+",
                                    features: ["Standard 3x3 Booth", "Lead Retrieval App", "Logo in Prospectus", "2 Delegate Passes"],
                                    icon: <Trophy size={32} />
                                }
                            ].map((plan, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className={`relative p-12 rounded-[3rem] text-center transition-all duration-500 ${plan.popular
                                        ? 'bg-[#0B2C24] text-white shadow-[0_40px_80px_rgba(0,0,0,0.2)] scale-105 z-10'
                                        : 'bg-white text-slate-900 border border-slate-200'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#F4C430] text-[#0B2C24] px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest">
                                            Most Strategic Choice
                                        </div>
                                    )}
                                    <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-8 ${plan.popular ? 'bg-[#F4C430] text-[#0B2C24]' : 'bg-slate-50 text-[#0B2C24]'
                                        }`}>
                                        {plan.icon}
                                    </div>
                                    <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter">{plan.tier}</h4>
                                    <div className="text-5xl font-black mb-10">{plan.price}</div>

                                    <ul className="space-y-4 mb-12 text-left">
                                        {plan.features.map((feat, j) => (
                                            <li key={j} className="flex items-center gap-3 text-sm">
                                                <ShieldCheck size={18} className={plan.popular ? 'text-[#F4C430]' : 'text-green-600'} />
                                                <span className={plan.popular ? 'text-white/70' : 'text-slate-500'}>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button onClick={() => setActiveForm('register')} className={`w-full py-5 rounded-full font-black text-sm uppercase tracking-widest transition-all ${plan.popular
                                        ? 'bg-[#F4C430] text-[#0B2C24] hover:shadow-[0_0_20px_rgba(244,196,48,0.5)]'
                                        : 'bg-[#0B2C24] text-white'
                                        }`}>
                                        REGISTER NOW
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 7: Get Involved — Speakers, Partners, Sponsors */}
                <section id="involved" className="py-32 bg-[#0B2C24] text-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-20">
                            <span className="text-[#F4C430] font-black uppercase text-xs tracking-[0.4em] block mb-4">Shape the Summit</span>
                            <h2 className="text-4xl md:text-7xl font-black tracking-tighter">GET INVOLVED.</h2>
                            <p className="text-white/50 mt-6 max-w-2xl mx-auto text-xl font-light">
                                Africa Food Futures 2026 is built by a coalition of visionaries. There is a role for every changemaker.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Speakers */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:border-[#F4C430]/40 transition-all group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[#F4C430] text-[#0B2C24] flex items-center justify-center mb-8">
                                    <Mic2 size={28} />
                                </div>
                                <h3 className="text-2xl font-black mb-4">Speak at the Summit</h3>
                                <p className="text-white/50 leading-relaxed mb-8">
                                    Share your expertise with 2,000+ delegates from 40+ countries. We welcome keynotes, panels, workshops, and lightning talks.
                                </p>
                                <ul className="space-y-3 mb-10 text-sm text-white/60">
                                    {["Keynote Speaker (45 min)", "Panel Moderator / Panelist", "Workshop Facilitator", "Lightning Talk (10 min)"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <ChevronRight size={14} className="text-[#F4C430] shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => setActiveForm('speaker')} className="w-full py-4 bg-[#F4C430] text-[#0B2C24] font-black rounded-full hover:shadow-[0_0_20px_rgba(244,196,48,0.3)] transition-all">
                                    APPLY TO SPEAK
                                </button>
                            </motion.div>

                            {/* Partners */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="p-10 rounded-[3rem] bg-white text-[#0B2C24] group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[#0B2C24] text-[#F4C430] flex items-center justify-center mb-8">
                                    <Globe2 size={28} />
                                </div>
                                <h3 className="text-2xl font-black mb-4">Become a Partner</h3>
                                <p className="text-slate-500 leading-relaxed mb-8">
                                    Align your organisation with the most significant gathering of African agri-food leaders. Strategic partnerships available for NGOs, development banks, and government bodies.
                                </p>
                                <ul className="space-y-3 mb-10 text-sm text-slate-500">
                                    {["Co-branding & Media Rights", "Delegate Complimentary Passes", "Programme Co-creation", "Research & Report Collaboration"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <ChevronRight size={14} className="text-[#0B2C24] shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => setActiveForm('partner')} className="w-full py-4 bg-[#0B2C24] text-white font-black rounded-full hover:bg-[#F4C430] hover:text-[#0B2C24] transition-all">
                                    PARTNER WITH US
                                </button>
                            </motion.div>

                            {/* Sponsors */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:border-[#F4C430]/40 transition-all group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[#F4C430] text-[#0B2C24] flex items-center justify-center mb-8">
                                    <Trophy size={28} />
                                </div>
                                <h3 className="text-2xl font-black mb-4">Sponsor the Summit</h3>
                                <p className="text-white/50 leading-relaxed mb-8">
                                    Position your brand at the forefront of Africa&apos;s food future. Sponsorship packages from Title Sponsor to Session Sponsor, with full media exposure.
                                </p>
                                <ul className="space-y-3 mb-10 text-sm text-white/60">
                                    {["Title / Platinum Sponsor", "Gold & Silver Packages", "Session & Track Sponsorship", "Gala & Networking Sponsor"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <ChevronRight size={14} className="text-[#F4C430] shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => setActiveForm('sponsor')} className="w-full py-4 bg-[#F4C430] text-[#0B2C24] font-black rounded-full hover:shadow-[0_0_20px_rgba(244,196,48,0.3)] transition-all">
                                    VIEW SPONSOR PACKAGES
                                </button>
                            </motion.div>
                        </div>

                        {/* Exhibitors strip */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-8 p-10 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8"
                        >
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#F4C430] text-[#0B2C24] flex items-center justify-center">
                                        <BarChart3 size={20} />
                                    </div>
                                    <h4 className="text-xl font-black">Exhibit Your Innovation</h4>
                                </div>
                                <p className="text-white/50 max-w-2xl">
                                    Showcase your agri-tech product, solution, or service to 2,000+ buyers, investors, and decision-makers. Limited exhibition floor space available.
                                </p>
                            </div>
                            <button onClick={() => setActiveForm('exhibitor')} className="shrink-0 px-10 py-4 border-2 border-[#F4C430] text-[#F4C430] font-black rounded-full hover:bg-[#F4C430] hover:text-[#0B2C24] transition-all whitespace-nowrap">
                                BOOK EXHIBITION SPACE
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* Section 8: Final CTA & Partners */}
                <section className="py-32 bg-white relative overflow-hidden">
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-8xl font-black text-[#0B2C24] mb-12 tracking-tighter">
                                THE FUTURE IS <br />
                                <span className="text-[#F4C430]">BEING WRITTEN.</span>
                            </h2>
                            <p className="text-2xl text-slate-500 mb-16 max-w-3xl mx-auto font-light">
                                Be in the room where the decisions that shape African food security are made.
                            </p>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-32">
                                <button onClick={() => setActiveForm('partner')} className="px-12 py-6 bg-[#0B2C24] text-white text-xl font-black rounded-full hover:scale-105 transition-transform shadow-2xl">
                                    BECOME A PARTNER
                                </button>
                                <button onClick={() => setActiveForm('sponsor')} className="px-12 py-6 border-4 border-[#0B2C24] text-[#0B2C24] text-xl font-black rounded-full hover:bg-[#0B2C24] hover:text-white transition-all">
                                    REQUEST SPONSOR PACK
                                </button>
                            </div>

                        </motion.div>
                    </div>
                    {/* Visual texture */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none">
                        <div className="grid grid-cols-12 h-full">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="border-r border-[#0B2C24]" />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer Hook */}
                <footer className="py-20 bg-slate-50 border-t border-slate-100 mt-20">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-4 gap-12">
                            <div className="col-span-2">
                                <div className="text-3xl font-black text-[#0B2C24] mb-6">AgriPro <span className="text-[#F4C430]">Summit.</span></div>
                                <p className="text-slate-500 max-w-sm mb-8">
                                    Africa Food Futures is the flagship convening of the AgriPro Hub, dedicated to the 2026 UN Year of the Woman Farmer.
                                </p>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#0B2C24] flex items-center justify-center text-white cursor-pointer hover:bg-[#F4C430] hover:text-[#0B2C24] transition-all">FB</div>
                                    <div className="w-10 h-10 rounded-full bg-[#0B2C24] flex items-center justify-center text-white cursor-pointer hover:bg-[#F4C430] hover:text-[#0B2C24] transition-all">TW</div>
                                    <div className="w-10 h-10 rounded-full bg-[#0B2C24] flex items-center justify-center text-white cursor-pointer hover:bg-[#F4C430] hover:text-[#0B2C24] transition-all">IN</div>
                                </div>
                            </div>
                            <div>
                                <h6 className="font-black uppercase text-xs tracking-widest mb-6">Quick Links</h6>
                                <ul className="space-y-4 text-slate-500 font-medium">
                                    <li><a href="#about" className="hover:text-[#0B2C24] transition-colors">About the Summit</a></li>
                                    <li><a href="#speakers" className="hover:text-[#0B2C24] transition-colors">Speakers</a></li>
                                    <li><a href="#agenda" className="hover:text-[#0B2C24] transition-colors">Agenda</a></li>
                                    <li><a href="#kigali" className="hover:text-[#0B2C24] transition-colors">Kigali</a></li>
                                    <li><a href="#register" className="hover:text-[#0B2C24] transition-colors">Register</a></li>
                                    <li><a href="#involved" className="hover:text-[#0B2C24] transition-colors">Get Involved</a></li>
                                </ul>
                            </div>
                            <div>
                                <h6 className="font-black uppercase text-xs tracking-widest mb-6">Contact</h6>
                                <a href="mailto:info@agriprohub.com" className="text-slate-500 hover:text-[#0B2C24] transition-colors mb-6 block">info@agriprohub.com</a>
                                <p className="text-slate-400 text-xs italic">Rwanda · October 14–16, 2026</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Form Modals */}
            {
                activeForm && (
                    <AFFFormModal
                        type={activeForm as FormType}
                        onClose={() => setActiveForm(null)}
                    />
                )
            }
        </>
    );
};

export default AfricaFoodFuturesPage;
