'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, Loader2, RefreshCw } from 'lucide-react';

interface Props {
    businessName: string;
    businessType: string;
    city: string;
    country: string;
    currentDescription: string;
    onApply: (improved: string) => void;
}

export default function AIDescriptionBoost({ businessName, businessType, city, country, currentDescription, onApply }: Props) {
    const [improved, setImproved] = useState('');
    const [loading, setLoading] = useState(false);
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState('');

    const generate = async () => {
        if (!currentDescription || currentDescription.trim().length < 10) {
            setError('Add a description first before improving it.');
            return;
        }
        setLoading(true);
        setError('');
        setApplied(false);
        try {
            const res = await fetch('/api/ai/improve-bio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessName, businessType, city, country, currentDescription }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setImproved(data.improved);
        } catch (e: any) {
            setError(e.message || 'Could not improve description.');
        } finally {
            setLoading(false);
        }
    };

    const apply = () => {
        onApply(improved);
        setApplied(true);
    };

    return (
        <div className="mt-2">
            <button
                onClick={generate}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
            >
                {loading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Improving…</>
                    : <><Sparkles className="w-3.5 h-3.5" /> AI Improve</>
                }
            </button>

            <AnimatePresence>
                {improved && !applied && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4"
                    >
                        <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-xs font-bold text-green-700">AI Suggestion</span>
                        </div>
                        <p className="text-sm text-green-900 leading-relaxed mb-3">{improved}</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={apply}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 transition-all"
                            >
                                <Check className="w-3 h-3" /> Use this
                            </button>
                            <button
                                onClick={generate}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-green-200 text-green-700 text-xs font-medium rounded-full hover:bg-green-50 transition-all"
                            >
                                <RefreshCw className="w-3 h-3" /> Regenerate
                            </button>
                        </div>
                    </motion.div>
                )}
                {applied && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-green-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Applied to your description
                    </motion.p>
                )}
                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 text-xs text-red-500">{error}</motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
