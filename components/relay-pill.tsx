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
        gap: 6,
        borderRadius: "var(--mantine-radius-md)",
        padding: "3px 10px",
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.01em",
        background,
        color,
        lineHeight: 1.4,
        border: `1px solid ${border}`,
      }}
    >
      {/* Status indicator dot */}
      <Box
        component="span"
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          opacity: 0.9,
          boxShadow: `0 0 4px ${color}60`,
        }}
      />
      {children}
    </Box>
  );
}
