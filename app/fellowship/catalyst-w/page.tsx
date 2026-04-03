'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, CheckCircle, Users, Globe, TrendingUp,
    Award, Briefcase, Megaphone, BarChart2, PenLine,
    MapPin, Clock, ChevronDown, Heart, Star, Zap,
    DollarSign, BadgeCheck, Plane, Network,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const differentiators = [
    {
        icon: DollarSign,
        title: 'Performance-based pay',
        description: 'Earn a percentage of revenue you directly generate — sponsorships, ticket sales, applications sourced. Plus milestone bonuses for hitting targets.',
    },
    {
        icon: Star,
        title: 'Equity in outcomes',
        description: 'Top-performing fellows get first-hire rights when paid roles open as Catalyst W scales. Your fellowship is your interview.',
    },
    {
        icon: BadgeCheck,
        title: 'Real credentials',
        description: 'Official fellowship certificate, a LinkedIn-verifiable title, and a reference letter from AgriPro leadership — not a participation trophy.',
    },
    {
        icon: Network,
        title: 'Tier-1 network access',
        description: 'Direct exposure to FAO, AfDB, corporate sponsors, and 40 women-led agribusiness founders at the Africa Food Futures Summit.',
    },
    {
        icon: Plane,
        title: 'Kigali Summit attendance',
        description: 'All active fellows attend the Africa Food Futures Summit in Kigali with travel support. Build relationships in person.',
    },
];

const roles = [
    {
        icon: Briefcase,
        title: 'Fellowship Director',
        count: 1,
        hours: '15–20 hrs/week',
        region: 'Central — Remote',
        tag: 'Leadership',
        tagColor: 'bg-purple-50 text-purple-700',
        description: 'Manages all fellows, reports to CEO, owns the full recruitment pipeline, and chairs the weekly all-hands.',
        responsibilities: [
            'Manage all 25–30 fellows across 5 regions',
            'Report directly to AgriPro CEO',
            'Own application pipeline and cohort KPIs',
            'Chair weekly all-hands and regional syncs',
        ],
    },
    {
        icon: MapPin,
        title: 'Regional Lead',
        count: 5,
        hours: '12–15 hrs/week',
        region: 'One per region',
        tag: 'Regional',
        tagColor: 'bg-blue-50 text-blue-700',
        description: 'Manages 3–4 fellows in their region, leads local partner outreach, and owns regional application targets.',
        responsibilities: [
            'Manage 3–4 fellows in your region',
            'Lead local partner and institution outreach',
            'Own regional application sourcing target',
            'Report weekly to Fellowship Director',
        ],
    },
    {
        icon: TrendingUp,
        title: 'Partnerships Fellow',
        count: '4–5',
        hours: '8–12 hrs/week',
        region: 'Distributed',
        tag: 'Revenue-earning',
        tagColor: 'bg-green-50 text-green-700',
        description: 'Corporate sponsor outreach, government engagement, and MOU coordination. Revenue-share eligible.',
        responsibilities: [
            'Identify and pitch corporate sponsors',
            'Engage government and development partners',
            'Coordinate MOUs and partnership agreements',
            'Earn revenue share on confirmed sponsors',
        ],
    },
    {
        icon: Megaphone,
        title: 'Outreach & Recruitment Fellow',
        count: '6–8',
        hours: '8–12 hrs/week',
        region: 'Distributed',
        tag: 'Revenue-earning',
        tagColor: 'bg-green-50 text-green-700',
        description: 'Applicant sourcing, AgriPro Club coordination, social media, and campus activations. Earn per qualified application.',
        responsibilities: [
            'Source qualified Catalyst W applicants',
            'Coordinate with AgriPro Clubs on campuses',
            'Run social media campaigns in your region',
            'Lead campus and community activations',
        ],
    },
    {
        icon: BarChart2,
        title: 'Operations Fellow',
        count: '3–4',
        hours: '8–10 hrs/week',
        region: 'Distributed',
        tag: 'Operations',
        tagColor: 'bg-amber-50 text-amber-700',
        description: 'Logistics, data management, application review support, and Summit coordination.',
        responsibilities: [
            'Manage application tracking and data',
            'Support application review process',
            'Coordinate Summit logistics',
            'Handle fellow communications and schedules',
        ],
    },
    {
        icon: PenLine,
        title: 'Content & Comms Fellow',
        count: '3–4',
        hours: '8–10 hrs/week',
        region: 'Distributed',
        tag: 'Communications',
        tagColor: 'bg-rose-50 text-rose-700',
        description: 'Social media, blog posts, newsletter, PR support, and documentary coordination for Catalyst W.',
        responsibilities: [
            'Manage Catalyst W social channels',
            'Write blog posts, press releases, newsletter',
            'Support documentary and media coordination',
            'Build program visibility across Africa',
        ],
    },
];

const regions = [
    { name: 'West Africa', flag: '🇬🇭🇳🇬🇸🇳', examples: 'Ghana, Nigeria, Senegal, Côte d\'Ivoire', leads: 1 },
    { name: 'East Africa', flag: '🇰🇪🇷🇼🇺🇬', examples: 'Kenya, Rwanda, Uganda, Tanzania', leads: 1 },
    { name: 'Southern Africa', flag: '🇿🇦🇿🇲🇿🇼', examples: 'South Africa, Zambia, Zimbabwe', leads: 1 },
    { name: 'Central Africa', flag: '🇨🇩🇨🇲🇬🇦', examples: 'DRC, Cameroon, Gabon', leads: 1 },
    { name: 'North Africa', flag: '🇪🇬🇲🇦🇹🇳', examples: 'Egypt, Morocco, Tunisia', leads: 1 },
];

const compensationItems = [
    { label: 'Sponsorship revenue share', detail: '% of confirmed corporate sponsors you bring in' },
    { label: 'Application sourcing bonus', detail: 'Per verified Catalyst W applicant you source' },
    { label: 'Ticket sales commission', detail: 'On Summit tickets sold through your network' },
    { label: 'Milestone bonuses', detail: 'On hitting regional application and outreach targets' },
    { label: 'First-hire rights', detail: 'Top fellows are first considered for paid roles' },
];

const ROLE_OPTIONS = [
    { value: 'fellowship_director', label: 'Fellowship Director' },
    { value: 'regional_lead', label: 'Regional Lead' },
    { value: 'partnerships_fellow', label: 'Partnerships Fellow' },
    { value: 'outreach_fellow', label: 'Outreach & Recruitment Fellow' },
    { value: 'operations_fellow', label: 'Operations Fellow' },
    { value: 'content_comms_fellow', label: 'Content & Comms Fellow' },
];

const REGION_OPTIONS = [
    { value: 'west_africa', label: 'West Africa' },
    { value: 'east_africa', label: 'East Africa' },
    { value: 'southern_africa', label: 'Southern Africa' },
    { value: 'central_africa', label: 'Central Africa' },
    { value: 'north_africa', label: 'North Africa' },
    { value: 'open', label: 'Open to any region' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CatalystWFellowshipPage() {
    const formRef = useRef<HTMLDivElement>(null);
    const [openRole, setOpenRole] = useState<number | null>(null);

    // Form state
    const [form, setForm] = useState({
        full_name: '', email: '', phone: '', country: '', region: '',
        role: '', linkedin_url: '', motivation: '', experience: '', availability: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState('');

    const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!form.full_name || !form.email || !form.role || !form.motivation) {
            setFormError('Please fill in all required fields.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/fellowship/catalyst-w', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setSubmitted(true);
            } else {
                setFormError(data.error || 'Something went wrong. Please try again.');
            }
        } catch {
            setFormError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <section className="relative bg-[#050A08] overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-green-950/30 to-transparent" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="max-w-3xl"
                    >
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-sm text-gray-300 font-medium">AgriPro Fellowship · Cohort 2</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                <Heart className="w-3.5 h-3.5 text-purple-400" />
                                <span className="text-sm text-purple-300 font-medium">Women Catalyst Track</span>
                            </div>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.02] tracking-tight mb-6">
                            Help run Africa&apos;s<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                next great accelerator.
                            </span>
                        </h1>

                        <p className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed">
                            We&apos;re building a 25–30 person distributed team to recruit, support, and accelerate 40 women-led agribusiness ventures across Africa. This isn&apos;t volunteering — it&apos;s a performance-based fellowship with real pay, real credentials, and a direct path to a full-time role.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-14">
                            <button
                                onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-green-50 transition-all shadow-xl shadow-black/20"
                            >
                                Apply now <ArrowRight size={16} />
                            </button>
                            <Link
                                href="/impact/catalyst-w"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all"
                            >
                                About Catalyst W
                            </Link>
                        </div>

                        {/* Stats strip */}
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 divide-x divide-white/10">
                            {[
                                { value: '25–30', label: 'Fellows' },
                                { value: '5', label: 'Regions' },
                                { value: '16', label: 'Week accelerator' },
                                { value: '40', label: 'Ventures to support' },
                            ].map((s, i) => (
                                <div key={s.label} className={i > 0 ? 'pl-8' : ''}>
                                    <span className="text-white font-black text-2xl">{s.value}</span>
                                    <span className="text-gray-500 text-sm ml-2">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Not just volunteering ─────────────────────────────────────── */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-14"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-5">
                            What makes this different
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                            This isn&apos;t volunteering.<br />It&apos;s career capital.
                        </h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {differentiators.map((d, i) => (
                            <motion.div
                                key={d.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                className={`bg-white rounded-2xl p-7 border border-gray-100 ${i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                            >
                                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-5">
                                    <d.icon className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="font-black text-gray-900 text-base mb-2">{d.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{d.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Roles ────────────────────────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-14"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-gray-100 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-5">
                            Fellowship structure
                        </span>
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                                6 roles.<br />25–30 spots total.
                            </h2>
                            <p className="text-gray-500 max-w-sm leading-relaxed text-sm">
                                A hub-and-spoke model with a central director, 5 regional leads, and specialist fellows distributed across Africa.
                            </p>
                        </div>
                    </motion.div>

                    <div className="space-y-3">
                        {roles.map((role, i) => (
                            <motion.div
                                key={role.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06 }}
                                className="border border-gray-100 rounded-2xl overflow-hidden"
                            >
                                {/* Header row */}
                                <button
                                    onClick={() => setOpenRole(openRole === i ? null : i)}
                                    className="w-full flex items-center gap-4 sm:gap-6 px-6 py-5 bg-white hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                                        <role.icon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-black text-gray-900 text-base">{role.title}</span>
                                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${role.tagColor}`}>{role.tag}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 hidden sm:block truncate">{role.description}</p>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-6 shrink-0 text-sm text-gray-400">
                                        <span className="flex items-center gap-1.5">
                                            <Users size={13} /> {role.count} spot{role.count !== 1 ? 's' : ''}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={13} /> {role.hours}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={13} /> {role.region}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={18}
                                        className={`text-gray-400 shrink-0 transition-transform duration-200 ${openRole === i ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Expanded */}
                                <AnimatePresence>
                                    {openRole === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 pt-2 bg-gray-50 border-t border-gray-100">
                                                <div className="grid sm:grid-cols-3 gap-4 mb-4 sm:hidden">
                                                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                                                        <p className="text-xs text-gray-400 mb-0.5">Spots</p>
                                                        <p className="font-bold text-gray-900 text-sm">{role.count}</p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                                                        <p className="text-xs text-gray-400 mb-0.5">Hours/week</p>
                                                        <p className="font-bold text-gray-900 text-sm">{role.hours}</p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                                                        <p className="text-xs text-gray-400 mb-0.5">Region</p>
                                                        <p className="font-bold text-gray-900 text-sm">{role.region}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-bold text-gray-700 mb-3">Key responsibilities</p>
                                                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                                                    {role.responsibilities.map((r) => (
                                                        <li key={r} className="flex items-start gap-2 text-sm text-gray-600">
                                                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                            {r}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button
                                                    onClick={() => {
                                                        update('role', ROLE_OPTIONS.find(o => o.label === role.title)?.value || '');
                                                        formRef.current?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-full text-sm hover:bg-gray-800 transition-all"
                                                >
                                                    Apply for this role <ArrowRight size={13} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Compensation ──────────────────────────────────────────────── */}
            <section className="py-24 bg-gray-950">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">
                                Compensation
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
                                You earn what<br />you deliver.
                            </h2>
                            <p className="text-gray-400 leading-relaxed mb-8">
                                No flat stipends. Fellows are compensated based on the revenue and results they generate — with bonuses for hitting milestones and first-hire rights at the top.
                            </p>
                            <button
                                onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 font-bold rounded-full hover:bg-green-50 transition-all text-sm"
                            >
                                Apply now <ArrowRight size={14} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {compensationItems.map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.07 }}
                                    className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Zap className="w-4 h-4 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">{item.label}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">{item.detail}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Regions ───────────────────────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-gray-100 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-5">
                            Where we operate
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900">5 regions. Pan-African reach.</h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {regions.map((r, i) => (
                            <motion.div
                                key={r.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
                            >
                                <div className="text-3xl mb-4">{r.flag}</div>
                                <h3 className="font-black text-gray-900 mb-1">{r.name}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{r.examples}</p>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <span className="text-xs font-bold text-green-600">1 Regional Lead</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Who we're looking for ────────────────────────────────────── */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">
                                Who should apply
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-6">
                                Ambitious. Africa-rooted.<br />Action-oriented.
                            </h2>
                            <p className="text-gray-500 leading-relaxed mb-8">
                                We&apos;re looking for professionals and graduate students who want to do real work at the intersection of agribusiness, gender equity, and African development — and get compensated for results.
                            </p>
                            <button
                                onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all text-sm"
                            >
                                Apply for a fellowship spot <ArrowRight size={14} />
                            </button>
                        </motion.div>

                        <div className="space-y-3">
                            {[
                                { title: 'Based in Africa', detail: 'You live and work in one of our 5 operating regions.' },
                                { title: 'Available 8–20 hrs/week', detail: 'Depending on role. Fully remote — we work across time zones.' },
                                { title: 'Results-driven', detail: 'You want to be paid for output, not just participation.' },
                                { title: 'Relevant background', detail: 'Agribusiness, development, comms, partnerships, or operations experience.' },
                                { title: 'Believe in the mission', detail: 'You genuinely want to see women-led agribusinesses succeed in Africa.' },
                                { title: 'Can commit to the full 16 weeks', detail: 'From cohort kickoff through the Africa Food Futures Summit.' },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, x: 16 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06 }}
                                    className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-100"
                                >
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Application Form ──────────────────────────────────────────── */}
            <section className="py-24 bg-[#050A08]" ref={formRef} id="apply">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative grid lg:grid-cols-5 gap-14 items-start">
                        {/* Left */}
                        <div className="lg:col-span-2">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">
                                Applications open
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
                                Apply for the Women Catalyst Fellowship.
                            </h2>
                            <p className="text-gray-500 leading-relaxed mb-8">
                                25–30 spots available. We review on a rolling basis — apply early. Shortlisted candidates will be invited to a 30-minute virtual interview.
                            </p>
                            <div className="space-y-3">
                                {[
                                    'Application reviewed within 2 weeks',
                                    '30-min virtual interview for shortlist',
                                    'Fellowship starts upon cohort kickoff',
                                    'Confirmation email sent immediately',
                                ].map((s) => (
                                    <div key={s} className="flex items-center gap-2.5 text-sm text-gray-400">
                                        <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10">
                                <AnimatePresence mode="wait">
                                    {submitted ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-10"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-5">
                                                <CheckCircle className="w-8 h-8 text-green-400" />
                                            </div>
                                            <h3 className="text-white font-black text-xl mb-2">Application submitted!</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                                                We&apos;ve received your application and sent a confirmation to your email. Our team reviews on a rolling basis — you&apos;ll hear from us within 2 weeks.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <motion.form
                                            key="form"
                                            onSubmit={handleSubmit}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="space-y-5"
                                        >
                                            <p className="text-white font-bold text-lg">Your application</p>

                                            {/* Name + Email */}
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full name *</label>
                                                    <input
                                                        type="text"
                                                        value={form.full_name}
                                                        onChange={(e) => update('full_name', e.target.value)}
                                                        placeholder="Jane Mensah"
                                                        required
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email *</label>
                                                    <input
                                                        type="email"
                                                        value={form.email}
                                                        onChange={(e) => update('email', e.target.value)}
                                                        placeholder="jane@example.com"
                                                        required
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone + Country */}
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Phone</label>
                                                    <input
                                                        type="tel"
                                                        value={form.phone}
                                                        onChange={(e) => update('phone', e.target.value)}
                                                        placeholder="+233 XX XXX XXXX"
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Country</label>
                                                    <input
                                                        type="text"
                                                        value={form.country}
                                                        onChange={(e) => update('country', e.target.value)}
                                                        placeholder="Ghana"
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Role + Region */}
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Role applying for *</label>
                                                    <select
                                                        value={form.role}
                                                        onChange={(e) => update('role', e.target.value)}
                                                        required
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-500/50 transition-all appearance-none"
                                                    >
                                                        <option value="" disabled className="bg-gray-900">Select a role</option>
                                                        {ROLE_OPTIONS.map((o) => (
                                                            <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Preferred region</label>
                                                    <select
                                                        value={form.region}
                                                        onChange={(e) => update('region', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-500/50 transition-all appearance-none"
                                                    >
                                                        <option value="" className="bg-gray-900">Select a region</option>
                                                        {REGION_OPTIONS.map((o) => (
                                                            <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* LinkedIn + Availability */}
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">LinkedIn URL</label>
                                                    <input
                                                        type="url"
                                                        value={form.linkedin_url}
                                                        onChange={(e) => update('linkedin_url', e.target.value)}
                                                        placeholder="linkedin.com/in/..."
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Weekly availability</label>
                                                    <select
                                                        value={form.availability}
                                                        onChange={(e) => update('availability', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-500/50 transition-all appearance-none"
                                                    >
                                                        <option value="" className="bg-gray-900">Select availability</option>
                                                        <option value="8-10" className="bg-gray-900">8–10 hrs/week</option>
                                                        <option value="10-15" className="bg-gray-900">10–15 hrs/week</option>
                                                        <option value="15-20" className="bg-gray-900">15–20 hrs/week</option>
                                                        <option value="20+" className="bg-gray-900">20+ hrs/week</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Motivation */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                                                    Why do you want to join? * <span className="font-normal text-gray-600">(3–5 sentences)</span>
                                                </label>
                                                <textarea
                                                    value={form.motivation}
                                                    onChange={(e) => update('motivation', e.target.value)}
                                                    required
                                                    rows={4}
                                                    placeholder="What draws you to this fellowship and what do you hope to contribute..."
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50 transition-all resize-none"
                                                />
                                            </div>

                                            {/* Experience */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                                                    Relevant experience <span className="font-normal text-gray-600">(optional)</span>
                                                </label>
                                                <textarea
                                                    value={form.experience}
                                                    onChange={(e) => update('experience', e.target.value)}
                                                    rows={3}
                                                    placeholder="Past work in agribusiness, partnerships, comms, operations..."
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50 transition-all resize-none"
                                                />
                                            </div>

                                            <AnimatePresence>
                                                {formError && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className="text-sm text-red-400 bg-red-500/10 px-4 py-3 rounded-xl"
                                                    >
                                                        {formError}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>

                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                        Submitting...
                                                    </span>
                                                ) : (
                                                    <>Submit application <ArrowRight size={16} /></>
                                                )}
                                            </button>
                                            <p className="text-xs text-gray-600 text-center">
                                                We review on a rolling basis. Applications close once all spots are filled.
                                            </p>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
