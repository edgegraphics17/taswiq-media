import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/env";
import { isAdminEmail } from "@/lib/auth";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { getAnalytics, getLeadWithEvents, listCalculatorRequests, listLeads, listTasks, type LeadFilters } from "@/lib/db";
import { demoAnalytics, demoCalcRequests, demoEvents, demoLeads, demoTasks } from "@/lib/admin/demo";
import type { AnalyticsData, CalculatorRequest, LeadEventRow, LeadRow, TaskRow } from "@/types/database";

/**
 * Datenschicht des Admin-Dashboards (nur Server Components / Server Actions).
 * Liest über die Backend-API; die Berechtigung kommt aus dem signierten Session-Cookie
 * (zusätzlich zur Middleware). Im lokalen Demo-Modus (ohne Backend) kommen Beispieldaten.
 */

export type { LeadFilters };

/** Eingeloggten Admin aus dem Cookie lesen – ohne Redirect (für Server Actions mit eigener Fehlerbehandlung). */
export async function getAdminUser(): Promise<{ email: string } | null> {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  return session && isAdminEmail(session.email) ? session : null;
}

export async function requireAdmin() {
  if (isDemoMode()) return { email: "demo@taswiq.local", demo: true as const };
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return { email: user.email, demo: false as const };
}

export async function getLeads(f: LeadFilters = {}): Promise<LeadRow[]> {
  if (isDemoMode()) {
    return demoLeads.filter(
      (l) =>
        (!f.status || l.status === f.status) &&
        (!f.tier || l.tier === f.tier) &&
        (!f.q || `${l.name} ${l.email} ${l.company ?? ""}`.toLowerCase().includes(f.q.toLowerCase())),
    );
  }
  return listLeads(f);
}

export async function getLead(id: string): Promise<{ lead: LeadRow; events: LeadEventRow[] } | null> {
  if (isDemoMode()) {
    const lead = demoLeads.find((l) => l.id === id);
    return lead ? { lead, events: demoEvents(id) } : null;
  }
  return getLeadWithEvents(id);
}

export async function getCalculatorRequests(): Promise<CalculatorRequest[]> {
  if (isDemoMode()) return demoCalcRequests;
  return listCalculatorRequests();
}

export async function getTasks(): Promise<TaskRow[]> {
  if (isDemoMode()) return demoTasks;
  return listTasks();
}

export async function getAnalyticsData(days: number): Promise<AnalyticsData> {
  if (isDemoMode()) return demoAnalytics(days);
  return getAnalytics(days);
}

/** Gewonnener Auftragswert im laufenden Monat (Zeitpunkt = letzte Änderung des gewonnenen Leads). */
export function wonThisMonth(leads: LeadRow[]) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const won = leads.filter((l) => l.status === "gewonnen" && new Date(l.updated_at) >= start);
  return {
    count: won.length,
    value: won.reduce((s, l) => s + (l.deal_value ?? 0), 0),
    /** neue Anfragen in diesem Monat */
    leads: leads.filter((l) => new Date(l.created_at) >= start).length,
  };
}

/** Kennzahlen – aus allen Leads berechnet (klein genug für In-Memory; bei >10k Leads im Backend aggregieren). */
export function computeKpis(leads: LeadRow[]) {
  const open = leads.filter((l) => ["neu", "kontaktiert", "angebot", "verhandlung"].includes(l.status));
  const won = leads.filter((l) => l.status === "gewonnen");
  const closed = leads.filter((l) => l.status === "gewonnen" || l.status === "verloren");
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  return {
    newThisMonth: leads.filter((l) => new Date(l.created_at) >= monthStart).length,
    openCount: open.length,
    pipelineValue: open.reduce((s, l) => s + (l.estimate_max ?? l.deal_value ?? 0), 0),
    wonValue: won.reduce((s, l) => s + (l.deal_value ?? 0), 0),
    winRate: closed.length ? Math.round((won.length / closed.length) * 100) : null,
    premiumOpen: open.filter((l) => l.tier === "premium").length,
    unanswered: leads.filter((l) => l.status === "neu").length,
  };
}
