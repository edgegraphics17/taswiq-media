import { getTranslations } from "next-intl/server";
import { Check, Scale, X } from "lucide-react";
import { compareRows } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";

/**
 * Problem-Sektion: Plattformen & Abo-Tools vs. eigenes System.
 * Links das Argument (weiße Karte), rechts der Vergleich als schwarze Tabelle –
 * mit Icon + Text, nie nur Farbe (Barrierefreiheit).
 */
export async function Problem() {
  const t = await getTranslations("home.problem");
  const platforms = t.raw("platforms") as string[];
  return (
    <section id="problem" aria-labelledby="problem-title" className="py-16 sm:py-24">
      <div className="container-x grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal className="card flex flex-col p-7 sm:p-10">
          <Eyebrow icon={Scale}>{t("tag")}</Eyebrow>
          <h2 id="problem-title" className="mt-4 text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] font-medium text-balance">
            {t("title")}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{t("text")}</p>
          <ul className="mt-7 flex flex-wrap gap-2" aria-label={t("platformsAria")}>
            {platforms.map((p) => (
              <li key={p} className="rounded-full bg-canvas px-3.5 py-1.5 text-[13px] font-medium text-body">
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-auto pt-8 text-lg leading-snug font-medium text-ink">{t("punchline")}</p>
        </Reveal>

        <Reveal delay={0.1} className="card-night overflow-hidden p-2 sm:p-3">
          <table className="w-full text-left text-[13px] hyphens-auto sm:text-[14px]">
            <caption className="sr-only">{t("tableCaption")}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[27%] px-3 py-4 text-xs font-medium text-night-muted sm:w-[34%] sm:px-5">
                  <span className="sr-only">{t("colTopic")}</span>
                </th>
                <th scope="col" className="px-2 py-4 text-xs font-medium text-night-muted sm:px-4">
                  {t("colPlatform")}
                </th>
                <th scope="col" className="rounded-t-3xl bg-brand-500 px-2.5 py-4 text-xs font-semibold text-white sm:px-4">
                  {t("colOwn")}
                </th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r, i) => (
                <tr key={r} className="border-t border-white/10">
                  <th scope="row" className="px-3 py-4 align-top font-medium text-white sm:px-5">
                    {t(`compare.${r}.topic`)}
                  </th>
                  <td className="px-2 py-4 align-top text-night-muted sm:px-4">
                    <span className="flex min-w-0 gap-1.5 sm:gap-2">
                      <X className="mt-0.5 size-3.5 shrink-0 text-blush-200 sm:size-4" aria-hidden />
                      {t(`compare.${r}.platform`)}
                    </span>
                  </td>
                  <td className={`bg-brand-500/15 px-2.5 py-4 align-top text-white sm:px-4 ${i === compareRows.length - 1 ? "rounded-b-3xl" : ""}`}>
                    <span className="flex min-w-0 gap-1.5 sm:gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-mint-400 sm:size-4" strokeWidth={3} aria-hidden />
                      {t(`compare.${r}.own`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
