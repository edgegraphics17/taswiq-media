import "server-only";
import { env, isBackendConfigured } from "@/lib/env";
import type {
  CalculatorRequest,
  CalculatorRequestInsert,
  LeadEventRow,
  LeadInsert,
  LeadRow,
  ServiceRowType,
  ServiceUpsert,
} from "@/types/database";

/**
 * Einzige Naht zum Backend (Sprite "taswiq-media", Code in backend/server.mjs).
 * Alle Aufrufe laufen serverseitig mit dem gemeinsamen Token; der Browser sieht das Backend nie.
 * Sprites schlafen bei Inaktivität – deshalb großzügiges Timeout und ein Retry bei Verbindungsfehlern.
 */

export class BackendError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(`Backend ${status}: ${code}`);
  }
}

interface CallOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT";
  body?: unknown;
  timeoutMs?: number;
}

async function call<T>(path: string, { method = "GET", body, timeoutMs = 10_000 }: CallOptions = {}): Promise<T> {
  const init: RequestInit = {
    method,
    headers: { "x-taswiq-token": env.backendToken, ...(body !== undefined ? { "content-type": "application/json" } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  };
  let res: Response;
  try {
    res = await fetch(`${env.backendUrl}${path}`, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (e) {
    // Nur bei echten Verbindungsfehlern (Kaltstart) wiederholen – nach einem Timeout kann die Anfrage schon verarbeitet sein.
    if (e instanceof Error && e.name === "TimeoutError") throw e;
    res = await fetch(`${env.backendUrl}${path}`, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string } & Record<string, unknown>;
  if (!res.ok) throw new BackendError(res.status, data.error ?? "unknown");
  return data as T;
}

// ─── Leads ──────────────────────────────────────────────────────────
export async function insertLead(lead: LeadInsert): Promise<string> {
  const { id } = await call<{ id: string }>("/leads", { method: "POST", body: lead });
  return id;
}

export interface LeadFilters {
  status?: string;
  tier?: string;
  q?: string;
}

export function listLeads(f: LeadFilters = {}): Promise<LeadRow[]> {
  const qs = new URLSearchParams();
  if (f.status) qs.set("status", f.status);
  if (f.tier) qs.set("tier", f.tier);
  if (f.q) qs.set("q", f.q);
  return call<LeadRow[]>(`/leads?${qs}`);
}

export async function getLeadWithEvents(id: string): Promise<{ lead: LeadRow; events: LeadEventRow[] } | null> {
  try {
    return await call<{ lead: LeadRow; events: LeadEventRow[] }>(`/leads/${encodeURIComponent(id)}`);
  } catch (e) {
    if (e instanceof BackendError && e.status === 404) return null;
    throw e;
  }
}

export interface LeadUpdate {
  status: string;
  deal_value: number | null;
  next_action_at: string | null;
  owner_notes: string | null;
  actor: string;
}

export function updateLead(id: string, patch: LeadUpdate): Promise<LeadRow> {
  return call<LeadRow>(`/leads/${encodeURIComponent(id)}`, { method: "PATCH", body: patch });
}

export async function addLeadNote(leadId: string, body: string, createdBy: string): Promise<void> {
  await call(`/leads/${encodeURIComponent(leadId)}/events`, { method: "POST", body: { type: "note", body, created_by: createdBy } });
}

// ─── Rechner ────────────────────────────────────────────────────────
export async function insertCalculatorRequest(row: CalculatorRequestInsert): Promise<string> {
  const { id } = await call<{ id: string }>("/calculator-requests", { method: "POST", body: row });
  return id;
}

export function listCalculatorRequests(): Promise<CalculatorRequest[]> {
  return call<CalculatorRequest[]>("/calculator-requests");
}

// ─── Preise ─────────────────────────────────────────────────────────
export function getServices(): Promise<ServiceRowType[]> {
  return call<ServiceRowType[]>("/services?all=1");
}

export async function upsertServices(rows: ServiceUpsert[]): Promise<void> {
  await call("/services", { method: "PUT", body: rows });
}

// ─── Admin-Login (Magic Link) ───────────────────────────────────────
export async function requestLoginLink(email: string): Promise<void> {
  await call("/auth/request", { method: "POST", body: { email } });
}

/** Löst ein einmaliges Login-Token ein. Gibt die E-Mail zurück oder null, wenn ungültig/abgelaufen. */
export async function verifyLoginToken(token: string): Promise<string | null> {
  try {
    const { email } = await call<{ email: string }>("/auth/verify", { method: "POST", body: { token } });
    return email;
  } catch (e) {
    if (e instanceof BackendError && (e.status === 401 || e.status === 422)) return null;
    throw e;
  }
}

/** Live-Stream (SSE) für das Dashboard – wird vom Route-Handler /admin/api/live durchgereicht. */
export function openEventStream(signal: AbortSignal): Promise<Response> {
  return fetch(`${env.backendUrl}/events`, { headers: { "x-taswiq-token": env.backendToken }, cache: "no-store", signal });
}

export { isBackendConfigured };
