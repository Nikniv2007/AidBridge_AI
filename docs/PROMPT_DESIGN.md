# Prompt Design

Prompts live in `lib/ai/prompts/` and are **versioned** (`PROMPT_VERSIONS` in
`shared.ts`) so eval regressions can be attributed to a specific prompt revision.
Every task's prompt is assembled from shared blocks for consistency and token
efficiency.

## Strategy

Each prompt has: a clear **role**, a specific **task**, the shared **safety
block**, the exact **JSON-only output contract**, a **confidence/human-review
block**, and compact **few-shot** examples. Prompts never ask the model to expose
chain-of-thought — they request short `reason_summary`/`summary` fields instead.

## Shared blocks (`lib/ai/prompts/shared.ts`)

- `SAFETY_BLOCK` — never promise aid; no medical/legal/financial advice; never
  discourage emergency services; never invent resources; escalate emergencies to
  human review.
- `JSON_ONLY_BLOCK` — single valid JSON object, no markdown, no prose.
- `CONFIDENCE_BLOCK` — include `confidence_score` 0–1; lower it and set
  `human_review_required` when uncertain; list unknowns in `missing_fields`.

## Few-shot examples

Stored as compact JSON strings (`renderFewShots`) to minimize tokens while
stabilizing output shape. Each task ships 1–3 examples covering the important
cases (e.g. a routine request, a safety-critical emergency, a non-English
request for intake).

## Structured JSON outputs

Every prompt maps 1:1 to a Zod schema in `lib/ai/schemas/`. The contract is
enforced twice: instructed in the prompt, then validated in code by
`runStructuredTask()`. Malformed output is logged, surfaced to the eval lab, and
replaced by the safe demo fallback — never silently accepted.

## Context management

Context builders (`lib/ai/context-builders/`) assemble a layered package:
system safety rules → org rules → user role → case → available
resources/volunteers → prior notes → document summaries → output schema →
prompt version. It is serialized compactly as the user message. Matchers only
ever receive the candidates they may reference, which structurally prevents
hallucinated resources.

## Safety rules

Duplicated in prompts (advisory) and enforced in code (`lib/safety/`). A critical
emergency flag forces `human_review_required=true` regardless of the model, and
`validateSafeOutput` blocks forbidden outbound phrasing (guarantees, diagnoses,
discouraging emergency services).

## Prompt versioning

Versions like `intake-v2.0.0` are stamped onto every `ai_outputs` record and
every eval result. The **AI Diff Viewer** compares two versions' outputs
(field changes, safety impact, schema validity) so prompt changes are reviewable
before they ship. Workflow: edit prompt → bump version → run evals → check the
diff → ship.
