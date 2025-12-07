'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, ShoppingBag, Lightbulb, Wrench, ArrowRight, Globe, CheckCircle } from 'lucide-react';

const userTypes = [
    {
        id: 'farmer',
        title: 'Farmers & Producers',
        description: 'Showcase your farm, connect with buyers, and access market opportunities.',
        icon: Users,
        color: 'bg-green-500',
        lightColor: 'bg-green-50',
        textColor: 'text-green-700',
    },
    {
        id: 'buyer',
        title: 'Buyers & Traders',
        description: 'Source quality produce directly from verified African farmers.',
        icon: ShoppingBag,
        color: 'bg-blue-500',
        lightColor: 'bg-blue-50',
        textColor: 'text-blue-700',
    },
    {
        id: 'expert',
        title: 'Experts & Advisors',
        description: 'Share your expertise and connect with agripreneurs who need guidance.',
        icon: Lightbulb,
        color: 'bg-amber-500',
        lightColor: 'bg-amber-50',
        textColor: 'text-amber-700',
    },
    {
        id: 'service_provider',
        title: 'Service Providers',
        description: 'Offer your services to the agricultural community—logistics, finance, tech, and more.',
        icon: Wrench,
        color: 'bg-purple-500',
        lightColor: 'bg-purple-50',
        textColor: 'text-purple-700',
    },
];

const stats = [
    { label: 'Countries', value: '15+' },
    { label: 'Value Chains', value: '25+' },
    { label: 'Active Members', value: '500+' },
];

const benefits = [
    'Get discovered by buyers and partners worldwide',
    'Access verified contacts across the agricultural value chain',
    'Join a trusted network of African agribusiness professionals',
    'Receive opportunities matched to your profile',
];

export default function ConnectPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6">
                            <Globe className="w-4 h-4 text-emerald-300" />
                            <span className="text-sm font-medium text-emerald-200">The Global Gateway to African Agribusiness</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                            Connect with the
                            <span className="block text-emerald-300">Agricultural Community</span>
                        </h1>

                        <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                            Join Africa&apos;s premier network of farmers, buyers, experts, and service providers.
                            Build relationships that grow your agribusiness.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/connect/onboarding"
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

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
                    >
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-emerald-200">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* User Types Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Join as...</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Select your role in the agricultural value chain and start connecting
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {userTypes.map((type, index) => (
                            <motion.div
                                key={type.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Link
                                    href={`/connect/onboarding?type=${type.id}`}
                                    className="group block h-full p-6 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className={`w-14 h-14 ${type.lightColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <type.icon className={`w-7 h-7 ${type.textColor}`} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                                        {type.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {type.description}
                                    </p>
                                    <span className="inline-flex items-center text-sm font-semibold text-green-600 group-hover:text-green-700">
                                        Get Started
                                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Why Join the AgriPro Network?
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                AgriPro Connect is more than a directory—it&apos;s your gateway to the African agricultural ecosystem.
                            </p>
                            <ul className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8">
                                <Link
                                    href="/connect/onboarding"
                                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Create Your Profile
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-50 rounded-3xl p-8 flex items-center justify-center">
                                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                    {userTypes.map((type) => (
                                        <div
                                            key={type.id}
                                            className={`${type.lightColor} p-4 rounded-xl flex flex-col items-center text-center`}
                                        >
                                            <type.icon className={`w-8 h-8 ${type.textColor} mb-2`} />
                                            <span className="text-xs font-medium text-gray-700">{type.title.split(' ')[0]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-green-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
                    <p className="text-xl text-green-200 mb-8">
                        Join hundreds of agricultural professionals building the future of African agribusiness.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/connect/onboarding"
                            className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-900 font-bold rounded-full hover:bg-green-100 transition-colors"
                        >
                            Join the Network
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link
                            href="/connect/directory"
                            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-colors"
                        >
                            Explore Directory
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
