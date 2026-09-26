"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

/** Zählt weich zum neuen Wert (0.6 s, expo-out). Tabellarische Ziffern verhindern Springen. */
export function AnimatedNumber({ value, className, locale = "de" }: { value: number; className?: string; locale?: Locale }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.textContent = formatNumber(value, locale);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = formatNumber(v, locale)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduced, locale]);

  return (
    <span ref={ref} className={`num ${className ?? ""}`}>
      {formatNumber(value, locale)}
    </span>
  );
}
