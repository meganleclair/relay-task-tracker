"use client";

import { Box } from "@mantine/core";
import type { ReactNode } from "react";

export function RelayPill({
  background,
  color,
  border,
  children,
}: {
  background: string;
  color: string;
  border: string;
  children: ReactNode;
}) {
  return (
    <Box
      component="span"
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "var(--mantine-radius-md)",
        padding: "2px 9px",
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.01em",
        background,
        color,
        lineHeight: 1.4,
        border: `1px solid ${border}`,
      }}
    >
      {children}
    </Box>
  );
}
