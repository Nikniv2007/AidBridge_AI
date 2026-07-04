import Link from "next/link";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Boxes,
  BrainCircuit,
  ClipboardList,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "AI triage & urgency scoring",
    body: "Turn a paragraph of plain text into a structured case with category, urgency score, safety flags, and next steps.",
  },
  {
    icon: Boxes,
    title: "Explainable resource matching",
    body: "Rank food, shelter, transport, and supplies by type, distance, availability, and delivery — with human-readable reasons.",
  },
  {
    icon: Users,
    title: "Smart volunteer assignment",
    body: "Recommend volunteers by location, language, skills, vehicle access, reliability, and daily workload caps.",
  },
  {
    icon: MessageSquare,
    title: "Multilingual outreach",
    body: "Generate SMS, email, and WhatsApp-ready messages in English, Spanish, Hindi, and Urdu, in the right tone.",
  },
  {
    icon: Workflow,
    title: "Automation & parsers",
    body: "Import CSV rosters and inventory, detect duplicates, and run scheduled jobs with full audit logs.",
  },
  {
    icon: ShieldCheck,
    title: "AI evaluations built in",
    body: "A regression harness scores JSON validity, classification accuracy, safety compliance, and review routing.",
  },
];

const STEPS = [
  "Intake request",
  "AI triage",
  "Urgency scoring",
  "Resource matching",
  "Volunteer assignment",
  "Outreach",
  "Case tracking",
  "Reporting",
  "AI evaluation",
];

export default function HomePage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
        <div className="container relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge tone="brand" className="mx-auto mb-5">
              <Sparkles className="h-3 w-3" /> Public-interest AI operations
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              AidBridge AI turns messy community needs into{" "}
              <span className="text-brand-500">structured, actionable</span> aid
              workflows.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              Built for nonprofits, schools, city teams, and volunteer
              organizations that need to intake requests, match resources,
              coordinate people, and measure impact faster.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/demo">
                <Button size="lg" className="w-full sm:w-auto">
                  Try the live demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/command-center">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Open the dashboard
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Fully usable with no API keys — deterministic demo AI is built in.
            </p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-border bg-muted/20">
        <div className="container grid gap-8 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              The problem
            </h2>
            <p className="mt-3 text-muted-foreground">
              When a storm hits or a food drive spins up, requests pour in as
              texts, emails, spreadsheets, and voicemails. Coordinators
              hand-triage each one, re-key data across tools, and lose track of
              who needs what — right when speed matters most.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              The AidBridge approach
            </h2>
            <p className="mt-3 text-muted-foreground">
              A single intake becomes a structured, trackable case. AI proposes a
              classification, urgency score, safety flags, and matches — but a
              human always approves high-risk and low-confidence decisions.
              Every AI output is logged and continuously evaluated.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            An AI operations system, not a chatbot
          </h2>
          <p className="mt-3 text-muted-foreground">
            Nine connected workflows, structured JSON at every step, and a
            human in the loop by design.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-muted/20">
        <div className="container py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              From a single message to a coordinated, measurable response.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
                    {i + 1}
                  </span>
                  {s}
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 text-muted-foreground lg:block" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/how-it-works">
              <Button variant="outline">
                See the full workflow <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo preview cards */}
      <section className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            See a request become a case
          </h2>
          <p className="mt-3 text-muted-foreground">
            Paste something as messy as a real request — AidBridge structures it.
          </p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="h-4 w-4" /> Incoming request
              </div>
              <p className="mt-3 rounded-lg bg-muted/50 p-4 text-sm italic">
                “My elderly grandmother lost power and cannot drive. She needs
                vegetarian meals delivered today.”
              </p>
            </CardContent>
          </Card>
          <Card className="border-brand-200 dark:border-brand-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-600">
                <Sparkles className="h-4 w-4" /> Structured output
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <Row k="Category" v="food" />
                <Row k="Urgency" v="high · 68" />
                <Row k="Needed" v="food pantry, donation pickup" />
                <Row k="Human review" v="No — high confidence" />
                <Row k="Next step" v="Match same-day vegetarian delivery" />
              </div>
              <Link href="/demo">
                <Button size="sm" className="mt-4">
                  Run it yourself <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="container py-16">
          <Card className="overflow-hidden border-brand-200 bg-brand-500 text-white dark:border-brand-800">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <ClipboardList className="h-10 w-10" />
              <h2 className="text-2xl font-semibold">
                Coordinate aid with clarity and care.
              </h2>
              <p className="max-w-xl text-brand-50">
                Explore the full operations dashboard — command center, cases,
                matching, volunteers, outreach, reports, and an AI evaluation lab.
              </p>
              <Link href="/dashboard/command-center">
                <Button size="lg" variant="secondary">
                  Open the dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-1.5 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
