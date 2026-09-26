-- ════════════════════════════════════════════════════════════════════
--  TasWiq Media. – Initiales Schema
--  Tabellen: services · calculator_requests · leads · lead_events
--  Ausführen: supabase db push   (oder im SQL-Editor des Dashboards)
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ─── Enums ──────────────────────────────────────────────────────────
-- Werte = IDs in src/config/funnel.ts – bei Änderungen beide Seiten anpassen.
create type public.industry        as enum ('gastro', 'musik', 'andere');
create type public.project_status  as enum ('neustart', 'gelegentlich', 'regelmaessig', 'projekt', 'dringend');
create type public.budget_bracket  as enum ('unter_1k', '1k_2_5k', '2_5k_5k', 'ueber_5k', 'keine_angabe');
create type public.lead_tier       as enum ('starter', 'growth', 'premium');
create type public.lead_source     as enum ('funnel', 'rechner', 'ki_seite', 'branchen_seite');
-- Kunden-Status / Pipeline
create type public.lead_status     as enum ('neu', 'kontaktiert', 'angebot', 'verhandlung', 'gewonnen', 'verloren', 'archiviert');
create type public.lead_event_type as enum ('created', 'status_change', 'note', 'email_sent', 'call', 'automation');

-- ─── Helfer ─────────────────────────────────────────────────────────
-- Admin = app_metadata.role = 'admin' (nur per Service-Key/SQL setzbar, nicht vom Nutzer)
create or replace function public.is_admin()
returns boolean
language sql stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ════════════════════════════════════════════════════════════════════
--  services – Preis-Matrix des Rechners (überschreibt src/config/pricing.ts)
--  Eine Zeile = eine Option einer Gruppe, z. B. ('videoUmfang', 'standard').
-- ════════════════════════════════════════════════════════════════════
create table public.services (
  group_id     text not null,              -- "quelle" in pricing.ts, z. B. videoUmfang
  option_id    text not null,              -- z. B. standard
  label        text not null,
  hint         text,
  preis        integer check (preis is null or preis >= 0),   -- einmalig in €
  mtl          integer check (mtl is null or mtl >= 0),       -- monatlich in €
  dreh         boolean not null default false,                -- Festival-Faktor greift
  is_active    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (group_id, option_id)
);
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════
--  calculator_requests – jede abgeschlossene Kalkulation im Rechner
-- ════════════════════════════════════════════════════════════════════
create table public.calculator_requests (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  session_id         text,
  industry           public.industry not null,
  service_ids        text[] not null check (cardinality(service_ids) > 0),
  state              jsonb not null,               -- komplette Rechner-Auswahl
  summary            jsonb not null default '[]',  -- lesbare Auswahl [{label, wert}]
  line_items         jsonb not null default '[]',  -- Posten einmalig + monatlich
  estimate_min       integer not null check (estimate_min >= 0),
  estimate_max       integer not null check (estimate_max >= estimate_min),
  monthly_total      integer not null default 0 check (monthly_total >= 0),
  pricing_version    text not null,
  utm                jsonb not null default '{}',
  referrer           text,
  converted_lead_id  uuid                          -- FK unten, nach leads
);
create index calculator_requests_created_idx on public.calculator_requests (created_at desc);

-- ════════════════════════════════════════════════════════════════════
--  leads – Funnel-, Rechner- und Unterseiten-Anfragen + Kunden-Status
-- ════════════════════════════════════════════════════════════════════
create table public.leads (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  -- Kontakt
  name                   text not null check (char_length(name) between 2 and 120),
  email                  citext not null,
  phone                  text,
  company                text,
  message                text,

  -- Qualifizierung (Funnel)
  source                 public.lead_source not null default 'funnel',
  industry               public.industry not null,
  interests              text[] not null default '{}',
  project_status         public.project_status,          -- null bei Rechner-Leads
  budget                 public.budget_bracket not null,
  estimate_min           integer,
  estimate_max           integer,
  monthly_estimate       integer,
  calculator_request_id  uuid references public.calculator_requests (id) on delete set null,

  -- Scoring (serverseitig berechnet, siehe src/lib/lead-scoring.ts)
  score                  smallint not null check (score between 0 and 100),
  score_reasons          text[] not null default '{}',
  tier                   public.lead_tier not null,

  -- Pipeline / Kunden-Status
  status                 public.lead_status not null default 'neu',
  deal_value             integer check (deal_value is null or deal_value >= 0),
  owner_notes            text,
  next_action_at         timestamptz,
  last_contacted_at      timestamptz,

  -- Tracking & Automatisierung
  consent_at             timestamptz not null,
  source_meta            jsonb not null default '{}',   -- UTM, Referrer, Landingpage, User-Agent
  automation             jsonb not null default '{}',   -- von n8n: notified_at, welcome_sent_at, …
  ip_hash                text
);
create index leads_created_idx on public.leads (created_at desc);
create index leads_status_idx  on public.leads (status);
create index leads_tier_idx    on public.leads (tier);
create index leads_email_idx   on public.leads (email);
create trigger leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.calculator_requests
  add constraint calculator_requests_converted_lead_fk
  foreign key (converted_lead_id) references public.leads (id) on delete set null;

-- ════════════════════════════════════════════════════════════════════
--  lead_events – Verlauf pro Lead (Status-Wechsel, Notizen, Automationen)
-- ════════════════════════════════════════════════════════════════════
create table public.lead_events (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid not null references public.leads (id) on delete cascade,
  type         public.lead_event_type not null,
  from_status  public.lead_status,
  to_status    public.lead_status,
  body         text,
  payload      jsonb not null default '{}',
  created_by   uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now()
);
create index lead_events_lead_idx on public.lead_events (lead_id, created_at desc);

-- Status-Wechsel automatisch protokollieren (egal ob Dashboard, n8n oder SQL)
create or replace function public.log_lead_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.lead_events (lead_id, type, to_status, payload)
    values (new.id, 'created', new.status, jsonb_build_object('tier', new.tier, 'score', new.score, 'source', new.source));
  elsif new.status is distinct from old.status then
    insert into public.lead_events (lead_id, type, from_status, to_status, created_by)
    values (new.id, 'status_change', old.status, new.status, auth.uid());
    if new.status = 'kontaktiert' and new.last_contacted_at is null then
      new.last_contacted_at := now();
    end if;
  end if;
  return new;
end;
$$;
create trigger leads_status_log_insert after insert on public.leads
  for each row execute function public.log_lead_status_change();
create trigger leads_status_log_update before update of status on public.leads
  for each row execute function public.log_lead_status_change();

-- ─── Views ──────────────────────────────────────────────────────────
create view public.lead_pipeline_summary
with (security_invoker = on) as
select
  status,
  count(*)::int                        as lead_count,
  coalesce(sum(estimate_max), 0)::int  as estimate_max_sum,
  coalesce(sum(deal_value), 0)::int    as deal_value_sum
from public.leads
group by status;

-- ════════════════════════════════════════════════════════════════════
--  Row Level Security
--  Website schreibt ausschließlich über die API-Routen mit Service-Key
--  (umgeht RLS). Anonyme Clients dürfen nur aktive Preise lesen.
-- ════════════════════════════════════════════════════════════════════
alter table public.services            enable row level security;
alter table public.calculator_requests enable row level security;
alter table public.leads               enable row level security;
alter table public.lead_events         enable row level security;

create policy "Preise sind öffentlich lesbar"
  on public.services for select
  using (is_active or public.is_admin());
create policy "Admins verwalten Preise"
  on public.services for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins lesen Kalkulationen"
  on public.calculator_requests for select
  using (public.is_admin());

create policy "Admins verwalten Leads"
  on public.leads for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins lesen Verlauf"
  on public.lead_events for select
  using (public.is_admin());
create policy "Admins schreiben Notizen"
  on public.lead_events for insert
  with check (public.is_admin() and created_by = auth.uid());

-- Live-Updates im Admin-Dashboard
alter publication supabase_realtime add table public.leads;
