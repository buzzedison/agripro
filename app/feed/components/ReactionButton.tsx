'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export const REACTIONS = [
    { type: 'like', emoji: '❤️', label: 'Like' },
    { type: 'useful', emoji: '👍', label: 'Useful' },
    { type: 'insightful', emoji: '💡', label: 'Insightful' },
    { type: 'support', emoji: '🤝', label: 'Support' },
] as const;

export type ReactionType = typeof REACTIONS[number]['type'];

type Props = {
    total: number;
    counts?: Partial<Record<ReactionType, number>>;
    current: ReactionType | null;
    onReact: (reaction: ReactionType | null) => void;
    disabled?: boolean;
};

/** Main click toggles a Like (or removes your reaction); the arrow opens the other reactions. */
export default function ReactionButton({ total, counts, current, onReact, disabled }: Props) {
    const [open, setOpen] = useState(false);
    const wrapper = useRef<HTMLDivElement>(null);
    const active = REACTIONS.find(r => r.type === current);
    const top = REACTIONS.filter(r => (counts?.[r.type] || 0) > 0)
        .sort((a, b) => (counts?.[b.type] || 0) - (counts?.[a.type] || 0))
        .slice(0, 3);

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent | KeyboardEvent) => {
            if (e instanceof KeyboardEvent ? e.key === 'Escape' : !wrapper.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', close);
        return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
    }, [open]);

    return (
        <div ref={wrapper} className="relative flex items-center">
            <button
                onClick={() => onReact(current ? null : 'like')}
                disabled={disabled}
                aria-pressed={!!current}
                aria-label={current ? `Remove your ${active?.label} reaction` : 'Like post'}
                title={top.map(r => `${r.label} ${counts?.[r.type]}`).join(' · ') || undefined}
                className={`flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 transition-colors ${current ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-red-50 hover:text-red-500'}`}
            >
                <span className="text-base leading-none" aria-hidden="true">
                    {active ? active.emoji : top.length ? top.map(r => r.emoji).join('') : '🤍'}
                </span>
                <span className="text-sm font-medium">{active ? active.label : total || ''}</span>
                {active && total > 0 && <span className="text-sm font-medium">· {total}</span>}
            </button>
            <button
                onClick={() => setOpen(o => !o)}
                disabled={disabled}
                aria-expanded={open}
                aria-label="Choose a reaction"
                className="rounded-r-lg px-1 py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
                <ChevronUp className="h-3.5 w-3.5" />
            </button>
            {open && (
                <div role="menu" className="absolute bottom-full left-0 z-50 mb-2 flex gap-1 rounded-full border border-gray-200 bg-white p-1.5 shadow-lg">
                    {REACTIONS.map(r => (
                        <button
                            key={r.type}
                            role="menuitemradio"
                            aria-checked={current === r.type}
                            onClick={() => { onReact(current === r.type ? null : r.type); setOpen(false); }}
                            title={r.label}
                            className={`flex flex-col items-center rounded-full px-2 py-1 text-xl transition-transform hover:scale-125 ${current === r.type ? 'bg-green-50' : ''}`}
                        >
                            <span aria-hidden="true">{r.emoji}</span>
                            <span className="text-[10px] font-medium text-gray-600">{r.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
