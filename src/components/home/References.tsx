import { references } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Referenz-Laufbänder: Namen typografisch in Exo 2 statt Fremd-Logos.
 * Zwei Bänder laufen gegenläufig, pausieren beim Hover; bei "Bewegung reduzieren"
 * stehen sie still und brechen um.
 */
export function References() {
  const brands = references.groups.flatMap((g) => [{ label: g.label }, ...g.names.map((n) => ({ name: n }))]);
  const artists = [{ label: references.artists.label }, ...references.artists.names.map((n) => ({ name: n }))];

  const Row = ({ items, reverse }: { items: ({ label: string } | { name: string })[]; reverse?: boolean }) => (
    <div className="group/marquee relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 || undefined}
          className="flex shrink-0 animate-marquee items-center gap-x-10 pr-10 group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none"
          style={reverse ? { animationDirection: "reverse" } : undefined}
        >
          {items.map((it, i) =>
            "label" in it ? (
              <li key={`l-${i}`} className="rounded-full border border-teal/30 px-3 py-1 text-[11px] font-bold tracking-[0.2em] whitespace-nowrap text-teal-light uppercase">
                {it.label}
              </li>
            ) : (
              <li key={`n-${i}`} className="text-[clamp(1.25rem,2.4vw,1.9rem)] font-extrabold tracking-tight whitespace-nowrap text-white/35 transition-colors hover:text-white">
                {it.name}
              </li>
            ),
          )}
        </ul>
      ))}
    </div>
  );

  return (
    <div className="mt-24">
      <Reveal className="container-x flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tag-line text-teal-light">{references.tag}</p>
          <h3 className="mt-3 max-w-xl text-2xl leading-snug font-extrabold tracking-tight text-white sm:text-3xl">{references.title}</h3>
        </div>
        <p className="text-sm text-haze">{references.partners.join(" · ")}</p>
      </Reveal>
      <div className="mt-10 space-y-6">
        <Row items={brands} />
        <Row items={artists} reverse />
      </div>
    </div>
  );
}
