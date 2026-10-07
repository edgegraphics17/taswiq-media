import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, BadgePercent, Boxes, CodeXml, Monitor, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { RentExplainer } from "@/components/product/RentExplainer";
import { InView } from "@/components/ui/InView";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn, eurAffix, formatEUR, formatNumber } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

export type Pack = { id: string; name: string; audience: string; price: number; unit: string; meta: string; features: string[]; featured?: boolean; from?: string; /** Monatliche Miete als Alternative zum Einmalpreis (nur Software) */ rent?: number };
const ICONS: LucideIcon[] = [Monitor, Boxes, CodeXml];

/**
 * Pakete im Muster der Pricing-Karten der Vorlage ("Starter · $29 · Facility you will get"),
 * Preise als "ab …" (Umfang klärt der Workshop):
 * großer Preis, Leistungen als graue Pillen-Zeilen (mobil aufklappbar), Empfehlung als schwarze Karte.
 * Software-Pakete zeigen zusätzlich die Miete und darunter "Kaufen oder mieten".
 */
export async function PricingSection({ tag, title, accent, text, packages, trust, highlight, icons }: { tag: string; title: string; accent: string; text: string; packages: Pack[]; trust: string[]; highlight?: string; icons?: LucideIcon[] }) {
  const locale = (await getLocale()) as Locale;
  const tr = await getTranslations("packages.rent");
  const t = await getTranslations("product");
  const eur = eurAffix(locale);
  return (
    <section id="pakete" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading eyebrow={tag} icon={BadgePercent} title={title} accent={accent} text={text} />
        </Reveal>
        <InView className="stagger mt-12 grid items-stretch gap-4 lg:grid-cols-3">
          {packages.map((p, i) => {
            const featured = highlight ? p.id === highlight : p.featured;
            const Ico = (icons ?? ICONS)[i] ?? Sparkles;
            return (
              <article
                key={p.id}
                style={{ "--i": i } as React.CSSProperties}
                className={cn("relative flex flex-col rounded-[2rem] p-7 sm:p-8", featured ? "bg-night text-white shadow-[var(--shadow-float)]" : "border border-line bg-white shadow-[var(--shadow-soft)]")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={cn("text-xl font-medium", featured && "text-white")}>{p.name}</h3>
                    <p className={cn("mt-1 text-sm", featured ? "text-night-muted" : "text-muted")}>{p.audience}</p>
                  </div>
                  <span className={cn("grid size-12 shrink-0 place-items-center rounded-full", featured ? "bg-mint-500 text-white" : "bg-night text-white")}>
                    <Ico className="size-5" aria-hidden />
                  </span>
                </div>
                {featured && <span className="mt-4 self-start rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">{highlight ? t("recommended") : t("mostChosen")}</span>}
                <p className="mt-6 flex items-baseline gap-2">
                  {p.from && <span className={cn("text-lg", featured ? "text-night-muted" : "text-muted")}>{p.from}</span>}
                  {eur.pre && <span className={cn("text-lg", featured ? "text-night-muted" : "text-muted")}>€</span>}
                  <span className="num text-5xl font-medium tracking-tight">{formatNumber(p.price, locale)}</span>
                  {eur.post && <span className={cn("text-lg", featured ? "text-night-muted" : "text-muted")}>€</span>}
                  <span className={cn("text-sm", featured ? "text-night-muted" : "text-muted")}>{p.unit}</span>
                </p>
                {p.rent !== undefined && (
                  <p className={cn("num mt-3 self-start rounded-full px-3.5 py-2 text-sm", featured ? "bg-white/[0.1] text-white" : "bg-brand-50 text-brand-700")}>
                    {tr("or")} <b className="font-semibold">{formatEUR(p.rent, locale)}</b> {tr("perMonth")}
                  </p>
                )}
                <p className={cn("mt-3 mb-6 text-sm", featured ? "text-night-muted" : "text-muted")}>{p.meta}</p>
                <Disclosure openLabel={t("showFeatures")} closeLabel={t("hideFeatures")} tone={featured ? "dark" : "light"} desktopOpen>
                <p className={cn("pt-4 text-sm font-medium lg:pt-1", featured ? "text-white" : "text-ink")}>{t("youGet")}</p>
                <ul className="mt-3 space-y-2 pb-4 lg:pb-7">
                  {p.features.map((f) => (
                    <li key={f} className={cn("flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm", featured ? "bg-white/[0.07] text-white" : "bg-canvas text-body")}>
                      <span className={cn("size-1.5 shrink-0 rounded-full", featured ? "bg-mint-400" : "bg-brand-500")} aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                </Disclosure>
                <ButtonLink href="#anfrage" variant={featured ? "primary" : "white"} className="mt-3 w-full lg:mt-auto">
                  {t("requestPackage", { name: p.name })} <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
              </article>
            );
          })}
        </InView>
        {packages.some((p) => p.rent !== undefined) && <RentExplainer />}
        <Reveal className="mt-8 flex flex-wrap justify-center gap-2">
          {trust.map((t) => (
            <span key={t} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-body">
              <ShieldCheck className="size-4 text-mint-500" aria-hidden /> {t}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
