export type ItemStatus =
  | "Draft"
  | "In Review"
  | "Approved"
  | "Blocked"
  | "Complete";

export type ItemType =
  | "Application Review"
  | "Renewal Review"
  | "Risk Assessment"
  | "Coverage Request"
  | "Policy Change Request";

export type Priority = "Low" | "Medium" | "High";

export type ActivityEntry = {
  id: string;
  at: string;
  text: string;
  kind: "note" | "system";
};

export type RelayItem = {
  id: string;
  name: string;
  /** Account or insured the work pertains to. */
  client: string;
  type: ItemType;
  status: ItemStatus;
  owner: string;
  priority: Priority;
  /** ISO date/time; null when no due date is set. */
  dueAt: string | null;
  updatedAt: string;
  summary: string;
  activity: ActivityEntry[];
};
