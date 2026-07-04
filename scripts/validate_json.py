#!/usr/bin/env python3
"""Validate AidBridge AI triage-output JSON against the structured contract.

A stdlib-only mirror of the Zod schema in `lib/ai/schema.ts` — useful in CI or
Python automation pipelines to gate on schema + cross-field consistency without
a Node runtime.

Usage:
    python scripts/validate_json.py triage_output.json
    cat output.json | python scripts/validate_json.py -
"""
from __future__ import annotations

import json
import sys

CATEGORIES = {
    "food", "shelter", "transportation", "medical_supplies", "hygiene",
    "school_supplies", "clothing", "utilities", "financial_hardship", "other",
}
URGENCIES = {"critical", "high", "moderate", "low"}
RESOURCES = {
    "food_pantry", "shelter", "transportation", "hygiene_kits", "school_supplies",
    "clothing", "medical_supplies", "donation_pickup", "partner_org",
}
LANGS = {"en", "es", "hi", "ur"}


def band(score: float) -> str:
    if score >= 75:
        return "critical"
    if score >= 55:
        return "high"
    if score >= 30:
        return "moderate"
    return "low"


def validate(o: dict) -> list[str]:
    errors: list[str] = []

    def require(key, cond, msg):
        if not cond:
            errors.append(f"{key}: {msg}")

    require("summary", isinstance(o.get("summary"), str) and o["summary"], "must be a non-empty string")
    require("category", o.get("category") in CATEGORIES, f"must be one of {sorted(CATEGORIES)}")
    require("urgency", o.get("urgency") in URGENCIES, "invalid urgency band")
    score = o.get("urgencyScore")
    require("urgencyScore", isinstance(score, (int, float)) and 0 <= score <= 100, "must be 0..100")
    require("peopleAffected", isinstance(o.get("peopleAffected"), int) and o["peopleAffected"] >= 1, "must be int >= 1")
    require("confidence", isinstance(o.get("confidence"), (int, float)) and 0 <= o["confidence"] <= 1, "must be 0..1")
    require("humanReviewRequired", isinstance(o.get("humanReviewRequired"), bool), "must be boolean")
    require("detectedLanguage", o.get("detectedLanguage") in LANGS, "invalid language")
    require("suggestedNextSteps", isinstance(o.get("suggestedNextSteps"), list) and o["suggestedNextSteps"], "must be non-empty list")

    for r in o.get("neededResources", []) or []:
        if r not in RESOURCES:
            errors.append(f"neededResources: unknown resource '{r}'")

    # Cross-field consistency
    if isinstance(score, (int, float)) and o.get("urgency") and band(score) != o["urgency"]:
        errors.append(f"urgency '{o['urgency']}' inconsistent with score {score} (expected '{band(score)}')")

    flags = o.get("safetyFlags", []) or []
    has_critical = any(f.get("severity") == "critical" for f in flags)
    if has_critical and not o.get("humanReviewRequired"):
        errors.append("critical safety flag present but humanReviewRequired is false")
    if o.get("humanReviewRequired") and not o.get("humanReviewReason"):
        errors.append("humanReviewRequired is true but humanReviewReason is empty")

    return errors


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    src = sys.argv[1]
    text = sys.stdin.read() if src == "-" else open(src, encoding="utf-8").read()
    try:
        obj = json.loads(text)
    except json.JSONDecodeError as exc:
        print(json.dumps({"valid": False, "errors": [f"Invalid JSON: {exc}"]}, indent=2))
        return 2

    errors = validate(obj)
    print(json.dumps({"valid": not errors, "errors": errors}, indent=2, ensure_ascii=False))
    return 0 if not errors else 3


if __name__ == "__main__":
    raise SystemExit(main())
