'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Mail, Send } from 'lucide-react';

interface CustomEmailComposerProps {
    recipientName: string;
    recipientEmail: string;
    onSend: (subject: string, body: string) => Promise<void>;
    sending?: boolean;
    subtitle?: string;
}

export default function CustomEmailComposer({
    recipientName,
    recipientEmail,
    onSend,
    sending = false,
    subtitle = 'Write your own subject and message',
}: CustomEmailComposerProps) {
    const [open, setOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const canSend = subject.trim().length > 0 && body.trim().length > 0 && !sending;

    const handleSend = async () => {
        if (!canSend) return;
        const confirmed = window.confirm(`Send custom email to ${recipientName} (${recipientEmail})?`);
        if (!confirmed) return;
        await onSend(subject.trim(), body.trim());
        setSubject('');
        setBody('');
        setOpen(false);
    };

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
                <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Write Custom Email
                </span>
                {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {open && (
                <div className="p-4 space-y-3 border-t border-gray-200 bg-white">
                    <p className="text-xs text-gray-500">{subtitle}</p>
                    <p className="text-xs text-gray-400">
                        To: <span className="font-medium text-gray-600">{recipientName}</span>
                        {' · '}
                        {recipientEmail}
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="Email subject line…"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Message</label>
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            rows={6}
                            placeholder="Write your message here. Use blank lines to separate paragraphs."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-y min-h-[120px]"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!canSend}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#0B2C24] hover:bg-[#0a241e] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Send Custom Email
                    </button>
                </div>
            )}
        </div>
    );
}
