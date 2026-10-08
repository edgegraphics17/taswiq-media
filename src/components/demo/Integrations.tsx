import { brandMarks, type BrandId } from "@/demos/brand-marks";
import { integrationName, integrationRows, isTool, toolLogos, type Integration, type ToolId } from "@/demos/integrations";
import { cn } from "@/lib/format";

/** Markenzeichen auf Markenfläche – einheitliche Kachel, damit helle und dunkle Marken gleich ruhig wirken */
export function BrandMark({ id, className }: { id: BrandId; className?: string }) {
  const b = brandMarks[id];
  return (
    <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg", className)} style={{ background: b.hex }} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-[58%]" fill={b.on}>
        <path d={b.path} />
      </svg>
    </span>
  );
}

/** Original-Logo eines Branchen-Tools (Datei); `scale` vergrößert es fürs Laufband */
function ToolLogo({ id, scale = 1, decorative }: { id: ToolId; scale?: number; decorative?: boolean }) {
  const t = toolLogos[id];
  const h = Math.round(t.h * scale);
  // eslint-disable-next-line @next/next/no-img-element -- kleine SVG-Logos, keine Bildoptimierung nötig
  return <img src={`/logos/tools/${id}.svg`} alt={decorative || "label" in t ? "" : t.name} width={Math.round(h * t.ratio)} height={h} loading="lazy" decoding="async" draggable={false} className="max-w-none shrink-0" />;
}

/** Kleine Marke in den Demo-Flächen („Lässt sich anbinden“): Zeichen + Name, bei Wortmarken das Logo allein */
export function IntegrationChip({ item }: { item: Integration }) {
  if (isTool(item)) {
    const t = toolLogos[item];
    return (
      <li className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[13px] font-medium whitespace-nowrap text-ink">
        <ToolLogo id={item} />
        {"label" in t && t.name}
      </li>
    );
  }
  return (
    <li className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white pr-3 pl-1.5 text-[13px] font-medium whitespace-nowrap text-ink">
      <BrandMark id={item} className="size-6 rounded-full" />
      {brandMarks[item].name}
    </li>
  );
}

/**
 * Laufband der Anbindungen: zwei gegenläufige Reihen, halten beim Überfahren an und stehen bei „Bewegung reduzieren“ still.
 * Die zweite Kopie je Reihe ist nur fürs nahtlose Durchlaufen da und für Screenreader ausgeblendet.
 */
export function IntegrationMarquee({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {integrationRows.map((row, r) => (
        <div key={r} className="group/marquee relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)] motion-reduce:overflow-x-auto">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 || undefined}
              className={cn("flex shrink-0 animate-marquee gap-2.5 pr-2.5 group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none", copy === 1 && "motion-reduce:hidden")}
              style={{ animationDuration: r === 0 ? "70s" : "80s", animationDirection: r === 1 ? "reverse" : undefined }}
            >
              {row.map((id) => (
                <li key={id} className="flex h-12 items-center gap-2.5 rounded-xl border border-line bg-canvas/60 px-3.5 text-sm font-medium whitespace-nowrap text-ink">
                  {isTool(id) ? (
                    <>
                      <ToolLogo id={id} scale={1.2} decorative={copy === 1} />
                      {"label" in toolLogos[id] && integrationName(id)}
                    </>
                  ) : (
                    <>
                      <BrandMark id={id} className="-ml-1 size-7" />
                      {integrationName(id)}
                    </>
                  )}
                </li>
              ))}
            </ul>
          ))}
        </div>
      ))}
    </div>
  );
}
