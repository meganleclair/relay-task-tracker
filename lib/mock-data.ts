import type { ItemType, RelayItem } from "./types";

/** Intake / table type options (single source for forms and `ItemType`). */
export const ITEM_TYPES: ItemType[] = [
  "Application Review",
  "Renewal Review",
  "Risk Assessment",
  "Coverage Request",
  "Policy Change Request",
];

export const OWNERS = [
  "Maya Chen",
  "Jordan Lee",
  "Priya Shah",
  "Alex Morgan",
  "Sam Rivera",
] as const;

export const CURRENT_USER = "Alex Morgan";

/** Two-letter initials for avatars (first + last name, or first two chars). */
export function displayNameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const a = parts[0][0];
  const b = parts[parts.length - 1][0];
  return `${a}${b}`.toUpperCase();
}

export const INITIAL_ITEMS: RelayItem[] = [
  {
    id: "rly-1049",
    name: "Cyber Liability Endorsement",
    client: "Summit Cloud Services Inc.",
    type: "Coverage Request",
    status: "Complete",
    owner: "Jordan Lee",
    priority: "Medium",
    dueAt: "2026-04-02T12:00:00.000Z",
    updatedAt: "2026-04-04T15:30:00.000Z",
    summary:
      "Endorsement drafted and issued. SOC-2 attestation on file; no open findings.",
    activity: [
      {
        id: "a14",
        at: "2026-04-04T15:30:00.000Z",
        kind: "system",
        text: "Status set to Complete",
      },
    ],
  },
  {
    id: "rly-1046",
    name: "Manufacturing Plant Walkthrough",
    client: "Black River Manufacturing LLC",
    type: "Risk Assessment",
    status: "Complete",
    owner: "Maya Chen",
    priority: "High",
    dueAt: "2026-04-01T12:00:00.000Z",
    updatedAt: "2026-04-03T11:00:00.000Z",
    summary:
      "On-site notes reconciled with submission. Hazards within guidelines; file closed.",
    activity: [
      {
        id: "a15",
        at: "2026-04-03T11:00:00.000Z",
        kind: "system",
        text: "Status set to Complete",
      },
    ],
  },
  {
    id: "rly-1042",
    name: "Small Business Liability Review",
    client: "Harborline Bistro Group",
    type: "Application Review",
    status: "In Review",
    owner: "Maya Chen",
    priority: "High",
    dueAt: "2026-04-07T17:00:00.000Z",
    updatedAt: "2026-04-02T16:40:00.000Z",
    summary:
      "Submission includes three locations and updated loss runs. Awaiting confirmation on subcontractor exposure.",
    activity: [
      {
        id: "a1",
        at: "2026-04-02T16:40:00.000Z",
        kind: "system",
        text: "Ownership moved to Maya Chen",
      },
      {
        id: "a2",
        at: "2026-04-02T14:05:00.000Z",
        kind: "note",
        text: "Requested updated financial documents",
      },
    ],
  },
  {
    id: "rly-1038",
    name: "Contractor Renewal Assessment",
    client: "Apex Contractors Cooperative",
    type: "Renewal Review",
    status: "Approved",
    owner: "Jordan Lee",
    priority: "Medium",
    dueAt: "2026-04-09T17:00:00.000Z",
    updatedAt: "2026-04-02T11:22:00.000Z",
    summary:
      "Annual renewal with no material changes to operations. Loss history within appetite.",
    activity: [
      {
        id: "a3",
        at: "2026-04-02T11:22:00.000Z",
        kind: "system",
        text: "Status set to Approved",
      },
      {
        id: "a4",
        at: "2026-04-01T09:30:00.000Z",
        kind: "note",
        text: "Approved after final documentation review",
      },
    ],
  },
  {
    id: "rly-1031",
    name: "Property Risk Review",
    client: "Meridian Retail Properties LP",
    type: "Risk Assessment",
    status: "In Review",
    owner: "Priya Shah",
    priority: "High",
    dueAt: "2026-04-06T17:00:00.000Z",
    updatedAt: "2026-04-01T18:55:00.000Z",
    summary:
      "Large-frame property with recent roof replacement. CAT modeling flagged for secondary review.",
    activity: [
      {
        id: "a5",
        at: "2026-04-01T18:55:00.000Z",
        kind: "note",
        text: "Flagged for secondary review",
      },
      {
        id: "a6",
        at: "2026-03-31T10:12:00.000Z",
        kind: "system",
        text: "Status set to In Review",
      },
    ],
  },
  {
    id: "rly-1027",
    name: "Coverage Change Request",
    client: "Westbrook Equipment Rentals",
    type: "Coverage Request",
    status: "Blocked",
    owner: "Alex Morgan",
    priority: "Medium",
    dueAt: "2026-04-03T17:00:00.000Z",
    updatedAt: "2026-04-01T09:08:00.000Z",
    summary:
      "Client asked to broaden equipment coverage. Need clarity on valuation method before proceeding.",
    activity: [
      {
        id: "a7",
        at: "2026-04-01T09:08:00.000Z",
        kind: "note",
        text: "Waiting on broker clarification for scheduled equipment values",
      },
    ],
  },
  {
    id: "rly-1024",
    name: "Multi-location Submission Review",
    client: "Coastal Logistics Network",
    type: "Application Review",
    status: "In Review",
    owner: "Sam Rivera",
    priority: "High",
    dueAt: "2026-04-11T17:00:00.000Z",
    updatedAt: "2026-03-31T15:47:00.000Z",
    summary:
      "Eight locations across two states. Consolidated application; site list attached for verification.",
    activity: [
      {
        id: "a8",
        at: "2026-03-31T15:47:00.000Z",
        kind: "system",
        text: "Ownership moved to Sam Rivera",
      },
    ],
  },
  {
    id: "rly-1019",
    name: "Fleet Auto Policy Change",
    client: "Pine Grove Transit Co.",
    type: "Policy Change Request",
    status: "Draft",
    owner: "Alex Morgan",
    priority: "Low",
    dueAt: "2026-04-14T17:00:00.000Z",
    updatedAt: "2026-03-30T13:20:00.000Z",
    summary:
      "Mid-term driver roster update. Drafting internal summary before routing to review.",
    activity: [
      {
        id: "a9",
        at: "2026-03-30T13:20:00.000Z",
        kind: "system",
        text: "Item created",
      },
    ],
  },
  {
    id: "rly-1012",
    name: "Retail Renewal — Northeast",
    client: "Northeast Apparel Holdings",
    type: "Renewal Review",
    status: "Complete",
    owner: "Priya Shah",
    priority: "Low",
    dueAt: "2026-03-28T12:00:00.000Z",
    updatedAt: "2026-03-29T17:02:00.000Z",
    summary:
      "Renewal issued with adjusted limits. File closed after bind confirmation.",
    activity: [
      {
        id: "a10",
        at: "2026-03-29T17:02:00.000Z",
        kind: "system",
        text: "Status set to Complete",
      },
    ],
  },
  {
    id: "rly-1008",
    name: "Warehouse Operations Assessment",
    client: "Ironwood Storage Partners",
    type: "Risk Assessment",
    status: "In Review",
    owner: "Jordan Lee",
    priority: "Medium",
    dueAt: "2026-04-05T17:00:00.000Z",
    updatedAt: "2026-03-28T10:15:00.000Z",
    summary:
      "Focus on storage practices and sprinkler documentation. Site photos uploaded.",
    activity: [
      {
        id: "a11",
        at: "2026-03-28T10:15:00.000Z",
        kind: "note",
        text: "Follow up on fire protection testing dates",
      },
    ],
  },
  {
    id: "rly-1003",
    name: "Professional Services Application",
    client: "Keystone Advisory LLC",
    type: "Application Review",
    status: "Approved",
    owner: "Maya Chen",
    priority: "Medium",
    dueAt: "2026-04-08T12:00:00.000Z",
    updatedAt: "2026-03-27T14:40:00.000Z",
    summary:
      "Consulting firm with low limits request. Contracts and W-9 verified.",
    activity: [
      {
        id: "a12",
        at: "2026-03-27T14:40:00.000Z",
        kind: "note",
        text: "Approved after final documentation review",
      },
    ],
  },
  {
    id: "rly-0996",
    name: "Umbrella Follow-up Request",
    client: "Riverside Holdings Trust",
    type: "Coverage Request",
    status: "Draft",
    owner: "Sam Rivera",
    priority: "Low",
    dueAt: "2026-04-18T12:00:00.000Z",
    updatedAt: "2026-03-26T09:50:00.000Z",
    summary:
      "Layered umbrella inquiry. Gathering underlying policy details from insured.",
    activity: [
      {
        id: "a13",
        at: "2026-03-26T09:50:00.000Z",
        kind: "system",
        text: "Item created",
      },
    ],
  },
];
