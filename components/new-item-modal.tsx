"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useEffect, useState } from "react";
import type { ItemType, Priority } from "@/lib/types";
import { ITEM_TYPES, OWNERS } from "@/lib/mock-data";
import { dateToDueIso, inputValueToDueIso } from "@/lib/format";

const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

const navIconStyle = {
  width: 12,
  height: 12,
  fontSize: 11,
  color: "#5a5349",
} as const;

const shellInputStyles = {
  input: {
    backgroundColor: "var(--relay-input-fill)",
    border: "1px solid var(--relay-border-subtle)",
  },
} as const;

export type NewItemFormValues = {
  name: string;
  client: string;
  type: ItemType;
  owner: string;
  priority: Priority;
  dueAt: string | null;
  summary: string;
};

type NewItemModalProps = {
  opened: boolean;
  onClose: () => void;
  onCreate: (values: NewItemFormValues) => void;
};

export function NewItemModal({ opened, onClose, onCreate }: NewItemModalProps) {
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [type, setType] = useState<ItemType>("Application Review");
  const [owner, setOwner] = useState<string>(OWNERS[0]);
  const [priority, setPriority] = useState<Priority>("Medium");
  const [dueYmd, setDueYmd] = useState<string | null>(null);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (!opened) return;
    setName("");
    setClient("");
    setType("Application Review");
    setOwner(OWNERS[0]);
    setPriority("Medium");
    setDueYmd(null);
    setSummary("");
  }, [opened]);

  const canSave =
    name.trim().length > 0 && client.trim().length > 0;

  const handleSubmit = () => {
    if (!canSave) return;
    let dueAt: string | null = null;
    if (dueYmd) dueAt = inputValueToDueIso(dueYmd.slice(0, 10));
    onCreate({
      name: name.trim(),
      client: client.trim(),
      type,
      owner,
      priority,
      dueAt,
      summary: summary.trim(),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="md" style={{ color: "var(--relay-text-strong)" }}>
          New item
        </Text>
      }
      radius="md"
      centered
      size="md"
      padding="lg"
      styles={{
        content: {
          backgroundColor: "var(--relay-surface-card)",
        },
        header: {
          borderBottom: "1px solid var(--relay-border-hairline)",
          marginBottom: 0,
          paddingBottom: "var(--mantine-spacing-sm)",
        },
        body: { paddingTop: "var(--mantine-spacing-md)" },
      }}
    >
      <Stack gap="sm">
        <TextInput
          label="Item name"
          placeholder="Short title"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          size="sm"
          radius="md"
          styles={shellInputStyles}
        />
        <TextInput
          label="Client"
          placeholder="Account or insured"
          value={client}
          onChange={(e) => setClient(e.currentTarget.value)}
          required
          size="sm"
          radius="md"
          styles={shellInputStyles}
        />
        <Select
          label="Type"
          data={[...ITEM_TYPES]}
          value={type}
          onChange={(v) => v && setType(v as ItemType)}
          allowDeselect={false}
          size="sm"
          radius="md"
          comboboxProps={{ withinPortal: true, zIndex: 600 }}
          styles={shellInputStyles}
        />
        <Select
          label="Owner"
          data={[...OWNERS]}
          value={owner}
          onChange={(v) => v && setOwner(v)}
          allowDeselect={false}
          size="sm"
          radius="md"
          comboboxProps={{ withinPortal: true, zIndex: 600 }}
          styles={shellInputStyles}
        />
        <Select
          label="Priority"
          data={[...PRIORITIES]}
          value={priority}
          onChange={(v) => v && setPriority(v as Priority)}
          allowDeselect={false}
          size="sm"
          radius="md"
          comboboxProps={{ withinPortal: true, zIndex: 600 }}
          styles={shellInputStyles}
        />
        <DatePickerInput
          label="Due date"
          placeholder="Optional"
          value={dueYmd}
          onChange={(d) => {
            if (!d) setDueYmd(null);
            else if (typeof d === "string") setDueYmd(d.slice(0, 10));
            else {
              setDueYmd(dateToDueIso(d).slice(0, 10));
            }
          }}
          valueFormat="MM/DD/YYYY"
          size="sm"
          radius="md"
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
            withinPortal: true,
            zIndex: 600,
            styles: {
              dropdown: {
                padding: "var(--mantine-spacing-sm)",
                backgroundColor: "var(--relay-surface-raised)",
                border: "1px solid var(--relay-border-hairline)",
                borderRadius: "var(--mantine-radius-md)",
                boxShadow: "var(--relay-card-shadow)",
              },
            },
          }}
          styles={shellInputStyles}
        />
        <Textarea
          label="Summary"
          placeholder="Optional context"
          value={summary}
          onChange={(e) => setSummary(e.currentTarget.value)}
          minRows={2}
          maxRows={5}
          autosize
          size="sm"
          radius="md"
          styles={shellInputStyles}
        />
        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="default" radius="md" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="sage"
            radius="md"
            size="sm"
            disabled={!canSave}
            onClick={handleSubmit}
          >
            Create item
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
