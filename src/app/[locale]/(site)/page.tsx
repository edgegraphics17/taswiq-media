import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/home/Hero";
import { References } from "@/components/home/References";
import { Problem } from "@/components/home/Problem";
import { Services } from "@/components/home/Services";
import { Industries } from "@/components/home/Industries";
import { PortfolioTeaser } from "@/components/home/PortfolioTeaser";
import { PromiseSection } from "@/components/home/Promise";
import { Process } from "@/components/home/Process";
import { MediaSection } from "@/components/home/MediaSection";
import { CalculatorTeaser } from "@/components/home/CalculatorTeaser";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import { Contact } from "@/components/home/Contact";

/**
 * Startseite – Software für KMU & Mittelstand im Vordergrund, Media-Referenzen als Social Proof:
 * Hero → Referenzen → Problem (Plattform vs. eigenes System) → Leistungen → Branchen → Projekte
 * → Warum wir (+ winsym.ai) → Ablauf → Premium-Media → Rechner → Ratgeber → Kontakt.
 * Title/Description/hreflang kommen aus dem [locale]-Layout.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  setRequestLocale((await params).locale);
  return (
    <>
      <Hero />
      <References className="pb-8" />
      <Problem />
      <Services />
      <Industries />
      <PortfolioTeaser />
      <PromiseSection />
      <Process />
      <MediaSection />
      <CalculatorTeaser />
      <BlogTeaser />
      <Contact />
    </>
  );
}
