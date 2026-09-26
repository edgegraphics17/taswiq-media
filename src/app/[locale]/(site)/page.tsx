import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/home/Hero";
import { PromiseSection } from "@/components/home/Promise";
import { Services } from "@/components/home/Services";
import { KiSection } from "@/components/home/KiSection";
import { Portfolio } from "@/components/home/Portfolio";
import { References } from "@/components/home/References";
import { Process } from "@/components/home/Process";
import { CalculatorTeaser } from "@/components/home/CalculatorTeaser";
import { Contact } from "@/components/home/Contact";

/** Startseite – Sektionsfolge 1:1 wie asapmarketing.de. Title/Description/hreflang kommen aus dem [locale]-Layout. */
export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  setRequestLocale((await params).locale);
  return (
    <>
      <Hero />
      <PromiseSection />
      <Services />
      <KiSection />
      <Portfolio references={<References />} />
      <Process />
      <CalculatorTeaser />
      <Contact />
    </>
  );
}
