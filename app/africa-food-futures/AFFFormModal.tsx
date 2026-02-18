'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Loader2 } from 'lucide-react'

type FormType = 'register' | 'speaker' | 'partner' | 'sponsor' | 'exhibitor'

interface AFFFormModalProps {
    type: FormType
    onClose: () => void
}

const FORM_CONFIG = {
    register: {
        title: 'Register Interest',
        subtitle: 'Secure your place at Africa Food Futures 2026',
        color: '#0B2C24',
        cta: 'Submit Registration',
    },
    speaker: {
        title: 'Apply to Speak',
        subtitle: 'Share your expertise with 2,000+ delegates',
        color: '#0B2C24',
        cta: 'Submit Application',
    },
    partner: {
        title: 'Become a Partner',
        subtitle: 'Align your organisation with Africa\'s food future',
        color: '#0B2C24',
        cta: 'Send Enquiry',
    },
    sponsor: {
        title: 'Sponsor the Summit',
        subtitle: 'Position your brand at the forefront of African agri-food',
        color: '#0B2C24',
        cta: 'Request Packages',
    },
    exhibitor: {
        title: 'Book Exhibition Space',
        subtitle: 'Showcase your innovation to 2,000+ decision-makers',
        color: '#0B2C24',
        cta: 'Request Space',
    },
}

const TICKET_TIERS = ['Observer Pass ($299)', 'Delegate Pass ($599)', 'VIP Pass ($1,299)', 'Investor Circle ($2,499)']
const TALK_FORMATS = ['Keynote (45 min)', 'Panel Moderator', 'Panelist', 'Workshop Facilitator', 'Lightning Talk (10 min)']
const TALK_TRACKS = ['Policy & Governance', 'Investment & Capital', 'Climate & AgriTech', 'Women in Agriculture', 'Trade & Markets', 'Food Systems', 'Youth & Innovation', 'Global Partnerships']
const SPONSOR_PACKAGES = ['Title / Platinum Sponsor', 'Gold Package', 'Silver Package', 'Session Sponsor', 'Gala & Networking Sponsor', 'Other / Custom']
const PARTNER_TYPES = ['NGO / Development Organisation', 'Government Body', 'Development Bank / Funder', 'Academic / Research Institution', 'Media Partner', 'Other']
const BUDGET_RANGES = ['Under $5,000', '$5,000 – $15,000', '$15,000 – $50,000', '$50,000 – $100,000', 'Over $100,000']

export default function AFFFormModal({ type, onClose }: AFFFormModalProps) {
    const config = FORM_CONFIG[type]
    const [form, setForm] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            const res = await fetch('/api/africa-food-futures/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, ...form }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Submission failed')
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
                    <div className="sticky top-0 bg-[#0B2C24] px-6 py-5 rounded-t-3xl sm:rounded-t-3xl z-10">
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                            <X size={18} />
                        </button>
                        <p className="text-[#F4C430] text-[10px] font-black uppercase tracking-[0.3em] mb-1">Africa Food Futures 2026</p>
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
                                <h3 className="text-xl font-black text-gray-900 mb-2">Submission Received!</h3>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                                    Thank you! We&apos;ve sent a confirmation to <strong>{form.email}</strong>. Our team will be in touch within 10 business days.
                                </p>
                                <button onClick={onClose} className="mt-8 px-8 py-3 bg-[#0B2C24] text-white font-bold rounded-full hover:bg-[#0d3a2e] transition-colors">
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
                                        <input required type="email" className={inputCls} placeholder="jane@org.com" onChange={e => set('email', e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Organisation</label>
                                        <input className={inputCls} placeholder="Your organisation" onChange={e => set('organisation', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Country</label>
                                        <input className={inputCls} placeholder="Rwanda" onChange={e => set('country', e.target.value)} />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Phone</label>
                                    <input className={inputCls} placeholder="+250 700 000 000" onChange={e => set('phone', e.target.value)} />
                                </div>

                                {/* Register-specific */}
                                {type === 'register' && (
                                    <>
                                        <div>
                                            <label className={labelCls}>Ticket Tier *</label>
                                            <select required className={inputCls} onChange={e => set('ticket_tier', e.target.value)} defaultValue="">
                                                <option value="" disabled>Select a tier</option>
                                                {TICKET_TIERS.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Dietary Requirements</label>
                                            <input className={inputCls} placeholder="e.g. Vegetarian, Halal, None" onChange={e => set('dietary', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Accessibility Needs</label>
                                            <input className={inputCls} placeholder="Any accessibility requirements?" onChange={e => set('accessibility', e.target.value)} />
                                        </div>
                                    </>
                                )}

                                {/* Speaker-specific */}
                                {type === 'speaker' && (
                                    <>
                                        <div>
                                            <label className={labelCls}>Proposed Talk Title *</label>
                                            <input required className={inputCls} placeholder="e.g. Financing the Next Harvest" onChange={e => set('talk_title', e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelCls}>Format *</label>
                                                <select required className={inputCls} onChange={e => set('talk_format', e.target.value)} defaultValue="">
                                                    <option value="" disabled>Select format</option>
                                                    {TALK_FORMATS.map(f => <option key={f}>{f}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Track *</label>
                                                <select required className={inputCls} onChange={e => set('talk_track', e.target.value)} defaultValue="">
                                                    <option value="" disabled>Select track</option>
                                                    {TALK_TRACKS.map(t => <option key={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Short Bio *</label>
                                            <textarea required rows={3} className={inputCls} placeholder="Tell us about yourself and your expertise..." onChange={e => set('bio', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>LinkedIn Profile</label>
                                            <input className={inputCls} placeholder="linkedin.com/in/yourname" onChange={e => set('linkedin', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Previous Speaking Experience</label>
                                            <textarea rows={2} className={inputCls} placeholder="List any relevant conferences or events..." onChange={e => set('previous_speaking', e.target.value)} />
                                        </div>
                                    </>
                                )}

                                {/* Partner-specific */}
                                {type === 'partner' && (
                                    <>
                                        <div>
                                            <label className={labelCls}>Partnership Type *</label>
                                            <select required className={inputCls} onChange={e => set('package_interest', e.target.value)} defaultValue="">
                                                <option value="" disabled>Select type</option>
                                                {PARTNER_TYPES.map(p => <option key={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Website</label>
                                            <input className={inputCls} placeholder="https://yourorg.com" onChange={e => set('website', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Tell us about your interest</label>
                                            <textarea rows={3} className={inputCls} placeholder="What are you hoping to achieve through this partnership?" onChange={e => set('message', e.target.value)} />
                                        </div>
                                    </>
                                )}

                                {/* Sponsor / Exhibitor */}
                                {(type === 'sponsor' || type === 'exhibitor') && (
                                    <>
                                        {type === 'sponsor' && (
                                            <div>
                                                <label className={labelCls}>Package Interest *</label>
                                                <select required className={inputCls} onChange={e => set('package_interest', e.target.value)} defaultValue="">
                                                    <option value="" disabled>Select package</option>
                                                    {SPONSOR_PACKAGES.map(p => <option key={p}>{p}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <div>
                                            <label className={labelCls}>Budget Range</label>
                                            <select className={inputCls} onChange={e => set('budget_range', e.target.value)} defaultValue="">
                                                <option value="">Prefer not to say</option>
                                                {BUDGET_RANGES.map(b => <option key={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Website</label>
                                            <input className={inputCls} placeholder="https://yourbrand.com" onChange={e => set('website', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Additional Notes</label>
                                            <textarea rows={3} className={inputCls} placeholder="Any specific requirements or questions?" onChange={e => set('message', e.target.value)} />
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
                                    {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : config.cta}
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
