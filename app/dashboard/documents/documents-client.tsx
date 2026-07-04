"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { FileUp, Upload } from "lucide-react";

const SAMPLE_CSV = `name,email,phone,city,skills,languages,vehicle_access,max_tasks_per_day,reliability_score
Aisha Rahman,aisha.r@example.org,512-555-0301,Austin,"driving,translation",en;ur;hi,true,3,94
Carlos Mendez,carlos.m@example.org,512-555-0302,Austin,"driving,lifting",en;es,true,4,88
Emily Chen,emily.c@example.org,512-555-0303,Round Rock,coordination,en,false,2,76`;

interface UploadResult {
  filename: string;
  datasetType: string;
  headers: string[];
  rowCount: number;
  preview: Record<string, string>[];
  errors: string[];
}

export function DocumentsClient() {
  const [content, setContent] = React.useState(SAMPLE_CSV);
  const [result, setResult] = React.useState<UploadResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setContent(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  async function parse() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: "upload.csv", content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to parse.");
      setResult(data as UploadResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-4 w-4 text-brand-500" /> Import CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
            <Upload className="h-4 w-4" />
            Choose .csv file
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
          </label>
          <span className="text-xs text-muted-foreground">or paste content below</span>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="font-mono text-xs"
        />

        <div className="flex items-center gap-3">
          <Button onClick={parse} disabled={loading}>
            {loading ? "Parsing…" : "Parse & preview"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {result && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">Detected: {result.datasetType}</Badge>
              <Badge tone="neutral">{result.rowCount} rows</Badge>
              <Badge tone="neutral">{result.headers.length} columns</Badge>
              {result.errors.length > 0 ? (
                <Badge tone="danger">{result.errors.length} warnings</Badge>
              ) : (
                <Badge tone="success">Clean</Badge>
              )}
            </div>

            <div className="rounded-lg border border-border">
              <Table>
                <THead>
                  <TR>
                    {result.headers.map((h) => (
                      <TH key={h}>{h}</TH>
                    ))}
                  </TR>
                </THead>
                <TBody>
                  {result.preview.map((row, i) => (
                    <TR key={i}>
                      {result.headers.map((h) => (
                        <TD key={h} className="whitespace-nowrap text-xs">
                          {row[h]}
                        </TD>
                      ))}
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>

            {result.errors.length > 0 && (
              <ul className="space-y-1 text-xs text-amber-600">
                {result.errors.map((e, i) => (
                  <li key={i}>⚠ {e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
