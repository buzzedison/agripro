'use client';

import { useState } from 'react';
import { AlertTriangle, MapPin, Plus } from 'lucide-react';
import LaunchShell, { btnPrimary, btnSecondary, card, input, label } from '../components/LaunchShell';
import { launchAction, upsertById, useLaunch } from '../components/useLaunch';
import { COUNTRY_STATUS, CountryGathering, formatDate, sameCountry } from '@/lib/catalyst-launch';

export default function CountriesPage() {
    const { data, setData, loading, error, load } = useLaunch();
    const [editing, setEditing] = useState<Partial<CountryGathering> | null>(null);

    if (!data) return <LaunchShell title="Country gatherings" subtitle="Hosts, local coordinators and first activities" onRefresh={load} loading={loading} error={error}>{null}</LaunchShell>;

    const offerBySubmission = new Map(data.offers.map(o => [o.submission_id, o]));
    const founderCounts = (country: string) => {
        const inCountry = data.founders.filter(f => sameCountry(f.country, country));
        return {
            confirmed: inCountry.filter(f => offerBySubmission.get(f.id)?.status === 'confirmed').length,
            offered: inCountry.filter(f => ['sent', 'accepted'].includes(offerBySubmission.get(f.id)?.status || '')).length,
            inSelection: inCountry.filter(f => ['shortlisted', 'interviewed', 'accepted'].includes(f.status)).length,
        };
    };
    const covered = new Set(data.countries.map(c => c.country.toLowerCase()));
    const elsewhere = new Map<string, number>();
    data.founders.filter(f => f.country && offerBySubmission.get(f.id)?.status === 'confirmed' && !covered.has(f.country.trim().toLowerCase()))
        .forEach(f => elsewhere.set(f.country!.trim(), (elsewhere.get(f.country!.trim()) || 0) + 1));
    const active = data.countries.filter(c => c.active);

    const save = async () => {
        if (!editing) return;
        const res = await launchAction<{ country: CountryGathering }>('save_country', { country: editing }, 'Country saved');
        if (res) { setData({ ...data, countries: upsertById(data.countries, res.country) }); setEditing(null); }
    };

    const field = (key: keyof CountryGathering, text: string, type = 'text', span = '') => (
        <label className={`${label} ${span}`}>{text}
            <input type={type} className={`${input} mt-1`} value={(editing?.[key] as string | number | null) ?? ''} onChange={e => setEditing({ ...editing, [key]: e.target.value })} />
        </label>
    );

    return (
        <LaunchShell
            title="Country gatherings"
            subtitle="Ghana, Nigeria, Zimbabwe and Kenya first; South Africa when numbers and host capacity support it"
            onRefresh={load}
            loading={loading}
            error={error}
            tiles={[
                { label: 'Active countries', value: active.length },
                { label: 'Hosts confirmed', value: active.filter(c => c.status !== 'planning').length },
                { label: 'Ready', value: active.filter(c => c.status === 'ready').length },
                { label: 'First activity set', value: active.filter(c => c.first_activity && c.first_activity_date).length },
                { label: 'Confirmed founders elsewhere', value: [...elsewhere.values()].reduce((a, b) => a + b, 0), hint: 'Confirmed founders in countries without a gathering' },
            ]}
        >
            <div className="space-y-6">
                {editing && (
                    <section className={`${card} ring-2 ring-green-100`}>
                        <h2 className="mb-3 font-bold text-gray-900">{editing.id ? editing.country : 'Add a country'}</h2>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {!editing.id && field('country', 'Country')}
                            <label className={label}>Status
                                <select className={`${input} mt-1`} value={editing.status || 'planning'} onChange={e => setEditing({ ...editing, status: e.target.value as CountryGathering['status'] })}>
                                    {Object.entries(COUNTRY_STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                                </select>
                            </label>
                            {field('host_org', 'Host organisation')}
                            {field('host_name', 'Host contact name')}
                            {field('host_contact', 'Host phone / email')}
                            {field('host_capacity', 'Host capacity (founders)', 'number')}
                            {field('coordinator_name', 'Local coordinator')}
                            {field('coordinator_contact', 'Coordinator phone / email')}
                            {field('venue', 'Venue')}
                            {field('first_activity', 'First useful gathering activity', 'text', 'sm:col-span-2')}
                            {field('first_activity_date', 'Date', 'date')}
                            {field('notes', 'Notes', 'text', 'sm:col-span-2 lg:col-span-3')}
                            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={editing.active !== false} onChange={e => setEditing({ ...editing, active: e.target.checked })} /> Active this cohort</label>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Confirmed founders see the host organisation, coordinator, venue and first activity once the status is Host confirmed or Ready.</p>
                        <div className="mt-3 flex gap-2"><button onClick={save} className={btnPrimary}>Save</button><button onClick={() => setEditing(null)} className="px-3 py-2 text-sm text-gray-500">Cancel</button></div>
                    </section>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {data.countries.map(c => {
                        const n = founderCounts(c.country);
                        const over = c.host_capacity != null && n.confirmed + n.offered > c.host_capacity;
                        const missing = [!c.host_org && !c.host_name && 'host', !c.coordinator_name && 'coordinator', !c.first_activity && 'first activity', !c.first_activity_date && 'activity date'].filter(Boolean);
                        return (
                            <section key={c.id} className={`${card} ${c.active ? '' : 'opacity-70'}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><MapPin className="h-4 w-4 text-green-700" /> {c.country}</h2>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.active ? COUNTRY_STATUS[c.status].color : 'bg-gray-100 text-gray-500'}`}>{c.active ? COUNTRY_STATUS[c.status].label : 'Not active yet'}</span>
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                    <div className="rounded-lg bg-green-50 p-2"><p className="text-lg font-black text-green-800">{n.confirmed}</p><p className="text-[11px] text-green-800">Confirmed</p></div>
                                    <div className="rounded-lg bg-blue-50 p-2"><p className="text-lg font-black text-blue-800">{n.offered}</p><p className="text-[11px] text-blue-800">Offer out</p></div>
                                    <div className="rounded-lg bg-gray-50 p-2"><p className="text-lg font-black text-gray-700">{c.host_capacity ?? '—'}</p><p className="text-[11px] text-gray-600">Capacity</p></div>
                                </div>
                                {over && <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-700"><AlertTriangle className="h-3.5 w-3.5" /> More founders than the host can take</p>}
                                <dl className="mt-3 space-y-1 text-sm">
                                    <div><dt className="inline text-gray-500">Host: </dt><dd className="inline">{[c.host_org, c.host_name].filter(Boolean).join(' — ') || '—'}</dd></div>
                                    <div><dt className="inline text-gray-500">Coordinator: </dt><dd className="inline">{c.coordinator_name || '—'}</dd></div>
                                    <div><dt className="inline text-gray-500">First activity: </dt><dd className="inline">{c.first_activity ? `${c.first_activity}${c.first_activity_date ? ` · ${formatDate(c.first_activity_date)}` : ''}` : '—'}</dd></div>
                                    {c.notes && <p className="text-xs text-gray-500">{c.notes}</p>}
                                </dl>
                                {c.active && missing.length > 0 && <p className="mt-2 text-xs text-amber-700">Still needed: {missing.join(', ')}</p>}
                                <button onClick={() => setEditing(c)} className={`${btnSecondary} mt-3 px-2.5 py-1.5 text-xs`}>Edit</button>
                            </section>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-start justify-between gap-3">
                    {elsewhere.size > 0 ? (
                        <p className="text-sm text-gray-600">Confirmed founders in other countries: {[...elsewhere.entries()].map(([c, n]) => `${c} (${n})`).join(', ')}. Plan online participation or add a country.</p>
                    ) : <span />}
                    <button onClick={() => setEditing({ status: 'planning', active: true, priority: 2 })} className={btnSecondary}><Plus className="h-4 w-4" /> Add country</button>
                </div>
            </div>
        </LaunchShell>
    );
}
