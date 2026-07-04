import type { IntakeClassification } from "@/lib/ai/schemas/intake.schema";
import type { AiRunMeta } from "@/lib/ai/schemas/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { JsonViewer } from "@/components/ai/json-viewer";
import { AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";
import { humanize } from "@/lib/utils/format";

const URGENCY_TONE: Record<string, "danger" | "warning" | "info" | "neutral"> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
};

export function IntakePanel({
  data,
  meta,
  usedFallback,
}: {
  data: IntakeClassification;
  meta: AiRunMeta;
  usedFallback?: boolean;
}) {
  const pct = Math.round(data.confidence_score * 100);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-500" /> Intake Classification
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge tone={meta.demo_mode ? "neutral" : "brand"}>
            {meta.demo_mode ? "Demo AI" : "Live"}
          </Badge>
          <Badge tone="neutral">{meta.prompt_version}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm">{data.summary}</p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Case type">
            <Badge tone="brand">{humanize(data.case_type)}</Badge>
          </Field>
          <Field label="Urgency">
            <Badge tone={URGENCY_TONE[data.urgency_level]} className="capitalize">
              {data.urgency_level} · {data.urgency_score}
            </Badge>
          </Field>
          <Field label="People">
            <span className="text-sm font-medium">{data.people_affected}</span>
          </Field>
          <Field label="Review">
            {data.human_review_required ? (
              <Badge tone="warning">
                <AlertTriangle className="h-3 w-3" /> Human review
              </Badge>
            ) : (
              <Badge tone="success">
                <ShieldCheck className="h-3 w-3" /> Auto-OK
              </Badge>
            )}
          </Field>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Confidence</span>
          <Progress
            value={pct}
            className="w-28"
            indicatorClassName={pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}
          />
          <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
        </div>

        <TagRow label="Resources needed" items={data.resources_needed} tone="info" />
        {data.vulnerable_population_flags.length > 0 && (
          <TagRow label="Vulnerable population" items={data.vulnerable_population_flags.map(humanize)} tone="purple" />
        )}
        {data.safety_flags.length > 0 && (
          <TagRow label="Safety flags" items={data.safety_flags.map(humanize)} tone="danger" />
        )}
        {data.missing_fields.length > 0 && (
          <TagRow label="Missing fields" items={data.missing_fields} tone="warning" />
        )}

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recommended next steps
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {data.recommended_next_steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        {usedFallback && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            Live output failed validation — safe demo fallback was used and logged for the eval lab.
          </p>
        )}

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Structured JSON
          </p>
          <JsonViewer data={data} />
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function TagRow({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "info" | "purple" | "danger" | "warning";
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <Badge key={it} tone={tone}>
            {it}
          </Badge>
        ))}
      </div>
    </div>
  );
}
