import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight, Calculator, CircleCheck, Clock, Plus } from "lucide-react";
import { getPost, posts, readingMinutes, relatedPosts } from "@/content/blog";
import { getSeoPageById } from "@/config/seo-pages";
import { site } from "@/config/site";
import { Block, Inline } from "@/components/blog/RichText";
import { BlogCard, blogCover, CATEGORY_ICON } from "@/components/blog/BlogCard";
import { DemoCallout } from "@/components/home/DemoStrip";
import { FunnelSection } from "@/components/product/FunnelSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/i18n/routing";
import { LOCALE_META } from "@/i18n/routing";
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd, ORG_ID, seoTitle } from "@/lib/seo";

/** Artikel gibt es nur auf Deutsch – /en/blog/<slug> leitet next.config.ts auf die deutsche URL um. */
export const dynamicParams = false;
export function generateStaticParams() {
  return posts.map((p) => ({ locale: "de", slug: p.slug }));
}

type Props = { params: Promise<{ locale: Locale; slug: string }> };

const anchor = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = absoluteUrl({ pathname: "/blog/[slug]", params: { slug } }, "de");
  return {
    title: seoTitle(post.seoTitle ?? post.title),
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url, languages: { "de-DE": url, "x-default": url } },
    authors: [{ name: site.owner }],
    openGraph: {
      type: "article",
      locale: "de_DE",
      url,
      siteName: site.name,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [site.owner],
      images: [{ url: `${site.url}${blogCover(slug)}`, width: 1600, height: 900 }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [`${site.url}${blogCover(slug)}`] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = getPost(slug);
  if (!post) notFound();

  const t = await getTranslations("blog");
  const tSeo = await getTranslations("seoPages");
  const ts = await getTranslations("schema");
  const page = getSeoPageById(post.page);
  const minutes = readingMinutes(post);
  const dateFmt = new Intl.DateTimeFormat(LOCALE_META.de.intl, { day: "numeric", month: "long", year: "numeric" });
  const related = relatedPosts(post);
  const CatIcon = CATEGORY_ICON[post.category];
  const url = absoluteUrl({ pathname: "/blog/[slug]", params: { slug } }, "de");
  const pageHref = `/leistungen/${page.slugs.de}`;

  return (
    <>
      <article lang="de" className="pt-32 sm:pt-40">
        <header className="container-x max-w-6xl">
          <NextLink href="/blog" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-body shadow-[var(--shadow-soft)] transition hover:text-brand-600">
            <ArrowLeft className="size-4" aria-hidden /> {t("back")}
          </NextLink>
          <p className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-muted">
            <span className="grid size-6 place-items-center rounded-lg bg-blush-100 text-blush-600">
              <CatIcon className="size-3.5" aria-hidden />
            </span>
            {t(`categories.${post.category}`)}
          </p>
          <h1 className="mt-4 max-w-4xl text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.06] font-medium text-balance">{post.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{post.intro}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            <span className="font-medium text-ink">{site.owner}</span>
            <time dateTime={post.date}>{dateFmt.format(new Date(post.date))}</time>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {t("minutes", { n: minutes })}
            </span>
          </div>
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[2rem] bg-night shadow-[var(--shadow-float)] sm:aspect-[21/9] sm:rounded-[2.5rem]">
            <Image src={blogCover(post.slug)} alt="" fill priority sizes="(min-width:1280px) 1150px, 100vw" className="object-cover" />
          </div>
        </header>

        <div className="container-x mt-12 grid max-w-6xl gap-10 lg:grid-cols-[1fr_280px] lg:gap-14">
          <div className="min-w-0">
            {/* Kurzfassung */}
            <section aria-labelledby="takeaways" className="card-night p-6 sm:p-8">
              <h2 id="takeaways" className="text-lg font-medium text-white">
                {t("takeaways")}
              </h2>
              <ul className="mt-4 grid gap-3">
                {post.takeaways.map((k) => (
                  <li key={k} className="flex gap-3 text-[15px] leading-relaxed text-night-muted">
                    <CircleCheck className="mt-0.5 size-5 shrink-0 text-mint-400" aria-hidden />
                    <span>
                      <Inline text={k} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Passende Software-Demo zum Ausprobieren (Media-Artikel haben keine) */}
            {page.kind !== "media" && <DemoCallout slug={page.demo} className="mt-6" />}

            {post.sections.map((s) => (
              <section key={s.h2} aria-labelledby={anchor(s.h2)} className="mt-12 scroll-mt-28">
                <h2 id={anchor(s.h2)} className="text-[clamp(1.5rem,3vw,2.1rem)] leading-tight font-medium">
                  {s.h2}
                </h2>
                <div className="mt-5 grid gap-5">
                  {s.blocks.map((b, i) => (
                    <Block key={i} block={b} />
                  ))}
                </div>
              </section>
            ))}

            {/* FAQ */}
            <section aria-labelledby="faq" className="mt-14">
              <h2 id="faq" className="text-[clamp(1.5rem,3vw,2.1rem)] leading-tight font-medium">
                {t("faq")}
              </h2>
              <div className="mt-5 grid gap-2.5">
                {post.faq.map((f) => (
                  <details key={f.q} className="group rounded-3xl border border-line bg-white px-6 shadow-[var(--shadow-soft)] open:ring-2 open:ring-brand-500/60">
                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
                      {f.q}
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas text-brand-600 transition-transform duration-300 group-open:rotate-45 group-open:bg-brand-500 group-open:text-white">
                        <Plus className="size-4" aria-hidden />
                      </span>
                    </summary>
                    <p className="pb-6 leading-relaxed text-muted">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* Seitenleiste: Inhalt + passende Leistung */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav aria-label={t("toc")} className="card hidden p-6 lg:block">
              <p className="text-sm font-semibold text-ink">{t("toc")}</p>
              <ol className="mt-3 grid gap-1">
                {post.sections.map((s, i) => (
                  <li key={s.h2}>
                    <a href={`#${anchor(s.h2)}`} className="flex min-h-10 gap-2.5 rounded-xl px-2 py-2 text-[13.5px] leading-snug text-body transition hover:bg-canvas hover:text-brand-600">
                      <span className="num text-muted">{String(i + 1).padStart(2, "0")}</span>
                      {s.h2}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="card-night mt-4 p-6">
              <span className="grid size-11 place-items-center rounded-full bg-mint-500 text-white">
                <Icon name={page.icon} className="size-5" />
              </span>
              <p className="mt-4 text-lg leading-snug font-medium text-white">{tSeo(`${page.id}.navLabel`)}</p>
              <p className="mt-2 text-sm leading-relaxed text-night-muted">{t("ctaText")}</p>
              <NextLink href={pageHref} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-5 text-[15px] font-medium text-white shadow-[var(--shadow-brand)] transition hover:bg-brand-600">
                {t("ctaPage")} <ArrowRight className="size-4" aria-hidden />
              </NextLink>
              <NextLink href="/preisrechner" className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-[15px] font-medium text-white transition hover:bg-white/10">
                <Calculator className="size-4" aria-hidden /> {t("ctaCalculator")}
              </NextLink>
            </div>
          </aside>
        </div>
      </article>

      {/* Weiterlesen */}
      <section aria-labelledby="related" className="py-16 sm:py-24">
        <div className="container-x">
          <h2 id="related" className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium">
            {t("related")}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <div key={r.slug} className="flex">
                <BlogCard
                  post={{ slug: r.slug, title: r.title, description: r.description, category: r.category, minutes: readingMinutes(r), date: r.date }}
                  categoryLabel={t(`categories.${r.category}`)}
                  minutesLabel={t("minutes", { n: readingMinutes(r) })}
                  dateLabel={dateFmt.format(new Date(r.date))}
                  readLabel={t("read")}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <FunnelSection title={t("funnel.title")} accent={t("funnel.accent")} text={t("funnel.text")} source="blog" industry={page.industry} interests={page.interests} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          image: `${site.url}${blogCover(post.slug)}`,
          headline: post.title,
          description: post.description,
          url,
          mainEntityOfPage: url,
          inLanguage: "de-DE",
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          keywords: post.keywords.join(", "),
          wordCount: minutes * 200,
          author: { "@type": "Person", name: site.owner, url: site.url },
          publisher: { "@id": ORG_ID },
          about: tSeo(`${page.id}.keyword`),
        }}
      />
      <JsonLd data={faqJsonLd(post.faq, "de")} />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: ts("breadcrumbHome"), href: "/" },
            { name: t("tag"), href: "/blog" },
            { name: post.title, href: { pathname: "/blog/[slug]", params: { slug } } },
          ],
          "de",
        )}
      />
    </>
  );
}
