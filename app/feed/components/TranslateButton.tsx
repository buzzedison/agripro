'use client';

import { useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { TRANSLATE_LANGUAGES, TranslateLanguage } from '@/lib/feed-translate';

const STORAGE_KEY = 'agripro-translate-language';

function preferredLanguage(): TranslateLanguage {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && TRANSLATE_LANGUAGES.some(l => l.code === saved)) return saved as TranslateLanguage;
    } catch { /* storage unavailable */ }
    const browser = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en';
    return (TRANSLATE_LANGUAGES.find(l => l.code === browser)?.code ?? 'en') as TranslateLanguage;
}

/** "Translate" link under a post; shows the translation inline and remembers the chosen language. */
export default function TranslateButton({ text }: { text: string }) {
    const [language, setLanguage] = useState<TranslateLanguage | null>(null);
    const [translations, setTranslations] = useState<Partial<Record<TranslateLanguage, string>>>({});
    const [showing, setShowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!text.trim()) return null;
    const current = language ?? 'en';

    const translate = async (target: TranslateLanguage) => {
        setLanguage(target);
        setShowing(true);
        setError('');
        try { localStorage.setItem(STORAGE_KEY, target); } catch { /* ignore */ }
        if (translations[target]) return;
        setLoading(true);
        try {
            const res = await fetch('/api/ai/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, target }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setTranslations(prev => ({ ...prev, [target]: data.translation }));
        } catch (err: any) {
            setError(err?.message || 'Could not translate right now.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-gray-500">
                <button
                    onClick={() => (showing ? setShowing(false) : translate(language ?? preferredLanguage()))}
                    className="inline-flex items-center gap-1 font-medium hover:text-green-700"
                >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
                    {showing ? 'Show original' : 'Translate'}
                </button>
                {showing && (
                    <select
                        value={current}
                        onChange={e => translate(e.target.value as TranslateLanguage)}
                        aria-label="Translation language"
                        className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-600"
                    >
                        {TRANSLATE_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                )}
            </div>
            {showing && !loading && (error ? (
                <p role="alert" className="mt-1.5 text-red-600">{error}</p>
            ) : translations[current] ? (
                <div className="mt-1.5 rounded-lg border-l-2 border-green-500 bg-green-50/60 px-3 py-2 text-sm text-gray-800 whitespace-pre-wrap" lang={current}>
                    {translations[current]}
                    <p className="mt-1 text-[11px] text-gray-500">Machine translation — may contain mistakes.</p>
                </div>
            ) : null)}
        </div>
    );
}
