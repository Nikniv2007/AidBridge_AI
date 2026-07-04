# Architecture

AidBridge AI is a Next.js 14 (App Router) application split into presentation
(`app/`, `components/`), domain logic (`lib/`), automation (`scripts/`), and data
(`supabase/`, in-memory demo store). Design goal: every AI decision is
structured, validated, explainable, safety-gated, and reversible by a human.

```
┌──────────────────────────────────────────────────────────────────────┐
│ app/         marketing pages · dashboard (19 pages) · API routes        │
├──────────────────────────────────────────────────────────────────────┤
│ components/  ui primitives · layout · charts · ai panels · cases        │
├──────────────────────────────────────────────────────────────────────┤
│ lib/ai/      schemas (Zod) · prompts · context-builders · providers     │
│              8 task modules · evalRunner · evalMetrics · diff            │
│ lib/matching/ deterministic resource + volunteer scoring                │
│ lib/safety/  emergency flags · human-review rules · output gate         │
│ lib/forecasting/ · lib/volunteers/ (burnout) · lib/simulation/          │
│ lib/data/    demo DB · metrics · AI output log                          │
│ lib/supabase/ adapter scaffolding                                       │
├──────────────────────────────────────────────────────────────────────┤
│ scripts/ (Python)  parsers · dedupe · reports · validation · seeding    │
│ supabase/migrations/  15 tables + RLS      evals/  fixtures + suite      │
│ tests/  Vitest (unit · schema · safety · scoring · evals)               │
└──────────────────────────────────────────────────────────────────────┘
```

## Frontend

Next.js App Router + React 18 + TypeScript + Tailwind. shadcn-style component
library (`components/ui`), dependency-free SVG charts (`components/charts`),
theme-aware light/dark, responsive layout, and dedicated empty/loading/error
states. Client components call API routes; server components read the demo store
directly.

## Backend

Next.js API routes (`app/api/*`) with Zod-validated request bodies. Every AI
route delegates to a `lib/ai` task module. Routes never throw to the client —
they return typed JSON errors and the AI path always has a safe fallback.

## AI layer

See [AI_LAYER.md](AI_LAYER.md) and [PROMPT_DESIGN.md](PROMPT_DESIGN.md). Eight
structured tasks run through a single `runStructuredTask()` entry point:
resolve provider → run demo or live → validate with Zod → fall back safely → log.
Vendor-neutral: the live path targets any chat-completions-compatible endpoint
via `LLM_API_URL/KEY/MODEL`; demo mode is the default and needs no keys.

## Supabase

`supabase/migrations/0001_init.sql` defines 15 tables (jsonb-rich, org-scoped);
`0002_rls.sql` enables Row-Level Security with org-scoping policies. The app runs
on the in-memory demo store (`lib/data/db.ts`) until Supabase is configured; the
adapter surface is stubbed in `lib/supabase/`. See
[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

## Automation scripts

`scripts/*.py` (standard-library only) parse intake/roster/inventory CSVs, detect
duplicate cases, generate daily reports, validate AI output JSON, and seed
fictional demo data. See [WORKFLOW_AUTOMATION.md](WORKFLOW_AUTOMATION.md).

## Evaluation system

`evals/*.eval.ts` hold fixtures per task; `evals/regression-suite.eval.ts`
aggregates them. `lib/ai/evalRunner.ts` dispatches each fixture to the right task,
scores it, and `lib/ai/evalMetrics.ts` computes the eight headline rates surfaced
in the AI Evaluation Lab and `POST /api/evals`. See [EVALS.md](EVALS.md).
