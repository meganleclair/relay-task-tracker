import type { ItemStatus, Priority } from "@/lib/types";

/** Status pills for the detail panel — saturated tints. */
export const STATUS_VISUAL: Record<
  ItemStatus,
  { background: string; color: string; border: string }
> = {
  Draft: {
    background: "rgba(100, 120, 110, 0.16)",
    color: "#2d4038",
    border: "rgba(80, 105, 95, 0.28)",
  },
  "In Review": {
    background: "rgba(200, 40, 200, 0.14)",
    color: "#7a0f68",
    border: "rgba(200, 40, 200, 0.32)",
  },
  Approved: {
    background: "rgba(79, 99, 229, 0.18)",
    color: "#2d3db8",
    border: "rgba(79, 99, 229, 0.34)",
  },
  Blocked: {
    background: "rgba(220, 50, 50, 0.16)",
    color: "#991b1b",
    border: "rgba(200, 40, 40, 0.32)",
  },
  Complete: {
    background: "rgba(5, 150, 105, 0.14)",
    color: "#065f46",
    border: "rgba(5, 150, 105, 0.30)",
  },
};

/** Priority indicator dots */
export const PRIORITY_DOT: Record<Priority, string> = {
  Low:    "#9ab4ac",
  Medium: "#d97706",
  High:   "#dc2626",
};

/** Table-row status chips — crisp, lightly tinted. */
export const STATUS_BADGE_TABLE: Record<
  ItemStatus,
  { background: string; color: string; border: string }
> = {
  Draft: {
    background: "#eef3f0",
    color:      "#3d5248",
    border:     "#d0ddd8",
  },
  "In Review": {
    background: "#fce8f9",
    color:      "#7a0f68",
    border:     "#e088d0",
  },
  Approved: {
    background: "#eef0fd",
    color:      "#3340b8",
    border:     "#c4caf6",
  },
  Blocked: {
    background: "#fff0f0",
    color:      "#b91c1c",
    border:     "#fccaca",
  },
  Complete: {
    background: "#d1fae5",
    color:      "#065f46",
    border:     "#6ee7b7",
  },
};

/** Table priority chips */
export const PRIORITY_BADGE_TABLE: Record<
  Priority,
  { background: string; color: string; border: string }
> = {
  Low: {
    background: "#f0f5f3",
    color:      "#4e7368",
    border:     "#d4e2dc",
  },
  Medium: {
    background: "#fffbeb",
    color:      "#92400e",
    border:     "#fde68a",
  },
  High: {
    background: "#fff1f2",
    color:      "#be123c",
    border:     "#fecdd3",
  },
};
