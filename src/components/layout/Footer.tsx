import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { site, hasAddress, nav } from "@/config/site";
import { seoPages } from "@/config/seo-pages";
import { contactBox, footer } from "@/config/content";
import { Logo } from "@/components/ui/Logo";

/** Footer als große weiße Karte auf Canvas – mit schwarzer CTA-Kapsel oben. */
export function Footer() {
  return (
    <footer className="container-x pb-6">
      <div className="card-night flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
        <div>
          <p className="text-[clamp(1.6rem,3vw,2.3rem)] leading-tight font-medium tracking-tight">{contactBox.title}</p>
          <p className="mt-2 text-night-muted">{contactBox.text}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-mint-500 px-6 font-medium text-night transition hover:-translate-y-0.5">
            <MessageCircle className="size-4" aria-hidden /> WhatsApp
          </a>
          <a href={site.phoneHref} className="num inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-medium text-ink transition hover:-translate-y-0.5">
            <Phone className="size-4 text-brand-600" aria-hidden /> {site.phone}
          </a>
        </div>
      </div>

      <div className="card mt-3 grid gap-10 p-8 sm:grid-cols-2 sm:p-10 lg:grid-cols-[1.4fr_1fr_1.1fr_1.1fr]">
        <div>
          <Logo className="h-11" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{footer.claim}</p>
        </div>
        <FooterCol title="Navigation" links={nav.map((n) => ({ href: n.href, label: n.label }))} />
        <FooterCol title="Leistungen" links={seoPages.map((p) => ({ href: `/leistungen/${p.slug}`, label: p.navLabel }))} />
        <div>
          <p className="text-sm font-semibold text-ink">Kontakt</p>
          <ul className="mt-4 space-y-2.5 text-sm text-body">
            <li>{site.owner}</li>
            <li>
              <a href={site.phoneHref} className="inline-flex items-center gap-2 hover:text-brand-600">
                <Phone className="size-3.5 text-brand-500" aria-hidden /> {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 hover:text-brand-600">
                <Mail className="size-3.5 text-brand-500" aria-hidden /> {site.email}
              </a>
            </li>
            {hasAddress() && (
              <li className="text-muted">
                {site.address.street}, {site.address.postalCode} {site.address.city}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.legalName}. {site.vatNote}
        </p>
        <div className="flex gap-2">
          <Link href="/impressum" className="rounded-full bg-white px-3 py-1.5 hover:text-brand-600">
            Impressum
          </Link>
          <Link href="/datenschutz" className="rounded-full bg-white px-3 py-1.5 hover:text-brand-600">
            Datenschutz
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-body transition-colors hover:text-brand-600">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
