"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faCalendarDays,
  faChevronLeft,
  faChevronRight,
  faClipboardList,
  faPenToSquare,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  Button,
  Drawer,
  Group,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useState } from "react";
import type { ItemStatus, RelayItem } from "@/lib/types";
import { OWNERS } from "@/lib/mock-data";
import {
  dateToDueIso,
  formatActivityTime,
  inputValueToDueIso,
} from "@/lib/format";
import { PriorityInline } from "@/components/priority-inline";
import { RelayPill } from "@/components/relay-pill";
import { STATUS_HELP } from "@/lib/status-help";
import { STATUS_VISUAL } from "@/components/status-styles";

const STATUS_OPTIONS: ItemStatus[] = [
  "Draft",
  "In Review",
  "Approved",
  "Blocked",
  "Complete",
];

const navIconStyle = {
  width: 14,
  height: 14,
  fontSize: 12,
  color: "#5a5349",
} as const;

const fieldIconStyle = {
  width: 15,
  height: 15,
  fontSize: 14,
  color: "var(--relay-text-meta)",
} as const;

const dueDatePickerStyles = {
  input: {
    backgroundColor: "var(--relay-input-fill)",
    border: "1px solid var(--relay-border-subtle)",
    borderRadius: "var(--mantine-radius-md)",
    color: "var(--relay-text-strong)",
    fontWeight: 500,
    minHeight: 36,
    lineHeight: 1.25,
    textAlign: "left" as const,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  calendarHeader: {
    marginBottom: 8,
    gap: 6,
    width: "100%",
    maxWidth: "100%",
  },
  calendarHeaderLevel: {
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "var(--relay-text-strong)",
    borderRadius: "var(--mantine-radius-sm)",
    flex: "1 1 auto",
    minWidth: 0,
    textAlign: "center" as const,
    "&:hover": {
      backgroundColor: "rgba(72, 62, 52, 0.06)",
    },
  },
  calendarHeaderControl: {
    border: "1px solid var(--relay-border-subtle)",
    borderRadius: "var(--mantine-radius-sm)",
    backgroundColor: "var(--relay-surface-muted)",
    color: "#5a5349",
    width: 32,
    height: 32,
    minWidth: 32,
    flexShrink: 0,
    "&:hover": {
      backgroundColor: "rgba(72, 62, 52, 0.08)",
    },
  },
  weekdaysRow: {
    width: "100%",
  },
  weekday: {
    fontSize: "0.6875rem",
    fontWeight: 600,
    color: "var(--relay-text-meta)",
    textAlign: "center" as const,
    width: "14.28%",
    maxWidth: "14.28%",
    padding: "4px 2px",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  month: {
    width: "100%",
    minWidth: 260,
    tableLayout: "fixed" as const,
    borderCollapse: "collapse" as const,
  },
  monthCell: {
    width: "14.28%",
    textAlign: "center" as const,
    padding: 2,
    verticalAlign: "middle" as const,
  },
  day: {
    width: "2.25rem",
    height: "2.25rem",
    maxWidth: "100%",
    marginInline: "auto",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "var(--relay-text-strong)",
    borderRadius: "var(--mantine-radius-sm)",
    "&:hover:not([data-disabled]):not([data-static])": {
      backgroundColor: "rgba(72, 62, 52, 0.07)",
    },
    "&[data-outside]": {
      color: "rgba(90, 83, 74, 0.42)",
    },
    "&[data-selected]": {
      backgroundColor: "var(--relay-accent-warm)",
      color: "#fdfcf9",
      fontWeight: 600,
      border: "1px solid rgba(122, 85, 62, 0.95)",
    },
    "&[data-today]:not([data-selected])": {
      border: "1px solid var(--relay-accent-warm)",
      backgroundColor: "var(--relay-surface-muted)",
    },
    "&[data-weekend]:not([data-selected]):not([data-outside])": {
      color: "#5c5349",
    },
  },
  levelsGroup: {
    width: "100%",
    maxWidth: "100%",
  },
};

type DetailDrawerProps = {
  item: RelayItem | null;
  opened: boolean;
  onClose: () => void;
  onChangeStatus: (id: string, status: ItemStatus) => void;
  onChangeOwner: (id: string, owner: string) => void;
  onChangeDueDate: (id: string, dueAt: string | null) => void;
  onAddNote: (id: string, text: string) => void;
};

export function DetailDrawer({
  item,
  opened,
  onClose,
  onChangeStatus,
  onChangeOwner,
  onChangeDueDate,
  onAddNote,
}: DetailDrawerProps) {
  const [noteDraft, setNoteDraft] = useState("");

  const handleAddNote = () => {
    if (!item) return;
    const t = noteDraft.trim();
    if (!t) return;
    onAddNote(item.id, t);
    setNoteDraft("");
  };

  if (!item) return null;

  const activitySorted = [...item.activity].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={440}
      padding="lg"
      withOverlay
      overlayProps={{ opacity: 0.2, blur: 0 }}
      styles={{
        content: {
          backgroundColor: "var(--relay-surface-card)",
          boxShadow: "var(--relay-drawer-shadow)",
          borderLeft: "1px solid var(--relay-border-hairline)",
        },
        header: { marginBottom: 0 },
        body: { paddingTop: 8 },
      }}
      title={
        <Stack gap="sm" pr="md">
          <Text
            size="xs"
            fw={500}
            tt="uppercase"
            lts={0.5}
            style={{ color: "var(--relay-text-meta)" }}
          >
            Review details
          </Text>
          <Title
            order={3}
            fw={600}
            lh={1.35}
            style={{ color: "var(--relay-text-strong)", fontSize: "1.125rem" }}
          >
            {item.name}
          </Title>
          <Group gap="md" align="center">
            <Tooltip label={STATUS_HELP[item.status]} multiline w={280} withArrow>
              <Box component="span" style={{ cursor: "help" }}>
                <RelayPill {...STATUS_VISUAL[item.status]}>
                  {item.status}
                </RelayPill>
              </Box>
            </Tooltip>
            <PriorityInline priority={item.priority} />
          </Group>
        </Stack>
      }
    >
      <Stack gap={32} pb="xl">
        <Box>
          <Group gap={8} mb={10}>
            <FontAwesomeIcon icon={faBuilding} style={fieldIconStyle} />
            <Text
              size="xs"
              fw={500}
              tt="uppercase"
              lts={0.04}
              style={{ color: "var(--relay-text-meta)" }}
            >
              Client
            </Text>
          </Group>
          <Text
            size="sm"
            fw={500}
            lh={1.55}
            style={{ color: "var(--relay-text-secondary)" }}
          >
            {item.client}
          </Text>
        </Box>

        <Box>
          <Group gap={8} mb={10}>
            <FontAwesomeIcon icon={faUser} style={fieldIconStyle} />
            <Text
              size="xs"
              fw={500}
              tt="uppercase"
              lts={0.04}
              style={{ color: "var(--relay-text-meta)" }}
            >
              Assigned to
            </Text>
          </Group>
          <Select
            data={[...OWNERS]}
            value={item.owner}
            onChange={(v) => v && onChangeOwner(item.id, v)}
            allowDeselect={false}
            size="sm"
            styles={{
              input: {
                backgroundColor: "var(--relay-input-fill)",
                border: "1px solid var(--relay-border-subtle)",
              },
            }}
          />
        </Box>

        <Box>
          <Group gap={8} mb={10}>
            <FontAwesomeIcon icon={faCalendarDays} style={fieldIconStyle} />
            <Text
              size="xs"
              fw={500}
              tt="uppercase"
              lts={0.04}
              style={{ color: "var(--relay-text-meta)" }}
            >
              Due date
            </Text>
          </Group>
          <DatePickerInput
            placeholder="Select date"
            value={item.dueAt ? item.dueAt.slice(0, 10) : null}
            onChange={(d) => {
              if (!d) onChangeDueDate(item.id, null);
              else if (typeof d === "string")
                onChangeDueDate(item.id, inputValueToDueIso(d.slice(0, 10)));
              else onChangeDueDate(item.id, dateToDueIso(d));
            }}
            valueFormat="MM/DD/YYYY"
            size="sm"
            clearable
            highlightToday
            weekdayFormat="ddd"
            previousIcon={
              <FontAwesomeIcon icon={faChevronLeft} style={navIconStyle} />
            }
            nextIcon={
              <FontAwesomeIcon icon={faChevronRight} style={navIconStyle} />
            }
            popoverProps={{
              width: "max-content",
              position: "bottom-start",
              shadow: "md",
              styles: {
                dropdown: {
                  width: "max-content",
                  maxWidth: "calc(100vw - 2rem)",
                  padding: "var(--mantine-spacing-md)",
                  backgroundColor: "var(--relay-surface-raised)",
                  border: "1px solid var(--relay-border-hairline)",
                  borderRadius: "var(--mantine-radius-md)",
                  boxShadow: "var(--relay-card-shadow)",
                },
              },
            }}
            clearButtonProps={{
              style: { color: "var(--relay-text-meta)" },
            }}
            styles={dueDatePickerStyles}
          />
        </Box>

        {item.summary.trim() ? (
          <Box>
            <Group gap={8} mb={10}>
              <FontAwesomeIcon icon={faClipboardList} style={fieldIconStyle} />
              <Text
                size="xs"
                fw={500}
                tt="uppercase"
                lts={0.04}
                style={{ color: "var(--relay-text-meta)" }}
              >
                Summary
              </Text>
            </Group>
            <Text
              size="sm"
              lh={1.65}
              fw={400}
              style={{ color: "var(--relay-text-secondary)" }}
            >
              {item.summary}
            </Text>
          </Box>
        ) : null}

        <Box>
          <Text
            size="xs"
            fw={500}
            tt="uppercase"
            lts={0.04}
            mb="sm"
            style={{ color: "var(--relay-text-meta)" }}
          >
            Change status
          </Text>
          <Select
            data={STATUS_OPTIONS}
            value={item.status}
            onChange={(v) => v && onChangeStatus(item.id, v as ItemStatus)}
            allowDeselect={false}
            size="sm"
            styles={{
              input: {
                backgroundColor: "var(--relay-input-fill)",
                border: "1px solid var(--relay-border-subtle)",
              },
            }}
          />
        </Box>

        <Box>
          <Group gap={8} mb="sm">
            <FontAwesomeIcon icon={faPenToSquare} style={fieldIconStyle} />
            <Text
              size="xs"
              fw={500}
              tt="uppercase"
              lts={0.04}
              style={{ color: "var(--relay-text-meta)" }}
            >
              Activity
            </Text>
          </Group>
          <ScrollArea.Autosize mah={280} type="auto" offsetScrollbars>
            <Stack gap="lg">
              {activitySorted.map((entry, idx) => (
                <Box
                  key={entry.id}
                  style={{
                    paddingBottom: idx < activitySorted.length - 1 ? 14 : 0,
                    marginBottom: idx < activitySorted.length - 1 ? 14 : 0,
                    borderBottom:
                      idx < activitySorted.length - 1
                        ? "1px solid var(--relay-border-subtle)"
                        : undefined,
                  }}
                >
                  <Text
                    size="xs"
                    mb={6}
                    fw={400}
                    style={{ color: "var(--relay-text-meta)", fontSize: "0.6875rem" }}
                  >
                    {formatActivityTime(entry.at)}
                    {entry.kind === "note" ? " · Note" : " · Update"}
                  </Text>
                  <Text
                    size="sm"
                    lh={1.55}
                    fw={500}
                    style={{ color: "var(--relay-text-strong)" }}
                  >
                    {entry.text}
                  </Text>
                </Box>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        </Box>

        <Box>
          <Text
            size="xs"
            fw={500}
            tt="uppercase"
            lts={0.04}
            mb="sm"
            style={{ color: "var(--relay-text-meta)" }}
          >
            Add note
          </Text>
          <Textarea
            placeholder="Share context for the team…"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.currentTarget.value)}
            minRows={3}
            size="sm"
            styles={{
              input: {
                backgroundColor: "var(--relay-input-fill)",
                border: "1px solid var(--relay-border-subtle)",
              },
            }}
          />
          <Group justify="flex-end" mt="sm">
            <Button
              variant="default"
              size="sm"
              radius="md"
              onClick={handleAddNote}
              disabled={!noteDraft.trim()}
            >
              Add note
            </Button>
          </Group>
        </Box>
      </Stack>
    </Drawer>
  );
}
