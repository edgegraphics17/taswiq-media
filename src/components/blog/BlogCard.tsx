import Image from "next/image";
import NextLink from "next/link";
import { ArrowUpRight, BookOpen, Building2, Clapperboard, CodeXml, Sparkles, type LucideIcon } from "lucide-react";
import type { BlogCategory } from "@/content/blog";
import { cn } from "@/lib/format";

export type BlogSummary = { slug: string; title: string; description: string; category: BlogCategory; minutes: number; date: string };

export const CATEGORY_ICON: Record<BlogCategory, LucideIcon> = {
  branchen: Building2,
  software: CodeXml,
  ki: Sparkles,
  ratgeber: BookOpen,
  media: Clapperboard,
};

/** Titelbild eines Artikels: public/images/blog/<slug>.webp (16:9, Nachweise in docs/IMAGE-CREDITS.md) */
export const blogCover = (slug: string) => `/images/blog/${slug}.webp`;

/**
 * Artikel-Karte. Der Blog ist deutschsprachig → Links zeigen immer auf die deutsche URL /blog/<slug>.
 */
export function BlogCard({
  post,
  categoryLabel,
  minutesLabel,
  dateLabel,
  readLabel,
  large,
}: {
  post: BlogSummary;
  categoryLabel: string;
  minutesLabel: string;
  dateLabel: string;
  readLabel: string;
  large?: boolean;
}) {
  const Ico = CATEGORY_ICON[post.category];
  return (
    <article className={cn("card group relative flex w-full flex-col p-2.5 transition-[transform,box-shadow] duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)]", large && "lg:flex-row")}>
      <div className={cn("relative flex overflow-hidden rounded-[1.6rem] bg-night p-5", large ? "min-h-56 lg:w-[46%] lg:min-h-80" : "aspect-[16/10]")}>
        <Image
          src={blogCover(post.slug)}
          alt=""
          fill
          sizes={large ? "(min-width:1024px) 560px, 100vw" : "(min-width:1024px) 400px, (min-width:768px) 50vw, 100vw"}
          className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent" aria-hidden />
        <span className="relative inline-flex h-fit items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink shadow-[var(--shadow-soft)] backdrop-blur">
          <Ico className="size-3.5 text-brand-600" aria-hidden /> {categoryLabel}
        </span>
      </div>
      <div className={cn("flex flex-1 flex-col px-4 pt-5 pb-4", large && "lg:justify-center lg:px-8")}>
        <p className="text-xs text-muted">
          {dateLabel} · {minutesLabel}
        </p>
        <h3 className={cn("mt-2 font-medium text-balance text-ink", large ? "text-2xl sm:text-3xl" : "text-lg leading-snug")}>
          <NextLink href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:rounded-[2rem] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand-500">
            {post.title}
          </NextLink>
        </h3>
        <p className={cn("mt-2 text-sm leading-relaxed text-muted", !large && "line-clamp-3")}>{post.description}</p>
        <span aria-hidden className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-brand-600">
          {readLabel} <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  );
}
