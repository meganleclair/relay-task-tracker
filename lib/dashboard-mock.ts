/**
 * Fixed reference time for dashboard stats so “last 7 days” math is pure during render.
 * (Mock product date; aligns with sample data around early April 2026.)
 */
export const DASHBOARD_AS_OF_MS = Date.UTC(2026, 3, 5, 12, 0, 0);

/** Short labels for Mon–Fri activity chart (order matches weekday index 0–4). */
export const QUEUE_WEEKDAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
] as const;

export const AVG_TURNAROUND_DAYS_MOCK = 2.4;

export function getActivityWeekStats(counts: readonly number[]) {
  const total = counts.reduce((a, b) => a + b, 0);
  const avg = Math.round((total / counts.length) * 10) / 10;
  const peakCount = Math.max(...counts, 0);
  const peakIdx = counts.indexOf(peakCount);
  const peakDay = QUEUE_WEEKDAY_LABELS[peakIdx] ?? "—";
  return { total, avg, peakDay, peakCount };
}
