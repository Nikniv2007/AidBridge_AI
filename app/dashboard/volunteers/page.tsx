import { SectionHeading } from "@/components/ui/misc";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { volunteers } from "@/lib/data/mock";
import { LANGUAGES } from "@/lib/types";
import { assessBurnout } from "@/lib/volunteers/burnout";
import { Car, Plus, AlertTriangle, Flame } from "lucide-react";

const LANG_LABEL = Object.fromEntries(LANGUAGES.map((l) => [l.code, l.label]));

export default function VolunteersPage() {
  const atRisk = volunteers.filter(
    (v) =>
      assessBurnout({
        active_assignments: v.activeAssignments,
        max_tasks_per_day: v.maxTasksPerDay,
        completed_tasks: v.completedTasks,
        reliability_score: v.reliabilityScore,
      }).level !== "ok",
  ).length;

  return (
    <>
      <SectionHeading
        title="Volunteers"
        description="Volunteer roster with skills, languages, availability, reliability, current workload, and burnout protection."
        action={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add volunteer
          </Button>
        }
      />

      {atRisk > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4" />
          {atRisk} volunteer{atRisk === 1 ? "" : "s"} at or above a safe workload — review before assigning more tasks.
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <THead>
            <TR>
              <TH>Volunteer</TH>
              <TH>Location</TH>
              <TH>Skills</TH>
              <TH>Languages</TH>
              <TH>Vehicle</TH>
              <TH>Reliability</TH>
              <TH>Workload</TH>
              <TH>Burnout</TH>
              <TH>Check</TH>
            </TR>
          </THead>
          <TBody>
            {volunteers.map((v) => (
              <TR key={v.id}>
                <TD>
                  <p className="font-medium">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.email}</p>
                </TD>
                <TD className="whitespace-nowrap text-sm">
                  {v.city}, {v.state}
                </TD>
                <TD>
                  <div className="flex flex-wrap gap-1">
                    {v.skills.slice(0, 3).map((s) => (
                      <Badge key={s} tone="neutral">{s}</Badge>
                    ))}
                  </div>
                </TD>
                <TD className="whitespace-nowrap text-sm">
                  {v.languages.map((l) => LANG_LABEL[l]).join(", ")}
                </TD>
                <TD>
                  {v.vehicleAccess ? (
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                      <Car className="h-3.5 w-3.5" /> Yes
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">No</span>
                  )}
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={v.reliabilityScore}
                      className="w-16"
                      indicatorClassName={v.reliabilityScore >= 85 ? "bg-emerald-500" : "bg-amber-500"}
                    />
                    <span className="text-xs tabular-nums">{v.reliabilityScore}</span>
                  </div>
                </TD>
                <TD className="whitespace-nowrap text-sm">
                  <Badge tone={v.activeAssignments >= v.maxTasksPerDay ? "danger" : "success"}>
                    {v.activeAssignments}/{v.maxTasksPerDay} today
                  </Badge>
                  <p className="mt-0.5 text-xs text-muted-foreground">{v.completedTasks} completed</p>
                </TD>
                <TD>
                  {(() => {
                    const b = assessBurnout({
                      active_assignments: v.activeAssignments,
                      max_tasks_per_day: v.maxTasksPerDay,
                      completed_tasks: v.completedTasks,
                      reliability_score: v.reliabilityScore,
                    });
                    if (b.level === "burnout_risk")
                      return <Badge tone="danger"><Flame className="h-3 w-3" /> Burnout risk</Badge>;
                    if (b.level === "warning")
                      return <Badge tone="warning"><AlertTriangle className="h-3 w-3" /> Warning</Badge>;
                    return <Badge tone="success">OK</Badge>;
                  })()}
                </TD>
                <TD>
                  <Badge tone={v.backgroundCheck === "cleared" ? "success" : v.backgroundCheck === "pending" ? "warning" : "neutral"}>
                    {v.backgroundCheck}
                  </Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </>
  );
}
