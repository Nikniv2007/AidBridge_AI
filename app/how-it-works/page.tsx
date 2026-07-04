import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "How it works" };

const STEPS = [
  {
    n: 1,
    title: "Intake request",
    body: "A coordinator or community member submits a request in plain language — by form, forwarded text, or CSV import. No rigid template required.",
  },
  {
    n: 2,
    title: "AI triage",
    body: "AidBridge classifies the request into a structured case: category, secondary categories, needed resources, and detected language — returned as validated JSON.",
  },
  {
    n: 3,
    title: "Urgency scoring",
    body: "A deterministic scorer combines category, time-sensitivity signals, vulnerability, and people affected into a 0–100 score and an urgency band.",
  },
  {
    n: 4,
    title: "Resource matching",
    body: "Available resources are ranked by type fit, distance, availability, delivery, and eligibility — each match ships with human-readable reasons.",
  },
  {
    n: 5,
    title: "Volunteer assignment",
    body: "Volunteers are recommended by location, language, skills, vehicle access, reliability, and remaining daily capacity.",
  },
  {
    n: 6,
    title: "Outreach generation",
    body: "Draft messages for requesters, volunteers, donors, and partners — in the right format, tone, and language — always reviewable before sending.",
  },
  {
    n: 7,
    title: "Case tracking",
    body: "Every case carries a timeline, notes, assigned volunteer, matched resource, and a full audit log of AI outputs and human decisions.",
  },
  {
    n: 8,
    title: "Reporting",
    body: "Generate daily ops, weekly impact, resource-shortage, and donor-friendly reports grounded strictly in your operational data.",
  },
  {
    n: 9,
    title: "AI evaluation",
    body: "A built-in eval lab continuously scores JSON validity, classification and urgency accuracy, safety compliance, and human-review routing.",
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="container py-16 text-center">
          <Badge tone="brand" className="mx-auto mb-4">
            The workflow
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">How AidBridge AI works</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Nine connected steps take a request from messy text to a
            coordinated, measurable, human-supervised response.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="mx-auto max-w-3xl space-y-5">
          {STEPS.map((s) => (
            <Card key={s.n}>
              <CardContent className="flex gap-5 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-lg font-semibold text-white">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-lg border border-border bg-muted/30 p-6">
          <h3 className="font-semibold">Humans stay in the loop</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            AI proposes; people decide. Critical safety flags and low-confidence
            classifications are automatically routed to human review before any
            action is taken. AidBridge AI never dispatches aid autonomously and
            never replaces emergency services.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
