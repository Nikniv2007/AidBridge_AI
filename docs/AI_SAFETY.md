# AI Safety

> AidBridge AI is a demonstration public-interest technology project. It does not
> replace emergency services, professional judgment, medical advice, legal
> advice, or official disaster response systems. All sample data is fictional.

Additional commitments:

- The platform **does not guarantee aid**.
- **Human review is required for critical cases.**
- **AI outputs should be reviewed by trained staff.**
- The project is intended as a **technical and public-interest software
  demonstration**.

## Human-in-the-loop design

AI proposes; people decide. High-risk and low-confidence cases are automatically
routed to human review before any action. AidBridge never dispatches aid
autonomously and never auto-assigns a safety-critical case. Routing is
deterministic (`lib/safety/humanReviewRules.ts`), so it cannot be "prompted
away."

## Limitations

- Distance is a ZIP-prefix approximation, not real geocoding.
- Shortage forecasting is a transparent heuristic, not a statistical model.
- Demo mode is rule-based and intentionally conservative; it is not a substitute
  for professional triage.
- The live LLM path is vendor-neutral and untested against any specific model in
  this demo.

## Safety triggers (`lib/safety/emergencyFlags.ts`)

Deterministic detection of: medical emergency, immediate danger (fire, gas leak,
flooding), violence/self-harm, unaccompanied minor, medical needs, housing
instability, legal matters, and sensitive personal data. Any **critical** trigger
forces human review and surfaces emergency guidance (e.g. call 911, or 988 for
mental-health crises in the US).

## What the AI must not do (`lib/safety/safetyRules.ts`)

- Promise or guarantee aid or outcomes.
- Provide medical diagnosis or medical/legal/financial advice.
- Discourage contacting emergency services.
- Invent resources, services, or availability.
- Share unnecessary private data.
- Auto-close critical cases or auto-assign unsafe cases.

`validateSafeOutput()` scans all outbound text (outreach, reports) against
forbidden patterns; a violation blocks the message and substitutes a safe
template.

## Emergency disclaimers

Shown on the public Safety page, in generated messaging, and in the standard
disclaimers attached to safety reviews: AidBridge AI is not monitored in real
time and must never be relied on for emergency response. In an emergency, call
911 (US) or your local emergency number; for mental-health crises in the US, call
or text 988.
