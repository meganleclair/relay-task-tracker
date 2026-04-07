import type { ItemStatus, Priority } from "@/lib/types";

/** Tinted badges — a bit more saturation for personality (still light-mode safe). */
export const STATUS_VISUAL: Record<
  ItemStatus,
  { background: string; color: string; border: string }
> = {
  Draft: {
    background: "rgba(130, 125, 115, 0.16)",
    color: "#3d3a35",
    border: "rgba(100, 95, 88, 0.28)",
  },
  "In Review": {
    background: "rgba(118, 86, 168, 0.2)",
    color: "#4a3568",
    border: "rgba(98, 72, 148, 0.38)",
  },
  Approved: {
    background: "rgba(72, 145, 102, 0.2)",
    color: "#1e5a36",
    border: "rgba(56, 120, 82, 0.38)",
  },
  Blocked: {
    background: "rgba(230, 120, 95, 0.2)",
    color: "#8b3a28",
    border: "rgba(200, 90, 68, 0.38)",
  },
  Complete: {
    background: "rgba(90, 155, 125, 0.18)",
    color: "#2a5c45",
    border: "rgba(70, 130, 105, 0.34)",
  },
};

/** Muted dots for priority (secondary to status badges). */
export const PRIORITY_DOT: Record<Priority, string> = {
  Low: "#6b8fa3",
  Medium: "#b8892a",
  High: "#c24e3d",
};

/** Table-only status chips — cream-washed, earthy ink. */
export const STATUS_BADGE_TABLE: Record<
  ItemStatus,
  { background: string; color: string; border: string }
> = {
  Draft: {
    background: "#f0ebe4",
    color: "#4a4540",
    border: "#e0d9cf",
  },
  "In Review": {
    background: "#efe9f5",
    color: "#534770",
    border: "#ddd5ea",
  },
  Approved: {
    background: "#e6efe8",
    color: "#354a3c",
    border: "#cddfd4",
  },
  Blocked: {
    background: "#f5ebe7",
    color: "#6b4038",
    border: "#e8d5ce",
  },
  Complete: {
    background: "#e9f0ea",
    color: "#3d5244",
    border: "#d2e0d5",
  },
};

/** Table priority chips — same family as status (washed tints, readable ink). */
export const PRIORITY_BADGE_TABLE: Record<
  Priority,
  { background: string; color: string; border: string }
> = {
  Low: {
    background: "#e8f0f4",
    color: "#3d5a66",
    border: "#c5d6de",
  },
  Medium: {
    background: "#f5f0e4",
    color: "#6b5520",
    border: "#e8dcc4",
  },
  High: {
    background: "#f8ece9",
    color: "#8b3328",
    border: "#eccbc4",
  },
};
