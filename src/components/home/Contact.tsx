import { Mail, Phone } from "lucide-react";
import { contact } from "@/config/content";
import { site } from "@/config/site";
import { Reveal } from "@/components/ui/Reveal";
import { LeadFunnel } from "@/components/funnel/LeadFunnel";

/** asap #contact: links Überschrift + E-Mail/Telefon, rechts der 4-Schritte-Funnel. */
export function Contact() {
  return (
    <section id="kontakt" aria-labelledby="kontakt-title" className="bg-fog py-24 sm:py-32">
      <div className="container-x grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28">
          <p className="tag-line text-teal-deep">{contact.tag}</p>
          <h2 id="kontakt-title" className="mt-4 text-[clamp(2rem,3.5vw,3rem)] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
            {contact.title}
            <br />
            <span className="text-teal-deep">{contact.accent}</span>
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-body">{contact.text}</p>
          <ul className="mt-9 space-y-4">
            <li>
              <a href={`mailto:${site.email}`} className="group flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-2xl border border-teal/25 bg-white text-teal-deep transition group-hover:bg-teal group-hover:text-ink-950">
                  <Mail className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">E-Mail</span>
                  <span className="font-semibold text-ink">{site.email}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={site.phoneHref} className="group flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-2xl border border-teal/25 bg-white text-teal-deep transition group-hover:bg-teal group-hover:text-ink-950">
                  <Phone className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">Telefon</span>
                  <span className="font-semibold text-ink">{site.phone}</span>
                </span>
              </a>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <LeadFunnel />
        </Reveal>
      </div>
    </section>
  );
}
