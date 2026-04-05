'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

interface Props {
    essay: string;
    role?: string;
    minLength?: number;
}

export default function EssayFeedback({ essay, role, minLength = 80 }: Props) {
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const tooShort = essay.trim().length < minLength;

    const getFeedback = async () => {
        if (tooShort) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/ai/essay-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ essay, role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setFeedback(data.feedback);
        } catch (e: any) {
            setError(e.message || 'Could not generate feedback.');
        } finally {
            setLoading(false);
        }
    };

    if (tooShort) return null;

    return (
        <div className="mt-2">
            <button
                onClick={getFeedback}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
            >
                {loading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Getting feedback…</>
                    : <><Sparkles className="w-3.5 h-3.5" /> Get AI feedback on this</>
                }
            </button>

            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 bg-white/5 border border-white/10 rounded-xl p-4"
                    >
                        <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-xs font-bold text-green-400">AI Feedback</span>
                        </div>
                        <pre className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">{feedback}</pre>
                        <button
                            onClick={getFeedback}
                            className="mt-3 text-xs text-gray-500 hover:text-gray-400 transition-colors"
                        >
                            Refresh feedback
                        </button>
                    </motion.div>
                )}
                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 text-xs text-red-400">{error}</motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
