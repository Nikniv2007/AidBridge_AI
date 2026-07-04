import { SectionHeading } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { defaultSettings } from "@/lib/data/mock";
import { SAFETY_DISCLAIMERS } from "@/lib/safety";
import { ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const s = defaultSettings;
  return (
    <>
      <SectionHeading
        title="Admin Settings"
        description="Organization, AI provider, safety rules, and human-review thresholds."
        action={<Button size="sm">Save changes</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Organization name">
              <Input defaultValue={s.organizationName} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prompt version">
                <Input defaultValue={s.promptVersion} readOnly className="font-mono" />
              </Field>
              <Field label="Max volunteer tasks / day">
                <Input type="number" defaultValue={s.maxVolunteerTasksPerDay} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Provider">
              <Select defaultValue={s.aiProvider}>
                <option value="demo">Demo (deterministic, no key)</option>
                <option value="live">Live LLM (custom endpoint)</option>
              </Select>
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Demo mode</p>
                <p className="text-xs text-muted-foreground">
                  Force deterministic mock AI even if keys are present.
                </p>
              </div>
              <Badge tone={s.demoMode ? "brand" : "neutral"}>
                {s.demoMode ? "On" : "Off"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure the endpoint via <code className="rounded bg-muted px-1">.env.local</code>{" "}
              (<code className="rounded bg-muted px-1">LLM_API_URL</code>,{" "}
              <code className="rounded bg-muted px-1">LLM_API_KEY</code>).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Human-review thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Urgency threshold (0–100)">
                <Input type="number" defaultValue={s.humanReviewUrgencyThreshold} />
              </Field>
              <Field label="Confidence threshold (0–1)">
                <Input type="number" step="0.05" defaultValue={s.humanReviewConfidenceThreshold} />
              </Field>
            </div>
            <Field label="Resource shortage threshold">
              <Input type="number" defaultValue={s.resourceShortageThreshold} />
            </Field>
            <p className="text-xs text-muted-foreground">
              Cases above the urgency threshold or below the confidence threshold
              are automatically routed to human review.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Safety rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <p className="text-sm font-medium">Safety rules engine</p>
              <Badge tone={s.safetyRulesEnabled ? "success" : "danger"}>
                {s.safetyRulesEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {SAFETY_DISCLAIMERS.map((d) => (
                <li key={d} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {d}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
