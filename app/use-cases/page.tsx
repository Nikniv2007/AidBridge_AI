import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  GraduationCap,
  HeartHandshake,
  Landmark,
  LifeBuoy,
  Church,
  Users,
  Utensils,
} from "lucide-react";

export const metadata: Metadata = { title: "Use cases" };

const USE_CASES = [
  {
    icon: Utensils,
    title: "Food banks",
    body: "Intake meal requests, flag dietary and delivery needs, match pantries with stock, and dispatch drivers — while tracking inventory shortages.",
    tags: ["Meal delivery", "Inventory", "Dietary needs"],
  },
  {
    icon: GraduationCap,
    title: "Schools",
    body: "Run school-supply and clothing drives, triage family needs confidentially, and coordinate volunteers around class schedules.",
    tags: ["Supply drives", "Family support", "Confidentiality"],
  },
  {
    icon: LifeBuoy,
    title: "Disaster response teams",
    body: "During storms and outages, convert a flood of requests into prioritized cases, escalate life-safety situations, and coordinate shelter and transport.",
    tags: ["Storm recovery", "Escalation", "Shelter"],
  },
  {
    icon: Users,
    title: "Volunteer organizations",
    body: "Parse volunteer rosters from CSVs, match people to tasks by skills and availability, and auto-draft assignment instructions.",
    tags: ["Roster parsing", "Dispatch", "Reminders"],
  },
  {
    icon: Landmark,
    title: "City departments",
    body: "Give 211-style teams a structured intake and reporting layer with audit logs and human-review thresholds for accountability.",
    tags: ["211 intake", "Audit logs", "Reporting"],
  },
  {
    icon: HeartHandshake,
    title: "Community nonprofits",
    body: "Manage cases end to end — from request to resolution — with explainable matching and donor-ready impact summaries.",
    tags: ["Case management", "Impact", "Donors"],
  },
  {
    icon: Church,
    title: "Religious & community groups",
    body: "Coordinate mutual-aid efforts in multiple languages, keep sensitive requests private, and share weekly updates with the congregation.",
    tags: ["Mutual aid", "Multilingual", "Updates"],
  },
  {
    icon: Building2,
    title: "Student service organizations",
    body: "Run campus and neighborhood drives, log service hours implicitly through assignments, and produce clean reports for advisors.",
    tags: ["Campus drives", "Service hours", "Advisor reports"],
  },
];

export default function UseCasesPage() {
  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="container py-16 text-center">
          <Badge tone="brand" className="mx-auto mb-4">
            Who it's for
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Use cases</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            One flexible operations layer for the many shapes of community aid.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {USE_CASES.map((u) => (
            <Card key={u.title} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                    <u.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{u.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{u.body}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {u.tags.map((t) => (
                        <Badge key={t} tone="neutral">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
