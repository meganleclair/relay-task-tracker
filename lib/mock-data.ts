import type { ItemType, RelayItem } from "./types";

export const ITEM_TYPES: ItemType[] = [
  "Incident Response Review",
  "Ransomware Assessment",
  "Data Breach Evaluation",
  "Cyber Renewal",
  "Sublimit Review",
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
    name: "Ransomware Coverage Endorsement",
    client: "Summit Healthcare Systems",
    type: "Incident Response Review",
    status: "Complete",
    owner: "Jordan Lee",
    priority: "High",
    dueAt: "2026-04-02T12:00:00.000Z",
    updatedAt: "2026-04-04T15:30:00.000Z",
    summary:
      "Endorsement issued post-incident. Retroactive sublimit applied; IR retainer confirmed on file. No coverage dispute.",
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
    name: "Data Breach Notification Review",
    client: "Pacific Financial Group",
    type: "Data Breach Evaluation",
    status: "Complete",
    owner: "Maya Chen",
    priority: "High",
    dueAt: "2026-04-01T12:00:00.000Z",
    updatedAt: "2026-04-03T11:00:00.000Z",
    summary:
      "Breach notification timeline reviewed against state requirements. Regulatory exposure within sublimit; no coverage dispute.",
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
    name: "Cyber Liability Application — SaaS",
    client: "Apex Software Solutions",
    type: "Cyber Renewal",
    status: "In Review",
    owner: "Maya Chen",
    priority: "High",
    dueAt: "2026-04-07T17:00:00.000Z",
    updatedAt: "2026-04-02T16:40:00.000Z",
    summary:
      "Annual renewal. Applicant added two new cloud products since last bind. Awaiting updated SOC-2 Type II attestation.",
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
        text: "Requested updated SOC-2 attestation and vendor inventory",
      },
    ],
  },
  {
    id: "rly-1038",
    name: "Social Engineering Sublimit Assessment",
    client: "Northgate Legal Partners",
    type: "Sublimit Review",
    status: "Approved",
    owner: "Jordan Lee",
    priority: "Medium",
    dueAt: "2026-04-09T17:00:00.000Z",
    updatedAt: "2026-04-02T11:22:00.000Z",
    summary:
      "Social engineering sublimit reviewed against BEC exposure profile. Limits within appetite for professional services segment.",
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
        text: "Approved after final sublimit comparison — within BEC appetite",
      },
    ],
  },
  {
    id: "rly-1031",
    name: "Healthcare Data Privacy Review",
    client: "Meridian Health Network",
    type: "Data Breach Evaluation",
    status: "In Review",
    owner: "Priya Shah",
    priority: "High",
    dueAt: "2026-04-06T17:00:00.000Z",
    updatedAt: "2026-04-01T18:55:00.000Z",
    summary:
      "HIPAA breach involving 12,000+ patient records. PHI scope under review; regulatory counsel engaged for notification timeline.",
    activity: [
      {
        id: "a5",
        at: "2026-04-01T18:55:00.000Z",
        kind: "note",
        text: "Flagged for regulatory counsel — PHI scope unclear pending forensics",
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
    name: "Ransomware Sublimit Endorsement",
    client: "Westbrook Financial LLC",
    type: "Sublimit Review",
    status: "Blocked",
    owner: "Alex Morgan",
    priority: "Medium",
    dueAt: "2026-04-03T17:00:00.000Z",
    updatedAt: "2026-04-01T09:08:00.000Z",
    summary:
      "Sublimit increase request pending CAT modeling sign-off. Underwriting needs updated network architecture documentation.",
    activity: [
      {
        id: "a7",
        at: "2026-04-01T09:08:00.000Z",
        kind: "note",
        text: "Waiting on network architecture docs before routing to CAT team",
      },
    ],
  },
  {
    id: "rly-1024",
    name: "Tech E&O Renewal — Multi-Tenant SaaS",
    client: "Coastal Cloud Services",
    type: "Cyber Renewal",
    status: "In Review",
    owner: "Sam Rivera",
    priority: "High",
    dueAt: "2026-04-11T17:00:00.000Z",
    updatedAt: "2026-03-31T15:47:00.000Z",
    summary:
      "Multi-tenant SaaS with 300+ enterprise clients. Supply chain risk flagged; third-party vendor inventory and SLA documentation requested.",
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
    name: "Incident Response Retainer Review",
    client: "Greenfield Logistics Co.",
    type: "Incident Response Review",
    status: "Draft",
    owner: "Alex Morgan",
    priority: "Low",
    dueAt: "2026-04-14T17:00:00.000Z",
    updatedAt: "2026-03-30T13:20:00.000Z",
    summary:
      "Pre-approved IR panel retainer expired. Drafting updated vendor list before routing for signature. Panel coverage remains active.",
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
    name: "Ransomware Assessment — Retail",
    client: "Northeast Retail Holdings",
    type: "Ransomware Assessment",
    status: "Complete",
    owner: "Priya Shah",
    priority: "Low",
    dueAt: "2026-03-28T12:00:00.000Z",
    updatedAt: "2026-03-29T17:02:00.000Z",
    summary:
      "EDR coverage confirmed. MFA deployment verified across all POS systems. Renewal issued at flat rate; no adjustments required.",
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
    name: "Business Email Compromise Review",
    client: "Ironwood Capital Partners",
    type: "Data Breach Evaluation",
    status: "In Review",
    owner: "Jordan Lee",
    priority: "Medium",
    dueAt: "2026-04-05T17:00:00.000Z",
    updatedAt: "2026-03-28T10:15:00.000Z",
    summary:
      "BEC incident with $340K fraudulent wire transfer. Coverage confirmed under social engineering sublimit. Recovery in progress.",
    activity: [
      {
        id: "a11",
        at: "2026-03-28T10:15:00.000Z",
        kind: "note",
        text: "SWIFT recall filed — recovery timeline 10–15 business days",
      },
    ],
  },
  {
    id: "rly-1003",
    name: "Cyber Renewal — Professional Services",
    client: "Keystone Advisory Group",
    type: "Cyber Renewal",
    status: "Approved",
    owner: "Maya Chen",
    priority: "Medium",
    dueAt: "2026-04-08T12:00:00.000Z",
    updatedAt: "2026-03-27T14:40:00.000Z",
    summary:
      "Clean loss history. Updated questionnaire confirmed MFA and endpoint protection across all systems. Renewed with minor sublimit adjustment.",
    activity: [
      {
        id: "a12",
        at: "2026-03-27T14:40:00.000Z",
        kind: "note",
        text: "Approved — MFA verified, clean loss run, sublimit adjusted +$250K",
      },
    ],
  },
  {
    id: "rly-0996",
    name: "Supply Chain Attack Assessment",
    client: "Riverside Technology Trust",
    type: "Ransomware Assessment",
    status: "Draft",
    owner: "Sam Rivera",
    priority: "Low",
    dueAt: "2026-04-18T12:00:00.000Z",
    updatedAt: "2026-03-26T09:50:00.000Z",
    summary:
      "Third-party SaaS vendor compromise. Assessing downstream exposure for three policyholders; coverage analysis pending forensic report.",
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
