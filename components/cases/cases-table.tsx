"use client";

import * as React from "react";
import Link from "next/link";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Input, Select } from "@/components/ui/input";
import { StatusBadge, UrgencyBadge, HumanReviewBadge } from "@/components/ai/badges";
import { EmptyState } from "@/components/ui/misc";
import { CATEGORY_LABELS, relativeTime } from "@/lib/utils/format";
import { CASE_STATUSES, type Case } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/utils/format";
import { FolderKanban, Search } from "lucide-react";

export function CasesTable({ cases }: { cases: Case[] }) {
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");

  const filtered = cases.filter((c) => {
    const matchesQ =
      !q ||
      c.id.toLowerCase().includes(q.toLowerCase()) ||
      c.intake.requesterName.toLowerCase().includes(q.toLowerCase()) ||
      c.intake.description.toLowerCase().includes(q.toLowerCase());
    const matchesStatus = status === "all" || c.status === status;
    return matchesQ && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by ID, name, or description…"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-56"
        >
          <option value="all">All statuses</option>
          {CASE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8" />}
          title="No cases match your filters"
          description="Try a different search term or status filter."
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <THead>
              <TR>
                <TH>Case</TH>
                <TH>Summary</TH>
                <TH>Category</TH>
                <TH>Urgency</TH>
                <TH>Review</TH>
                <TH>Status</TH>
                <TH>Age</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((c) => (
                <TR key={c.id}>
                  <TD>
                    <Link
                      href={`/dashboard/cases/${c.id}`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      {c.id}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {c.intake.requesterName}
                    </div>
                  </TD>
                  <TD className="max-w-xs">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {c.triage?.summary ?? c.intake.description}
                    </p>
                  </TD>
                  <TD>
                    {c.triage ? CATEGORY_LABELS[c.triage.category] : "—"}
                  </TD>
                  <TD>
                    {c.triage ? (
                      <UrgencyBadge urgency={c.triage.urgency} score={c.triage.urgencyScore} />
                    ) : (
                      "—"
                    )}
                  </TD>
                  <TD>
                    <HumanReviewBadge required={!!c.triage?.humanReviewRequired} />
                  </TD>
                  <TD>
                    <StatusBadge status={c.status} />
                  </TD>
                  <TD className="whitespace-nowrap text-xs text-muted-foreground">
                    {relativeTime(c.createdAt)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );
}
