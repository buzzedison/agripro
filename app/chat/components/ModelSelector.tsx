'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckIcon, Zap, Brain, Globe, FlaskConical } from 'lucide-react';
import { AIModel, MODEL_META, ModelSelectorProps } from '../types';

const MODEL_ICONS: Record<AIModel, React.ReactNode> = {
    'llama-70b':  <Brain className="w-4 h-4" />,
    'llama-8b':   <Zap className="w-4 h-4" />,
    'qwen-72b':   <Globe className="w-4 h-4" />,
    'qwen-qwq':   <FlaskConical className="w-4 h-4" />,
};

const MODELS: AIModel[] = ['llama-70b', 'llama-8b', 'qwen-72b', 'qwen-qwq'];

export default function ModelSelector({ selectedModel, onChange }: ModelSelectorProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const meta = MODEL_META[selectedModel];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-green-400 hover:text-green-700 transition-all shadow-sm"
            >
                <span className="text-green-600">{MODEL_ICONS[selectedModel]}</span>
                <span className="font-semibold">{meta.label}</span>
                <span className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${meta.badgeColor}`}>
                    {meta.badge}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-4 pt-4 pb-2">Choose AI Mode</p>
                    <div className="pb-2 px-2 space-y-1">
                        {MODELS.map((model) => {
                            const m = MODEL_META[model];
                            const active = selectedModel === model;
                            return (
                                <button
                                    key={model}
                                    onClick={() => { onChange(model); setOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                                        active ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {MODEL_ICONS[model]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">{m.label}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${m.badgeColor}`}>{m.badge}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{m.description}</p>
                                    </div>
                                    {active && <CheckIcon className="w-4 h-4 text-green-500 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100">
                        <p className="text-[11px] text-gray-400">AgriPro AI · Always free to use</p>
                    </div>
                </div>
            )}
        </div>
    );
}
