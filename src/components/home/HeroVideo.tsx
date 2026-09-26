"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";

/**
 * Showreel im Hero: Poster (next/image) liegt darunter und ist sofort da (LCP),
 * das Video blendet ein, sobald es spielt. Bei "Bewegung reduzieren" oder
 * aktivem Datensparmodus bleibt es beim Standbild.
 */
export function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    setAllowed(!reduced && !saveData);
  }, []);

  if (!allowed) return null;
  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
      onPlaying={() => setPlaying(true)}
      className={cn("absolute inset-0 size-full object-cover transition-opacity duration-1000", playing ? "opacity-100" : "opacity-0")}
    />
  );
}
