"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { AiOutputPanel } from "@/components/ai/ai-output-panel";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { StatusBadge } from "@/components/ai/badges";
import { LANGUAGES, type Case } from "@/lib/types";
import { CheckCircle2, Inbox, Send } from "lucide-react";

export function IntakeForm() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Case | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      requesterName: form.get("requesterName"),
      phone: form.get("phone"),
      email: form.get("email"),
      city: form.get("city"),
      state: form.get("state"),
      zip: form.get("zip"),
      description: form.get("description"),
      peopleAffected: Number(form.get("peopleAffected") || 1),
      preferredLanguage: form.get("preferredLanguage"),
      notes: form.get("notes"),
    };

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create case.");
      setResult(data as Case);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-brand-500" /> New request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Requester name" required>
                <Input name="requesterName" required placeholder="Jane Doe" />
              </Field>
              <Field label="Phone">
                <Input name="phone" placeholder="512-555-0100" />
              </Field>
            </div>
            <Field label="Email">
              <Input name="email" type="email" placeholder="jane@example.com" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City" required>
                <Input name="city" required placeholder="Austin" defaultValue="Austin" />
              </Field>
              <Field label="State" required>
                <Input name="state" required placeholder="TX" defaultValue="TX" />
              </Field>
              <Field label="ZIP" required>
                <Input name="zip" required placeholder="78701" defaultValue="78701" />
              </Field>
            </div>
            <Field label="Request description" required>
              <Textarea
                name="description"
                required
                rows={4}
                placeholder="Describe the need in plain language…"
                defaultValue="My elderly neighbor lost power and cannot drive. She needs vegetarian meals delivered today."
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="People affected">
                <Input name="peopleAffected" type="number" min={1} defaultValue={1} />
              </Field>
              <Field label="Preferred language">
                <Select name="preferredLanguage" defaultValue="en">
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Notes">
              <Textarea name="notes" rows={2} placeholder="Optional context for coordinators…" />
            </Field>

            <Button type="submit" disabled={loading}>
              <Send className="h-4 w-4" />
              {loading ? "Creating case…" : "Create & triage case"}
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {result && (
          <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>
                  Case <strong>{result.id}</strong> created for{" "}
                  {result.intake.requesterName}.
                </span>
              </div>
              <StatusBadge status={result.status} />
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ) : result?.triage ? (
          <AiOutputPanel triage={result.triage} />
        ) : (
          <EmptyState
            icon={<Inbox className="h-8 w-8" />}
            title="AI triage result appears here"
            description="Submit a request to see the structured classification, urgency score, safety flags, and next steps."
          />
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
