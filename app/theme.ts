import { createTheme, MantineColorsTuple } from "@mantine/core";

const warmGray: MantineColorsTuple = [
  "#f8f7f5",
  "#eeede9",
  "#e3e1dc",
  "#c9c6bf",
  "#a8a49b",
  "#878378",
  "#6b6760",
  "#4f4c47",
  "#3a3834",
  "#252422",
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

/** Warm peach / coral accent — dashboards, CTAs, “live” energy (light mode). */
const apricot: MantineColorsTuple = [
  "#fff9f4",
  "#ffefe6",
  "#ffdcc6",
  "#ffc49e",
  "#ffa575",
  "#e07840",
  "#c45f2e",
  "#9e4d26",
  "#6d3519",
  "#3d1e0e",
];

/** Fresh cyan accent — pairs with apricot + sage. */
const aqua: MantineColorsTuple = [
  "#f0fafc",
  "#e2f3f8",
  "#c8e8f0",
  "#9dd4e5",
  "#6bbad0",
  "#3a9bb8",
  "#2c7d96",
  "#246378",
  "#1c4f5f",
  "#143845",
];

export const relayTheme = createTheme({
  primaryColor: "sage",
  colors: {
    warmGray,
    sage,
    apricot,
    aqua,
  },
  defaultRadius: "md",
  fontFamily:
    "var(--font-relay-sans), ui-sans-serif, system-ui, sans-serif",
  fontFamilyMonospace:
    "var(--font-relay-sans), ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.5rem", lineHeight: "1.35", fontWeight: "600" },
      h2: { fontSize: "1.25rem", lineHeight: "1.35", fontWeight: "600" },
      h3: { fontSize: "1.0625rem", lineHeight: "1.4", fontWeight: "600" },
      h4: { fontSize: "1rem", lineHeight: "1.45", fontWeight: "600" },
    },
  },
  defaultGradient: { from: "apricot.4", to: "sage.5", deg: 125 },
  shadows: {
    xs: "0 1px 2px rgba(37, 36, 34, 0.04)",
    sm: "0 1px 3px rgba(37, 36, 34, 0.06), 0 1px 2px rgba(37, 36, 34, 0.04)",
    md: "0 4px 12px rgba(37, 36, 34, 0.07), 0 2px 4px rgba(37, 36, 34, 0.04)",
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
          "&:hover:not(:disabled)": {
            boxShadow: "var(--relay-stat-elev)",
          },
        },
      },
    },
    Badge: {
      defaultProps: { variant: "light", size: "sm" },
    },
    Drawer: {
      styles: {
        content: { backgroundColor: "var(--relay-surface-card)" },
        header: {
          borderBottom: "1px solid var(--relay-border-hairline)",
        },
        body: { paddingTop: "var(--mantine-spacing-lg)" },
      },
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
