import { Link } from "@/i18n/navigation";
import type { AppHref } from "@/config/site";
import { cn } from "@/lib/format";

type Variant = "primary" | "soft" | "white" | "night" | "ghost-night" | "link";

/** Alle Buttons sind Pillen (rounded-full). Primär = Violett mit weichem Glow. */
const styles: Record<Variant, string> = {
  primary: "bg-brand-500 text-white shadow-[var(--shadow-brand)] hover:bg-brand-600",
  soft: "bg-blush-100/70 text-ink hover:bg-blush-100",
  white: "border border-line bg-white text-ink shadow-[var(--shadow-soft)] hover:border-brand-200",
  night: "bg-night text-white hover:bg-night-soft",
  "ghost-night": "border border-white/20 text-white hover:bg-white/10",
  link: "min-h-11 px-0 text-brand-600 hover:gap-3",
};

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-all duration-300 ease-[var(--ease-soft)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45";

/**
 * Pillen-Link. `href` ist eine interne Route (next-intl übersetzt Pfad + Sprach-Präfix)
 * oder ein reiner Sprung-Anker auf derselben Seite ("#anfrage").
 */
export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: {
  href: AppHref | `#${string}`;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const cls = cn(base, styles[variant], className);
  if (typeof href === "string" && href.startsWith("#")) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href as AppHref} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function Button({ variant = "primary", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(base, styles[variant], className)} {...props} />;
}
