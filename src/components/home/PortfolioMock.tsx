import Image from "next/image";
import { Play, Star } from "lucide-react";
import type { PortfolioItem } from "@/config/content";
import fog from "../../../public/images/fog.jpg";

/**
 * Visuals für Portfolio-Karten ohne Stock-Fotos: kleine Kompositionen, die zeigen,
 * WAS geliefert wird. Sobald echte Projektbilder da sind, `mock` durch `image` ersetzen.
 */
export function PortfolioMock({ type }: { type: NonNullable<PortfolioItem["mock"]> }) {
  switch (type) {
    case "menu":
      // Speisekarte im Rechnungs-Look (Navy-Kopf, Teal-Labels)
      return (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_70%_30%,rgb(90_174_184/0.25),transparent_60%)]">
          <div className="pf-mock w-[62%] max-w-[340px] -rotate-3 overflow-hidden rounded-lg bg-white shadow-2xl sm:w-[46%]">
            <div className="relative h-16 overflow-hidden bg-night">
              <Image src={fog} alt="" fill sizes="340px" className="object-cover opacity-50" />
              <p className="absolute bottom-2 left-4 text-lg font-extrabold tracking-[0.18em] text-white">LILY&apos;S</p>
            </div>
            <div className="space-y-2.5 p-4">
              {["Vorspeisen & Suppen", "Currys & Wok", "Salate & Bowls"].map((c) => (
                <div key={c}>
                  <p className="text-[8px] font-bold tracking-[0.2em] text-brand-600 uppercase">{c}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="h-1.5 w-2/3 rounded bg-ink/15" />
                    <span className="h-1.5 w-6 rounded bg-ink/25" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "film":
      return (
        <div className="absolute inset-0 grid place-items-center">
          <div className="pf-mock relative aspect-video w-[78%] overflow-hidden rounded-xl border border-white/15 shadow-2xl">
            <Image src={fog} alt="" fill sizes="500px" className="object-cover object-bottom" />
            <div className="absolute inset-0 bg-night/40" />
            <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-500 text-white">
              <Play className="size-5 translate-x-px fill-current" aria-hidden />
            </span>
            <div className="absolute inset-x-3 bottom-3 h-1 rounded-full bg-white/25">
              <div className="h-full w-2/5 rounded-full bg-brand-500" />
            </div>
            <span className="absolute top-2.5 left-3 text-[10px] font-bold tracking-widest text-white/80">4K · 16:9</span>
          </div>
        </div>
      );
    case "phones":
      return (
        <div className="absolute inset-0 flex items-center justify-center gap-3">
          {["30% 50%", "55% 70%", "80% 40%"].map((pos, i) => (
            <div
              key={pos}
              className="pf-mock relative aspect-[9/16] w-[24%] overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl"
              style={{ transform: `translateY(${i === 1 ? -14 : 10}px) rotate(${(i - 1) * 5}deg)` }}
            >
              <Image src={fog} alt="" fill sizes="160px" className="object-cover" style={{ objectPosition: pos }} />
              <div className="absolute inset-x-2 bottom-2 space-y-1">
                <span className="block h-1 w-3/4 rounded bg-white/70" />
                <span className="block h-1 w-1/2 rounded bg-white/40" />
              </div>
            </div>
          ))}
        </div>
      );
    case "wave":
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          <div className="pf-mock flex h-20 items-center gap-1" aria-hidden>
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-brand-400"
                style={{ height: `${Math.round(20 + Math.abs(Math.sin(i * 0.9)) * 60 + (i % 3) * 6)}%` }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {["DE", "EN", "AR", "TR"].map((l, i) => (
              <span key={l} className={`rounded-full px-3 py-1 text-xs font-bold ${i === 0 ? "bg-brand-500 text-white" : "border border-white/20 text-white/80"}`}>
                {l}
              </span>
            ))}
          </div>
        </div>
      );
    case "lineup":
      return (
        <div className="absolute inset-0 grid place-items-center">
          <div className="pf-mock relative aspect-[4/5] w-[46%] overflow-hidden rounded-xl border border-white/15 shadow-2xl">
            <Image src={fog} alt="" fill sizes="300px" className="object-cover object-top hue-rotate-[160deg] saturate-150" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(24_34_46/0.2),rgb(24_34_46/0.95))]" />
            <div className="absolute inset-x-3 bottom-3 text-center">
              <p className="text-[10px] font-bold tracking-[0.3em] text-brand-300">LIVE · 2026</p>
              <p className="mt-1 text-sm leading-tight font-extrabold text-white">CLUBS & FESTIVALS</p>
              <p className="text-[10px] text-white/60">Flyer · Teaser · Countdown</p>
            </div>
          </div>
        </div>
      );
    case "mediakit":
      // Press-Kit-Seiten als Stapel – ohne Artist-Fotos (Bildrechte)
      return (
        <div className="absolute inset-0 grid place-items-center">
          <div className="pf-mock relative h-[58%] w-[70%]">
            {["BIO", "PRESS", "MEDIAKIT"].map((t, i) => (
              <div
                key={t}
                className="absolute inset-0 overflow-hidden rounded-xl border border-white/15 bg-night-soft shadow-2xl"
                style={{ transform: `translate(${(i - 1) * 18}px, ${(1 - i) * 12}px) rotate(${(i - 1) * 4}deg)` }}
              >
                <Image src={fog} alt="" fill sizes="400px" className="object-cover opacity-30 grayscale" />
                <p className="absolute bottom-3 left-4 text-2xl font-extrabold tracking-[0.12em] text-white/90">{t}</p>
                <span className="absolute top-3 right-3 h-1.5 w-10 rounded-full bg-brand-500" />
              </div>
            ))}
          </div>
        </div>
      );
    case "nodes":
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="pf-mock flex items-center gap-2 sm:gap-4">
            {[
              { t: "Google-Review", s: <span className="flex text-brand-300">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-2.5 fill-current" />)}</span> },
              { t: "KI-Entwurf", s: <span className="text-[10px] text-white/60">im Ton des Hauses</span> },
              { t: "Freigabe", s: <span className="text-[10px] text-brand-300">1 Klick</span> },
            ].map((n, i) => (
              <div key={n.t} className="flex items-center gap-2 sm:gap-4">
                <div className={`rounded-xl border px-3 py-2.5 text-center ${i === 1 ? "border-brand-400 bg-brand-500/20" : "border-white/15 bg-white/5"}`}>
                  <p className="text-xs font-bold text-white">{n.t}</p>
                  <div className="mt-1 flex justify-center">{n.s}</div>
                </div>
                {i < 2 && <span className="h-px w-5 bg-brand-500 sm:w-10" aria-hidden />}
              </div>
            ))}
          </div>
        </div>
      );
  }
}
