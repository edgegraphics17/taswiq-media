import { getTranslations } from "next-intl/server";
import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import { site } from "@/config/site";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { LeadFunnel } from "@/components/funnel/LeadFunnel";

/** Kontakt: links Überschrift + Kontakt-Pillen, rechts der 4-Schritte-Funnel. */
export async function Contact() {
  const t = await getTranslations("home.contact");
  const tc = await getTranslations("common");
  const pills = [
    { href: `mailto:${site.email}`, icon: Mail, label: tc("email"), value: site.email },
    { href: site.phoneHref, icon: Phone, label: tc("phone"), value: site.phone },
    { href: site.whatsappHref, icon: MessageCircle, label: tc("whatsapp"), value: tc("whatsappCta") },
  ];
  return (
    <section id="kontakt" aria-labelledby="kontakt-title" className="py-16 sm:py-24">
      <div className="container-x grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <Reveal className="lg:sticky lg:top-28">
          <Eyebrow icon={Send}>{t("tag")}</Eyebrow>
          <h2 id="kontakt-title" className="mt-4 text-[clamp(2.2rem,4.2vw,3.4rem)] leading-[1.04] font-medium">
            {t("title")} <span className="text-brand-500">{t("accent")}</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{t("text")}</p>
          <ul className="mt-8 space-y-2.5">
            {pills.map((p) => (
              <li key={p.href}>
                <a href={p.href} className="group flex items-center gap-3 rounded-full border border-line bg-white p-1.5 pr-5 shadow-[var(--shadow-soft)] transition hover:border-brand-200">
                  <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                    <p.icon className="size-4.5" aria-hidden />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-xs text-muted">{p.label}</span>
                    <span className="text-[15px] font-medium text-ink">{p.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <LeadFunnel />
        </Reveal>
      </div>
    </section>
  );
}
