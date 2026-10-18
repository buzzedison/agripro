'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CheckCircle2, Circle, AlertTriangle, ClipboardCopy } from 'lucide-react';
import LaunchShell, { btnSecondary, card } from '../components/LaunchShell';
import { useLaunch } from '../components/useLaunch';
import { formatDate, isOverdue, sameCountry, welcomeGaps } from '@/lib/catalyst-launch';
import type { Interview, Scorecard } from '@/lib/catalyst-selection';

type Check = { label: string; detail: string; state: 'done' | 'warn' | 'todo'; href: string };
type Phase = { start: string; end: string; title: string; checks: Check[] };

const ICON = {
    done: <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-label="Done" />,
    warn: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" aria-label="Needs attention" />,
    todo: <Circle className="h-4 w-4 shrink-0 text-gray-300" aria-label="Not started" />,
};

export default function ReadinessPage() {
    const { data, loading, error, load } = useLaunch();
    const [selection, setSelection] = useState<{ interviews: Interview[]; scorecards: Scorecard[]; questions: { active: boolean }[] } | null>(null);
    useEffect(() => {
        fetch('/api/admin/catalyst-w/selection', { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).then(d => d && setSelection(d)).catch(() => {});
    }, []);

    const phases = useMemo<Phase[]>(() => {
        if (!data) return [];
        const f = data.founders;
        const offers = data.offers;
        const confirmed = offers.filter(o => o.status === 'confirmed');
        const openOffers = offers.filter(o => o.status === 'sent' || o.status === 'accepted');
        const target = data.settings.target_cohort_size;
        const groupById = new Map(data.groups.map(g => [g.id, g]));
        const confirmedFounders = f.filter(x => confirmed.some(o => o.submission_id === x.id));
        const activeCountries = data.countries.filter(c => c.active);
        const essential = data.budget.filter(b => b.essential);
        const essentialGap = essential.reduce((s, b) => s + Math.max(0, b.budget_usd - b.funded_usd), 0);
        const interviews = selection?.interviews || [];
        const scored = new Set((selection?.scorecards || []).map(s => s.submission_id));
        const shortlisted = f.filter(x => ['shortlisted', 'interviewed', 'accepted', 'paid'].includes(x.status));
        const pendingScholarships = data.scholarships.filter(s => s.decision === 'pending').length;
        const st = (ok: boolean, started: boolean): Check['state'] => (ok ? 'done' : started ? 'warn' : 'todo');
        const ready = confirmedFounders.filter(x => welcomeGaps(x, x.group_id ? groupById.get(x.group_id) : null).length === 0);

        return [
            { start: '2026-10-17', end: '2026-10-21', title: 'Get the team in place', checks: [
                { label: 'Applicant list cleaned', detail: `${f.length} live applications after removing duplicates and exclusions`, state: st(f.length > 0, f.length > 0), href: '/admin/catalyst-w/clean-up' },
                { label: 'Selection questions ready', detail: `${(selection?.questions || []).filter(q => q.active).length} active scoring questions`, state: st((selection?.questions || []).some(q => q.active), !!selection), href: '/admin/catalyst-w/selection' },
            ] },
            { start: '2026-10-22', end: '2026-10-30', title: 'Grow applications and secure support', checks: [
                { label: 'Founder interviews started', detail: `${interviews.length} booked · ${interviews.filter(i => i.status === 'completed').length} held`, state: st(interviews.some(i => i.status === 'completed'), interviews.length > 0), href: '/admin/catalyst-w/selection' },
                { label: 'Funding requests sent', detail: `${data.partners.filter(p => p.kind === 'funder' && p.status !== 'to_contact').length} funders asked`, state: st(data.partners.some(p => p.kind === 'funder' && ['asked', 'in_discussion', 'confirmed'].includes(p.status)), data.partners.length > 0), href: '/admin/catalyst-w/funding' },
                { label: 'Delivery partners followed up', detail: `${data.partners.filter(p => p.kind === 'delivery' && ['in_discussion', 'confirmed'].includes(p.status)).length} in discussion or confirmed`, state: st(data.partners.some(p => p.kind === 'delivery' && p.status === 'confirmed'), data.partners.some(p => p.kind === 'delivery')), href: '/admin/catalyst-w/funding' },
            ] },
            { start: '2026-11-02', end: '2026-11-06', title: 'Close recruitment and narrow the shortlist', checks: [
                { label: 'Shortlist narrowed', detail: `${shortlisted.length} founders shortlisted or further · ${scored.size} scored`, state: st(shortlisted.length >= target && target > 0, shortlisted.length > 0), href: '/admin/catalyst-w/selection' },
                { label: 'Country hosts contacted', detail: `${activeCountries.filter(c => c.host_name || c.host_org).length}/${activeCountries.length} countries have a host contact`, state: st(activeCountries.every(c => c.host_name || c.host_org), activeCountries.some(c => c.host_name || c.host_org)), href: '/admin/catalyst-w/countries' },
            ] },
            { start: '2026-11-09', end: '2026-11-13', title: 'Select founders and issue offers', checks: [
                { label: 'Businesses verified', detail: `${f.filter(x => x.business_verified && ['accepted', 'paid'].includes(x.status)).length} of ${f.filter(x => ['accepted', 'paid'].includes(x.status)).length} selected founders verified`, state: st(f.filter(x => ['accepted', 'paid'].includes(x.status)).every(x => x.business_verified) && f.some(x => ['accepted', 'paid'].includes(x.status)), f.some(x => x.business_verified)), href: '/admin/catalyst-w/selection' },
                { label: 'Scholarship awards decided', detail: `${data.scholarships.length - pendingScholarships} decided · ${pendingScholarships} waiting`, state: st(data.scholarships.length > 0 && pendingScholarships === 0, data.scholarships.length > 0), href: '/admin/catalyst-w/scholarships' },
                { label: 'Offers sent', detail: `${offers.filter(o => o.status !== 'draft').length} sent${target ? ` for a target of ${target}` : ''}`, state: st(target > 0 && offers.filter(o => o.status !== 'draft').length >= target, offers.some(o => o.status !== 'draft')), href: '/admin/catalyst-w/offers' },
                { label: 'Partner contributions confirmed', detail: `${data.partners.filter(p => p.status === 'confirmed').length} confirmed`, state: st(data.partners.some(p => p.status === 'confirmed'), data.partners.some(p => p.status === 'in_discussion')), href: '/admin/catalyst-w/funding' },
            ] },
            { start: '2026-11-16', end: '2026-11-20', title: 'Turn offers into confirmed places', checks: [
                { label: 'Places confirmed', detail: `${confirmed.length}${target ? `/${target}` : ''} confirmed · ${openOffers.length} awaiting reply or payment · ${offers.filter(o => isOverdue(o)).length} past deadline`, state: st(target > 0 && confirmed.length >= target, confirmed.length > 0), href: '/admin/catalyst-w/offers' },
                { label: 'Essential launch costs funded', detail: essential.length ? (essentialGap > 0 ? `$${essentialGap.toLocaleString()} still to find` : 'All essential lines funded') : 'No essential budget lines entered', state: st(essential.length > 0 && essentialGap === 0, essential.length > 0), href: '/admin/catalyst-w/funding' },
                { label: 'Country hosts and coordinators confirmed', detail: `${activeCountries.filter(c => c.status !== 'planning' && c.coordinator_name).length}/${activeCountries.length} countries`, state: st(activeCountries.every(c => c.status !== 'planning' && c.coordinator_name), activeCountries.some(c => c.status !== 'planning')), href: '/admin/catalyst-w/countries' },
                { label: 'First gathering activity set', detail: `${activeCountries.filter(c => c.first_activity && c.first_activity_date).length}/${activeCountries.length} countries`, state: st(activeCountries.every(c => c.first_activity && c.first_activity_date), activeCountries.some(c => c.first_activity)), href: '/admin/catalyst-w/countries' },
            ] },
            { start: '2026-11-23', end: '2026-11-27', title: 'Get everyone ready', checks: [
                { label: 'Vacant places filled from reserve', detail: target ? `${Math.max(0, target - confirmed.length - openOffers.length)} places still open · ${f.filter(x => x.status === 'waitlisted').length} on reserve` : 'Set a target cohort size on the Offers page', state: st(target > 0 && confirmed.length + openOffers.length >= target, target > 0), href: '/admin/catalyst-w/offers' },
                { label: 'Venture leads assigned', detail: `${data.groups.filter(g => g.venture_lead_name).length}/${data.groups.length} groups have a venture lead`, state: st(data.groups.length > 0 && data.groups.every(g => g.venture_lead_name && g.contact_name), data.groups.length > 0), href: '/admin/catalyst-w/groups' },
                { label: 'First three weeks timetabled', detail: `${data.sessions.length} sessions in weeks 1–3${data.cohort ? ` (${data.cohort.name})` : ''}`, state: st(new Set(data.sessions.map(s => s.week_number)).size >= 3, data.sessions.length > 0), href: '/admin/fellowship/catalyst-w/cohort/programme' },
                { label: 'Welcome packs sent', detail: `${confirmedFounders.filter(x => x.welcome_sent_at).length}/${confirmedFounders.length} confirmed founders`, state: st(confirmedFounders.length > 0 && confirmedFounders.every(x => x.welcome_sent_at), confirmedFounders.some(x => x.welcome_sent_at)), href: '/admin/catalyst-w/groups' },
            ] },
            { start: data.settings.launch_date, end: data.settings.launch_date, title: 'Launch the programme', checks: [
                { label: 'Every founder knows their group, contact, timetable and next action', detail: `${ready.length}/${confirmedFounders.length} founders have complete launch information`, state: st(confirmedFounders.length > 0 && ready.length === confirmedFounders.length && data.sessions.length > 0, ready.length > 0), href: '/admin/catalyst-w/groups' },
                { label: 'Confirmed founders outside gathering countries', detail: `${confirmedFounders.filter(x => !activeCountries.some(c => sameCountry(c.country, x.country))).length} need an online plan`, state: confirmedFounders.every(x => activeCountries.some(c => sameCountry(c.country, x.country))) ? 'done' : 'warn', href: '/admin/catalyst-w/countries' },
            ] },
        ];
    }, [data, selection]);

    const today = new Date().toISOString().slice(0, 10);
    const all = phases.flatMap(p => p.checks);
    const done = all.filter(c => c.state === 'done').length;
    const current = phases.find(p => today <= p.end) || phases[phases.length - 1];

    const copySummary = async () => {
        if (!data) return;
        const lines = [`Catalyst W launch review — ${formatDate(today)}`, `${done}/${all.length} readiness checks done. Launch ${formatDate(data.settings.launch_date)}.`, ''];
        for (const p of phases) {
            lines.push(`${formatDate(p.start)}${p.start !== p.end ? `–${formatDate(p.end)}` : ''}: ${p.title}`);
            p.checks.forEach(c => lines.push(`  [${c.state === 'done' ? 'x' : c.state === 'warn' ? '~' : ' '}] ${c.label} — ${c.detail}`));
        }
        try { await navigator.clipboard.writeText(lines.join('\n')); toast.success('Review summary copied — paste it into Stride'); } catch { toast.error('Could not copy'); }
    };

    const days = data ? Math.ceil((new Date(`${data.settings.launch_date}T00:00:00Z`).getTime() - Date.now()) / 86400000) : 0;

    return (
        <LaunchShell
            title="Launch readiness"
            subtitle="Roadmap checks for the 30 November launch, for the Monday and Thursday reviews"
            onRefresh={load}
            loading={loading}
            error={error}
            tiles={data ? [
                { label: 'Days to launch', value: days > 0 ? days : 'Launched' },
                { label: 'Checks done', value: `${done}/${all.length}` },
                { label: 'Confirmed places', value: `${data.offers.filter(o => o.status === 'confirmed').length}${data.settings.target_cohort_size ? `/${data.settings.target_cohort_size}` : ''}` },
                { label: 'Offers past deadline', value: data.offers.filter(o => isOverdue(o)).length },
                { label: 'Scholarships waiting', value: data.scholarships.filter(s => s.decision === 'pending').length },
                { label: 'Current phase', value: <span className="text-base">{current?.title}</span> },
            ] : undefined}
        >
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">Checks update from the other Catalyst W pages. Owners, deadlines and updates stay in Stride.</p>
                    <button onClick={copySummary} className={btnSecondary}><ClipboardCopy className="h-4 w-4" /> Copy review summary</button>
                </div>
                {phases.map(p => {
                    const isCurrent = p === current;
                    const past = today > p.end;
                    const open = p.checks.filter(c => c.state !== 'done').length;
                    return (
                        <section key={p.title} className={`${card} ${isCurrent ? 'ring-2 ring-green-200' : ''}`}>
                            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                                <h2 className="font-bold text-gray-900">{p.title} {isCurrent && <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Now</span>}</h2>
                                <p className={`text-xs ${past && open ? 'font-semibold text-amber-700' : 'text-gray-500'}`}>
                                    {formatDate(p.start)}{p.start !== p.end ? ` – ${formatDate(p.end)}` : ''}{past && open ? ` · ${open} still open` : ''}
                                </p>
                            </div>
                            <ul className="divide-y divide-gray-100">
                                {p.checks.map(c => (
                                    <li key={c.label}>
                                        <Link href={c.href} className="flex items-start gap-3 py-2.5 hover:bg-gray-50">
                                            {ICON[c.state]}
                                            <span className="min-w-0">
                                                <span className="block text-sm font-medium text-gray-900">{c.label}</span>
                                                <span className="block text-xs text-gray-500">{c.detail}</span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </div>
        </LaunchShell>
    );
}
