import { SectionHeading } from "@/components/ui/misc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { forecastShortages } from "@/lib/forecasting/shortageForecast";
import { cases, resources } from "@/lib/data/db";
import { humanize } from "@/lib/utils/format";
import { TrendingDown } from "lucide-react";

export const metadata = { title: "Shortage Forecast" };

// Deterministic reference clock for the demo (matches the seed data window).
const NOW = new Date("2026-07-04T14:00:00Z").getTime();

const RISK_TONE = { high: "danger", medium: "warning", low: "success" } as const;

export default function ForecastingPage() {
  const forecasts = forecastShortages({
    cases: cases.map((c) => ({ case_type: c.case_type, created_at: c.created_at })),
    resources: resources.map((r) => ({
      resource_type: r.resource_type,
      available_quantity: r.available_quantity,
      active: r.active,
    })),
    now: NOW,
    lookbackDays: 7,
  });

  const highCount = forecasts.filter((f) => f.shortage_risk === "high").length;

  return (
    <>
      <SectionHeading
        title="Shortage Forecast"
        description="Deterministic 7-day shortage estimate per resource type — current inventory vs. projected demand from recent cases. A transparent heuristic a live deployment would back with historical data."
        action={
          <Badge tone={highCount ? "danger" : "success"}>
            {highCount} high-risk type{highCount === 1 ? "" : "s"}
          </Badge>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Resource type</TH>
                <TH>Current inventory</TH>
                <TH>Projected 7-day demand</TH>
                <TH>Coverage</TH>
                <TH>Risk</TH>
                <TH>Recommended action</TH>
              </TR>
            </THead>
            <TBody>
              {forecasts.map((f) => {
                const coverage = f.projected_7_day_demand
                  ? Math.min(100, Math.round((f.current_inventory / f.projected_7_day_demand) * 100))
                  : 100;
                return (
                  <TR key={f.resource_type}>
                    <TD className="font-medium">{humanize(f.resource_type)}</TD>
                    <TD className="tabular-nums">{f.current_inventory}</TD>
                    <TD className="tabular-nums">{f.projected_7_day_demand}</TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={coverage}
                          className="w-20"
                          indicatorClassName={coverage >= 100 ? "bg-emerald-500" : coverage >= 60 ? "bg-amber-500" : "bg-red-500"}
                        />
                        <span className="text-xs tabular-nums text-muted-foreground">{coverage}%</span>
                      </div>
                    </TD>
                    <TD>
                      <Badge tone={RISK_TONE[f.shortage_risk]} className="capitalize">
                        {f.shortage_risk}
                      </Badge>
                    </TD>
                    <TD className="max-w-sm text-sm text-muted-foreground">{f.recommended_action}</TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <TrendingDown className="mt-0.5 h-4 w-4 shrink-0" />
        Projections extrapolate the last 7 days of demand forward with a 15% buffer. Replace with real historical
        time-series data (documented TODO in <code className="rounded bg-muted px-1">lib/forecasting</code>) for production use.
      </div>
    </>
  );
}
