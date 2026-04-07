"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Box, Select, Tooltip } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useCallback, useState, type CSSProperties } from "react";
import type { ItemStatus, Priority } from "@/lib/types";
import { OWNERS } from "@/lib/mock-data";
import { STATUS_HELP } from "@/lib/status-help";
import {
  PRIORITY_BADGE_TABLE,
  STATUS_BADGE_TABLE,
} from "@/components/status-styles";
import {
  dateToDueIso,
  inputValueToDueIso,
} from "@/lib/format";

const STATUS_OPTIONS: ItemStatus[] = [
  "Draft",
  "In Review",
  "Approved",
  "Blocked",
  "Complete",
];

const PRIORITY_OPTIONS: Priority[] = ["Low", "Medium", "High"];

const navIconStyle = {
  width: 12,
  height: 12,
  fontSize: 11,
  color: "#5a5349",
} as const;

const INLINE_FIELD_CLASS = "relay-inline-field";

/** Mantine `rightSectionWidth` — space for custom chevron (px). */
const RELAY_INLINE_CHEVRON_SLOT_PX = 28;

const inlineComboboxDropdown = {
  border: "none",
  borderRadius: "var(--mantine-radius-md)",
  backgroundColor: "var(--relay-surface-raised)",
  padding: 4,
  minWidth: 240,
  boxShadow:
    "0 4px 20px rgba(44, 40, 36, 0.08), 0 0 0 1px rgba(72, 62, 52, 0.05)",
};

const inlineSelectComboboxProps = {
  withinPortal: true,
  offset: 4,
  width: 260,
  styles: { dropdown: inlineComboboxDropdown },
} as const;

function InlineChevron({ style }: { style?: CSSProperties }) {
  return (
    <Box
      component="span"
      data-relay-inline-chevron
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: RELAY_INLINE_CHEVRON_SLOT_PX,
        height: RELAY_INLINE_CHEVRON_SLOT_PX,
        flexShrink: 0,
        ...style,
      }}
    >
      <FontAwesomeIcon
        icon={faChevronDown}
        style={{
          width: 10,
          height: 10,
          fontSize: 10,
          color: "currentColor",
        }}
      />
    </Box>
  );
}

const inlineSelectInputStyles = {
  root: {
    cursor: "pointer",
    width: "100%",
    minWidth: 0,
  },
  input: {
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.4,
    color: "var(--relay-text-secondary)",
    backgroundColor: "transparent",
    border: "1px solid transparent",
    minHeight: 28,
    height: 28,
    paddingTop: 0,
    paddingBottom: 0,
    paddingInlineStart: 6,
    textAlign: "left" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    transition:
      "background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
    "&:hover": {
      backgroundColor: "var(--relay-table-row-hover)",
      boxShadow: "inset 0 0 0 1px rgba(72, 62, 52, 0.06)",
    },
    "&:focus, &[data-expanded]": {
      backgroundColor: "var(--relay-surface-raised)",
      borderColor: "rgba(72, 62, 52, 0.12)",
      boxShadow:
        "0 0 0 1px rgba(154, 107, 79, 0.28), 0 1px 4px rgba(44, 40, 36, 0.06)",
    },
  },
} as const;

type StatusPriorityTint = {
  background: string;
  color: string;
  border: string;
};

function optionPillStyle(v: StatusPriorityTint): CSSProperties {
  return {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "var(--mantine-radius-sm)",
    background: v.background,
    color: v.color,
    border: `1px solid ${v.border}`,
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.35,
  };
}

function tintedInlineSelectStyles(v: StatusPriorityTint) {
  return {
    root: inlineSelectInputStyles.root,
    input: {
      ...inlineSelectInputStyles.input,
      color: v.color,
      backgroundColor: v.background,
      border: `1px solid ${v.border}`,
      fontWeight: 500,
      "&:hover": {
        boxShadow: "inset 0 0 0 1px rgba(72, 62, 52, 0.1)",
        filter: "brightness(0.98)",
      },
      "&:focus, &[data-expanded]": {
        filter: "none",
        boxShadow:
          "0 0 0 1px rgba(154, 107, 79, 0.28), 0 1px 4px rgba(44, 40, 36, 0.06)",
        borderColor: v.border,
        backgroundColor: v.background,
        color: v.color,
      },
    },
  };
}

function useInlineSelectionFlash() {
  const [flashing, setFlashing] = useState(false);
  const triggerFlash = useCallback(() => {
    setFlashing(true);
    window.setTimeout(() => setFlashing(false), 145);
  }, []);
  return { flashing, triggerFlash };
}

function inlineFieldClassName(flashing: boolean) {
  return flashing
    ? `${INLINE_FIELD_CLASS} ${INLINE_FIELD_CLASS}--flash`
    : INLINE_FIELD_CLASS;
}

const tableDuePickerStyles = {
  root: {
    cursor: "pointer",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
  },
  wrapper: {
    width: "100%",
    // Mantine defaults to 1px; flush chevron to match table cell padding edge.
    ["--right-section-end" as string]: "0px",
  },
  input: {
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.4,
    color: "var(--relay-text-secondary)",
    backgroundColor: "transparent",
    border: "1px solid transparent",
    borderRadius: "var(--mantine-radius-sm)",
    minHeight: 28,
    height: 28,
    paddingTop: 0,
    paddingBottom: 0,
    paddingInlineStart: 6,
    width: "100%",
    minWidth: 0,
    textAlign: "right" as const,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    transition:
      "background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
    "&:hover": {
      backgroundColor: "var(--relay-table-row-hover)",
      boxShadow: "inset 0 0 0 1px rgba(72, 62, 52, 0.06)",
    },
    "&:focus": {
      backgroundColor: "var(--relay-surface-raised)",
      borderColor: "rgba(72, 62, 52, 0.12)",
      boxShadow:
        "0 0 0 1px rgba(154, 107, 79, 0.28), 0 1px 4px rgba(44, 40, 36, 0.06)",
    },
  },
  calendarHeader: {
    marginBottom: 8,
    gap: 6,
    width: "100%",
    maxWidth: "100%",
  },
  calendarHeaderLevel: {
    fontSize: "0.75rem",
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
    width: 28,
    height: 28,
    minWidth: 28,
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
    fontSize: "0.75rem",
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
  },
  levelsGroup: { width: "100%", maxWidth: "100%" },
};

function stopRowActivate(e: React.SyntheticEvent) {
  e.stopPropagation();
}

type InlineStatusProps = {
  itemId: string;
  status: ItemStatus;
  onChange: (id: string, status: ItemStatus) => void;
};

export function RelayInlineStatusSelect({
  itemId,
  status,
  onChange,
}: InlineStatusProps) {
  const { flashing, triggerFlash } = useInlineSelectionFlash();
  const tint = STATUS_BADGE_TABLE[status];
  const selectStyles = tintedInlineSelectStyles(tint);
  return (
    <Box
      className={inlineFieldClassName(flashing)}
      onClick={stopRowActivate}
      onMouseDown={stopRowActivate}
      style={{ width: "100%", minWidth: 0, display: "block" }}
    >
      <Tooltip label={STATUS_HELP[status]} multiline w={260} position="top" withArrow>
        <Box style={{ width: "100%", minWidth: 0 }}>
          <Select
            size="xs"
            data={STATUS_OPTIONS}
            value={status}
            onChange={(v) => {
              if (!v) return;
              onChange(itemId, v as ItemStatus);
              triggerFlash();
            }}
            allowDeselect={false}
            radius="sm"
            comboboxProps={inlineSelectComboboxProps}
            styles={selectStyles}
            withCheckIcon={false}
            renderOption={({ option }) => (
              <Box
                component="span"
                style={optionPillStyle(
                  STATUS_BADGE_TABLE[option.value as ItemStatus],
                )}
              >
                {option.label}
              </Box>
            )}
            rightSectionWidth={RELAY_INLINE_CHEVRON_SLOT_PX}
            rightSection={<InlineChevron style={{ color: tint.color }} />}
            rightSectionPointerEvents="none"
          />
        </Box>
      </Tooltip>
    </Box>
  );
}

type InlinePriorityProps = {
  itemId: string;
  priority: Priority;
  onChange: (id: string, priority: Priority) => void;
};

export function RelayInlinePrioritySelect({
  itemId,
  priority,
  onChange,
}: InlinePriorityProps) {
  const { flashing, triggerFlash } = useInlineSelectionFlash();
  const tint = PRIORITY_BADGE_TABLE[priority];
  const selectStyles = tintedInlineSelectStyles(tint);
  return (
    <Box
      className={inlineFieldClassName(flashing)}
      onClick={stopRowActivate}
      onMouseDown={stopRowActivate}
      style={{ width: "100%", minWidth: 0, display: "block" }}
    >
      <Select
        size="xs"
        data={PRIORITY_OPTIONS}
        value={priority}
        onChange={(v) => {
          if (!v) return;
          onChange(itemId, v as Priority);
          triggerFlash();
        }}
        allowDeselect={false}
        radius="sm"
        comboboxProps={inlineSelectComboboxProps}
        styles={selectStyles}
        withCheckIcon={false}
        renderOption={({ option }) => (
          <Box
            component="span"
            style={optionPillStyle(
              PRIORITY_BADGE_TABLE[option.value as Priority],
            )}
          >
            {option.label}
          </Box>
        )}
        rightSectionWidth={RELAY_INLINE_CHEVRON_SLOT_PX}
        rightSection={<InlineChevron style={{ color: tint.color }} />}
        rightSectionPointerEvents="none"
      />
    </Box>
  );
}

type InlineOwnerProps = {
  itemId: string;
  owner: string;
  onChange: (id: string, owner: string) => void;
};

export function RelayInlineOwnerSelect({
  itemId,
  owner,
  onChange,
}: InlineOwnerProps) {
  const { flashing, triggerFlash } = useInlineSelectionFlash();
  return (
    <Box
      className={inlineFieldClassName(flashing)}
      onClick={stopRowActivate}
      onMouseDown={stopRowActivate}
      style={{ width: "100%", minWidth: 0, display: "block" }}
    >
      <Select
        size="xs"
        data={[...OWNERS]}
        value={owner}
        onChange={(v) => {
          if (!v) return;
          onChange(itemId, v);
          triggerFlash();
        }}
        allowDeselect={false}
        radius="sm"
        comboboxProps={inlineSelectComboboxProps}
        styles={inlineSelectInputStyles}
        withCheckIcon={false}
        rightSectionWidth={RELAY_INLINE_CHEVRON_SLOT_PX}
        rightSection={<InlineChevron />}
        rightSectionPointerEvents="none"
      />
    </Box>
  );
}

type InlineDueProps = {
  itemId: string;
  dueAt: string | null;
  onChange: (id: string, dueAt: string | null) => void;
};

export function RelayInlineDueDatePicker({
  itemId,
  dueAt,
  onChange,
}: InlineDueProps) {
  const { flashing, triggerFlash } = useInlineSelectionFlash();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Box
      className={inlineFieldClassName(flashing)}
      data-relay-picker-open={pickerOpen ? "true" : undefined}
      onClick={stopRowActivate}
      onMouseDown={stopRowActivate}
      style={{
        display: "block",
        width: "100%",
        minWidth: 0,
      }}
    >
      <DatePickerInput
        placeholder="—"
        value={dueAt ? dueAt.slice(0, 10) : null}
        onChange={(d) => {
          if (!d) onChange(itemId, null);
          else if (typeof d === "string")
            onChange(itemId, inputValueToDueIso(d.slice(0, 10)));
          else onChange(itemId, dateToDueIso(d));
          triggerFlash();
        }}
        valueFormat="MM/DD/YY"
        size="xs"
        clearable={false}
        allowDeselect
        highlightToday
        weekdayFormat="ddd"
        radius="sm"
        previousIcon={
          <FontAwesomeIcon icon={faChevronLeft} style={navIconStyle} />
        }
        nextIcon={
          <FontAwesomeIcon icon={faChevronRight} style={navIconStyle} />
        }
        onDropdownClose={() => setPickerOpen(false)}
        popoverProps={{
          width: 280,
          position: "bottom-end",
          offset: 4,
          withinPortal: true,
          zIndex: 400,
          onOpen: () => setPickerOpen(true),
          styles: {
            dropdown: {
              maxWidth: "min(280px, calc(100vw - 2rem))",
              padding: "var(--mantine-spacing-sm)",
              backgroundColor: "var(--relay-surface-raised)",
              border: "none",
              borderRadius: "var(--mantine-radius-md)",
              boxShadow:
                "0 6px 28px rgba(44, 40, 36, 0.1), 0 0 0 1px rgba(72, 62, 52, 0.05)",
              zIndex: 400,
              isolation: "isolate",
            },
          },
        }}
        styles={{
          ...tableDuePickerStyles,
          input: {
            ...tableDuePickerStyles.input,
            ...(pickerOpen
              ? {
                  backgroundColor: "var(--relay-surface-raised)",
                  borderColor: "rgba(72, 62, 52, 0.12)",
                  boxShadow:
                    "0 0 0 1px rgba(154, 107, 79, 0.28), 0 1px 4px rgba(44, 40, 36, 0.06)",
                }
              : {}),
          },
        }}
        rightSectionWidth={RELAY_INLINE_CHEVRON_SLOT_PX}
        rightSection={<InlineChevron />}
        rightSectionPointerEvents="none"
      />
    </Box>
  );
}
