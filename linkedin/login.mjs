#!/usr/bin/env node
// Einmalige Anmeldung bei LinkedIn: fragt die App-Zugangsdaten ab, öffnet die Freigabeseite im Browser
// und legt das Token unter ~/.config/taswiq-linkedin ab.
//
//   node linkedin/login.mjs            Rechte für Profil-Beiträge (sofort verfügbar)
//   node linkedin/login.mjs seiten     Rechte für Unternehmensseiten (Community Management API)
//   node linkedin/login.mjs --neu      App-Zugangsdaten neu eingeben
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { createInterface } from "node:readline";
import {
  CONFIG_DIR,
  REDIRECT_PORT,
  REDIRECT_URI,
  SCOPE_PRESETS,
  loadApp,
  requestToken,
  saveApp,
  saveToken,
  whoami,
} from "./lib.mjs";

const args = process.argv.slice(2);
const preset = args.find((a) => a in SCOPE_PRESETS) ?? "profil";
const customScopes = args.find((a) => a.startsWith("--scopes="))?.slice("--scopes=".length);
const scopes = customScopes ? customScopes.split(/[\s,]+/).filter(Boolean) : SCOPE_PRESETS[preset];

function ask(question, { hidden = false } = {}) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
    // Das Secret soll nicht im Terminal stehen bleiben.
    if (hidden) rl._writeToOutput = () => {};
  });
}

async function appCredentials() {
  const stored = await loadApp();
  if (stored && !args.includes("--neu")) return stored;
  console.log("\nZugangsdaten der LinkedIn-App (linkedin.com/developers → App → Auth):");
  const clientId = process.env.LINKEDIN_CLIENT_ID || (await ask("  Client ID: "));
  const clientSecret =
    process.env.LINKEDIN_CLIENT_SECRET || (await ask("  Client Secret: ", { hidden: true }));
  if (!clientId || !clientSecret) throw new Error("Client ID und Client Secret werden beide benötigt.");
  const app = { clientId, clientSecret };
  await saveApp(app);
  return app;
}

// Eine frühere, noch wartende Anmeldung hält den Port fest – sie wird durch die neue ersetzt.
function stopPreviousLogin() {
  const pids = spawnSync("lsof", ["-ti", `tcp:${REDIRECT_PORT}`, "-sTCP:LISTEN"], { encoding: "utf8" })
    .stdout.split("\n")
    .filter(Boolean);
  for (const pid of pids) {
    const command = spawnSync("ps", ["-o", "command=", "-p", pid], { encoding: "utf8" }).stdout;
    if (!command.includes("login.mjs")) {
      throw new Error(`Port ${REDIRECT_PORT} ist von einem anderen Programm belegt (PID ${pid}).`);
    }
    process.kill(Number(pid));
  }
  if (pids.length) spawnSync("sleep", ["0.5"]);
}

function waitForCode(state) {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, REDIRECT_URI);
      if (url.pathname !== "/callback") {
        res.writeHead(404).end();
        return;
      }
      const error = url.searchParams.get("error");
      const ok = !error && url.searchParams.get("state") === state && url.searchParams.get("code");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        `<!doctype html><meta charset="utf-8"><title>LinkedIn</title><body style="font:16px system-ui;padding:3rem">${
          ok ? "LinkedIn ist verbunden. Dieses Fenster kann geschlossen werden." : "Die Anmeldung ist fehlgeschlagen. Details stehen im Terminal."
        }</body>`,
      );
      server.close();
      clearTimeout(timer);
      if (ok) resolve(ok);
      else reject(new Error(url.searchParams.get("error_description") || error || "Ungültige Antwort von LinkedIn."));
    });
    const timer = setTimeout(() => {
      server.close();
      reject(new Error("Keine Anmeldung innerhalb von 10 Minuten."));
    }, 10 * 60_000);
    server.on("error", reject);
    server.listen(REDIRECT_PORT, "localhost");
  });
}

try {
  const app = await appCredentials();
  stopPreviousLogin();
  const state = randomBytes(16).toString("hex");
  const authUrl =
    "https://www.linkedin.com/oauth/v2/authorization?" +
    new URLSearchParams({
      response_type: "code",
      client_id: app.clientId,
      redirect_uri: REDIRECT_URI,
      state,
      scope: scopes.join(" "),
    });

  const code = waitForCode(state);
  console.log(`\nAngefragte Rechte: ${scopes.join(", ")}`);
  console.log(`Der Browser öffnet sich. Falls nicht, diese Adresse aufrufen:\n${authUrl}\n`);
  spawn("open", [authUrl], { stdio: "ignore", detached: true }).unref();

  const token = await requestToken(app, {
    grant_type: "authorization_code",
    code: await code,
    redirect_uri: REDIRECT_URI,
  });
  await saveToken(token);
  const person = await whoami().catch(() => null);
  if (person) await saveToken({ ...token, person });

  const days = Math.round((token.expiresAt - Date.now()) / 86_400_000);
  console.log(`Verbunden${person ? ` als ${person.name}` : ""}. Token gültig für ${days} Tage.`);
  console.log(token.refreshToken ? "Verlängerung läuft automatisch." : "Danach ist eine erneute Anmeldung nötig.");
  console.log(`Abgelegt in ${CONFIG_DIR}`);
} catch (error) {
  console.error(`\nFehler: ${error.message}`);
  process.exit(1);
}
