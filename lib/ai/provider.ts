/**
 * AI provider dispatcher.
 *
 * Chooses between a live LLM call (any configurable, chat-completions-compatible
 * endpoint) and the deterministic demo engine, based on env config and key
 * availability. The public functions ALWAYS return schema-valid outputs — if a
 * live call fails or returns invalid JSON, we fall back to demo mode and record
 * that in `meta`. This is what keeps the app usable without keys and resilient
 * in production.
 *
 * The live endpoint is fully configurable via env (LLM_API_URL / LLM_API_KEY /
 * LLM_MODEL) so the app is not tied to any specific vendor. In demo mode nothing
 * leaves the process.
 */

import {
  demoOutreach,
  demoTriage,
  type DemoTriageInput,
} from "@/lib/ai/demo";
import {
  OUTREACH_SYSTEM_PROMPT,
  PROMPT_VERSION,
  REPORT_SYSTEM_PROMPT,
  TRIAGE_FEW_SHOTS,
  TRIAGE_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import {
  outreachModelSchema,
  reportModelSchema,
  safeParseTriage,
} from "@/lib/ai/schema";
import type {
  AiRunMeta,
  OutreachOutput,
  OutreachRequest,
  Report,
  ReportType,
  TriageOutput,
} from "@/lib/types";

type Provider = "live" | "demo";

function resolveProvider(): { provider: Provider; demoMode: boolean; model: string } {
  const forcedDemo = (process.env.AI_DEMO_MODE ?? "true").toLowerCase() === "true";
  const configured = (process.env.AI_PROVIDER ?? "demo").toLowerCase() as Provider;

  if (forcedDemo) return { provider: "demo", demoMode: true, model: "aidbridge-demo-1" };

  if (configured === "live" && process.env.LLM_API_KEY && process.env.LLM_API_URL) {
    return {
      provider: "live",
      demoMode: false,
      model: process.env.LLM_MODEL ?? "aidbridge-live-1",
    };
  }
  // Fallback: no usable endpoint/key configured.
  return { provider: "demo", demoMode: true, model: "aidbridge-demo-1" };
}

function baseMeta(latencyMs: number): AiRunMeta {
  const { provider, demoMode, model } = resolveProvider();
  return { provider, model, promptVersion: PROMPT_VERSION, demoMode, latencyMs };
}

// ── Live call helper (only used when a live endpoint + key are configured) ───
// Uses the widely-adopted chat-completions request/response shape. Point
// LLM_API_URL at any compatible endpoint; the app stays vendor-agnostic.

async function callLiveLLM(system: string, user: string): Promise<string> {
  const res = await fetch(process.env.LLM_API_URL!, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL ?? "aidbridge-live-1",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM endpoint ${res.status}`);
  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? "";
}

async function callLLM(system: string, user: string): Promise<string> {
  const { provider } = resolveProvider();
  if (provider === "live") return callLiveLLM(system, user);
  throw new Error("no live provider");
}

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object found");
  return JSON.parse(trimmed.slice(start, end + 1));
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Triage a request. Always returns a valid TriageOutput. `startedAt` lets tests
 * pass a fixed clock; defaults to Date.now() at call time.
 */
export async function runTriage(
  input: DemoTriageInput,
  startedAt: number = Date.now(),
): Promise<TriageOutput> {
  const { provider } = resolveProvider();

  if (provider === "demo") {
    const model = demoTriage(input);
    return { ...model, meta: baseMeta(Date.now() - startedAt) } as TriageOutput;
  }

  try {
    const fewShots = TRIAGE_FEW_SHOTS.map(
      (f) => `Example request:\n${f.input}\nExample JSON:\n${f.output}`,
    ).join("\n\n");
    const user = `${fewShots}\n\nNow triage this request. Return ONLY JSON.\nRequest:\n${input.description}\nReported people affected: ${input.peopleAffected}`;
    const raw = await callLLM(TRIAGE_SYSTEM_PROMPT, user);
    const parsed = safeParseTriage(extractJson(raw));
    if (!parsed.ok) throw new Error(parsed.error);
    return { ...parsed.data, meta: baseMeta(Date.now() - startedAt) } as TriageOutput;
  } catch {
    // Resilient fallback: never fail the request.
    const model = demoTriage(input);
    const meta = baseMeta(Date.now() - startedAt);
    return { ...model, meta: { ...meta, provider: "demo", demoMode: true } } as TriageOutput;
  }
}

export async function runOutreach(
  req: OutreachRequest,
  startedAt: number = Date.now(),
): Promise<OutreachOutput> {
  const { provider } = resolveProvider();

  const finalize = (out: { subject: string | null; body: string }): OutreachOutput => ({
    subject: out.subject,
    body: out.body,
    language: req.language,
    wordCount: out.body.trim().split(/\s+/).length,
    meta: baseMeta(Date.now() - startedAt),
  });

  if (provider === "demo") return finalize(demoOutreach(req));

  try {
    const user = `Audience: ${req.audience}\nFormat: ${req.format}\nTone: ${req.tone}\nLanguage: ${req.language}\nContext: ${req.context}`;
    const raw = await callLLM(OUTREACH_SYSTEM_PROMPT, user);
    const parsed = outreachModelSchema.safeParse(extractJson(raw));
    if (!parsed.success) throw new Error("invalid outreach JSON");
    return finalize(parsed.data);
  } catch {
    const meta = baseMeta(Date.now() - startedAt);
    const out = demoOutreach(req);
    return { ...finalize(out), meta: { ...meta, provider: "demo", demoMode: true } };
  }
}

export async function runReport(
  type: ReportType,
  title: string,
  periodLabel: string,
  stats: Record<string, unknown>,
  startedAt: number = Date.now(),
): Promise<Report> {
  const { provider } = resolveProvider();
  const id = `RPT-${type}-${startedAt}`;

  const demoReport = (): Report => {
    const md = renderDemoReport(title, periodLabel, stats);
    return {
      id,
      type,
      title,
      generatedAt: new Date(startedAt).toISOString(),
      periodLabel,
      markdown: md.markdown,
      highlights: md.highlights,
      meta: baseMeta(Date.now() - startedAt),
    };
  };

  if (provider === "demo") return demoReport();

  try {
    const user = `Report type: ${type}\nTitle: ${title}\nPeriod: ${periodLabel}\nStats JSON:\n${JSON.stringify(stats)}`;
    const raw = await callLLM(REPORT_SYSTEM_PROMPT, user);
    const parsed = reportModelSchema.safeParse(extractJson(raw));
    if (!parsed.success) throw new Error("invalid report JSON");
    return {
      id,
      type,
      title: parsed.data.title,
      generatedAt: new Date(startedAt).toISOString(),
      periodLabel,
      markdown: parsed.data.markdown,
      highlights: parsed.data.highlights,
      meta: baseMeta(Date.now() - startedAt),
    };
  } catch {
    return demoReport();
  }
}

function renderDemoReport(
  title: string,
  period: string,
  stats: Record<string, unknown>,
): { markdown: string; highlights: string[] } {
  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push(`_Period: ${period}_`);
  lines.push("");
  lines.push("## Summary");
  lines.push(
    "This report is generated by AidBridge AI from live operational counts. Figures are grounded strictly in the data below; no specifics are fabricated.",
  );
  lines.push("");
  lines.push("## Key Metrics");
  for (const [k, v] of Object.entries(stats)) {
    lines.push(`- **${k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}:** ${String(v)}`);
  }
  lines.push("");
  lines.push("## Recommendations");
  lines.push("- Review any cases flagged for human review before dispatch.");
  lines.push("- Replenish resource types below the shortage threshold.");
  lines.push("- Balance volunteer workload against per-day task caps.");
  lines.push("");
  lines.push(
    "> Note: AidBridge AI supports human coordinators; it does not replace emergency services or professional advice.",
  );

  const highlights = [
    `${stats["activeCases"] ?? "—"} active cases in ${period}.`,
    `${stats["needsReview"] ?? "—"} cases awaiting human review.`,
    `${stats["resourceShortages"] ?? "—"} resource types at or below shortage threshold.`,
  ];
  return { markdown: lines.join("\n"), highlights };
}
