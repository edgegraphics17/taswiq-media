import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { site, hasAddress, nav } from "@/config/site";
import { seoPages } from "@/config/seo-pages";
import { footer } from "@/config/content";
import { Logo } from "@/components/ui/Logo";

/**
 * Footer: Spalten wie bei asap (Claim · Navigation · Leistungen · Kontakt · Rechtliches),
 * Optik wie der Fuß der Rechnung (Fog-Fläche, Teal-Linie oben, gesperrte Labels).
 */
export function Footer() {
  return (
    <footer className="border-t-[3px] border-teal bg-fog">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.1fr_1.1fr]">
        <div>
          <Logo tone="dark" className="h-12" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{footer.claim}</p>
        </div>

        <div>
          <p className="eyebrow">Navigation</p>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-ink transition-colors hover:text-teal-deep">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Leistungen</p>
          <ul className="mt-4 space-y-2 text-sm">
            {seoPages.map((p) => (
              <li key={p.slug}>
                <Link href={`/leistungen/${p.slug}`} className="text-ink transition-colors hover:text-teal-deep">
                  {p.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Kontakt</p>
          <ul className="mt-4 space-y-2 text-sm text-ink">
            <li>
              <span className="font-bold">{site.name}</span> · {site.owner}
            </li>
            <li>
              <a href={site.phoneHref} className="inline-flex items-center gap-2 hover:text-teal-deep">
                <Phone className="size-3.5 text-teal-deep" aria-hidden /> {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 hover:text-teal-deep">
                <Mail className="size-3.5 text-teal-deep" aria-hidden /> {site.email}
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

      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-3 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. {site.vatNote}
          </p>
          <div className="flex gap-5">
            <Link href="/impressum" className="hover:text-teal-deep">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-teal-deep">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
