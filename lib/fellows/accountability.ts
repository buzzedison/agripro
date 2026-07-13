// Fellow accountability: weekly hours commitment, a one-week grace period, and a
// manually-set performance rating. Pure helpers — safe on server and client.

export type PerformanceRating = 'unrated' | 'on_track' | 'at_risk' | 'underperforming';

export const GRACE_PERIOD_DAYS = 7;

export const RATING_LABEL: Record<PerformanceRating, string> = {
  unrated: 'Unrated',
  on_track: 'On track',
  at_risk: 'At risk',
  underperforming: 'Underperforming',
};

// Tailwind chip classes per rating.
export const RATING_BADGE: Record<PerformanceRating, string> = {
  unrated: 'bg-gray-100 text-gray-600',
  on_track: 'bg-green-100 text-green-700',
  at_risk: 'bg-amber-100 text-amber-700',
  underperforming: 'bg-red-100 text-red-700',
};

export type GraceInfo = {
  committed: boolean;      // has the fellow been given a weekly-hours commitment + start date?
  inGrace: boolean;        // still within the one-week grace period?
  graceEndsAt: Date | null;
};

// Grace runs for GRACE_PERIOD_DAYS from when the commitment clock started.
export function graceInfo(
  commitmentStartedAt: string | null,
  now: Date = new Date(),
): GraceInfo {
  if (!commitmentStartedAt) return { committed: false, inGrace: false, graceEndsAt: null };
  const start = new Date(commitmentStartedAt);
  const graceEndsAt = new Date(start.getTime() + GRACE_PERIOD_DAYS * 86_400_000);
  return { committed: true, inGrace: now < graceEndsAt, graceEndsAt };
}

// A single scored week for a fellow. Tasks come from Stride; an admin records how
// many were done, which yields points (accumulated) and that week's rating.
export type WeeklyScore = {
  id: string;
  fellow_id: string;
  week_start: string;            // ISO date (Monday)
  tasks_done: number;
  tasks_assigned: number | null;
  points: number;
  rating: PerformanceRating;
  note: string | null;
  created_at?: string;
};

// Monday (local) of the week containing `d`, as a YYYY-MM-DD string.
export function weekStartISO(d: Date = new Date()): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();                 // 0 Sun … 6 Sat
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${dd}`;
}

// Mirror of the SQL rating logic, for optimistic UI before the trigger runs.
export function ratingFromCompletion(
  tasksDone: number,
  tasksAssigned: number | null,
): PerformanceRating {
  if (!tasksAssigned || tasksAssigned <= 0) return 'unrated';
  const r = tasksDone / tasksAssigned;
  if (r >= 0.8) return 'on_track';
  if (r >= 0.4) return 'at_risk';
  return 'underperforming';
}
