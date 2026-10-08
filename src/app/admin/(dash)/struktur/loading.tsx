/** Das erste Einlesen ruft jede Seite einmal ab – das dauert ein paar Sekunden. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1480px]" role="status">
      <p className="text-xs font-medium text-brand-600">Kunden &amp; Website</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Seitenstruktur</h1>
      <p className="mt-1 text-sm text-muted">Die Website wird eingelesen – jede Seite einmal, das dauert einen Moment …</p>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[98px] animate-pulse rounded-2xl border border-line bg-white" />
        ))}
      </div>
      <div className="mt-4 h-[68dvh] min-h-[440px] animate-pulse rounded-2xl border border-line bg-white" aria-hidden />
    </div>
  );
}
