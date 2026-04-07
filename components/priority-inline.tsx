"use client";

import { Box, Group, Text } from "@mantine/core";
import type { Priority } from "@/lib/types";
import { PRIORITY_DOT } from "@/components/status-styles";

export function PriorityInline({ priority }: { priority: Priority }) {
  return (
    <Group gap={5} align="center" wrap="nowrap">
      <Box
        style={{
          width: 4,
          height: 4,
          borderRadius: 999,
          flexShrink: 0,
          backgroundColor: PRIORITY_DOT[priority],
          opacity: 0.85,
        }}
      />
      <Text
        component="span"
        size="xs"
        fw={400}
        style={{
          color: "var(--relay-text-meta)",
          fontSize: "0.6875rem",
        }}
      >
        {priority}
      </Text>
    </Group>
  );
}
