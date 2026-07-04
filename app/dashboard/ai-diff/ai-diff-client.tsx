"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "@/components/ai/json-viewer";
import { ValidationChip } from "@/components/ai/badges";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { GitCompareArrows } from "lucide-react";

interface DiffResp {
  old: Record<string, unknown>;
  new: Record<string, unknown>;
  diff: {
    old_prompt_version: string;
    new_prompt_version: string;
    changes: { field: string; old: unknown; new: unknown }[];
    difference_summary: string;
    safety_impact: "none" | "improved" | "regressed" | "changed";
    old_schema_valid: boolean;
    new_schema_valid: boolean;
  };
}

const IMPACT_TONE = {
  none: "neutral",
  improved: "success",
  regressed: "danger",
  changed: "warning",
} as const;

export function AiDiffClient() {
  const [text, setText] = React.useState("My 78-year-old grandmother has no food and cannot drive.");
  const [loading, setLoading] = React.useState(false);
  const [resp, setResp] = React.useState<DiffResp | null>(null);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-diff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      setResp(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompareArrows className="h-4 w-4 text-brand-500" /> Compare prompt versions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} />
          <Button onClick={run} disabled={loading || text.trim().length < 3}>
            {loading ? "Comparing…" : "Run comparison"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="space-y-3 p-6"><Skeleton className="h-6 w-1/2" /><Skeleton className="h-40 w-full" /></CardContent></Card>
      ) : resp ? (
        <>
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge tone="neutral">{resp.diff.old_prompt_version}</Badge>
                <GitCompareArrows className="h-4 w-4 text-muted-foreground" />
                <Badge tone="purple">{resp.diff.new_prompt_version}</Badge>
                <span className="text-muted-foreground">{resp.diff.difference_summary}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Safety impact</span>
                <Badge tone={IMPACT_TONE[resp.diff.safety_impact]} className="capitalize">
                  {resp.diff.safety_impact}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {resp.diff.changes.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Field changes</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {resp.diff.changes.map((c) => (
                  <div key={c.field} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border/60 pb-2 text-sm last:border-0">
                    <div>
                      <p className="font-medium">{c.field}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        {String(c.old)}
                      </code>
                      <span className="text-muted-foreground">→</span>
                      <code className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {String(c.new)}
                      </code>
                    </div>
                    <div />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Old output ({resp.diff.old_prompt_version})</CardTitle>
                <ValidationChip pass={resp.diff.old_schema_valid} />
              </CardHeader>
              <CardContent><JsonViewer data={resp.old} maxHeight="16rem" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>New output ({resp.diff.new_prompt_version})</CardTitle>
                <ValidationChip pass={resp.diff.new_schema_valid} />
              </CardHeader>
              <CardContent><JsonViewer data={resp.new} maxHeight="16rem" /></CardContent>
            </Card>
          </div>
        </>
      ) : (
        <EmptyState icon={<GitCompareArrows className="h-8 w-8" />} title="Compare two prompt versions" description="Enter a request and run the comparison to see how a simulated older prompt (v1) differs from the current one (v2), including safety impact." />
      )}
    </div>
  );
}
