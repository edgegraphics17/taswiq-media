"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/format";

/**
 * Vorschau einer Demo auf der Übersicht: das Bild der Demo im Rahmen der Musterfirma, darüber derselbe
 * Ansichts-Umschalter wie in der Demo selbst (Kundenseite / Dashboard). Ein Klick aufs Bild öffnet die Demo in der gewählten Ansicht.
 * Bilder der zweiten Ansicht werden erst geladen, wenn jemand den Umschalter berührt.
 */
export function DemoPreview({ slug, firm, tint, views, priority }: { slug: string; firm: string; tint: string; views: { id: string; label: string; image: string }[]; priority?: boolean }) {
  const [view, setView] = useState(views[0].id);
  const [loaded, setLoaded] = useState<string[]>([views[0].id]);
  const pick = (id: string) => {
    setLoaded((l) => (l.includes(id) ? l : [...l, id]));
    setView(id);
  };
  const warm = () => setLoaded(views.map((v) => v.id));
  const current = views.find((v) => v.id === view) ?? views[0];
  const href = `/demo/${slug}${current.id === views[0].id ? "" : `?ansicht=${current.id}`}`;

  return (
    <div className="flex h-full flex-col rounded-[1.6rem] p-3 sm:p-4" style={{ background: tint }}>
      <div className="flex items-center justify-between gap-3">
        <div role="group" aria-label={`Ansicht der Demo ${firm}`} onPointerEnter={warm} onFocus={warm} className="flex gap-0.5 rounded-full bg-white/70 p-0.5 ring-1 ring-ink/5">
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={view === v.id}
              onClick={() => pick(v.id)}
              className={cn("min-h-9 rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-200", view === v.id ? "bg-ink text-white" : "text-body hover:text-ink")}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="hidden items-center gap-1.5 text-xs font-medium text-body sm:flex">
          <span className="size-1.5 rounded-full bg-mint-500" aria-hidden /> Live-Demo
        </p>
      </div>
      <div className="flex flex-1 items-center pt-3 sm:pt-4 lg:pb-1">
      <Link
        href={href}
        prefetch={false}
        aria-label={`Demo ${firm} öffnen – ${current.label}`}
        className="group/shot relative block aspect-[1440/848] w-full overflow-hidden rounded-xl bg-night shadow-[var(--shadow-float)] ring-1 ring-ink/10"
      >
        {views.map(
          (v, i) =>
            loaded.includes(v.id) && (
              <Image
                key={v.id}
                src={v.image}
                alt={view === v.id ? `Demo ${firm}: ${v.label}` : ""}
                fill
                priority={priority && i === 0}
                sizes="(min-width:1280px) 700px, (min-width:1024px) 56vw, 100vw"
                className={cn("object-cover object-top transition-[opacity,transform] duration-500 ease-[var(--ease-soft)] group-hover/shot:scale-[1.015]", view === v.id ? "opacity-100" : "opacity-0")}
              />
            ),
        )}
        <span className="absolute right-3 bottom-3 inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-ink opacity-0 shadow-[var(--shadow-soft)] transition-[opacity,transform] duration-300 group-hover/shot:translate-y-0 group-hover/shot:opacity-100 group-focus-visible/shot:translate-y-0 group-focus-visible/shot:opacity-100">
          {current.label} öffnen <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </Link>
      </div>
    </div>
  );
}
