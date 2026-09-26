import { cn } from "@/lib/format";

/** asap-Sektionskopf: Tag mit Linie → große H2 (zweite Zeile Teal) → Intro. */
export function SectionHeading({
  tag,
  title,
  accent,
  text,
  tone = "light",
  align = "left",
  id,
  className,
}: {
  tag: string;
  title: string;
  accent?: string;
  text?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  id?: string;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("tag-line", dark ? "text-teal-light" : "text-teal-deep")}>{tag}</p>
      <h2
        id={id}
        className={cn(
          "mt-4 text-[clamp(2rem,3.5vw,3rem)] leading-[1.12] font-extrabold tracking-[-0.02em] text-balance",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
        {accent && (
          <>
            <br />
            <span className={dark ? "text-teal-light" : "text-teal-deep"}>{accent}</span>
          </>
        )}
      </h2>
      {text && <p className={cn("mt-5 text-base leading-relaxed sm:text-[17px]", dark ? "text-mist" : "text-body")}>{text}</p>}
    </div>
  );
}
