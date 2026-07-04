/**
 * Generic live LLM provider (vendor-neutral).
 *
 * Targets any chat-completions-compatible endpoint configured via env — no
 * vendor is named or assumed. Only used when a live endpoint + key are present
 * AND demo mode is off.
 *
 *   LLM_API_URL   full endpoint URL
 *   LLM_API_KEY   bearer token
 *   LLM_MODEL     model identifier passed through to the endpoint
 */

export interface LiveConfig {
  url: string;
  key: string;
  model: string;
}

export function getLiveConfig(): LiveConfig | null {
  const url = process.env.LLM_API_URL;
  const key = process.env.LLM_API_KEY;
  if (!url || !key) return null;
  return { url, key, model: process.env.LLM_MODEL ?? "aidbridge-live-1" };
}

export async function callLiveLLM(
  system: string,
  user: string,
  cfg: LiveConfig,
): Promise<string> {
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${cfg.key}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM endpoint responded ${res.status}`);
  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? "";
}

/** Extract the first JSON object from a possibly-fenced string. */
export function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object found in response");
  return JSON.parse(trimmed.slice(start, end + 1));
}
