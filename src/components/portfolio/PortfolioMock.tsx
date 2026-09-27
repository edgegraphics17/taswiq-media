import Image from "next/image";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import type { PortfolioMedia } from "@/config/content";
import fog from "../../../public/images/fog.jpg";

/**
 * Visuals für Portfolio-Karten ohne Stock-Fotos: kleine Kompositionen, die zeigen,
 * WAS geliefert wird. Sobald echte Projektbilder da sind, `media` auf "site" oder "video" umstellen.
 */
type MockKey = "lineupSub" | "review" | "draft" | "draftSub" | "approve" | "approveSub" | "dashTitle" | "dashLeads" | "dashScore" | "dashWon" | "dashPremium" | "dashGrowth";

export function PortfolioMock({ type }: { type: Extract<PortfolioMedia, { type: "mock" }>["mock"] }) {
  const tp = useTranslations("portfolio");
  const t = (k: MockKey) => tp(`mock.${k}`);
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
              {(tp.raw("mock.menuSections") as string[]).map((c) => (
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
    case "dashboard":
      // Eigenes Lead-System: Kennzahlen, Pipeline, Score – so sieht das Admin-Dashboard aus
      return (
        <div className="absolute inset-0 grid place-items-center p-5">
          <div className="pf-mock w-[88%] max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-night-soft shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
              {["bg-blush-500", "bg-amber-400", "bg-mint-400"].map((c) => (
                <span key={c} className={`size-2 rounded-full ${c}`} />
              ))}
              <span className="ml-2 text-[9px] font-medium text-white/50">{t("dashTitle")}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 p-3">
              {[
                { l: t("dashLeads"), v: "128" },
                { l: t("dashScore"), v: "74" },
                { l: t("dashWon"), v: "31 %" },
              ].map((k) => (
                <div key={k.l} className="rounded-lg bg-white/5 p-2">
                  <p className="text-[8px] text-white/50">{k.l}</p>
                  <p className="num text-sm font-semibold text-white">{k.v}</p>
                </div>
              ))}
            </div>
            <div className="flex h-16 items-end gap-1 px-3 pb-3" aria-hidden>
              {[30, 48, 40, 62, 55, 78, 70, 92, 84, 100].map((h, i) => (
                <span key={i} className="flex-1 rounded-sm bg-brand-400" style={{ height: `${h}%`, opacity: 0.45 + i * 0.05 }} />
              ))}
            </div>
            <div className="space-y-1.5 border-t border-white/10 p-3">
              {[
                { n: "Autohaus M.", s: t("dashPremium"), c: "bg-brand-500" },
                { n: "Kanzlei P.", s: t("dashGrowth"), c: "bg-mint-500" },
              ].map((r) => (
                <div key={r.n} className="flex items-center justify-between rounded-md bg-white/5 px-2 py-1.5">
                  <span className="text-[9px] text-white/80">{r.n}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold text-white ${r.c}`}>{r.s}</span>
                </div>
              ))}
            </div>
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
              <p className="text-[10px] text-white/60">{t("lineupSub")}</p>
            </div>
          </div>
        </div>
      );
    case "mediakit":
      // Press-Kit-Seiten als Stapel – ohne Artist-Fotos (Bildrechte)
      return (
        <div className="absolute inset-0 grid place-items-center">
          <div className="pf-mock relative h-[58%] w-[70%]">
            {["BIO", "PRESS", "MEDIAKIT"].map((label, i) => (
              <div
                key={label}
                className="absolute inset-0 overflow-hidden rounded-xl border border-white/15 bg-night-soft shadow-2xl"
                style={{ transform: `translate(${(i - 1) * 18}px, ${(1 - i) * 12}px) rotate(${(i - 1) * 4}deg)` }}
              >
                <Image src={fog} alt="" fill sizes="400px" className="object-cover opacity-30 grayscale" />
                <p className="absolute bottom-3 left-4 text-2xl font-extrabold tracking-[0.12em] text-white/90">{label}</p>
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
              { t: t("review"), s: <span className="flex text-brand-300">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-2.5 fill-current" />)}</span> },
              { t: t("draft"), s: <span className="text-[10px] text-white/60">{t("draftSub")}</span> },
              { t: t("approve"), s: <span className="text-[10px] text-brand-300">{t("approveSub")}</span> },
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
