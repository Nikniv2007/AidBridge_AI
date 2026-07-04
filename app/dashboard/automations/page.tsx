import { SectionHeading } from "@/components/ui/misc";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { automationRuns } from "@/lib/data/mock";
import { formatDateTime, humanize } from "@/lib/utils/format";
import type { AutomationRun } from "@/lib/types";

const STATUS_TONE: Record<AutomationRun["status"], "success" | "danger" | "warning" | "info"> = {
  success: "success",
  failed: "danger",
  partial: "warning",
  running: "info",
};

function duration(run: AutomationRun): string {
  if (!run.completedAt) return "running…";
  const ms = new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime();
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`;
}

export default function AutomationsPage() {
  return (
    <>
      <SectionHeading
        title="Automation Logs"
        description="Audit trail for CSV imports, duplicate detection, AI triage, reports, low-stock alerts, reminders, and eval runs."
      />

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <THead>
            <TR>
              <TH>Automation</TH>
              <TH>Status</TH>
              <TH>Started</TH>
              <TH>Duration</TH>
              <TH>Records</TH>
              <TH>Errors</TH>
              <TH>Summary</TH>
            </TR>
          </THead>
          <TBody>
            {automationRuns.map((run) => (
              <TR key={run.id}>
                <TD className="whitespace-nowrap font-medium">{humanize(run.name)}</TD>
                <TD>
                  <Badge tone={STATUS_TONE[run.status]} className="capitalize">
                    {run.status}
                  </Badge>
                </TD>
                <TD className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatDateTime(run.startedAt)}
                </TD>
                <TD className="whitespace-nowrap text-sm tabular-nums">{duration(run)}</TD>
                <TD className="tabular-nums">{run.recordsProcessed}</TD>
                <TD>
                  {run.errors > 0 ? (
                    <Badge tone="danger">{run.errors}</Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TD>
                <TD className="max-w-sm text-sm text-muted-foreground">{run.summary}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </>
  );
}
