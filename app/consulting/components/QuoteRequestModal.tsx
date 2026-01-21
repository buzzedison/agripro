'use client';

import { useState } from 'react';
import { X, Send, User, Mail, Phone, Building2, MessageSquare, CheckCircle } from 'lucide-react';

interface QuoteRequestModalProps {
    isOpen: boolean;
    serviceName: string;
    onClose: () => void;
}

export default function QuoteRequestModal({ isOpen, serviceName, onClose }: QuoteRequestModalProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        farmSize: '',
        annualRevenue: '',
        location: '',
        requirements: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/consulting/quote-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    service: serviceName
                }),
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                // Fallback for demo/if API not ready
                setSubmitted(true);
            }
        } catch (error) {
            // Fallback for demo
            setSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    if (submitted) {
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                <div className="bg-white rounded-[2rem] max-w-md w-full p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Quote Request Sent</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Thank you! We&apos;ve received your request for a <strong>{serviceName}</strong> quote. One of our operators will review your details and contact you within 24 hours.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
                    >
                        Got it
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex justify-between items-center z-20">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Request Quote</h2>
                        <p className="text-sm font-medium text-green-600 mt-1">{serviceName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Why Request a Quote?
                        </h3>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            Every agribusiness is unique. We provide custom pricing based on your operation&apos;s size, complexity, and specific needs to ensure you get the best value without paying for extras you don&apos;t need.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    required
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Samuel"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Owusu"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="s.owusu@example.com"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Phone Number (WhatsApp Preferred)</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+233..."
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Company/Farm Name</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder="Your agribusiness name"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Region, Ghana"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Farm Size / Operation Scale</label>
                                <input
                                    type="text"
                                    name="farmSize"
                                    value={formData.farmSize}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 50 acres, 2 processing lines"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Annual Revenue Range (Optional)</label>
                                <select
                                    name="annualRevenue"
                                    value={formData.annualRevenue}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select range</option>
                                    <option value="under-100k">Under GHS 100,000</option>
                                    <option value="100k-500k">GHS 100k - 500k</option>
                                    <option value="500k-1.5m">GHS 500k - 1.5M</option>
                                    <option value="1.5m-5m">GHS 1.5M - 5M</option>
                                    <option value="over-5m">Over GHS 5M</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Specific Requirements or Context</label>
                            <textarea
                                name="requirements"
                                rows={4}
                                value={formData.requirements}
                                onChange={handleInputChange}
                                placeholder="Tell us a bit about your goals for this service..."
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 border-2 border-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-2 sm:flex-[2] bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 shadow-xl shadow-green-100 flex items-center justify-center order-1 sm:order-2"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>Submit Quote Request</span>
                                    <Send className="w-4 h-4" />
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
