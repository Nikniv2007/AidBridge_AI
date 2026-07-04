"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import type { ResourceMatchResult } from "@/lib/ai/schemas/resource-match.schema";
import type { AiRunMeta } from "@/lib/ai/schemas/common";
import { humanize } from "@/lib/utils/format";
import { AlertTriangle, Combine } from "lucide-react";

interface CaseOption {
  id: string;
  requester_name: string;
  original_request: string;
  case_type: string;
  urgency_level: string;
  urgency_score: number;
}

export function MatchingClient({ cases }: { cases: CaseOption[] }) {
  const [caseId, setCaseId] = React.useState(cases[0]?.id ?? "");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{ result: ResourceMatchResult; meta: AiRunMeta } | null>(null);
  const selected = cases.find((c) => c.id === caseId);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ case_id: caseId }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    setResult(null);
  }, [caseId]);

  const r = result?.result;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Select a case</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={caseId} onChange={(e) => setCaseId(e.target.value)}>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.requester_name}
              </option>
            ))}
          </Select>
          {selected && (
            <div className="space-y-2 rounded-lg bg-muted/40 p-4 text-sm">
              <p className="italic text-muted-foreground">“{selected.original_request}”</p>
              <div className="flex flex-wrap gap-2">
                <Badge tone="brand">{humanize(selected.case_type)}</Badge>
                <Badge tone="info" className="capitalize">
                  {selected.urgency_level} · {selected.urgency_score}
                </Badge>
              </div>
            </div>
          )}
          <Button onClick={run} disabled={loading} className="w-full">
            <Combine className="h-4 w-4" />
            {loading ? "Matching…" : "Run resource match"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        {loading ? (
          <Card>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ) : r ? (
          <>
            {r.recommended_match ? (
              <MatchCard entry={r.recommended_match} top humanReview={r.human_review_required} />
            ) : (
              <Card className="border-amber-200 dark:border-amber-900">
                <CardContent className="flex items-center gap-2 p-5 text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-5 w-5" />
                  No viable resource found. Routed to human review.
                  {r.unmet_needs.length > 0 && ` Unmet: ${r.unmet_needs.join(", ")}.`}
                </CardContent>
              </Card>
            )}
            {r.backup_matches.map((b) => (
              <MatchCard key={b.resource_id} entry={b} />
            ))}
            <p className="text-xs text-muted-foreground">
              {result?.meta.demo_mode ? "Demo AI" : "Live"} · confidence {(r.confidence_score * 100).toFixed(0)}% · {result?.meta.prompt_version}
            </p>
          </>
        ) : (
          <EmptyState icon={<Combine className="h-8 w-8" />} title="Ranked matches appear here" description="Select a case and run the matcher to see the top recommendation and backups with scores and reasons." />
        )}
      </div>
    </div>
  );
}

function MatchCard({
  entry,
  top,
  humanReview,
}: {
  entry: { resource_id: string; name: string; match_score: number; reason_summary: string };
  top?: boolean;
  humanReview?: boolean;
}) {
  return (
    <Card className={top ? "border-brand-300 dark:border-brand-800" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{entry.name}</p>
              {top && <Badge tone="brand">Top match</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{entry.reason_summary}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums">{entry.match_score}</p>
            <p className="text-xs text-muted-foreground">match score</p>
          </div>
        </div>
        <Progress value={entry.match_score} className="mt-3" indicatorClassName={entry.match_score >= 70 ? "bg-emerald-500" : entry.match_score >= 45 ? "bg-amber-500" : "bg-red-500"} />
        {top && humanReview && (
          <p className="mt-3 inline-flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" /> Human review recommended (verify eligibility/availability).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
