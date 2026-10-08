import { Plus } from "lucide-react";
import { integrationInfo, integrationRows, toolLogos, type Integration } from "@/demos/integrations";
import { cn } from "@/lib/format";

/** Original-Logo eines Tools (Datei in public/logos/tools); scale vergrößert es fürs Laufband */
function ToolLogo({ id, scale = 1, decorative }: { id: Integration; scale?: number; decorative?: boolean }) {
  const t = toolLogos[id];
  const h = Math.round(t.h * scale);
  // eslint-disable-next-line @next/next/no-img-element -- kleine SVG-Logos, keine Bildoptimierung nötig
  return <img src={`/logos/tools/${id}.svg`} alt={decorative || "label" in t ? "" : t.name} width={Math.round(h * t.ratio)} height={h} loading="lazy" decoding="async" draggable={false} className="max-w-none shrink-0" />;
}

const tip =
  "pointer-events-none absolute inset-x-0 bottom-full z-10 mb-2 translate-y-1 rounded-2xl bg-night p-4 text-left text-[13px] leading-relaxed font-normal whitespace-normal text-night-muted opacity-0 shadow-[var(--shadow-float)] transition-[opacity,transform] duration-200 ease-[var(--ease-soft)] group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-focus/tip:translate-y-0 group-focus/tip:opacity-100";

/**
 * Logos der Tools, die sich an eine Demo anbinden lassen. Fährt man über ein Logo (oder tippt es an),
 * erscheint über der Reihe ein Hinweis: welche Daten fließen und was der Betrieb davon hat.
 * Der Hinweis hängt an der Liste, nicht am einzelnen Logo – so bleibt er immer innerhalb der Karte.
 */
export function IntegrationList({ items, scope }: { items: Integration[]; scope: string }) {
  const chip = "group/tip inline-flex h-9 cursor-default items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[13px] font-medium whitespace-nowrap text-ink transition-colors hover:border-brand-200 focus:border-brand-300 focus:outline-none focus-visible:outline-2";
  return (
    <ul className="relative mt-2.5 flex flex-wrap gap-1.5">
      {items.map((id) => {
        const t = toolLogos[id];
        const info = integrationInfo[id];
        return (
          <li key={id} tabIndex={info ? 0 : undefined} aria-describedby={info ? `${scope}-${id}` : undefined} className={chip}>
            <ToolLogo id={id} />
            {"label" in t && t.name}
            {info && (
              <span id={`${scope}-${id}`} role="tooltip" className={tip}>
                <span className="block text-sm font-medium text-white">{t.name} anbinden</span>
                <span className="mt-2 block">
                  <span className="font-medium text-white">Was fließt:</span> {info.data}
                </span>
                <span className="mt-1 block">
                  <span className="font-medium text-white">Was du davon hast:</span> {info.use}
                </span>
              </span>
            )}
          </li>
        );
      })}
      <li tabIndex={0} aria-describedby={`${scope}-mehr`} className={cn(chip, "border-dashed pl-2.5 text-muted")}>
        <Plus className="size-3.5" aria-hidden /> weitere
        <span id={`${scope}-mehr`} role="tooltip" className={tip}>
          <span className="block text-sm font-medium text-white">Dein Tool ist nicht dabei?</span>
          <span className="mt-2 block">Das hier sind die üblichen der Branche. Angebunden wird, was dein Betrieb schon nutzt – fast jedes Programm mit Schnittstelle oder Export lässt sich anschließen. Sag uns, womit du arbeitest, wir prüfen es vorab.</span>
        </span>
      </li>
    </ul>
  );
}

/**
 * Laufband der Anbindungen: zwei gegenläufige Reihen frei auf dem Seitenhintergrund, jedes Logo in seiner eigenen Kachel.
 * Hält beim Überfahren an und steht bei „Bewegung reduzieren“ still.
 * Die zweite Kopie je Reihe ist nur fürs nahtlose Durchlaufen da und für Screenreader ausgeblendet.
 */
export function IntegrationMarquee({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {integrationRows.map((row, r) => (
        <div key={r} className="group/marquee relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_7%,black_93%,transparent)] motion-reduce:overflow-x-auto">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 || undefined}
              className={cn("flex shrink-0 animate-marquee gap-3 pr-3 group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none", copy === 1 && "motion-reduce:hidden")}
              style={{ animationDuration: r === 0 ? "90s" : "100s", animationDirection: r === 1 ? "reverse" : undefined }}
            >
              {row.map((id) => (
                <li key={id} className="flex h-[3.25rem] items-center gap-2.5 rounded-2xl border border-line bg-white px-4 text-sm font-medium whitespace-nowrap text-ink">
                  <ToolLogo id={id} scale={1.2} decorative={copy === 1} />
                  {"label" in toolLogos[id] && toolLogos[id].name}
                </li>
              ))}
            </ul>
          ))}
        </div>
      ))}
    </div>
  );
}
