import { SectionHeading } from "@/components/ui/misc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  StatusBadge,
  UrgencyBadge,
  HumanReviewBadge,
  ConfidenceBar,
} from "@/components/ai/badges";
import { cases } from "@/lib/data/mock";
import { CATEGORY_LABELS, relativeTime } from "@/lib/utils/format";
import Link from "next/link";
import {
  CheckCircle2,
  Combine,
  MessageSquare,
  Pencil,
  ShieldAlert,
} from "lucide-react";

export default function TriagePage() {
  // Newly triaged cases awaiting a coordinator decision.
  const queue = cases.filter((c) =>
    ["ai_triaged", "needs_human_review", "new"].includes(c.status),
  );

  return (
    <>
      <SectionHeading
        title="AI Triage Queue"
        description="Newly triaged cases awaiting coordinator approval. Human review is enforced for safety-critical and low-confidence cases."
        action={<Badge tone="warning">{queue.length} in queue</Badge>}
      />

      <div className="space-y-4">
        {queue.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/cases/${c.id}`}
                      className="font-semibold text-brand-600 hover:underline"
                    >
                      {c.id}
                    </Link>
                    <StatusBadge status={c.status} />
                    {c.triage && (
                      <Badge tone="brand">{CATEGORY_LABELS[c.triage.category]}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {c.triage?.summary ?? c.intake.description}
                  </p>
                  {c.triage && (
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <UrgencyBadge urgency={c.triage.urgency} score={c.triage.urgencyScore} />
                      <HumanReviewBadge required={c.triage.humanReviewRequired} />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confidence</span>
                        <ConfidenceBar value={c.triage.confidence} />
                      </div>
                    </div>
                  )}
                  {c.triage?.safetyFlags.length ? (
                    <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      {c.triage.safetyFlags.length} safety flag(s):{" "}
                      {c.triage.safetyFlags.map((f) => f.code.replace(/_/g, " ")).join(", ")}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline"><CheckCircle2 className="h-4 w-4" /> Approve</Button>
                  <Button size="sm" variant="outline"><ShieldAlert className="h-4 w-4" /> Human review</Button>
                  <Button size="sm" variant="outline"><Pencil className="h-4 w-4" /> Edit</Button>
                  <Link href="/dashboard/matching">
                    <Button size="sm" variant="outline" className="w-full"><Combine className="h-4 w-4" /> Match</Button>
                  </Link>
                  <Link href="/dashboard/outreach">
                    <Button size="sm" className="w-full"><MessageSquare className="h-4 w-4" /> Outreach</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
