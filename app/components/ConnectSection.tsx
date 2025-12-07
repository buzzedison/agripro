'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, ArrowRight, Globe } from 'lucide-react';

export default function ConnectSection() {
    return (
        <section className="py-24 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6">
                            <Globe className="w-4 h-4 text-emerald-300" />
                            <span className="text-sm font-medium text-emerald-200">New: AgriPro Connect</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                            Connect with the
                            <span className="block text-emerald-300">Agricultural Community</span>
                        </h2>

                        <p className="text-lg text-gray-200 mb-8 max-w-xl">
                            Join Africa&apos;s premier network of farmers, buyers, experts, and service providers.
                            Build relationships that grow your agribusiness.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/connect"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-900 font-bold rounded-full hover:bg-emerald-100 transition-colors"
                            >
                                Join the Network
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <Link
                                href="/connect/directory"
                                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-colors"
                            >
                                Browse Directory
                            </Link>
                        </div>
                    </motion.div>

                    {/* Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Farmers', icon: '🌾', count: '200+' },
                                { label: 'Buyers', icon: '🤝', count: '50+' },
                                { label: 'Experts', icon: '💡', count: '30+' },
                                { label: 'Service Providers', icon: '🔧', count: '40+' },
                            ].map((item, idx) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/20 transition-colors"
                                >
                                    <span className="text-4xl mb-2 block">{item.icon}</span>
                                    <p className="text-2xl font-bold text-white">{item.count}</p>
                                    <p className="text-sm text-emerald-200">{item.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
