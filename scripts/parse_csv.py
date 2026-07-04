#!/usr/bin/env python3
"""Generic CSV parser + dataset detector for AidBridge AI.

Mirrors the behaviour of `lib/automation/csv.ts` so the Python automation layer
and the TypeScript API agree on how CSVs are interpreted.

Usage:
    python scripts/parse_csv.py path/to/file.csv
    cat file.csv | python scripts/parse_csv.py -
"""
from __future__ import annotations

import csv
import io
import json
import sys
from typing import Dict, List


def detect_dataset(headers: List[str]) -> str:
    """Heuristically infer the dataset type from column headers."""
    h = {x.strip().lower() for x in headers}

    def has(*keys: str) -> bool:
        return any(k in h for k in keys)

    if has("skills", "vehicle_access", "max_tasks_per_day", "reliability_score"):
        return "volunteers"
    if has("quantity_available", "delivery_available", "eligibility_rules", "resource_type"):
        return "resources"
    if has("description", "requester_name", "people_affected"):
        return "cases"
    return "unknown"


def parse_csv(text: str) -> Dict:
    reader = csv.reader(io.StringIO(text))
    rows = [r for r in reader if any(cell.strip() for cell in r)]
    if not rows:
        return {"headers": [], "rows": [], "errors": ["Empty file."]}

    headers = [c.strip() for c in rows[0]]
    errors: List[str] = []
    parsed: List[Dict[str, str]] = []

    for i, row in enumerate(rows[1:], start=1):
        if len(row) != len(headers):
            errors.append(
                f"Row {i}: expected {len(headers)} columns, got {len(row)}."
            )
        record = {headers[j]: (row[j].strip() if j < len(row) else "") for j in range(len(headers))}
        parsed.append(record)

    return {
        "headers": headers,
        "rows": parsed,
        "errors": errors,
        "dataset_type": detect_dataset(headers),
        "row_count": len(parsed),
    }


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    src = sys.argv[1]
    text = sys.stdin.read() if src == "-" else open(src, encoding="utf-8").read()
    result = parse_csv(text)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
