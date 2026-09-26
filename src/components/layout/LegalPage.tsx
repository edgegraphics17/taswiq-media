/** Textseite für Rechtliches – weiße Karte auf Canvas, lesbare Zeilenlänge. */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-x pt-28 pb-16 sm:pt-32">
      <article className="card mx-auto max-w-3xl p-8 sm:p-12">
        <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">Rechtliches</p>
        <h1 className="mt-4 text-4xl font-medium">{title}</h1>
        <div className="mt-8 space-y-5 leading-relaxed text-body [&_a]:font-medium [&_a]:text-brand-600 [&_h2]:mt-9 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-ink">{children}</div>
      </article>
    </div>
  );
}
