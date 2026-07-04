"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import type { OutreachResult } from "@/lib/ai/schemas/outreach.schema";
import type { AiRunMeta } from "@/lib/ai/schemas/common";
import { Check, Copy, MessageSquare, ShieldCheck, Wand2 } from "lucide-react";

const AUDIENCES = ["requester", "volunteer", "donor", "partner", "leadership", "community_group"];
const CHANNELS = ["sms", "email", "whatsapp", "announcement"];
const TONES = ["warm", "professional", "urgent", "concise", "community", "formal"];
const LANGUAGES = ["English", "Spanish", "Hindi", "Urdu"];

type Result = OutreachResult & { meta: AiRunMeta };

export function OutreachClient() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Result | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      audience: form.get("audience"),
      channel: form.get("channel"),
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
      setResult((await res.json()) as Result);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!result) return;
    navigator.clipboard?.writeText(
      (result.subject ? `Subject: ${result.subject}\n\n` : "") + result.message,
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
                <Select name="audience" defaultValue="volunteer">
                  {AUDIENCES.map((a) => (
                    <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Channel</Label>
                <Select name="channel" defaultValue="sms">
                  {CHANNELS.map((f) => (
                    <option key={f} value={f}>{f}</option>
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
                <Select name="language" defaultValue="English">
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Context</Label>
              <Textarea
                name="context"
                rows={3}
                placeholder="What's this message about?"
                defaultValue="A food delivery task near Frisco that fits a Saturday morning availability."
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
                <Badge tone={result.meta.demo_mode ? "neutral" : "brand"}>
                  {result.meta.demo_mode ? "Demo AI" : "Live"}
                </Badge>
                <Badge tone="neutral">{result.channel}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.subject && (
                <p className="text-sm">
                  <span className="font-semibold">Subject:</span> {result.subject}
                </p>
              )}
              <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 text-sm">
                {result.message}
              </div>
              {result.safety_notes.length > 0 && (
                <div className="rounded-md bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <p className="mb-1 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" /> Safety notes
                  </p>
                  <ul className="space-y-0.5">
                    {result.safety_notes.map((n, i) => (
                      <li key={i}>• {n}</li>
                    ))}
                  </ul>
                </div>
              )}
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
            description="Choose an audience, channel, tone, and language, then generate a ready-to-send draft that passes the outbound safety gate."
          />
        )}
      </div>
    </div>
  );
}
