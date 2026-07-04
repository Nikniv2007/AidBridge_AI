#!/usr/bin/env python3
"""Parse a donation/resource inventory CSV into normalized resource records and
flag low-stock items.

Expected columns (flexible order):
    name,resource_type,description,city,state,zip,quantity_available,
    delivery_available,hours,eligibility_rules,contact_name,contact_phone

Usage:
    python scripts/parse_inventory.py inventory.csv --threshold 5
"""
from __future__ import annotations

import argparse
import json

from parse_csv import parse_csv


def to_bool(v: str) -> bool:
    return str(v).strip().lower() in {"true", "yes", "1", "y"}


def normalize(row: dict) -> dict:
    return {
        "name": row.get("name", "").strip(),
        "type": row.get("resource_type", "partner_org").strip(),
        "description": row.get("description", "").strip(),
        "city": row.get("city", "").strip(),
        "state": row.get("state", "").strip(),
        "zip": row.get("zip", "").strip(),
        "quantityAvailable": int(row.get("quantity_available", "0") or 0),
        "deliveryAvailable": to_bool(row.get("delivery_available", "")),
        "hours": row.get("hours", "").strip(),
        "eligibilityRules": row.get("eligibility_rules", "").strip(),
        "contactName": row.get("contact_name", "").strip(),
        "contactPhone": row.get("contact_phone", "").strip(),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--threshold", type=int, default=5, help="low-stock threshold")
    args = ap.parse_args()

    parsed = parse_csv(open(args.file, encoding="utf-8").read())
    resources = [normalize(r) for r in parsed["rows"]]
    low_stock = [r for r in resources if r["quantityAvailable"] <= args.threshold]

    print(json.dumps({
        "resources": resources,
        "count": len(resources),
        "lowStock": low_stock,
        "lowStockCount": len(low_stock),
        "threshold": args.threshold,
        "errors": parsed["errors"],
    }, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
