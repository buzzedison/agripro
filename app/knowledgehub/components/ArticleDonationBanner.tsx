'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'kh_donated';
const DISMISSED_KEY = 'kh_donate_dismissed_until';

export default function ArticleDonationBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Don't show if they've donated
        if (localStorage.getItem(STORAGE_KEY) === 'true') return;

        // Don't show if dismissed within the last 7 days
        const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
        if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) return;

        // Small delay so it doesn't flash immediately on load
        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
    }, []);

    const dismiss = () => {
        // Snooze for 7 days
        localStorage.setItem(DISMISSED_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.4 }}
                    className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-10"
                >
                    <div className="relative bg-gray-950 rounded-2xl px-6 py-5 sm:px-8 flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Glow */}
                        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[80px] bg-green-500/10 rounded-full blur-[40px]" />
                        </div>

                        {/* Icon */}
                        <div className="relative shrink-0 w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-green-400" />
                        </div>

                        {/* Copy */}
                        <div className="relative flex-1 min-w-0">
                            <p className="text-white font-bold text-sm leading-snug">
                                The AgriPro Knowledge Hub is free for everyone.
                            </p>
                            <p className="text-gray-500 text-sm mt-0.5">
                                If this content was useful, consider a small donation to keep it running.
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="relative shrink-0 flex items-center gap-3">
                            <Link
                                href="/knowledgehub/donate"
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-gray-900 font-bold rounded-full text-sm hover:bg-green-50 transition-all"
                            >
                                Donate <ArrowRight size={13} />
                            </Link>
                            <button
                                onClick={dismiss}
                                aria-label="Dismiss"
                                className="text-gray-600 hover:text-gray-400 transition-colors p-1"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
