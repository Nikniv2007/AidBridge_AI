"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { AiOutputPanel } from "@/components/ai/ai-output-panel";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import type { TriageOutput } from "@/lib/types";
import { Sparkles, Wand2 } from "lucide-react";

const SAMPLES = [
  "My elderly grandmother lost power and cannot drive. She needs vegetarian meals delivered today.",
  "There's a gas smell in my apartment and my kids are coughing, we need help now.",
  "Necesito ropa de invierno para mis tres hijos antes de que empiece la escuela.",
  "Lost my job, behind on the electric bill and running low on food for my family of five.",
];

export function DemoClient() {
  const [text, setText] = React.useState(SAMPLES[0]);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<TriageOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: text, peopleAffected: 1 }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as TriageOutput;
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-500" /> Community request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Describe the community need in plain language…"
            />
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setText(s)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
                >
                  Sample {i + 1}
                </button>
              ))}
            </div>
            <Button onClick={run} disabled={loading || !text.trim()}>
              <Wand2 className="h-4 w-4" />
              {loading ? "Triaging…" : "Run AI triage"}
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>
      </div>

      <div>
        {loading ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ) : result ? (
          <AiOutputPanel triage={result} />
        ) : (
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="Structured output appears here"
            description="Run triage on a request to see the classification, urgency score, safety flags, next steps, and raw JSON."
          />
        )}
      </div>
    </div>
  );
}
