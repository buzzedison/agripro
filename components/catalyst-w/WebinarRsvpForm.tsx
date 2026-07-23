'use client';

import { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

interface Props {
    webinarId: string;
    webinarTitle: string;
}

export default function WebinarRsvpForm({ webinarId, webinarTitle }: Props) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('');
    const [organisation, setOrganisation] = useState('');
    const [roleTitle, setRoleTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/catalyst-w/webinars/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    webinar_id: webinarId,
                    full_name: fullName,
                    email,
                    phone,
                    country,
                    organisation,
                    role_title: roleTitle,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Registration failed');

            setSuccess(true);
        } catch (err: any) {
            setError(err.message ?? 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div id="register" className="bg-[#0B2C24] text-white rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-[#F4C430] mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">You&apos;re registered!</h2>
                <p className="text-white/70 text-sm leading-relaxed">
                    Thank you for signing up for <span className="text-white font-medium">{webinarTitle}</span>.
                    We will send you the join link and reminder before the session.
                </p>
            </div>
        );
    }

    return (
        <div id="register" className="bg-[#0B2C24] text-white rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-1">Register for this webinar</h2>
            <p className="text-white/60 text-sm mb-6">
                Free to attend. Join details will be emailed to you before the session.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Full name *</label>
                    <input
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C430]/50"
                        placeholder="Your name"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Email *</label>
                    <input
                        required
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C430]/50"
                        placeholder="you@example.com"
                    />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Country</label>
                        <input
                            value={country}
                            onChange={e => setCountry(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C430]/50"
                            placeholder="Ghana"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Phone</label>
                        <input
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C430]/50"
                            placeholder="+233…"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Business / Organisation</label>
                    <input
                        value={organisation}
                        onChange={e => setOrganisation(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C430]/50"
                        placeholder="Your agribusiness"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Your role</label>
                    <input
                        value={roleTitle}
                        onChange={e => setRoleTitle(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C430]/50"
                        placeholder="Founder, CEO, etc."
                    />
                </div>

                {error && (
                    <p className="text-red-300 text-sm">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#F4C430] text-[#0B2C24] font-bold rounded-full text-sm hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'Submitting…' : 'RSVP — Register free'}
                </button>
            </form>
        </div>
    );
}
