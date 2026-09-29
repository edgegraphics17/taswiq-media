import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthConfigured } from "@/lib/env";
import { isAdminEmail } from "@/lib/auth";
import { verifyLoginToken } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";

/** Magic-Link-Rückkehr: einmaliges Token beim Backend einlösen, Session-Cookie setzen, ins Dashboard. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token && isAdminAuthConfigured()) {
    const email = await verifyLoginToken(token).catch(() => null);
    if (email && isAdminEmail(email)) {
      const res = NextResponse.redirect(new URL("/admin", req.url));
      res.cookies.set(SESSION_COOKIE, await signSession(email), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      });
      return res;
    }
  }
  return NextResponse.redirect(new URL("/admin/login?error=link", req.url));
}
