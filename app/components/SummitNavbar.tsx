'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Menu, X, ChevronRight } from 'lucide-react';

const summitLinks = [
    { label: 'About', href: '#about' },
    { label: 'Speakers', href: '#speakers' },
    { label: 'Agenda', href: '#agenda' },
    { label: 'Kigali', href: '#kigali' },
    { label: 'Get Involved', href: '#involved' },
];

export default function SummitNavbar() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.body.style.overflow = isOpen ? 'hidden' : '';
        }
        return () => {
            if (typeof window !== 'undefined') document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* Always-dark summit navbar */}
            <nav className="sticky top-0 z-50 bg-[#0B2C24] border-b border-white/10 shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">

                        {/* LEFT: Wordmark */}
                        <div className="flex flex-col leading-none shrink-0">
                            <span className="text-white font-black text-sm md:text-base tracking-[0.12em] uppercase">
                                Africa Food Futures
                            </span>
                            <span className="text-[#F4C430] font-bold text-[9px] tracking-[0.35em] uppercase mt-0.5">
                                Rwanda · March 2027
                            </span>
                        </div>

                        {/* CENTRE: Desktop nav links */}
                        <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
                            {summitLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="px-4 py-2 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* RIGHT: Back to Home + Register */}
                        <div className="hidden lg:flex items-center gap-3 shrink-0">
                            <Link
                                href="/"
                                className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-xs font-semibold group"
                            >
                                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                                AgriPro Home
                            </Link>
                            <div className="w-px h-5 bg-white/20" />
                            <a
                                href="#register"
                                className="px-6 py-2.5 bg-[#F4C430] text-[#0B2C24] font-black text-sm rounded-full hover:bg-yellow-300 transition-colors"
                            >
                                Register
                            </a>
                        </div>

                        {/* MOBILE: Back link + Hamburger */}
                        <div className="flex lg:hidden items-center gap-3">
                            <Link
                                href="/"
                                className="flex items-center gap-1 text-white/50 hover:text-[#F4C430] transition-colors text-xs font-semibold"
                            >
                                <ArrowLeft size={13} />
                                Home
                            </Link>
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>

                    </div>
                </div>
            </nav>

            {/* Mobile dropdown menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="fixed top-16 left-0 right-0 z-50 lg:hidden mx-4"
                        >
                            <div className="bg-[#0B2C24] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                                <div className="p-3">
                                    {summitLinks.map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            {link.label}
                                            <ChevronRight size={14} className="opacity-40" />
                                        </a>
                                    ))}
                                    <a
                                        href="#register"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-center mt-2 px-4 py-3.5 rounded-xl text-sm font-black bg-[#F4C430] text-[#0B2C24] hover:bg-yellow-300 transition-colors"
                                    >
                                        Register Now
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
