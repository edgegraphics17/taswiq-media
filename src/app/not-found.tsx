import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-5 text-center">
      <div className="card max-w-md p-10">
        <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">Fehler 404</p>
        <h1 className="mt-4 text-4xl font-medium">Diese Seite gibt es nicht.</h1>
        <p className="mt-3 text-muted">Vielleicht findest du hier, was du suchst:</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <Link href="/" className="inline-flex min-h-12 items-center rounded-full bg-brand-500 px-6 font-medium text-white shadow-[var(--shadow-brand)]">
            Zur Startseite
          </Link>
          <Link href="/preisrechner" className="inline-flex min-h-12 items-center rounded-full bg-canvas px-6 font-medium text-ink">
            Zum Preisrechner
          </Link>
        </div>
      </div>
    </main>
  );
}
