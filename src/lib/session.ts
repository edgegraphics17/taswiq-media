/**
 * Admin-Session: signiertes Cookie (HMAC-SHA256 über Web Crypto – läuft auch in der Edge-Middleware).
 * Format: base64url(JSON{email, exp}) + "." + base64url(Signatur)
 * Das Cookie wird erst nach Einlösen eines einmaligen Magic-Link-Tokens gesetzt (siehe /admin/auth/callback).
 */
import { env } from "@/lib/env";

export const SESSION_COOKIE = "taswiq_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 Tage

const enc = new TextEncoder();

const toB64Url = (bytes: Uint8Array) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64Url = (str: string) => {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (str.length % 4)) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

const hmacKey = () =>
  crypto.subtle.importKey("raw", enc.encode(env.sessionSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

export async function signSession(email: string): Promise<string> {
  if (env.sessionSecret.length < 32) throw new Error("SESSION_SECRET fehlt oder ist kürzer als 32 Zeichen");
  const payload = toB64Url(enc.encode(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(payload));
  return `${payload}.${toB64Url(new Uint8Array(sig))}`;
}

/** Gibt die E-Mail zurück, wenn Signatur und Ablaufzeit stimmen – sonst null. */
export async function verifySession(token: string | undefined | null): Promise<{ email: string } | null> {
  if (!token || env.sessionSecret.length < 32) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(), fromB64Url(sig), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64Url(payload))) as { email?: string; exp?: number };
    if (!data.email || !data.exp || data.exp < Date.now() / 1000) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}
