-- ─────────────────────────────────────────────────────────────────────────────
-- AidBridge AI — Migration 0001: core schema (Part 2)
--
-- Full operational schema matching lib/types + the Part 2 AI layer. Every
-- operational table carries organization_id for multi-tenant Row-Level Security.
-- Apply with: supabase db push   (or psql -f this file)
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── organizations ────────────────────────────────────────────────────────────
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mission text,
  city text,
  state text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ── users (linked to Supabase auth.users) ────────────────────────────────────
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'case_manager',  -- case_manager | coordinator | admin | volunteer
  created_at timestamptz not null default now()
);
create index if not exists users_org_idx on users(organization_id);

-- ── cases ────────────────────────────────────────────────────────────────────
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  requester_name text not null,
  requester_phone text,
  requester_email text,
  original_request text not null,
  case_type text,
  urgency_level text,
  urgency_score int,
  status text not null default 'new',
  city text, state text, zip text,
  people_affected int not null default 1,
  preferred_language text not null default 'English',
  human_review_required boolean not null default false,
  safety_flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cases_org_status_idx on cases(organization_id, status);
create index if not exists cases_urgency_idx on cases(organization_id, urgency_level);

-- ── case_events (append-only audit/timeline) ─────────────────────────────────
create table if not exists case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  event_type text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by text,
  created_at timestamptz not null default now()
);
create index if not exists case_events_case_idx on case_events(case_id);

-- ── resources ────────────────────────────────────────────────────────────────
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  resource_type text not null,
  description text default '',
  city text, state text, zip text,
  available_quantity int not null default 0,
  delivery_available boolean not null default false,
  eligibility_rules jsonb not null default '{}'::jsonb,
  contact_info jsonb not null default '{}'::jsonb,
  hours jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists resources_org_type_idx on resources(organization_id, resource_type);

-- ── volunteers ───────────────────────────────────────────────────────────────
create table if not exists volunteers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text, phone text,
  city text, state text, zip text,
  skills jsonb not null default '[]'::jsonb,
  languages jsonb not null default '["en"]'::jsonb,
  has_vehicle boolean not null default false,
  availability jsonb not null default '[]'::jsonb,
  max_tasks_per_day int not null default 3,
  reliability_score int not null default 70,
  completed_tasks int not null default 0,
  active_assignments int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists volunteers_org_idx on volunteers(organization_id);

-- ── volunteer_assignments ────────────────────────────────────────────────────
create table if not exists volunteer_assignments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  volunteer_id uuid not null references volunteers(id) on delete cascade,
  assignment_status text not null default 'proposed',
  task_description text,
  ai_reason_summary text,
  assignment_score int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── documents ────────────────────────────────────────────────────────────────
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  filename text not null,
  file_type text,
  upload_status text not null default 'uploaded',
  parsed_summary text,
  parsed_records jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ── messages ─────────────────────────────────────────────────────────────────
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id) on delete set null,
  audience text,
  channel text,
  language text,
  subject text,
  body text not null,
  generated_by_ai boolean not null default true,
  sent_status text not null default 'draft',
  created_at timestamptz not null default now()
);

-- ── ai_outputs (every structured AI result) ──────────────────────────────────
create table if not exists ai_outputs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  case_id uuid references cases(id) on delete set null,
  ai_task_type text not null,
  prompt_version text,
  model_used text,
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  validation_passed boolean not null default true,
  confidence_score numeric,
  safety_flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ai_outputs_task_idx on ai_outputs(ai_task_type);

-- ── ai_evaluations ───────────────────────────────────────────────────────────
create table if not exists ai_evaluations (
  id uuid primary key default gen_random_uuid(),
  eval_name text not null,
  ai_task_type text not null,
  input_payload jsonb not null default '{}'::jsonb,
  expected_payload jsonb not null default '{}'::jsonb,
  actual_payload jsonb not null default '{}'::jsonb,
  passed boolean not null default false,
  score numeric not null default 0,
  failure_reason text,
  created_at timestamptz not null default now()
);

-- ── automation_runs ──────────────────────────────────────────────────────────
create table if not exists automation_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  automation_name text not null,
  status text not null,
  records_processed int not null default 0,
  errors jsonb not null default '[]'::jsonb,
  summary text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ── reports ──────────────────────────────────────────────────────────────────
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  report_type text not null,
  title text not null,
  content text not null,
  metrics jsonb not null default '{}'::jsonb,
  generated_by_ai boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── audit_logs ───────────────────────────────────────────────────────────────
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_org_idx on audit_logs(organization_id);
