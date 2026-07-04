#!/usr/bin/env python3
"""Parse a resource/donation inventory CSV into normalized resources and flag
low-stock items.

Expected columns (flexible order):
    name, resource_type, description, city, state, zip, available_quantity,
    delivery_available, hours, eligibility_rules, contact_name, contact_phone

Usage:
    python scripts/parse_inventory_sheet.py inventory.csv --threshold 5 --out scripts/output/resources.json
"""
from __future__ import annotations

import argparse
import json
import os

from parse_csv import parse_csv


def to_bool(v: str) -> bool:
    return str(v).strip().lower() in {"true", "yes", "1", "y"}


def normalize(row: dict) -> dict:
    return {
        "name": row.get("name", "").strip(),
        "resource_type": row.get("resource_type", "partner_org").strip() or "partner_org",
        "description": row.get("description", "").strip(),
        "city": row.get("city", "").strip(),
        "state": row.get("state", "").strip(),
        "zip": row.get("zip", "").strip(),
        "available_quantity": int(row.get("available_quantity", "0") or 0),
        "delivery_available": to_bool(row.get("delivery_available", "")),
        "hours": {"raw": row.get("hours", "").strip()},
        "eligibility_rules": (
            {"raw": row["eligibility_rules"].strip()}
            if row.get("eligibility_rules", "").strip()
            else {}
        ),
        "contact_info": {
            "name": row.get("contact_name", "").strip(),
            "phone": row.get("contact_phone", "").strip(),
        },
        "active": True,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Normalize an inventory CSV and flag low stock.")
    ap.add_argument("file")
    ap.add_argument("--threshold", type=int, default=5, help="low-stock threshold (default 5)")
    ap.add_argument("--out")
    args = ap.parse_args()

    try:
        text = open(args.file, encoding="utf-8").read()
    except OSError as exc:
        print(f"error: {exc}")
        return 1

    parsed = parse_csv(text)
    resources = [normalize(r) for r in parsed["rows"] if r.get("name", "").strip()]
    low_stock = [r for r in resources if r["available_quantity"] <= args.threshold]

    result = {
        "count": len(resources),
        "low_stock_count": len(low_stock),
        "threshold": args.threshold,
        "errors": parsed["errors"],
        "resources": resources,
        "low_stock": low_stock,
    }
    out = json.dumps(result, indent=2, ensure_ascii=False)
    if args.out:
        os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
        open(args.out, "w", encoding="utf-8").write(out)
        print(f"Wrote {len(resources)} resources ({len(low_stock)} low) to {args.out}.")
    else:
        print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
