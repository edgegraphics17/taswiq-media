import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { cn } from "@/lib/format";

/**
 * "backed by winsym.ai" – Technologie-Partner aus Kuala Lumpur.
 * Wortmarke typografisch nachgebaut (kein fremdes Logo-Asset), verlinkt auf winsym.ai.
 */
export async function PartnerBadge({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const t = await getTranslations("partner");
  const dark = tone === "dark";
  return (
    <a
      href={site.partner.url}
      target="_blank"
      rel="noopener"
      className={cn(
        "group inline-flex min-h-10 items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-[13px] transition",
        dark ? "border-white/15 bg-white/[0.06] text-night-muted hover:bg-white/10" : "border-line bg-white text-muted shadow-[var(--shadow-soft)] hover:border-brand-200",
        className,
      )}
    >
      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase", dark ? "bg-white/10 text-white" : "bg-canvas text-ink")}>{t("backedBy")}</span>
      <span className={cn("font-serif text-[15px] font-bold tracking-tight", dark ? "text-white" : "text-ink")}>
        winsym<span className="text-[#c2521d]">.ai</span>
      </span>
      <span className="sr-only">{t("opensNewTab")}</span>
    </a>
  );
}
