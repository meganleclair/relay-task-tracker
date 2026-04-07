import type { Metadata } from "next";
import { ColorSchemeScript } from "@mantine/core";
import { Poppins } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const relaySans = Poppins({
  variable: "--font-relay-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Relay — Workflow & decisions",
  description:
    "Review, track, and move items through your team’s decision workflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
      </head>
      <body className={relaySans.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
