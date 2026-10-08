import { setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/components/layout/SiteShell";
import { Footer } from "@/components/layout/Footer";
import type { Locale } from "@/i18n/routing";

/**
 * setRequestLocale muss auch hier stehen: Der Footer fragt die Sprache ab. Ohne die Zeile liest next-intl sie
 * aus der Anfrage – dann wird jede Seite bei jedem Aufruf neu berechnet, statt fertig aus dem Cache zu kommen.
 */
export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale as Locale);
  return <SiteShell footer={<Footer />}>{children}</SiteShell>;
}
