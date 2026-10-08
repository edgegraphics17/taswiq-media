import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { guardAdmin } from "@/lib/admin/middleware";
import { INTERNAL_COOKIE, INTERNAL_PARAM, internalCookieOptions } from "@/lib/internal";

const intl = createIntlMiddleware(routing);

/**
 * Eine Middleware, zwei Aufgaben:
 *  - /admin/*  → Session-Cookie prüfen (Dashboard bleibt deutsch, ohne Sprach-Präfix)
 *  - alles andere → next-intl: Sprache erkennen, /en-Präfix & übersetzte Pfade auflösen
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) return guardAdmin(request);
  const response = intl(request);
  // Prüf-Browser des Teams: /?intern=1 nimmt das Gerät dauerhaft aus der Besucherstatistik, /?intern=0 zählt es wieder mit.
  const internal = request.nextUrl.searchParams.get(INTERNAL_PARAM);
  if (internal === "1" || internal === "0") response.cookies.set(INTERNAL_COOKIE, internal, internalCookieOptions);
  return response;
}

export const config = {
  // Ausgenommen: API, Next-Interna, Dateien mit Endung (robots.txt, sitemap.xml, llms.txt, Bilder)
  // und die OG-Bilder – die sollen ohne Redirect direkt ausgeliefert werden.
  matcher: ["/((?!api|_next|_vercel|.*opengraph-image.*|.*\\..*).*)"],
};
