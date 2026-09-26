import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intl = createIntlMiddleware(routing);

/**
 * Eine Middleware, zwei Aufgaben:
 *  - /admin/*  → Supabase-Session prüfen (Dashboard bleibt deutsch, ohne Sprach-Präfix)
 *  - alles andere → next-intl: Sprache erkennen, /en-Präfix & übersetzte Pfade auflösen
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) return updateSession(request);
  return intl(request);
}

export const config = {
  // Ausgenommen: API, Next-Interna, Dateien mit Endung (robots.txt, sitemap.xml, llms.txt, Bilder)
  // und die OG-Bilder – die sollen ohne Redirect direkt ausgeliefert werden.
  matcher: ["/((?!api|_next|_vercel|.*opengraph-image.*|.*\\..*).*)"],
};
