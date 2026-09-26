import { STATUS_LABEL, STATUS_TONE, TIER_LABEL } from "@/lib/admin/labels";
import type { LeadRow } from "@/types/database";
import { cn } from "@/lib/format";

export function StatusPill({ status }: { status: LeadRow["status"] }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset", STATUS_TONE[status])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function TierPill({ tier }: { tier: LeadRow["tier"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide whitespace-nowrap",
        tier === "premium" ? "bg-ink-900 text-white" : tier === "growth" ? "bg-teal-wash text-teal-deep" : "border border-line text-muted",
      )}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}

/** Score 0–100 als dünner Einzelfarb-Balken + Zahl (Zahl trägt die Information, Balken die Gestalt). */
export function ScoreBar({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-2" title={`Lead-Score ${score} von 100`}>
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-line" aria-hidden>
        <span className="block h-full rounded-full bg-teal-deep" style={{ width: `${score}%` }} />
      </span>
      <span className="num text-xs font-semibold text-ink">{score}</span>
    </span>
  );
}
