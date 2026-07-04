import { SectionHeading } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentsClient } from "./documents-client";
import { FileSpreadsheet, FileText, Info } from "lucide-react";

export default function DocumentsPage() {
  return (
    <>
      <SectionHeading
        title="Document Uploads"
        description="Import CSV rosters, inventory sheets, and partner lists. Paste content or upload a file to preview and validate."
      />

      <DocumentsClient />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> CSV parsing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Fully supported. Handles quoted fields, escaped quotes, and embedded
            commas. Auto-detects volunteers, resources, and cases datasets.
            <Badge tone="success" className="mt-2">Ready</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-amber-600" /> PDF parsing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Placeholder. Planned via a server-side extraction step (e.g.
            pdf-parse) feeding the same normalization pipeline.
            <Badge tone="warning" className="mt-2">TODO</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 text-amber-600" /> Excel (.xlsx)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Placeholder. Planned via SheetJS on upload, converting each sheet to
            the CSV pipeline.
            <Badge tone="warning" className="mt-2">TODO</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Uploaded files are parsed in-memory for this demo. File storage via
        Supabase Storage and row persistence are documented TODOs in{" "}
        <code className="rounded bg-muted px-1">lib/supabase</code>.
      </div>
    </>
  );
}
