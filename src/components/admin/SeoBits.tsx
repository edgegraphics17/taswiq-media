import { cn } from "@/lib/format";

/** Veränderung zum Vorzeitraum; bei der Position ist kleiner besser. */
export function Delta({ now, prev, lowerIsBetter }: { now: number; prev: number; lowerIsBetter?: boolean }) {
  if (!prev || !now) return null;
  const d = lowerIsBetter ? prev - now : (now - prev) / prev;
  const good = d > 0;
  const label = lowerIsBetter ? `${d > 0 ? "+" : ""}${d.toLocaleString("de-DE", { maximumFractionDigits: 1 })}` : `${d > 0 ? "+" : ""}${Math.round(d * 100)} %`;
  return <span className={cn("num text-xs font-semibold", Math.abs(d) < 0.005 ? "text-muted" : good ? "text-emerald-700" : "text-red-700")}>{label}</span>;
}

export function Panel({ title, hint, action, children, className }: { title: string; hint?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0 rounded-2xl border border-line bg-white p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
