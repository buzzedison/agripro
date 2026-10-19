// Catalyst W programme calendar: 12 programme weeks from Monday 30 November 2026, with no
// sessions during the 21 December – 3 January holiday break. Shared by the public page,
// cohort admin and session scheduling so the dates never drift apart.

export type ProgrammeBreak = { start: string; end: string };
export const CATALYST_W_DATES: { start: string; end: string; totalWeeks: number; breaks: readonly ProgrammeBreak[] } = {
  start: '2026-11-30',
  end: '2027-03-07',
  totalWeeks: 12,
  breaks: [{ start: '2026-12-21', end: '2027-01-03' }],
};

const DAY = 24 * 60 * 60 * 1000;
const toDate = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);
const inBreak = (d: Date, breaks: readonly { start: string; end: string }[]) =>
  breaks.some((b) => d >= toDate(b.start) && d <= toDate(b.end));

/** First day of programme week N, skipping any week that starts inside a break. */
export function programmeWeekStart(startDate: string, weekNumber: number, breaks = CATALYST_W_DATES.breaks): string {
  let d = toDate(startDate);
  for (let week = 1; week < weekNumber; week++) {
    d = new Date(d.getTime() + 7 * DAY);
    while (inBreak(d, breaks)) d = new Date(d.getTime() + 7 * DAY);
  }
  return toIso(d);
}

/** Programme week containing `today`, or the last week started if we are in a break. 0 before the start. */
export function currentProgrammeWeek(startDate: string, totalWeeks: number, today = new Date(), breaks = CATALYST_W_DATES.breaks): { week: number; onBreak: boolean } {
  const now = toDate(toIso(today));
  if (now < toDate(startDate)) return { week: 0, onBreak: false };
  let week = 0;
  for (let w = 1; w <= totalWeeks + 20; w++) {
    if (toDate(programmeWeekStart(startDate, w, breaks)) > now) break;
    week = w;
  }
  return { week: Math.min(week, totalWeeks), onBreak: inBreak(now, breaks) };
}

export function programmeWeekRange(startDate: string, weekNumber: number, breaks = CATALYST_W_DATES.breaks) {
  const start = toDate(programmeWeekStart(startDate, weekNumber, breaks));
  return { start: toIso(start), end: toIso(new Date(start.getTime() + 6 * DAY)) };
}

/**
 * Moves a session to the same weekday in its programme week under a new start date.
 * Used when a cohort's dates change, so sessions keep their week and weekday.
 */
export function rescheduleSessionDate(sessionDate: string, weekNumber: number, oldStart: string, newStart: string, breaks = CATALYST_W_DATES.breaks) {
  const oldWeek = toDate(programmeWeekStart(oldStart, weekNumber, breaks));
  const offset = Math.min(6, Math.max(0, Math.round((toDate(sessionDate).getTime() - oldWeek.getTime()) / DAY)));
  return toIso(new Date(toDate(programmeWeekStart(newStart, weekNumber, breaks)).getTime() + offset * DAY));
}
