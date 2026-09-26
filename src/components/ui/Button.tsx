import Link from "next/link";
import { cn } from "@/lib/format";

type Variant = "primary" | "ghost-dark" | "ghost-light" | "ink" | "link";

/** Pill-Buttons mit Teal-Glow wie bei asap – Farben aus der Rechnung, Text AA-konform auf Teal. */
const styles: Record<Variant, string> = {
  primary:
    "bg-teal text-ink-950 shadow-[var(--shadow-teal)] hover:-translate-y-0.5 hover:bg-teal-light hover:shadow-[0_16px_50px_rgb(90_174_184/0.45)]",
  ink: "bg-ink-900 text-white hover:-translate-y-0.5 hover:bg-ink-700",
  "ghost-dark": "border border-white/25 text-white hover:border-white/60 hover:bg-white/5",
  "ghost-light": "border border-line bg-white text-ink hover:border-teal hover:text-teal-deep",
  link: "min-h-11 px-0 text-teal-deep hover:gap-3.5",
};

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45";

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={cn(base, styles[variant], className)} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(base, styles[variant], className)} {...props} />;
}
