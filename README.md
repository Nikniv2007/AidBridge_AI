<div align="center">

# 🤝 AidBridge AI

### Community Crisis & Resource Operations System

**Turn messy community needs into structured, actionable, human-supervised aid workflows.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/tests-42%20passing-brightgreen)](tests/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
<!-- badge placeholders: build status, coverage, deploy -->

</div>

> _Screenshots placeholder — add captures of the Command Center, AI Evaluation Lab, Simulation Sandbox, and a case detail page here._

---

## Short description

AidBridge AI is an AI-powered crisis and community resource coordination
platform. It triages requests, matches people with resources, assigns
volunteers, parses documents, generates outreach, tracks cases, and includes AI
evaluation tools for safer structured outputs.

## Long description

Built for nonprofits, schools, city teams, and volunteer organizations, AidBridge
AI is an **AI operations system, not a chatbot**. A single plain-language request
becomes a structured, trackable case: the AI proposes a classification, urgency
score, safety flags, and matches — but **a human always approves high-risk and
low-confidence decisions**, every AI output is **validated against a Zod schema**
and **logged**, and a built-in **evaluation lab** continuously measures quality.
The whole app runs with **zero API keys** thanks to a deterministic demo engine.

## Problem statement

When a storm hits or a food drive spins up, requests pour in as texts, emails,
spreadsheets, and voicemails. Small teams hand-triage each one, re-key data
across tools, and lose track of who needs what — exactly when speed and accuracy
matter most, and with no way to measure whether the triage was correct.

---

## ✨ Features

- 🧠 **AI intake & triage** — plain text → structured case (type, urgency 0–100,
  safety flags, vulnerable-population flags, next steps) as validated JSON.
- 🧩 **Explainable matching** — deterministic resource & volunteer scoring with
  human-readable reasons; AI adds a short explanation.
- 🧑‍🤝‍🧑 **Volunteer operations** — fit scoring, workload caps, and burnout
  protection.
- 💬 **Multilingual outreach** — SMS/email/WhatsApp in English, Spanish, Hindi,
  Urdu, through an outbound safety gate.
- 📊 **Reports** — operations, impact, donor, leadership, and shortage reports.
- 🧪 **AI Evaluation Lab** — regression suite + eight headline metrics.
- 🗺️ **Advanced**: map view, shortage forecasting, simulation sandbox, AI output
  diff viewer, partner-portal scaffold.
- ⚙️ **Automation** — Python parsers, duplicate detection, report generation.
- 🛟 **Demo mode** — fully usable with **no keys**; automatic live-fallback.

## 🧠 AI modules (`lib/ai/`)

Intake classifier · urgency scorer · safety review · resource matcher · volunteer
assignment · outreach generator · report writer · AI output reviewer — each
JSON-only, Zod-validated, versioned, safety-gated, and logged. See
[docs/AI_LAYER.md](docs/AI_LAYER.md) and [docs/PROMPT_DESIGN.md](docs/PROMPT_DESIGN.md).

## 🧱 Tech stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind,
  shadcn-style components, lucide-react, dependency-free SVG charts, dark/light.
- **Backend:** Next.js API routes / server components, Zod validation.
- **Data:** Supabase-ready PostgreSQL schema + migrations with RLS; runs on a
  rich in-memory demo store out of the box (all data fictional).
- **AI:** vendor-neutral provider dispatcher (configurable live endpoint /
  deterministic demo), versioned prompts, few-shot, structured output, evals.
- **Automation:** Python (stdlib-only) scripts.
- **Testing:** Vitest — 42 passing tests.

## 🏗️ Architecture overview

`app/` (pages + API) → `components/` (UI) → `lib/` (AI schemas/prompts/providers/
tasks, matching, safety, forecasting, simulation, data) → `scripts/` (Python) +
`supabase/` (migrations) + `evals/` (fixtures) + `tests/`. Full diagram in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🚀 Installation

```bash
git clone https://github.com/Nikniv2007/AidBridge_AI.git
cd AidBridge_AI
npm install
npm run dev          # → http://localhost:3000
```

Requires Node.js ≥ 18.17. Python ≥ 3.9 is optional (automation scripts only).

### Scripts

```bash
npm run dev | build | start
npm run typecheck    # tsc --noEmit
npm test             # all Vitest suites
npm run evals        # eval / prompt-regression suite
```

## 🔑 Environment variables

Copy `.env.example` → `.env.local`. **The app runs with zero configuration and
never crashes on missing variables.**

| Variable | Purpose |
| --- | --- |
| `AI_PROVIDER` | `demo` (default) or `live` |
| `AI_DEMO_MODE` | `true` forces demo AI even if a live endpoint is set |
| `LLM_API_URL` / `LLM_API_KEY` / `LLM_MODEL` | vendor-neutral live LLM endpoint |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | optional Supabase |
| `NEXT_PUBLIC_APP_URL` | base URL |

### Demo mode

Default. A deterministic engine returns realistic, schema-valid AI output with no
keys — and backs the eval tests.

### Live AI mode

Set `AI_DEMO_MODE=false`, `AI_PROVIDER=live`, and point `LLM_API_URL/KEY/MODEL` at
any chat-completions-compatible endpoint. On failure or invalid JSON, AidBridge
automatically falls back to demo output.

## 🗄️ Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` then `0002_rls.sql` (or `supabase db push`).
3. Set the Supabase env vars in `.env.local`.
4. Implement the adapters in `lib/supabase/` (marked `TODO(supabase)`).

See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md).

## 🧪 Evals

Run from the **AI Evaluation Lab** page, `POST /api/evals`, or `npm run evals`.
Scores JSON validity, schema compliance, classification & urgency accuracy,
safety, hallucination prevention, human-review routing, and outreach quality.
See [docs/EVALS.md](docs/EVALS.md).

---

## 🛟 Safety disclaimer

> **AidBridge AI is a demonstration public-interest technology project. It does
> not replace emergency services, professional judgment, medical advice, legal
> advice, or official disaster response systems. All sample data is fictional.**

- The platform does not guarantee aid.
- Human review is required for critical cases.
- AI outputs should be reviewed by trained staff.
- The project is intended as a technical and public-interest software
  demonstration.

Full details in [docs/AI_SAFETY.md](docs/AI_SAFETY.md) and the in-app Safety page.

---

## 📁 Folder structure

```
AidBridge_AI/
├── app/                # Next.js App Router: public pages, dashboard (19 pages), API
│   ├── api/            # ai/{intake,triage,match,assign,outreach}, reports, evals, simulation, ai-diff, uploads
│   └── dashboard/      # command-center, intake, triage, cases, resources, matching,
│                       # volunteers, assignments, outreach, map, forecasting, simulation,
│                       # ai-diff, partners, documents, automations, reports, eval-lab, settings
├── components/         # ui/ layout/ dashboard/ cases/ ai/ charts/
├── lib/
│   ├── ai/             # schemas/ prompts/ context-builders/ providers/ + 8 task modules, evalRunner, evalMetrics, diff
│   ├── matching/ safety/ forecasting/ simulation/ volunteers/
│   ├── data/           # demo db, metrics, AI output log
│   └── supabase/ utils/ automation/ types/
├── scripts/            # Python automation (stdlib only)
├── evals/              # eval fixtures + regression suite
├── supabase/migrations # schema + RLS
├── tests/              # Vitest
└── docs/               # product, architecture, schema, prompts, safety, evals, automation, handoff, roadmap, project plan
```

## 🧭 Roadmap

MVP is shipped; advanced features are scaffolded (Supabase Auth/RLS, geocoding,
historical forecasting, PDF/Excel parsing, partner write-back). See
[docs/ROADMAP.md](docs/ROADMAP.md) and
[docs/GITHUB_PROJECT_PLAN.md](docs/GITHUB_PROJECT_PLAN.md) (milestones, labels, 25
issues).

## 📄 License

MIT — see [LICENSE](LICENSE).

## 🌍 Public-interest mission

<div align="center">
<sub>AidBridge AI is public-interest technology: it exists to help communities
coordinate care faster and more safely, with humans always in the loop. Built to
be transparent, explainable, and accountable.</sub>
</div>
