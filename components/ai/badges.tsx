import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CaseStatus, Urgency } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/utils/format";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function UrgencyBadge({ urgency, score }: { urgency: Urgency; score?: number }) {
  const tone =
    urgency === "critical"
      ? "danger"
      : urgency === "high"
        ? "warning"
        : urgency === "moderate"
          ? "info"
          : "neutral";
  return (
    <Badge tone={tone as any} className="capitalize">
      {urgency}
      {typeof score === "number" && (
        <span className="opacity-70">· {score}</span>
      )}
    </Badge>
  );
}

const STATUS_TONE: Record<CaseStatus, string> = {
  new: "neutral",
  ai_triaged: "info",
  needs_human_review: "warning",
  matched: "brand",
  volunteer_assigned: "brand",
  contacted: "info",
  in_progress: "purple",
  completed: "success",
  unable_to_fulfill: "danger",
  escalated: "danger",
  closed: "neutral",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <Badge tone={STATUS_TONE[status] as any}>{STATUS_LABELS[status]}</Badge>
  );
}

export function HumanReviewBadge({ required }: { required: boolean }) {
  if (!required) {
    return (
      <Badge tone="success">
        <ShieldCheck className="h-3 w-3" /> Auto-OK
      </Badge>
    );
  }
  return (
    <Badge tone="warning">
      <AlertTriangle className="h-3 w-3" /> Human review
    </Badge>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} indicatorClassName={tone} className="w-20" />
      <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
    </div>
  );
}

export function ValidationChip({ pass }: { pass: boolean }) {
  return pass ? (
    <Badge tone="success">Pass</Badge>
  ) : (
    <Badge tone="danger">Fail</Badge>
  );
}
