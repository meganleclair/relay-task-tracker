"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faChartBar,
  faCircleCheck,
  faClipboardList,
  faGear,
  faHouse,
  faInbox,
  faMagnifyingGlass,
  faPlus,
  faRightFromBracket,
  faRotate,
  faShieldHalved,
  faStopwatch,
  faTableList,
} from "@fortawesome/free-solid-svg-icons";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Select,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ItemStatus, Priority, RelayItem } from "@/lib/types";
import {
  CURRENT_USER,
  INITIAL_ITEMS,
  OWNERS,
  displayNameInitials,
} from "@/lib/mock-data";
import {
  ACTIVITY_WEEKDAY_FULL_NAMES,
  countItemsByWeekday,
  formatStatusBreakdownLine,
  statusBreakdownForWeekday,
  updatedAtToMonFriIndex,
} from "@/lib/activity-weekday";
import {
  AVG_TURNAROUND_DAYS_MOCK,
  getActivityWeekStats,
  QUEUE_WEEKDAY_LABELS,
} from "@/lib/dashboard-mock";
import { formatDueDate, formatUpdated } from "@/lib/format";
import { DetailPanel } from "@/components/detail-drawer";
import {
  NewItemModal,
  type NewItemFormValues,
} from "@/components/new-item-modal";
import {
  RelayInlineDueDatePicker,
  RelayInlineOwnerSelect,
  RelayInlinePrioritySelect,
  RelayInlineStatusSelect,
} from "@/components/relay-table-inline-fields";

/** Same width as the inline date field chevron slot — extra header padding lines the title up with the date text. */
const DUE_DATE_HEADER_CHEVRON_GUTTER_PX = 28;

const ALL_STATUSES: (ItemStatus | "all")[] = [
  "all",
  "Draft",
  "In Review",
  "Approved",
  "Blocked",
  "Complete",
];

/** One tint per weekday (Mon–Fri) for the activity bars. */
const WEEKDAY_BAR_STYLES: { gradient: string; border: string; glow: string }[] = [
  {
    gradient: "linear-gradient(180deg, rgba(15,207,152,0.62) 0%, rgba(15,207,152,0.18) 100%)",
    border:   "rgba(15, 207, 152, 0.50)",
    glow:     "rgba(15, 207, 152, 0.22)",
  }, // teal
  {
    gradient: "linear-gradient(180deg, rgba(79,99,229,0.55) 0%, rgba(79,99,229,0.14) 100%)",
    border:   "rgba(79,  99, 229, 0.42)",
    glow:     "rgba(79,  99, 229, 0.18)",
  }, // indigo
  {
    gradient: "linear-gradient(180deg, rgba(6,182,212,0.52) 0%, rgba(6,182,212,0.14) 100%)",
    border:   "rgba(6,  182, 212, 0.38)",
    glow:     "rgba(6,  182, 212, 0.16)",
  }, // cyan
  {
    gradient: "linear-gradient(180deg, rgba(139,92,246,0.50) 0%, rgba(139,92,246,0.12) 100%)",
    border:   "rgba(139, 92, 246, 0.36)",
    glow:     "rgba(139, 92, 246, 0.16)",
  }, // violet
  {
    gradient: "linear-gradient(180deg, rgba(16,185,129,0.52) 0%, rgba(16,185,129,0.14) 100%)",
    border:   "rgba(16,  185, 129, 0.38)",
    glow:     "rgba(16,  185, 129, 0.16)",
  }, // emerald
];

const PRIORITY_ORDER: Record<Priority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const panelSurface = {
  border: "1px solid var(--relay-border-subtle)",
  boxShadow: "var(--relay-card-shadow)",
  background: "var(--relay-surface-card)",
} as const;

function metricCardSurface(active: boolean, accent: string) {
  return {
    ...panelSurface,
    cursor: "pointer" as const,
    borderTop: `3px solid ${active ? accent : `${accent}55`}`,
    transition: "box-shadow 0.15s ease, background 0.15s ease, transform 0.12s ease",
    background: active
      ? `linear-gradient(180deg, ${accent}10 0%, var(--relay-surface-card) 60%)`
      : panelSurface.background,
    boxShadow: active
      ? `0 4px 20px rgba(10, 30, 22, 0.10), 0 0 0 1px ${accent}30`
      : panelSurface.boxShadow,
    transform: active ? "translateY(-2px)" : undefined,
  };
}

/** Activity: same white surface, lighter elevation than metric cards. */
const activitySurface = {
  border: "1px solid var(--relay-border-subtle)",
  boxShadow: "var(--relay-stat-elev)",
  background: "var(--relay-surface-card)",
} as const;

const searchInputShell = {
  input: {
    backgroundColor: "var(--relay-input-fill)",
    border: "1px solid var(--relay-border-subtle)",
    transition: "border-color 150ms ease",
  },
} as const;

const searchIconStyle = {
  fontSize: 15,
  width: 15,
  height: 15,
  color: "var(--relay-text-meta)",
  display: "block",
} as const;

/** Items panel: primary focus — defined surface on page. */
const itemsSurface = {
  backgroundColor: "var(--relay-surface-card)",
  border: "1px solid var(--relay-border-hairline)",
  borderRadius: "var(--mantine-radius-md)",
  boxShadow: "var(--relay-table-shadow)",
  overflow: "hidden" as const,
};

const itemsToolbarInputStyles = {
  input: {
    backgroundColor: "var(--relay-input-fill)",
    border: "1px solid var(--relay-border-subtle)",
    transition: "border-color 120ms ease",
  },
} as const;

/** Accent colors per stat card — used for top border, icon tint, and hover shadow. */
const STAT_ACCENT = {
  inReview:  "#a020a0",
  blocked:   "#dc2626",
  completed: "#059669",
  turnaround: "#4f63e5",
} as const;

function StatGlyph({ icon, accent }: { icon: IconDefinition; accent: string }) {
  return (
    <Box
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        flexShrink: 0,
        backgroundColor: `${accent}18`,
        border: `1px solid ${accent}2e`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FontAwesomeIcon
        icon={icon}
        style={{
          fontSize: 13,
          width: 13,
          height: 13,
          color: accent,
          opacity: 0.9,
        }}
      />
    </Box>
  );
}

function newId() {
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function msDays(n: number) {
  return n * 24 * 60 * 60 * 1000;
}

const SIGNED_OUT_STORAGE_KEY = "relay-signed-out";

/** Scripted live updates that fire every 30 s to keep the "Updated just now" badge honest. */
type LiveTick =
  | { kind: "note"; itemId: string; text: string }
  | { kind: "status"; itemId: string; status: ItemStatus };

const LIVE_TICKS: LiveTick[] = [
  { kind: "note",   itemId: "rly-1042", text: "SOC-2 Type II attestation received — coverage confirmed" },
  { kind: "status", itemId: "rly-1019", status: "In Review" },
  { kind: "note",   itemId: "rly-1031", text: "Regulatory counsel confirmed PHI scope limited to 8,400 records" },
  { kind: "status", itemId: "rly-0996", status: "In Review" },
  { kind: "note",   itemId: "rly-1027", text: "Network architecture docs received — unblocking sublimit review" },
  { kind: "status", itemId: "rly-1042", status: "Approved" },
  { kind: "note",   itemId: "rly-1008", text: "Wire recovery confirmed — $280K recovered via SWIFT reversal" },
  { kind: "status", itemId: "rly-1027", status: "In Review" },
];

const NAV_ITEMS = [
  { label: "Dashboard",    icon: faHouse,       active: false },
  { label: "Queue",        icon: faTableList,   active: true  },
  { label: "Renewals",     icon: faRotate,      active: false },
  { label: "Risk Reports", icon: faChartBar,    active: false },
  { label: "Settings",     icon: faGear,        active: false },
] as const;

function RelaySignedOutScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <Box
      style={{
        minHeight: "100dvh",
        background: "var(--relay-bg-gradient)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--mantine-spacing-md)",
      }}
    >
      <Paper
        radius="md"
        p="xl"
        maw={400}
        w="100%"
        style={{
          backgroundColor: "var(--relay-surface-card)",
          border: "1px solid var(--relay-border-subtle)",
          boxShadow: "var(--relay-card-shadow)",
        }}
      >
        <Stack gap="md">
          <FontAwesomeIcon
            icon={faShieldHalved}
            style={{ fontSize: 28, width: 28, height: 28, color: "var(--relay-accent)", marginBottom: 8 }}
          />
          <Title order={2} size="h3" fw={600} style={{ color: "var(--relay-text-strong)" }}>
            Threshold — Sign in
          </Title>
          <Text
            size="sm"
            lh={1.55}
            style={{ color: "var(--relay-text-secondary)" }}
          >
            Sign back in to open your Threshold workspace. This demo remembers
            your choice in the browser on this device.
          </Text>
          <Button onClick={onSignIn} radius="md" color="tealGreen">
            Sign back in
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export function RelayWorkspace() {
  const [items, setItems] = useState<RelayItem[]>(INITIAL_ITEMS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessionSignedIn, setSessionSignedIn] = useState(true);
  const [headerSearch, setHeaderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [myItemsOnly, setMyItemsOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"updated" | "priority" | "due">(
    "updated",
  );
  const [activityWeekdayFilter, setActivityWeekdayFilter] = useState<
    number | null
  >(null);
  const [hoveredActivityDay, setHoveredActivityDay] = useState<number | null>(
    null,
  );
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [createdRowFlashId, setCreatedRowFlashId] = useState<string | null>(
    null,
  );
  const createdFlashClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const liveTickIndex = useRef(0);

  // Fire scripted live updates every 30 s so the "Updated just now" badge stays accurate.
  useEffect(() => {
    const id = setInterval(() => {
      const tick = LIVE_TICKS[liveTickIndex.current % LIVE_TICKS.length];
      liveTickIndex.current += 1;
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== tick.itemId) return item;
          if (tick.kind === "note") {
            return {
              ...item,
              updatedAt: now,
              activity: [
                { id: newId(), at: now, text: tick.text, kind: "note" as const },
                ...item.activity,
              ],
            };
          }
          // status tick — skip if already at target
          if (item.status === tick.status) return item;
          return {
            ...item,
            status: tick.status,
            updatedAt: now,
            activity: [
              { id: newId(), at: now, text: `Status set to ${tick.status}`, kind: "system" as const },
              ...item.activity,
            ],
          };
        }),
      );
    }, 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weekdayTouchCounts = useMemo(() => countItemsByWeekday(items), [items]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SIGNED_OUT_STORAGE_KEY) === "1") {
        startTransition(() => {
          setSessionSignedIn(false);
        });
      }
    } catch {
      /* storage unavailable (e.g. private mode) */
    }
  }, []);

  const handleSignOut = () => {
    try {
      sessionStorage.setItem(SIGNED_OUT_STORAGE_KEY, "1");
    } catch {
      /* still leave the app UI */
    }
    setSelectedId(null);
    setSessionSignedIn(false);
  };

  const handleSignIn = () => {
    try {
      sessionStorage.removeItem(SIGNED_OUT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSessionSignedIn(true);
  };

  const visibleItems = useMemo(() => {
    let list = [...items];
    const q = headerSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.client.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((i) => i.status === statusFilter);
    }
    if (ownerFilter !== "all") {
      list = list.filter((i) => i.owner === ownerFilter);
    }
    if (myItemsOnly) {
      list = list.filter((i) => i.owner === CURRENT_USER);
    }
    if (activityWeekdayFilter !== null) {
      list = list.filter(
        (i) => updatedAtToMonFriIndex(i.updatedAt) === activityWeekdayFilter,
      );
    }
    list.sort((a, b) => {
      if (sortBy === "priority") {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      }
      if (sortBy === "due") {
        const at = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY;
        const bt = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY;
        if (at !== bt) return at - bt;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
    return list;
  }, [
    items,
    headerSearch,
    statusFilter,
    ownerFilter,
    myItemsOnly,
    sortBy,
    activityWeekdayFilter,
  ]);

  const summary = useMemo(() => {
    // Use the most recent updatedAt across all items as the "current time" for the
    // mock dataset — keeps "Closed in the last week" accurate no matter when the
    // demo is running, without coupling it to a hardcoded calendar date.
    const dataAsOf = Math.max(...items.map((i) => new Date(i.updatedAt).getTime()));
    const weekAgo = dataAsOf - msDays(7);
    const inReview = items.filter((i) => i.status === "In Review").length;
    const blocked = items.filter((i) => i.status === "Blocked").length;
    const completedThisWeek = items.filter(
      (i) =>
        i.status === "Complete" &&
        new Date(i.updatedAt).getTime() >= weekAgo,
    ).length;
    return { inReview, blocked, completedThisWeek };
  }, [items]);

  const selectedRecord =
    selectedId === null
      ? null
      : (items.find((i) => i.id === selectedId) ?? null);

  const isSelectionVisible =
    selectedId !== null && visibleItems.some((i) => i.id === selectedId);

  const drawerOpened = Boolean(selectedRecord && isSelectionVisible);

  const handleChangeStatus = (id: string, status: ItemStatus) => {
    setItems((prev) => {
      const cur = prev.find((i) => i.id === id);
      if (!cur || cur.status === status) return prev;
      const now = new Date().toISOString();
      const entry = {
        id: newId(),
        at: now,
        text: `Status set to ${status}`,
        kind: "system" as const,
      };
      return prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              updatedAt: now,
              activity: [entry, ...i.activity],
            }
          : i,
      );
    });
  };

  const handleChangePriority = (id: string, priority: Priority) => {
    setItems((prev) => {
      const cur = prev.find((i) => i.id === id);
      if (!cur || cur.priority === priority) return prev;
      const now = new Date().toISOString();
      const entry = {
        id: newId(),
        at: now,
        text: `Priority set to ${priority}`,
        kind: "system" as const,
      };
      return prev.map((i) =>
        i.id === id
          ? {
              ...i,
              priority,
              updatedAt: now,
              activity: [entry, ...i.activity],
            }
          : i,
      );
    });
  };

  const handleChangeOwner = (id: string, owner: string) => {
    setItems((prev) => {
      const cur = prev.find((i) => i.id === id);
      if (!cur || cur.owner === owner) return prev;
      const now = new Date().toISOString();
      const entry = {
        id: newId(),
        at: now,
        text: `Ownership moved to ${owner}`,
        kind: "system" as const,
      };
      return prev.map((i) =>
        i.id === id
          ? {
              ...i,
              owner,
              updatedAt: now,
              activity: [entry, ...i.activity],
            }
          : i,
      );
    });
  };

  const handleAddNote = (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setItems((prev) => {
      const now = new Date().toISOString();
      const entry = {
        id: newId(),
        at: now,
        text: trimmed,
        kind: "note" as const,
      };
      return prev.map((i) =>
        i.id === id
          ? {
              ...i,
              updatedAt: now,
              activity: [entry, ...i.activity],
            }
          : i,
      );
    });
  };

  const handleChangeDueDate = (id: string, dueAt: string | null) => {
    setItems((prev) => {
      const cur = prev.find((i) => i.id === id);
      if (!cur) return prev;
      const sameDay =
        (dueAt === null && cur.dueAt === null) ||
        (dueAt !== null &&
          cur.dueAt !== null &&
          dueAt.slice(0, 10) === cur.dueAt.slice(0, 10));
      if (sameDay) return prev;
      const now = new Date().toISOString();
      const entry = {
        id: newId(),
        at: now,
        text: dueAt
          ? `Due date set to ${formatDueDate(dueAt)}`
          : "Due date cleared",
        kind: "system" as const,
      };
      return prev.map((i) =>
        i.id === id
          ? {
              ...i,
              dueAt,
              updatedAt: now,
              activity: [entry, ...i.activity],
            }
          : i,
      );
    });
  };

  const clearActivityDayFilter = () => setActivityWeekdayFilter(null);

  const filtersActive =
    headerSearch.trim() !== "" ||
    statusFilter !== "all" ||
    ownerFilter !== "all" ||
    myItemsOnly ||
    activityWeekdayFilter !== null;

  const dropdownFiltersActive =
    statusFilter !== "all" ||
    ownerFilter !== "all" ||
    myItemsOnly;

  const resetDropdownFilters = () => {
    setStatusFilter("all");
    setOwnerFilter("all");
    setMyItemsOnly(false);
  };

  const clearAllListFilters = () => {
    setHeaderSearch("");
    setStatusFilter("all");
    setOwnerFilter("all");
    setMyItemsOnly(false);
    setActivityWeekdayFilter(null);
  };

  const ownerSelectData = [
    { value: "all", label: "All owners" },
    ...OWNERS.map((o) => ({ value: o, label: o })),
  ];

  const statusSelectData = ALL_STATUSES.map((s) =>
    s === "all"
      ? { value: "all", label: "All statuses" }
      : { value: s, label: s },
  );

  const maxActivity = Math.max(...weekdayTouchCounts, 1);
  const activityStats = useMemo(
    () => getActivityWeekStats(weekdayTouchCounts),
    [weekdayTouchCounts],
  );

  const activityDayTooltipLines = useMemo(
    () =>
      ([0, 1, 2, 3, 4] as const).map((i) =>
        formatStatusBreakdownLine(statusBreakdownForWeekday(items, i)),
      ),
    [items],
  );

  const activeFilterSummaryParts = useMemo(() => {
    const parts: string[] = [];
    if (activityWeekdayFilter !== null) {
      parts.push(ACTIVITY_WEEKDAY_FULL_NAMES[activityWeekdayFilter]);
    }
    if (statusFilter !== "all") {
      parts.push(statusFilter);
    }
    if (ownerFilter !== "all") {
      parts.push(ownerFilter);
    }
    if (myItemsOnly) {
      parts.push("Mine only");
    }
    const q = headerSearch.trim();
    if (q) {
      parts.push(`"${q}"`);
    }
    return parts;
  }, [
    activityWeekdayFilter,
    statusFilter,
    ownerFilter,
    myItemsOnly,
    headerSearch,
  ]);

  const showUnifiedFilterBanner = activeFilterSummaryParts.length > 0;

  const filterPulseKey = useMemo(
    () =>
      [
        activityWeekdayFilter ?? "x",
        statusFilter,
        ownerFilter,
        myItemsOnly,
        headerSearch.trim(),
      ].join("|"),
    [
      activityWeekdayFilter,
      statusFilter,
      ownerFilter,
      myItemsOnly,
      headerSearch,
    ],
  );

  const tableShellRef = useRef<HTMLDivElement>(null);
  const skipTablePulse = useRef(true);

  useEffect(() => {
    if (skipTablePulse.current) {
      skipTablePulse.current = false;
      return;
    }
    const el = tableShellRef.current;
    if (!el) return;
    el.classList.remove("relay-items-table--pulse");
    void el.offsetWidth;
    el.classList.add("relay-items-table--pulse");
  }, [filterPulseKey]);

  const toggleMetricStatusFilter = (status: ItemStatus) => {
    setStatusFilter((prev) => (prev === status ? "all" : status));
  };

  const handleCreateItem = (values: NewItemFormValues) => {
    const now = new Date().toISOString();
    const id = `rly-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const entry = {
      id: newId(),
      at: now,
      text: "Item created",
      kind: "system" as const,
    };
    const item: RelayItem = {
      id,
      name: values.name,
      client: values.client,
      type: values.type,
      status: "Draft",
      owner: values.owner,
      priority: values.priority,
      dueAt: values.dueAt,
      updatedAt: now,
      summary: values.summary,
      activity: [entry],
    };
    setItems((prev) => [item, ...prev]);
    setNewItemModalOpen(false);
    setCreatedRowFlashId(id);
    if (createdFlashClearRef.current)
      clearTimeout(createdFlashClearRef.current);
    createdFlashClearRef.current = setTimeout(() => {
      setCreatedRowFlashId(null);
      createdFlashClearRef.current = null;
    }, 2500);
  };

  if (!sessionSignedIn) {
    return <RelaySignedOutScreen onSignIn={handleSignIn} />;
  }

  return (
    <AppShell
      navbar={{ width: 220, breakpoint: "sm" }}
      padding={0}
      styles={{
        root: { background: "var(--relay-bg)" },
        main: { background: "transparent", paddingTop: 0, paddingBottom: 0 },
        navbar: {
          background: "var(--relay-sidebar-bg)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        },
      }}
    >
      <AppShell.Navbar>
        <Stack gap={0} h="100%">
          {/* Logo */}
          <Box p="lg" pb="md">
            <Group gap="sm" align="center">
              <Box style={{
                width: 32, height: 32, borderRadius: "var(--mantine-radius-md)",
                background: "rgba(15, 207, 152, 0.15)",
                border: "1px solid rgba(15, 207, 152, 0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <FontAwesomeIcon icon={faShieldHalved} style={{ width: 15, height: 15, color: "var(--relay-accent)" }} />
              </Box>
              <Stack gap={0}>
                <Text fw={700} size="sm" style={{ color: "#ffffff", lineHeight: 1.25, letterSpacing: "-0.01em" }}>Threshold</Text>
                <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.2, letterSpacing: "0.04em", textTransform: "uppercase" }}>Cyber Ops</Text>
              </Stack>
            </Group>
          </Box>

          {/* Nav items */}
          <Stack gap={2} px="xs" style={{ flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className="relay-nav-item"
                data-active={item.active ? "true" : undefined}
                type="button"
                style={{ display: "block", width: "100%" }}
              >
                <Group gap="sm" wrap="nowrap">
                  <FontAwesomeIcon
                    icon={item.icon}
                    style={{
                      width: 13, height: 13,
                      color: item.active ? "var(--relay-accent)" : "rgba(255,255,255,0.4)",
                      flexShrink: 0,
                    }}
                  />
                  <Text size="sm" fw={item.active ? 600 : 400}
                    style={{ color: item.active ? "#ffffff" : "rgba(255,255,255,0.58)", lineHeight: 1 }}>
                    {item.label}
                  </Text>
                </Group>
              </button>
            ))}
          </Stack>

          {/* User / sign-out */}
          <Box p="sm" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <Group justify="space-between" align="center" wrap="nowrap">
              <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                <Avatar radius="md" color="tealGreen" variant="light" size="sm" style={{ flexShrink: 0 }}>
                  {displayNameInitials(CURRENT_USER)}
                </Avatar>
                <Text size="xs" fw={500} truncate style={{ color: "rgba(255,255,255,0.6)" }}>
                  {CURRENT_USER}
                </Text>
              </Group>
              <Tooltip label="Sign out" position="right" withArrow>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  aria-label="Sign out"
                  onClick={handleSignOut}
                  style={{ color: "rgba(255,255,255,0.38)", flexShrink: 0 }}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} style={{ width: 13, height: 13 }} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box style={{ display: "flex", alignItems: "flex-start" }}>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box
              style={{
                background: "var(--relay-bg-gradient)",
                minHeight: "100dvh",
                paddingTop: "max(2rem, calc(1rem + env(safe-area-inset-top, 0px)))",
              }}
              pb="xl"
            >
              <Container size="xl" px={{ base: "md", sm: "xl" }} pt="sm">
                <Stack gap={40}>

                  {/* ── Hero banner ─────────────────────────────── */}
                  <Paper
                    radius="lg"
                    p={{ base: "lg", sm: "xl" }}
                    style={{
                      background: "linear-gradient(135deg, #0b2420 0%, #14403a 55%, #1c5448 100%)",
                      position: "relative",
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxShadow: "0 8px 32px rgba(10, 30, 22, 0.18)",
                    }}
                  >
                    {/* decorative orbs */}
                    <Box aria-hidden style={{ position: "absolute", top: -50, right: -30, width: 220, height: 220, borderRadius: "50%", background: "rgba(15,207,152,0.06)" }} />
                    <Box aria-hidden style={{ position: "absolute", bottom: -70, left: 80, width: 180, height: 180, borderRadius: "50%", background: "rgba(15,207,152,0.04)" }} />

                    <Group justify="space-between" align="center" wrap="wrap" gap="xl" style={{ position: "relative" }}>
                      <Stack gap="xl">
                        <Stack gap={6}>
                          <Text style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.42)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Cyber Underwriting Queue
                          </Text>
                          <Group gap="md" align="flex-end">
                            <Text fw={700} style={{ fontSize: "3.25rem", lineHeight: 1, color: "#fff", letterSpacing: "-0.03em" }}>
                              {items.length}
                            </Text>
                            <Text fw={500} size="lg" mb={6} style={{ color: "rgba(255,255,255,0.5)" }}>
                              items in queue
                            </Text>
                          </Group>
                        </Stack>

                        <Group gap={0} wrap="wrap">
                          <Stack gap={3} pr="xl">
                            <Text fw={700} size="xl" style={{ color: "#fff", lineHeight: 1 }}>{summary.inReview}</Text>
                            <Text size="xs" style={{ color: "rgba(255,255,255,0.5)" }}>In review</Text>
                          </Stack>
                          <Box style={{ width: 1, height: 36, background: "rgba(255,255,255,0.1)", alignSelf: "center" }} />
                          <Stack gap={3} px="xl">
                            <Text fw={700} size="xl" style={{ color: summary.blocked > 0 ? "#f87171" : "#fff", lineHeight: 1 }}>{summary.blocked}</Text>
                            <Text size="xs" style={{ color: "rgba(255,255,255,0.5)" }}>Blocked</Text>
                          </Stack>
                          <Box style={{ width: 1, height: 36, background: "rgba(255,255,255,0.1)", alignSelf: "center" }} />
                          <Stack gap={3} pl="xl">
                            <Text fw={700} size="xl" style={{ color: "var(--relay-accent)", lineHeight: 1 }}>{summary.completedThisWeek}</Text>
                            <Text size="xs" style={{ color: "rgba(255,255,255,0.5)" }}>Closed this week</Text>
                          </Stack>
                        </Group>
                      </Stack>

                      <Stack gap="sm" align="flex-end">
                        <Badge
                          size="sm"
                          style={{
                            background: "rgba(15,207,152,0.12)",
                            color: "var(--relay-accent)",
                            border: "1px solid rgba(15,207,152,0.22)",
                            textTransform: "none",
                            letterSpacing: "normal",
                          }}
                          leftSection={
                            <Box component="span" className="relay-header-live-dot"
                              style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, alignSelf: "center" }} />
                          }
                        >
                          Updated just now
                        </Badge>
                        <Button
                          leftSection={<FontAwesomeIcon icon={faPlus} style={{ width: 12, height: 12, fontSize: 12 }} />}
                          onClick={() => setNewItemModalOpen(true)}
                          radius="md"
                          size="md"
                          style={{
                            background: "var(--relay-accent)",
                            color: "#0b2420",
                            fontWeight: 700,
                            border: "none",
                            boxShadow: "0 2px 12px rgba(15, 207, 152, 0.35)",
                          }}
                        >
                          New item
                        </Button>
                      </Stack>
                    </Group>
                  </Paper>

                  {/* ── Metric cards (4) ────────────────────────── */}
                  <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="lg">
                    <Tooltip label="Filter by In Review" openDelay={600} withArrow position="top">
                    <UnstyledButton
                      type="button"
                      aria-pressed={statusFilter === "In Review"}
                      onClick={() => toggleMetricStatusFilter("In Review")}
                      style={{ width: "100%", padding: 0, border: "none", background: "none", textAlign: "left" as const }}
                    >
                      <Paper radius="md" p={{ base: "md", sm: "lg" }} style={metricCardSurface(statusFilter === "In Review", STAT_ACCENT.inReview)}>
                        <Stack gap="sm">
                          <Text fw={700} lh={1.05} style={{ color: "var(--relay-text-strong)", fontSize: "1.875rem" }}>
                            {summary.inReview}
                          </Text>
                          <Group gap="sm" align="center" wrap="nowrap">
                            <StatGlyph icon={faClipboardList} accent={STAT_ACCENT.inReview} />
                            <Text size="xs" fw={500} tt="uppercase" lts={0.5} style={{ color: "var(--relay-text-meta)" }}>
                              In review
                            </Text>
                          </Group>
                          <Text size="xs" fw={400} lh={1.5} style={{ color: "var(--relay-text-meta)" }}>
                            Active decisions
                          </Text>
                        </Stack>
                      </Paper>
                    </UnstyledButton>
                    </Tooltip>

                    <Tooltip label="Filter by Blocked" openDelay={600} withArrow position="top">
                    <UnstyledButton
                      type="button"
                      aria-pressed={statusFilter === "Blocked"}
                      onClick={() => toggleMetricStatusFilter("Blocked")}
                      style={{ width: "100%", padding: 0, border: "none", background: "none", textAlign: "left" as const }}
                    >
                      <Paper radius="md" p={{ base: "md", sm: "lg" }} style={metricCardSurface(statusFilter === "Blocked", STAT_ACCENT.blocked)}>
                        <Stack gap="sm">
                          <Text fw={700} lh={1.05} style={{ color: summary.blocked > 0 ? STAT_ACCENT.blocked : "var(--relay-text-strong)", fontSize: "1.875rem" }}>
                            {summary.blocked}
                          </Text>
                          <Group gap="sm" align="center" wrap="nowrap">
                            <StatGlyph icon={faBan} accent={STAT_ACCENT.blocked} />
                            <Text size="xs" fw={500} tt="uppercase" lts={0.5} style={{ color: "var(--relay-text-meta)" }}>
                              Blocked
                            </Text>
                          </Group>
                          <Text size="xs" fw={400} lh={1.5} style={{ color: "var(--relay-text-meta)" }}>
                            Needs input to unblock
                          </Text>
                        </Stack>
                      </Paper>
                    </UnstyledButton>
                    </Tooltip>

                    <Tooltip label="Filter by Completed" openDelay={600} withArrow position="top">
                    <UnstyledButton
                      type="button"
                      aria-pressed={statusFilter === "Complete"}
                      onClick={() => toggleMetricStatusFilter("Complete")}
                      style={{ width: "100%", padding: 0, border: "none", background: "none", textAlign: "left" as const }}
                    >
                      <Paper radius="md" p={{ base: "md", sm: "lg" }} style={metricCardSurface(statusFilter === "Complete", STAT_ACCENT.completed)}>
                        <Stack gap="sm">
                          <Text fw={700} lh={1.05} style={{ color: "var(--relay-text-strong)", fontSize: "1.875rem" }}>
                            {summary.completedThisWeek}
                          </Text>
                          <Group gap="sm" align="center" wrap="nowrap">
                            <StatGlyph icon={faCircleCheck} accent={STAT_ACCENT.completed} />
                            <Text size="xs" fw={500} tt="uppercase" lts={0.5} style={{ color: "var(--relay-text-meta)" }}>
                              Completed
                            </Text>
                          </Group>
                          <Text size="xs" fw={400} lh={1.5} style={{ color: "var(--relay-text-meta)" }}>
                            Closed in the last week
                          </Text>
                        </Stack>
                      </Paper>
                    </UnstyledButton>
                    </Tooltip>

                    <Paper radius="md" p={{ base: "md", sm: "lg" }}
                      style={{
                        ...panelSurface,
                        borderTop: `3px solid ${STAT_ACCENT.turnaround}55`,
                      }}
                    >
                      <Stack gap="sm">
                        <Group gap={8} align="baseline" wrap="nowrap">
                          <Text fw={700} lh={1.05} style={{ color: "var(--relay-text-strong)", fontSize: "1.875rem" }}>
                            {AVG_TURNAROUND_DAYS_MOCK}
                          </Text>
                          <Text size="xs" fw={500} style={{ color: "var(--relay-text-meta)" }}>
                            days
                          </Text>
                        </Group>
                        <Group gap="sm" align="center" wrap="nowrap">
                          <StatGlyph icon={faStopwatch} accent={STAT_ACCENT.turnaround} />
                          <Text size="xs" fw={500} tt="uppercase" lts={0.5} style={{ color: "var(--relay-text-meta)" }}>
                            Avg. turnaround
                          </Text>
                        </Group>
                        <Text size="xs" fw={400} lh={1.5} style={{ color: "var(--relay-text-meta)" }}>
                          Rolling average
                        </Text>
                      </Stack>
                    </Paper>
                  </SimpleGrid>

                  {/* ── Activity chart ──────────────────────────── */}
                  <Paper
                    radius="md"
                    p={{ base: "md", sm: "lg" }}
                    style={activitySurface}
                  >
                    <Stack gap="lg">
                      <Stack gap="md">
                        <Text
                          size="xs"
                          fw={600}
                          tt="uppercase"
                          lts={0.5}
                          style={{ color: "var(--relay-text-meta)" }}
                        >
                          Activity
                        </Text>
                        <Text
                          size="xs"
                          fw={400}
                          maw={480}
                          lh={1.55}
                          style={{ color: "var(--relay-text-meta)" }}
                        >
                          Touches per weekday (by last update). Click a day to filter
                          the table.
                        </Text>
                        <Group gap="lg" wrap="wrap">
                          <Text size="xs" style={{ color: "var(--relay-text-secondary)" }} fw={400}>
                            This week:{" "}
                            <Text span fw={600} c="warmGray.8">
                              {activityStats.total}
                            </Text>{" "}
                            touches
                          </Text>
                          <Text size="xs" style={{ color: "var(--relay-text-meta)" }} fw={400}>
                            Daily average:{" "}
                            <Text span fw={600} c="warmGray.7">
                              {activityStats.avg}
                            </Text>
                          </Text>
                          <Text size="xs" style={{ color: "var(--relay-text-meta)" }} fw={400}>
                            Busiest:{" "}
                            <Text span fw={600} c="warmGray.7">
                              {activityStats.peakDay}
                            </Text>{" "}
                            ({activityStats.peakCount})
                          </Text>
                        </Group>
                      </Stack>
                      <Group
                        gap="md"
                        align="flex-end"
                        justify="space-between"
                        wrap="nowrap"
                        pt="md"
                        pb={6}
                        mih={120}
                        style={{ overflow: "visible" }}
                      >
                        {weekdayTouchCounts.map((v, i) => {
                          const pct = v / maxActivity;
                          const barH = 12 + pct * 68;
                          const gradient = WEEKDAY_BAR_STYLES[i]?.gradient ?? "linear-gradient(180deg, rgba(15,207,152,0.4) 0%, rgba(15,207,152,0.12) 100%)";
                          const border = WEEKDAY_BAR_STYLES[i]?.border ?? "var(--relay-border-subtle)";
                          const glow = WEEKDAY_BAR_STYLES[i]?.glow ?? "transparent";
                          const selected = activityWeekdayFilter === i;
                          const hovered = hoveredActivityDay === i;
                          const breakdownLine = activityDayTooltipLines[i] ?? "";
                          const tooltipLabel = (
                            <Stack gap={4} p={2}>
                              <Text size="sm" fw={600}>
                                {v} {v === 1 ? "item" : "items"} touched
                              </Text>
                              {breakdownLine ? (
                                <Text size="xs" c="dimmed" lh={1.45}>
                                  {breakdownLine}
                                </Text>
                              ) : null}
                            </Stack>
                          );
                          return (
                            <Tooltip
                              key={QUEUE_WEEKDAY_LABELS[i]}
                              label={tooltipLabel}
                              position="top"
                              withArrow
                              multiline
                              w={260}
                              openDelay={400}
                            >
                              <UnstyledButton
                                type="button"
                                aria-pressed={selected}
                                aria-label={`${ACTIVITY_WEEKDAY_FULL_NAMES[i]}: ${v} ${v === 1 ? "item" : "items"} touched`}
                                onClick={() =>
                                  setActivityWeekdayFilter((p) =>
                                    p === i ? null : i,
                                  )
                                }
                                onMouseEnter={() => setHoveredActivityDay(i)}
                                onMouseLeave={() => setHoveredActivityDay(null)}
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  cursor: "pointer",
                                  padding: 6,
                                  margin: -6,
                                  borderRadius: 10,
                                  border: selected
                                    ? `2px solid ${border}`
                                    : "2px solid transparent",
                                  backgroundColor: selected
                                    ? "rgba(15, 207, 152, 0.06)"
                                    : "transparent",
                                  boxShadow: selected
                                    ? "0 2px 10px rgba(10, 30, 22, 0.08)"
                                    : undefined,
                                  transform: selected ? "scale(1.02)" : undefined,
                                  transition:
                                    "transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease, background-color 0.12s ease",
                                }}
                              >
                                <Stack gap={6} align="center">
                                  <Text
                                    size="xs"
                                    fw={600}
                                    c="warmGray.7"
                                    style={{ fontVariantNumeric: "tabular-nums" }}
                                  >
                                    {v}
                                  </Text>
                                  <Box
                                    style={{
                                      height: 96,
                                      width: "100%",
                                      display: "flex",
                                      alignItems: "flex-end",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Box
                                      style={{
                                        width: "min(100%, 32px)",
                                        height: barH,
                                        borderRadius: "6px 6px 3px 3px",
                                        background: gradient,
                                        border: `1px solid ${border}`,
                                        filter:
                                          hovered && !selected
                                            ? "brightness(1.08)"
                                            : selected
                                              ? "saturate(1.15) brightness(1.05)"
                                              : undefined,
                                        transform: selected
                                          ? "scale(1.04)"
                                          : undefined,
                                        transition:
                                          "filter 0.12s ease, transform 0.12s ease",
                                        boxShadow: selected
                                          ? `0 2px 10px ${glow}, 0 0 0 1px ${border}`
                                          : `0 1px 4px ${glow}`,
                                      }}
                                    />
                                  </Box>
                                  <Text size="xs" fw={500} c="dimmed">
                                    {QUEUE_WEEKDAY_LABELS[i]}
                                  </Text>
                                </Stack>
                              </UnstyledButton>
                            </Tooltip>
                          );
                        })}
                      </Group>
                    </Stack>
                  </Paper>

                  {/* ── Items table ─────────────────────────────── */}
                  <Paper component="div" radius="md" style={itemsSurface}>
                    <Stack gap={0}>
                      <Box
                        px={{ base: "md", sm: "lg" }}
                        py={{ base: "md", sm: "lg" }}
                        style={{ borderBottom: "1px solid var(--relay-border-hairline)" }}
                      >
                        <Stack gap="lg">
                          <Group
                            justify="space-between"
                            align="flex-start"
                            wrap="wrap"
                            gap="md"
                          >
                            <Stack gap={4}>
                              <Title order={3} fw={600} c="warmGray.9" size="h3">
                                Items
                              </Title>
                              <Text
                                size="xs"
                                fw={400}
                                style={{ color: "var(--relay-text-meta)" }}
                              >
                                Showing{" "}
                                <Text span fw={500} c="warmGray.7">
                                  {visibleItems.length}
                                </Text>{" "}
                                of {items.length}
                              </Text>
                            </Stack>
                            <Group gap="sm" wrap="wrap" align="center">
                              <Select
                                size="xs"
                                w={152}
                                data={statusSelectData}
                                value={statusFilter}
                                onChange={(v) => setStatusFilter(v ?? "all")}
                                allowDeselect={false}
                                radius="md"
                                styles={itemsToolbarInputStyles}
                              />
                              <Select
                                size="xs"
                                w={168}
                                data={ownerSelectData}
                                value={ownerFilter}
                                onChange={(v) => setOwnerFilter(v ?? "all")}
                                allowDeselect={false}
                                radius="md"
                                styles={itemsToolbarInputStyles}
                              />
                              <Switch
                                size="xs"
                                label="Mine only"
                                checked={myItemsOnly}
                                onChange={(e) =>
                                  setMyItemsOnly(e.currentTarget.checked)
                                }
                                styles={{
                                  label: { fontSize: 12, fontWeight: 400 },
                                }}
                              />
                              {dropdownFiltersActive && (
                                <Button
                                  type="button"
                                  variant="subtle"
                                  color="gray"
                                  size="xs"
                                  radius="md"
                                  onClick={resetDropdownFilters}
                                >
                                  Reset filters
                                </Button>
                              )}
                              <SegmentedControl
                                size="xs"
                                radius="md"
                                value={sortBy}
                                onChange={(v) =>
                                  setSortBy(v as "updated" | "priority" | "due")
                                }
                                data={[
                                  { label: "Updated", value: "updated" },
                                  { label: "Priority", value: "priority" },
                                  { label: "Due date", value: "due" },
                                ]}
                              />
                            </Group>
                          </Group>
                          <TextInput
                            placeholder="Search name, client, or type…"
                            value={headerSearch}
                            onChange={(e) => setHeaderSearch(e.currentTarget.value)}
                            leftSection={
                              <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                style={searchIconStyle}
                              />
                            }
                            hiddenFrom="xs"
                            radius="md"
                            size="sm"
                            styles={itemsToolbarInputStyles}
                          />
                        </Stack>
                      </Box>

                      {showUnifiedFilterBanner && (
                        <Box
                          px={{ base: "md", sm: "lg" }}
                          py="sm"
                          style={{
                            borderBottom: "1px solid var(--relay-border-hairline)",
                            backgroundColor: "var(--relay-surface-muted)",
                          }}
                        >
                          <Group gap="sm" align="center" wrap="wrap" justify="space-between">
                            <Text
                              size="sm"
                              fw={500}
                              style={{ color: "var(--relay-text-secondary)" }}
                              maw={{ base: "100%", sm: "calc(100% - 160px)" }}
                            >
                              Filtered by:{" "}
                              <Text span fw={600} style={{ color: "var(--relay-text-strong)" }}>
                                {activeFilterSummaryParts.join(" · ")}
                              </Text>
                            </Text>
                            {activityWeekdayFilter !== null && (
                              <Button
                                type="button"
                                variant="subtle"
                                color="gray"
                                size="xs"
                                radius="md"
                                onClick={clearActivityDayFilter}
                                flex="0 0 auto"
                              >
                                Clear day filter
                              </Button>
                            )}
                          </Group>
                        </Box>
                      )}

                      {visibleItems.length === 0 ? (
                        <Stack align="center" py={48} px="xl" gap="sm">
                          <FontAwesomeIcon
                            icon={faInbox}
                            style={{
                              fontSize: 22,
                              width: 22,
                              height: 22,
                              color: "var(--relay-text-meta)",
                            }}
                          />
                          <Title order={5} fw={600} c="warmGray.8" size="h5">
                            {items.length === 0
                              ? "Nothing here yet"
                              : "No items match your filters"}
                          </Title>
                          <Text
                            size="xs"
                            ta="center"
                            maw={360}
                            fw={400}
                            style={{ color: "var(--relay-text-meta)" }}
                          >
                            {items.length === 0
                              ? "Create an item to get started."
                              : filtersActive
                                ? "Loosen filters or clear search to see items again."
                                : "The queue is empty."}
                          </Text>
                          {filtersActive ? (
                            <Group gap="xs" wrap="wrap" justify="center" mt={4}>
                              <Button
                                variant="default"
                                size="xs"
                                radius="md"
                                onClick={clearAllListFilters}
                              >
                                Clear all filters
                              </Button>
                              {activityWeekdayFilter !== null ? (
                                <Button
                                  variant="subtle"
                                  color="gray"
                                  size="xs"
                                  radius="md"
                                  onClick={clearActivityDayFilter}
                                >
                                  Day filter only
                                </Button>
                              ) : null}
                            </Group>
                          ) : items.length === 0 ? (
                            <Button
                              variant="default"
                              size="xs"
                              radius="md"
                              leftSection={
                                <FontAwesomeIcon
                                  icon={faPlus}
                                  style={{ width: 12, height: 12, fontSize: 12 }}
                                />
                              }
                              onClick={() => setNewItemModalOpen(true)}
                              mt={4}
                            >
                              New item
                            </Button>
                          ) : null}
                        </Stack>
                      ) : (
                        <Box
                          ref={tableShellRef}
                          className="relay-items-table"
                        >
                          <Table.ScrollContainer minWidth={1080} type="native">
                            <Table
                              verticalSpacing={12}
                              horizontalSpacing={18}
                              striped={false}
                              withTableBorder={false}
                              styles={{
                                table: {
                                  borderCollapse: "collapse" as const,
                                  width: "100%",
                                },
                                th: {
                                  fontSize: "11px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                  fontWeight: 500,
                                  color: "var(--relay-text-meta)",
                                  borderBottom: "1px solid var(--relay-border-hairline)",
                                  paddingTop: 12,
                                  paddingBottom: 12,
                                  backgroundColor: "var(--relay-surface-muted)",
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                  whiteSpace: "nowrap",
                                },
                                td: {
                                  fontSize: "13px",
                                  fontWeight: 400,
                                  borderBottom: "1px solid var(--relay-border-subtle)",
                                  color: "var(--relay-text-secondary)",
                                  paddingTop: 12,
                                  paddingBottom: 12,
                                  verticalAlign: "middle",
                                },
                              }}
                            >
                              <Table.Thead>
                                <Table.Tr>
                                  <Table.Th>Item</Table.Th>
                                  <Table.Th>Client</Table.Th>
                                  <Table.Th>Type</Table.Th>
                                  <Table.Th>Status</Table.Th>
                                  <Table.Th style={{ minWidth: 152 }}>Owner</Table.Th>
                                  <Table.Th>Priority</Table.Th>
                                  <Table.Th
                                    style={{
                                      textAlign: "right",
                                      minWidth: 124,
                                      paddingInlineEnd: `calc(var(--table-horizontal-spacing) + ${DUE_DATE_HEADER_CHEVRON_GUTTER_PX}px)`,
                                    }}
                                  >
                                    Due date
                                  </Table.Th>
                                  <Table.Th style={{ textAlign: "right" }}>
                                    Updated
                                  </Table.Th>
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {visibleItems.map((row) => {
                                  const isSelected = row.id === selectedId;
                                  return (
                                    <Table.Tr
                                      key={row.id}
                                      data-relay-selected={
                                        isSelected ? "true" : "false"
                                      }
                                      data-relay-created-flash={
                                        row.id === createdRowFlashId
                                          ? "true"
                                          : undefined
                                      }
                                      onClick={() => setSelectedId(row.id)}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <Table.Td>
                                        <Text
                                          fw={600}
                                          size="sm"
                                          style={{ color: "var(--relay-text-strong)" }}
                                          lineClamp={2}
                                          lh={1.4}
                                        >
                                          {row.name}
                                        </Text>
                                      </Table.Td>
                                      <Table.Td>
                                        <Text
                                          size="sm"
                                          lineClamp={2}
                                          fw={400}
                                          lh={1.4}
                                          style={{ color: "var(--relay-text-meta)" }}
                                        >
                                          {row.client}
                                        </Text>
                                      </Table.Td>
                                      <Table.Td>
                                        <Text
                                          size="sm"
                                          lineClamp={2}
                                          fw={400}
                                          lh={1.4}
                                          style={{ color: "var(--relay-text-meta)" }}
                                        >
                                          {row.type}
                                        </Text>
                                      </Table.Td>
                                      <Table.Td>
                                        <RelayInlineStatusSelect
                                          itemId={row.id}
                                          status={row.status}
                                          onChange={handleChangeStatus}
                                        />
                                      </Table.Td>
                                      <Table.Td style={{ minWidth: 152 }}>
                                        <RelayInlineOwnerSelect
                                          itemId={row.id}
                                          owner={row.owner}
                                          onChange={handleChangeOwner}
                                        />
                                      </Table.Td>
                                      <Table.Td>
                                        <RelayInlinePrioritySelect
                                          itemId={row.id}
                                          priority={row.priority}
                                          onChange={handleChangePriority}
                                        />
                                      </Table.Td>
                                      <Table.Td
                                        style={{ textAlign: "right", minWidth: 124 }}
                                      >
                                        <RelayInlineDueDatePicker
                                          itemId={row.id}
                                          dueAt={row.dueAt}
                                          onChange={handleChangeDueDate}
                                        />
                                      </Table.Td>
                                      <Table.Td style={{ textAlign: "right" }}>
                                        <Text
                                          size="xs"
                                          fw={400}
                                          style={{
                                            fontVariantNumeric: "tabular-nums",
                                            color: "var(--relay-text-meta)",
                                          }}
                                        >
                                          {formatUpdated(row.updatedAt)}
                                        </Text>
                                      </Table.Td>
                                    </Table.Tr>
                                  );
                                })}
                              </Table.Tbody>
                            </Table>
                          </Table.ScrollContainer>
                        </Box>
                      )}
                    </Stack>
                  </Paper>

                </Stack>
              </Container>
            </Box>
          </Box>{/* end scrollable content */}

          {/* Sticky detail panel — no header offset */}
          <Box
            style={{
              width: drawerOpened ? 440 : 0,
              flexShrink: 0,
              overflow: "hidden",
              transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "sticky",
              top: 0,
              height: "100dvh",
              alignSelf: "flex-start",
            }}
          >
            <Box
              style={{
                width: 440,
                height: "100%",
                overflowY: "auto",
                borderLeft: "1px solid var(--relay-border-hairline)",
                background: "var(--relay-surface-card)",
                boxShadow: "-4px 0 20px rgba(10, 30, 22, 0.04)",
              }}
            >
              {selectedRecord && (
                <DetailPanel
                  item={selectedRecord}
                  onClose={() => setSelectedId(null)}
                  onChangeStatus={handleChangeStatus}
                  onChangeOwner={handleChangeOwner}
                  onChangeDueDate={handleChangeDueDate}
                  onAddNote={handleAddNote}
                />
              )}
            </Box>
          </Box>
        </Box>{/* end flex row */}
      </AppShell.Main>

      <NewItemModal
        opened={newItemModalOpen}
        onClose={() => setNewItemModalOpen(false)}
        onCreate={handleCreateItem}
      />
    </AppShell>
  );
}
