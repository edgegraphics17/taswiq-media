// Gemeinsame Basis für die LinkedIn-Anbindung: Ablage der Zugangsdaten, Token-Erneuerung, API-Aufrufe.
// Zugangsdaten liegen bewusst außerhalb des Repos (~/.config/taswiq-linkedin, nur für den Benutzer lesbar).
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join } from "node:path";

export const CONFIG_DIR =
  process.env.LINKEDIN_CONFIG_DIR || join(homedir(), ".config", "taswiq-linkedin");
const APP_FILE = join(CONFIG_DIR, "app.json");
const TOKEN_FILE = join(CONFIG_DIR, "token.json");

export const REDIRECT_PORT = 8765;
export const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;
// LinkedIn versioniert die API monatlich (JJJJMM), jede Version läuft rund ein Jahr.
export const API_VERSION = process.env.LINKEDIN_VERSION || "202606";

// Welche Rechte angefragt werden, hängt davon ab, welche Produkte in der LinkedIn-App freigeschaltet sind.
export const SCOPE_PRESETS = {
  // „Sign In with LinkedIn using OpenID Connect“ + „Share on LinkedIn“ – sofort verfügbar
  profil: ["openid", "profile", "email", "w_member_social"],
  // „Community Management API“ – braucht die Freigabe durch LinkedIn
  seiten: [
    "r_basicprofile",
    "w_member_social",
    "w_organization_social",
    "r_organization_social",
    "rw_organization_admin",
  ],
};

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function writeSecret(file, data) {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  await writeFile(file, JSON.stringify(data, null, 2), { mode: 0o600 });
  await chmod(file, 0o600);
}

export const loadApp = () => readJson(APP_FILE);
export const saveApp = (app) => writeSecret(APP_FILE, app);
export const loadToken = () => readJson(TOKEN_FILE);
export const saveToken = (token) => writeSecret(TOKEN_FILE, token);

export async function requestToken(app, params) {
  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ...params,
      client_id: app.clientId,
      client_secret: app.clientSecret,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(
      `LinkedIn hat kein Token ausgestellt (${res.status}): ${data.error_description || data.error || "unbekannter Fehler"}`,
    );
  }
  const now = Date.now();
  return {
    accessToken: data.access_token,
    expiresAt: now + (data.expires_in ?? 0) * 1000,
    refreshToken: data.refresh_token ?? params.refresh_token ?? null,
    refreshExpiresAt: data.refresh_token_expires_in
      ? now + data.refresh_token_expires_in * 1000
      : null,
    scope: data.scope ?? null,
  };
}

const NOT_CONNECTED =
  "LinkedIn ist nicht verbunden. Im Terminal `node linkedin/login.mjs` ausführen und anmelden.";

async function accessToken() {
  let token = await loadToken();
  if (!token) throw new Error(NOT_CONNECTED);
  if (token.expiresAt - Date.now() > 5 * 60_000) return token.accessToken;
  const app = await loadApp();
  if (!token.refreshToken || !app) {
    throw new Error(`Das LinkedIn-Token ist abgelaufen. ${NOT_CONNECTED}`);
  }
  const fresh = await requestToken(app, {
    grant_type: "refresh_token",
    refresh_token: token.refreshToken,
  });
  token = { ...token, ...fresh, refreshExpiresAt: fresh.refreshExpiresAt ?? token.refreshExpiresAt };
  await saveToken(token);
  return token.accessToken;
}

export const enc = encodeURIComponent;

/**
 * Ruft die LinkedIn-API auf. `path` beginnt mit /rest/ oder /v2/ und enthält die fertige Query –
 * Rest.li verlangt an manchen Stellen unkodierte Klammern, deshalb wird hier nichts umkodiert.
 */
export async function api(method, path, { body, headers = {} } = {}) {
  const res = await fetch(`https://api.linkedin.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "X-Restli-Protocol-Version": "2.0.0",
      ...(path.startsWith("/rest/") ? { "LinkedIn-Version": API_VERSION } : {}),
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error(`LinkedIn ${method} ${path.split("?")[0]} → ${res.status}: ${detail}`);
  }
  return { status: res.status, id: res.headers.get("x-restli-id"), data };
}

/** Angemeldetes Mitglied; je nach freigeschaltetem Produkt über OpenID oder das klassische Profil. */
export async function whoami() {
  try {
    const { data } = await api("GET", "/v2/userinfo");
    return { urn: `urn:li:person:${data.sub}`, name: data.name, email: data.email ?? null };
  } catch {
    const { data } = await api("GET", "/v2/me");
    const name = [data.localizedFirstName, data.localizedLastName].filter(Boolean).join(" ");
    return { urn: `urn:li:person:${data.id}`, name, email: null };
  }
}

/** „me“, eine Seiten-ID oder eine fertige URN → URN des Absenders. */
export async function resolveAuthor(author = "me") {
  if (author === "me") {
    const token = await loadToken();
    if (token?.person?.urn) return token.person.urn;
    const person = await whoami();
    if (token) await saveToken({ ...token, person });
    return person.urn;
  }
  if (author.startsWith("urn:li:")) return author;
  if (/^\d+$/.test(author)) return `urn:li:organization:${author}`;
  throw new Error(`Unbekannter Absender „${author}“ – erwartet: "me", eine Seiten-ID oder eine URN.`);
}

/** Lädt ein lokales Bild hoch und liefert dessen URN (urn:li:image:…). */
export async function uploadImage(ownerUrn, filePath) {
  const bytes = await readFile(filePath);
  const { data } = await api("POST", "/rest/images?action=initializeUpload", {
    body: { initializeUploadRequest: { owner: ownerUrn } },
  });
  const { uploadUrl, image } = data.value;
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/octet-stream",
    },
    body: bytes,
  });
  if (!res.ok) {
    throw new Error(`Bild-Upload von ${basename(filePath)} fehlgeschlagen (${res.status}).`);
  }
  return image;
}

/** Beitragstext ist „Little Text“: reservierte Zeichen müssen maskiert werden, Hashtags bleiben erhalten. */
export const escapeCommentary = (text) => text.replace(/[\\|{}@[\]()<>*_~]/g, "\\$&");
