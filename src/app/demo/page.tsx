import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeftRight, ArrowRight, ArrowUpRight, Calculator, Check, CirclePlay, MousePointerClick, Plug } from "lucide-react";
import { DemoPreview } from "@/components/demo/DemoPreview";
import { IntegrationChip, IntegrationMarquee } from "@/components/demo/Integrations";
import { PortalNav } from "@/components/demo/PortalNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { DemoLink } from "@/components/ui/DemoLink";
import { LogoMark } from "@/components/ui/Logo";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { site } from "@/config/site";
import { demoIntegrations } from "@/demos/integrations";
import { demoPricing, demos, demoViewImage } from "@/demos/registry";
import { formatEUR } from "@/lib/format";
import { ORG_ID } from "@/lib/seo";

const title = "Software-Demos zum Ausprobieren";
const description = "Sechs Software-Demos ohne Anmeldung testen: Bestellsystem, Terminbuchung, Makler-Portal, Werkstatt-Portal, Mandantenportal und Handwerker-Software.";

export const metadata: Metadata = {
  title: { absolute: `${title} | TasWiq Media.` },
  description,
  alternates: { canonical: `${site.url}/demo` },
  openGraph: { type: "website", locale: "de_DE", url: `${site.url}/demo`, siteName: site.name, title, description, images: [{ url: `${site.url}${demos[0].image}`, width: 1440, height: 848 }] },
  twitter: { card: "summary_large_image", title, description, images: [`${site.url}${demos[0].image}`] },
};

/**
 * Übersicht aller Software-Demos – die Seite, die der Vertrieb verschickt.
 * Ohne die Hülle der Website, dafür im Rahmen der Demos selbst: dieselbe dunkle Leiste, darunter Reiter zu den Systemen.
 * Wer hier landet, soll merken, dass er schon im Produkt steht – jede Demo als große Fläche mit Vorschau beider Ansichten.
 */
export default async function DemoHubPage() {
  const t = await getTranslations({ locale: "de", namespace: "home.industries" });
  const steps = [
    { icon: MousePointerClick, title: "Als Kunde loslegen", text: "Bestell, buch einen Termin oder stell eine Anfrage – wie es deine Kunden tun würden." },
    { icon: ArrowLeftRight, title: "Ansicht wechseln", text: "Oben ins Dashboard: Deine Eingabe wartet dort schon auf den Betrieb." },
    { icon: CirclePlay, title: "Tour oder frei klicken", text: "Die Tour zeigt das Wichtigste, oder du probierst alles selbst aus." },
  ];

  return (
    <>
      <div className="sticky top-0 z-40">
        <header className="bg-night text-white">
          <div className="container-x flex h-[3.25rem] items-center gap-2 sm:gap-3">
            <Link href="/" prefetch={false} className="-ml-1 flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-1 text-sm font-medium text-white/80 hover:text-white" aria-label="TasWiq Media – zur Startseite">
              <LogoMark className="h-6" />
              <span className="hidden sm:inline">TasWiq Media.</span>
            </Link>
            <span className="h-5 w-px bg-white/15" aria-hidden />
            <p className="flex min-w-0 items-center gap-2 text-sm">
              <span className="font-medium">Demos</span>
              <span className="hidden rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/75 sm:inline">Übersicht</span>
            </p>
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <Link href="/preisrechner" prefetch={false} className="hidden min-h-11 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white md:inline-flex">
                <Calculator className="size-4" aria-hidden /> Kosten berechnen
              </Link>
              <Link href="/portfolio" prefetch={false} className="hidden min-h-11 items-center rounded-full px-2.5 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white lg:inline-flex">
                Portfolio
              </Link>
              <Link href="/#kontakt" prefetch={false} className="ml-1 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600">
                Für meinen Betrieb <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </header>
        <PortalNav items={[...demos.map((d) => ({ id: d.slug, label: d.kind })), { id: "anbindungen", label: "Anbindungen" }]} />
      </div>

      <main id="main">
        <section className="container-x pt-10 pb-6 sm:pt-16 sm:pb-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-12">
            <div>
              <Eyebrow icon={MousePointerClick}>Demos</Eyebrow>
              <h1 className="mt-4 text-[clamp(2.75rem,7.4vw,5.75rem)] leading-[0.97] font-medium text-balance">
                Sechs Systeme. <span className="text-brand-500">Zum Anfassen.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-body sm:text-lg">
                Jede Demo ist eine Musterfirma mit zwei Seiten: was ihre Kunden sehen und womit der Betrieb arbeitet. Bestell, buch, gib frei – und sieh auf der anderen Seite, was ankommt.
              </p>
            </div>
            <ol className="card divide-y divide-line px-5 py-1.5 sm:px-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4 py-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <s.icon className="size-[18px]" aria-hidden />
                  </span>
                  <p className="text-sm leading-relaxed text-muted">
                    <span className="block text-[15px] font-medium text-ink">
                      <span className="num mr-1.5 text-muted">{i + 1}</span>
                      {s.title}
                    </span>
                    {s.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="anbindungen" aria-labelledby="anbindungen-title" className="container-x scroll-mt-28 pb-6">
          <div className="card overflow-hidden py-5 sm:py-6">
            <div className="flex flex-col gap-x-10 gap-y-1.5 px-5 sm:px-7 lg:flex-row lg:items-baseline lg:justify-between">
              <h2 id="anbindungen-title" className="flex items-center gap-2.5 text-[clamp(1.25rem,2vw,1.6rem)] leading-tight font-medium">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-blush-100 text-blush-600">
                  <Plug className="size-4" aria-hidden />
                </span>
                <span>
                  Läuft mit den Tools, <span className="text-brand-500">die du schon nutzt.</span>
                </span>
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted lg:text-right">Kasse, Kalender, Buchhaltung, Portale: Wir schließen dein System an das an, womit dein Betrieb heute arbeitet.</p>
            </div>
            <IntegrationMarquee className="mt-5" />
            <p className="mt-4 px-5 text-xs leading-relaxed text-muted sm:px-7">Auswahl – was sich anbinden lässt, hängt von der Schnittstelle des Anbieters ab. Dein Tool fehlt? Frag uns. Alle Marken gehören ihren Inhabern.</p>
          </div>
        </section>

        <section aria-label="Alle Demos" className="container-x pb-16">
          <ol className="space-y-5">
            {demos.map((d, i) => {
              const p = demoPricing(d);
              const conn = demoIntegrations[d.slug];
              return (
                <li key={d.slug} id={d.slug} className="scroll-mt-28">
                  <article className="card grid gap-1 p-2.5 lg:grid-cols-[minmax(0,1.32fr)_minmax(0,1fr)]">
                    <DemoPreview slug={d.slug} firm={d.firm} tint={d.theme.soft} priority={i === 0} views={d.views.map((v) => ({ id: v.id, label: v.label, image: demoViewImage(d, v.id) }))} />
                    <div className="flex flex-col px-3.5 pt-5 pb-3.5 sm:px-6 lg:py-6">
                      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13px] font-medium">
                        <span className="num text-muted">
                          {String(i + 1).padStart(2, "0")}
                          <span className="text-line"> / </span>
                          {String(demos.length).padStart(2, "0")}
                        </span>
                        <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-600">{d.kind}</span>
                        <span className="text-muted">{t(`items.${d.industry}.title`)}</span>
                      </p>
                      <h2 className="mt-4 text-[clamp(1.75rem,2.8vw,2.5rem)] leading-[1.05] font-medium text-balance">{d.title}</h2>
                      <p className="mt-3.5 text-[16px] leading-relaxed text-body">{d.summary}</p>
                      <ul className="mt-5 grid gap-x-4 gap-y-2 text-[14.5px] font-medium text-ink sm:grid-cols-2">
                        {d.features.slice(0, 4).map((f) => (
                          <li key={f.title} className="flex items-start gap-2">
                            <Check className="mt-0.5 size-4 shrink-0 text-brand-500" strokeWidth={2.5} aria-hidden />
                            {f.title}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 border-t border-line pt-4">
                        <h3 className="flex flex-wrap items-center gap-x-1.5 text-[13px] font-medium tracking-normal text-ink">
                          <Plug className="size-3.5 text-muted" aria-hidden /> Lässt sich anbinden
                          <span className="font-normal text-muted">· {conn.note}</span>
                        </h3>
                        <ul className="mt-2.5 flex flex-wrap gap-1.5">
                          {conn.items.map((it) => (
                            <IntegrationChip key={it} item={it} />
                          ))}
                        </ul>
                      </div>
                      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-7">
                        <p className="text-[13px] leading-snug text-muted">
                          Musterfirma: {d.firm}
                          <span className="num mt-0.5 block text-[15px] text-body">
                            <span className="font-medium text-ink">ab {formatEUR(p.start)}</span> · oder {formatEUR(p.rent)}/Monat
                          </span>
                        </p>
                        <DemoLink slug={d.slug} variant="primary" className="group max-sm:w-full">
                          Demo öffnen <ArrowUpRight className="size-[18px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                        </DemoLink>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
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
