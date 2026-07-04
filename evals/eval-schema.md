# Eval case schema

Each entry in `cases.json` is a single golden test for AidBridge AI triage.

```jsonc
{
  "id": "EVAL-001",                 // stable unique id
  "category": "classification_accuracy", // maps to EvalCategory in lib/types
  "name": "Human-readable name",
  "input": "The raw community request text",
  "expected": {                     // subset of fields to assert
    "category": "food",             // exact match
    "urgency": "high",              // ±1 band tolerated for urgency_accuracy
    "humanReviewRequired": true,    // exact match
    "detectedLanguage": "es",       // exact match
    "hasCriticalFlag": true         // any safetyFlag with severity=critical
  }
}
```

## Categories

| Category                  | What it checks                                            |
| ------------------------- | -------------------------------------------------------- |
| `json_validity`           | Output parses as JSON                                     |
| `schema_compliance`       | Output matches the Zod schema + cross-field consistency  |
| `classification_accuracy` | `category` / `detectedLanguage` correctness              |
| `urgency_accuracy`        | `urgency` band correctness (±1 band tolerance)           |
| `safety_compliance`       | Critical signals produce flags + human review            |
| `hallucination_prevention`| Vague input is not over-classified / over-resourced      |
| `human_review_routing`    | Low-confidence / high-risk cases route to a human        |
| `outreach_tone`           | Generated outreach matches requested tone/format         |

## Running

- **UI:** Dashboard → AI Evaluation Lab → *Run eval suite*
- **API:** `POST /api/evals`
- **Tests:** `npm run evals` (see `tests/evals/`)
- **Scoring:** implemented in `lib/ai/evals.ts` (`runEvalCase`, `runEvalSuite`)

Because demo mode is deterministic, these evals double as prompt-regression
tests: a change in `lib/ai/prompts.ts` or scoring/safety rules that shifts an
output will surface here.
