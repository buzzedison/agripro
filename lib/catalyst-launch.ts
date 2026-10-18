// Shared types and rules for the Catalyst W launch workstreams (admin pages, founder portal, APIs).

export type LaunchSettings = {
    cohort_year: number;
    target_cohort_size: number;
    scholarship_199_places: number;
    fully_funded_places: number;
    standard_fee_usd: number;
    offer_response_days: number;
    launch_date: string;
};

export type ScholarshipLevel = 'fully_funded' | 'scholarship_199';
export type ScholarshipDecision = 'pending' | ScholarshipLevel | 'declined';
export type ScholarshipRequest = {
    id: string;
    submission_id: string;
    requested: ScholarshipLevel;
    can_contribute_usd: number;
    monthly_revenue_band: string | null;
    dependants: number | null;
    circumstances: string;
    submitted_at: string;
    decision: ScholarshipDecision;
    decision_notes: string | null;
    decided_by: string | null;
    decided_at: string | null;
};

export const SCHOLARSHIP_LABELS: Record<ScholarshipDecision, string> = {
    pending: 'Awaiting decision',
    fully_funded: 'Fully funded place',
    scholarship_199: '$199 scholarship place',
    declined: 'No scholarship',
};

export const REVENUE_BANDS = ['No revenue yet', 'Under $100', '$100–$500', '$500–$2,000', '$2,000–$10,000', 'Over $10,000'];

export type OfferFunding = 'standard' | 'scholarship_199' | 'fully_funded' | 'custom_subsidy';
export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'confirmed' | 'declined' | 'expired' | 'withdrawn';
export type Offer = {
    id: string;
    submission_id: string;
    plan_label: string;
    fee_usd: number;
    funding: OfferFunding;
    subsidy_note: string | null;
    payment_deadline: string;
    status: OfferStatus;
    sent_at: string | null;
    responded_at: string | null;
    decline_reason: string | null;
    confirmed_at: string | null;
    amount_paid_usd: number | null;
    payment_method: string | null;
    payment_reference: string | null;
    reminder_sent_at: string | null;
};

export const OFFER_STATUS: Record<OfferStatus, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    sent: { label: 'Sent — awaiting reply', color: 'bg-blue-100 text-blue-700' },
    accepted: { label: 'Accepted — awaiting payment', color: 'bg-amber-100 text-amber-800' },
    confirmed: { label: 'Place confirmed', color: 'bg-green-100 text-green-700' },
    declined: { label: 'Declined', color: 'bg-red-100 text-red-700' },
    expired: { label: 'Expired', color: 'bg-gray-200 text-gray-600' },
    withdrawn: { label: 'Withdrawn', color: 'bg-gray-200 text-gray-600' },
};

export const FUNDING_LABELS: Record<OfferFunding, string> = {
    standard: 'Standard fee',
    scholarship_199: '$199 scholarship',
    fully_funded: 'Fully funded',
    custom_subsidy: 'Custom subsidy',
};

/** Offers that still hold a place (or will once paid). */
export const OPEN_OFFER_STATUSES: OfferStatus[] = ['sent', 'accepted', 'confirmed'];

/** End of the deadline day in UTC. */
export function deadlinePassed(deadline: string, now = new Date()) {
    return new Date(`${deadline}T23:59:59Z`).getTime() < now.getTime();
}

/** Sent/accepted offers past their deadline that still need a decision (expire, extend or chase). */
export function isOverdue(offer: Pick<Offer, 'status' | 'payment_deadline'>, now = new Date()) {
    return (offer.status === 'sent' || offer.status === 'accepted') && deadlinePassed(offer.payment_deadline, now);
}

export function defaultFee(funding: OfferFunding, settings: Pick<LaunchSettings, 'standard_fee_usd'>) {
    if (funding === 'fully_funded') return 0;
    if (funding === 'scholarship_199') return 199;
    return Number(settings.standard_fee_usd);
}

export function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}

export const formatUsd = (n: number | null | undefined) =>
    n == null ? '—' : `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export const formatDate = (d: string | null | undefined) =>
    d ? new Date(d.length === 10 ? `${d}T12:00:00Z` : d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Partners, budget, countries, groups ────────────────────────────

export type PartnerStatus = 'to_contact' | 'asked' | 'in_discussion' | 'confirmed' | 'declined';
export type Partner = {
    id: string;
    name: string;
    kind: 'funder' | 'delivery' | 'country_host' | 'recruitment' | 'media' | 'other';
    status: PartnerStatus;
    contact_name: string | null;
    contact_email: string | null;
    owner: string | null;
    contribution: string | null;
    amount_usd: number | null;
    next_step: string | null;
    next_step_due: string | null;
    notes: string | null;
};
export const PARTNER_KINDS: { value: Partner['kind']; label: string }[] = [
    { value: 'funder', label: 'Funder' }, { value: 'delivery', label: 'Delivery partner' },
    { value: 'country_host', label: 'Country host' }, { value: 'recruitment', label: 'Recruitment partner' },
    { value: 'media', label: 'Media' }, { value: 'other', label: 'Other' },
];
export const PARTNER_STATUS: Record<PartnerStatus, { label: string; color: string }> = {
    to_contact: { label: 'To contact', color: 'bg-gray-100 text-gray-700' },
    asked: { label: 'Request sent', color: 'bg-blue-100 text-blue-700' },
    in_discussion: { label: 'In discussion', color: 'bg-amber-100 text-amber-800' },
    confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700' },
    declined: { label: 'Declined', color: 'bg-red-100 text-red-700' },
};

export type BudgetLine = {
    id: string;
    item: string;
    category: string | null;
    budget_usd: number;
    funded_usd: number;
    essential: boolean;
    partner_id: string | null;
    funding_source: string | null;
    notes: string | null;
};

export type CountryGathering = {
    id: string;
    country: string;
    priority: number;
    active: boolean;
    status: 'planning' | 'host_confirmed' | 'ready';
    host_name: string | null;
    host_org: string | null;
    host_contact: string | null;
    host_capacity: number | null;
    coordinator_name: string | null;
    coordinator_contact: string | null;
    venue: string | null;
    first_activity: string | null;
    first_activity_date: string | null;
    notes: string | null;
};
export const COUNTRY_STATUS: Record<CountryGathering['status'], { label: string; color: string }> = {
    planning: { label: 'Planning', color: 'bg-gray-100 text-gray-700' },
    host_confirmed: { label: 'Host confirmed', color: 'bg-blue-100 text-blue-700' },
    ready: { label: 'Ready', color: 'bg-green-100 text-green-700' },
};

export type FounderGroup = {
    id: string;
    name: string;
    country: string | null;
    venture_lead_name: string | null;
    venture_lead_email: string | null;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    meeting_rhythm: string | null;
};

/** Normalises free-text countries so "ghana " and "Ghana" match a gathering. */
export const sameCountry = (a?: string | null, b?: string | null) =>
    !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/** What a confirmed founder must know on launch day (roadmap, 30 Nov). */
export function welcomeGaps(founder: { group_id?: string | null; next_action?: string | null }, group?: FounderGroup | null) {
    const gaps: string[] = [];
    if (!founder.group_id || !group) gaps.push('No group');
    else {
        if (!group.venture_lead_name) gaps.push('Group has no venture lead');
        if (!group.contact_name) gaps.push('Group has no contact person');
    }
    if (!founder.next_action?.trim()) gaps.push('No next action');
    return gaps;
}
