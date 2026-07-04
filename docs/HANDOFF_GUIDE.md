# Handoff Guide

Everything a new developer needs to run, extend, and deploy AidBridge AI.

## How to install

```bash
git clone https://github.com/Nikniv2007/AidBridge_AI.git
cd AidBridge_AI
npm install
```

Requirements: Node.js ≥ 18.17. Python ≥ 3.9 is optional (only for the automation
scripts, which use the standard library only).

## How to run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
npm test           # Vitest (unit + schema + safety + scoring + evals)
npm run evals      # eval / prompt-regression suite only
```

## Environment variables

Copy `.env.example` → `.env.local`. **The app runs with zero configuration** — no
key is required, and it never crashes on missing variables.

| Variable | Purpose |
| --- | --- |
| `AI_PROVIDER` | `demo` (default) or `live` |
| `AI_DEMO_MODE` | `true` forces demo AI even if a live endpoint is set |
| `LLM_API_URL` / `LLM_API_KEY` / `LLM_MODEL` | vendor-neutral live LLM endpoint |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | optional Supabase |
| `NEXT_PUBLIC_APP_URL` | base URL |

## Demo mode

Default. A deterministic engine produces realistic, schema-valid AI output with
no keys. Because it's deterministic, it also backs the eval/regression tests.

## Live mode

Set `AI_DEMO_MODE=false`, `AI_PROVIDER=live`, and point `LLM_API_URL/KEY/MODEL` at
any chat-completions-compatible endpoint. If a live call fails or returns invalid
JSON, the app automatically falls back to demo output and records it in `meta`.

## How to add a new prompt / task

1. Add a Zod schema in `lib/ai/schemas/`.
2. Add a prompt file in `lib/ai/prompts/` and bump its version in `shared.ts`.
3. Add a context builder in `lib/ai/context-builders/` (optional).
4. Add a task module in `lib/ai/` that calls `runStructuredTask()` with a
   deterministic `demo` generator and the schema.
5. Add an API route in `app/api/ai/` and wire the UI.

## How to add a new eval

1. Add fixtures to the relevant `evals/*.eval.ts` (or a new file included in
   `regression-suite.eval.ts`).
2. If a new task type or a new special expected-key is needed, extend
   `lib/ai/evalRunner.ts`.
3. Run `npm run evals`.

## How to deploy

- **Vercel** (recommended): import the repo, set env vars, deploy. The build is
  fully static/serverless-compatible (43 routes).
- **Supabase**: create a project, run `supabase/migrations/*.sql` (or
  `supabase db push`), set the Supabase env vars, then implement the adapters in
  `lib/supabase/` (marked `TODO(supabase)`).
- **Node host**: `npm run build && npm start` behind a reverse proxy.

## Troubleshooting

- Missing keys → app stays in demo mode (expected).
- Live call fails → automatic demo fallback (see `meta.demo_mode` in outputs).
- Eval failures → open the AI Evaluation Lab and read `failure_reason`.
