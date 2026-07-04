import { notFound } from "next/navigation";
import Link from "next/link";
import { cases, getResource, getVolunteer } from "@/lib/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/misc";
import { AiOutputPanel } from "@/components/ai/ai-output-panel";
import { Timeline } from "@/components/cases/timeline";
import { StatusBadge } from "@/components/ai/badges";
import { formatDateTime } from "@/lib/utils/format";
import {
  ArrowLeft,
  Boxes,
  Combine,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  UserPlus,
  Users,
} from "lucide-react";

export function generateStaticParams() {
  return cases.map((c) => ({ id: c.id }));
}

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const c = cases.find((x) => x.id === params.id);
  if (!c) notFound();

  const volunteer = c.assignedVolunteerId ? getVolunteer(c.assignedVolunteerId) : null;
  const resource = c.matchedResourceId ? getResource(c.matchedResourceId) : null;

  return (
    <>
      <div className="flex items-center gap-3">
        <Link href="/dashboard/cases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            {c.id} <StatusBadge status={c.status} />
          </h1>
          <p className="text-sm text-muted-foreground">
            Opened {formatDateTime(c.createdAt)} · {c.intake.city}, {c.intake.state}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Link href="/dashboard/matching">
            <Button variant="outline" size="sm"><Combine className="h-4 w-4" /> Match resources</Button>
          </Link>
          <Link href="/dashboard/assignments">
            <Button variant="outline" size="sm"><UserPlus className="h-4 w-4" /> Assign volunteer</Button>
          </Link>
          <Link href="/dashboard/outreach">
            <Button size="sm"><MessageSquare className="h-4 w-4" /> Outreach</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Original request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="rounded-lg bg-muted/50 p-4 text-sm italic">
                “{c.intake.description}”
              </p>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <Info icon={<Users className="h-4 w-4" />} label="Requester" value={c.intake.requesterName} />
                <Info icon={<Users className="h-4 w-4" />} label="People affected" value={String(c.intake.peopleAffected)} />
                {c.intake.phone && <Info icon={<Phone className="h-4 w-4" />} label="Phone" value={c.intake.phone} />}
                {c.intake.email && <Info icon={<Mail className="h-4 w-4" />} label="Email" value={c.intake.email} />}
                <Info icon={<MapPin className="h-4 w-4" />} label="Location" value={`${c.intake.city}, ${c.intake.state} ${c.intake.zip}`} />
                <Info icon={<MessageSquare className="h-4 w-4" />} label="Language" value={c.intake.preferredLanguage.toUpperCase()} />
              </div>
              {c.intake.notes && (
                <>
                  <Separator />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Notes: </span>
                    {c.intake.notes}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {c.triage && <AiOutputPanel triage={c.triage} />}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> Volunteer
                </p>
                {volunteer ? (
                  <div>
                    <p className="font-medium">{volunteer.name}</p>
                    <p className="text-muted-foreground">{volunteer.phone}</p>
                    <Badge tone="success" className="mt-1">Reliability {volunteer.reliabilityScore}</Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not yet assigned.</p>
                )}
              </div>
              <Separator />
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                  <Boxes className="h-3.5 w-3.5" /> Matched resource
                </p>
                {resource ? (
                  <div>
                    <p className="font-medium">{resource.name}</p>
                    <p className="text-muted-foreground">{resource.city}, {resource.state}</p>
                    <Badge tone={resource.quantityAvailable > 0 ? "brand" : "danger"} className="mt-1">
                      {resource.quantityAvailable} available
                    </Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not yet matched.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline & audit log</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={c.timeline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
