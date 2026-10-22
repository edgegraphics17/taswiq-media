import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin/data";
import { getGoogle, SCOPES } from "@/lib/admin/seo";
import { saveSeoGoogle } from "@/lib/db";
import { requestOrigin } from "@/lib/admin/site-report";

const STATE = "seo_oauth_state";

/** Google-Verbindung fürs SEO-Modul: ohne `code` zu Google weiterleiten, mit `code` den Refresh-Token speichern. */
export async function GET(request: NextRequest) {
  if (!(await getAdminUser())) return NextResponse.redirect(new URL("/admin/login", request.url));
  const origin = await requestOrigin();
  const back = (msg: string) => NextResponse.redirect(`${origin}/admin/seo?google=${encodeURIComponent(msg)}`);
  const redirectUri = `${origin}/admin/seo/google`;
  const g = await getGoogle();
  if (!g.clientId || !g.clientSecret) return back("Zuerst Client-ID und Client-Secret eintragen.");

  const p = request.nextUrl.searchParams;
  const code = p.get("code");
  if (!code) {
    const state = crypto.randomUUID();
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({ client_id: g.clientId, redirect_uri: redirectUri, response_type: "code", scope: SCOPES, access_type: "offline", prompt: "consent", state }).toString();
    const res = NextResponse.redirect(url);
    res.cookies.set(STATE, state, { httpOnly: true, secure: origin.startsWith("https"), sameSite: "lax", path: "/admin/seo", maxAge: 600 });
    return res;
  }
  if (p.get("state") !== request.cookies.get(STATE)?.value) return back("Sicherheitsprüfung fehlgeschlagen – bitte erneut verbinden.");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({ code, client_id: g.clientId, client_secret: g.clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });
  const data = (await res.json()) as { refresh_token?: string; id_token?: string; error_description?: string };
  if (!data.refresh_token) return back(`Google hat keinen Zugang erteilt: ${data.error_description ?? res.status}`);
  // E-Mail nur zur Anzeige, aus dem ID-Token (kommt direkt von Google über TLS, daher ohne Signaturprüfung).
  const email = data.id_token ? (JSON.parse(Buffer.from(data.id_token.split(".")[1], "base64url").toString()) as { email?: string }).email : undefined;
  await saveSeoGoogle({ refreshToken: data.refresh_token, email });
  return back("ok");
}
