# Product Spec — AidBridge AI

> AidBridge AI is a demonstration public-interest technology project. It does not
> replace emergency services, professional judgment, medical advice, legal
> advice, or official disaster response systems. All sample data is fictional.

## Problem

When a storm hits, a food drive spins up, or a heat wave endangers vulnerable
residents, community requests arrive as texts, emails, spreadsheets, and
voicemails. Small teams hand-triage each one, re-key data across tools, and lose
track of who needs what — exactly when speed and accuracy matter most. There is
rarely time to measure whether the triage was even correct.

## Users

- **Case managers** — intake requests, review AI triage, manage cases.
- **Coordinators** — match resources, assign volunteers, run outreach.
- **Admins** — configure org rules, thresholds, providers, and safety settings.
- **Volunteers** — receive assignments and instructions (future self-service).
- **Partner organizations** — update resource availability (future portal).

## Features

- **AI intake & triage** — plain text → structured case (type, urgency, safety
  flags, next steps) as validated JSON.
- **Explainable matching** — deterministic resource and volunteer scoring with
  human-readable reasons; AI adds a short explanation.
- **Multilingual outreach** — SMS/email/WhatsApp drafts in English, Spanish,
  Hindi, Urdu, passed through a safety gate.
- **Reports** — operations, impact, donor, leadership, and shortage reports
  grounded strictly in the data.
- **AI Evaluation Lab** — regression suite scoring JSON validity, schema
  compliance, accuracy, safety, hallucination prevention, and review routing.
- **Advanced**: map view, shortage forecasting, volunteer burnout protection,
  simulation sandbox, AI output diff viewer, partner portal scaffold.
- **Automation**: Python parsers, duplicate detection, report generation.

## User journeys

1. **Intake → resolution**: a case manager pastes a request → AI classifies it →
   high-risk/low-confidence cases route to human review → coordinator matches a
   resource and assigns a volunteer → outreach is generated → the case timeline
   tracks every step and AI output.
2. **Surge planning**: a coordinator runs the simulation sandbox for a "winter
   storm" → sees projected case load, resource shortages, and volunteer demand →
   pre-orders inventory and recruits drivers.
3. **Prompt change safety**: a developer edits a prompt → runs the AI Diff Viewer
   and the eval suite → confirms safety impact and pass-rate before shipping.

## MVP

Intake → AI triage (structured JSON, validated) → cases list & detail →
deterministic matching → volunteer assignment → outreach → reports → AI eval lab
→ demo mode with zero keys. **(Shipped.)**

## Advanced version

Live LLM provider, Supabase Auth + RLS persistence, map/geo, shortage
forecasting on historical data, burnout protection, simulation sandbox, AI diff
viewer, and a partner self-service portal. **(Scaffolded / partially shipped.)**

## Success metrics

- **Operational**: time-to-triage, % cases matched, % completed, review-queue
  latency, resource-shortage lead time.
- **AI quality**: JSON validity, schema pass, classification accuracy, urgency
  accuracy, safety pass, human-review recall, hallucination failure rate,
  outreach quality — all tracked in the AI Evaluation Lab.
- **Safety**: 100% of critical/safety-flagged cases routed to a human; zero
  unsafe outbound messages sent.
