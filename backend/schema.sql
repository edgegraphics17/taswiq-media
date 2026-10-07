-- ════════════════════════════════════════════════════════════════════
--  TasWiq Media. – Backend-Schema (SQLite, läuft auf dem Sprite "taswiq-media")
--  Tabellen: services · calculator_requests · leads · lead_events · login_tokens
--  Idempotent: wird bei jedem Start von backend/server.mjs ausgeführt.
--  Enum-Werte = IDs in src/config/funnel.ts – bei Änderungen beide Seiten anpassen.
--  JSON-/Array-Spalten liegen als TEXT (JSON); server.mjs wandelt sie in Objekte/Arrays.
-- ════════════════════════════════════════════════════════════════════

create table if not exists services (
  group_id     text not null,
  option_id    text not null,
  label        text not null,
  hint         text,
  preis        integer check (preis is null or preis >= 0),
  mtl          integer check (mtl is null or mtl >= 0),
  dreh         integer not null default 0 check (dreh in (0, 1)),
  is_active    integer not null default 1 check (is_active in (0, 1)),
  sort_order   integer not null default 0,
  created_at   text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at   text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  primary key (group_id, option_id)
);

create table if not exists calculator_requests (
  id                 text primary key,
  created_at         text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  session_id         text,
  industry           text not null check (industry in ('gastro','musik','andere','immobilien','automotive','kanzlei','beauty','handwerk')),
  service_ids        text not null check (json_array_length(service_ids) > 0),
  state              text not null,
  summary            text not null default '[]',
  line_items         text not null default '[]',
  estimate_min       integer not null check (estimate_min >= 0),
  estimate_max       integer not null check (estimate_max >= estimate_min),
  monthly_total      integer not null default 0 check (monthly_total >= 0),
  pricing_version    text not null,
  utm                text not null default '{}',
  referrer           text,
  converted_lead_id  text references leads (id) on delete set null
);
create index if not exists calculator_requests_created_idx on calculator_requests (created_at desc);

create table if not exists leads (
  id                     text primary key,
  created_at             text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at             text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

  name                   text not null check (length(name) between 2 and 120),
  email                  text not null collate nocase,
  phone                  text,
  company                text,
  message                text,

  source                 text not null default 'funnel' check (source in ('funnel','rechner','ki_seite','branchen_seite','blog','portfolio')),
  industry               text not null check (industry in ('gastro','musik','andere','immobilien','automotive','kanzlei','beauty','handwerk')),
  interests              text not null default '[]',
  project_status         text check (project_status is null or project_status in ('neustart','gelegentlich','regelmaessig','projekt','dringend')),
  budget                 text not null check (budget in ('unter_1k','1k_2_5k','2_5k_5k','ueber_5k','keine_angabe','unter_5k','5k_15k','15k_40k','ueber_40k')),
  estimate_min           integer,
  estimate_max           integer,
  monthly_estimate       integer,
  calculator_request_id  text references calculator_requests (id) on delete set null,

  score                  integer not null check (score between 0 and 100),
  score_reasons          text not null default '[]',
  tier                   text not null check (tier in ('starter','growth','premium')),

  status                 text not null default 'neu' check (status in ('neu','kontaktiert','angebot','verhandlung','gewonnen','verloren','archiviert')),
  deal_value             integer check (deal_value is null or deal_value >= 0),
  owner_notes            text,
  next_action_at         text,
  last_contacted_at      text,

  consent_at             text not null,
  source_meta            text not null default '{}',
  automation             text not null default '{}',
  ip_hash                text
);
create index if not exists leads_created_idx on leads (created_at desc);
create index if not exists leads_status_idx  on leads (status);
create index if not exists leads_tier_idx    on leads (tier);
create index if not exists leads_email_idx   on leads (email);

create table if not exists lead_events (
  id           text primary key,
  lead_id      text not null references leads (id) on delete cascade,
  type         text not null check (type in ('created','status_change','note','email_sent','call','automation')),
  from_status  text,
  to_status    text,
  body         text,
  payload      text not null default '{}',
  created_by   text,
  created_at   text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
create index if not exists lead_events_lead_idx on lead_events (lead_id, created_at desc);

-- Magic-Link-Login: nur der SHA-256-Hash des Tokens wird gespeichert, einmalig einlösbar.
create table if not exists login_tokens (
  token_hash  text primary key,
  email       text not null,
  expires_at  text not null,
  used_at     text
);

-- Passwort-Login fürs Dashboard: nur scrypt-Hash + Salt, nie das Passwort selbst.
create table if not exists admin_credentials (
  email          text primary key collate nocase,
  password_hash  text not null,
  salt           text not null,
  updated_at     text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Arbeits-Dashboard: offene Aufgaben auf dem Weg zum Umsatzziel.
-- `key` ist ein optionaler, eindeutiger Slug – damit lassen sich Aufgaben wiederholt einspielen, ohne Dubletten.
create table if not exists tasks (
  id          text primary key,
  key         text unique,
  title       text not null check (length(title) between 3 and 200),
  why         text,
  steps       text,
  category    text not null default 'sonstiges' check (category in ('traffic','seo','geo','angebote','workflows','bugs','risiken','fehlt','vertrieb','sonstiges')),
  priority    integer not null default 2 check (priority in (1, 2, 3)),
  effort      text not null default 'M' check (effort in ('S','M','L')),
  status      text not null default 'offen' check (status in ('offen','in_arbeit','erledigt')),
  source      text not null default 'karim' check (source in ('karim','claude')),
  created_at  text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  done_at     text
  -- executor, run_state, run_input, run_note, run_requested_at: siehe Spalten-Nachtrag in server.mjs
);
create index if not exists tasks_status_idx on tasks (status, priority);

-- Besucherstatistik (eigene Messung, ohne Cookies): ein Eintrag je Seitenaufruf oder Ereignis.
-- `visitor` ist ein täglich wechselnder Hash (kein Wiedererkennen über Tage, keine IP gespeichert).
create table if not exists site_hits (
  id          integer primary key autoincrement,
  created_at  text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  day         text not null,
  type        text not null check (type in ('pageview','event')),
  name        text,
  path        text not null,
  locale      text,
  visitor     text not null,
  session_id  text,
  channel     text not null default 'direkt',
  source      text,
  campaign    text,
  device      text
);
create index if not exists site_hits_day_idx on site_hits (day, type);

-- ─── Team (Command Center) ───
-- Protokoll: Jede Abteilung meldet, was sie tut – daraus entsteht die Live-Ansicht im Dashboard.
create table if not exists agent_events (
  id          integer primary key autoincrement,
  created_at  text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  agent       text not null,
  kind        text not null check (kind in ('start','schritt','fertig','rueckfrage','fehler','vorschlag','uebergabe','planung','info')),
  task_id     text,
  text        text not null
);
create index if not exists agent_events_created_idx on agent_events (created_at desc);

-- Schalter des Teams (team_active, autonomy, max_tasks_per_day) – Standardwerte setzt server.mjs.
create table if not exists settings (
  key    text primary key,
  value  text not null
);
