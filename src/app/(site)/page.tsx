import { Hero } from "@/components/home/Hero";
import { PromiseSection } from "@/components/home/Promise";
import { Services } from "@/components/home/Services";
import { KiSection } from "@/components/home/KiSection";
import { Portfolio } from "@/components/home/Portfolio";
import { Process } from "@/components/home/Process";
import { CalculatorTeaser } from "@/components/home/CalculatorTeaser";
import { Contact } from "@/components/home/Contact";

/** Startseite – Sektionsfolge 1:1 wie asapmarketing.de */
export default function HomePage() {
  return (
    <>
      <Hero />
      <PromiseSection />
      <Services />
      <KiSection />
      <Portfolio />
      <Process />
      <CalculatorTeaser />
      <Contact />
    </>
  );
}
