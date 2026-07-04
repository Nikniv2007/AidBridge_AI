# Database Schema

Defined in `supabase/migrations/0001_init.sql` (tables) and `0002_rls.sql`
(Row-Level Security). Every operational table carries `organization_id` for
multi-tenant isolation. The app runs on the in-memory demo store
(`lib/data/db.ts`) with the same shapes until Supabase is configured.

## Tables

| Table | Purpose | Key columns |
| --- | --- | --- |
| `organizations` | Tenant | `id`, `name`, `settings` (jsonb) |
| `users` | Staff linked to an org | `organization_id`, `role` |
| `cases` | Community requests + triage | `case_type`, `urgency_level`, `urgency_score`, `status`, `human_review_required`, `safety_flags` (jsonb) |
| `case_events` | Append-only timeline/audit | `case_id`, `event_type`, `metadata` (jsonb) |
| `resources` | Aid resources | `resource_type`, `available_quantity`, `delivery_available`, `eligibility_rules` (jsonb), `active` |
| `volunteers` | Volunteer roster | `skills` (jsonb), `languages` (jsonb), `has_vehicle`, `max_tasks_per_day`, `reliability_score`, `active_assignments` |
| `volunteer_assignments` | Case ↔ volunteer | `case_id`, `volunteer_id`, `assignment_status`, `ai_reason_summary`, `assignment_score` |
| `documents` | Uploaded files | `file_type`, `upload_status`, `parsed_records` (jsonb) |
| `messages` | Outreach | `case_id`, `audience`, `channel`, `language`, `body`, `generated_by_ai` |
| `ai_outputs` | Every structured AI result | `ai_task_type`, `prompt_version`, `model_used`, `input_payload`/`output_payload` (jsonb), `validation_passed`, `confidence_score`, `safety_flags` |
| `ai_evaluations` | Eval results | `eval_name`, `ai_task_type`, `expected_payload`/`actual_payload` (jsonb), `passed`, `score`, `failure_reason` |
| `automation_runs` | Automation audit | `automation_name`, `status`, `records_processed`, `errors` (jsonb) |
| `reports` | Generated reports | `report_type`, `content`, `metrics` (jsonb) |
| `audit_logs` | System audit trail | `user_id`, `action`, `entity_type`, `entity_id`, `metadata` (jsonb) |

## Relationships

```
organizations 1─┬─* users
                ├─* cases ─┬─* case_events
                │          ├─* volunteer_assignments *─1 volunteers
                │          └─* messages
                ├─* resources
                ├─* volunteers
                ├─* documents
                ├─* ai_outputs        (optional case_id)
                ├─* automation_runs
                ├─* reports
                └─* audit_logs        (optional user_id)
ai_evaluations  (global — not org-scoped by default)
```

## Row-Level Security

`0002_rls.sql` enables RLS on all tables and adds org-scoping policies keyed on
`auth_org_id()` (the current auth user's `organization_id`). Child tables such as
`case_events` inherit scope through their parent case. Remaining policies (for
`volunteer_assignments`, `documents`, `messages`, `ai_evaluations`,
`automation_runs`, `audit_logs`, and a Storage bucket for uploads) are marked as
`TODO(supabase)` in the migration.

## Indexes

`cases(organization_id, status)`, `cases(organization_id, urgency_level)`,
`case_events(case_id)`, `resources(organization_id, resource_type)`,
`volunteers(organization_id)`, `ai_outputs(ai_task_type)`,
`audit_logs(organization_id)`.
