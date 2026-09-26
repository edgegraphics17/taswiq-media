import { cn } from "@/lib/format";

/**
 * Schwebende Info-Karte der Vorlage ("99 % Track and analyze", "Sales 35,500"):
 * absolut über Medien positioniert, weißer oder schwarzer Grund, weicher Schatten,
 * sanftes Schweben (bei "Bewegung reduzieren" still).
 */
export function FloatCard({
  className,
  tone = "light",
  slow,
  children,
}: {
  className?: string;
  tone?: "light" | "night";
  slow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute z-10 rounded-3xl p-3.5 shadow-[var(--shadow-float)]",
        tone === "night" ? "bg-night text-white" : "border border-line bg-white text-ink",
        slow ? "animate-float-slow" : "animate-float",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Mini-Balkendiagramm (dekorativ) für schwebende Stat-Karten */
export function MiniBars({ className, values = [40, 65, 50, 90, 70, 100] }: { className?: string; values?: number[] }) {
  return (
    <div className={cn("flex h-9 items-end gap-1", className)} aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className="w-2 origin-bottom animate-bars rounded-full bg-brand-400"
          style={{ height: `${v}%`, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

/** Weiche Mini-Kurve (dekorativ) */
export function MiniCurve({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={cn("h-10 w-28", className)} aria-hidden>
      <path d="M2 30 C 18 6, 30 36, 46 22 S 74 4, 88 18 S 108 30, 118 8" fill="none" stroke="var(--color-brand-500)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
