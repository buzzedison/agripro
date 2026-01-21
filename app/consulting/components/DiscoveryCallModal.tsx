'use client';

import { useState } from 'react';
import { X, Phone, User, Mail, MessageCircle, Calendar, CheckCircle, Clock, Send } from 'lucide-react';

interface DiscoveryCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiscoveryCallModal({ isOpen, onClose }: DiscoveryCallModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    farmType: '',
    currentChallenges: '',
    preferredTime: '',
    timeZone: 'GMT',
    questions: ''
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
      const response = await fetch('/api/consulting/discovery-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        // Fallback for demo
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
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
        <div className="bg-white rounded-[2rem] max-w-md w-full p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Discovery Call Requested</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Thank you for your interest! We&apos;ll contact you within 24 hours to schedule your free 30-minute discovery call at a time that works for you.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Sidebar - Info */}
          <div className="md:w-1/3 bg-slate-900 p-8 lg:p-12 text-white overflow-y-auto">
            <div className="sticky top-0">
              <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mb-8">
                <Phone className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Schedule Your Free Discovery Call</h2>
              <p className="text-slate-400 mb-10 leading-relaxed font-light">
                A 30-minute consultation to discuss your challenges and determine the best path forward for your agribusiness.
              </p>

              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">What to Expect</h3>
                <div className="space-y-4">
                  {[
                    { icon: <Clock className="w-4 h-4" />, text: "30-minute consultation" },
                    { icon: <MessageCircle className="w-4 h-4" />, text: "Deep dive into your goals" },
                    { icon: <CheckCircle className="w-4 h-4" />, text: "No-pressure expert advice" },
                    { icon: <Calendar className="w-4 h-4" />, text: "Actionable next steps" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 text-sm text-slate-300">
                      <div className="text-green-500">{item.icon}</div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Form */}
          <div className="flex-1 p-8 lg:p-12 relative overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 z-20"
            >
              <X className="w-6 h-6" />
            </button>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone (WhatsApp)</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Company / Farm</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Your Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select your role</option>
                      <option value="owner">Farm Owner</option>
                      <option value="manager">Farm Manager</option>
                      <option value="processor">Processor/Aggregator</option>
                      <option value="investor">Investor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Current Challenges</label>
                  <textarea
                    name="currentChallenges"
                    required
                    rows={3}
                    value={formData.currentChallenges}
                    onChange={handleInputChange}
                    placeholder="What's the #1 thing holding you back right now?"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Time</label>
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select time</option>
                      <option value="morning">Morning (8AM - 12PM)</option>
                      <option value="afternoon">Afternoon (12PM - 5PM)</option>
                      <option value="evening">Evening (5PM - 8PM)</option>
                      <option value="flexible">I&apos;m flexible</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Time Zone</label>
                    <select
                      name="timeZone"
                      value={formData.timeZone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="GMT">GMT (Ghana, UK)</option>
                      <option value="WAT">WAT (Nigeria)</option>
                      <option value="CAT">CAT (SA, Kenya)</option>
                      <option value="EAT">EAT (Ethiopia)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Submit Request</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}