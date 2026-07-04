# AI evaluations

AidBridge AI treats AI output as something to **measure**, not trust blindly.
The eval harness scores triage output across eight categories and runs from the
UI, the API, and the test suite — all sharing the same scoring code in
[`lib/ai/evals.ts`](../lib/ai/evals.ts).

## Categories

| Category                   | Question it answers                                   |
| -------------------------- | ----------------------------------------------------- |
| `json_validity`            | Does the output parse as JSON?                        |
| `schema_compliance`        | Does it match the Zod schema + cross-field rules?     |
| `classification_accuracy`  | Is `category` / `detectedLanguage` correct?           |
| `urgency_accuracy`         | Is the `urgency` band correct? (±1 band tolerated)    |
| `safety_compliance`        | Do critical signals produce flags + human review?     |
| `hallucination_prevention` | Is vague input *not* over-classified?                 |
| `human_review_routing`     | Are risky/low-confidence cases sent to a human?       |
| `outreach_tone`            | Does outreach match the requested tone/format? (planned) |

## How scoring works (`runEvalCase`)

1. **Structural checks first** — parse with Zod, run cross-field consistency
   (`triageConsistencyIssues`). Failures here are fatal for
   `schema_compliance` / `safety_compliance`.
2. **Field expectations** — each eval's `expected` object is compared against the
   actual output. `urgency` gets a ±1-band tolerance in `urgency_accuracy`;
   everything else is exact.
3. **Score** — `1.0` for a clean pass, degraded toward `0` for each mismatch,
   with a boolean `pass` and a human-readable `failureReason`.

## Running the suite

```bash
# From the test suite (CI-friendly, deterministic in demo mode)
npm run evals

# From the API
curl -X POST http://localhost:3000/api/evals

# From the UI
# Dashboard → AI Evaluation Lab → "Run eval suite"
```

## Why demo mode makes evals deterministic

In demo mode the triage output is a pure function of the input, so the eval
suite is a **prompt/logic regression test**: any change to prompts, scoring, or
safety rules that shifts an output surfaces immediately. In live mode the same
suite measures the model's real behaviour against the golden expectations.

## Adding an eval

1. Add a case to [`evals/cases.json`](../evals/cases.json) **and**
   `lib/data/mock.ts` (`evalCases`) — the UI reads the latter.
2. Pick the right `category` and a minimal `expected` object.
3. Run `npm run evals` to confirm it behaves as intended.

## Golden cases (current)

`EVAL-001` food+delivery · `EVAL-002` gas-leak critical · `EVAL-003` self-harm
routing · `EVAL-004` vague→human · `EVAL-005` Spanish clothing · `EVAL-006`
no-hallucination · `EVAL-007` school-supplies moderate · `EVAL-008` medical
emergency.
