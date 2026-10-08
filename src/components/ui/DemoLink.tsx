import NextLink from "next/link";
import type { DemoSlug } from "@/demos/registry";
import { cn } from "@/lib/format";

/**
 * Link auf eine Software-Demo (/demo/<slug>). Die Demos liegen außerhalb der Sprach-Routen
 * (eigenes Layout, nur Deutsch) → next/link statt next-intl-Link, ohne Prefetch.
 */
export const demoHref = (slug: DemoSlug) => `/demo/${slug}`;

const styles = {
  white: "border border-line bg-white text-ink shadow-[var(--shadow-soft)] hover:border-brand-200",
  primary: "bg-brand-500 text-white shadow-[var(--shadow-brand)] hover:bg-brand-600",
  "ghost-night": "border border-white/20 text-white hover:bg-white/10",
  bare: "",
};

export function DemoLink({ slug, variant = "white", className, children, ...rest }: { slug: DemoSlug; variant?: keyof typeof styles; className?: string; children: React.ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <NextLink
      href={demoHref(slug)}
      prefetch={false}
      className={cn(variant !== "bare" && "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-all duration-300 ease-[var(--ease-soft)] hover:-translate-y-0.5", styles[variant], className)}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
