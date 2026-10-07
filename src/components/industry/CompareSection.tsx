import NextLink from "next/link";
import { ArrowUpRight, BookOpen, Lightbulb, Scale } from "lucide-react";
import { getPost } from "@/content/blog";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/format";

export type CompareContent = {
  tag: string;
  title: string;
  accent: string;
  text: string;
  rowHeader: string;
  columns: string[];
  ownBadge: string;
  rows: { label: string; cells: string[] }[];
  adviceTitle: string;
  advice: string;
  guidesLabel: string;
};

/**
 * Einordnung direkt auf der Seite statt Weiterleitung in den Ratgeber:
 * drei Wege im Vergleich (Spalten als Karten, Zeilen per Subgrid auf einer Höhe),
 * darunter unsere Empfehlung und – klein – die passenden Artikel.
 */
export function CompareSection({ content: c, guides }: { content: CompareContent; guides: string[] }) {
  const posts = guides.map(getPost).filter((p) => p !== undefined);
  const own = c.columns.length - 1;
  return (
    <section aria-labelledby="compare-title" className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="compare-title" eyebrow={c.tag} icon={Scale} title={c.title} accent={c.accent} text={c.text} />
        </Reveal>

        <Reveal delay={0.08} className="mt-12 grid gap-4 md:grid-cols-3">
          {c.columns.map((col, ci) => {
            const dark = ci === own;
            return (
              <div
                key={col}
                style={{ gridRow: `span ${c.rows.length + 1}` }}
                className={cn("grid grid-rows-subgrid gap-0 rounded-[2rem] p-6 sm:p-7", dark ? "bg-night text-white shadow-[var(--shadow-float)]" : "border border-line bg-white shadow-[var(--shadow-soft)]")}
              >
                <div className="flex flex-col items-start justify-end pb-5">
                  {dark && <span className="mb-3 inline-flex rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">{c.ownBadge}</span>}
                  <h3 className={cn("text-xl leading-tight font-medium", dark && "text-white")}>{col}</h3>
                </div>
                {c.rows.map((r) => (
                  <div key={r.label} className={cn("border-t py-3.5", dark ? "border-white/10" : "border-line")}>
                    <p className={cn("text-xs", dark ? "text-night-muted" : "text-muted")}>{r.label}</p>
                    <p className={cn("num mt-0.5 text-[14.5px] leading-snug", dark ? "font-medium text-white" : "text-body")}>{r.cells[ci]}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </Reveal>

        <Reveal className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="card p-7 sm:p-8">
            <p className="flex items-center gap-2.5 text-sm font-medium text-ink">
              <span className="grid size-8 place-items-center rounded-full bg-blush-100 text-blush-600">
                <Lightbulb className="size-4" aria-hidden />
              </span>
              {c.adviceTitle}
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-body">{c.advice}</p>
          </div>
          {posts.length > 0 && (
            <div className="card p-7 sm:p-8">
              <p className="flex items-center gap-2.5 text-sm font-medium text-ink">
                <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <BookOpen className="size-4" aria-hidden />
                </span>
                {c.guidesLabel}
              </p>
              <ul className="mt-3 divide-y divide-line">
                {posts.map((p) => (
                  <li key={p.slug}>
                    <NextLink href={`/blog/${p.slug}`} className="group flex items-start justify-between gap-3 py-3 text-[14.5px] leading-snug text-body transition-colors hover:text-brand-600">
                      {p.title}
                      <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" aria-hidden />
                    </NextLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
