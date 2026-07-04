-- ─────────────────────────────────────────────────────────────────────────────
-- AidBridge AI — PostgreSQL / Supabase schema
--
-- Mirrors the TypeScript domain types in `lib/types/index.ts`. Designed to be
-- Row-Level-Security ready: every operational table carries `org_id` so a
-- single deployment can serve multiple organizations with tenant isolation.
--
-- Apply with: supabase db reset  (or psql -f supabase/schema.sql)
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type case_category as enum (
    'food','shelter','transportation','medical_supplies','hygiene',
    'school_supplies','clothing','utilities','financial_hardship','other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type urgency as enum ('critical','high','moderate','low');
exception when duplicate_object then null; end $$;

do $$ begin
  create type case_status as enum (
    'new','ai_triaged','needs_human_review','matched','volunteer_assigned',
    'contacted','in_progress','completed','unable_to_fulfill','escalated','closed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type resource_type as enum (
    'food_pantry','shelter','transportation','hygiene_kits','school_supplies',
    'clothing','medical_supplies','donation_pickup','partner_org'
  );
exception when duplicate_object then null; end $$;

-- ── Organizations & profiles ─────────────────────────────────────────────────
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  demo_mode boolean not null default true,
  ai_provider text not null default 'demo',
  human_review_urgency_threshold int not null default 85,
  human_review_confidence_threshold numeric not null default 0.6,
  max_volunteer_tasks_per_day int not null default 5,
  resource_shortage_threshold int not null default 5,
  prompt_version text not null default 'triage-v1.3.0',
  created_at timestamptz not null default now()
);

-- Links a Supabase auth user to an org with a role.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  full_name text,
  role text not null default 'coordinator', -- coordinator | admin | volunteer
  created_at timestamptz not null default now()
);

-- ── Resources ────────────────────────────────────────────────────────────────
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  type resource_type not null,
  description text default '',
  city text, state text, zip text,
  quantity_available int not null default 0,
  delivery_available boolean not null default false,
  hours text,
  eligibility_rules text default '',
  contact_name text, contact_phone text, contact_email text,
  notes text,
  created_at timestamptz not null default now()
);

-- ── Volunteers ───────────────────────────────────────────────────────────────
create table if not exists volunteers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text, phone text,
  city text, state text, zip text,
  skills text[] not null default '{}',
  languages text[] not null default '{en}',
  vehicle_access boolean not null default false,
  availability text[] not null default '{}',
  max_tasks_per_day int not null default 3,
  reliability_score int not null default 70,
  background_check text not null default 'not_started',
  completed_tasks int not null default 0,
  active_assignments int not null default 0,
  created_at timestamptz not null default now()
);

-- ── Cases ────────────────────────────────────────────────────────────────────
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  -- intake
  requester_name text not null,
  phone text, email text,
  city text, state text, zip text,
  description text not null,
  people_affected int not null default 1,
  preferred_language text not null default 'en',
  notes text,
  -- triage (structured AI output stored as JSONB for flexibility + queryable columns)
  triage jsonb,
  category case_category,
  urgency urgency,
  urgency_score int,
  human_review_required boolean not null default false,
  confidence numeric,
  -- workflow
  status case_status not null default 'new',
  assigned_volunteer_id uuid references volunteers(id) on delete set null,
  matched_resource_id uuid references resources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cases_org_status_idx on cases(org_id, status);
create index if not exists cases_urgency_idx on cases(org_id, urgency);

-- Timeline / audit log (append-only)
create table if not exists case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  at timestamptz not null default now(),
  actor text not null,
  type text not null,
  message text not null
);

create table if not exists case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  author text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- ── Automation runs ──────────────────────────────────────────────────────────
create table if not exists automation_runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  status text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  records_processed int not null default 0,
  errors int not null default 0,
  summary text
);

-- ── AI eval results ──────────────────────────────────────────────────────────
create table if not exists eval_results (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  eval_id text not null,
  category text not null,
  name text not null,
  input text not null,
  expected jsonb,
  actual jsonb,
  pass boolean not null,
  score numeric not null,
  failure_reason text,
  prompt_version text,
  timestamp timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security (enable + org-scoping policies)
-- The app currently runs on mock data; enable these when Supabase Auth is wired.
-- ─────────────────────────────────────────────────────────────────────────────
alter table organizations   enable row level security;
alter table profiles        enable row level security;
alter table resources       enable row level security;
alter table volunteers      enable row level security;
alter table cases           enable row level security;
alter table case_events     enable row level security;
alter table case_notes      enable row level security;
alter table automation_runs enable row level security;
alter table eval_results    enable row level security;

-- Helper: current user's org.
create or replace function auth_org_id() returns uuid
language sql stable as $$
  select org_id from profiles where id = auth.uid()
$$;

-- Example org-scoping policies (repeat pattern per table).
do $$ begin
  create policy cases_by_org on cases
    using (org_id = auth_org_id())
    with check (org_id = auth_org_id());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy resources_by_org on resources
    using (org_id = auth_org_id())
    with check (org_id = auth_org_id());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy volunteers_by_org on volunteers
    using (org_id = auth_org_id())
    with check (org_id = auth_org_id());
exception when duplicate_object then null; end $$;

-- TODO(supabase): add matching policies for case_events, case_notes,
-- automation_runs, eval_results, and a Supabase Storage bucket + policy for
-- document uploads.
