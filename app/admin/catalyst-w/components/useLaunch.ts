'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { BudgetLine, CountryGathering, FounderGroup, LaunchSettings, Offer, Partner, ScholarshipRequest } from '@/lib/catalyst-launch';
import type { ApplicationStatus } from '@/lib/catalyst-selection';

export type LaunchFounder = {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    country: string | null;
    business_name: string | null;
    sector: string | null;
    status: ApplicationStatus;
    plan_tier: string | null;
    participant_status: string | null;
    reserve_rank: number | null;
    scholarship_invited_at: string | null;
    welcome_sent_at: string | null;
    group_id: string | null;
    next_action: string | null;
    next_action_due: string | null;
    created_at: string;
    business_verified: boolean | null;
    has_portal: boolean;
};

export type LaunchSession = { id: string; week_number: number; title: string; type: string; scheduled_date: string | null; scheduled_time: string | null; timezone: string | null; status: string };
export type LaunchPayment = { id: string; offer_id: string; reference: string; amount_usd: number | null; status: string; created_at: string };

export type LaunchData = {
    me: string;
    settings: LaunchSettings;
    founders: LaunchFounder[];
    scholarships: ScholarshipRequest[];
    offers: Offer[];
    payments: LaunchPayment[];
    partners: Partner[];
    budget: BudgetLine[];
    countries: CountryGathering[];
    groups: FounderGroup[];
    cohort: { id: string; name: string; start_date: string } | null;
    sessions: LaunchSession[];
};

const numeric = (d: LaunchData): LaunchData => ({
    ...d,
    settings: { ...d.settings, standard_fee_usd: Number(d.settings.standard_fee_usd) },
    offers: d.offers.map(o => ({ ...o, fee_usd: Number(o.fee_usd), amount_paid_usd: o.amount_paid_usd == null ? null : Number(o.amount_paid_usd) })),
    scholarships: d.scholarships.map(s => ({ ...s, can_contribute_usd: Number(s.can_contribute_usd) })),
    partners: d.partners.map(p => ({ ...p, amount_usd: p.amount_usd == null ? null : Number(p.amount_usd) })),
    budget: d.budget.map(b => ({ ...b, budget_usd: Number(b.budget_usd), funded_usd: Number(b.funded_usd) })),
});

/** Loads every launch workstream at once; pages update slices locally after each action. */
export function useLaunch() {
    const [data, setData] = useState<LaunchData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/catalyst-w/launch', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Could not load launch data.');
            setData(numeric(json));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { void load(); }, [load]);

    return { data, setData, loading, error, load };
}

/** Runs a launch action; shows the error as a toast and returns null on failure. */
export async function launchAction<T = any>(action: string, payload: Record<string, unknown> = {}, success?: string): Promise<T | null> {
    try {
        const res = await fetch('/api/admin/catalyst-w/launch', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...payload }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Something went wrong');
        if (success) toast.success(success);
        return json as T;
    } catch (e: any) {
        toast.error(e.message);
        return null;
    }
}

export function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
    return list.some(x => x.id === item.id) ? list.map(x => (x.id === item.id ? { ...x, ...item } : x)) : [...list, item];
}
