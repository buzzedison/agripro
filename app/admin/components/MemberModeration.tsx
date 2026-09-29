'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, X, Loader2 } from 'lucide-react';

type Action = 'suspend' | 'block' | 'restore' | 'delete';
const labels: Record<Action, string> = { suspend: 'Suspend member', block: 'Block from feed', restore: 'Restore feed access', delete: 'Delete account' };

export default function MemberModeration({ userId, name, onComplete }: { userId: string; name: string; onComplete: () => void | Promise<void> }) {
    const [open, setOpen] = useState(false);
    const [action, setAction] = useState<Action>('suspend');
    const [days, setDays] = useState(7);
    const [reason, setReason] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState<{ id: string; action: string; reason: string; created_at: string }[]>([]);
    const dialog = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (!open) return;
        dialog.current?.showModal();
        let cancelled = false;
        createClient().from('moderation_actions').select('id, action, reason, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
            .then(({ data, error }) => {
                if (cancelled) return;
                setHistory(data || []);
                if (error) setError('Could not load moderation history. Check that the moderation migration is installed.');
            });
        return () => { cancelled = true; };
    }, [open, userId]);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setBusy(true);
        setError('');
        try {
            const { error } = await createClient().rpc('moderate_feed_user', { p_user: userId, p_action: action, p_reason: reason.trim(), p_days: days });
            if (error) throw error;
            await onComplete();
            setOpen(false);
        } catch (error) {
            setError((error as { message?: string }).message || 'Could not apply this action. Please try again.');
        } finally { setBusy(false); }
    }

    return <>
        <button type="button" onClick={() => { setError(''); setReason(''); setConfirmation(''); setAction('suspend'); setOpen(true); }} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
            <Shield className="h-4 w-4" /> Moderate
        </button>
        {open && <dialog ref={dialog} onCancel={event => { if (busy) event.preventDefault(); else setOpen(false); }} aria-labelledby={`moderate-${userId}`} className="m-auto w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-0 text-left shadow-xl backdrop:bg-black/50">
            <form onSubmit={submit} className="space-y-5 p-6 whitespace-normal">
                <div className="flex items-start justify-between gap-3">
                    <div><h2 id={`moderate-${userId}`} className="text-lg font-bold text-gray-900">Moderate {name}</h2><p className="mt-1 text-sm text-gray-500">Every action is recorded for accountability.</p></div>
                    <button type="button" disabled={busy} onClick={() => setOpen(false)} aria-label="Close moderation" className="p-1"><X className="h-5 w-5" /></button>
                </div>
                <label className="block text-sm font-medium text-gray-700">Action
                    <select value={action} onChange={event => setAction(event.target.value as Action)} disabled={busy} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5">
                        {Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                    </select>
                </label>
                {action === 'suspend' && <label className="block text-sm font-medium text-gray-700">Duration
                    <select value={days} onChange={event => setDays(Number(event.target.value))} disabled={busy} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5">
                        <option value={1}>1 day</option><option value={7}>7 days</option><option value={30}>30 days</option>
                    </select>
                </label>}
                <p className={`rounded-xl p-3 text-sm ${action === 'delete' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-900'}`}>
                    {action === 'suspend' ? 'Hides their posts and comments and stops new submissions until the suspension expires automatically.' : action === 'block' ? 'Hides their posts and comments and stops new submissions until an admin restores access.' : action === 'restore' ? 'Removes the feed restriction and makes their existing content visible again.' : 'Permanently deletes this account and its linked posts and comments. This cannot be undone.'}
                </p>
                <label className="block text-sm font-medium text-gray-700">Reason
                    <textarea autoFocus required minLength={5} maxLength={1000} value={reason} disabled={busy} onChange={event => setReason(event.target.value)} placeholder="Describe the spam or policy violation…" rows={3} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5" />
                </label>
                {action === 'delete' && <label className="block text-sm font-medium text-red-700">Type DELETE to confirm
                    <input value={confirmation} disabled={busy} onChange={event => setConfirmation(event.target.value)} className="mt-1 w-full rounded-lg border border-red-300 p-2.5" autoComplete="off" />
                </label>}
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                <button disabled={busy || reason.trim().length < 5 || (action === 'delete' && confirmation !== 'DELETE')} className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white disabled:opacity-40 ${action === 'delete' ? 'bg-red-600' : 'bg-gray-900'}`}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Applying…' : labels[action]}
                </button>
                {history.length > 0 && <div className="border-t pt-4"><h3 className="text-sm font-semibold text-gray-900">Recent actions</h3><ul className="mt-2 space-y-3">{history.map(item => <li key={item.id} className="text-xs text-gray-600"><span className="font-semibold capitalize">{item.action}</span> · {new Date(item.created_at).toLocaleDateString()}<p className="mt-1 break-words">{item.reason}</p></li>)}</ul></div>}
            </form>
        </dialog>}
    </>;
}
