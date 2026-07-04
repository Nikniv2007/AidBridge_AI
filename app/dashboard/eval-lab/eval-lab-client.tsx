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
import type { EvalCase, EvalResult } from "@/lib/types";
import { FlaskConical, Play, CheckCircle2, XCircle } from "lucide-react";

interface SuiteOutcome {
  results: EvalResult[];
  passed: number;
  failed: number;
  passRate: number;
}

export function EvalLabClient({ evals }: { evals: EvalCase[] }) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FlaskConical className="h-4 w-4" />
          {evals.length} eval cases across{" "}
          {new Set(evals.map((e) => e.category)).size} categories
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
        {(outcome?.results ?? evals.map(toPending)).map((r) => {
          const isResult = !!outcome;
          const result = r as EvalResult;
          const open = expanded === result.evalId;
          return (
            <Card key={result.evalId}>
              <CardContent className="p-4">
                <button
                  className="flex w-full items-start justify-between gap-3 text-left"
                  onClick={() => setExpanded(open ? null : result.evalId)}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{result.name}</span>
                      <Badge tone="neutral">{humanize(result.category)}</Badge>
                      {isResult && <ValidationChip pass={result.pass} />}
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      “{result.input}”
                    </p>
                  </div>
                  {isResult && (
                    <div className="flex items-center gap-2">
                      <Progress
                        value={result.score * 100}
                        className="w-16"
                        indicatorClassName={result.pass ? "bg-emerald-500" : "bg-red-500"}
                      />
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {(result.score * 100).toFixed(0)}
                      </span>
                    </div>
                  )}
                </button>

                {open && isResult && (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Expected</p>
                      <JsonViewer data={result.expected} maxHeight="12rem" />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Actual</p>
                      <JsonViewer data={result.actual} maxHeight="12rem" />
                    </div>
                    {result.failureReason && (
                      <div className="lg:col-span-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        <span className="font-semibold">Failure: </span>
                        {result.failureReason}
                      </div>
                    )}
                    <p className="lg:col-span-2 text-xs text-muted-foreground">
                      Ran {result.timestamp}
                    </p>
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

function toPending(e: EvalCase): EvalResult {
  return {
    id: `${e.id}-pending`,
    evalId: e.id,
    category: e.category,
    name: e.name,
    input: e.input,
    expected: e.expected,
    actual: {},
    pass: false,
    score: 0,
    failureReason: null,
    timestamp: "",
  };
}
