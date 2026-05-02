import { createTheme, MantineColorsTuple } from "@mantine/core";

/** Cool teal-gray neutrals */
const coolGray: MantineColorsTuple = [
  "#f4f8f6",
  "#e8efec",
  "#d4e2dc",
  "#b0c8be",
  "#87aba0",
  "#658f83",
  "#4e7368",
  "#3c5950",
  "#2d423c",
  "#1e2d29",
];

const sage: MantineColorsTuple = [
  "#f4f7f4",
  "#e6ebe6",
  "#d2dbd3",
  "#b0c0b4",
  "#8ba392",
  "#6d8574",
  "#556b5b",
  "#425046",
  "#323a34",
  "#232823",
];

/** Vivid teal-green — primary accent */
const tealGreen: MantineColorsTuple = [
  "#ebfdf7",
  "#d0f9ec",
  "#a8f0d8",
  "#72e3bf",
  "#36cfa1",
  "#15b886",
  "#0fa070",
  "#0d875f",
  "#0b6d4d",
  "#09543c",
];

/** Indigo — secondary/chart accent */
const indigo: MantineColorsTuple = [
  "#eef0fd",
  "#dde0fb",
  "#c4c9f7",
  "#9fa6f1",
  "#7a84ea",
  "#5f6ee4",
  "#4f63e5",
  "#3d4ecb",
  "#3040a8",
  "#233087",
];

export const relayTheme = createTheme({
  primaryColor: "tealGreen",
  colors: {
    warmGray: coolGray, // keep alias so c="warmGray.*" props still resolve
    coolGray,
    sage,
    tealGreen,
    indigo,
  },
  defaultRadius: "md",
  fontFamily:
    "var(--font-relay-sans), ui-sans-serif, system-ui, sans-serif",
  fontFamilyMonospace:
    "var(--font-relay-sans), ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.5rem",    lineHeight: "1.35", fontWeight: "600" },
      h2: { fontSize: "1.25rem",   lineHeight: "1.35", fontWeight: "600" },
      h3: { fontSize: "1.0625rem", lineHeight: "1.4",  fontWeight: "600" },
      h4: { fontSize: "1rem",      lineHeight: "1.45", fontWeight: "600" },
    },
  },
  defaultGradient: { from: "tealGreen.4", to: "indigo.5", deg: 125 },
  shadows: {
    xs: "0 1px 2px rgba(10, 30, 22, 0.04)",
    sm: "0 1px 3px rgba(10, 30, 22, 0.06), 0 1px 2px rgba(10, 30, 22, 0.04)",
    md: "0 4px 12px rgba(10, 30, 22, 0.07), 0 2px 4px rgba(10, 30, 22, 0.04)",
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.75rem",
  },
  components: {
    Button: {
      defaultProps: { variant: "default" },
      styles: {
        root: {
          fontWeight: 500,
          transition:
            "background-color 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
        },
      },
    },
    Badge: {
      defaultProps: { variant: "light", size: "sm" },
    },
    TextInput: {
      defaultProps: { size: "sm" },
      styles: {
        section: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.25rem",
        },
      },
    },
    Table: {
      styles: {
        table: { borderCollapse: "separate", borderSpacing: 0 },
      },
    },
  },
});
