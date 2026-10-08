"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { TourStep } from "@/demos/registry";

/**
 * Geführte Tour: hebt je Schritt ein Element (data-tour="…") hervor und erklärt es in einer kleinen Karte.
 * Die Hülle wechselt vor jedem Schritt in die passende Ansicht; hier wird nur gesucht, gemessen und gezeichnet.
 * Jederzeit überspringbar (Schaltfläche oder Escape), Pfeiltasten blättern.
 */
type Box = { top: number; left: number; width: number; height: number };

const PAD = 6;

export function Tour({ steps, index, onIndex, onClose, onDone }: { steps: TourStep[]; index: number; onIndex: (i: number) => void; onClose: () => void; onDone: () => void }) {
  const step = steps[index];
  const last = index === steps.length - 1;
  const [box, setBox] = useState<Box | null>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [cardH, setCardH] = useState(190);

  const next = useCallback(() => (last ? onDone() : onIndex(index + 1)), [last, onDone, onIndex, index]);
  const prev = useCallback(() => index > 0 && onIndex(index - 1), [index, onIndex]);

  // Ziel suchen (die App lädt ggf. noch), in den Blick holen und laufend nachmessen – Scrollen, Umbruch, Animationen.
  useEffect(() => {
    let raf = 0;
    let scrolled = false;
    let tries = 0;
    const tick = () => {
      setVp((v) => (v.w === window.innerWidth && v.h === window.innerHeight ? v : { w: window.innerWidth, h: window.innerHeight }));
      const el = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null;
      if (el) {
        if (!scrolled) {
          scrolled = true;
          const r = el.getBoundingClientRect();
          const tall = r.height > window.innerHeight * 0.6;
          el.scrollIntoView({ block: tall ? "start" : "center", behavior: "instant" });
        }
        const r = el.getBoundingClientRect();
        setBox((b) => (b && Math.abs(b.top - r.top) < 0.5 && Math.abs(b.left - r.left) < 0.5 && Math.abs(b.width - r.width) < 0.5 && Math.abs(b.height - r.height) < 0.5 ? b : { top: r.top, left: r.left, width: r.width, height: r.height }));
      } else if (!step.target || ++tries > 90) {
        setBox(null);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [index, vp.w]);

  useEffect(() => {
    nextRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  // Karte: auf dem Handy am unteren (oder oberen) Rand, sonst unter/über dem Ziel
  const mobile = vp.w > 0 && vp.w < 640;
  const cardW = Math.min(360, vp.w - 24);
  let style: React.CSSProperties;
  if (!box) {
    style = mobile ? { left: 12, right: 12, bottom: 12 } : { left: (vp.w - cardW) / 2, top: Math.max(80, (vp.h - cardH) / 2), width: cardW };
  } else if (mobile) {
    const targetLow = box.top + box.height / 2 > vp.h / 2;
    style = targetLow ? { left: 12, right: 12, top: 108 } : { left: 12, right: 12, bottom: 12 };
  } else {
    const below = box.top + box.height + PAD + 12 + cardH < vp.h;
    const above = box.top - PAD - 12 - cardH > 60;
    const top = below ? box.top + box.height + PAD + 12 : above ? box.top - PAD - 12 - cardH : Math.max(72, vp.h - cardH - 16);
    const left = Math.min(Math.max(12, box.left + box.width / 2 - cardW / 2), vp.w - cardW - 12);
    style = { top, left, width: cardW };
  }

  // Sichtbarer Teil des Ziels (hohe Elemente ragen aus dem Fenster)
  const spot = box
    ? {
        top: Math.max(box.top - PAD, 56),
        left: Math.max(box.left - PAD, 4),
        width: Math.min(box.width + PAD * 2, vp.w - 8),
        height: Math.max(0, Math.min(box.top + box.height + PAD, vp.h - 4) - Math.max(box.top - PAD, 56)),
      }
    : null;

  return (
    <div className="fixed inset-0 z-[70] font-sans" role="dialog" aria-modal="true" aria-label="Tour durch die Demo">
      {/* Fängt Klicks ab: Während der Tour bleibt die App stehen */}
      <div className="absolute inset-0" />
      {spot ? (
        <div className="pointer-events-none absolute rounded-xl shadow-[0_0_0_9999px_rgb(12_12_14/0.6)] ring-2 ring-white/80 transition-[top,left,width,height] duration-200 ease-out" style={spot} aria-hidden />
      ) : (
        <div className="absolute inset-0 bg-[rgb(12_12_14/0.6)]" aria-hidden />
      )}

      <div ref={cardRef} className="absolute animate-demo-in rounded-2xl bg-white p-5 text-body shadow-[var(--shadow-float)]" style={style} key={index}>
        <div className="flex items-center justify-between gap-3">
          <p className="num text-xs font-medium text-muted" aria-live="polite">
            Schritt {index + 1} von {steps.length}
          </p>
          <button type="button" onClick={onClose} className="-m-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-xs font-medium text-muted hover:text-ink">
            Tour überspringen <X className="size-3.5" aria-hidden />
          </button>
        </div>
        <h2 className="mt-2 text-lg leading-snug font-semibold text-ink">{step.title}</h2>
        <p className="mt-1.5 text-[14.5px] leading-relaxed">{step.text}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-1" aria-hidden>
            {steps.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all ${i === index ? "w-5 bg-brand-500" : i < index ? "w-1.5 bg-brand-300" : "w-1.5 bg-line"}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <button type="button" onClick={prev} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium text-ink hover:border-brand-200">
                <ArrowLeft className="size-4" aria-hidden /> Zurück
              </button>
            )}
            <button ref={nextRef} type="button" onClick={next} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand-500 px-5 text-sm font-medium text-white hover:bg-brand-600">
              {last ? "Loslegen" : "Weiter"} {!last && <ArrowRight className="size-4" aria-hidden />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
