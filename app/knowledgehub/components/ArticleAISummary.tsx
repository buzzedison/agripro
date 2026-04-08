'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, Loader2 } from 'lucide-react';

interface Props {
    title: string;
    content: string;
    category?: string;
}

export default function ArticleAISummary({ title, content, category }: Props) {
    const [open, setOpen] = useState(false);
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    const fetchSummary = async () => {
        if (fetched) return;
        setLoading(true);
        try {
            const res = await fetch('/api/ai/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, category }),
            });
            const data = await res.json();
            setSummary(data.summary ?? 'Could not generate a summary for this article.');
            setFetched(true);
        } catch {
            setSummary('Could not generate a summary. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        const next = !open;
        setOpen(next);
        if (next && !fetched) fetchSummary();
    };

    return (
        <div className="my-8 rounded-2xl border border-green-200 bg-green-50 overflow-hidden">
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-green-100 transition-colors text-left"
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <div>
                        <span className="font-bold text-green-900 text-sm">AI Summary</span>
                        <span className="ml-2 text-[11px] text-green-600 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                            AgriPro AI
                        </span>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-green-600 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-1 border-t border-green-200">
                            {loading ? (
                                <div className="flex items-center gap-2 py-3 text-green-700 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Summarising article…
                                </div>
                            ) : (
                                <p className="text-green-900 text-sm leading-relaxed">{summary}</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
