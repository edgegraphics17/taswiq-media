import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ink-900 px-5 text-center text-white">
      <div>
        <p className="eyebrow-dark">Fehler 404</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Diese Seite gibt es nicht.</h1>
        <p className="mt-3 text-mist">Vielleicht findest du hier, was du suchst:</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-12 items-center rounded-full bg-teal px-6 font-semibold text-ink-950">
            Zur Startseite
          </Link>
          <Link href="/preisrechner" className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 font-semibold">
            Zum Preisrechner
          </Link>
        </div>
      </div>
    </main>
  );
}
