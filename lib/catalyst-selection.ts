// Shared rules for Catalyst W applicant clean-up and selection (admin pages + APIs).

export const COHORT_YEAR = 2026;
/** Working closing date from the launch roadmap — subject to approval before publication. */
export const WORKING_CLOSE_DATE = '2026-11-06';
export const CHASE_COOLDOWN_HOURS = 48;

export type ApplicationStatus = 'new' | 'reviewed' | 'shortlisted' | 'interviewed' | 'accepted' | 'paid' | 'waitlisted' | 'rejected';
export type ExcludedReason = 'duplicate' | 'test' | 'ineligible' | 'withdrawn' | 'other';

export const EXCLUDED_REASONS: { value: ExcludedReason; label: string }[] = [
    { value: 'duplicate', label: 'Duplicate' },
    { value: 'test', label: 'Test / spam entry' },
    { value: 'ineligible', label: 'Not eligible' },
    { value: 'withdrawn', label: 'Withdrawn' },
    { value: 'other', label: 'Other' },
];

export type Application = {
    id: string;
    type: 'apply' | 'prospectus' | 'plan';
    status: ApplicationStatus;
    full_name: string;
    email: string;
    country?: string | null;
    phone?: string | null;
    business_name?: string | null;
    business_stage?: string | null;
    sector?: string | null;
    plan_tier?: string | null;
    why_apply?: string | null;
    revenue?: string | null;
    team_size?: string | null;
    website?: string | null;
    primary_constraint?: string | null;
    support_needed?: string | null;
    referral_source?: string | null;
    admin_notes?: string | null;
    created_at: string;
    duplicate_of?: string | null;
    excluded_reason?: ExcludedReason | null;
    last_chased_at?: string | null;
    chase_count?: number | null;
    business_verified?: boolean | null;
    business_verification_notes?: string | null;
    business_verified_by?: string | null;
    business_verified_at?: string | null;
};

/** Fields the application form marks as required. Older submissions may be missing the later ones. */
export const REQUIRED_FIELDS: { key: keyof Application; label: string }[] = [
    { key: 'full_name', label: 'Full name' },
    { key: 'email', label: 'Email' },
    { key: 'country', label: 'Country' },
    { key: 'business_name', label: 'Business name' },
    { key: 'business_stage', label: 'Business stage' },
    { key: 'sector', label: 'Sector' },
    { key: 'why_apply', label: 'Why join Catalyst W' },
    { key: 'primary_constraint', label: 'Main business problem' },
    { key: 'support_needed', label: 'Support needed' },
    { key: 'referral_source', label: 'How they heard about us' },
];

/** Not required on the form, but needed to interview and verify the business. */
export const HELPFUL_FIELDS: { key: keyof Application; label: string }[] = [
    { key: 'phone', label: 'Phone / WhatsApp' },
    { key: 'website', label: 'Website or social link' },
    { key: 'revenue', label: 'Revenue' },
];

const filled = (v: unknown) => typeof v === 'string' ? v.trim().length > 0 : v != null;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEST_RE = /\b(test|testing|asdf|qwerty|dummy|sample|lorem)\b/i;

export type Completeness = {
    percent: number;
    missing: string[];
    helpfulMissing: string[];
    warnings: string[];
    complete: boolean;
};

export function completeness(app: Application): Completeness {
    const missing = REQUIRED_FIELDS.filter(f => !filled(app[f.key])).map(f => f.label);
    const helpfulMissing = HELPFUL_FIELDS.filter(f => !filled(app[f.key])).map(f => f.label);
    const warnings: string[] = [];
    if (app.email && !EMAIL_RE.test(app.email.trim())) warnings.push('Email looks invalid');
    if (filled(app.why_apply) && (app.why_apply as string).trim().length < 80) warnings.push('Very short “why join” answer');
    if (filled(app.primary_constraint) && (app.primary_constraint as string).trim().length < 40) warnings.push('Very short problem answer');
    return {
        percent: Math.round(((REQUIRED_FIELDS.length - missing.length) / REQUIRED_FIELDS.length) * 100),
        missing,
        helpfulMissing,
        warnings,
        complete: missing.length === 0 && !warnings.includes('Email looks invalid'),
    };
}

export function looksLikeTest(app: Application): boolean {
    return TEST_RE.test(`${app.full_name} ${app.business_name || ''}`) || /@(example|test|mailinator)\./i.test(app.email);
}

const normPhone = (p?: string | null) => (p || '').replace(/\D/g, '').slice(-9);
const normText = (t?: string | null) => (t || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Groups applications that look like the same founder: same email, same phone
 * (last 9 digits) or same name + business. Returns groupKey → ids (oldest first).
 */
export function duplicateGroups(apps: Application[]): Map<string, string[]> {
    const parent = new Map<string, string>();
    const find = (id: string): string => (parent.get(id) === id ? id : find(parent.get(id)!));
    apps.forEach(a => parent.set(a.id, a.id));
    const byKey = new Map<string, string>();
    const link = (key: string, id: string) => {
        if (!key) return;
        const other = byKey.get(key);
        if (other) parent.set(find(id), find(other));
        else byKey.set(key, id);
    };
    for (const a of apps) {
        link(`e:${a.email.trim().toLowerCase()}`, a.id);
        const phone = normPhone(a.phone);
        if (phone.length >= 7) link(`p:${phone}`, a.id);
        const nameBiz = normText(a.full_name) + '|' + normText(a.business_name);
        if (normText(a.business_name)) link(`n:${nameBiz}`, a.id);
    }
    const groups = new Map<string, string[]>();
    const byId = new Map(apps.map(a => [a.id, a]));
    for (const a of apps) {
        const root = find(a.id);
        groups.set(root, [...(groups.get(root) || []), a.id]);
    }
    for (const [k, ids] of groups) {
        if (ids.length < 2) groups.delete(k);
        else ids.sort((x, y) => byId.get(x)!.created_at.localeCompare(byId.get(y)!.created_at));
    }
    return groups;
}

/** Applications still in play: real applications, not excluded or marked as a duplicate. */
export function isActiveApplication(app: Application) {
    return app.type === 'apply' && !app.excluded_reason && !app.duplicate_of;
}

// ── Selection scoring ───────────────────────────────────────────────

export type SelectionQuestion = {
    id: string;
    position: number;
    prompt: string;
    guidance: string | null;
    weight: number;
    max_score: number;
    active: boolean;
};

export type Recommendation = 'strong_yes' | 'yes' | 'maybe' | 'no';
export const RECOMMENDATIONS: { value: Recommendation; label: string; color: string }[] = [
    { value: 'strong_yes', label: 'Strong yes', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'yes', label: 'Yes', color: 'bg-green-100 text-green-700' },
    { value: 'maybe', label: 'Maybe', color: 'bg-amber-100 text-amber-800' },
    { value: 'no', label: 'No', color: 'bg-red-100 text-red-700' },
];

export type Scorecard = {
    id: string;
    submission_id: string;
    interviewer_email: string;
    scores: Record<string, number>;
    weighted_score: number | null;
    recommendation: Recommendation | null;
    comments: string | null;
    updated_at: string;
};

export type Interview = {
    id: string;
    submission_id: string;
    scheduled_at: string;
    duration_minutes: number;
    interviewer_email: string;
    meeting_link: string | null;
    status: 'scheduled' | 'completed' | 'no_show' | 'cancelled';
    notes: string | null;
    invite_sent_at: string | null;
};

/** Weighted score out of 100 over the questions that were answered; null if none were. */
export function weightedScore(scores: Record<string, number>, questions: SelectionQuestion[]): number | null {
    let got = 0;
    let possible = 0;
    for (const q of questions) {
        const s = scores[q.id];
        if (typeof s !== 'number' || Number.isNaN(s)) continue;
        got += Math.min(Math.max(s, 0), q.max_score) * q.weight;
        possible += q.max_score * q.weight;
    }
    return possible > 0 ? Math.round((got / possible) * 1000) / 10 : null;
}

/** Interview times shown in the four priority-country time zones. */
export function formatInterviewTime(iso: string) {
    const d = new Date(iso);
    const day = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Accra' });
    const t = (tz: string) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz });
    return `${day}, ${t('Africa/Accra')} GMT (Ghana) · ${t('Africa/Lagos')} WAT (Nigeria) · ${t('Africa/Harare')} CAT (Zimbabwe) · ${t('Africa/Nairobi')} EAT (Kenya)`;
}
