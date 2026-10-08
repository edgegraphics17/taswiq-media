import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight, MousePointerClick } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Logo } from "@/components/ui/Logo";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { site } from "@/config/site";
import { demoPricing, demos } from "@/demos/registry";
import { formatEUR } from "@/lib/format";
import { ORG_ID } from "@/lib/seo";

const title = "Software-Demos zum Ausprobieren";
const description = "Sechs Musterfirmen, sechs Systeme: Bestellsystem, Terminbuchung, Makler-Portal, Werkstatt-Portal, Mandantenportal und Handwerker-Software. Ohne Anmeldung testen – Kundenansicht und Dashboard.";

export const metadata: Metadata = {
  title: { absolute: `${title} | TasWiq Media.` },
  description,
  alternates: { canonical: `${site.url}/demo` },
  openGraph: { type: "website", locale: "de_DE", url: `${site.url}/demo`, siteName: site.name, title, description, images: [{ url: `${site.url}${demos[0].image}`, width: 1440, height: 848 }] },
  twitter: { card: "summary_large_image", title, description, images: [`${site.url}${demos[0].image}`] },
};

/**
 * Übersicht aller Software-Demos – die Seite, die der Vertrieb verschickt.
 * Bewusst schlank und ohne die Hülle der Website: Logo, sechs Karten, ein Weg zur Anfrage.
 */
export default async function DemoHubPage() {
  const t = await getTranslations({ locale: "de", namespace: "home.industries" });
  return (
    <>
      <header className="container-x flex items-center justify-between gap-4 py-5">
        <Link href="/" prefetch={false} aria-label="TasWiq Media – zur Startseite">
          <Logo className="h-10" />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/portfolio" prefetch={false} className="hidden min-h-11 items-center rounded-full px-4 text-sm font-medium text-body hover:text-ink sm:inline-flex">
            Portfolio
          </Link>
          <Link href="/#kontakt" prefetch={false} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-medium text-white shadow-[var(--shadow-brand)] hover:bg-brand-600">
            Projekt besprechen <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </header>

      <main id="main">
        <section className="container-x pt-8 pb-10 sm:pt-14">
          <Eyebrow icon={MousePointerClick}>Demos</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.3rem,5.6vw,4.2rem)] leading-[1.03] font-medium text-balance">
            Sechs Systeme. <span className="text-brand-500">Zum Anfassen.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-body">
            Jede Demo ist eine Musterfirma mit zwei Seiten: was ihre Kunden sehen und womit der Betrieb arbeitet. Bestell, buch, gib frei – und sieh auf der anderen Seite, was ankommt. Ohne Anmeldung, es wird nichts gespeichert.
          </p>
        </section>

        <section aria-label="Alle Demos" className="container-x pb-14">
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {demos.map((d) => {
              const p = demoPricing(d);
              return (
                <li key={d.slug}>
                  <article className="card group relative flex h-full flex-col p-2.5 transition-[transform,box-shadow] duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)]">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[1.6rem] px-4 pt-4" style={{ background: d.theme.deep }}>
                      <div className="relative h-full overflow-hidden rounded-t-lg shadow-[var(--shadow-float)]">
                        <Image src={d.image} alt={`Demo ${d.firm}: ${d.kind}`} fill sizes="(min-width:1280px) 380px, (min-width:768px) 50vw, 100vw" className="object-cover object-top transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.03]" />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col px-3.5 pt-4 pb-3.5">
                      <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                        <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-600">{d.kind}</span>
                        <span className="rounded-full bg-canvas px-3 py-1 text-ink">{t(`items.${d.industry}.title`)}</span>
                      </p>
                      <h2 className="mt-3 text-xl leading-snug font-medium">
                        <Link href={`/demo/${d.slug}`} className="after:absolute after:inset-0 after:rounded-[2rem] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand-500">
                          {d.title}
                        </Link>
                      </h2>
                      <p className="mt-0.5 text-[13px] text-muted">Musterfirma: {d.firm}</p>
                      <p className="mt-2.5 text-[14.5px] leading-relaxed text-body">{d.summary}</p>
                      <p className="mt-3 text-[13px] leading-relaxed text-muted">
                        <span className="font-medium text-ink">Passt auch für:</span> {d.fits.slice(0, 3).map((f) => f.who).join(", ")}
                      </p>
                      <p className="num mt-auto flex items-center justify-between gap-3 pt-5 text-[13px] text-muted">
                        <span>
                          ab {formatEUR(p.start)} · oder {formatEUR(p.rent)}/Monat
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium text-brand-600">
                          Demo öffnen <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                        </span>
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="container-x pb-10">
          <div className="card-night flex flex-col items-start justify-between gap-6 p-8 sm:p-10 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] leading-tight font-medium text-white">Deine Branche ist nicht dabei?</h2>
              <p className="mt-2 leading-relaxed text-night-muted">
                Die Demos zeigen das Prinzip, nicht die Grenze. Ob Praxis, Verein, Händler oder Schule: Wir bauen das System um deine Abläufe – mit deinen Begriffen, deinen Regeln und deinem Design.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href="/#kontakt" prefetch={false} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-medium text-ink transition hover:-translate-y-0.5">
                Projekt besprechen <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/preisrechner" prefetch={false} className="inline-flex min-h-12 items-center rounded-full border border-white/20 px-6 font-medium text-white transition hover:bg-white/10">
                Kosten berechnen
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="container-x flex flex-col gap-3 pb-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.legalName}. Alle Musterfirmen, Personen und Zahlen in den Demos sind frei erfunden.
        </p>
        <p className="flex gap-2">
          <Link href="/impressum" prefetch={false} className="rounded-full bg-white px-3 py-1.5 hover:text-brand-600">
            Impressum
          </Link>
          <Link href="/datenschutz" prefetch={false} className="rounded-full bg-white px-3 py-1.5 hover:text-brand-600">
            Datenschutz
          </Link>
        </p>
      </footer>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description,
          url: `${site.url}/demo`,
          inLanguage: "de-DE",
          publisher: { "@id": ORG_ID },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: demos.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: `${d.title} (${d.firm})`, url: `${site.url}/demo/${d.slug}` })),
          },
        }}
      />
    </>
  );
}
