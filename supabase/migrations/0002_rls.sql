-- ─────────────────────────────────────────────────────────────────────────────
-- AidBridge AI — Migration 0002: Row-Level Security
--
-- Enables RLS and adds org-scoping policies. The app runs on mock data until
-- Supabase Auth is wired; enable these before going live so tenants are isolated.
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: the current auth user's organization.
create or replace function auth_org_id() returns uuid
language sql stable as $$
  select organization_id from users where id = auth.uid()
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'organizations','users','cases','case_events','resources','volunteers',
    'volunteer_assignments','documents','messages','ai_outputs',
    'ai_evaluations','automation_runs','reports','audit_logs'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- Org-scoped policies for the primary operational tables.
do $$ begin
  create policy cases_by_org on cases
    using (organization_id = auth_org_id())
    with check (organization_id = auth_org_id());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy resources_by_org on resources
    using (organization_id = auth_org_id())
    with check (organization_id = auth_org_id());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy volunteers_by_org on volunteers
    using (organization_id = auth_org_id())
    with check (organization_id = auth_org_id());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ai_outputs_by_org on ai_outputs
    using (organization_id = auth_org_id())
    with check (organization_id = auth_org_id());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy reports_by_org on reports
    using (organization_id = auth_org_id())
    with check (organization_id = auth_org_id());
exception when duplicate_object then null; end $$;

-- Child tables inherit org scope via their parent case.
do $$ begin
  create policy case_events_by_case on case_events
    using (exists (select 1 from cases c where c.id = case_events.case_id and c.organization_id = auth_org_id()));
exception when duplicate_object then null; end $$;

-- TODO(supabase): add policies for volunteer_assignments, documents, messages,
-- ai_evaluations, automation_runs, audit_logs, and a Storage bucket for uploads.
