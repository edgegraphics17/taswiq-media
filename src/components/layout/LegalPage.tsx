/** Schlichte Textseite für Rechtliches – helle Kopfleiste, lesbare Zeilenlänge. */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-28 pb-24 sm:pt-36">
      <article className="container-x max-w-3xl">
        <p className="tag-line text-teal-deep">Rechtliches</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink">{title}</h1>
        <div className="mt-10 space-y-6 leading-relaxed text-body [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_a]:font-semibold [&_a]:text-teal-deep">{children}</div>
      </article>
    </div>
  );
}
