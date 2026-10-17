'use client';

import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

type Access = { isAdmin: boolean; email: string; protectedAccount: boolean; canPromote: boolean };

export default function AdminAccess({ fellowId, name }: { fellowId: string; name: string }) {
    const [access, setAccess] = useState<Access | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [confirming, setConfirming] = useState(false);
    const load = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/admin/fellows/${fellowId}/access`, { cache: 'no-store', signal });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not load admin access.');
            setAccess(data);
        } catch (cause) {
            if (signal?.aborted) return;
            setAccess(null);
            setError(cause instanceof Error ? cause.message : 'Could not load admin access.');
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [fellowId]);
    useEffect(() => {
        const controller = new AbortController();
        void load(controller.signal);
        return () => controller.abort();
    }, [load]);

    async function changeAccess() {
        if (!access || saving) return;
        setSaving(true);
        setError('');
        setNotice('');
        try {
            const response = await fetch(`/api/admin/fellows/${fellowId}/access`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !access.isAdmin }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not update admin access.');
            setAccess(data);
            setConfirming(false);
            setNotice(data.isAdmin ? `${name} can now open the admin dashboard.` : `Admin access removed for ${name}.`);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Could not update admin access.');
        } finally { setSaving(false); }
    }

    return (
        <section className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4" aria-label="Admin access">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900"><ShieldCheck className="h-4 w-4" /> Admin access</h3>
            <p className="mt-2 text-xs text-gray-600">Admins can access the AgriPro admin dashboard and manage members, content and programmes. This is separate from their fellowship designation.</p>
            {loading ? <p className="mt-3 text-sm text-gray-500">Checking access…</p> : access && <>
                <p className="mt-3 text-sm font-medium">{access.isAdmin ? 'Admin access enabled' : 'Fellow — no admin access'}</p>
                <p className="mt-1 break-all text-xs text-gray-500">{access.email}</p>
                {access.protectedAccount ? <p className="mt-3 text-xs text-gray-600">Your own access and super administrator accounts are protected.</p> : !access.isAdmin && !access.canPromote ? <p className="mt-3 text-xs text-gray-600">Set this fellow’s status to active before granting admin access.</p> : confirming ? <div className="mt-3 space-y-3">
                    <p className="text-sm text-gray-800">{access.isAdmin ? `Remove admin access for ${name}? Their fellow profile will remain.` : `Give ${name} access to the full admin dashboard?`}</p>
                    <div className="flex flex-wrap gap-2">
                        <button disabled={saving} onClick={changeAccess} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : access.isAdmin ? 'Confirm removal' : 'Confirm promotion'}</button>
                        <button disabled={saving} onClick={() => setConfirming(false)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Cancel</button>
                    </div>
                </div> : <button onClick={() => { setConfirming(true); setNotice(''); }} className="mt-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800">{access.isAdmin ? 'Remove admin access' : 'Make admin'}</button>}
            </>}
            {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
            {!loading && !access && <button onClick={() => void load()} className="mt-2 text-sm font-medium text-green-700">Retry</button>}
            {notice && <p role="status" className="mt-3 text-sm text-green-700">{notice}</p>}
        </section>
    );
}
