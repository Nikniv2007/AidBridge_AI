import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SAFETY_DISCLAIMERS } from "@/lib/safety";
import { AlertTriangle, Eye, ShieldCheck, UserCheck, ScrollText, PhoneCall } from "lucide-react";

export const metadata: Metadata = { title: "Safety & limits" };

const PRINCIPLES = [
  {
    icon: PhoneCall,
    title: "Not a replacement for emergency services",
    body: "AidBridge AI does not respond to life-threatening emergencies. For medical, fire, gas, or immediate-danger situations, call 911 (or your local emergency number). The system detects these signals and tells people to do exactly that.",
  },
  {
    icon: AlertTriangle,
    title: "No professional advice",
    body: "It never provides medical, legal, tax, or financial advice. Requests touching these areas are flagged and referred to qualified partners.",
  },
  {
    icon: ShieldCheck,
    title: "No guarantees of aid",
    body: "AidBridge AI helps coordinate — it cannot promise that any specific resource, delivery, or outcome will materialize. Messaging is written to avoid over-promising.",
  },
  {
    icon: UserCheck,
    title: "Humans in the loop",
    body: "AI proposes classifications and matches; people approve them. High-risk and low-confidence cases are automatically routed to human review before any action.",
  },
  {
    icon: AlertTriangle,
    title: "High-risk flagging",
    body: "A deterministic, code-based rules engine (not just the model) scans for medical emergencies, self-harm, domestic violence, unaccompanied minors, and immediate danger — and escalates them.",
  },
  {
    icon: ScrollText,
    title: "Logged for review",
    body: "Every AI output — including provider, model, and prompt version — is recorded in an audit log and continuously scored by the built-in evaluation suite.",
  },
];

export default function SafetyPage() {
  return (
    <MarketingLayout>
      <section className="border-b border-border bg-muted/20">
        <div className="container py-16 text-center">
          <Badge tone="warning" className="mx-auto mb-4">
            <ShieldCheck className="h-3 w-3" /> Responsible AI
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Safety & limits</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            AidBridge AI is decision support for human coordinators. These are the
            boundaries we designed in from day one.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-5 md:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <Card key={p.title}>
              <CardContent className="flex gap-4 p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <p.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-300">
              <PhoneCall className="h-5 w-5" /> In an emergency
            </div>
            <p className="mt-2 text-sm text-red-700/90 dark:text-red-200/90">
              If someone is in immediate danger, call 911 (US) or your local
              emergency number. For mental-health crises in the US, call or text
              988. AidBridge AI is not monitored in real time and must never be
              relied on for emergency response.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 font-semibold">
            <Eye className="h-5 w-5 text-brand-500" /> Our commitments at a glance
          </div>
          <ul className="mt-3 space-y-2">
            {SAFETY_DISCLAIMERS.map((d) => (
              <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </MarketingLayout>
  );
}
