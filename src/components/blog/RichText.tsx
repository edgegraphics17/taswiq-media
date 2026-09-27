import NextLink from "next/link";
import { Lightbulb } from "lucide-react";
import type { BlogBlock } from "@/content/blog";
import { cn } from "@/lib/format";

/**
 * Mini-Markup der Ratgeber-Texte: **fett** und [Linktext](/pfad).
 * Interne Pfade sind bereits die deutschen URLs (der Blog ist deutschsprachig) → next/link.
 */
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const [, label, href] = link;
          const cls = "font-medium text-brand-600 underline decoration-brand-200 underline-offset-4 transition-colors hover:decoration-brand-500";
          return href.startsWith("/") ? (
            <NextLink key={i} href={href} className={cls}>
              {label}
            </NextLink>
          ) : (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
              {label}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function Block({ block }: { block: BlogBlock }) {
  if ("p" in block) {
    return (
      <p className="text-[17px] leading-[1.75] text-body">
        <Inline text={block.p} />
      </p>
    );
  }
  if ("ul" in block || "ol" in block) {
    const ordered = "ol" in block;
    const items = ordered ? block.ol : block.ul;
    const List = ordered ? "ol" : "ul";
    return (
      <List className="grid gap-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 text-[16.5px] leading-[1.7] text-body">
            <span
              aria-hidden
              className={cn(
                "mt-1 grid shrink-0 place-items-center rounded-full text-xs font-semibold",
                ordered ? "num size-6 bg-brand-500 text-white" : "size-6 bg-brand-50 text-brand-600",
              )}
            >
              {ordered ? i + 1 : <span className="size-1.5 rounded-full bg-brand-500" />}
            </span>
            <span>
              <Inline text={it} />
            </span>
          </li>
        ))}
      </List>
    );
  }
  if ("tip" in block) {
    return (
      <aside className="flex gap-4 rounded-3xl border border-brand-100 bg-brand-50 p-5 sm:p-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
          <Lightbulb className="size-5" aria-hidden />
        </span>
        <p className="text-[15.5px] leading-relaxed text-ink">
          <Inline text={block.tip} />
        </p>
      </aside>
    );
  }
  const { head, rows, caption } = block.table;
  return (
    <figure className="overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[14.5px]">
          <thead className="bg-canvas text-xs tracking-wide text-muted uppercase">
            <tr>
              {head.map((h, i) => (
                <th key={i} scope="col" className="px-5 py-3.5 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={cn("px-5 py-3.5 align-top", j === 0 ? "font-medium text-ink" : "text-body")}>
                    <Inline text={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="border-t border-line px-5 py-3 text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}
