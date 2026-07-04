/**
 * Minimal, dependency-free CSV parser + dataset detector.
 *
 * Handles quoted fields, escaped quotes, and commas inside quotes — enough for
 * real-world roster/inventory exports. Mirrors the Python parser in
 * `scripts/parse_csv.py` so behaviour is consistent across the TS API and the
 * Python automation layer.
 */

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
}

export function parseCsv(input: string): CsvParseResult {
  const errors: string[] = [];
  const text = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!text) return { headers: [], rows: [], errors: ["Empty file."] };

  const lines = splitRecords(text);
  const headers = splitFields(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const fields = splitFields(lines[i]);
    if (fields.length !== headers.length) {
      errors.push(
        `Row ${i}: expected ${headers.length} columns, got ${fields.length}.`,
      );
    }
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (fields[idx] ?? "").trim();
    });
    rows.push(row);
  }

  return { headers, rows, errors };
}

/** Split into records, respecting newlines inside quoted fields. */
function splitRecords(text: string): string[] {
  const records: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === "\n" && !inQuotes) {
      records.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current) records.push(current);
  return records;
}

function splitFields(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

export type DatasetType = "volunteers" | "resources" | "cases" | "unknown";

/** Heuristically infer what kind of dataset a CSV is from its headers. */
export function detectDataset(headers: string[]): DatasetType {
  const h = headers.map((x) => x.toLowerCase());
  const has = (...keys: string[]) => keys.some((k) => h.includes(k));

  if (has("skills", "vehicle_access", "max_tasks_per_day", "reliability_score")) {
    return "volunteers";
  }
  if (has("quantity_available", "delivery_available", "eligibility_rules", "resource_type")) {
    return "resources";
  }
  if (has("description", "requester_name", "people_affected")) {
    return "cases";
  }
  return "unknown";
}
