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
