"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { renderMarkdown } from "@/lib/utils/markdown";
import type { Report, ReportType } from "@/lib/types";
import { FileBarChart, Sparkles } from "lucide-react";

const REPORTS: { type: ReportType; title: string; desc: string }[] = [
  { type: "daily_ops", title: "Daily operations", desc: "Today's case flow, review queue, and shortages." },
  { type: "weekly_impact", title: "Weekly impact", desc: "People helped, completions, and trends." },
  { type: "resource_shortage", title: "Resource shortage", desc: "Which resources are low or out of stock." },
  { type: "volunteer_performance", title: "Volunteer performance", desc: "Workload, reliability, and completions." },
  { type: "cases_by_category", title: "Cases by category", desc: "Breakdown of demand by need type." },
  { type: "donor_summary", title: "Donor-friendly summary", desc: "Warm, shareable impact narrative." },
];

export function ReportsClient() {
  const [loading, setLoading] = React.useState<ReportType | null>(null);
  const [report, setReport] = React.useState<Report | null>(null);

  async function generate(type: ReportType) {
    setLoading(type);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type }),
      });
      setReport((await res.json()) as Report);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-1">
        {REPORTS.map((r) => (
          <Card key={r.type}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={loading === r.type}
                onClick={() => generate(r.type)}
              >
                {loading === r.type ? "…" : "Generate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="lg:col-span-2">
        {loading ? (
          <Card>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ) : report ? (
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <Badge tone="brand">
                  <Sparkles className="h-3 w-3" />
                  {report.meta.demoMode ? "Demo AI" : report.meta.provider}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {report.periodLabel} · {report.meta.promptVersion}
                </span>
              </div>
              {report.highlights.length > 0 && (
                <div className="mb-4 grid gap-2 sm:grid-cols-3">
                  {report.highlights.map((h, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
                      {h}
                    </div>
                  ))}
                </div>
              )}
              <div
                className="prose-report"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(report.markdown) }}
              />
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={<FileBarChart className="h-8 w-8" />}
            title="Generate a report"
            description="Pick a report on the left. Output is grounded strictly in your current operational data."
          />
        )}
      </div>
    </div>
  );
}
