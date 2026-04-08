'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Sparkles, X, Send, MessageCircle, Loader2 } from 'lucide-react';

interface ChatMsg { role: 'user' | 'assistant'; content: string; }

interface Props {
    articleTitle: string;
    articleContent: string;
}

const STARTERS = [
    'What are the key takeaways?',
    'How does this apply to smallholders?',
    'What should I do first?',
];

export default function ArticleChat({ articleTitle, articleContent }: Props) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const send = async (text: string) => {
        const q = text.trim();
        if (!q || loading) return;
        setInput('');
        const newHistory: ChatMsg[] = [...messages, { role: 'user', content: q }];
        setMessages(newHistory);
        setLoading(true);
        try {
            const res = await fetch('/api/ai/article-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: q,
                    articleTitle,
                    articleContent: articleContent.slice(0, 4000),
                    history: messages.slice(-8),
                }),
            });
            const data = await res.json();
            setMessages([...newHistory, { role: 'assistant', content: data.answer ?? 'Could not answer.' }]);
        } catch {
            setMessages([...newHistory, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating trigger */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-full shadow-2xl hover:bg-green-700 transition-all text-sm font-bold"
            >
                <MessageCircle className="w-4 h-4" />
                Ask AI about this article
            </button>

            {/* Chat panel */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.97 }}
                            transition={{ duration: 0.25 }}
                            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 max-h-[75vh] bg-white border border-gray-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 shrink-0 bg-white">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-green-600" />
                                    </div>
                                    <span className="text-gray-900 font-bold text-sm">Ask about this article</span>
                                </div>
                                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 bg-gray-50">
                                {messages.length === 0 && (
                                    <div>
                                        <p className="text-gray-400 text-xs mb-3">Try asking:</p>
                                        <div className="space-y-2">
                                            {STARTERS.map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => send(s)}
                                                    className="block w-full text-left px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 hover:text-gray-900 hover:border-green-300 hover:bg-green-50 transition-all"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                            m.role === 'user'
                                                ? 'bg-green-600 text-white rounded-br-sm'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                                        }`}>
                                            {m.role === 'assistant'
                                                ? <div className="prose prose-sm max-w-none"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                                                : m.content
                                            }
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-2 items-center text-gray-400 text-xs">
                                        <Loader2 className="w-3 h-3 animate-spin text-green-500" />
                                        Thinking…
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input */}
                            <div className="px-3 py-3 border-t border-gray-100 shrink-0 bg-white">
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-green-400 transition-all">
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
                                        placeholder="Ask anything about this article…"
                                        className="flex-1 bg-transparent text-gray-800 text-xs placeholder-gray-400 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => send(input)}
                                        disabled={!input.trim() || loading}
                                        className="w-6 h-6 rounded-lg bg-green-600 disabled:bg-gray-200 flex items-center justify-center transition-all"
                                    >
                                        <Send className={`w-3 h-3 ${input.trim() && !loading ? 'text-white' : 'text-gray-400'}`} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
