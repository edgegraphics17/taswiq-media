import { cn } from "@/lib/format";

/**
 * TasWiq-Wortmarke: Hashtag aus vier abgerundeten Balken + "TasWiq / Media.".
 * Farben im neuen System: Violett (quer) und helles Violett (schräg).
 */
export function Logo({ className, tone = "dark" }: { className?: string; tone?: "light" | "dark" }) {
  const text = tone === "light" ? "#ffffff" : "var(--color-ink)";
  return (
    <svg viewBox="0 0 400 260" role="img" aria-label="TasWiq Media." className={cn("h-10 w-auto", className)}>
      <g strokeLinecap="round" strokeWidth={26}>
        <line x1={38} y1={112} x2={205} y2={112} stroke="var(--color-brand-500)" />
        <line x1={38} y1={178} x2={205} y2={178} stroke="var(--color-brand-500)" />
        <line x1={122} y1={32} x2={76} y2={242} stroke="var(--color-brand-300)" strokeOpacity={0.9} />
        <line x1={188} y1={32} x2={142} y2={242} stroke="var(--color-brand-300)" strokeOpacity={0.9} />
      </g>
      <g fill={text} style={{ fontFamily: "var(--font-logo)", fontWeight: 700, letterSpacing: "0.01em" }}>
        <text x={128} y={148} fontSize={84}>
          TasWiq
        </text>
        <text x={128} y={222} fontSize={84}>
          Media.
        </text>
      </g>
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 260" aria-hidden className={cn("h-8 w-auto", className)}>
      <g strokeLinecap="round" strokeWidth={30}>
        <line x1={30} y1={105} x2={210} y2={105} stroke="var(--color-brand-500)" />
        <line x1={30} y1={170} x2={210} y2={170} stroke="var(--color-brand-500)" />
        <line x1={120} y1={30} x2={74} y2={235} stroke="var(--color-brand-300)" />
        <line x1={186} y1={30} x2={140} y2={235} stroke="var(--color-brand-300)" />
      </g>
    </svg>
  );
}
