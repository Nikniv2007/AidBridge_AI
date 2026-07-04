import { SectionHeading } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart } from "@/components/charts/bar-chart";
import { cases, resources, volunteers } from "@/lib/data/db";
import { humanize } from "@/lib/utils/format";
import { MapPin, Boxes, Users, AlertTriangle } from "lucide-react";

export const metadata = { title: "Map View" };

const CLOSED = new Set(["completed", "closed", "unable_to_fulfill"]);

export default function MapPage() {
  // Aggregate by city.
  const cityMap = new Map<
    string,
    { cases: number; critical: number; unmatched: number; resources: number; volunteers: number; zips: Set<string> }
  >();
  const ensure = (city: string) => {
    if (!cityMap.has(city))
      cityMap.set(city, { cases: 0, critical: 0, unmatched: 0, resources: 0, volunteers: 0, zips: new Set() });
    return cityMap.get(city)!;
  };

  for (const c of cases) {
    const e = ensure(c.city);
    e.cases++;
    e.zips.add(c.zip);
    if (c.urgency_level === "critical") e.critical++;
    if (!CLOSED.has(c.status) && !c.matched_resource_id) e.unmatched++;
  }
  for (const r of resources) ensure(r.city).resources++;
  for (const v of volunteers) if (v.active) ensure(v.city).volunteers++;

  const cities = [...cityMap.entries()].sort((a, b) => b[1].cases - a[1].cases);

  // Urgency by ZIP (top ZIPs by critical/high count).
  const zipMap = new Map<string, number>();
  for (const c of cases) {
    if (c.urgency_level === "critical" || c.urgency_level === "high") {
      zipMap.set(c.zip, (zipMap.get(c.zip) ?? 0) + 1);
    }
  }
  const zipData = [...zipMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <>
      <SectionHeading
        title="Map View"
        description="Geographic overview by city and ZIP. A clean location-card visualization stands in for a live map (no map API key required)."
        action={<Badge tone="neutral">Mock map · location cards</Badge>}
      />

      {/* Location cards grid = the "map" */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map(([city, e]) => (
          <Card key={city} className="overflow-hidden">
            <div className="grid-bg h-20 border-b border-border bg-brand-50/40 dark:bg-brand-950/20" />
            <CardContent className="-mt-8 p-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-semibold shadow-sm">
                <MapPin className="h-4 w-4 text-brand-500" /> {city}
                <span className="text-xs font-normal text-muted-foreground">
                  {e.zips.size} ZIP{e.zips.size > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Cases" value={e.cases} />
                <Stat label="Critical" value={e.critical} tone="danger" />
                <Stat label="Unmatched" value={e.unmatched} tone="warning" />
                <Stat label="Resources" value={e.resources} icon={<Boxes className="h-3.5 w-3.5" />} />
                <Stat label="Volunteers" value={e.volunteers} icon={<Users className="h-3.5 w-3.5" />} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Urgency hotspots by ZIP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart colorByIndex data={zipData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource coverage by type</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={aggregateResourceTypes(resources).map((r) => ({
                label: humanize(r.type),
                value: r.count,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function aggregateResourceTypes(rs: typeof resources) {
  const m = new Map<string, number>();
  for (const r of rs) if (r.active) m.set(r.resource_type, (m.get(r.resource_type) ?? 0) + 1);
  return [...m.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
}

function Stat({
  label,
  value,
  tone = "default",
  icon,
}: {
  label: string;
  value: number;
  tone?: "default" | "danger" | "warning";
  icon?: React.ReactNode;
}) {
  const color =
    tone === "danger" ? "text-red-600 dark:text-red-400" : tone === "warning" ? "text-amber-600 dark:text-amber-400" : "";
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon} {label}
      </p>
      <p className={`text-lg font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
