'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Heart, BookOpen, Globe, Users, ArrowRight,
    CheckCircle, Lightbulb, BarChart2, ArrowLeft,
} from 'lucide-react';
import KnowledgeHubNavbar from '../components/KnowledgeHubNavbar';
import KnowledgeHubFooter from '../components/KnowledgeHubFooter';

const PRESET_AMOUNTS = [5, 10, 25, 50];

const impactItems = [
    { icon: BookOpen, title: 'Free research access', description: 'Keeps whitepapers, research papers, and best practices free for all users.' },
    { icon: Lightbulb, title: 'Expert content', description: 'Supports expert contributors who share knowledge with the community.' },
    { icon: BarChart2, title: 'Market intelligence', description: 'Funds data collection and analysis for agribusiness market reports.' },
    { icon: Globe, title: 'Reach across Africa', description: 'Helps us serve farmers and agripreneurs in 15+ countries on the continent.' },
];

export default function DonatePage() {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
    const [customAmount, setCustomAmount] = useState('');
    const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
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
        if (!finalAmount || finalAmount < 1) { setError('Please enter a valid donation amount (minimum $1).'); return; }

        setLoading(true);
        try {
            const res = await fetch('/api/donations/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    firstName: firstName || undefined,
                    amount: finalAmount,
                    frequency,
                    message: message || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong. Please try again.');
                return;
            }

            // Redirect to Paystack Checkout
            window.location.href = data.authorization_url;
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <KnowledgeHubNavbar />

            {/* Hero */}
            <section className="bg-[#050A08] relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-green-500/10 rounded-full blur-[80px]" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
                    <Link
                        href="/knowledgehub"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-8 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Knowledge Hub
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
                            <Heart className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-sm text-gray-300 font-medium">Support the Knowledge Hub</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-5">
                            Keep knowledge<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                free for Africa.
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            The AgriPro Knowledge Hub is free for everyone. Your donation keeps it that way — funding research access, expert content, and market intelligence for agribusiness professionals across the continent.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main content */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-5 gap-12 items-start">

                        {/* Left — impact + testimonial */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">
                                    Your impact
                                </span>
                                <h2 className="text-2xl font-black text-gray-900 mb-6">Every dollar keeps the hub running.</h2>
                            </div>

                            <div className="space-y-4">
                                {impactItems.map((item, i) => (
                                    <motion.div
                                        key={item.title}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="flex gap-4 bg-white rounded-2xl p-5 border border-gray-100"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                                            <item.icon className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm mb-0.5">{item.title}</p>
                                            <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="bg-gray-900 rounded-2xl p-6 mt-6">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Knowledge Hub by the numbers</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { value: '200+', label: 'Research papers' },
                                        { value: '15+', label: 'Countries served' },
                                        { value: '50+', label: 'Expert contributors' },
                                        { value: 'Free', label: 'Always free to access' },
                                    ].map((s) => (
                                        <div key={s.label}>
                                            <p className="text-white font-black text-2xl">{s.value}</p>
                                            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right — donation form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-3"
                        >
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10">
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Make a donation</h3>
                                <p className="text-gray-500 text-sm mb-8">Secure payments via Paystack. All amounts in USD.</p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Frequency toggle */}
                                    <div>
                                        <p className="text-sm font-bold text-gray-700 mb-3">Frequency</p>
                                        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-full">
                                            {(['one-time', 'monthly'] as const).map((f) => (
                                                <button
                                                    key={f}
                                                    type="button"
                                                    onClick={() => setFrequency(f)}
                                                    className={`py-2.5 rounded-full text-sm font-bold transition-all ${
                                                        frequency === f
                                                            ? 'bg-white text-gray-900 shadow-sm'
                                                            : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                                >
                                                    {f === 'one-time' ? 'One-time' : 'Monthly'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Amount presets */}
                                    <div>
                                        <p className="text-sm font-bold text-gray-700 mb-3">
                                            Amount <span className="text-gray-400 font-normal">(USD)</span>
                                        </p>
                                        <div className="grid grid-cols-4 gap-2 mb-3">
                                            {PRESET_AMOUNTS.map((amt) => (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => handleAmountSelect(amt)}
                                                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                                                        selectedAmount === amt
                                                            ? 'border-green-600 bg-green-50 text-green-700'
                                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                    }`}
                                                >
                                                    ${amt}
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
                                                        ? 'border-green-600 bg-green-50/30'
                                                        : 'border-gray-200 focus:border-green-500'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Personal details */}
                                    <div className="space-y-3">
                                        <p className="text-sm font-bold text-gray-700">Your details</p>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First name (optional)"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                        />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email address *"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                        />
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Leave a message (optional)"
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-green-500 transition-all resize-none"
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
                                        className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                Redirecting to payment...
                                            </span>
                                        ) : (
                                            <>
                                                <Heart size={16} />
                                                Donate {finalAmount >= 1 ? `$${finalAmount.toFixed(2)}` : ''}{frequency === 'monthly' ? '/mo' : ''}
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center gap-6 text-xs text-gray-400 pt-1">
                                        <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-500" /> Secure payment</span>
                                        <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-500" /> Powered by Paystack</span>
                                        <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-500" /> Receipt by email</span>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <KnowledgeHubFooter />
        </div>
    );
}
