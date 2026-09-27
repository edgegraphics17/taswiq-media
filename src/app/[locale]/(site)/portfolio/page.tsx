import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Briefcase } from "lucide-react";
import { portfolioItems, thumbOf } from "@/config/content";
import { contactHref, site } from "@/config/site";
import { PortfolioExplorer } from "@/components/portfolio/PortfolioExplorer";
import { References } from "@/components/home/References";
import { FunnelSection } from "@/components/product/FunnelSection";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { LOCALE_META } from "@/i18n/routing";
import { absoluteUrl, breadcrumbJsonLd, ORG_ID, pageMetadata, WEBSITE_ID } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });
  return pageMetadata({ locale, href: "/portfolio", title: t("metaTitle"), description: t("metaDescription"), keywords: t.raw("keywords") as string[] });
}

/** Portfolio: alle Projekte zum Durchstöbern – Software, Websites, Filme & Reels, Events. */
export default async function PortfolioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portfolio");
  const ts = await getTranslations("schema");
  const stats = t.raw("stats") as { value: string; label: string }[];

  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-10 sm:pt-40">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.13),transparent)]" aria-hidden />
        <div className="container-x text-center">
          <div className="flex animate-rise justify-center">
            <Eyebrow icon={Briefcase}>{t("tag")}</Eyebrow>
          </div>
          <h1 className="mx-auto mt-5 max-w-4xl animate-rise text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.03] font-medium text-balance [animation-delay:0.08s]">
            {t("title")} <span className="text-brand-500">{t("titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-rise text-[15.5px] leading-relaxed text-muted [animation-delay:0.16s]">{t("text")}</p>
          <dl className="mx-auto mt-8 grid max-w-3xl animate-rise grid-cols-2 gap-3 [animation-delay:0.24s] sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="card flex flex-col-reverse p-4 text-left">
                <dt className="mt-0.5 text-xs text-muted">{s.label}</dt>
                <dd className="num text-2xl font-medium tracking-tight text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-label={t("gridAria")} className="pb-8">
        <div className="container-x">
          <PortfolioExplorer mode="full" />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href={contactHref}>
              {t("ctaPrimary")} <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/preisrechner" variant="white">
              {t("calculate")}
            </ButtonLink>
          </div>
        </div>
      </section>

      <References />

      <FunnelSection title={t("funnel.title")} accent={t("funnel.accent")} text={t("funnel.text")} source="portfolio" />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: t("metaTitle"),
          url: absoluteUrl("/portfolio", locale),
          inLanguage: LOCALE_META[locale].hreflang,
          isPartOf: { "@id": WEBSITE_ID },
          publisher: { "@id": ORG_ID },
          hasPart: portfolioItems.map((p) => {
            const img = thumbOf(p);
            return {
              "@type": "CreativeWork",
              name: t(`items.${p.id}.title`),
              description: t(`items.${p.id}.text`),
              ...(p.media.type === "site" ? { url: p.media.url } : {}),
              ...(img ? { image: `${site.url}${img}` } : {}),
            };
          }),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: ts("breadcrumbHome"), href: "/" },
            { name: t("tag"), href: "/portfolio" },
          ],
          locale,
        )}
      />
    </>
  );
}
