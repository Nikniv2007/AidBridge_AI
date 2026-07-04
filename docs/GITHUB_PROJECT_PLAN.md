# GitHub Project Plan

A ready-to-use plan for running AidBridge AI as a GitHub project: milestones,
labels, and 25 suggested issues.

## Suggested milestones

1. **Product foundation** — app shell, public site, dashboard, mock data.
2. **AI intake system** — prompts, schemas, provider, structured triage.
3. **Resource matching** — deterministic scoring + AI explanation.
4. **Volunteer operations** — assignment scoring, burnout protection.
5. **Automation scripts** — CSV parsers, dedupe, reports, seeding.
6. **AI evaluation lab** — fixtures, runner, metrics, dashboard.
7. **Documentation and handoff** — docs folder, README, deployment guide.
8. **Advanced dashboard features** — map, forecasting, simulation, diff, partners.

## Suggested labels

`ai` · `frontend` · `backend` · `database` · `supabase` · `automation` · `evals`
· `safety` · `documentation` · `bug` · `enhancement` · `good-first-issue` ·
`priority-high` · `public-interest-tech`

## Suggested issues

1. **Build intake form** — Case intake UI posting to the AI intake endpoint with
   validation and result panel. `frontend`
2. **Add Zod schema validation** — Validate every AI output before use; log and
   fall back on failure. `ai` `safety`
3. **Create AI triage prompt** — Versioned intake-classifier prompt with few-shot
   and JSON-only contract. `ai`
4. **Implement resource matching algorithm** — Deterministic 7-factor point
   system with explainable reasons. `backend`
5. **Build AI Evaluation Lab** — Dashboard with fixtures, runner, and eight
   headline metrics. `evals` `frontend`
6. **Add CSV parser** — Shared TS + Python parser handling quotes/escapes and
   dataset detection. `automation`
7. **Add demo seed data** — Deterministic fictional org/users/cases/volunteers/
   resources. `database`
8. **Create volunteer assignment scoring** — 7-factor fit scoring; never exceed
   daily caps. `backend`
9. **Add outreach generator** — Multilingual, safety-gated message generation.
   `ai`
10. **Write safety documentation** — Human-in-the-loop design, triggers, limits.
    `documentation` `safety`
11. **Add prompt versioning** — Stamp prompt versions on outputs and evals. `ai`
12. **Add AI output diff viewer** — Compare two prompt versions with safety
    impact. `ai` `frontend`
13. **Add simulation sandbox** — Generate fictional crisis scenarios through
    triage. `ai` `frontend`
14. **Add automation logs** — Audit view of automation runs. `automation`
    `frontend`
15. **Add resource shortage forecasting** — 7-day shortage estimate per resource
    type. `backend`
16. **Add volunteer burnout warnings** — Daily/weekly workload + reliability
    rules. `safety` `backend`
17. **Add Supabase migrations** — 15-table schema with jsonb columns. `supabase`
    `database`
18. **Add row-level security policies** — Org-scoped RLS on all tables.
    `supabase` `safety`
19. **Add report generation** — Grounded operations/impact/donor reports. `ai`
20. **Add multilingual outreach** — English/Spanish/Hindi/Urdu templates. `ai`
21. **Add partner portal scaffold** — Future self-service resource updates.
    `frontend` `enhancement`
22. **Add dashboard charts** — Dependency-free SVG bar/donut charts. `frontend`
    `good-first-issue`
23. **Add case timeline component** — Audit/timeline on the case detail page.
    `frontend`
24. **Add eval regression suite** — Aggregate all task fixtures; assert pass
    rate. `evals`
25. **Add deployment guide** — Vercel + Supabase deployment steps.
    `documentation`

## How to import

Create the labels above, then open each issue and assign it to a milestone. The
suggested issues map directly to modules already present in the codebase, so they
double as a guided tour for new contributors.
