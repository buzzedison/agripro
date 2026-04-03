'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lightbulb, Rocket, Leaf, Globe, Brain, Users,
    Handshake, ArrowRight, ArrowUpRight, CheckCircle,
    BookOpen, Trophy, Microscope, ChevronDown
} from 'lucide-react';

const stats = [
    { value: '5', label: 'Universities' },
    { value: '10K+', label: 'Youth Reached' },
    { value: '8+', label: 'Countries' },
    { value: '50+', label: 'Alumni' },
];

const benefits = [
    {
        icon: BookOpen,
        title: 'Knowledge & Skills',
        description: 'Bootcamps, workshops, and learning tracks designed for the next generation of agripreneurs.',
        items: ['Agripreneur Bootcamps', 'Innovation Labs', 'Expert Mentorship'],
    },
    {
        icon: Globe,
        title: 'Network & Community',
        description: 'Connect with club members across Africa and tap into a global agribusiness network.',
        items: ['Cross-campus exchanges', 'Virtual workshops', 'Global alumni network'],
    },
    {
        icon: Trophy,
        title: 'Opportunities',
        description: 'Pitch competitions, incubator programmes, and funding to launch your agribusiness.',
        items: ['Pitch competitions', 'Agri-Talent Incubator', 'Funding opportunities'],
    },
];

const programs = [
    {
        icon: Rocket,
        title: 'Agri-Talent Incubator',
        description: '6-month structured programme with mentorship, technical training, and a high-impact Demo Day.',
    },
    {
        icon: Lightbulb,
        title: 'Smart Agribusiness Challenge',
        description: 'Continental competition for innovative food system solutions — with grants and expert mentorship.',
    },
    {
        icon: Microscope,
        title: 'Innovation Pop-Up Labs',
        description: 'Mobile tech showcases across campuses covering hydroponics, drone farming, and IoT in agriculture.',
    },
    {
        icon: Handshake,
        title: 'Agribusiness Leadership Summit',
        description: 'Annual gathering of industry leaders, innovators, and club chapters from across the continent.',
    },
    {
        icon: Leaf,
        title: 'Youth-Driven Organic Markets',
        description: 'Student-led local market initiatives — real business experience, real impact, real revenue.',
    },
    {
        icon: Brain,
        title: 'AgriPro Think Tanks',
        description: 'Student-led research groups producing bi-annual Agribusiness Trends Reports.',
    },
];

const countries = [
    'Ghana', 'Nigeria', 'Kenya', 'Uganda', 'Tanzania', 'Rwanda',
    'Ethiopia', 'Senegal', 'South Africa', 'Zambia', 'Zimbabwe', 'Cameroon', 'Other',
];

interface FormData {
    full_name: string;
    email: string;
    phone: string;
    institution: string;
    city: string;
    country: string;
    role: string;
    estimated_members: string;
    motivation: string;
    referral: string;
}

const emptyForm: FormData = {
    full_name: '', email: '', phone: '', institution: '',
    city: '', country: '', role: '', estimated_members: '', motivation: '', referral: '',
};

export default function ClubsPage() {
    const [form, setForm] = useState<FormData>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const formRef = useRef<HTMLElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/clubs/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Something went wrong.');
            }

            setSubmitted(true);
            setForm(emptyForm);
        } catch (err: any) {
            setError(err.message || 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="min-h-screen bg-white">

            {/* ── Hero ── */}
            <section className="relative bg-[#050A08] overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-green-950/40 to-transparent" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-0 lg:min-h-screen lg:flex lg:items-center">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full lg:py-32">

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-sm text-gray-300 font-medium">AgriPro Clubs</span>
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.02] tracking-tight mb-6">
                                Build Africa&apos;s next<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                    agri leaders.
                                </span>
                            </h1>

                            <p className="text-lg text-gray-400 mb-10 max-w-md leading-relaxed">
                                University clubs connecting young Africans to the knowledge, networks,
                                and tools to lead agribusiness ventures across the continent.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-14">
                                <Link
                                    href="https://airtable.com/app0J1BYQpwnlLfwj/pagx1ScNYrgLhQcWE/form"
                                    target="_blank"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-green-50 transition-all duration-300 shadow-xl shadow-black/20"
                                >
                                    Join a Club
                                    <ArrowRight size={16} />
                                </Link>
                                <button
                                    onClick={scrollToForm}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300"
                                >
                                    Start a Club
                                    <ChevronDown size={16} />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6 divide-x divide-white/10">
                                {stats.map((s, i) => (
                                    <div key={s.label} className={i > 0 ? 'pl-6' : ''}>
                                        <p className="text-2xl font-black text-white">{s.value}</p>
                                        <p className="text-sm text-gray-500">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.9, delay: 0.25 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative h-[580px] rounded-[2rem] overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60">
                                <Image
                                    src="/images/agristudent.png"
                                    alt="Young African agribusiness leaders"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050A08]/60 via-transparent to-transparent" />
                            </div>
                            {/* Floating pill */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 1 }}
                                className="absolute -bottom-5 -left-6 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 shadow-2xl"
                            >
                                <div className="flex items-center gap-4 divide-x divide-white/10">
                                    <div className="text-center">
                                        <p className="text-xl font-black text-white">5</p>
                                        <p className="text-xs text-gray-400">Universities</p>
                                    </div>
                                    <div className="text-center pl-4">
                                        <p className="text-xl font-black text-white">10K+</p>
                                        <p className="text-xs text-gray-400">Students reached</p>
                                    </div>
                                    <div className="text-center pl-4">
                                        <p className="text-xl font-black text-white">8+</p>
                                        <p className="text-xs text-gray-400">Countries</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── What you get ── */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-14"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-5">
                            Why join
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                            Everything you need<br />to grow as an agripreneur.
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {benefits.map((b, index) => (
                            <motion.div
                                key={b.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-6">
                                    <b.icon className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="font-black text-gray-900 text-xl mb-3">{b.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-5">{b.description}</p>
                                <ul className="space-y-2">
                                    {b.items.map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Flagship Programs ── */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12"
                    >
                        <div>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-gray-100 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-5">
                                Flagship programmes
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                                Real programmes.<br />Real impact.
                            </h2>
                        </div>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {programs.map((program, index) => (
                            <motion.div
                                key={program.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.07 }}
                                className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-green-200 hover:bg-white hover:shadow-md transition-all duration-300 group"
                            >
                                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                    <program.icon className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="font-black text-gray-900 text-base mb-2">{program.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{program.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Start a Club Form ── */}
            <section
                ref={formRef}
                id="start-a-club"
                className="py-24 bg-gray-950 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-500/10 rounded-full blur-[100px]" />

                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-5">
                            Start a club
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                            Bring AgriPro Clubs<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                to your university.
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            We&apos;ll work with you to launch and support a club at your institution.
                            Fill in the form and our team will reach out within 3 business days.
                        </p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center"
                            >
                                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3">Application received!</h3>
                                <p className="text-gray-400 mb-8">
                                    Thank you for applying. Our clubs team will review your application
                                    and be in touch within 3 business days.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-all"
                                >
                                    Submit another application
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleSubmit}
                                className="bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-10 space-y-6"
                            >
                                {/* Name + Email */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Field label="Full name" required>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={form.full_name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Your full name"
                                            className={inputClass}
                                        />
                                    </Field>
                                    <Field label="Email address" required>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="you@university.edu"
                                            className={inputClass}
                                        />
                                    </Field>
                                </div>

                                {/* Phone + Role */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Field label="Phone number">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+233 XX XXX XXXX"
                                            className={inputClass}
                                        />
                                    </Field>
                                    <Field label="Your role" required>
                                        <select
                                            name="role"
                                            value={form.role}
                                            onChange={handleChange}
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">Select role</option>
                                            <option value="student">Student</option>
                                            <option value="faculty">Faculty / Staff</option>
                                            <option value="both">Student + Faculty jointly</option>
                                        </select>
                                    </Field>
                                </div>

                                {/* Institution */}
                                <Field label="University / Institution" required>
                                    <input
                                        type="text"
                                        name="institution"
                                        value={form.institution}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. University of Ghana, Legon"
                                        className={inputClass}
                                    />
                                </Field>

                                {/* City + Country */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Field label="City" required>
                                        <input
                                            type="text"
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            required
                                            placeholder="City"
                                            className={inputClass}
                                        />
                                    </Field>
                                    <Field label="Country" required>
                                        <select
                                            name="country"
                                            value={form.country}
                                            onChange={handleChange}
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">Select country</option>
                                            {countries.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                {/* Estimated members */}
                                <Field label="How many students do you expect to join?">
                                    <select
                                        name="estimated_members"
                                        value={form.estimated_members}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="">Select a range</option>
                                        <option value="1-10">1 – 10</option>
                                        <option value="11-25">11 – 25</option>
                                        <option value="26-50">26 – 50</option>
                                        <option value="51-100">51 – 100</option>
                                        <option value="100+">100+</option>
                                    </select>
                                </Field>

                                {/* Motivation */}
                                <Field label="Why do you want to start an AgriPro Club?" required>
                                    <textarea
                                        name="motivation"
                                        value={form.motivation}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        placeholder="Tell us about your vision for the club and the problem you want to solve..."
                                        className={`${inputClass} resize-none`}
                                    />
                                </Field>

                                {/* Referral */}
                                <Field label="How did you hear about AgriPro Clubs?">
                                    <select
                                        name="referral"
                                        value={form.referral}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="">Select one</option>
                                        <option value="social_media">Social media</option>
                                        <option value="friend">Friend / colleague</option>
                                        <option value="university">University / lecturer</option>
                                        <option value="agripro_event">AgriPro event</option>
                                        <option value="google">Google search</option>
                                        <option value="other">Other</option>
                                    </select>
                                </Field>

                                {error && (
                                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-green-50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>Submit Application <ArrowRight size={16} /></>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </section>

        </div>
    );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-300">
                {label}{required && <span className="text-green-400 ml-1">*</span>}
            </label>
            {children}
        </div>
    );
}

const inputClass = `w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600
    focus:outline-none focus:border-green-500/50 focus:bg-white/8 transition-colors text-sm
    [&_option]:bg-gray-900 [&_option]:text-white`;
