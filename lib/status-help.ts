import type { ItemStatus } from "@/lib/types";

/** Short definitions for tooltips and onboarding copy. */
export const STATUS_HELP: Record<ItemStatus, string> = {
  Draft:
    "Still being prepared — not yet submitted to the review queue. Move to In Review when it’s ready for the team.",
  "In Review": "The team is actively evaluating this item.",
  Approved: "Review finished with approval; ready for bind or handoff.",
  Blocked: "Waiting on missing info or a third party before work can continue.",
  Complete: "Closed — no further review action expected.",
};
