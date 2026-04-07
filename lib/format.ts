export function formatUpdated(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function formatDueDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
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

export function formatActivityTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}
