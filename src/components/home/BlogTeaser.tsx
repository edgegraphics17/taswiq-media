import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen } from "lucide-react";
import { getPost, posts, readingMinutes, type BlogPost } from "@/content/blog";
import { LOCALE_META, type Locale } from "@/i18n/routing";
import { BlogCard } from "@/components/blog/BlogCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Ratgeber-Teaser: drei Artikel (Standard: die ersten drei, sonst Auswahl per Slug). */
export async function BlogTeaser({ slugs, title }: { slugs?: string[]; title?: string }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("blog");
  const list = (slugs ? slugs.map(getPost).filter(Boolean) : posts.slice(0, 3)) as BlogPost[];
  if (!list.length) return null;
  const dateFmt = new Intl.DateTimeFormat(LOCALE_META[locale].intl, { day: "numeric", month: "long", year: "numeric" });
  return (
    <section aria-labelledby="blog-teaser-title" className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="blog-teaser-title" eyebrow={t("tag")} icon={BookOpen} title={title ?? t("teaserTitle")} text={t("teaserText")} />
        </Reveal>
        <div className={`mt-12 grid gap-4 ${list.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {list.map((p) => (
            <div key={p.slug} className="flex">
              <BlogCard
                post={{ slug: p.slug, title: p.title, description: p.description, category: p.category, minutes: readingMinutes(p), date: p.date }}
                categoryLabel={t(`categories.${p.category}`)}
                minutesLabel={t("minutes").replace("{n}", String(readingMinutes(p)))}
                dateLabel={dateFmt.format(new Date(p.date))}
                readLabel={t("read")}
              />
            </div>
          ))}
        </div>
        <Reveal className="mt-10 flex justify-center">
          <ButtonLink href="/blog" variant="white">
            {t("teaserCta")} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
