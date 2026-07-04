"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/charts/bar-chart";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { humanize } from "@/lib/utils/format";
import { AlertTriangle, Beaker, Boxes, ShieldAlert, Users } from "lucide-react";

interface ScenarioOpt { id: string; label: string; description: string }

interface SimResult {
  scenario_label: string;
  generated: number;
  resource_needs: { resource: string; count: number }[];
  volunteer_demand: { drivers_needed: number; total_tasks: number };
  human_review_count: number;
  critical_count: number;
  shortage_prediction: {
    resource_type: string;
    current_inventory: number;
    projected_7_day_demand: number;
    shortage_risk: "low" | "medium" | "high";
    recommended_action: string;
  }[];
  operational_plan: string[];
  cases: { id: string; original_request: string; classification: { case_type: string; urgency_level: string } }[];
}

const RISK_TONE = { high: "danger", medium: "warning", low: "success" } as const;

export function SimulationClient({ scenarios }: { scenarios: ScenarioOpt[] }) {
  const [scenario, setScenario] = React.useState(scenarios[0]?.id ?? "");
  const [count, setCount] = React.useState(12);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<SimResult | null>(null);
  const selected = scenarios.find((s) => s.id === scenario);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenario, count }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-4 w-4 text-brand-500" /> Configure scenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Scenario</Label>
              <Select value={scenario} onChange={(e) => setScenario(e.target.value)}>
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Number of cases (10–25)</Label>
              <Input type="number" min={10} max={25} value={count} onChange={(e) => setCount(Number(e.target.value))} />
            </div>
            <div className="flex items-end">
              <Button onClick={run} disabled={loading} className="w-full">
                {loading ? "Simulating…" : "Run simulation"}
              </Button>
            </div>
          </div>
          {selected && <p className="mt-3 text-sm text-muted-foreground">{selected.description}</p>}
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="space-y-3 p-6"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-40 w-full" /></CardContent></Card>
      ) : result ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Cases generated" value={result.generated} tone="brand" icon={<Beaker className="h-4 w-4" />} />
            <StatCard label="Critical" value={result.critical_count} tone="danger" icon={<ShieldAlert className="h-4 w-4" />} />
            <StatCard label="Needs review" value={result.human_review_count} tone="warning" icon={<AlertTriangle className="h-4 w-4" />} />
            <StatCard label="Drivers needed" value={result.volunteer_demand.drivers_needed} tone="success" icon={<Users className="h-4 w-4" />} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Boxes className="h-4 w-4" /> Resource needs</CardTitle></CardHeader>
              <CardContent>
                <BarChart colorByIndex data={result.resource_needs.map((r) => ({ label: humanize(r.resource), value: r.count }))} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Shortage prediction</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.shortage_prediction.slice(0, 5).map((f) => (
                  <div key={f.resource_type} className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5 text-sm last:border-0">
                    <span>{humanize(f.resource_type)}</span>
                    <span className="text-xs text-muted-foreground">
                      {f.current_inventory} / {f.projected_7_day_demand}
                    </span>
                    <Badge tone={RISK_TONE[f.shortage_risk]} className="capitalize">{f.shortage_risk}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Recommended operational plan</CardTitle></CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm">
                {result.operational_plan.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Generated cases (fictional)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {result.cases.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-2 text-sm last:border-0">
                  <Badge tone="neutral">{c.id}</Badge>
                  <Badge tone="brand">{humanize(c.classification.case_type)}</Badge>
                  <Badge tone={c.classification.urgency_level === "critical" ? "danger" : c.classification.urgency_level === "high" ? "warning" : "info"} className="capitalize">
                    {c.classification.urgency_level}
                  </Badge>
                  <span className="text-muted-foreground">{c.original_request}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState icon={<Beaker className="h-8 w-8" />} title="Run a simulation" description="Pick a scenario and case count, then generate a fictional crisis batch with triage, demand, shortage prediction, and an operational plan." />
      )}
    </div>
  );
}
