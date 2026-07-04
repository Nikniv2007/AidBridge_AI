# Architecture

AidBridge AI is a Next.js 14 (App Router) application with a clean separation
between **presentation** (`app/`, `components/`), **domain logic** (`lib/`), and
an **automation layer** (`scripts/`). The design goal: every AI decision is
structured, validated, explainable, and reversible by a human.

## Layered overview

```
┌─────────────────────────────────────────────────────────────┐
│ app/ (routes)   marketing pages · dashboard pages · API routes │
├─────────────────────────────────────────────────────────────┤
│ components/     ui primitives · layout · charts · AI panels    │
├─────────────────────────────────────────────────────────────┤
│ lib/  ai/ (prompts, schema, demo, provider, evals)             │
│       matching/  scoring/  safety/   ← deterministic cores     │
│       automation/ (csv)   data/ (mock + metrics)   utils/      │
│       supabase/ (adapter scaffolding)   types/                 │
├─────────────────────────────────────────────────────────────┤
│ scripts/ (Python)   parsers · dedup · reports · validation     │
│ supabase/schema.sql   evals/   tests/                          │
└─────────────────────────────────────────────────────────────┘
```

## Data flow: request → coordinated response

```
Intake form / CSV / API
        │
        ▼
runTriage()  ──►  provider dispatcher (demo | live LLM endpoint)
        │                │
        │                ▼
        │         Zod schema validation  ── invalid ──► fallback to demo
        ▼
TriageOutput (category, urgency 0–100, safetyFlags, humanReviewRequired, …)
        │
        ├──► scoring/  (deterministic urgency 0–100 + band)
        ├──► safety/   (rule-based flags; forces human review on critical)
        │
        ▼
Case created (status: ai_triaged | needs_human_review)
        │
        ├──► matching/  matchResources()   → ranked, explained matches
        ├──► matching/  matchVolunteers()  → ranked, explained candidates
        ├──► ai/        runOutreach()      → localized message drafts
        │
        ▼
Timeline + audit log  ──►  Reports  ──►  AI Evaluation Lab
```

## Key design decisions

### 1. Demo mode is a first-class citizen
`lib/ai/demo.ts` produces schema-valid `TriageOutput` deterministically using the
same `scoring/` and `safety/` cores the live path validates against. This means:
- The app is fully usable with **no API keys**.
- Demo output is **deterministic**, so it doubles as prompt-regression fixtures.
- The live path can always **fall back** to demo without breaking the UX.

### 2. Safety is enforced in code, not just prompts
`lib/safety/index.ts` is a rule-based engine. Even if a model is jailbroken or
returns a wrong answer, a **critical** flag deterministically forces
`humanReviewRequired`. Prompts *also* instruct the model on safety — defense in
depth.

### 3. Structured output is contract-enforced
`lib/ai/schema.ts` (Zod) validates every AI output before anything downstream
trusts it, plus cross-field consistency checks (`urgency` ↔ `urgencyScore`,
critical-flag ↔ human-review). The same schema powers the eval categories
`json_validity` and `schema_compliance`.

### 4. Matching is explainable
`lib/matching/index.ts` returns human-readable `reasons` and `concerns` for every
recommendation. Coordinators see *why* and can override. No opaque ranking.

### 5. Mock store isolates the UI from the database
`lib/data/mock.ts` is the single data source today. Because the UI consumes
typed getters and API routes, swapping in Supabase adapters (`lib/supabase/`)
requires no UI changes.

## Provider resolution

`resolveProvider()` in `lib/ai/provider.ts`:

1. If `AI_DEMO_MODE=true` → **demo** (default).
2. Else if `AI_PROVIDER=live` and `LLM_API_URL` + `LLM_API_KEY` set → **live**.
3. Else → **demo** fallback.

Every output carries `meta` (`provider`, `model`, `promptVersion`, `demoMode`,
`latencyMs`) for auditability and eval attribution.

## Token & context management

- System prompts are kept tight; only necessary fields are passed to the model.
- Few-shot examples are compact JSON strings (`lib/ai/prompts.ts`).
- Structured JSON output avoids re-prompting: validation happens client-side of
  the model boundary, and invalid output falls back rather than looping.
- `promptVersion` lets eval regressions be attributed to a specific prompt rev.
