'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { SelectionQuestion } from '@/lib/catalyst-selection';

type Draft = Omit<SelectionQuestion, 'id'> & { id?: string; key: string };

/** Edit the selection questions and their weights. Questions are switched off, never deleted, because scorecards refer to them. */
export default function QuestionsEditor({ questions, onSaved }: { questions: SelectionQuestion[]; onSaved: (q: SelectionQuestion[]) => void }) {
    const [drafts, setDrafts] = useState<Draft[]>(() => questions.map(q => ({ ...q, key: q.id })));
    const [saving, setSaving] = useState(false);
    const update = (key: string, patch: Partial<Draft>) => setDrafts(prev => prev.map(d => (d.key === key ? { ...d, ...patch } : d)));
    const move = (i: number, dir: -1 | 1) => setDrafts(prev => {
        const next = [...prev];
        const j = i + dir;
        if (j < 0 || j >= next.length) return prev;
        [next[i], next[j]] = [next[j], next[i]];
        return next;
    });

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/catalyst-w/selection', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save_questions', questions: drafts.map(({ key, ...d }) => d) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Could not save questions');
            onSaved(data.questions);
            setDrafts(data.questions.map((q: SelectionQuestion) => ({ ...q, key: q.id })));
            toast.success('Selection questions saved');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    const totalWeight = drafts.filter(d => d.active).reduce((s, d) => s + Number(d.weight || 0), 0);

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-bold text-gray-900">Selection questions</h2>
                    <p className="text-sm text-gray-500">Interviewers score each active question. Weight sets how much it counts (active weights total {totalWeight.toFixed(1)}).</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setDrafts(prev => [...prev, { key: `new-${Date.now()}`, position: prev.length + 1, prompt: '', guidance: '', weight: 1, max_score: 5, active: true }])}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                        <Plus className="h-4 w-4" /> Add question
                    </button>
                    <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2C24] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save questions
                    </button>
                </div>
            </div>
            <ol className="space-y-3">
                {drafts.map((d, i) => (
                    <li key={d.key} className={`rounded-lg border p-3 ${d.active ? 'border-gray-200' : 'border-dashed border-gray-200 bg-gray-50 opacity-70'}`}>
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center gap-1 pt-1 text-xs font-bold text-gray-400">
                                <button aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                                {i + 1}
                                <button aria-label="Move down" onClick={() => move(i, 1)} disabled={i === drafts.length - 1} className="disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                            </div>
                            <div className="flex-1 space-y-2">
                                <input value={d.prompt} maxLength={300} onChange={e => update(d.key, { prompt: e.target.value })} placeholder="Question" aria-label={`Question ${i + 1}`} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium" />
                                <textarea value={d.guidance || ''} maxLength={1000} rows={2} onChange={e => update(d.key, { guidance: e.target.value })} placeholder="Guidance for interviewers (what a high score looks like)" aria-label={`Guidance for question ${i + 1}`} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600" />
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                                    <label className="flex items-center gap-1.5">Weight
                                        <input type="number" min={0.5} max={5} step={0.5} value={d.weight} onChange={e => update(d.key, { weight: Number(e.target.value) })} className="w-16 rounded border border-gray-200 px-2 py-1" />
                                    </label>
                                    <label className="flex items-center gap-1.5">Scored out of
                                        <select value={d.max_score} onChange={e => update(d.key, { max_score: Number(e.target.value) })} className="rounded border border-gray-200 px-2 py-1">
                                            {[3, 4, 5, 10].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </label>
                                    <label className="flex items-center gap-1.5">
                                        <input type="checkbox" checked={d.active} onChange={e => update(d.key, { active: e.target.checked })} /> Active
                                    </label>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}
