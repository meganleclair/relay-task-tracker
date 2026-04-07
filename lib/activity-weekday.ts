import type { ItemStatus, RelayItem } from "@/lib/types";

/** Full names for filter messaging (matches Mon–Fri chart order). */
export const ACTIVITY_WEEKDAY_FULL_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

/**
 * Map `updatedAt` ISO to chart index 0–4 (Mon–Fri) using UTC weekday.
 * Weekend updates return null (no weekday column).
 */
export function updatedAtToMonFriIndex(iso: string): number | null {
  const d = new Date(iso).getUTCDay();
  if (d < 1 || d > 5) return null;
  return d - 1;
}

export function countItemsByWeekday(items: readonly RelayItem[]): number[] {
  const c = [0, 0, 0, 0, 0];
  for (const item of items) {
    const idx = updatedAtToMonFriIndex(item.updatedAt);
    if (idx !== null) c[idx]++;
  }
  return c;
}

export function statusBreakdownForWeekday(
  items: readonly RelayItem[],
  weekdayIndex: number,
): Partial<Record<ItemStatus, number>> {
  const map: Partial<Record<ItemStatus, number>> = {};
  for (const item of items) {
    if (updatedAtToMonFriIndex(item.updatedAt) !== weekdayIndex) continue;
    map[item.status] = (map[item.status] ?? 0) + 1;
  }
  return map;
}

/** One-line breakdown for tooltips, e.g. "6 In Review, 3 Complete". */
export function formatStatusBreakdownLine(
  breakdown: Partial<Record<ItemStatus, number>>,
): string {
  const order: ItemStatus[] = [
    "In Review",
    "Draft",
    "Approved",
    "Blocked",
    "Complete",
  ];
  const parts = order
    .filter((s) => (breakdown[s] ?? 0) > 0)
    .map((s) => `${breakdown[s]} ${s}`);
  return parts.join(", ");
}
