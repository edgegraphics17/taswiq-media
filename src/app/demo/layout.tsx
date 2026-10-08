import type { Metadata } from "next";
import { fontVars } from "@/app/fonts";
import { PageViews } from "@/components/consent/PageViews";
import { site } from "@/config/site";
import { demoFontVars } from "@/demos/fonts";
import "../globals.css";

/**
 * Software-Demos: eigener Bereich neben Website ([locale]) und Dashboard (/admin) – ohne Header und Footer der Website,
 * ohne Sprach-Präfix (nur Deutsch). Die Seitenaufrufe zählen in derselben cookielosen Statistik mit.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Software-Demos zum Ausprobieren", template: "%s | TasWiq Media." },
  applicationName: site.name,
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export default function DemoRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${fontVars} ${demoFontVars}`}>
      <body>
        {children}
        <PageViews />
      </body>
    </html>
  );
}
