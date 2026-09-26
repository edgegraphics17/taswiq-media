"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { formatNumber } from "@/lib/format";

/** Zählt weich zum neuen Wert (0.6 s, expo-out). Tabellarische Ziffern verhindern Springen. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.textContent = formatNumber(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = formatNumber(v)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduced]);

  return (
    <span ref={ref} className={`num ${className ?? ""}`}>
      {formatNumber(value)}
    </span>
  );
}
