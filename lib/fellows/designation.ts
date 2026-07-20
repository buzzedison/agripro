// Shared, dependency-free helpers for fellow designations, safe to import into
// both server and client components (no Sanity/Supabase imports here).

export type FellowDesignation =
  | 'fellow'
  | 'director'
  | 'deputy_director'
  | 'programme_delivery_lead'
  | 'growth_engagement_lead'
  | 'partnerships_lead'
  | 'ambassador';

const LEAD_LABELS: Partial<Record<FellowDesignation, string>> = {
  director: 'Fellowship Director',
  deputy_director: 'Deputy Fellowship Director',
  programme_delivery_lead: 'Programme Delivery Lead',
  growth_engagement_lead: 'Growth & Engagement Lead',
  partnerships_lead: 'Partnerships Lead',
  ambassador: 'Country Ambassador',
};

// Human-readable title. Directors, deputies, functional leads and ambassadors
// always show their title; regular fellows fall back to their AgriPro role,
// then a generic label.
export function designationLabel(
  designation: FellowDesignation,
  roleFallback?: string | null,
): string {
  return LEAD_LABELS[designation] || roleFallback || 'Catalyst Fellow';
}

// True for the leadership tier (director, deputy, and the three functional
// leads reporting to them). Ambassadors are a separate, wider layer — not
// "leadership" for directory-grouping purposes.
export function isLeadership(designation: FellowDesignation): boolean {
  return (
    designation === 'director' ||
    designation === 'deputy_director' ||
    designation === 'programme_delivery_lead' ||
    designation === 'growth_engagement_lead' ||
    designation === 'partnerships_lead'
  );
}

export function isAmbassador(designation: FellowDesignation): boolean {
  return designation === 'ambassador';
}

// Sort key — director, then deputy, then functional leads, then fellows,
// then ambassadors last (can run into the hundreds across countries, so they
// sort after the core team rather than crowding the top of any listing).
export function designationRank(designation: FellowDesignation): number {
  switch (designation) {
    case 'director': return 0;
    case 'deputy_director': return 1;
    case 'programme_delivery_lead':
    case 'growth_engagement_lead':
    case 'partnerships_lead': return 2;
    case 'fellow': return 3;
    case 'ambassador': return 4;
    default: return 5;
  }
}
