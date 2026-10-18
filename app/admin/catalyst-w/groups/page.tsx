'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Mail, Plus, Trash2, Users } from 'lucide-react';
import LaunchShell, { btnPrimary, btnSecondary, card, input, label } from '../components/LaunchShell';
import { LaunchFounder, launchAction, upsertById, useLaunch } from '../components/useLaunch';
import { FounderGroup, formatDate, welcomeGaps } from '@/lib/catalyst-launch';

export default function GroupsPage() {
    const { data, setData, loading, error, load } = useLaunch();
    const [editing, setEditing] = useState<Partial<FounderGroup> | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [busy, setBusy] = useState<string | null>(null);

    const groupById = useMemo(() => new Map((data?.groups || []).map(g => [g.id, g])), [data]);

    if (!data) return <LaunchShell title="Groups & welcome packs" subtitle="Groups, venture leads, contact people and next actions" onRefresh={load} loading={loading} error={error}>{null}</LaunchShell>;

    const confirmedIds = new Set(data.offers.filter(o => o.status === 'confirmed').map(o => o.submission_id));
    const founders = data.founders.filter(f => confirmedIds.has(f.id))
        .sort((a, b) => (a.country || '').localeCompare(b.country || '') || a.full_name.localeCompare(b.full_name));
    const ready = founders.filter(f => welcomeGaps(f, f.group_id ? groupById.get(f.group_id) : null).length === 0);

    const saveGroup = async () => {
        if (!editing) return;
        const res = await launchAction<{ group: FounderGroup }>('save_group', { group: editing }, 'Group saved');
        if (res) { setData({ ...data, groups: upsertById(data.groups, res.group) }); setEditing(null); }
    };
    const deleteGroup = async (g: FounderGroup) => {
        if (!confirm(`Delete ${g.name}? Its founders will need a new group.`)) return;
        if (await launchAction('delete_group', { id: g.id }, 'Group deleted')) {
            setData({ ...data, groups: data.groups.filter(x => x.id !== g.id), founders: data.founders.map(f => (f.group_id === g.id ? { ...f, group_id: null } : f)) });
        }
    };
    const assign = async (f: LaunchFounder, patch: Partial<Pick<LaunchFounder, 'group_id' | 'next_action' | 'next_action_due'>>) => {
        const res = await launchAction<{ founder: Partial<LaunchFounder> }>('assign_founder', { id: f.id, ...patch });
        if (res) setData({ ...data, founders: data.founders.map(x => (x.id === f.id ? { ...x, ...res.founder } : x)) });
    };
    const sendWelcome = async (ids: string[]) => {
        const incomplete = ids.filter(id => { const f = founders.find(x => x.id === id)!; return welcomeGaps(f, f.group_id ? groupById.get(f.group_id) : null).length > 0; });
        if (!ids.length || !confirm(`Email the welcome pack to ${ids.length} founder${ids.length === 1 ? '' : 's'}?${incomplete.length ? `\n\n${incomplete.length} still have gaps (group, contact or next action); their page will say details are coming.` : ''}`)) return;
        setBusy('welcome');
        const res = await launchAction<{ sent: string[]; failed: { id: string; reason: string }[] }>('send_welcome', { ids });
        setBusy(null);
        if (!res) return;
        (res.failed.length ? toast.error : toast.success)(`${res.sent.length} welcome pack${res.sent.length === 1 ? '' : 's'} sent${res.failed.length ? ` · ${res.failed.length} failed` : ''}`);
        const now = new Date().toISOString();
        setData({ ...data, founders: data.founders.map(f => (res.sent.includes(f.id) ? { ...f, welcome_sent_at: now, participant_status: 'onboarding', has_portal: true } : f)) });
        setSelected(new Set());
    };

    const g = (key: keyof FounderGroup, text: string, type = 'text', span = '') => (
        <label className={`${label} ${span}`}>{text}<input type={type} className={`${input} mt-1`} value={(editing?.[key] as string) ?? ''} onChange={e => setEditing({ ...editing, [key]: e.target.value })} /></label>
    );

    return (
        <LaunchShell
            title="Groups & welcome packs"
            subtitle="Every founder needs a group, contact person, timetable and next action by launch day"
            onRefresh={load}
            loading={loading}
            error={error}
            tiles={[
                { label: 'Confirmed founders', value: founders.length },
                { label: 'Groups', value: data.groups.length },
                { label: 'Assigned to a group', value: founders.filter(f => f.group_id).length },
                { label: 'Launch-ready info', value: `${ready.length}/${founders.length}`, hint: 'Group with venture lead and contact person, plus a next action' },
                { label: 'Welcome packs sent', value: founders.filter(f => f.welcome_sent_at).length },
                { label: 'Timetable sessions (wk 1–3)', value: data.sessions.length },
            ]}
        >
            <div className="space-y-6">
                {data.sessions.length === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        No sessions for weeks 1–3 yet{data.cohort ? ` in ${data.cohort.name}` : ' (no active cohort)'}. Add them under Cohort Management → Programme so they appear in founders&apos; welcome packs.
                    </div>
                )}

                <section className={card}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-gray-900">Groups</h2>
                            <p className="text-sm text-gray-500">Each group needs a venture lead and a contact person founders can reach.</p>
                        </div>
                        <button onClick={() => setEditing({})} className={btnSecondary}><Plus className="h-4 w-4" /> Add group</button>
                    </div>
                    {editing && (
                        <div className="mb-4 grid gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
                            {g('name', 'Group name')}
                            <label className={label}>Country
                                <select className={`${input} mt-1`} value={editing.country || ''} onChange={e => setEditing({ ...editing, country: e.target.value || null })}>
                                    <option value="">Mixed / online</option>
                                    {data.countries.filter(c => c.active).map(c => <option key={c.id}>{c.country}</option>)}
                                </select>
                            </label>
                            {g('venture_lead_name', 'Venture lead')}
                            {g('venture_lead_email', 'Venture lead email', 'email')}
                            {g('contact_name', 'Contact person')}
                            {g('contact_email', 'Contact email', 'email')}
                            {g('contact_phone', 'Contact phone / WhatsApp', 'tel')}
                            {g('meeting_rhythm', 'When the group meets', 'text')}
                            <div className="flex items-end gap-2"><button onClick={saveGroup} className={btnPrimary}>Save</button><button onClick={() => setEditing(null)} className="px-2 py-2 text-sm text-gray-500">Cancel</button></div>
                        </div>
                    )}
                    {data.groups.length === 0 ? <p className="text-sm text-gray-500">No groups yet.</p> : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {data.groups.map(gr => {
                                const members = founders.filter(f => f.group_id === gr.id).length;
                                return (
                                    <div key={gr.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="flex items-center gap-1.5 font-semibold text-gray-900"><Users className="h-4 w-4 text-green-700" /> {gr.name}</p>
                                            <span className="text-xs text-gray-500">{members} founder{members === 1 ? '' : 's'}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{gr.country || 'Mixed / online'}{gr.meeting_rhythm ? ` · ${gr.meeting_rhythm}` : ''}</p>
                                        <p className={`mt-1.5 text-xs ${gr.venture_lead_name ? 'text-gray-700' : 'font-semibold text-amber-700'}`}>Venture lead: {gr.venture_lead_name || 'not assigned'}</p>
                                        <p className={`text-xs ${gr.contact_name ? 'text-gray-700' : 'font-semibold text-amber-700'}`}>Contact: {gr.contact_name ? [gr.contact_name, gr.contact_phone].filter(Boolean).join(' · ') : 'not assigned'}</p>
                                        <div className="mt-2 flex gap-3">
                                            <button onClick={() => setEditing(gr)} className="text-xs font-medium text-green-700">Edit</button>
                                            <button onClick={() => deleteGroup(gr)} aria-label={`Delete ${gr.name}`} className="text-gray-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className={card}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-gray-900">Confirmed founders</h2>
                            <p className="text-sm text-gray-500">Assign groups and next actions; changes save as you go and show on each founder&apos;s page straight away.</p>
                        </div>
                        <button onClick={() => sendWelcome([...selected])} disabled={!selected.size || busy === 'welcome'} className={btnPrimary}>
                            {busy === 'welcome' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Send welcome pack {selected.size || ''}
                        </button>
                    </div>
                    {founders.length === 0 ? <p className="text-sm text-gray-500">No confirmed places yet. Founders appear here once they accept and pay (or accept a fully funded place).</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="py-2 pr-3"><input type="checkbox" aria-label="Select all" checked={founders.every(f => selected.has(f.id))} onChange={e => setSelected(e.target.checked ? new Set(founders.map(f => f.id)) : new Set())} /></th>
                                        <th className="py-2 pr-3">Founder</th><th className="py-2 pr-3">Group</th><th className="py-2 pr-3">Next action</th><th className="py-2">Welcome</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {founders.map(f => {
                                        const gaps = welcomeGaps(f, f.group_id ? groupById.get(f.group_id) : null);
                                        return (
                                            <tr key={f.id}>
                                                <td className="py-2.5 pr-3 align-top"><input type="checkbox" aria-label={`Select ${f.full_name}`} checked={selected.has(f.id)} onChange={() => setSelected(prev => { const n = new Set(prev); n.has(f.id) ? n.delete(f.id) : n.add(f.id); return n; })} /></td>
                                                <td className="py-2.5 pr-3 align-top"><p className="font-medium">{f.full_name}</p><p className="text-xs text-gray-500">{[f.business_name, f.country].filter(Boolean).join(' · ')}</p></td>
                                                <td className="py-2.5 pr-3 align-top">
                                                    <select aria-label={`Group for ${f.full_name}`} value={f.group_id || ''} onChange={e => assign(f, { group_id: e.target.value || null })} className={`${input} w-44 py-1.5`}>
                                                        <option value="">No group</option>
                                                        {data.groups.map(gr => <option key={gr.id} value={gr.id}>{gr.name}{gr.country && f.country && gr.country.toLowerCase() !== f.country.trim().toLowerCase() ? ` (${gr.country})` : ''}</option>)}
                                                    </select>
                                                </td>
                                                <td className="py-2.5 pr-3 align-top">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        <input aria-label={`Next action for ${f.full_name}`} defaultValue={f.next_action || ''} maxLength={500} placeholder="e.g. Join the WhatsApp group and book your diagnostic call"
                                                            onBlur={e => e.target.value.trim() !== (f.next_action || '') && assign(f, { next_action: e.target.value })} className={`${input} w-72 py-1.5 text-xs`} />
                                                        <input type="date" aria-label={`Next action due for ${f.full_name}`} defaultValue={f.next_action_due || ''} onBlur={e => e.target.value !== (f.next_action_due || '') && assign(f, { next_action_due: e.target.value || null })} className={`${input} w-36 py-1.5 text-xs`} />
                                                    </div>
                                                </td>
                                                <td className="py-2.5 align-top text-xs">
                                                    {gaps.length ? <p className="text-amber-700">{gaps.join(' · ')}</p> : <p className="text-green-700">All set</p>}
                                                    <p className="text-gray-500">{f.welcome_sent_at ? `Sent ${formatDate(f.welcome_sent_at)}` : 'Not sent'}</p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </LaunchShell>
    );
}
