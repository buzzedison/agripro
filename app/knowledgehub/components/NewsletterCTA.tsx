'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Mail, Heart } from 'lucide-react';
import { useContentAccess } from '@/lib/hooks/useContentAccess';

export default function NewsletterCTA() {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { user } = useContentAccess();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) { setError('Please enter your email address.'); return; }
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/knowledge-hub/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    firstName: firstName || undefined,
                    signupSource: 'newsletter',
                    userId: user?.id,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                setEmail('');
                setFirstName('');
            } else {
                setError(data.error || 'Something went wrong. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gray-950 rounded-3xl overflow-hidden">
            <div className="relative px-8 py-14 sm:px-14 lg:px-16">
                {/* subtle glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[160px] bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left — copy */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
                            <Mail className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Knowledge Hub Newsletter</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                            Stay ahead of<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                African agribusiness.
                            </span>
                        </h2>
                        <p className="text-gray-400 text-base leading-relaxed mb-8">
                            Research papers, market intelligence, expert insights, and best practices — delivered to your inbox.
                        </p>

                        <div className="flex flex-col gap-2.5">
                            {[
                                'Latest whitepapers & research from across Africa',
                                'Expert-curated market data and analysis',
                                'Best practices from successful agribusinesses',
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-2.5">
                                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                    <span className="text-sm text-gray-400">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-3">
                            <Heart className="w-4 h-4 text-green-400 shrink-0" />
                            <p className="text-sm text-gray-500">
                                Enjoying the Knowledge Hub?{' '}
                                <Link href="/knowledgehub/donate" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
                                    Support it with a donation →
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Right — form */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-6"
                                >
                                    <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-7 h-7 text-green-400" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-2">You&apos;re subscribed!</h3>
                                    <p className="text-gray-400 text-sm">Check your inbox — a welcome email is on its way.</p>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    onSubmit={handleSubmit}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <p className="text-white font-bold text-lg mb-1">Subscribe — it&apos;s free</p>
                                    <p className="text-gray-500 text-sm mb-6">Join thousands of agribusiness professionals.</p>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First name (optional)"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500/50 focus:bg-white/8 transition-all"
                                            disabled={loading}
                                        />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email address *"
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500/50 focus:bg-white/8 transition-all"
                                            disabled={loading}
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {error && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="mt-3 text-sm text-red-400"
                                            >
                                                {error}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-900 font-bold rounded-full hover:bg-green-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                Subscribing...
                                            </span>
                                        ) : (
                                            <>Subscribe <ArrowRight size={15} /></>
                                        )}
                                    </button>
                                    <p className="mt-3 text-xs text-gray-600 text-center">No spam. Unsubscribe anytime.</p>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
