import Link from "next/link";
import { ArrowRight, ArrowUpRight, Calculator, Check } from "lucide-react";
import { demos, type DemoDef } from "@/demos/registry";
import { formatEUR } from "@/lib/format";

/**
 * Abschnitt unter jeder Demo: Die App darüber läuft nur im Browser – für Google, KI-Assistenten und alle,
 * die nach unten scrollen, steht hier in Textform, was die Demo zeigt, was es kostet und wie es weitergeht.
 * Wird auf dem Server gerendert (Hauptüberschrift, Inhalt und Links stehen im ausgelieferten HTML).
 */
export function DemoAbout({
  def,
  pricing,
  links,
}: {
  def: DemoDef;
  pricing: { start: number; shown: number; rent: number };
  /** Passende Branchen- und Leistungsseite sowie Ratgeber */
  links: { href: string; label: string; kind: string }[];
}) {
  const others = demos.filter((d) => d.slug !== def.slug);
  return (
    <section aria-labelledby="demo-about-title" className="border-t border-line bg-canvas py-14 text-ink sm:py-20">
      <div className="container-x">
        <p className="text-[13px] font-medium text-brand-600">
          {def.kind} · Demo von TasWiq Media
        </p>
        <h1 id="demo-about-title" className="mt-3 max-w-3xl text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.08] font-medium text-balance">
          {def.metaTitle}
        </h1>
        <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-body">
          {def.summary} {def.firm} ist eine Musterfirma: Namen, Kunden und Zahlen sind erfunden, das System dahinter ist echt. Du kannst oben alles anklicken – ohne Anmeldung, gespeichert wird nichts.
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="card p-6 sm:p-8">
            <h2 className="text-xl font-medium">Das zeigt die Demo</h2>
            <ul className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {def.features.map((f) => (
                <li key={f.title} className="flex gap-3 text-[15px] leading-relaxed text-body">
                  <Check className="mt-1 size-4 shrink-0 text-mint-500" strokeWidth={2.5} aria-hidden />
                  <span>
                    <span className="font-medium text-ink">{f.title}.</span> {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <h2 className="mt-9 text-xl font-medium">Das lässt sich ergänzen</h2>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {def.options.map((o) => (
                <li key={o} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm leading-snug text-body">
                  {o}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-night flex flex-col p-6 sm:p-8">
            <h2 className="text-xl font-medium text-white">Was kostet so ein System?</h2>
            <p className="num mt-3 leading-relaxed text-night-muted">
              Einstieg ab <strong className="font-semibold text-white">{formatEUR(pricing.start)}</strong> einmalig oder ab <strong className="font-semibold text-white">{formatEUR(pricing.rent)}</strong> im Monat zur Miete.
              {pricing.shown > pricing.start && <> Im Umfang dieser Demo ab {formatEUR(pricing.shown)}.</>} Den Festpreis gibt es nach dem Prototyp.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-night-muted">Die Demo ist ein Beispiel, kein Produkt von der Stange: Wir bauen das System um deine Abläufe, mit deinen Begriffen und in deinem Design.</p>
            <div className="mt-auto flex flex-col gap-2 pt-7">
              <Link href="/#kontakt" prefetch={false} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-500 px-6 font-medium text-white shadow-[var(--shadow-brand)] transition hover:bg-brand-600">
                Kostenloses Erstgespräch <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/preisrechner" prefetch={false} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 font-medium text-white transition hover:bg-white/10">
                <Calculator className="size-4" aria-hidden /> Kosten berechnen
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="card p-6 sm:p-8">
            <h2 className="text-xl font-medium">Passt genauso für</h2>
            <dl className="mt-4 divide-y divide-line">
              {def.fits.map((f) => (
                <div key={f.who} className="py-3 first:pt-0 last:pb-0">
                  <dt className="font-medium text-ink">{f.who}</dt>
                  <dd className="text-[15px] leading-relaxed text-muted">{f.how}</dd>
                </div>
              ))}
            </dl>
          </div>

          <nav aria-labelledby="demo-more-title" className="card p-6 sm:p-8">
            <h2 id="demo-more-title" className="text-xl font-medium">
              Mehr zum Thema
            </h2>
            <ul className="mt-4 divide-y divide-line">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} prefetch={false} className="group flex min-h-12 items-center justify-between gap-4 py-3 text-[15px] leading-snug">
                    <span>
                      <span className="block text-xs text-muted">{l.kind}</span>
                      <span className="font-medium text-ink group-hover:text-brand-600">{l.label}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-sm font-semibold text-ink">Weitere Demos</h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {others.map((d) => (
                <li key={d.slug}>
                  <Link href={`/demo/${d.slug}`} prefetch={false} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-sm font-medium text-ink transition hover:border-brand-200 hover:text-brand-600">
                    {d.kind} <ArrowUpRight className="size-3.5 text-muted" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          <span>Alle Musterfirmen, Personen und Zahlen in den Demos sind frei erfunden.</span>
          <Link href="/impressum" prefetch={false} className="inline-flex min-h-11 items-center hover:text-brand-600">
            Impressum
          </Link>
          <Link href="/datenschutz" prefetch={false} className="inline-flex min-h-11 items-center hover:text-brand-600">
            Datenschutz
          </Link>
        </p>
      </div>
    </section>
  );
}
