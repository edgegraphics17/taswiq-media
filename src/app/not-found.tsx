import Link from "next/link";
import { fontVars } from "@/app/fonts";
import "./globals.css";

/**
 * Letzter Fallback für URLs außerhalb von [locale] (z. B. /admin/unbekannt).
 * Öffentliche Seiten nutzen die übersetzte Variante in src/app/[locale]/not-found.tsx.
 */
export default function GlobalNotFound() {
  return (
    <html lang="de" className={fontVars}>
      <body>
        <main className="grid min-h-dvh place-items-center bg-canvas px-5 text-center">
          <div className="card max-w-md p-10">
            <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">404</p>
            <h1 className="mt-4 text-3xl font-medium">Seite nicht gefunden · Page not found</h1>
            <Link href="/" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-brand-500 px-6 font-medium text-white shadow-[var(--shadow-brand)]">
              TasWiq Media.
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
