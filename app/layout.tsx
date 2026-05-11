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
  title: "Threshold — Cyber Insurance Ops",
  description:
    "Underwriting operations workspace for cyber insurance teams—track ransomware assessments, breach evaluations, and renewals with clear ownership and an auditable decision trail.",
  openGraph: {
    title: "Threshold — Cyber Insurance Ops",
    description:
      "Purpose-built ops tool for cyber underwriting teams: queue, filters, inline edits, activity log, and intake—built with Next.js and Mantine.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Threshold — Cyber Insurance Ops",
    description:
      "Cyber underwriting ops: filterable queue, inline editing, activity log, and team intake. Built with Next.js and Mantine.",
  },
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
