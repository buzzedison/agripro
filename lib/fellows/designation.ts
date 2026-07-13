// Shared, dependency-free helpers for fellow designations, safe to import into
// both server and client components (no Sanity/Supabase imports here).

export type FellowDesignation = 'fellow' | 'director' | 'deputy_director';

// Human-readable title. Directors and deputies always show their leadership
// title; regular fellows fall back to their AgriPro role, then a generic label.
export function designationLabel(
  designation: FellowDesignation,
  roleFallback?: string | null,
): string {
  if (designation === 'director') return 'Fellowship Director';
  if (designation === 'deputy_director') return 'Deputy Fellowship Director';
  return roleFallback || 'Catalyst Fellow';
}

// True for the leadership tier (director + deputy director).
export function isLeadership(designation: FellowDesignation): boolean {
  return designation === 'director' || designation === 'deputy_director';
}

// Sort key — director first, then deputy, then fellows.
export function designationRank(designation: FellowDesignation): number {
  if (designation === 'director') return 0;
  if (designation === 'deputy_director') return 1;
  return 2;
}
