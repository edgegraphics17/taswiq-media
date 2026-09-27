import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Check, Cpu, MapPin, Target } from "lucide-react";
import { portfolioItems, thumbOf } from "@/config/content";
import { site } from "@/config/site";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";

/**
 * "Warum TasWiq": links weiße Karte mit Haltung + Kennzahlen + Referenz-Avataren,
 * rechts schwarze Karte mit Versprechen (Checks) und dem Partner-Setup:
 * TasWiq = Agentur in Deutschland · winsym.ai = KI-Technologie aus Kuala Lumpur.
 */
export async function PromiseSection() {
  const t = await getTranslations("home.promise");
  const stats = t.raw("stats") as { value: string; label: string }[];
  const checks = t.raw("checks") as string[];
  const thumbs = portfolioItems.map(thumbOf).filter(Boolean).slice(0, 6) as string[];

  return (
    <section id="warum" aria-labelledby="warum-title" className="py-16 sm:py-24">
      <div className="container-x grid gap-4 lg:grid-cols-2">
        <Reveal className="card flex flex-col p-7 sm:p-10">
          <Eyebrow icon={Target}>{t("tag")}</Eyebrow>
          <h2 id="warum-title" className="mt-4 text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] font-medium text-balance">
            {t("title")}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{t("text")}</p>

          <dl className="mt-8 divide-y divide-line border-y border-line">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-6 py-4">
                <dt className="order-2 max-w-[13rem] text-right text-[13px] leading-snug text-muted">{s.label}</dt>
                <dd className="num text-[2.2rem] leading-none font-medium tracking-tight text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto flex items-center gap-3 pt-8">
            <div className="flex -space-x-2.5">
              {thumbs.map((src) => (
                <span key={src} className="relative size-10 overflow-hidden rounded-full bg-canvas ring-2 ring-white">
                  <Image src={src} alt="" fill sizes="40px" className="object-cover object-top" />
                </span>
              ))}
            </div>
            <p className="text-[13px] leading-tight text-muted">{t("referencesLine")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="card-night flex flex-col p-7 sm:p-10">
          <Eyebrow tone="dark">{t("cardTag")}</Eyebrow>
          <p className="mt-4 text-[clamp(1.7rem,3vw,2.4rem)] leading-[1.08] font-medium tracking-tight">{t("cardTitle")}</p>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {checks.map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-sm text-night-muted">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-mint-500/15 text-mint-400">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
                {c}
              </li>
            ))}
          </ul>

          {/* Partner-Setup */}
          <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/[0.06] p-5">
              <p className="flex items-center gap-2 text-xs font-medium text-night-muted">
                <MapPin className="size-3.5 text-mint-400" aria-hidden /> {t("agency.where")}
              </p>
              <p className="mt-2 font-logo text-lg font-bold text-white">TasWiq Media.</p>
              <p className="mt-1 text-[13px] leading-relaxed text-night-muted">{t("agency.text")}</p>
            </div>
            <a href={site.partner.url} target="_blank" rel="noopener" className="group rounded-3xl bg-white/[0.06] p-5 transition hover:bg-white/10">
              <p className="flex items-center gap-2 text-xs font-medium text-night-muted">
                <Cpu className="size-3.5 text-mint-400" aria-hidden /> {t("partner.where")}
              </p>
              <p className="mt-2 flex items-center gap-1.5 font-serif text-lg font-bold text-white">
                <span>
                  winsym<span className="text-[#e0773f]">.ai</span>
                </span>
                <ArrowUpRight className="size-4 text-night-muted transition group-hover:text-white" aria-hidden />
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-night-muted">{t("partner.text")}</p>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
