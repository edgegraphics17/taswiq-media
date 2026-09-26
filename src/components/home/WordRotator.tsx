"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Wechselt Wörter mit weichem Slide von unten (alle 2,6 s).
 * Eine unsichtbare Kopie des längsten Wortes gibt Breite & Höhe vor (kein Layout-Sprung),
 * die Wörter liegen absolut darin und werden von der Maske sauber beschnitten.
 */
export function WordRotator({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  const longest = words.reduce((a, b) => (a.length > b.length ? a : b));

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % words.length), reduced ? 4000 : 2600);
    return () => clearInterval(id);
  }, [words.length, reduced]);

  return (
    <span className="relative inline-block overflow-hidden pb-[0.14em] align-bottom -mb-[0.14em]" aria-hidden>
      <span className="invisible whitespace-nowrap">{longest}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={words[i]}
          className="absolute inset-x-0 top-0 text-center whitespace-nowrap text-brand-500"
          initial={{ y: "140%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-140%", opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
