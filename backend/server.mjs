#!/usr/bin/env node
/**
 * TasWiq Media. – Backend-API (läuft als Service auf dem Sprite "taswiq-media").
 * Ersetzt Supabase: SQLite (node:sqlite, keine Abhängigkeiten) + kleine REST-API + SSE.
 * Nur die Next.js-Serverseite und n8n sprechen mit dieser API (Header `x-taswiq-token`);
 * der Browser nie.
 *
 * Env:
 *   TASWIQ_API_TOKEN            (Pflicht) gemeinsames Secret für Next.js/n8n
 *   ADMIN_EMAILS                kommagetrennt – nur diese Adressen bekommen einen Login-Link
 *   SITE_URL                    Basis der Website, z. B. https://taswiq.com (für den Login-Link)
 *   MAGIC_LINK_WEBHOOK_URL      n8n-Webhook, der die Login-Mail verschickt (POST {email, link})
 *   MAGIC_LINK_WEBHOOK_SECRET   optional, als Header x-taswiq-secret
 *   DB_PATH                     Standard: ./data/taswiq.db
 *   PORT                        Standard: 8080
 */
import http from "node:http";
import { randomUUID, createHash, timingSafeEqual, randomBytes } from "node:crypto";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { createJev } from "./jev.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 8080);
const TOKEN = process.env.TASWIQ_API_TOKEN ?? "";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
const SITE_URL = (process.env.SITE_URL ?? "").replace(/\/$/, "");
const DB_PATH = resolve(process.env.DB_PATH ?? `${here}/data/taswiq.db`);

if (!TOKEN || TOKEN.length < 24) {
  console.error("TASWIQ_API_TOKEN fehlt oder ist zu kurz (mind. 24 Zeichen).");
  process.exit(1);
}

mkdirSync(dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec("pragma journal_mode = wal; pragma foreign_keys = on; pragma busy_timeout = 5000;");
db.exec(readFileSync(`${here}/schema.sql`, "utf8"));
// Preis-Seed nur beim ersten Start (leere Tabelle) – spätere Änderungen macht das Dashboard.
if (db.prepare("select count(*) as n from services").get().n === 0) {
  try {
    db.exec(readFileSync(`${here}/seed.sql`, "utf8"));
    console.log("[db] services aus seed.sql befüllt");
  } catch (e) {
    console.warn("[db] seed.sql nicht geladen:", e.message);
  }
}

const jev = createJev({ db });
console.log(jev.enabled ? `[jev] aktiv (Tageslimit ${jev.usage().limit})` : "[jev] aus (kein JEV_API_KEY)");

// ─── Helfer ─────────────────────────────────────────────────────────
const now = () => new Date().toISOString();
const ENUMS = {
  eventType: ["created", "status_change", "note", "email_sent", "call", "automation"],
  status: ["neu", "kontaktiert", "angebot", "verhandlung", "gewonnen", "verloren", "archiviert"],
};
const LEAD_JSON = ["interests", "score_reasons", "source_meta", "automation"];
const CALC_JSON = ["service_ids", "state", "summary", "line_items", "utm"];
const json = (v) => JSON.stringify(v ?? null);
const parseCols = (row, cols) => {
  if (!row) return row;
  const out = { ...row };
  for (const c of cols) out[c] = out[c] == null ? out[c] : JSON.parse(out[c]);
  return out;
};
const lead = (row) => parseCols(row, LEAD_JSON);
const calc = (row) => parseCols(row, CALC_JSON);
const event = (row) => parseCols(row, ["payload"]);
const service = (row) => ({ ...row, dreh: !!row.dreh, is_active: !!row.is_active });
const hash = (s) => createHash("sha256").update(s).digest("hex");
const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
const tx = (fn) => {
  db.exec("begin immediate");
  try {
    const r = fn();
    db.exec("commit");
    return r;
  } catch (e) {
    db.exec("rollback");
    throw e;
  }
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const need = (cond, msg = "invalid") => {
  if (!cond) throw new HttpError(422, msg);
};

// ─── Live-Updates (SSE) ─────────────────────────────────────────────
const listeners = new Set();
const broadcast = (type, id) => {
  const msg = `event: change\ndata: ${JSON.stringify({ type, id, at: now() })}\n\n`;
  for (const res of listeners) res.write(msg);
};
setInterval(() => {
  for (const res of listeners) res.write(": ping\n\n");
}, 20_000).unref();

// ─── Handler ────────────────────────────────────────────────────────
const routes = [];
const route = (method, pattern, handler) => {
  const keys = [];
  const re = new RegExp("^" + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)")) + "$");
  routes.push({ method, re, keys, handler });
};

const LEAD_INSERT = [
  "name", "email", "phone", "company", "message", "source", "industry", "interests", "project_status", "budget",
  "estimate_min", "estimate_max", "monthly_estimate", "calculator_request_id", "score", "score_reasons", "tier",
  "consent_at", "source_meta", "ip_hash",
];

route("GET", "/health", () => ({ ok: true, at: now() }));

route("POST", "/leads", ({ body }) => {
  need(body && typeof body === "object");
  const id = randomUUID();
  const t = now();
  const v = { ...body, interests: body.interests ?? [], score_reasons: body.score_reasons ?? [], source_meta: body.source_meta ?? {} };
  const cols = LEAD_INSERT.filter((c) => v[c] !== undefined);
  const vals = cols.map((c) => (LEAD_JSON.includes(c) ? json(v[c]) : v[c] ?? null));
  tx(() => {
    db.prepare(`insert into leads (id, created_at, updated_at, ${cols.join(",")}) values (?, ?, ?, ${cols.map(() => "?").join(",")})`).run(id, t, t, ...vals);
    db.prepare("insert into lead_events (id, lead_id, type, to_status, payload, created_at) values (?, ?, 'created', 'neu', ?, ?)")
      .run(randomUUID(), id, json({ tier: v.tier, score: v.score, source: v.source ?? "funnel" }), t);
    if (v.calculator_request_id) {
      db.prepare("update calculator_requests set converted_lead_id = ? where id = ?").run(id, v.calculator_request_id);
    }
  });
  broadcast("lead", id);
  // Jev-Qualifizierung läuft im Hintergrund – der Lead ist gespeichert, die Antwort wartet nicht darauf.
  void jev.qualify({ ...v, id }).then((r) => {
    if (r && !r.skipped) broadcast("lead", id);
  });
  return { id };
});

/** Jev für einen bestehenden Lead erneut ausführen (kostet einen Credit, zählt zum Tageslimit). */
route("POST", "/leads/:id/qualify", async ({ params }) => {
  const row = db.prepare("select * from leads where id = ?").get(params.id);
  if (!row) throw new HttpError(404, "notFound");
  const result = await jev.qualify(lead(row));
  if (!result.skipped) broadcast("lead", params.id);
  return result;
});

route("GET", "/jev/usage", () => jev.usage());

route("GET", "/leads", ({ query }) => {
  const where = [];
  const args = [];
  const filter = (clause, ...values) => {
    where.push(clause);
    args.push(...values);
  };
  if (query.get("status")) filter("status = ?", query.get("status"));
  if (query.get("tier")) filter("tier = ?", query.get("tier"));
  const q = query.get("q")?.replace(/[%_\\]/g, "").trim();
  if (q) filter("(name like ? or email like ? or company like ?)", `%${q}%`, `%${q}%`, `%${q}%`);
  const rows = db.prepare(`select * from leads ${where.length ? "where " + where.join(" and ") : ""} order by created_at desc limit 200`).all(...args);
  return rows.map(lead);
});

route("GET", "/leads/:id", ({ params, query }) => {
  const row = db.prepare("select * from leads where id = ?").get(params.id);
  if (!row) throw new HttpError(404, "notFound");
  // ?fields=status,name,tier → flaches Objekt nur mit diesen Feldern (für n8n-Follow-up)
  const fields = query.get("fields");
  if (fields) {
    const l = lead(row);
    return Object.fromEntries(fields.split(",").filter((f) => f in l).map((f) => [f, l[f]]));
  }
  const events = db.prepare("select * from lead_events where lead_id = ? order by created_at desc").all(params.id);
  return { lead: lead(row), events: events.map(event) };
});

route("PATCH", "/leads/:id", ({ params, body }) => {
  need(body && typeof body === "object");
  const { actor = null } = body;
  const result = tx(() => {
    const old = db.prepare("select * from leads where id = ?").get(params.id);
    if (!old) throw new HttpError(404, "notFound");
    const set = { updated_at: now() };
    for (const k of ["deal_value", "next_action_at", "owner_notes"]) if (k in body) set[k] = body[k] ?? null;
    if ("status" in body) {
      need(ENUMS.status.includes(body.status), "status");
      set.status = body.status;
      if (body.status !== old.status) {
        db.prepare("insert into lead_events (id, lead_id, type, from_status, to_status, created_by, created_at) values (?, ?, 'status_change', ?, ?, ?, ?)")
          .run(randomUUID(), params.id, old.status, body.status, actor, set.updated_at);
        if (body.status === "kontaktiert" && !old.last_contacted_at) set.last_contacted_at = set.updated_at;
      }
    }
    if (body.automation && typeof body.automation === "object") {
      set.automation = json({ ...JSON.parse(old.automation), ...body.automation });
    }
    const cols = Object.keys(set);
    db.prepare(`update leads set ${cols.map((c) => `${c} = ?`).join(", ")} where id = ?`).run(...cols.map((c) => set[c]), params.id);
    return db.prepare("select * from leads where id = ?").get(params.id);
  });
  broadcast("lead", params.id);
  return lead(result);
});

route("POST", "/leads/:id/events", ({ params, body }) => {
  need(body && ENUMS.eventType.includes(body.type), "type");
  if (!db.prepare("select 1 from leads where id = ?").get(params.id)) throw new HttpError(404, "notFound");
  const id = randomUUID();
  db.prepare("insert into lead_events (id, lead_id, type, body, payload, created_by, created_at) values (?, ?, ?, ?, ?, ?, ?)")
    .run(id, params.id, body.type, body.body ?? null, json(body.payload ?? {}), body.created_by ?? null, now());
  broadcast("event", params.id);
  return { id };
});

route("POST", "/calculator-requests", ({ body }) => {
  need(body && typeof body === "object");
  const id = randomUUID();
  db.prepare(
    `insert into calculator_requests (id, session_id, industry, service_ids, state, summary, line_items, estimate_min, estimate_max, monthly_total, pricing_version, utm, referrer)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id, body.session_id ?? null, body.industry, json(body.service_ids), json(body.state), json(body.summary ?? []), json(body.line_items ?? []),
    body.estimate_min, body.estimate_max, body.monthly_total ?? 0, body.pricing_version, json(body.utm ?? {}), body.referrer ?? null,
  );
  return { id };
});

route("GET", "/calculator-requests", () =>
  db.prepare("select * from calculator_requests order by created_at desc limit 200").all().map(calc),
);

route("GET", "/services", ({ query }) => {
  const rows = db.prepare(`select * from services ${query.get("all") ? "" : "where is_active = 1"} order by group_id, sort_order`).all();
  return rows.map(service);
});

route("PUT", "/services", ({ body }) => {
  need(Array.isArray(body) && body.length > 0 && body.length <= 500);
  tx(() => {
    const stmt = db.prepare(
      `insert into services (group_id, option_id, label, preis, mtl, is_active) values (?, ?, ?, ?, ?, ?)
       on conflict (group_id, option_id) do update set label = excluded.label, preis = excluded.preis, mtl = excluded.mtl,
         is_active = excluded.is_active, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    );
    for (const r of body) {
      need(/^\w+$/.test(r.group_id) && /^\w+$/.test(r.option_id) && typeof r.label === "string", "service");
      stmt.run(r.group_id, r.option_id, r.label, r.preis ?? null, r.mtl ?? null, r.is_active ? 1 : 0);
    }
  });
  return { ok: true };
});

route("POST", "/auth/request", async ({ body }) => {
  const email = String(body?.email ?? "").trim().toLowerCase();
  // Immer dieselbe Antwort – verrät nicht, ob die Adresse existiert.
  if (!email || !ADMIN_EMAILS.includes(email) || !SITE_URL) return { ok: true };
  const token = randomBytes(32).toString("hex");
  db.prepare("insert into login_tokens (token_hash, email, expires_at) values (?, ?, ?)").run(
    hash(token), email, new Date(Date.now() + 15 * 60_000).toISOString(),
  );
  const link = `${SITE_URL}/admin/auth/callback?token=${token}`;
  const hook = process.env.MAGIC_LINK_WEBHOOK_URL;
  if (hook) {
    const headers = { "content-type": "application/json" };
    if (process.env.MAGIC_LINK_WEBHOOK_SECRET) headers["x-taswiq-secret"] = process.env.MAGIC_LINK_WEBHOOK_SECRET;
    await fetch(hook, { method: "POST", headers, body: JSON.stringify({ event: "admin.login", email, link }), signal: AbortSignal.timeout(5000) })
      .catch((e) => console.error("[auth] Webhook fehlgeschlagen:", e.message));
  } else {
    // Bootstrap ohne Mail-Versand: Link nur im (privaten) Service-Log.
    console.log(`[auth] Login-Link für ${email}: ${link}`);
  }
  return { ok: true };
});

route("POST", "/auth/verify", ({ body }) => {
  const token = String(body?.token ?? "");
  need(/^[a-f0-9]{64}$/.test(token), "token");
  const row = tx(() => {
    const r = db.prepare("select * from login_tokens where token_hash = ? and used_at is null and expires_at > ?").get(hash(token), now());
    if (r) db.prepare("update login_tokens set used_at = ? where token_hash = ?").run(now(), r.token_hash);
    return r;
  });
  if (!row) throw new HttpError(401, "invalidToken");
  return { email: row.email };
});

// ─── Server ─────────────────────────────────────────────────────────
const send = (res, status, data) => {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(data));
};

const readBody = (req) =>
  new Promise((ok, fail) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > 256 * 1024) {
        fail(new HttpError(413, "tooLarge"));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => {
      try {
        ok(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : null);
      } catch {
        fail(new HttpError(400, "badJson"));
      }
    });
    req.on("error", fail);
  });

http
  .createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    try {
      if (url.pathname === "/health") return send(res, 200, { ok: true });
      const given = req.headers["x-taswiq-token"] ?? "";
      if (typeof given !== "string" || !safeEqual(given, TOKEN)) throw new HttpError(401, "unauthorized");

      if (req.method === "GET" && url.pathname === "/events") {
        res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive", "x-accel-buffering": "no" });
        res.write(": connected\n\n");
        listeners.add(res);
        req.on("close", () => listeners.delete(res));
        return;
      }

      for (const r of routes) {
        if (r.method !== req.method) continue;
        const m = r.re.exec(url.pathname);
        if (!m) continue;
        const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
        const body = req.method === "GET" ? null : await readBody(req);
        return send(res, 200, await r.handler({ params, body, query: url.searchParams }));
      }
      throw new HttpError(404, "notFound");
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, { error: e.message });
      // CHECK-/FK-Verstöße der DB sind Client-Fehler, alles andere Serverfehler.
      if (/constraint/i.test(String(e?.message))) return send(res, 422, { error: "constraint", detail: String(e.message).slice(0, 200) });
      console.error("[api]", req.method, url.pathname, e);
      return send(res, 500, { error: "server" });
    }
  })
  .listen(PORT, "0.0.0.0", () => console.log(`[api] TasWiq Backend läuft auf :${PORT} (DB: ${DB_PATH})`));
