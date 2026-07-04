"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UrgencyBadge } from "@/components/ai/badges";
import { matchResources } from "@/lib/matching";
import { getResource } from "@/lib/data/mock";
import { CATEGORY_LABELS } from "@/lib/utils/format";
import type { Case, Resource } from "@/lib/types";
import { AlertTriangle, Combine, MapPin, Truck } from "lucide-react";

export function MatchingClient({
  cases,
  resources,
}: {
  cases: Case[];
  resources: Resource[];
}) {
  const [caseId, setCaseId] = React.useState(cases[0]?.id ?? "");
  const selected = cases.find((c) => c.id === caseId);
  const matches = React.useMemo(
    () => (selected ? matchResources(selected, resources).slice(0, 5) : []),
    [selected, resources],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
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
              <div className="space-y-3 rounded-lg bg-muted/40 p-4 text-sm">
                <p className="italic text-muted-foreground">
                  “{selected.intake.description}”
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="brand">{CATEGORY_LABELS[selected.triage.category]}</Badge>
                  <UrgencyBadge urgency={selected.triage.urgency} score={selected.triage.urgencyScore} />
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Needed resources
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.triage.neededResources.map((r) => (
                      <Badge key={r} tone="info">{r.replace(/_/g, " ")}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Combine className="h-4 w-4" /> Ranked matches
        </div>
        {matches.map((m, i) => {
          const r = getResource(m.resourceId);
          if (!r) return null;
          return (
            <Card key={m.resourceId} className={i === 0 ? "border-brand-300 dark:border-brand-800" : ""}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{r.name}</p>
                      {i === 0 && <Badge tone="brand">Top match</Badge>}
                    </div>
                    <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> ~{m.distanceMiApprox} mi
                      </span>
                      {r.deliveryAvailable && (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <Truck className="h-3 w-3" /> Delivery
                        </span>
                      )}
                      <span>{r.quantityAvailable} available</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold tabular-nums">{m.score}</p>
                    <p className="text-xs text-muted-foreground">match score</p>
                  </div>
                </div>

                <Progress
                  value={m.score}
                  className="mt-3"
                  indicatorClassName={m.score >= 70 ? "bg-emerald-500" : m.score >= 45 ? "bg-amber-500" : "bg-red-500"}
                />

                <div className="mt-3">
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Why this match
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {m.reasons.map((reason, idx) => (
                      <li key={idx}>
                        <Badge tone="neutral">{reason}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {m.humanReviewRecommended && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5" /> Human review recommended
                        {m.eligibilityFit === "unknown" && " (verify eligibility)"}
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant={i === 0 ? "primary" : "outline"}>
                    {i === 0 ? "Confirm match" : "Use as backup"}
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
