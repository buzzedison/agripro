'use client';

import { Loader2 } from 'lucide-react';
import CatalystAdminHeader from './CatalystAdminHeader';

export function StatTiles({ items, loading }: { items: { label: string; value: React.ReactNode; hint?: string }[]; loading?: boolean }) {
    return (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {items.map(s => (
                <div key={s.label} className="rounded-xl bg-white/10 p-4" title={s.hint}>
                    <p className="text-2xl font-black">{loading ? '–' : s.value}</p>
                    <p className="mt-0.5 text-xs font-semibold opacity-70">{s.label}</p>
                </div>
            ))}
        </div>
    );
}

/** Page frame for launch pages: header, tiles, and loading/error states around the content. */
export default function LaunchShell({ title, subtitle, onRefresh, tiles, loading, error, children }: {
    title: string;
    subtitle: string;
    onRefresh: () => void;
    tiles?: { label: string; value: React.ReactNode; hint?: string }[];
    loading: boolean;
    error: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <CatalystAdminHeader title={title} subtitle={subtitle} onRefresh={onRefresh}>
                {tiles && <StatTiles items={tiles} loading={loading} />}
            </CatalystAdminHeader>
            <div className="mx-auto max-w-7xl px-6 py-8">
                {error ? (
                    <div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error} <button onClick={onRefresh} className="ml-2 font-semibold underline">Retry</button></div>
                ) : loading ? (
                    <div role="status" className="flex items-center justify-center gap-2 rounded-xl bg-white p-10 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
                ) : children}
            </div>
        </div>
    );
}

export const card = 'rounded-xl border border-gray-100 bg-white p-5 shadow-sm';
export const input = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30';
export const btnPrimary = 'inline-flex items-center gap-1.5 rounded-lg bg-[#0B2C24] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50';
export const btnSecondary = 'inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50';
export const label = 'block text-xs font-semibold text-gray-500';
