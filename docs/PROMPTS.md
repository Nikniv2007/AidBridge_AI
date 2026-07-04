# Prompt engineering

All prompts live in [`lib/ai/prompts.ts`](../lib/ai/prompts.ts) and are
**versioned** via `PROMPT_VERSION` (currently `triage-v1.3.0`). Versioning lets
the AI Evaluation Lab attribute regressions to a specific prompt revision.

## Principles

1. **Strict JSON contract.** The triage system prompt specifies the exact schema
   and says "Output ONLY a single valid JSON object." The output is then
   validated with Zod (`lib/ai/schema.ts`); invalid output triggers a demo-mode
   fallback rather than a broken response.
2. **Few-shot for shape stability.** Three compact examples (`TRIAGE_FEW_SHOTS`)
   cover: a routine high-urgency case, a safety-critical emergency, and a
   non-English request. Examples are stored as minified JSON to save tokens.
3. **Safety in the prompt *and* in code.** The prompt instructs the model to
   escalate emergencies; `lib/safety` independently enforces it. Neither alone
   is trusted.
4. **Token discipline.** Tight system prompts, only necessary user fields, and
   structured output (no chain-of-thought in the response) keep costs low.
5. **Conservative defaults.** The model is told to lower confidence and avoid
   inventing facts when the request is vague — this drives the
   `hallucination_prevention` and `human_review_routing` evals.

## The triage contract (summary)

```jsonc
{
  "summary": "string (<=160 chars)",
  "category": "food | shelter | transportation | medical_supplies | hygiene | school_supplies | clothing | utilities | financial_hardship | other",
  "secondaryCategories": ["..."],
  "urgency": "critical | high | moderate | low",
  "urgencyScore": 0,        // 0–100, must match the band
  "neededResources": ["food_pantry", "..."],
  "peopleAffected": 1,
  "safetyFlags": [{ "code": "...", "severity": "info|warning|critical", "message": "...", "recommendedAction": "..." }],
  "humanReviewRequired": false,
  "humanReviewReason": null,
  "confidence": 0.0,        // 0–1
  "suggestedNextSteps": ["..."],
  "detectedLanguage": "en | es | hi | ur"
}
```

Band mapping (also enforced in `scoring/` and `schema.ts`):
`75–100 → critical`, `55–74 → high`, `30–54 → moderate`, `0–29 → low`.

## Outreach prompt

`OUTREACH_SYSTEM_PROMPT` writes a single message for a given
audience/format/tone/language and returns `{ subject, body }`. Rules baked in:
never promise guaranteed aid, never give professional advice, respect
length limits for SMS/WhatsApp, and write natively in the target language.

## Report prompt

`REPORT_SYSTEM_PROMPT` produces `{ title, markdown, highlights }` grounded
strictly in the supplied aggregate stats — the model is told not to fabricate
specifics. Demo mode renders an equivalent grounded report offline.

## Changing a prompt

1. Edit the prompt and **bump `PROMPT_VERSION`**.
2. Run `npm run evals`. Investigate any newly failing eval.
3. If the new behaviour is intended, update the expected values in
   `evals/cases.json` / `lib/data/mock.ts` in the same change.
