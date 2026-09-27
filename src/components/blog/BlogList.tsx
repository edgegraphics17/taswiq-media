"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import type { BlogCategory } from "@/content/blog";
import { BlogCard, type BlogSummary } from "@/components/blog/BlogCard";
import { cn } from "@/lib/format";

type Labels = { all: string; filterAria: string; categories: Record<BlogCategory, string>; minutes: string; read: string; empty: string };

/** Blog-Index mit Kategorie-Filter (Pillen wie im Portfolio). Erster Artikel groß. */
export function BlogList({ posts, categories, labels, dates }: { posts: BlogSummary[]; categories: BlogCategory[]; labels: Labels; dates: Record<string, string> }) {
  const [filter, setFilter] = useState<BlogCategory | "alle">("alle");
  const list = posts.filter((p) => filter === "alle" || p.category === filter);
  const options: (BlogCategory | "alle")[] = ["alle", ...categories];

  return (
    <>
      <LayoutGroup>
        <div role="group" aria-label={labels.filterAria} className="mx-auto flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-full border border-line bg-white p-1.5 shadow-[var(--shadow-soft)]">
          {options.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={cn("relative min-h-11 rounded-full px-4 text-sm font-medium transition-colors", filter === c ? "text-white" : "text-body hover:text-ink")}
            >
              {filter === c && <motion.span layoutId="blog-pill" className="absolute inset-0 rounded-full bg-brand-500 shadow-[var(--shadow-brand)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{c === "alle" ? labels.all : labels.categories[c]}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      <motion.div layout className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.div
              layout
              key={p.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn("flex", i === 0 && filter === "alle" && "md:col-span-2 lg:col-span-3")}
            >
              <BlogCard
                post={p}
                large={i === 0 && filter === "alle"}
                categoryLabel={labels.categories[p.category]}
                minutesLabel={labels.minutes.replace("{n}", String(p.minutes))}
                dateLabel={dates[p.slug]}
                readLabel={labels.read}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="mt-10 text-center text-muted">{labels.empty}</p>}
    </>
  );
}
