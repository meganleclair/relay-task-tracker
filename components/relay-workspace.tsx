"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCircleCheck,
  faClipboardList,
  faInbox,
  faMagnifyingGlass,
  faRightFromBracket,
  faStopwatch,
} from "@fortawesome/free-solid-svg-icons";
import {
  AppShell,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Menu,
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
  DASHBOARD_AS_OF_MS,
  getActivityWeekStats,
  QUEUE_WEEKDAY_LABELS,
} from "@/lib/dashboard-mock";
import { formatDueDate, formatUpdated } from "@/lib/format";
import { DetailDrawer } from "@/components/detail-drawer";
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
const WEEKDAY_BAR_STYLES: { fill: string; border: string }[] = [
  { fill: "rgba(154, 107, 79, 0.28)", border: "rgba(154, 107, 79, 0.42)" },
  { fill: "rgba(72, 125, 98, 0.26)", border: "rgba(56, 105, 82, 0.38)" },
  { fill: "rgba(70, 118, 155, 0.26)", border: "rgba(52, 95, 130, 0.36)" },
  { fill: "rgba(118, 86, 168, 0.24)", border: "rgba(98, 72, 148, 0.34)" },
  { fill: "rgba(175, 125, 72, 0.26)", border: "rgba(145, 100, 55, 0.38)" },
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

function metricCardSurface(active: boolean) {
  return {
    ...panelSurface,
    cursor: "pointer" as const,
    transition: "box-shadow 0.15s ease, background-color 0.15s ease",
    background: active
      ? "var(--relay-surface-muted)"
      : panelSurface.background,
    boxShadow: active
      ? "0 2px 12px rgba(44, 40, 36, 0.09), 0 0 0 1px var(--relay-border-subtle)"
      : panelSurface.boxShadow,
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

function StatGlyph({ icon }: { icon: IconDefinition }) {
  return (
    <Box
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        flexShrink: 0,
        backgroundColor: "var(--relay-surface-muted)",
        border: "1px solid var(--relay-border-subtle)",
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
          color: "var(--relay-text-meta)",
          opacity: 0.85,
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
          <Title order={2} size="h3" fw={600} c="warmGray.9">
            {"You're signed out"}
          </Title>
          <Text
            size="sm"
            lh={1.55}
            style={{ color: "var(--relay-text-secondary)" }}
          >
            Sign back in to open your Relay workspace. This demo remembers your
            choice in the browser on this device.
          </Text>
          <Button onClick={onSignIn} radius="md" color="sage">
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
    const weekAgo = DASHBOARD_AS_OF_MS - msDays(7);
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

  if (!sessionSignedIn) {
    return <RelaySignedOutScreen onSignIn={handleSignIn} />;
  }

  return (
    <AppShell
      header={{ height: 64 }}
      padding={0}
      styles={{
        root: { background: "var(--relay-bg)" },
        main: {
          background: "transparent",
          paddingTop: 0,
          paddingBottom: "2.5rem",
        },
        header: {
          background: "var(--relay-surface-card)",
          borderBottom: "1px solid var(--relay-border-subtle)",
          boxShadow: "var(--relay-header-shadow)",
          overflow: "visible",
        },
      }}
    >
      <AppShell.Header>
        <Container
          size="xl"
          h="100%"
          px={{ base: "md", sm: "xl" }}
          styles={{
            root: {
              display: "flex",
              alignItems: "center",
              boxSizing: "border-box",
            },
          }}
        >
          <Group
            w="100%"
            justify="space-between"
            align="center"
            wrap="nowrap"
            gap="md"
          >
            <Group gap="md" wrap="nowrap" align="center" style={{ minWidth: 0 }}>
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--mantine-radius-md)",
                  flexShrink: 0,
                  backgroundColor: "var(--relay-surface-muted)",
                  border: "1px solid var(--relay-border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text fw={700} c="warmGray.8" size="sm" lts="-0.03em">
                  R
                </Text>
              </Box>
              <Title
                order={1}
                fw={600}
                c="warmGray.9"
                lts="-0.02em"
                lh={1.2}
                style={{ flexShrink: 0, fontSize: "1.375rem" }}
              >
                Relay
              </Title>
            </Group>
            <TextInput
              placeholder="Search name, client, or type…"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.currentTarget.value)}
              leftSection={
                <FontAwesomeIcon icon={faMagnifyingGlass} style={searchIconStyle} />
              }
              flex={1}
              maw={420}
              miw={160}
              visibleFrom="xs"
              radius="md"
              size="sm"
              styles={searchInputShell}
            />
            <Menu
              shadow="md"
              width={260}
              position="bottom-end"
              withinPortal
              zIndex={500}
              transitionProps={{ transition: "pop", duration: 120 }}
            >
              <Menu.Target>
                <UnstyledButton
                  aria-label="Open account menu"
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    padding: 0,
                    lineHeight: 0,
                    cursor: "pointer",
                  }}
                >
                  <Avatar
                    radius="md"
                    color="sage"
                    variant="light"
                    size="md"
                    style={{
                      border: "1px solid var(--relay-border-subtle)",
                    }}
                  >
                    {displayNameInitials(CURRENT_USER)}
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label
                  fw={600}
                  style={{ color: "var(--relay-text-strong)" }}
                >
                  {CURRENT_USER}
                </Menu.Label>
                <Menu.Divider />
                <Menu.Item
                  leftSection={
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      style={{
                        width: 14,
                        height: 14,
                        fontSize: 13,
                      }}
                    />
                  }
                  color="red"
                  onClick={handleSignOut}
                >
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Box
          style={{
            background: "var(--relay-bg-gradient)",
            minHeight: "calc(100vh - 64px)",
            paddingTop:
              "max(2rem, calc(1rem + env(safe-area-inset-top, 0px)))",
          }}
          pb="xl"
        >
          <Container size="xl" px={{ base: "md", sm: "xl" }} pt="sm">
            <Stack gap={40}>
              <Stack gap="lg">
                <Text
                  size="xs"
                  c="dimmed"
                  fw={400}
                  maw={640}
                  lh={1.55}
                  style={{ color: "var(--relay-text-meta)" }}
                >
                  Track progress, unblock work, and keep things moving.
                </Text>
                <Group gap="sm" align="center" wrap="wrap">
                  <Title order={2} size="h2" fw={600} c="warmGray.9">
                    {"Your team's queue"}
                  </Title>
                  <Badge
                    variant="light"
                    color="gray"
                    size="sm"
                    radius="md"
                    fw={500}
                    styles={{
                      root: { textTransform: "none", letterSpacing: "normal" },
                    }}
                    leftSection={
                      <Box
                        component="span"
                        className="relay-header-live-dot"
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          flexShrink: 0,
                          alignSelf: "center",
                        }}
                      />
                    }
                  >
                    Updated just now
                  </Badge>
                </Group>
              </Stack>

              <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="lg">
                <UnstyledButton
                  type="button"
                  aria-pressed={statusFilter === "In Review"}
                  onClick={() => toggleMetricStatusFilter("In Review")}
                  style={{
                    width: "100%",
                    padding: 0,
                    border: "none",
                    background: "none",
                    textAlign: "left" as const,
                  }}
                >
                  <Paper
                    radius="md"
                    p={{ base: "md", sm: "lg" }}
                    style={metricCardSurface(statusFilter === "In Review")}
                  >
                    <Stack gap="sm">
                      <Text
                        fw={700}
                        lh={1.05}
                        style={{
                          color: "var(--relay-text-strong)",
                          fontSize: "1.875rem",
                        }}
                      >
                        {summary.inReview}
                      </Text>
                      <Group gap="sm" align="center" wrap="nowrap">
                        <StatGlyph icon={faClipboardList} />
                        <Text
                          size="xs"
                          fw={500}
                          tt="uppercase"
                          lts={0.5}
                          style={{ color: "var(--relay-text-meta)" }}
                        >
                          In review
                        </Text>
                      </Group>
                      <Text
                        size="xs"
                        fw={400}
                        lh={1.5}
                        style={{ color: "var(--relay-text-meta)" }}
                      >
                        Active decisions
                      </Text>
                    </Stack>
                  </Paper>
                </UnstyledButton>
                <UnstyledButton
                  type="button"
                  aria-pressed={statusFilter === "Blocked"}
                  onClick={() => toggleMetricStatusFilter("Blocked")}
                  style={{
                    width: "100%",
                    padding: 0,
                    border: "none",
                    background: "none",
                    textAlign: "left" as const,
                  }}
                >
                  <Paper
                    radius="md"
                    p={{ base: "md", sm: "lg" }}
                    style={metricCardSurface(statusFilter === "Blocked")}
                  >
                    <Stack gap="sm">
                      <Text
                        fw={700}
                        lh={1.05}
                        style={{
                          color: "var(--relay-text-strong)",
                          fontSize: "1.875rem",
                        }}
                      >
                        {summary.blocked}
                      </Text>
                      <Group gap="sm" align="center" wrap="nowrap">
                        <StatGlyph icon={faBan} />
                        <Text
                          size="xs"
                          fw={500}
                          tt="uppercase"
                          lts={0.5}
                          style={{ color: "var(--relay-text-meta)" }}
                        >
                          Blocked
                        </Text>
                      </Group>
                      <Text
                        size="xs"
                        fw={400}
                        lh={1.5}
                        style={{ color: "var(--relay-text-meta)" }}
                      >
                        Needs input to unblock
                      </Text>
                    </Stack>
                  </Paper>
                </UnstyledButton>
                <UnstyledButton
                  type="button"
                  aria-pressed={statusFilter === "Complete"}
                  onClick={() => toggleMetricStatusFilter("Complete")}
                  style={{
                    width: "100%",
                    padding: 0,
                    border: "none",
                    background: "none",
                    textAlign: "left" as const,
                  }}
                >
                  <Paper
                    radius="md"
                    p={{ base: "md", sm: "lg" }}
                    style={metricCardSurface(statusFilter === "Complete")}
                  >
                    <Stack gap="sm">
                      <Text
                        fw={700}
                        lh={1.05}
                        style={{
                          color: "var(--relay-text-strong)",
                          fontSize: "1.875rem",
                        }}
                      >
                        {summary.completedThisWeek}
                      </Text>
                      <Group gap="sm" align="center" wrap="nowrap">
                        <StatGlyph icon={faCircleCheck} />
                        <Text
                          size="xs"
                          fw={500}
                          tt="uppercase"
                          lts={0.5}
                          style={{ color: "var(--relay-text-meta)" }}
                        >
                          Completed
                        </Text>
                      </Group>
                      <Text
                        size="xs"
                        fw={400}
                        lh={1.5}
                        style={{ color: "var(--relay-text-meta)" }}
                      >
                        Closed in the last week
                      </Text>
                    </Stack>
                  </Paper>
                </UnstyledButton>
                <Paper radius="md" p={{ base: "md", sm: "lg" }} style={panelSurface}>
                  <Stack gap="sm">
                    <Group gap={8} align="baseline" wrap="nowrap">
                      <Text
                        fw={700}
                        lh={1.05}
                        style={{ color: "var(--relay-text-strong)", fontSize: "1.875rem" }}
                      >
                        {AVG_TURNAROUND_DAYS_MOCK}
                      </Text>
                      <Text
                        size="xs"
                        fw={500}
                        style={{ color: "var(--relay-text-meta)" }}
                      >
                        days
                      </Text>
                    </Group>
                    <Group gap="sm" align="center" wrap="nowrap">
                      <StatGlyph icon={faStopwatch} />
                      <Text
                        size="xs"
                        fw={500}
                        tt="uppercase"
                        lts={0.5}
                        style={{ color: "var(--relay-text-meta)" }}
                      >
                        Avg. turnaround
                      </Text>
                    </Group>
                    <Text
                      size="xs"
                      fw={400}
                      lh={1.5}
                      style={{ color: "var(--relay-text-meta)" }}
                    >
                      Rolling average
                    </Text>
                  </Stack>
                </Paper>
              </SimpleGrid>

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
                      const barH = 10 + pct * 44;
                      const fill = WEEKDAY_BAR_STYLES[i]?.fill ?? "rgba(72, 62, 52, 0.09)";
                      const border = WEEKDAY_BAR_STYLES[i]?.border ?? "var(--relay-border-subtle)";
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
                                ? "rgba(72, 62, 52, 0.05)"
                                : "transparent",
                              boxShadow: selected
                                ? "0 2px 10px rgba(44, 40, 36, 0.08)"
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
                                  height: 72,
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
                                    borderRadius: "var(--mantine-radius-md)",
                                    backgroundColor: fill,
                                    border: `1px solid ${border}`,
                                    filter:
                                      hovered && !selected
                                        ? "brightness(0.92)"
                                        : selected
                                          ? "saturate(1.08)"
                                          : undefined,
                                    transform: selected
                                      ? "scale(1.04)"
                                      : undefined,
                                    transition:
                                      "filter 0.12s ease, transform 0.12s ease",
                                    boxShadow: selected
                                      ? "0 1px 4px rgba(44, 40, 36, 0.12)"
                                      : undefined,
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
                        No items match your filters
                      </Title>
                      <Text
                        size="xs"
                        ta="center"
                        maw={360}
                        fw={400}
                        style={{ color: "var(--relay-text-meta)" }}
                      >
                        {!filtersActive
                          ? "The queue is empty."
                          : activityWeekdayFilter !== null
                            ? "Try clearing the day filter or loosening other filters."
                            : "Try Reset filters in the toolbar or adjust search."}
                      </Text>
                      {activityWeekdayFilter !== null && (
                        <Button
                          variant="default"
                          size="xs"
                          radius="md"
                          onClick={clearActivityDayFilter}
                        >
                          Clear day filter
                        </Button>
                      )}
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
      </AppShell.Main>

      <DetailDrawer
        item={selectedRecord}
        opened={drawerOpened}
        onClose={() => setSelectedId(null)}
        onChangeStatus={handleChangeStatus}
        onChangeOwner={handleChangeOwner}
        onChangeDueDate={handleChangeDueDate}
        onAddNote={handleAddNote}
      />
    </AppShell>
  );
}
