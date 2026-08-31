'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
    Heart, ArrowRight, ArrowLeft, CheckCircle2, Target,
    Handshake, Users, Zap, TrendingUp, Quote,
} from 'lucide-react';

const IMPACT_TIERS = [
    {
        amount: 50,
        title: 'Get a founder to the table',
        description: 'Helps cover transport and local costs so a founder can show up to a matchmaking session with a real buyer or investor — in person, not over email.',
    },
    {
        amount: 150,
        title: 'Fund one diagnostic',
        description: 'Covers the Assess phase for one founder — the deep-dive that pinpoints the exact constraint holding her business back, before we go find who can break it.',
    },
    {
        amount: 500,
        title: 'Send a founder to the Summit',
        description: 'Contributes toward one founder\'s travel and accommodation for the Africa Food Futures Summit — where the connections made in the accelerator get closed.',
        highlight: true,
    },
    {
        amount: 1000,
        title: 'Back a founder for 12 weeks',
        description: 'Helps underwrite one founder\'s full place in the accelerator — diagnosis, matchmaking, pitch prep, and a seat at the Summit.',
    },
];

const engineSteps = [
    { icon: Target, title: 'Assess', description: 'We diagnose the one constraint actually holding her business back.' },
    { icon: Handshake, title: 'Connect', description: 'We introduce her directly to the investor, buyer or partner who can break it.' },
    { icon: Zap, title: 'Equip', description: 'We prep her to close — pitch, data room, negotiation — not just talk.' },
];

export default function CatalystWDonatePage() {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(150);
    const [customAmount, setCustomAmount] = useState('');
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const finalAmount = selectedAmount !== null ? selectedAmount : parseFloat(customAmount) || 0;

    const handleAmountSelect = (amt: number) => {
        setSelectedAmount(amt);
        setCustomAmount('');
    };

    const handleCustomAmount = (val: string) => {
        setCustomAmount(val);
        setSelectedAmount(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) { setError('Please enter your email address.'); return; }
        if (!finalAmount || finalAmount < 1) { setError('Please enter a valid amount (minimum $1).'); return; }

        setLoading(true);
        try {
            const res = await fetch('/api/donations/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    firstName: firstName || undefined,
                    amount: finalAmount,
                    frequency: 'one-time',
                    message: message || undefined,
                    campaign: 'catalyst_w',
                    callbackPath: '/womanyear/donate/success',
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong. Please try again.');
                return;
            }

            window.location.href = data.authorization_url;
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#0B2C24]">
            {/* Hero */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#06140E]">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/catalyst-hero.png"
                        alt="Women agripreneurs across Africa"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#06140E] via-[#06140E]/90 to-[#06140E]/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06140E] via-transparent to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-20 pt-28 pb-16">
                    <Link
                        href="/womanyear"
                        className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Catalyst W
                    </Link>

                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
                        className="max-w-2xl"
                    >
                        <motion.div
                            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                            className="flex items-center gap-4 mb-8"
                        >
                            <span className="h-px w-10 bg-[#F4C430]" />
                            <span className="text-[11px] uppercase tracking-[0.28em] text-white/75 font-medium">
                                Fund the Accelerator &amp; the Summit
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
                            className="text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight mb-7 text-white"
                        >
                            $100 billion is missing<br />
                            from women in African agriculture.<br />
                            <span className="text-[#F4C430]">40 founders are closing it.</span>
                        </motion.h1>

                        <motion.p
                            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                            className="text-lg text-white/70 max-w-xl leading-relaxed mb-4"
                        >
                            Catalyst W doesn&apos;t train founders and wish them luck. We diagnose exactly what&apos;s blocking each business, then put the founder in the room with the investor, buyer or partner who can break it. Your gift funds that connection.
                        </motion.p>

                        <motion.div
                            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                        >
                            <a
                                href="#give"
                                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#F4C430] hover:bg-white text-[#0B2C24] font-semibold rounded-sm transition-colors mt-2"
                            >
                                Fund a founder <ArrowRight size={17} />
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Why it matters */}
            <section className="py-20 bg-[#F9FAF9]">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0B2C24]/5 text-[#0B2C24] text-xs font-black uppercase tracking-[0.2em] mb-5">
                                Why now
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                                Women grow 80% of Africa&apos;s food.<br />
                                They get almost none of the capital.
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                A $100B financing gap holds back the women who run most of the continent&apos;s agricultural labor. Closing it isn&apos;t charity — it&apos;s the single largest untapped growth opportunity in African agriculture, worth an estimated $1 trillion in GDP. Catalyst W exists to convert that potential into real businesses, real deals, and real jobs. Your donation is what makes the connecting possible.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <span className="block text-3xl font-black text-[#0B2C24]">$1 Trillion</span>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">Potential GDP increase</span>
                                </div>
                                <div>
                                    <span className="block text-3xl font-black text-[#0B2C24]">45 Million</span>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">People lifted from insecurity</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {engineSteps.map((step, i) => (
                                <motion.div
                                    key={step.title}
                                    initial={{ opacity: 0, x: 16 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-100"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-[#0B2C24] flex items-center justify-center shrink-0">
                                        <step.icon className="w-5 h-5 text-[#F4C430]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#0B2C24] mb-1">{step.title}</p>
                                        <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                            <div className="bg-[#0B2C24] text-white rounded-2xl p-6 flex items-start gap-3">
                                <Quote className="w-5 h-5 text-[#F4C430] shrink-0 mt-0.5" />
                                <p className="text-sm text-white/80 leading-relaxed italic">
                                    Every dollar goes toward moving a founder through this engine — not toward a curriculum sitting on a shelf.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact tiers + Form */}
            <section id="give" className="py-24 bg-[#050A08] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#F4C430]/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 relative">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-5">
                            Where your money goes
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                            Pick what you want to fund.
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-10 items-start">
                        {/* Impact tiers */}
                        <div className="lg:col-span-2 space-y-3">
                            {IMPACT_TIERS.map((tier, i) => (
                                <motion.button
                                    key={tier.amount}
                                    type="button"
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06 }}
                                    onClick={() => handleAmountSelect(tier.amount)}
                                    className={`w-full text-left rounded-2xl p-5 border transition-all ${
                                        selectedAmount === tier.amount
                                            ? 'border-[#F4C430] bg-[#F4C430]/10'
                                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`font-black text-xl ${selectedAmount === tier.amount ? 'text-[#F4C430]' : 'text-white'}`}>
                                            ${tier.amount}
                                        </span>
                                        {tier.highlight && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F4C430]/15 text-[#F4C430]">
                                                Most funded
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-semibold text-white mb-1">{tier.title}</p>
                                    <p className="text-xs text-white/50 leading-relaxed">{tier.description}</p>
                                </motion.button>
                            ))}
                        </div>

                        {/* Donation form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-3"
                        >
                            <div className="bg-white rounded-3xl p-8 sm:p-10">
                                <h3 className="text-2xl font-black text-[#0B2C24] mb-2">Fund a founder</h3>
                                <p className="text-gray-500 text-sm mb-8">Secure payment via Paystack. All amounts in USD.</p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <p className="text-sm font-bold text-gray-700 mb-3">
                                            Amount <span className="text-gray-400 font-normal">(USD)</span>
                                        </p>
                                        <div className="grid grid-cols-4 gap-2 mb-3">
                                            {IMPACT_TIERS.map((tier) => (
                                                <button
                                                    key={tier.amount}
                                                    type="button"
                                                    onClick={() => handleAmountSelect(tier.amount)}
                                                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                                                        selectedAmount === tier.amount
                                                            ? 'border-[#0B2C24] bg-[#0B2C24]/5 text-[#0B2C24]'
                                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                    }`}
                                                >
                                                    ${tier.amount}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                                            <input
                                                type="number"
                                                value={customAmount}
                                                onChange={(e) => handleCustomAmount(e.target.value)}
                                                placeholder="Custom amount"
                                                min="1"
                                                step="0.01"
                                                className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl text-sm text-gray-900 focus:outline-none transition-all ${
                                                    selectedAmount === null && customAmount
                                                        ? 'border-[#0B2C24] bg-gray-50'
                                                        : 'border-gray-200 focus:border-[#0B2C24]'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-sm font-bold text-gray-700">Your details</p>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First name (optional)"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0B2C24] transition-all"
                                        />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email address *"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0B2C24] transition-all"
                                        />
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Leave a message for the founders (optional)"
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0B2C24] transition-all resize-none"
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {error && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl"
                                            >
                                                {error}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        type="submit"
                                        disabled={loading || finalAmount < 1}
                                        className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0B2C24] text-white font-bold rounded-full hover:bg-[#0d3a2e] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                Redirecting to payment...
                                            </span>
                                        ) : (
                                            <>
                                                <Heart size={16} />
                                                Fund {finalAmount >= 1 ? `$${finalAmount.toFixed(2)}` : 'a founder'}
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>

                                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-xs text-gray-400 pt-1">
                                        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500" /> Secure payment</span>
                                        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500" /> Powered by Paystack</span>
                                        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500" /> Receipt by email</span>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Closing */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center max-w-2xl">
                    <div className="w-14 h-14 rounded-full bg-[#0B2C24]/5 flex items-center justify-center mx-auto mb-6">
                        <Users className="w-6 h-6 text-[#0B2C24]" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        40 founders. 25 fellows. One Summit in Rwanda this March.
                    </h2>
                    <p className="text-gray-500 leading-relaxed mb-8">
                        Everyone who walks into the Africa Food Futures Summit will have gone through the same engine — diagnosed, connected, and prepared. Your gift is what keeps that engine running for the next cohort.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="#give"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#0B2C24] text-white font-bold rounded-full text-sm hover:bg-[#0d3a2e] transition-all"
                        >
                            <Heart size={15} /> Fund a founder
                        </a>
                        <Link
                            href="/womanyear"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-full text-sm hover:border-gray-300 transition-all"
                        >
                            <TrendingUp size={15} /> Learn about Catalyst W
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
