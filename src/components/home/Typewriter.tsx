"use client";

import { useEffect, useState } from "react";

/**
 * asap-Typewriter: tippt 80 ms/Zeichen, löscht 30 ms/Zeichen, hält 2,5 s.
 * Bei "Bewegung reduzieren" wechseln die Wörter ohne Tipp-Effekt.
 * Für Screenreader aria-hidden – der statische Text steht als sr-only daneben.
 */
export function Typewriter({ words }: { words: string[] }) {
  const [text, setText] = useState(words[0]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let wi = 0;
    let ci = words[0].length;
    let deleting = true;
    let t: ReturnType<typeof setTimeout>;

    if (reduced) {
      const id = setInterval(() => {
        wi = (wi + 1) % words.length;
        setText(words[wi]);
      }, 3500);
      return () => clearInterval(id);
    }

    const tick = () => {
      const w = words[wi];
      ci += deleting ? -1 : 1;
      setText(w.slice(0, ci));
      let delay = deleting ? 30 : 80;
      if (!deleting && ci === w.length) {
        deleting = true;
        delay = 2500;
      } else if (deleting && ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
        delay = 600;
      }
      t = setTimeout(tick, delay);
    };
    // Erstes Wort steht beim Laden schon da (kein leerer H1 → kein CLS), dann geht's los
    t = setTimeout(() => {
      setStarted(true);
      tick();
    }, 3200);
    return () => clearTimeout(t);
  }, [words]);

  return (
    <span className="inline-flex min-h-[1.15em] items-center whitespace-nowrap" aria-hidden data-started={started}>
      <span className="shine-text pr-0.5">{text || " "}</span>
      <span className="ml-1.5 inline-block h-[0.85em] w-[clamp(3px,0.55vw,6px)] translate-y-[2px] rounded-sm bg-teal animate-blink" />
    </span>
  );
}
