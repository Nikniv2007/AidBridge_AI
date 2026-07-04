#!/usr/bin/env python3
"""Parse a CSV of community intake requests into normalized JSON cases.

Expected columns (flexible order; extras are ignored):
    requester_name, requester_phone, requester_email, original_request,
    city, state, zip, people_affected, preferred_language

Usage:
    python scripts/parse_intake_csv.py requests.csv
    python scripts/parse_intake_csv.py requests.csv --out scripts/output/cases.json
    cat requests.csv | python scripts/parse_intake_csv.py -
"""
from __future__ import annotations

import argparse
import json
import os
import sys

from parse_csv import parse_csv


def normalize(row: dict, idx: int) -> dict:
    return {
        "external_ref": f"intake-{idx:04d}",
        "requester_name": row.get("requester_name", "").strip() or "Anonymous",
        "requester_phone": row.get("requester_phone", "").strip(),
        "requester_email": row.get("requester_email", "").strip(),
        "original_request": row.get("original_request", "").strip(),
        "city": row.get("city", "").strip(),
        "state": row.get("state", "").strip(),
        "zip": row.get("zip", "").strip(),
        "people_affected": int(row.get("people_affected", "1") or 1),
        "preferred_language": row.get("preferred_language", "English").strip() or "English",
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Normalize a community-request CSV into JSON cases.")
    ap.add_argument("file", help="path to CSV, or '-' for stdin")
    ap.add_argument("--out", help="write JSON to this path instead of stdout")
    args = ap.parse_args()

    try:
        text = sys.stdin.read() if args.file == "-" else open(args.file, encoding="utf-8").read()
    except OSError as exc:
        print(f"error: could not read input: {exc}", file=sys.stderr)
        return 1

    parsed = parse_csv(text)
    cases, errors = [], list(parsed["errors"])
    for i, row in enumerate(parsed["rows"], start=1):
        if not row.get("original_request", "").strip():
            errors.append(f"Row {i}: missing original_request — skipped.")
            continue
        cases.append(normalize(row, i))

    result = {
        "disclaimer": "Sample/parsed data is treated as fictional in demo mode.",
        "count": len(cases),
        "errors": errors,
        "cases": cases,
    }
    output = json.dumps(result, indent=2, ensure_ascii=False)

    if args.out:
        os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(output)
        print(f"Wrote {len(cases)} cases to {args.out} ({len(errors)} warnings).")
    else:
        print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
