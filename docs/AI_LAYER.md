# AI layer (Part 2)

AidBridge AI's Part 2 AI layer is a set of eight structured, schema-validated
tasks built on a vendor-neutral provider, deterministic cores, and layered
context. Every output is JSON-only, validated with Zod, safety-gated, and logged.

## Modules (`lib/ai/`)

| Module | Task | Output schema |
| --- | --- | --- |
| `intakeClassifier.ts` | Raw request → structured case | `intake.schema` |
| `urgencyScorer.ts` | 0–100 urgency + breakdown | `urgency.schema` |
| `safetyReview.ts` | Risk detection + review decision | `safety.schema` |
| `resourceMatcher.ts` | Best resource + backups + reasons | `resource-match.schema` |
| `volunteerAssignment.ts` | Best volunteer + backups + risks | `volunteer-assignment.schema` |
| `outreachGenerator.ts` | Localized, safety-gated message | `outreach.schema` |
| `reportWriter.ts` | Grounded Markdown report | `report.schema` |
| `outputReviewer.ts` | Meta-audit of another AI output | `eval.schema` |

All outputs use **snake_case** JSON contracts (see each prompt in
`lib/ai/prompts/`).

## Provider system (`lib/ai/providers/`)

- `aiProvider.ts` — `runStructuredTask()`: the single entry point. Resolves
  provider, runs demo or live, validates with Zod, falls back safely, and logs.
- `demoProvider.ts` — deterministic helpers; the demo path makes the app fully
  usable with **no API keys**.
- `liveProvider.ts` — **vendor-neutral** live call to any chat-completions-
  compatible endpoint (`LLM_API_URL` / `LLM_API_KEY` / `LLM_MODEL`). No vendor is
  named or assumed.

Resolution: `AI_DEMO_MODE=true` → demo (default). Else `AI_PROVIDER=live` with a
configured endpoint → live. Else → demo fallback. A live failure or invalid JSON
always falls back to the deterministic demo output and records it in `meta`.

## Structured output guarantees

1. Model returns JSON only (enforced in prompts).
2. `runStructuredTask` parses + validates with the Zod schema
   (`lib/ai/schemas/`).
3. On validation failure: log it, surface it to the AI Evaluation Lab, and
   replace it with the **safe demo fallback** — malformed output is never
   silently accepted.
4. Every result is written to the AI output log (`lib/data/aiLog.ts`), mirroring
   the `ai_outputs` table.

## Context management (`lib/ai/context-builders/`)

Each task receives a layered context package: system safety rules → org rules →
user role → case data → available resources/volunteers → prior notes → document
summaries → output schema → prompt version. Context is serialized compactly to
keep token usage low, and matchers only ever see the candidates they're allowed
to reference (anti-hallucination).

## Safety (`lib/safety/`)

- `emergencyFlags.ts` — deterministic emergency/vulnerability detection.
- `safetyRules.ts` — the non-negotiable rules + forbidden output patterns.
- `humanReviewRules.ts` — deterministic human-review routing.
- `validateSafeOutput.ts` — outbound text gate for outreach/reports.

Safety is enforced in code, not just prompts: a critical flag forces human
review regardless of what a model returns, and unsafe outbound text is blocked
and replaced with a safe template.

## Deterministic matching (`lib/matching/`)

Explicit point systems (documented in each file): resources score across type
(30), availability (20), delivery (15), distance (10), eligibility (10), urgency
(10), quantity (5); volunteers across availability (25), skills (20), location
(15), vehicle (15), language (10), workload (10), reliability (5). AI adds a
short explanation on top — the app never depends solely on the model.
