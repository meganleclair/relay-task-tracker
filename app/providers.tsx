"use client";

import { config } from "@fortawesome/fontawesome-svg-core";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { relayTheme } from "./theme";

config.autoAddCss = false;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={relayTheme} forceColorScheme="light">
      <DatesProvider settings={{ locale: "en", firstDayOfWeek: 0 }}>
        {children}
      </DatesProvider>
    </MantineProvider>
  );
}
