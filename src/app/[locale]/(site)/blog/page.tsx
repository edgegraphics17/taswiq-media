import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookOpen, Languages } from "lucide-react";
import { blogCategories, posts, readingMinutes } from "@/content/blog";
import { BlogList } from "@/components/blog/BlogList";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { FunnelSection } from "@/components/product/FunnelSection";
import type { Locale } from "@/i18n/routing";
import { LOCALE_META } from "@/i18n/routing";
import { absoluteUrl, breadcrumbJsonLd, ORG_ID, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  // Die Artikel sind deutsch → die englische Übersicht bleibt erreichbar, wird aber nicht indexiert
  return pageMetadata({ locale, href: "/blog", title: t("metaTitle"), description: t("metaDescription"), keywords: t.raw("keywords") as string[], noindex: locale !== "de" });
}

/** Ratgeber-Übersicht: alle Artikel mit Kategorie-Filter. */
export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const ts = await getTranslations("schema");
  const dateFmt = new Intl.DateTimeFormat(LOCALE_META[locale].intl, { day: "numeric", month: "long", year: "numeric" });

  const summaries = posts.map((p) => ({ slug: p.slug, title: p.title, description: p.description, category: p.category, minutes: readingMinutes(p), date: p.date }));
  const dates = Object.fromEntries(posts.map((p) => [p.slug, dateFmt.format(new Date(p.date))]));

  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-10 sm:pt-40">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.13),transparent)]" aria-hidden />
        <div className="container-x text-center">
          <div className="flex animate-rise justify-center">
            <Eyebrow icon={BookOpen}>{t("tag")}</Eyebrow>
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl animate-rise text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.03] font-medium text-balance [animation-delay:0.08s]">
            {t("title")} <span className="text-brand-500">{t("titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-rise text-[15.5px] leading-relaxed text-muted [animation-delay:0.16s]">{t("text")}</p>
          {locale !== "de" && (
            <p className="mx-auto mt-6 inline-flex max-w-xl items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-body shadow-[var(--shadow-soft)]">
              <Languages className="size-4 shrink-0 text-brand-600" aria-hidden /> {t("languageNote")}
            </p>
          )}
        </div>
      </section>

      <section className="pb-16 sm:pb-24" aria-label={t("listAria")}>
        <div className="container-x">
          <BlogList
            posts={summaries}
            categories={blogCategories}
            dates={dates}
            labels={{
              all: t("all"),
              filterAria: t("filterAria"),
              categories: Object.fromEntries(blogCategories.map((c) => [c, t(`categories.${c}`)])) as Record<(typeof blogCategories)[number], string>,
              minutes: t.raw("minutes") as string,
              read: t("read"),
              empty: t("empty"),
            }}
          />
        </div>
      </section>

      <FunnelSection title={t("funnel.title")} accent={t("funnel.accent")} text={t("funnel.text")} source="blog" />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: t("metaTitle"),
          url: absoluteUrl("/blog", locale),
          inLanguage: "de-DE",
          publisher: { "@id": ORG_ID },
          blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: absoluteUrl({ pathname: "/blog/[slug]", params: { slug: p.slug } }, "de"), datePublished: p.date })),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: ts("breadcrumbHome"), href: "/" },
            { name: t("tag"), href: "/blog" },
          ],
          locale,
        )}
      />
    </>
  );
}
