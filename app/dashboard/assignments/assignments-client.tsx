"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UrgencyBadge } from "@/components/ai/badges";
import { matchVolunteers } from "@/lib/matching";
import { getVolunteer } from "@/lib/data/mock";
import type { Case, Volunteer } from "@/lib/types";
import { CheckCircle2, MapPin, ThumbsUp, TriangleAlert, UserPlus } from "lucide-react";

export function AssignmentsClient({
  cases,
  volunteers,
}: {
  cases: Case[];
  volunteers: Volunteer[];
}) {
  const [caseId, setCaseId] = React.useState(cases[0]?.id ?? "");
  const selected = cases.find((c) => c.id === caseId);
  const matches = React.useMemo(
    () => (selected ? matchVolunteers(selected, volunteers).slice(0, 4) : []),
    [selected, volunteers],
  );

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
                {c.id} — {c.intake.requesterName}
              </option>
            ))}
          </Select>
          {selected?.triage && (
            <div className="space-y-2 rounded-lg bg-muted/40 p-4 text-sm">
              <p className="italic text-muted-foreground">“{selected.intake.description}”</p>
              <div className="flex flex-wrap items-center gap-2">
                <UrgencyBadge urgency={selected.triage.urgency} score={selected.triage.urgencyScore} />
                <Badge tone="info">{selected.intake.preferredLanguage.toUpperCase()}</Badge>
                <Badge tone="neutral">{selected.intake.city}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <UserPlus className="h-4 w-4" /> Recommended volunteers
        </div>
        {matches.map((m, i) => {
          const v = getVolunteer(m.volunteerId);
          if (!v) return null;
          return (
            <Card key={m.volunteerId} className={i === 0 ? "border-brand-300 dark:border-brand-800" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{v.name}</p>
                      {i === 0 && <Badge tone="brand">Recommended</Badge>}
                    </div>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {v.city}, {v.state} · {v.completedTasks} completed · {v.activeAssignments}/{v.maxTasksPerDay} today
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold tabular-nums">{m.score}</p>
                    <p className="text-xs text-muted-foreground">fit score</p>
                  </div>
                </div>

                <Progress
                  value={m.score}
                  className="mt-3"
                  indicatorClassName={m.score >= 70 ? "bg-emerald-500" : m.score >= 45 ? "bg-amber-500" : "bg-red-500"}
                />

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-emerald-600">
                      <ThumbsUp className="h-3 w-3" /> Strengths
                    </p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {m.reasons.map((r, idx) => (
                        <li key={idx}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                  {m.concerns.length > 0 && (
                    <div>
                      <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-amber-600">
                        <TriangleAlert className="h-3 w-3" /> Concerns
                      </p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {m.concerns.map((r, idx) => (
                          <li key={idx}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <Button size="sm" variant={i === 0 ? "primary" : "outline"}>
                    <CheckCircle2 className="h-4 w-4" /> Assign {v.name.split(" ")[0]}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
