"use client";

import { useEffect, useRef, useState } from "react";

/**
 * asap-Mobile-Slider: markiert die Karte in der Mitte als aktiv (Threshold 0.6)
 * und liefert den Index für die Punkte-Navigation. Nur < 900 px aktiv.
 */
export function useActiveSlide<T extends HTMLElement>(count: number) {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const mq = window.matchMedia("(max-width: 899px)");
    let obs: IntersectionObserver | null = null;

    const setup = () => {
      obs?.disconnect();
      const items = Array.from(root.children) as HTMLElement[];
      if (!mq.matches) {
        items.forEach((el) => el.classList.remove("is-active"));
        return;
      }
      obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            const el = e.target as HTMLElement;
            if (e.isIntersecting) {
              items.forEach((i) => i.classList.remove("is-active"));
              el.classList.add("is-active");
              setActive(items.indexOf(el));
            }
          });
        },
        { root, threshold: 0.6 },
      );
      items.forEach((el) => obs!.observe(el));
    };

    setup();
    mq.addEventListener("change", setup);
    return () => {
      obs?.disconnect();
      mq.removeEventListener("change", setup);
    };
  }, [count]);

  const scrollTo = (i: number) => {
    const el = ref.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return { ref, active, scrollTo };
}
