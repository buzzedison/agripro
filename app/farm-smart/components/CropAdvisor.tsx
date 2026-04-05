'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Send, Leaf, Loader2, RefreshCw } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

const STARTERS = [
    'What should I plant in Ghana in the rainy season?',
    'How do I treat cassava mosaic disease?',
    'Best fertiliser for maize on laterite soil in Nigeria',
    'How much water does drip-irrigated tomatoes need per day?',
    'What are the best drought-resistant crops for the Sahel?',
    'How do I start a profitable poultry farm with $500?',
];

export default function CropAdvisor() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [country, setCountry] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const send = async (text: string) => {
        const q = text.trim();
        if (!q || loading) return;
        setInput('');
        const updated: Message[] = [...messages, { role: 'user', content: q }];
        setMessages(updated);
        setLoading(true);
        try {
            const res = await fetch('/api/ai/crop-advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: q, context: { country } }),
            });
            const data = await res.json();
            setMessages([...updated, { role: 'assistant', content: data.answer ?? 'Unable to answer.' }]);
        } catch {
            setMessages([...updated, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#050A08] rounded-3xl overflow-hidden border border-white/5">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">AI Crop Advisor</h3>
                        <p className="text-gray-600 text-xs">Expert agronomy for African farmers</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-semibold">
                        Powered by Groq
                    </span>
                    {messages.length > 0 && (
                        <button
                            onClick={() => setMessages([])}
                            className="p-2 text-gray-600 hover:text-gray-400 hover:bg-white/5 rounded-lg transition-all"
                            title="Clear conversation"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Context bar */}
            <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
                <span className="text-xs text-gray-500 shrink-0">Your country:</span>
                <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Ghana, Kenya, Nigeria…"
                    className="flex-1 bg-transparent text-white text-xs placeholder-gray-700 focus:outline-none border-b border-white/10 focus:border-green-500/40 pb-1 transition-all"
                />
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 ? (
                    <div>
                        <p className="text-gray-600 text-xs mb-3 px-1">Try asking:</p>
                        <div className="grid grid-cols-1 gap-2">
                            {STARTERS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => send(s)}
                                    className="text-left px-3 py-2.5 bg-white/5 border border-white/8 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <AnimatePresence initial={false}>
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                                >
                                    {m.role === 'assistant' && (
                                        <div className="w-6 h-6 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0 mt-1">
                                            <Sparkles className="w-3 h-3 text-green-400" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] px-3 py-2.5 rounded-xl text-xs leading-relaxed ${
                                        m.role === 'user'
                                            ? 'bg-white text-gray-900 rounded-br-sm'
                                            : 'bg-white/5 border border-white/8 text-gray-200 rounded-bl-sm'
                                    }`}>
                                        {m.role === 'assistant'
                                            ? <div className="prose prose-invert prose-xs max-w-none prose-p:my-1 prose-li:my-0.5"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                                            : m.content
                                        }
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {loading && (
                            <div className="flex gap-2 items-center text-gray-500 text-xs">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-green-400" />
                                Consulting crop advisor…
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-white/5">
                <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-green-500/40 transition-all">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                        placeholder="Ask about crops, diseases, soil, markets…"
                        rows={1}
                        className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm resize-none focus:outline-none max-h-[120px] leading-relaxed"
                    />
                    <button
                        onClick={() => send(input)}
                        disabled={!input.trim() || loading}
                        className="shrink-0 w-8 h-8 rounded-xl bg-white disabled:bg-white/10 flex items-center justify-center transition-all"
                    >
                        <Send className={`w-3.5 h-3.5 ${input.trim() && !loading ? 'text-gray-900' : 'text-gray-600'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}
