import { SectionHeading } from "@/components/ui/misc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { resources } from "@/lib/data/db";
import { humanize, formatDate } from "@/lib/utils/format";
import { Building2, Construction, Truck } from "lucide-react";

export const metadata = { title: "Partner Portal" };

export default function PartnersPage() {
  // Derive partner-style rows from resource data for the scaffold preview.
  const partners = resources.slice(0, 12).map((r, i) => ({
    id: r.id,
    name: r.name,
    resource_type: r.resource_type,
    current_quantity: r.available_quantity,
    hours: (r.hours as any).weekdays ?? "9am–5pm",
    delivery_available: r.delivery_available,
    contact_person: (r.contact_info as any).name ?? "Coordinator",
    last_updated: r.created_at,
    verification_status: i % 4 === 0 ? "pending" : i % 7 === 0 ? "unverified" : "verified",
  }));

  return (
    <>
      <SectionHeading
        title="Partner Portal"
        description="A future self-service portal where partner organizations update their own resource availability."
        action={<Badge tone="warning"><Construction className="h-3 w-3" /> Scaffold / future feature</Badge>}
      />

      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardContent className="flex items-start gap-3 p-5 text-sm">
          <Construction className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">This page is a scaffold.</p>
            <p className="text-muted-foreground">
              In production, partners would authenticate and edit these rows directly (write-back to Supabase with
              row-level security scoped to their organization). Editing is disabled in the demo; the table below
              previews the intended layout using fictional resource data.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Partner / resource</TH>
                <TH>Type</TH>
                <TH>Current qty</TH>
                <TH>Hours</TH>
                <TH>Delivery</TH>
                <TH>Contact</TH>
                <TH>Last updated</TH>
                <TH>Verification</TH>
                <TH>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {partners.map((p) => (
                <TR key={p.id}>
                  <TD className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {p.name}
                    </span>
                  </TD>
                  <TD><Badge tone="info">{humanize(p.resource_type)}</Badge></TD>
                  <TD className="tabular-nums">{p.current_quantity}</TD>
                  <TD className="whitespace-nowrap text-xs text-muted-foreground">{p.hours}</TD>
                  <TD>
                    {p.delivery_available ? (
                      <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Truck className="h-3.5 w-3.5" /> Yes</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No</span>
                    )}
                  </TD>
                  <TD className="whitespace-nowrap text-sm">{p.contact_person}</TD>
                  <TD className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(p.last_updated)}</TD>
                  <TD>
                    <Badge tone={p.verification_status === "verified" ? "success" : p.verification_status === "pending" ? "warning" : "neutral"}>
                      {p.verification_status}
                    </Badge>
                  </TD>
                  <TD>
                    <Button size="sm" variant="outline" disabled>Update</Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
