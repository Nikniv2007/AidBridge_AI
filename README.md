<div align="center">

# 🤝 AidBridge AI

### Community Crisis & Resource Operations System

**AidBridge AI turns messy community needs into structured, actionable aid workflows.**

Built for nonprofits, schools, city teams, and volunteer organizations that need to intake requests, match resources, coordinate people, and measure impact faster.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Why this exists

When a storm hits or a food drive spins up, requests arrive as texts, emails, spreadsheets, and voicemails. Coordinators hand-triage each one, re-key data across tools, and lose track of who needs what — right when speed matters most.

AidBridge AI is an **AI operations system, not a chatbot**. A single plain-language request becomes a structured, trackable case: the AI proposes a classification, urgency score, safety flags, and resource/volunteer matches — but **a human always approves high-risk and low-confidence decisions**, and **every AI output is logged and continuously evaluated**.

> **This is decision support, not a replacement for emergency services.** See [Safety & limits](#-safety--responsible-ai).

---

## ✨ Highlights

| Capability | What it does |
| --- | --- |
| 🧠 **AI triage & urgency scoring** | Plain text → validated JSON with category, 0–100 urgency, safety flags, next steps |
| 🧩 **Explainable resource matching** | Ranks resources by type, distance, availability, delivery, eligibility, urgency — with reasons |
| 🧑‍🤝‍🧑 **Smart volunteer assignment** | Recommends volunteers by location, language, skills, vehicle, reliability, workload |
| 💬 **Multilingual outreach** | SMS/email/WhatsApp drafts in English, Spanish, Hindi, Urdu, across 6 tones |
| ⚙️ **Automation & parsers** | CSV import, duplicate detection, low-stock alerts, scheduled runs with audit logs |
| 🧪 **AI evaluations built in** | Regression harness scoring JSON validity, accuracy, safety, and review routing |
| 🛟 **Demo mode** | **Fully usable with no API keys** — deterministic mock AI returns realistic structured output |

---

## 🚀 Quick start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) configure environment — the app works with zero config
cp .env.example .env.local

# 3. Run the dev server
npm run dev
# → http://localhost:3000
```

No API keys? No problem. The app defaults to **demo mode** (`AI_DEMO_MODE=true`) and produces realistic, schema-valid AI output deterministically.

### Enable live AI (optional)

Set in `.env.local`:

```bash
AI_DEMO_MODE=false
AI_PROVIDER=live
LLM_API_URL=https://your-endpoint.example/v1/chat/completions
LLM_API_KEY=your-key
LLM_MODEL=your-model
```

The live path targets the widely-adopted chat-completions request/response
shape, so you can point it at any compatible endpoint you choose — the app is
vendor-agnostic. If the endpoint/key is missing or a live call fails/returns
invalid JSON, AidBridge **automatically falls back to demo mode** and records that in each output's `meta` — the app never breaks.

---

## 🗺️ Product tour

### Public site
- **Home** — mission, problem, features, workflow, demo preview
- **How it works** — the 9-step pipeline
- **Use cases** — food banks, schools, disaster response, city teams, and more
- **Live demo** — paste a request, watch it become structured JSON
- **Safety** — what the system will and won't do

### Operations dashboard (`/dashboard`)
`Command Center` · `Case Intake` · `AI Triage Queue` · `Cases` · `Resource Directory` · `Resource Matching` · `Volunteers` · `Volunteer Assignment` · `Outreach Center` · `Document Uploads` · `Automation Logs` · `Reports` · `AI Evaluation Lab` · `Admin Settings`

---

## 🧠 AI layer (Part 2)

Eight structured, schema-validated AI tasks — **intake classifier, urgency
scorer, safety review, resource matcher, volunteer assignment, outreach
generator, report writer, and output reviewer** — built on:

- **Vendor-neutral provider** (`lib/ai/providers/`): demo (default, no keys) or a
  configurable live endpoint (`LLM_API_URL` / `LLM_API_KEY` / `LLM_MODEL`). No
  third-party AI vendor is named or assumed. Live failures fall back to demo.
- **Zod schemas** (`lib/ai/schemas/`): every output is validated before it's
  trusted; malformed output is logged, surfaced to the eval lab, and replaced by
  a safe fallback — never silently accepted.
- **Versioned prompts + few-shot** (`lib/ai/prompts/`): JSON-only contracts,
  baked-in safety rules, confidence scores, and brief reason summaries (no
  chain-of-thought exposure).
- **Layered context builders** (`lib/ai/context-builders/`): system safety rules
  → org rules → user role → case → resources/volunteers → notes → schema.
- **Deterministic cores**: explainable matching point systems (`lib/matching/`),
  urgency scoring, and a rule-based safety engine (`lib/safety/`).

See [docs/AI_LAYER.md](docs/AI_LAYER.md) for the full design.

## 🧱 Tech stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn-style components, lucide-react icons, dependency-free SVG charts
- **Backend:** Next.js API routes / server components, Zod validation
- **Data:** Supabase-ready PostgreSQL schema + migrations with Row-Level-Security (runs on a rich in-memory demo store out of the box — 1 org, 5 users, 100 cases, 30 volunteers, 35 resources, plus events, AI outputs, evals, automations, reports; all fictional)
- **AI layer:** 8 structured tasks, vendor-neutral provider dispatcher (configurable live endpoint / deterministic demo), versioned prompts, few-shot prompting, schema-enforced structured output, AI output logging + evals
- **Automation:** Python (stdlib-only) scripts for intake/roster/inventory parsing, duplicate detection, daily report generation, AI-output validation, seeding
- **Testing:** Vitest — unit tests, schema-validation tests, safety-rule tests, deterministic-scoring tests, and AI eval / prompt-regression tests (35 passing)

---

## 📁 Project structure

```
aidbridge-ai/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── how-it-works/ use-cases/ demo/ safety/
│   ├── dashboard/          # 14 operations pages
│   └── api/                # ai/ cases/ resources/ volunteers/ reports/ evals/ uploads/
├── components/             # ui/ layout/ dashboard/ cases/ ai/ charts/
├── lib/
│   ├── ai/                 # prompts, schema (Zod), demo engine, provider, evals
│   ├── matching/ scoring/ safety/   # explainable, deterministic cores
│   ├── automation/         # CSV parser (mirrors the Python one)
│   ├── data/               # mock store + derived metrics
│   ├── supabase/           # client scaffolding (TODOs documented)
│   └── types/              # single source of truth for domain types
├── scripts/                # Python automation layer
├── evals/                  # golden eval cases + schema docs
├── supabase/               # schema.sql (tables, enums, RLS)
├── tests/                  # Vitest suites (incl. tests/evals)
└── docs/                   # ARCHITECTURE, PROMPTS, AI_EVALS
```

---

## 🧪 Testing & evals

```bash
npm test          # all Vitest suites
npm run evals     # AI eval / prompt-regression suite only
npm run typecheck # tsc --noEmit
```

Python automation (no install needed — stdlib only):

```bash
python scripts/parse_csv.py scripts/output/volunteers.csv
python scripts/detect_duplicates.py cases.json --threshold 0.82
python scripts/validate_json.py triage_output.json
python scripts/seed_demo_data.py
```

The **AI Evaluation Lab** (`/dashboard/eval-lab`) and `POST /api/evals` run the same suite as `tests/evals`, scoring across JSON validity, schema compliance, classification & urgency accuracy, safety compliance, hallucination prevention, and human-review routing.

---

## 🔌 API reference (selected)

| Method & path | Purpose |
| --- | --- |
| `POST /api/ai/triage` | Triage a request → structured `TriageOutput` |
| `POST /api/ai/outreach` | Generate an outreach message |
| `GET/POST /api/cases` | List cases / create + triage a case |
| `GET /api/resources`, `/api/volunteers` | List directories |
| `POST /api/reports` | Generate a report |
| `GET/POST /api/evals` | List / run the eval suite |
| `POST /api/uploads` | Parse + preview CSV content |

---

## 🛟 Safety & responsible AI

AidBridge AI is designed with hard limits, enforced in **code** (not just prompts):

- ❌ Does **not** replace 911 / emergency services
- ❌ Does **not** provide medical, legal, tax, or financial advice
- ❌ Does **not** guarantee aid will be delivered
- ✅ Keeps a **human in the loop** for high-risk and low-confidence cases
- ✅ **Flags** medical emergencies, self-harm, domestic violence, unaccompanied minors, and immediate danger via a deterministic rules engine (`lib/safety`)
- ✅ **Logs** every AI output (provider, model, prompt version) for review and evaluation

See the [Safety page](app/safety/page.tsx) and [`lib/safety/index.ts`](lib/safety/index.ts).

---

## 🗄️ Supabase integration

The app runs entirely on an in-memory mock store today. To go live:

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql).
2. Fill Supabase env vars in `.env.local`.
3. Install `@supabase/supabase-js` and implement the adapters behind [`lib/supabase/client.ts`](lib/supabase/client.ts) (TODOs are marked inline).

The schema is **RLS-ready**: every operational table carries `org_id` for multi-tenant isolation.

---

## 🧭 Roadmap / documented TODOs

- Supabase Auth + RLS wiring and data adapters
- PDF (`pdf-parse`) and Excel (`SheetJS`) document parsing
- Real geocoding for distance-based matching (currently ZIP-prefix approximation)
- Persisted automation scheduling
- Outreach tone-quality eval category

---

## 📄 License

MIT — see [LICENSE](LICENSE).

<div align="center">
<sub>Public-interest technology. Humans stay in the loop.</sub>
</div>
