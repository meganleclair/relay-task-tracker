/** Format an ISO timestamp as "Apr 4, 2:30 PM" — used for updated-at and activity entries. */
export function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** @deprecated Use `formatTimestamp` */
export const formatUpdated = formatTimestamp;

/** @deprecated Use `formatTimestamp` */
export const formatActivityTime = formatTimestamp;

export function formatDueDate(iso: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

/** Store a calendar day as ISO (noon UTC) so the date stays stable in the table. */
export function inputValueToDueIso(yyyyMmDd: string): string {
  return `${yyyyMmDd}T12:00:00.000Z`;
}

/** Persist a picked calendar day in the same format as mock data / table. */
export function dateToDueIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return inputValueToDueIso(`${y}-${m}-${day}`);
}
