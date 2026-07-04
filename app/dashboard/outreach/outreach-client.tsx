"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { LANGUAGES, type OutreachOutput } from "@/lib/types";
import { Check, Copy, MessageSquare, Wand2 } from "lucide-react";

const AUDIENCES = ["requester", "volunteer", "donor", "partner", "leadership", "community_group"];
const FORMATS = ["sms", "email", "whatsapp", "announcement", "volunteer_instructions", "donor_update", "partner_request"];
const TONES = ["warm", "professional", "urgent", "concise", "community", "formal"];

export function OutreachClient() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<OutreachOutput | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      audience: form.get("audience"),
      format: form.get("format"),
      tone: form.get("tone"),
      language: form.get("language"),
      context: form.get("context") ?? "",
    };
    try {
      const res = await fetch("/api/ai/outreach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data as OutreachOutput);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!result) return;
    navigator.clipboard?.writeText(
      (result.subject ? `Subject: ${result.subject}\n\n` : "") + result.body,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand-500" /> Compose
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select name="audience" defaultValue="requester">
                  {AUDIENCES.map((a) => (
                    <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Format</Label>
                <Select name="format" defaultValue="sms">
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>{f.replace(/_/g, " ")}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select name="tone" defaultValue="warm">
                  {TONES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Select name="language" defaultValue="en">
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Context</Label>
              <Textarea
                name="context"
                rows={3}
                placeholder="What's this message about? e.g. 'Confirming a same-day vegetarian meal delivery for case CASE-0001.'"
                defaultValue="Confirming a same-day vegetarian meal delivery for an elderly resident."
              />
            </div>
            <Button type="submit" disabled={loading}>
              <Wand2 className="h-4 w-4" />
              {loading ? "Generating…" : "Generate message"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        {loading ? (
          <Card>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ) : result ? (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Generated message</CardTitle>
              <div className="flex items-center gap-2">
                <Badge tone={result.meta.demoMode ? "neutral" : "brand"}>
                  {result.meta.demoMode ? "Demo AI" : result.meta.provider}
                </Badge>
                <Badge tone="neutral">{result.wordCount} words</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.subject && (
                <p className="text-sm">
                  <span className="font-semibold">Subject:</span> {result.subject}
                </p>
              )}
              <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 text-sm">
                {result.body}
              </div>
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy message"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={<MessageSquare className="h-8 w-8" />}
            title="Your message appears here"
            description="Choose an audience, format, tone, and language, then generate a ready-to-send draft."
          />
        )}
      </div>
    </div>
  );
}
