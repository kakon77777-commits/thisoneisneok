import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "./components/site-shell";
import { BUILD_ID } from "./data/build-id.generated";

const siteUrl = "https://thisoneisneok.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Neo.K × EveMissLab",
    template: "%s | Neo.K × EveMissLab",
  },
  description:
    "Neo.K 的個人網站、EveMissLab 應用展示、MSSP 架構專區、Lean4 驗證與雙語部落格。",
  alternates: {
    canonical: siteUrl,
  },
  other: {
    // Read by scripts/verify-deploy.mjs to prove the live HTML came from this
    // build and not from a stale edge cache.
    "build-id": BUILD_ID,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
