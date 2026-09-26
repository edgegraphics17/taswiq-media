import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env, isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { isAdminUser } from "@/lib/auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/auth"];

/**
 * Schützt /admin/*: erneuert die Supabase-Session und leitet
 * nicht eingeloggte oder nicht berechtigte Nutzer zum Login.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (!isSupabaseConfigured()) {
    // Lokal ohne Supabase → Demo-Dashboard. In Produktion: harter Stopp.
    if (isDemoMode() || isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login?error=config", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() validiert das JWT beim Auth-Server – nicht getSession() verwenden.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPublic) return response;

  if (!user) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (!isAdminUser(user)) {
    return NextResponse.redirect(new URL("/admin/login?error=forbidden", request.url));
  }
  return response;
}
