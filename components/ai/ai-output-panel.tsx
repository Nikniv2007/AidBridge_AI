import type { TriageOutput } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "@/components/ai/json-viewer";
import {
  ConfidenceBar,
  HumanReviewBadge,
  UrgencyBadge,
} from "@/components/ai/badges";
import { CATEGORY_LABELS, RESOURCE_TYPE_LABELS } from "@/lib/utils/format";
import { AlertTriangle, Sparkles } from "lucide-react";

export function AiOutputPanel({ triage }: { triage: TriageOutput }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-500" /> AI Triage Output
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge tone={triage.meta.demoMode ? "neutral" : "brand"}>
            {triage.meta.demoMode ? "Demo AI" : triage.meta.provider}
          </Badge>
          <Badge tone="neutral">{triage.meta.promptVersion}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm">{triage.summary}</p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Category">
            <Badge tone="brand">{CATEGORY_LABELS[triage.category]}</Badge>
          </Field>
          <Field label="Urgency">
            <UrgencyBadge urgency={triage.urgency} score={triage.urgencyScore} />
          </Field>
          <Field label="Confidence">
            <ConfidenceBar value={triage.confidence} />
          </Field>
          <Field label="Review">
            <HumanReviewBadge required={triage.humanReviewRequired} />
          </Field>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Needed resources
          </p>
          <div className="flex flex-wrap gap-1.5">
            {triage.neededResources.map((r) => (
              <Badge key={r} tone="info">
                {RESOURCE_TYPE_LABELS[r]}
              </Badge>
            ))}
          </div>
        </div>

        {triage.safetyFlags.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" /> Safety flags
            </p>
            <ul className="space-y-2">
              {triage.safetyFlags.map((f) => (
                <li key={f.code} className="text-sm">
                  <span className="font-medium capitalize">
                    {f.code.replace(/_/g, " ")}
                  </span>{" "}
                  <Badge
                    tone={
                      f.severity === "critical"
                        ? "danger"
                        : f.severity === "warning"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {f.severity}
                  </Badge>
                  <p className="text-muted-foreground">{f.message}</p>
                  <p className="text-xs text-muted-foreground">
                    → {f.recommendedAction}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested next steps
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {triage.suggestedNextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Structured JSON
          </p>
          <JsonViewer data={triage} />
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
