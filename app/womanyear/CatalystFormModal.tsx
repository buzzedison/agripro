'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Loader2, ArrowRight } from 'lucide-react'

export type CatalystFormType = 'apply' | 'prospectus' | 'plan'

interface CatalystFormModalProps {
    type: CatalystFormType
    planTier?: string   // pre-filled when opened from pricing card
    onClose: () => void
}

const FORM_CONFIG = {
    apply: {
        title: 'Apply for Cohort 2026',
        subtitle: 'The Pan-African Accelerator for Women Agripreneurs',
        cta: 'Submit Application',
    },
    prospectus: {
        title: 'Download the Prospectus',
        subtitle: 'The full programme, the 12-week model & fee structure',
        cta: 'Download the Prospectus',
    },
    plan: {
        title: 'Select Your Plan',
        subtitle: 'Confirm your interest and we\'ll guide you through the next steps',
        cta: 'Confirm Interest',
    },
}

const SECTORS = [
    'Crop Production & Smallholder Farming',
    'Value Addition & Food Processing',
    'Market Infrastructure & Logistics',
    'Agri-Fintech & Insurance',
    'AgriTech & Precision Farming',
    'Livestock & Aquaculture',
    'Other',
]

const STAGES = [
    'Idea / Pre-revenue',
    'Early Stage (< $10k revenue)',
    'Growth Stage ($10k – $100k revenue)',
    'Scale Stage (> $100k revenue)',
]

const PLAN_TIERS = ['Standard Access ($1,000)', 'Subsidized ($399 — LDCs & Climate-Vulnerable)', 'Scholarship (Fully Funded)']

const REFERRAL_SOURCES = [
    'Instagram',
    'LinkedIn',
    'Facebook',
    'X (Twitter)',
    'WhatsApp',
    'Friend or colleague',
    'AgriPro event or webinar',
    'Partner organisation',
    'Google / search',
    'News or press',
    'Other',
]

const PARTNER_NEEDS = [
    'Investor / working capital',
    'Offtake buyer / market access',
    'Logistics / cold chain',
    'Equipment or processing support',
    'Technical advisor',
    'Policy / compliance support',
    'Data room / pitch support',
]

export default function CatalystFormModal({ type, planTier, onClose }: CatalystFormModalProps) {
    const config = FORM_CONFIG[type]
    const [form, setForm] = useState<Record<string, string>>(planTier ? { plan_tier: planTier } : {})
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [downloadFailed, setDownloadFailed] = useState(false)

    const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

    // Generate the prospectus PDF in-browser and trigger a download.
    const deliverProspectus = async () => {
        const { generateProspectusBlob } = await import('./ProspectusDocument')
        const blob = await generateProspectusBlob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'AgriPro-Catalyst-W-Prospectus-2026.pdf'
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            const res = await fetch('/api/catalyst-w/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, ...form }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Submission failed')

            // Lead captured — for the prospectus, serve the PDF instantly.
            if (type === 'prospectus') {
                try {
                    await deliverProspectus()
                } catch {
                    setDownloadFailed(true)
                }
            }
            setSuccess(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C24]/30 focus:border-[#0B2C24] transition-all bg-white'
    const labelCls = 'block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5'

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            >
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-[#0B2C24] px-6 py-5 rounded-t-3xl z-10">
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                            <X size={18} />
                        </button>
                        <p className="text-[#F4C430] text-[10px] font-black uppercase tracking-[0.3em] mb-1">AgriPro Catalyst W · 2026</p>
                        <h2 className="text-white text-xl font-black">{config.title}</h2>
                        <p className="text-white/60 text-sm mt-0.5">{config.subtitle}</p>
                    </div>

                    <div className="p-6">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="text-green-600" size={32} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">
                                    {type === 'prospectus'
                                        ? (downloadFailed ? 'Your prospectus is ready' : 'Your prospectus is downloading')
                                        : 'Submission Received!'}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                                    {type === 'prospectus'
                                        ? (downloadFailed
                                            ? 'Your download didn’t start automatically. Tap the button below to get it.'
                                            : 'The download should have started automatically. We’ve also got your details and will keep you posted on Cohort 2026.')
                                        : `Thank you! A confirmation has been sent to ${form.email}. Our team will be in touch within 10 business days.`}
                                </p>
                                {type === 'prospectus' && (
                                    <button
                                        onClick={() => { deliverProspectus().catch(() => setDownloadFailed(true)) }}
                                        className="mt-6 px-8 py-3 bg-[#F4C430] text-[#0B2C24] font-black rounded-full hover:bg-[#D4AF37] transition-colors inline-flex items-center gap-2"
                                    >
                                        {downloadFailed ? 'Download Prospectus' : 'Download again'} <ArrowRight size={16} />
                                    </button>
                                )}
                                <button onClick={onClose} className="mt-8 ml-0 sm:ml-3 px-8 py-3 bg-[#0B2C24] text-white font-bold rounded-full hover:bg-[#0d3a2e] transition-colors">
                                    Close
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Common fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Full Name *</label>
                                        <input required className={inputCls} placeholder="Jane Doe" onChange={e => set('full_name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Email *</label>
                                        <input required type="email" className={inputCls} placeholder="jane@business.com" onChange={e => set('email', e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Country *</label>
                                        <input required className={inputCls} placeholder="Ghana" onChange={e => set('country', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Phone</label>
                                        <input className={inputCls} placeholder="+233 20 000 0000" onChange={e => set('phone', e.target.value)} />
                                    </div>
                                </div>

                                {/* Apply-specific */}
                                {type === 'apply' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelCls}>Business Name *</label>
                                                <input required className={inputCls} placeholder="Your business" onChange={e => set('business_name', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Business Stage *</label>
                                                <select required className={inputCls} defaultValue="" onChange={e => set('business_stage', e.target.value)}>
                                                    <option value="" disabled>Select stage</option>
                                                    {STAGES.map(s => <option key={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelCls}>Sector *</label>
                                            <select required className={inputCls} defaultValue="" onChange={e => set('sector', e.target.value)}>
                                                <option value="" disabled>Select your sector</option>
                                                {SECTORS.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelCls}>Annual Revenue (approx.)</label>
                                            <input className={inputCls} placeholder="e.g. $5,000 or Pre-revenue" onChange={e => set('revenue', e.target.value)} />
                                        </div>

                                        <div>
                                            <label className={labelCls}>Team Size</label>
                                            <input className={inputCls} placeholder="e.g. Solo founder, 3 people" onChange={e => set('team_size', e.target.value)} />
                                        </div>

                                        <div>
                                            <label className={labelCls}>Website / Social</label>
                                            <input className={inputCls} placeholder="https://yourbusiness.com" onChange={e => set('website', e.target.value)} />
                                        </div>

                                        <div>
                                            <label className={labelCls}>Why do you want to join Catalyst W? *</label>
                                            <textarea required rows={4} className={inputCls} placeholder="Tell us about your business and what you hope to achieve through this programme..." onChange={e => set('why_apply', e.target.value)} />
                                        </div>

                                        <div>
                                            <label className={labelCls}>What specific business problem do you need to solve? *</label>
                                            <textarea required rows={3} className={inputCls} placeholder="e.g. We have demand but cannot meet buyer volume because of processing capacity..." onChange={e => set('primary_constraint', e.target.value)} />
                                        </div>

                                        <div>
                                            <label className={labelCls}>What support would move the needle fastest? *</label>
                                            <textarea required rows={3} className={inputCls} placeholder="Tell us what kind of partner, capital, market access, logistics, or technical support you need." onChange={e => set('support_needed', e.target.value)} />
                                        </div>

                                        <div>
                                            <label className={labelCls}>Partner / Resource Need</label>
                                            <select className={inputCls} defaultValue="" onChange={e => set('partner_needs', e.target.value)}>
                                                <option value="">Select the most urgent need</option>
                                                {PARTNER_NEEDS.map(p => <option key={p}>{p}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelCls}>Preferred Plan</label>
                                            <select className={inputCls} defaultValue={planTier || ''} onChange={e => set('plan_tier', e.target.value)}>
                                                <option value="">No preference / Need guidance</option>
                                                {PLAN_TIERS.map(p => <option key={p}>{p}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelCls}>How did you hear about us? *</label>
                                            <select required className={inputCls} defaultValue="" onChange={e => set('referral_source', e.target.value)}>
                                                <option value="" disabled>Select an option</option>
                                                {REFERRAL_SOURCES.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>

                                        {form.referral_source === 'Other' && (
                                            <div>
                                                <label className={labelCls}>Where exactly?</label>
                                                <input className={inputCls} placeholder="Tell us where you heard about us" onChange={e => set('referral_detail', e.target.value)} />
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Prospectus-specific */}
                                {type === 'prospectus' && (
                                    <>
                                        <div>
                                            <label className={labelCls}>Organisation</label>
                                            <input className={inputCls} placeholder="Your organisation or business" onChange={e => set('organisation', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Your Role</label>
                                            <input className={inputCls} placeholder="e.g. Founder, Investor, Partner" onChange={e => set('role', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Why are you interested?</label>
                                            <textarea rows={3} className={inputCls} placeholder="Tell us a bit about your interest in Catalyst W..." onChange={e => set('interest', e.target.value)} />
                                        </div>
                                    </>
                                )}

                                {/* Plan-specific */}
                                {type === 'plan' && (
                                    <>
                                        <div>
                                            <label className={labelCls}>Selected Plan *</label>
                                            <select required className={inputCls} defaultValue={planTier || ''} onChange={e => set('plan_tier', e.target.value)}>
                                                <option value="" disabled>Select a plan</option>
                                                {PLAN_TIERS.map(p => <option key={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Business Name</label>
                                            <input className={inputCls} placeholder="Your business name" onChange={e => set('business_name', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Sector</label>
                                            <select className={inputCls} defaultValue="" onChange={e => set('sector', e.target.value)}>
                                                <option value="">Select sector (optional)</option>
                                                {SECTORS.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-[#0B2C24] text-white font-black rounded-full hover:bg-[#0d3a2e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {submitting
                                        ? <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                                        : <>{config.cta} <ArrowRight size={16} /></>}
                                </button>

                                <p className="text-center text-xs text-gray-400">
                                    By submitting you agree to our privacy policy. We will never share your data.
                                </p>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
