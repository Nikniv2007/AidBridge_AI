"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ValidationChip } from "@/components/ai/badges";
import { JsonViewer } from "@/components/ai/json-viewer";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/dashboard/stat-card";
import { humanize } from "@/lib/utils/format";
import type { EvalCaseDef, EvalRunResult } from "@/lib/ai/schemas/eval.schema";
import { FlaskConical, Play, CheckCircle2, XCircle } from "lucide-react";

interface SuiteOutcome {
  results: EvalRunResult[];
  passed: number;
  failed: number;
  passRate: number;
}

export function EvalLabClient({ evals }: { evals: EvalCaseDef[] }) {
  const [loading, setLoading] = React.useState(false);
  const [outcome, setOutcome] = React.useState<SuiteOutcome | null>(null);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/evals", { method: "POST" });
      setOutcome((await res.json()) as SuiteOutcome);
    } finally {
      setLoading(false);
    }
  }

  const rows: (EvalRunResult | EvalCaseDef)[] = outcome?.results ?? evals;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FlaskConical className="h-4 w-4" />
          {evals.length} eval cases across {new Set(evals.map((e) => e.category)).size} categories
        </div>
        <Button onClick={run} disabled={loading}>
          <Play className="h-4 w-4" />
          {loading ? "Running suite…" : "Run eval suite"}
        </Button>
      </div>

      {outcome && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Pass rate" value={`${outcome.passRate}%`} tone={outcome.passRate >= 90 ? "success" : "warning"} icon={<CheckCircle2 className="h-4 w-4" />} />
          <StatCard label="Passed" value={outcome.passed} tone="success" icon={<CheckCircle2 className="h-4 w-4" />} />
          <StatCard label="Failed" value={outcome.failed} tone={outcome.failed ? "danger" : "success"} icon={<XCircle className="h-4 w-4" />} />
        </div>
      )}

      <div className="space-y-3">
        {rows.map((row, idx) => {
          const isResult = !!outcome;
          const r = row as EvalRunResult;
          const def = row as EvalCaseDef;
          const key = isResult ? r.eval_name : def.eval_name;
          const input = String((isResult ? r.input_payload : def.input_payload).text ?? "");
          const open = expanded === key;
          return (
            <Card key={`${key}-${idx}`}>
              <CardContent className="p-4">
                <button
                  className="flex w-full items-start justify-between gap-3 text-left"
                  onClick={() => setExpanded(open ? null : key)}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{key}</span>
                      <Badge tone="neutral">{humanize((isResult ? r.category : def.category) as string)}</Badge>
                      <Badge tone="info">{humanize((isResult ? r.ai_task_type : def.ai_task_type) as string)}</Badge>
                      {isResult && <ValidationChip pass={r.passed} />}
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">“{input}”</p>
                  </div>
                  {isResult && (
                    <div className="flex items-center gap-2">
                      <Progress value={r.score * 100} className="w-16" indicatorClassName={r.passed ? "bg-emerald-500" : "bg-red-500"} />
                      <span className="text-xs tabular-nums text-muted-foreground">{(r.score * 100).toFixed(0)}</span>
                    </div>
                  )}
                </button>

                {open && isResult && (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Expected</p>
                      <JsonViewer data={r.expected_payload} maxHeight="12rem" />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Actual</p>
                      <JsonViewer data={r.actual_payload} maxHeight="12rem" />
                    </div>
                    {r.failure_reason && (
                      <div className="lg:col-span-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        <span className="font-semibold">Failure: </span>
                        {r.failure_reason}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
