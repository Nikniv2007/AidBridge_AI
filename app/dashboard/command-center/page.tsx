import { SectionHeading } from "@/components/ui/misc";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/charts/bar-chart";
import { Donut } from "@/components/charts/donut";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  commandCenterStats,
  casesByUrgency,
  casesByCategory,
  casesByCity,
  volunteerWorkload,
  resourceShortages,
  evalPassRate,
} from "@/lib/data/metrics";
import { CATEGORY_LABELS } from "@/lib/utils/format";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  FolderKanban,
  Flame,
  ShieldAlert,
  Users,
  Workflow,
  XCircle,
  Gauge,
} from "lucide-react";

export default function CommandCenterPage() {
  const s = commandCenterStats();
  const urgency = casesByUrgency();
  const categories = casesByCategory();
  const cities = casesByCity();
  const workload = volunteerWorkload();
  const shortages = resourceShortages();
  const evals = evalPassRate();

  const urgencyColors = ["text-red-500", "text-amber-500", "text-sky-500", "text-slate-400"];

  return (
    <>
      <SectionHeading
        title="Command Center"
        description="Real-time overview of community aid operations."
        action={<Badge tone="brand">Demo data · live-mode ready</Badge>}
      />

      {/* Stat grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Active cases" value={s.activeCases} tone="brand" icon={<FolderKanban className="h-4 w-4" />} />
        <StatCard label="Critical" value={s.criticalCases} tone="danger" icon={<Flame className="h-4 w-4" />} />
        <StatCard label="High urgency" value={s.highUrgencyCases} tone="warning" icon={<AlertTriangle className="h-4 w-4" />} />
        <StatCard label="Needs review" value={s.needsReview} tone="warning" icon={<ShieldAlert className="h-4 w-4" />} />
        <StatCard label="Unmatched" value={s.unmatched} tone="default" icon={<Boxes className="h-4 w-4" />} />
        <StatCard label="Available volunteers" value={s.availableVolunteers} tone="success" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Completed today" value={s.completedToday} tone="success" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="AI validation fails" value={s.aiValidationFailures} tone="danger" icon={<XCircle className="h-4 w-4" />} />
        <StatCard label="Resource shortages" value={s.resourceShortages} tone="warning" icon={<Boxes className="h-4 w-4" />} />
        <StatCard label="Open automations" value={s.openAutomationRuns} tone="default" icon={<Workflow className="h-4 w-4" />} />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cases by urgency</CardTitle>
          </CardHeader>
          <CardContent>
            <Donut
              slices={urgency.map((u, i) => ({
                label: u.label,
                value: u.value,
                colorClass: urgencyColors[i],
              }))}
              centerValue={String(urgency.reduce((a, b) => a + b.value, 0))}
              centerLabel="cases"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases by category</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              colorByIndex
              data={categories.map((c) => ({
                label: CATEGORY_LABELS[c.label],
                value: c.value,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases by city</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={cities} />
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Volunteer workload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workload.map((w) => (
              <div key={w.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{w.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {w.value}/{w.max}
                  </span>
                </div>
                <Progress
                  value={(w.value / w.max) * 100}
                  indicatorClassName={
                    w.value >= w.max ? "bg-red-500" : w.value / w.max > 0.6 ? "bg-amber-500" : "bg-emerald-500"
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource shortages</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={shortages} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-brand-500" /> AI eval pass rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-2">
              <Donut
                slices={[
                  { label: "pass", value: evals.pass, colorClass: "text-emerald-500" },
                  { label: "fail", value: evals.fail, colorClass: "text-red-500" },
                ]}
                centerValue={`${evals.rate}%`}
                centerLabel="passing"
              />
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Last suite run: {evals.pass}/{evals.pass + evals.fail} passed.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
