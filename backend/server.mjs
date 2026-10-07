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
import { randomUUID, createHash, timingSafeEqual, randomBytes, scryptSync } from "node:crypto";
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

// Spalten, die nach dem ersten Livegang dazukamen (create table if not exists ergänzt keine Spalten).
for (const [table, col, def] of [
  ["tasks", "executor", "text not null default 'karim'"], // wer setzt um: karim | claude | beide (Claude mit Angaben von Karim)
  ["tasks", "run_state", "text"], // Auftrag an Claude: beauftragt → laeuft → fertig | rueckfrage
  ["tasks", "run_input", "text"], // Angaben von Karim für die Umsetzung
  ["tasks", "run_note", "text"], // Rückmeldung von Claude
  ["tasks", "run_requested_at", "text"],
  ["tasks", "department", "text not null default 'leitung'"], // zuständige Abteilung des Teams
  ["tasks", "proposed_by", "text"], // Abteilung, die die Aufgabe vorgeschlagen hat (null = Karim / Claude-Sitzung)
  ["tasks", "requested_by", "text"], // Abteilung, die sie bei einer anderen angefragt hat
  ["tasks", "risk", "text not null default 'niedrig'"], // hoch = nie ohne Freigabe von Karim
  ["tasks", "queue_pos", "integer"], // von Karim festgelegte Reihenfolge in der Warteschlange (kleiner = früher)
  ["tasks", "client", "text"], // Kundenauftrag (Name des Kunden) – leer = TasWiq selbst
]) {
  if (!db.prepare(`select 1 from pragma_table_info('${table}') where name = ?`).get(col)) db.exec(`alter table ${table} add column ${col} ${def}`);
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

// ─── Passwort-Login ─────────────────────────────────────────────────
const pwHash = (password, salt) => scryptSync(password, salt, 64).toString("hex");
/** Sperre nach Fehlversuchen: 5 falsche Passwörter → 15 Minuten Pause (pro E-Mail, im Speicher). */
const fails = new Map();
const LOCK_AFTER = 5;
const LOCK_MS = 15 * 60_000;

const checkPassword = (email, password) => {
  const row = db.prepare("select * from admin_credentials where email = ?").get(email);
  // Auch ohne Treffer rechnen – sonst verrät die Antwortzeit, ob es das Konto gibt.
  const given = pwHash(password, row?.salt ?? "no-such-account");
  return Boolean(row) && safeEqual(given, row.password_hash);
};

route("POST", "/auth/password", ({ body }) => {
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  need(email && password.length <= 200, "credentials");
  const f = fails.get(email);
  if (f && f.n >= LOCK_AFTER && Date.now() - f.at < LOCK_MS) throw new HttpError(429, "locked");
  if (!ADMIN_EMAILS.includes(email) || !checkPassword(email, password)) {
    fails.set(email, { n: (f && Date.now() - f.at < LOCK_MS ? f.n : 0) + 1, at: Date.now() });
    if (fails.size > 1000) fails.clear();
    throw new HttpError(401, "invalidCredentials");
  }
  fails.delete(email);
  return { email };
});

/** Passwort setzen/ändern. `current` ist Pflicht, sobald schon eines existiert (außer force = Bootstrap über die Konsole). */
route("POST", "/auth/set-password", ({ body }) => {
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  need(ADMIN_EMAILS.includes(email), "email");
  need(password.length >= 10 && password.length <= 200, "weakPassword");
  const exists = db.prepare("select 1 from admin_credentials where email = ?").get(email);
  if (exists && !body.force && !checkPassword(email, String(body?.current ?? ""))) throw new HttpError(401, "invalidCredentials");
  const salt = randomBytes(16).toString("hex");
  db.prepare(
    `insert into admin_credentials (email, password_hash, salt, updated_at) values (?, ?, ?, ?)
     on conflict (email) do update set password_hash = excluded.password_hash, salt = excluded.salt, updated_at = excluded.updated_at`,
  ).run(email, pwHash(password, salt), salt, now());
  return { ok: true };
});

// ─── Aufgaben (Arbeits-Dashboard) ───────────────────────────────────
const TASK_FIELDS = ["title", "why", "steps", "category", "priority", "effort", "status", "source", "executor", "run_state", "run_input", "run_note", "department", "proposed_by", "requested_by", "risk", "client"];
const DEPARTMENTS = ["leitung", "entwicklung", "wachstum", "marketing", "vertrieb", "qualitaet", "analyse"];
const DEPARTMENT_NAME = { leitung: "Leitung", entwicklung: "Entwicklung", wachstum: "Wachstum", marketing: "Marketing", vertrieb: "Angebot & Vertrieb", qualitaet: "Qualität & Sicherheit", analyse: "Analyse" };
const RUN_STATES = [null, "beauftragt", "laeuft", "fertig", "rueckfrage", "zurueckgestellt"]; // zurueckgestellt = von Karim geparkt, wird nicht automatisch eingereiht
const taskValues = (body) => {
  const v = {};
  for (const k of TASK_FIELDS) if (body[k] !== undefined) v[k] = body[k];
  if (v.title !== undefined) v.title = String(v.title).trim().slice(0, 200);
  for (const k of ["why", "steps", "run_input", "run_note"]) if (v[k] != null) v[k] = String(v[k]).trim().slice(0, 4000) || null;
  if (v.client != null) v.client = String(v.client).trim().slice(0, 120) || null;
  if (v.executor !== undefined) need(["karim", "claude", "beide"].includes(v.executor), "executor");
  if (v.run_state !== undefined) need(RUN_STATES.includes(v.run_state), "run_state");
  if (v.department !== undefined) need(DEPARTMENTS.includes(v.department), "department");
  if (v.risk !== undefined) need(["niedrig", "hoch"].includes(v.risk), "risk");
  for (const k of ["proposed_by", "requested_by"]) if (v[k] != null) need(DEPARTMENTS.includes(v[k]), k);
  return v;
};
const insertTask = (body) => {
  const v = taskValues(body);
  need(v.title && v.title.length >= 3, "title");
  const id = randomUUID();
  const t = now();
  const cols = Object.keys(v);
  db.prepare(`insert into tasks (id, key, created_at, updated_at, done_at, ${cols.join(",")}) values (?, ?, ?, ?, ?, ${cols.map(() => "?").join(",")})`)
    .run(id, body.key ? String(body.key).slice(0, 80) : null, t, t, v.status === "erledigt" ? t : null, ...cols.map((c) => v[c]));
  return id;
};

/** ?queue=1 → nur Aufgaben, die Karim im Dashboard an Claude übergeben hat (älteste zuerst). */
route("GET", "/tasks", ({ query }) =>
  query.get("queue")
    ? db.prepare("select * from tasks where run_state = 'beauftragt' and status != 'erledigt' order by run_requested_at").all()
    : db.prepare("select * from tasks order by case status when 'in_arbeit' then 0 when 'offen' then 1 else 2 end, priority, created_at").all(),
);

route("POST", "/tasks", ({ body }) => {
  need(body && typeof body === "object");
  const id = insertTask(body);
  broadcast("task", id);
  return { id };
});

/** Mehrere Aufgaben einspielen – Einträge mit bereits vorhandenem `key` werden übersprungen (kein Überschreiben). */
route("POST", "/tasks/bulk", ({ body, query }) => {
  need(Array.isArray(body) && body.length > 0 && body.length <= 200);
  // ?update=1 → vorhandene Aufgaben (gleicher key) mit den mitgegebenen Feldern aktualisieren, z. B. beim Umplanen.
  const update = Boolean(query.get("update"));
  let added = 0;
  let updated = 0;
  tx(() => {
    for (const t of body) {
      const old = t.key ? db.prepare("select * from tasks where key = ?").get(String(t.key)) : null;
      if (!old) {
        insertTask(t);
        added++;
      } else if (update) {
        const set = { ...taskValues(t), updated_at: now() };
        if (set.status && set.status !== old.status) set.done_at = set.status === "erledigt" ? set.updated_at : null;
        const cols = Object.keys(set);
        db.prepare(`update tasks set ${cols.map((c) => `${c} = ?`).join(", ")} where id = ?`).run(...cols.map((c) => set[c]), old.id);
        updated++;
      }
    }
  });
  if (added || updated) broadcast("task", "bulk");
  return { added, updated, skipped: body.length - added - updated };
});

route("PATCH", "/tasks/:id", ({ params, body }) => {
  need(body && typeof body === "object");
  const old = db.prepare("select * from tasks where id = ? or key = ?").get(params.id, params.id);
  if (!old) throw new HttpError(404, "notFound");
  const set = { ...taskValues(body), updated_at: now() };
  if (set.status && set.status !== old.status) set.done_at = set.status === "erledigt" ? set.updated_at : null;
  if (set.run_state === "beauftragt" && old.run_state !== "beauftragt") set.run_requested_at = set.updated_at;
  const cols = Object.keys(set);
  db.prepare(`update tasks set ${cols.map((c) => `${c} = ?`).join(", ")} where id = ?`).run(...cols.map((c) => set[c]), old.id);
  broadcast("task", old.id);
  return db.prepare("select * from tasks where id = ?").get(old.id);
});

/** Reihenfolge in der Warteschlange der Abteilung ändern: up | down | top. Danach sind alle Plätze der Abteilung fest nummeriert. */
route("POST", "/tasks/:id/move", ({ params, body }) => {
  const task = db.prepare("select * from tasks where id = ?").get(params.id);
  if (!task) throw new HttpError(404, "notFound");
  need(["up", "down", "top"].includes(body?.dir), "dir");
  const ids = queueOf(task.department).map((t) => t.id);
  const i = ids.indexOf(task.id);
  need(i >= 0, "notQueued");
  const j = body.dir === "top" ? 0 : body.dir === "up" ? Math.max(0, i - 1) : Math.min(ids.length - 1, i + 1);
  ids.splice(j, 0, ids.splice(i, 1)[0]);
  tx(() => ids.forEach((id, pos) => db.prepare("update tasks set queue_pos = ? where id = ?").run(pos, id)));
  broadcast("task", task.id);
  return { ok: true };
});

route("DELETE", "/tasks/:id", ({ params }) => {
  const r = db.prepare("delete from tasks where id = ?").run(params.id);
  if (!r.changes) throw new HttpError(404, "notFound");
  broadcast("task", params.id);
  return { ok: true };
});

// ─── Team (Command Center) ──────────────────────────────────────────
// Abteilungen sind Claude-Sitzungen auf Karims Rechner. Sie holen Arbeit ausschließlich über diese Endpunkte ab –
// Hauptschalter, Tageslimit und „immer nur eine Abteilung gleichzeitig“ werden deshalb hier durchgesetzt, nicht im Prompt.
const SETTING_DEFAULTS = { team_active: "0", autonomy: "freigabe", max_tasks_per_day: "3" };
const settings = () => ({ ...SETTING_DEFAULTS, ...Object.fromEntries(db.prepare("select key, value from settings").all().map((r) => [r.key, r.value])) });
const logEvent = (agent, kind, text, taskId = null) => {
  db.prepare("insert into agent_events (agent, kind, task_id, text, created_at) values (?, ?, ?, ?, ?)").run(agent, kind, taskId, String(text).trim().slice(0, 1000), now());
  broadcast("team", agent);
};
const today = () => now().slice(0, 10);
const STALE_MS = 45 * 60_000; // 45 Minuten ohne Meldung → der Durchlauf gilt als abgebrochen (jede Meldung verlängert)
const PLAN_EVERY_MS = 20 * 3_600_000; // jede Abteilung plant höchstens einmal am Tag – und nur, wenn ihre Warteschlange leer ist

/**
 * Vollautomatik: Im Modus „selbststaendig“ wandert jede offene Aufgabe, die eine Abteilung allein lösen kann
 * (executor claude, kleines Risiko), von selbst in die Warteschlange – egal, wer sie angelegt hat.
 */
const autoQueue = () => {
  const s = settings();
  if (s.team_active !== "1" || s.autonomy !== "selbststaendig") return;
  const t = now();
  db.prepare("update tasks set run_state = 'beauftragt', run_requested_at = ?, updated_at = ? where status = 'offen' and run_state is null and executor = 'claude' and risk = 'niedrig'").run(t, t);
};

/** Hängengebliebene Durchläufe freigeben und die gerade arbeitende Abteilung liefern (oder null). */
const runningTask = () => {
  for (const t of db.prepare("select * from tasks where run_state = 'laeuft'").all()) {
    if (Date.now() - Date.parse(t.updated_at) < STALE_MS) return t;
    db.prepare("update tasks set run_state = 'rueckfrage', status = 'offen', run_note = ?, updated_at = ? where id = ?")
      .run("Der Durchlauf wurde nicht abgeschlossen (abgebrochen oder Zeit überschritten). Bitte erneut übergeben.", now(), t.id);
    logEvent(t.department, "fehler", `Durchlauf abgebrochen: ${t.title}`, t.id);
  }
  return null;
};
const startsToday = (agent) => db.prepare("select count(*) as n from agent_events where agent = ? and kind = 'start' and substr(created_at, 1, 10) = ?").get(agent, today()).n;
const queueOf = (agent) =>
  db.prepare("select * from tasks where department = ? and run_state = 'beauftragt' and status != 'erledigt' and executor != 'karim' order by coalesce(queue_pos, 1000000), priority, run_requested_at").all(agent);
const lastPlan = (agent) => db.prepare("select max(created_at) as at from agent_events where agent = ? and kind = 'planung'").get(agent).at;
const planDue = (agent) => {
  const at = lastPlan(agent);
  return !at || Date.now() - Date.parse(at) > PLAN_EVERY_MS;
};

route("GET", "/team/state", () => {
  autoQueue();
  const s = settings();
  const running = runningTask();
  return {
    settings: s,
    running: running ? { department: running.department, task_id: running.id, title: running.title, since: running.updated_at } : null,
    departments: DEPARTMENTS.map((id) => ({
      id,
      queued: queueOf(id).length,
      starts_today: startsToday(id),
      last_plan_at: lastPlan(id),
      last_event: db.prepare("select kind, text, created_at from agent_events where agent = ? order by id desc limit 1").get(id) ?? null,
    })),
    events: db.prepare("select e.*, t.title as task_title from agent_events e left join tasks t on t.id = e.task_id order by e.id desc limit 80").all(),
  };
});

route("POST", "/team/settings", ({ body }) => {
  need(body && typeof body === "object");
  const set = {};
  if (body.team_active !== undefined) set.team_active = body.team_active ? "1" : "0";
  if (body.autonomy !== undefined) {
    need(["freigabe", "selbststaendig"].includes(body.autonomy), "autonomy");
    set.autonomy = body.autonomy;
  }
  if (body.max_tasks_per_day !== undefined) set.max_tasks_per_day = String(Math.min(10, Math.max(1, Math.round(Number(body.max_tasks_per_day)) || 3)));
  for (const [k, v] of Object.entries(set)) db.prepare("insert into settings (key, value) values (?, ?) on conflict (key) do update set value = excluded.value").run(k, v);
  if (set.team_active) logEvent("leitung", "info", set.team_active === "1" ? "Team eingeschaltet" : "Team pausiert");
  autoQueue();
  return settings();
});

/** Taktgeber: Welche Abteilung soll als Nächstes loslaufen? Höchstens eine – und nur, wenn es wirklich etwas zu tun gibt. */
route("GET", "/team/next", () => {
  const s = settings();
  if (s.team_active !== "1") return { agent: null, reason: "pausiert" };
  autoQueue();
  const busy = runningTask();
  if (busy) return { agent: null, reason: "besetzt", by: busy.department };
  const max = Number(s.max_tasks_per_day);
  const ready = DEPARTMENTS.filter((d) => startsToday(d) < max);
  const work = ready.map((d) => ({ d, q: queueOf(d) })).filter((x) => x.q.length).sort((a, b) => a.q[0].priority - b.q[0].priority || a.q[0].run_requested_at.localeCompare(b.q[0].run_requested_at))[0];
  if (work) return { agent: work.d, mode: "arbeit", task: work.q[0].title };
  // Nichts in der Warteschlange → die Abteilung, deren Planung am längsten her ist, sucht neue Aufgaben.
  const due = DEPARTMENTS.filter(planDue).sort((a, b) => (lastPlan(a) ?? "").localeCompare(lastPlan(b) ?? ""))[0];
  return due ? { agent: due, mode: "planung" } : { agent: null, reason: "nichts zu tun" };
});

/** Abteilung holt ihre nächste Aufgabe ab. Ohne Aufgabe: `plan` sagt, ob stattdessen eine Planungsrunde dran ist. */
route("POST", "/team/claim", ({ body }) => {
  const agent = String(body?.agent ?? "");
  need(DEPARTMENTS.includes(agent), "agent");
  const s = settings();
  if (s.team_active !== "1") return { task: null, reason: "pausiert", plan: false };
  autoQueue();
  const busy = runningTask();
  if (busy) return { task: null, reason: "besetzt", plan: false };
  const task = startsToday(agent) < Number(s.max_tasks_per_day) ? queueOf(agent)[0] : null;
  if (!task) return { task: null, reason: queueOf(agent).length ? "tageslimit" : "leer", plan: !queueOf(agent).length && planDue(agent) };
  const t = now();
  db.prepare("update tasks set run_state = 'laeuft', status = 'in_arbeit', updated_at = ? where id = ?").run(t, task.id);
  logEvent(agent, "start", `Beginnt: ${task.title}`, task.id);
  return { task: { ...task, run_state: "laeuft", status: "in_arbeit" }, reason: null, plan: false };
});

route("POST", "/team/events", ({ body }) => {
  need(body && DEPARTMENTS.includes(body.agent) && ["schritt", "info", "planung"].includes(body.kind) && typeof body.text === "string" && body.text.trim(), "event");
  if (body.task_id) db.prepare("update tasks set updated_at = ? where id = ? and run_state = 'laeuft'").run(now(), String(body.task_id)); // hält den Durchlauf „lebendig“
  logEvent(body.agent, body.kind, body.text, body.task_id ? String(body.task_id) : null);
  return { ok: true };
});

route("POST", "/team/finish", ({ body }) => {
  need(body && DEPARTMENTS.includes(body.agent) && ["fertig", "rueckfrage", "fehler"].includes(body.result) && typeof body.note === "string" && body.note.trim(), "finish");
  const task = db.prepare("select * from tasks where id = ? or key = ?").get(String(body.task_id), String(body.task_id));
  if (!task) throw new HttpError(404, "notFound");
  const t = now();
  const note = body.note.trim().slice(0, 4000);
  if (body.result === "fertig") db.prepare("update tasks set run_state = 'fertig', status = 'erledigt', done_at = ?, run_note = ?, updated_at = ? where id = ?").run(t, note, t, task.id);
  else db.prepare("update tasks set run_state = 'rueckfrage', status = 'offen', run_note = ?, updated_at = ? where id = ?").run(note, t, task.id);
  logEvent(body.agent, body.result, `${body.result === "fertig" ? "Erledigt" : body.result === "rueckfrage" ? "Rückfrage" : "Fehler"}: ${task.title} – ${note.slice(0, 300)}`, task.id);
  broadcast("task", task.id);
  return { ok: true };
});

/**
 * Abteilung schlägt Aufgaben vor – für sich selbst oder für eine andere Abteilung (Übergabe).
 * Ob sie ohne Karims Freigabe in die Warteschlange dürfen, entscheidet der Schalter „autonomy“; riskante Aufgaben nie.
 */
route("POST", "/team/propose", ({ body }) => {
  const agent = String(body?.agent ?? "");
  need(DEPARTMENTS.includes(agent) && Array.isArray(body.tasks) && body.tasks.length > 0 && body.tasks.length <= 3, "propose");
  const s = settings();
  const waiting = db.prepare("select count(*) as n from tasks where proposed_by = ? and run_state is null and status = 'offen'").get(agent).n;
  if (waiting + body.tasks.length > 6) throw new HttpError(429, "tooManyOpenProposals");
  const out = [];
  tx(() => {
    for (const t of body.tasks) {
      if (t.key && db.prepare("select 1 from tasks where key = ?").get(String(t.key))) {
        out.push({ key: t.key, skipped: "exists" });
        continue;
      }
      const department = t.department ?? agent;
      const auto = s.autonomy === "selbststaendig" && (t.risk ?? "niedrig") === "niedrig" && t.executor === "claude";
      const id = insertTask({ ...t, department, source: "claude", status: "offen", proposed_by: agent, requested_by: department !== agent ? agent : null, run_state: auto ? "beauftragt" : null });
      if (auto) db.prepare("update tasks set run_requested_at = ? where id = ?").run(now(), id);
      logEvent(agent, department !== agent ? "uebergabe" : "vorschlag", `${department !== agent ? `An ${DEPARTMENT_NAME[department]}` : "Vorschlag"}: ${String(t.title).slice(0, 200)}${auto ? "" : " (wartet auf Freigabe)"}`, id);
      out.push({ id, queued: auto });
    }
  });
  broadcast("task", "bulk");
  return { tasks: out };
});

// ─── Besucherstatistik ──────────────────────────────────────────────
const clip = (v, n) => (v == null || v === "" ? null : String(v).slice(0, n));

route("POST", "/track", ({ body }) => {
  need(body && ["pageview", "event"].includes(body.type) && typeof body.path === "string" && typeof body.visitor === "string", "hit");
  const day = now().slice(0, 10);
  const visitor = body.visitor.slice(0, 64);
  // Folgeseiten und Ereignisse erben die Herkunft des Einstiegs – sonst würde jeder Besuch zusätzlich als „direkt“ zählen.
  const entry = body.inherit ? db.prepare("select channel, source, campaign from site_hits where day = ? and visitor = ? order by id limit 1").get(day, visitor) : null;
  const origin = entry ?? { channel: clip(body.channel, 30) ?? "direkt", source: clip(body.source, 120), campaign: clip(body.campaign, 120) };
  db.prepare(
    "insert into site_hits (day, type, name, path, locale, visitor, session_id, channel, source, campaign, device) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(
    day, body.type, clip(body.name, 60), body.path.slice(0, 200), clip(body.locale, 5), visitor,
    clip(body.session_id, 40), origin.channel, origin.source, origin.campaign, clip(body.device, 10),
  );
  return { ok: true };
});

route("GET", "/analytics", ({ query }) => {
  const days = Math.min(365, Math.max(1, Number(query.get("days")) || 30));
  const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  const all = (sql) => db.prepare(sql).all(since);
  const pv = "from site_hits where day >= ? and type = 'pageview'";
  return {
    days,
    since,
    totals: db.prepare(`select count(*) as views, count(distinct day || visitor) as visitors ${pv}`).get(since),
    daily: all(`select day, count(*) as views, count(distinct visitor) as visitors ${pv} group by day order by day`),
    pages: all(`select path, count(*) as views, count(distinct day || visitor) as visitors ${pv} group by path order by views desc limit 15`),
    channels: all(`select channel, count(distinct day || visitor) as visitors, count(*) as views ${pv} group by channel order by visitors desc`),
    sources: all(`select coalesce(source, 'direkt') as source, channel, count(distinct day || visitor) as visitors ${pv} group by 1, 2 order by visitors desc limit 15`),
    campaigns: all(`select campaign, count(distinct day || visitor) as visitors ${pv} and campaign is not null group by campaign order by visitors desc limit 10`),
    devices: all(`select coalesce(device, 'unbekannt') as device, count(distinct day || visitor) as visitors ${pv} group by 1 order by visitors desc`),
    locales: all(`select coalesce(locale, 'de') as locale, count(distinct day || visitor) as visitors ${pv} group by 1 order by visitors desc`),
    events: all("select name, count(*) as n, count(distinct day || visitor) as visitors from site_hits where day >= ? and type = 'event' group by name order by n desc"),
    leads: db.prepare("select count(*) as n from leads where substr(created_at, 1, 10) >= ?").get(since).n,
    calculations: db.prepare("select count(*) as n from calculator_requests where substr(created_at, 1, 10) >= ?").get(since).n,
  };
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
