'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
    ArrowLeft, Send, RefreshCw, Sparkles,
    Copy, Check, Leaf, TrendingUp, CloudRain,
    ShoppingBag, Users, BookOpen, ExternalLink,
} from 'lucide-react';
import ModelSelector from './components/ModelSelector';
import { Message, AIModel } from './types';
import { SearchSource } from '@/lib/search';

const SUGGESTED_PROMPTS = [
    { icon: Leaf,        text: 'What crops grow best in West African savanna during the dry season?' },
    { icon: TrendingUp,  text: 'How do I access financing as a smallholder farmer in Kenya?' },
    { icon: CloudRain,   text: 'Climate-smart practices for cassava farming in low-rainfall areas' },
    { icon: ShoppingBag, text: 'How do I find buyers for my maize harvest through AgriPro?' },
    { icon: Users,       text: 'What is Catalyst W and how can my women-led venture apply?' },
    { icon: BookOpen,    text: 'Best practices for post-harvest loss reduction in grains' },
];

function ThinkingDots() {
    return (
        <div className="flex items-center gap-1.5 px-1 py-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-green-500"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                />
            ))}
        </div>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            title="Copy response"
        >
            {copied
                ? <Check className="w-3.5 h-3.5 text-green-500" />
                : <Copy className="w-3.5 h-3.5" />
            }
        </button>
    );
}

function SourcesBar({ sources }: { sources: SearchSource[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-1.5 pt-1"
        >
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-0.5">
                Sources
            </p>
            <div className="flex flex-wrap gap-2">
                {sources.map((s, i) => (
                    <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.title}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-green-400 hover:shadow-sm transition-all group max-w-[200px]"
                    >
                        <img
                            src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=16`}
                            alt=""
                            className="w-3.5 h-3.5 shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span className="text-xs text-gray-600 group-hover:text-green-700 truncate">
                            {s.domain}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                    </a>
                ))}
            </div>
        </motion.div>
    );
}

interface MessageWithSuggestions extends Message {
    suggestions?: string[];
    streaming?: boolean;
    sources?: SearchSource[];
}

export default function ChatPage() {
    const [messages, setMessages] = useState<MessageWithSuggestions[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState<AIModel>('llama-70b');
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-grow textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 180)}px`;
        }
    }, [input]);

    const fetchSuggestions = useCallback(async (question: string, answer: string, msgId: string) => {
        try {
            const res = await fetch('/api/chat/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lastQuestion: question, lastAnswer: answer }),
            });
            const data = await res.json();
            if (data.suggestions?.length) {
                setMessages((prev) => prev.map((m) =>
                    m.id === msgId ? { ...m, suggestions: data.suggestions } : m
                ));
            }
        } catch {
            // Suggestions are non-critical — fail silently
        }
    }, []);

    const send = useCallback(async (text: string) => {
        const content = text.trim();
        if (!content || loading) return;

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setInput('');

        const userMsg: MessageWithSuggestions = {
            id: Date.now().toString(),
            content,
            role: 'user',
            createdAt: new Date(),
        };

        const aiMsgId = `${Date.now()}-ai`;
        const aiPlaceholder: MessageWithSuggestions = {
            id: aiMsgId,
            content: '',
            role: 'assistant',
            createdAt: new Date(),
            model,
            streaming: true,
        };

        setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
        setLoading(true);

        const historySnapshot = messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .slice(-20)
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: content, model, history: historySnapshot }),
                signal: abortRef.current.signal,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: 'Request failed' }));
                throw new Error(data.error || 'Request failed');
            }

            if (!res.body) throw new Error('No response stream');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = '';
            let sourcesChecked = false;
            let sources: SearchSource[] = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                if (!sourcesChecked) {
                    accumulated += chunk;
                    const newlineIdx = accumulated.indexOf('\n');

                    if (newlineIdx !== -1) {
                        const firstLine = accumulated.slice(0, newlineIdx);
                        if (firstLine.startsWith('__SOURCES__:')) {
                            try {
                                sources = JSON.parse(firstLine.slice(12));
                                setMessages((prev) => prev.map((m) =>
                                    m.id === aiMsgId ? { ...m, sources } : m
                                ));
                            } catch {}
                            accumulated = accumulated.slice(newlineIdx + 1);
                        }
                        sourcesChecked = true;
                        if (accumulated) {
                            setMessages((prev) => prev.map((m) =>
                                m.id === aiMsgId ? { ...m, content: accumulated, streaming: true } : m
                            ));
                        }
                    } else if (!accumulated.startsWith('__SOURCES__:') && accumulated.length > 15) {
                        sourcesChecked = true;
                        setMessages((prev) => prev.map((m) =>
                            m.id === aiMsgId ? { ...m, content: accumulated, streaming: true } : m
                        ));
                    }
                } else {
                    accumulated += chunk;
                    setMessages((prev) => prev.map((m) =>
                        m.id === aiMsgId ? { ...m, content: accumulated, streaming: true } : m
                    ));
                }
            }

            setMessages((prev) => prev.map((m) =>
                m.id === aiMsgId ? { ...m, streaming: false } : m
            ));

            if (accumulated) {
                fetchSuggestions(content, accumulated, aiMsgId);
            }

        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setMessages((prev) => prev.map((m) =>
                m.id === aiMsgId
                    ? { ...m, content: err.message || 'Something went wrong. Please try again.', role: 'system' as const, streaming: false }
                    : m
            ));
        } finally {
            setLoading(false);
        }
    }, [loading, messages, model, fetchSuggestions]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(input);
        }
    };

    const isThinking = loading && messages.length > 0 && messages[messages.length - 1]?.content === '';

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden">

            {/* ── Header ── */}
            <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back</span>
                    </Link>
                    <div className="w-px h-5 bg-gray-200" />
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-bold text-sm text-gray-900">AgriPro AI</span>
                        <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 font-semibold">
                            Beta
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ModelSelector selectedModel={model} onChange={setModel} />
                    {messages.length > 0 && (
                        <button
                            onClick={() => { setMessages([]); abortRef.current?.abort(); setLoading(false); }}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (

                    /* Empty state */
                    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="w-16 h-16 rounded-2xl bg-green-100 border border-green-200 flex items-center justify-center mb-5"
                        >
                            <Sparkles className="w-8 h-8 text-green-600" />
                        </motion.div>
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-center mb-10"
                        >
                            <h2 className="text-2xl font-black text-gray-900 mb-2">AgriPro AI</h2>
                            <p className="text-gray-500 text-sm max-w-sm">
                                Expert agricultural intelligence for African agribusiness. Ask anything — crops, markets, finance, climate.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full max-w-2xl"
                        >
                            {SUGGESTED_PROMPTS.map((p, i) => (
                                <motion.button
                                    key={p.text}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.25 + i * 0.05 }}
                                    onClick={() => send(p.text)}
                                    className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-green-400 hover:shadow-sm transition-all text-left group"
                                >
                                    <p.icon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-xs text-gray-500 group-hover:text-gray-700 leading-relaxed">{p.text}</span>
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>

                ) : (
                    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex gap-3 group ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mt-1 ${
                                        msg.role === 'user'
                                            ? 'bg-green-600 text-white'
                                            : msg.role === 'system'
                                            ? 'bg-red-100 text-red-500'
                                            : 'bg-green-100 text-green-600'
                                    }`}>
                                        {msg.role === 'user'
                                            ? 'U'
                                            : msg.role === 'system'
                                            ? '!'
                                            : <Sparkles className="w-3.5 h-3.5" />
                                        }
                                    </div>

                                    {/* Bubble + suggestions */}
                                    <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        {msg.role === 'user' ? (
                                            <div className="bg-green-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
                                                {msg.content}
                                            </div>
                                        ) : msg.content === '' && (msg as any).streaming ? (
                                            /* Thinking state — empty bubble with dots */
                                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                                <ThinkingDots />
                                            </div>
                                        ) : (
                                            <>
                                                <div className={`rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed ${
                                                    msg.role === 'system'
                                                        ? 'bg-red-50 border border-red-200 text-red-600'
                                                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                                                }`}>
                                                    <div className="prose prose-sm max-w-none
                                                        prose-p:leading-relaxed prose-p:my-1.5
                                                        prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:text-xs
                                                        prose-code:text-green-700 prose-code:bg-green-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                                                        prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-1
                                                        prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
                                                        prose-strong:text-gray-900
                                                        prose-ul:my-1.5 prose-ol:my-1.5
                                                        prose-li:my-0.5
                                                        prose-table:text-xs prose-th:bg-gray-50 prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1
                                                    ">
                                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                    </div>
                                                    {/* Streaming cursor */}
                                                    {(msg as any).streaming && (
                                                        <span className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 animate-pulse align-middle" />
                                                    )}
                                                </div>

                                                {/* Metadata row */}
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[10px] text-gray-400">
                                                        {msg.createdAt instanceof Date
                                                            ? msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {msg.role === 'assistant' && !((msg as any).streaming) && (
                                                        <CopyButton text={msg.content} />
                                                    )}
                                                </div>

                                                {/* Sources */}
                                                {(msg as MessageWithSuggestions).sources?.length && !((msg as any).streaming) && (
                                                    <SourcesBar sources={(msg as MessageWithSuggestions).sources!} />
                                                )}

                                                {/* Follow-up suggestions */}
                                                {(msg as MessageWithSuggestions).suggestions?.length && !((msg as any).streaming) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="flex flex-wrap gap-2 pt-1"
                                                    >
                                                        {(msg as MessageWithSuggestions).suggestions!.map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={() => send(s)}
                                                                className="text-xs px-3 py-1.5 bg-white border border-gray-200 hover:border-green-400 hover:text-green-700 rounded-full text-gray-600 transition-all hover:shadow-sm"
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* ── Input bar ── */}
            <div className="shrink-0 px-4 py-4 border-t border-gray-200 bg-white">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-end gap-3 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus-within:border-green-400 focus-within:shadow-sm transition-all">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Ask anything about African agribusiness…"
                            rows={1}
                            disabled={loading}
                            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm resize-none focus:outline-none max-h-[180px] leading-relaxed disabled:opacity-60"
                        />
                        <button
                            onClick={() => send(input)}
                            disabled={!input.trim() || loading}
                            className="shrink-0 w-9 h-9 rounded-xl bg-green-600 disabled:bg-gray-200 flex items-center justify-center transition-all hover:bg-green-700 disabled:cursor-not-allowed"
                        >
                            <Send className={`w-4 h-4 ${input.trim() && !loading ? 'text-white' : 'text-gray-400'}`} />
                        </button>
                    </div>
                    <p className="text-center text-[11px] text-gray-400 mt-2">
                        Shift+Enter for new line · Enter to send · AgriPro AI can make mistakes
                    </p>
                </div>
            </div>
        </div>
    );
}
