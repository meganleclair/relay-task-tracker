"use client";

import { Box, Tooltip } from "@mantine/core";
import type { ItemStatus } from "@/lib/types";
import { STATUS_BADGE_TABLE } from "@/components/status-styles";
import { STATUS_HELP } from "@/lib/status-help";

export function TableStatusBadge({ status }: { status: ItemStatus }) {
  const t = STATUS_BADGE_TABLE[status];
  return (
    <Tooltip label={STATUS_HELP[status]} multiline w={280} position="top" withArrow>
      <Box
        component="span"
        style={{
          display: "inline-flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: "11px",
          fontWeight: 600,
          lineHeight: 1.35,
          letterSpacing: "0.02em",
          backgroundColor: t.background,
          color: t.color,
          border: `1px solid ${t.border}`,
          cursor: "help",
        }}
      >
        {status}
      </Box>
    </Tooltip>
  );
}
