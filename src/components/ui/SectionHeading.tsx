import { Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/format";

/** Eyebrow der Vorlage: kleines rosé Icon-Quadrat + leiser Text. */
export function Eyebrow({ children, icon: Ico = Sparkles, tone = "light", className }: { children: React.ReactNode; icon?: LucideIcon; tone?: "light" | "dark"; className?: string }) {
  return (
    <p className={cn("inline-flex items-center gap-2 text-[13px] font-medium", tone === "dark" ? "text-night-muted" : "text-muted", className)}>
      <span className={cn("grid size-6 place-items-center rounded-lg", tone === "dark" ? "bg-white/10 text-mint-400" : "bg-blush-100 text-blush-600")}>
        <Ico className="size-3.5" strokeWidth={2} aria-hidden />
      </span>
      {children}
    </p>
  );
}

/** Zentrierter Sektionskopf: Eyebrow → große, leichte Headline → leiser Text. */
export function SectionHeading({
  eyebrow,
  icon,
  title,
  accent,
  text,
  tone = "light",
  align = "center",
  id,
  className,
}: {
  eyebrow: string;
  icon?: LucideIcon;
  title: string;
  accent?: string;
  text?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  id?: string;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <Eyebrow icon={icon} tone={tone}>
        {eyebrow}
      </Eyebrow>
      <h2 id={id} className={cn("mt-4 text-[clamp(2.1rem,4.2vw,3.4rem)] leading-[1.04] font-medium text-balance", dark && "text-white")}>
        {title}
        {accent && (
          <>
            {" "}
            <span className={dark ? "text-brand-300" : "text-brand-500"}>{accent}</span>
          </>
        )}
      </h2>
      {text && <p className={cn("mx-auto mt-4 max-w-xl text-[15px] leading-relaxed", dark ? "text-night-muted" : "text-muted", align === "left" && "mx-0")}>{text}</p>}
    </div>
  );
}
