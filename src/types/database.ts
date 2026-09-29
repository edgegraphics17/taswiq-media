/**
 * Typen für das Backend-Schema (backend/schema.sql, API in backend/server.mjs).
 * Bei Schema-Änderungen hier von Hand nachziehen – die API liefert JSON-Spalten bereits als Objekte/Arrays.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Industry = "gastro" | "immobilien" | "automotive" | "kanzlei" | "beauty" | "handwerk" | "musik" | "andere";
type ProjectStatus = "neustart" | "gelegentlich" | "regelmaessig" | "projekt" | "dringend";
type BudgetBracket = "unter_5k" | "5k_15k" | "15k_40k" | "ueber_40k" | "keine_angabe" | "unter_1k" | "1k_2_5k" | "2_5k_5k" | "ueber_5k";
type LeadTier = "starter" | "growth" | "premium";
type LeadSource = "funnel" | "rechner" | "ki_seite" | "branchen_seite" | "blog" | "portfolio";
type LeadStatus = "neu" | "kontaktiert" | "angebot" | "verhandlung" | "gewonnen" | "verloren" | "archiviert";
type LeadEventType = "created" | "status_change" | "note" | "email_sent" | "call" | "automation";

type ServiceRow = {
  group_id: string;
  option_id: string;
  label: string;
  hint: string | null;
  preis: number | null;
  mtl: number | null;
  dreh: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type CalculatorRequestRow = {
  id: string;
  created_at: string;
  session_id: string | null;
  industry: Industry;
  service_ids: string[];
  state: Json;
  summary: Json;
  line_items: Json;
  estimate_min: number;
  estimate_max: number;
  monthly_total: number;
  pricing_version: string;
  utm: Json;
  referrer: string | null;
  converted_lead_id: string | null;
};

type LeadRowT = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  source: LeadSource;
  industry: Industry;
  interests: string[];
  project_status: ProjectStatus | null;
  budget: BudgetBracket;
  estimate_min: number | null;
  estimate_max: number | null;
  monthly_estimate: number | null;
  calculator_request_id: string | null;
  score: number;
  score_reasons: string[];
  tier: LeadTier;
  status: LeadStatus;
  deal_value: number | null;
  owner_notes: string | null;
  next_action_at: string | null;
  last_contacted_at: string | null;
  consent_at: string;
  source_meta: Json;
  automation: Json;
  ip_hash: string | null;
};

type LeadEventRowT = {
  id: string;
  lead_id: string;
  type: LeadEventType;
  from_status: LeadStatus | null;
  to_status: LeadStatus | null;
  body: string | null;
  payload: Json;
  created_by: string | null;
  created_at: string;
};

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type LeadInsert = Optional<
  LeadRowT,
  | "id"
  | "created_at"
  | "updated_at"
  | "phone"
  | "company"
  | "message"
  | "source"
  | "interests"
  | "project_status"
  | "estimate_min"
  | "estimate_max"
  | "monthly_estimate"
  | "calculator_request_id"
  | "score_reasons"
  | "status"
  | "deal_value"
  | "owner_notes"
  | "next_action_at"
  | "last_contacted_at"
  | "source_meta"
  | "automation"
  | "ip_hash"
>;
export type CalculatorRequestInsert = Optional<
  CalculatorRequestRow,
  "id" | "created_at" | "session_id" | "summary" | "line_items" | "monthly_total" | "utm" | "referrer" | "converted_lead_id"
>;
export type ServiceUpsert = Pick<ServiceRow, "group_id" | "option_id" | "label" | "preis" | "mtl" | "is_active">;
export type ServiceRowType = ServiceRow;

export type LeadRow = LeadRowT;
export type LeadEventRow = LeadEventRowT;
export type CalculatorRequest = CalculatorRequestRow;
export type LeadStatusEnum = LeadStatus;
export const LEAD_STATUSES: LeadStatus[] = ["neu", "kontaktiert", "angebot", "verhandlung", "gewonnen", "verloren", "archiviert"];
