import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Check } from "lucide-react";
import { PrintButton } from "@/components/offer/PrintButton";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/config/site";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { fillOffer, starterOfferVars } from "@/lib/starter-offer";

/**
 * Kurzfassung des Einstiegsangebots: ein A4-Blatt zum Weitergeben (Druckdialog → "Als PDF sichern").
 * Liegt bewusst außerhalb der (site)-Hülle – ohne Header und Footer, damit nur das Blatt gedruckt wird.
 * Texte: messages → starterOffer.sheet (+ scope, price), Zahlen: config/packages.ts.
 */
type Props = { params: Promise<{ locale: Locale }> };
type Way = { title: string; unit: string; points: string[]; badge?: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "starterOffer" });
  return pageMetadata({ locale, href: "/einstiegsangebot/kurzfassung", title: t("sheet.metaTitle"), description: t("metaDescription"), noindex: true });
}

export default async function KurzfassungPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("starterOffer");
  const tv = await getTranslations("site");
  const vars = starterOfferVars(locale);
  const get = <T,>(key: string) => fillOffer(t.raw(key) as T, vars);
  const included = get<{ title: string }[]>("scope.included");
  const buy = get<Way>("price.buy");
  const rent = get<Way>("price.rent");
  const terms = get<string[]>("sheet.terms");
  const url = absoluteUrl("/einstiegsangebot", locale).replace(/^https?:\/\//, "");

  return (
    <main id="main" className="print-sheet min-h-dvh bg-canvas px-4 py-6 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-5 flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
        <Link href="/einstiegsangebot" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
          <ArrowLeft className="size-4" aria-hidden /> {t("sheet.back")}
        </Link>
        <PrintButton label={t("sheet.print")} />
        <p className="basis-full text-sm text-muted">{t("sheet.hint")}</p>
      </div>

      <article className="mx-auto flex max-w-[210mm] flex-col bg-white p-6 shadow-[var(--shadow-soft)] sm:p-[14mm] print:h-[297mm] print:w-[210mm] print:max-w-none print:p-[14mm] print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b border-line pb-5">
          <Logo className="h-12" />
          <p className="num text-right text-xs leading-relaxed text-muted">
            {site.phone}
            <br />
            {site.email}
            <br />
            {url}
          </p>
        </header>

        <p className="mt-6 text-xs font-medium tracking-wide text-brand-600 uppercase">{t("sheet.kicker")}</p>
        <h1 className="mt-2 text-[1.75rem] leading-[1.12] font-medium text-balance text-ink">{t("sheet.title")}</h1>
        <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-body">{t("sheet.lead")}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 print:grid-cols-2">
          <section className="rounded-3xl border border-line p-5">
            <h2 className="text-sm font-medium text-ink">{buy.title}</h2>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
              <span className="num text-3xl font-medium tracking-tight text-ink">{vars.price}</span>
              <span className="text-xs text-muted">{buy.unit}</span>
            </p>
            <SheetList items={buy.points} />
          </section>
          <section className="rounded-3xl bg-night p-5 text-white">
            <h2 className="flex flex-wrap items-center gap-2 text-sm font-medium text-white">
              {rent.title}
              <span className="num rounded-full bg-mint-500 px-2 py-0.5 text-[11px] font-medium text-white">{rent.badge}</span>
            </h2>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
              <span className="num text-3xl font-medium tracking-tight">{vars.rent}</span>
              <span className="text-xs text-night-muted">{rent.unit}</span>
            </p>
            <SheetList items={rent.points} dark />
          </section>
        </div>

        <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 print:grid-cols-2">
          <section>
            <h2 className="text-sm font-medium text-ink">{t("sheet.scopeTitle")}</h2>
            <SheetList items={included.map((i) => i.title)} />
          </section>
          <section>
            <h2 className="text-sm font-medium text-ink">{t("sheet.termsTitle")}</h2>
            <SheetList items={terms} />
          </section>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 print:grid-cols-2">
          <section className="rounded-3xl bg-canvas p-5">
            <h2 className="text-sm font-medium text-ink">{t("sheet.referenceTitle")}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-body">{t("sheet.reference")}</p>
          </section>
          <section className="rounded-3xl bg-brand-50 p-5">
            <h2 className="text-sm font-medium text-ink">{t("sheet.nextTitle")}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-body">{t("sheet.next")}</p>
            <p className="num mt-2 text-[13px] font-medium text-ink">
              {site.phone} · {site.email}
            </p>
          </section>
        </div>

        <footer className="mt-auto pt-6 text-[11px] leading-relaxed text-muted">
          <p>{tv("vatNote")}</p>
          <p className="num mt-1">
            {site.legalName} · {site.address.street}, {site.address.postalCode} {site.address.city} · {t("sheet.more")}: {url}
          </p>
        </footer>
      </article>
    </main>
  );
}

function SheetList({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((p) => (
        <li key={p} className={`num flex items-start gap-2 text-[13px] leading-snug ${dark ? "text-white/90" : "text-body"}`}>
          <Check className={`mt-0.5 size-3.5 shrink-0 ${dark ? "text-mint-400" : "text-mint-500"}`} strokeWidth={2.5} aria-hidden />
          {p}
        </li>
      ))}
    </ul>
  );
}
