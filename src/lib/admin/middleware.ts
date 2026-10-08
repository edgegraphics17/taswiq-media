import { NextResponse, type NextRequest } from "next/server";
import { env, isAdminAuthConfigured, isDemoMode } from "@/lib/env";
import { isAdminEmail } from "@/lib/auth";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { INTERNAL_COOKIE, internalCookieOptions } from "@/lib/internal";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/auth"];

/**
 * Schützt /admin/*: prüft das signierte Session-Cookie (Edge-tauglich, kein Netzwerkzugriff)
 * und leitet nicht eingeloggte oder nicht berechtigte Nutzer zum Login.
 */
export async function guardAdmin(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (!isAdminAuthConfigured()) {
    // Lokal ohne Backend → Demo-Dashboard. In Produktion: harter Stopp.
    if (isDemoMode() || isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login?error=config", request.url));
  }

  if (isPublic) return NextResponse.next();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (!isAdminEmail(session.email) || env.adminEmails.length === 0) {
    return NextResponse.redirect(new URL("/admin/login?error=forbidden", request.url));
  }
  // Wer im Dashboard angemeldet ist, gehört zum Team: Gerät aus der Besucherstatistik nehmen (einmalig, per Schalter umkehrbar).
  const response = NextResponse.next();
  if (!request.cookies.has(INTERNAL_COOKIE)) response.cookies.set(INTERNAL_COOKIE, "1", internalCookieOptions);
  return response;
}
