import NextLink from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { LockKeyhole, Mail, MessageCircle, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { site, hasAddress, nav, type AppHref } from "@/config/site";
import { industryPages, mediaPage, servicePages } from "@/config/seo-pages";
import { Logo } from "@/components/ui/Logo";
import { PartnerBadge } from "@/components/ui/PartnerBadge";
import { ConsentLink } from "@/components/consent/ConsentLink";

/** Footer als große weiße Karte auf Canvas – mit schwarzer CTA-Kapsel oben. */
export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tBox = await getTranslations("contactBox");
  const tSeo = await getTranslations("seoPages");
  const tSite = await getTranslations("site");

  return (
    <footer className="container-x pb-6">
      <div className="card-night flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
        <div>
          <p className="text-[clamp(1.6rem,3vw,2.3rem)] leading-tight font-medium tracking-tight">{tBox("title")}</p>
          <p className="mt-2 text-night-muted">{tBox("text")}</p>
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

      <div className="card mt-3 grid gap-10 p-8 sm:grid-cols-2 sm:p-10 lg:grid-cols-[1.3fr_1fr_1.1fr_1.1fr_1.1fr]">
        <div>
          <Logo className="h-11" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t("claim")}</p>
          <PartnerBadge className="mt-5" />
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted">{t("partnerNote")}</p>
        </div>
        <FooterCol
          title={t("navigation")}
          links={[...nav.map((n) => ({ key: n.key as string, href: n.href as AppHref, label: tNav(n.key) })), { key: "starterOffer", href: "/einstiegsangebot" as AppHref, label: t("starterOffer") }]}
          // Die Demos liegen außerhalb der Sprach-Routen (nur Deutsch, kein /en-Präfix)
          plain={[{ href: "/demo", label: t("demos") }]}
        />
        <FooterCol
          title={t("services")}
          links={[...servicePages, mediaPage].map((p) => ({
            key: p.id,
            href: { pathname: "/leistungen/[slug]", params: { slug: p.slugs[locale] } },
            label: tSeo(`${p.id}.navLabel`),
          }))}
        />
        <FooterCol
          title={t("industries")}
          links={industryPages.map((p) => ({
            key: p.id,
            href: { pathname: "/leistungen/[slug]", params: { slug: p.slugs[locale] } },
            label: tSeo(`${p.id}.navLabel`),
          }))}
        />
        <div>
          <p className="text-sm font-semibold text-ink">{t("contact")}</p>
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
          © {new Date().getFullYear()} {site.legalName}. {tSite("vatNote")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/impressum" className="rounded-full bg-white px-3 py-1.5 hover:text-brand-600">
            {t("legalNotice")}
          </Link>
          <Link href="/datenschutz" className="rounded-full bg-white px-3 py-1.5 hover:text-brand-600">
            {t("privacy")}
          </Link>
          <ConsentLink className="rounded-full bg-white px-3 py-1.5 hover:text-brand-600">{t("cookieSettings")}</ConsentLink>
          {/* Dashboard liegt außerhalb der Sprach-Routen → next/link statt next-intl-Link (kein /en-Präfix) */}
          <NextLink href="/admin" prefetch={false} rel="nofollow" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 hover:text-brand-600">
            <LockKeyhole className="size-3" aria-hidden /> {t("login")}
          </NextLink>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, plain = [] }: { title: string; links: { key: string; href: AppHref; label: string }[]; plain?: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.key}>
            <Link href={l.href} className="text-body transition-colors hover:text-brand-600">
              {l.label}
            </Link>
          </li>
        ))}
        {plain.map((l) => (
          <li key={l.href}>
            <NextLink href={l.href} prefetch={false} className="text-body transition-colors hover:text-brand-600">
              {l.label}
            </NextLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
