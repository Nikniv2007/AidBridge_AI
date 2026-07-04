import { SectionHeading } from "@/components/ui/misc";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resources } from "@/lib/data/mock";
import { defaultSettings } from "@/lib/data/mock";
import { RESOURCE_TYPE_LABELS } from "@/lib/utils/format";
import { Plus, Truck } from "lucide-react";

export default function ResourcesPage() {
  const threshold = defaultSettings.resourceShortageThreshold;

  return (
    <>
      <SectionHeading
        title="Resource Directory"
        description="Food, shelter, transportation, supplies, and partner organizations available for matching."
        action={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add resource
          </Button>
        }
      />

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <THead>
            <TR>
              <TH>Resource</TH>
              <TH>Type</TH>
              <TH>Location</TH>
              <TH>Available</TH>
              <TH>Delivery</TH>
              <TH>Hours</TH>
              <TH>Contact</TH>
            </TR>
          </THead>
          <TBody>
            {resources.map((r) => {
              const low = r.quantityAvailable <= threshold;
              return (
                <TR key={r.id}>
                  <TD>
                    <p className="font-medium">{r.name}</p>
                    <p className="max-w-xs truncate text-xs text-muted-foreground">
                      {r.description}
                    </p>
                  </TD>
                  <TD>
                    <Badge tone="info">{RESOURCE_TYPE_LABELS[r.type]}</Badge>
                  </TD>
                  <TD className="whitespace-nowrap text-sm">
                    {r.city}, {r.state}
                    <div className="text-xs text-muted-foreground">{r.zip}</div>
                  </TD>
                  <TD>
                    <Badge tone={r.quantityAvailable === 0 ? "danger" : low ? "warning" : "success"}>
                      {r.quantityAvailable} {low && r.quantityAvailable > 0 ? "· low" : ""}
                      {r.quantityAvailable === 0 ? "out" : ""}
                    </Badge>
                  </TD>
                  <TD>
                    {r.deliveryAvailable ? (
                      <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                        <Truck className="h-3.5 w-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No</span>
                    )}
                  </TD>
                  <TD className="whitespace-nowrap text-xs text-muted-foreground">{r.hours}</TD>
                  <TD className="whitespace-nowrap text-xs">
                    <p>{r.contactName}</p>
                    <p className="text-muted-foreground">{r.contactPhone}</p>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </div>
    </>
  );
}
