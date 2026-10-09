import type { Metadata, Viewport } from "next";
import { fontVars } from "@/app/fonts";
import { site } from "@/config/site";
import "../globals.css";

/** Videocalls: eigener Bereich ohne Header, Footer und Sprach-Präfix – erreichbar nur über den Einladungslink, nicht indexiert. */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Meeting", template: "%s | TasWiq Meet" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#0b0b0f" };

export default function MeetRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={fontVars}>
      <body className="bg-[#0b0b0f]">{children}</body>
    </html>
  );
}
