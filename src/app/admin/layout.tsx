import type { Metadata } from "next";
import { fontVars } from "@/app/fonts";
import { site } from "@/config/site";
import "../globals.css";

/** Internes Dashboard: bleibt deutsch, ohne Sprach-Präfix und ohne Indexierung. */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Dashboard", template: "%s | TasWiq Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
