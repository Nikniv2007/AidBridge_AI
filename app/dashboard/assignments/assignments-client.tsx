"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import type { VolunteerAssignmentResult } from "@/lib/ai/schemas/volunteer-assignment.schema";
import type { AiRunMeta } from "@/lib/ai/schemas/common";
import { humanize } from "@/lib/utils/format";
import { AlertTriangle, CheckCircle2, UserPlus } from "lucide-react";

interface CaseOption {
  id: string;
  requester_name: string;
  original_request: string;
  case_type: string;
  urgency_level: string;
  preferred_language: string;
  city: string;
}

export function AssignmentsClient({ cases }: { cases: CaseOption[] }) {
  const [caseId, setCaseId] = React.useState(cases[0]?.id ?? "");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{ result: VolunteerAssignmentResult; meta: AiRunMeta } | null>(null);
  const selected = cases.find((c) => c.id === caseId);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/assign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ case_id: caseId }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => setResult(null), [caseId]);
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
                <Badge tone="info">{selected.preferred_language}</Badge>
                <Badge tone="neutral">{selected.city}</Badge>
              </div>
            </div>
          )}
          <Button onClick={run} disabled={loading} className="w-full">
            <UserPlus className="h-4 w-4" />
            {loading ? "Scoring…" : "Recommend volunteers"}
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
            {r.human_review_required && (
              <Card className="border-amber-200 dark:border-amber-900">
                <CardContent className="flex items-center gap-2 p-4 text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-5 w-5" />
                  {r.recommended_volunteer
                    ? "Human review recommended before assigning."
                    : "Safety-critical case — not auto-assigned. Coordinator must assign manually."}
                  {r.risk_flags.length > 0 && ` Flags: ${r.risk_flags.map(humanize).join(", ")}.`}
                </CardContent>
              </Card>
            )}
            {r.recommended_volunteer && (
              <VolunteerCard entry={r.recommended_volunteer} top />
            )}
            {r.backup_volunteers.map((b) => (
              <VolunteerCard key={b.volunteer_id} entry={b} />
            ))}
            <p className="text-xs text-muted-foreground">
              {result?.meta.demo_mode ? "Demo AI" : "Live"} · confidence {(r.confidence_score * 100).toFixed(0)}% · {result?.meta.prompt_version}
            </p>
          </>
        ) : (
          <EmptyState icon={<UserPlus className="h-8 w-8" />} title="Recommended volunteers appear here" description="Select a case and run scoring to see the best-fit volunteer and backups, with a fit score and reason." />
        )}
      </div>
    </div>
  );
}

function VolunteerCard({
  entry,
  top,
}: {
  entry: { volunteer_id: string; name: string; assignment_score: number; reason_summary?: string };
  top?: boolean;
}) {
  return (
    <Card className={top ? "border-brand-300 dark:border-brand-800" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{entry.name}</p>
              {top && <Badge tone="brand">Recommended</Badge>}
            </div>
            {entry.reason_summary && (
              <p className="mt-1 text-sm text-muted-foreground">{entry.reason_summary}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums">{entry.assignment_score}</p>
            <p className="text-xs text-muted-foreground">fit score</p>
          </div>
        </div>
        <Progress value={entry.assignment_score} className="mt-3" indicatorClassName={entry.assignment_score >= 70 ? "bg-emerald-500" : entry.assignment_score >= 45 ? "bg-amber-500" : "bg-red-500"} />
        {top && (
          <div className="mt-3 flex justify-end">
            <Button size="sm">
              <CheckCircle2 className="h-4 w-4" /> Assign {entry.name.split(" ")[0]}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
