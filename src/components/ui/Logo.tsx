import { cn } from "@/lib/format";

/**
 * Wortmarke aus der Rechnung nachgebaut: Teal-Hashtag aus vier abgerundeten
 * Balken, darüber "TasWiq / Media." in League Spartan.
 */
export function Logo({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const text = tone === "light" ? "#ffffff" : "var(--color-ink-900)";
  return (
    <svg viewBox="0 0 400 260" role="img" aria-label="TasWiq Media." className={cn("h-11 w-auto", className)}>
      <g strokeLinecap="round" strokeWidth={26}>
        <line x1={38} y1={112} x2={205} y2={112} stroke="#5AAEB8" />
        <line x1={38} y1={178} x2={205} y2={178} stroke="#5AAEB8" />
        <line x1={122} y1={32} x2={76} y2={242} stroke="#8BCCD5" strokeOpacity={0.9} />
        <line x1={188} y1={32} x2={142} y2={242} stroke="#8BCCD5" strokeOpacity={0.9} />
      </g>
      <g fill={text} style={{ fontFamily: "var(--font-logo)", fontWeight: 700, letterSpacing: "0.02em" }}>
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

/** Nur der Hashtag – für Favicon-ähnliche Stellen und das Admin-Dashboard */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 260" aria-hidden className={cn("h-8 w-auto", className)}>
      <g strokeLinecap="round" strokeWidth={30}>
        <line x1={30} y1={105} x2={210} y2={105} stroke="#5AAEB8" />
        <line x1={30} y1={170} x2={210} y2={170} stroke="#5AAEB8" />
        <line x1={120} y1={30} x2={74} y2={235} stroke="#8BCCD5" strokeOpacity={0.92} />
        <line x1={186} y1={30} x2={140} y2={235} stroke="#8BCCD5" strokeOpacity={0.92} />
      </g>
    </svg>
  );
}
