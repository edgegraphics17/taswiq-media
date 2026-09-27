"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/format";

/**
 * Stummer Vorschau-Clip eines echten Projekts über einem optimierten Standbild.
 * Desktop: spielt beim Hover/Fokus der Karte. Touch-Geräte: spielt, solange die
 * Karte im Bild ist. "Bewegung reduzieren": nur Standbild. preload="none" →
 * kein Datenverbrauch, bevor jemand hinschaut.
 */
export function CaseVideo({ src, poster, alt }: { src: string; poster: string; alt: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const video = ref.current;
    const card = video?.closest("article");
    if (!video || !card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const play = () => video.play().catch(() => {});
    const pause = () => video.pause();

    if (window.matchMedia("(hover: hover)").matches) {
      card.addEventListener("mouseenter", play);
      card.addEventListener("mouseleave", pause);
      card.addEventListener("focusin", play);
      card.addEventListener("focusout", pause);
      return () => {
        card.removeEventListener("mouseenter", play);
        card.removeEventListener("mouseleave", pause);
        card.removeEventListener("focusin", play);
        card.removeEventListener("focusout", pause);
      };
    }
    const obs = new IntersectionObserver(([e]) => (e.isIntersecting ? play() : pause()), { threshold: 0.6 });
    obs.observe(card);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Image src={poster} alt={alt} fill sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover" />
      <video
        ref={ref}
        src={src}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        onPlaying={() => setVisible(true)}
        className={cn("absolute inset-0 size-full object-cover transition-opacity duration-500", visible ? "opacity-100" : "opacity-0")}
      />
    </>
  );
}
