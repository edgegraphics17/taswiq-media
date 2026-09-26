import "server-only";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/env";
import { isAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { demoCalcRequests, demoEvents, demoLeads } from "@/lib/admin/demo";
import type { CalculatorRequest, LeadEventRow, LeadRow, LeadStatusEnum } from "@/types/database";

/**
 * Datenschicht des Admin-Dashboards (nur Server Components / Server Actions).
 * Liest mit der Session des eingeloggten Admins → RLS greift zusätzlich zur Middleware.
 * Im lokalen Demo-Modus (ohne Supabase) kommen Beispieldaten.
 */

export async function requireAdmin() {
  if (isDemoMode()) return { email: "demo@taswiq.local", demo: true as const };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) redirect("/admin/login");
  return { email: user.email ?? "", demo: false as const };
}

export interface LeadFilters {
  status?: string;
  tier?: string;
  q?: string;
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
  const supabase = await createClient();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
  if (f.status) query = query.eq("status", f.status as LeadStatusEnum);
  if (f.tier) query = query.eq("tier", f.tier as LeadRow["tier"]);
  if (f.q) {
    const q = f.q.replace(/[%,()]/g, "");
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`);
  }
  const { data, error } = await query;
  if (error) throw new Error(`Leads konnten nicht geladen werden: ${error.message}`);
  return data;
}

export async function getLead(id: string): Promise<{ lead: LeadRow; events: LeadEventRow[] } | null> {
  if (isDemoMode()) {
    const lead = demoLeads.find((l) => l.id === id);
    return lead ? { lead, events: demoEvents(id) } : null;
  }
  const supabase = await createClient();
  const [{ data: lead }, { data: events }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle(),
    supabase.from("lead_events").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
  ]);
  return lead ? { lead, events: events ?? [] } : null;
}

export async function getCalculatorRequests(): Promise<CalculatorRequest[]> {
  if (isDemoMode()) return demoCalcRequests;
  const supabase = await createClient();
  const { data, error } = await supabase.from("calculator_requests").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return data;
}

/** Kennzahlen – aus allen Leads berechnet (klein genug für In-Memory; bei >10k Leads auf SQL-View umstellen). */
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
