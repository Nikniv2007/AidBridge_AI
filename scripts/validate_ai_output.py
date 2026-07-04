#!/usr/bin/env python3
"""Validate an AidBridge AI intake-classifier JSON output (snake_case, Part 2).

A stdlib-only mirror of lib/ai/schemas/intake.schema.ts — useful in CI or Python
pipelines to gate on schema + cross-field consistency without a Node runtime.

Usage:
    python scripts/validate_ai_output.py output.json
    cat output.json | python scripts/validate_ai_output.py -
"""
from __future__ import annotations

import json
import sys

CASE_TYPES = {
    "food_support", "shelter_support", "transportation", "school_supplies",
    "clothing", "hygiene_kits", "medical_supplies", "donation_pickup",
    "volunteer_request", "utilities_support", "financial_hardship", "other",
}
URGENCY = {"low", "medium", "high", "critical"}
LANGS = {"English", "Spanish", "Hindi", "Urdu"}
CRITICAL_FLAGS = {"immediate_danger", "emergency_services_needed", "violence_or_self_harm"}


def band(score: float) -> str:
    if score >= 75:
        return "critical"
    if score >= 55:
        return "high"
    if score >= 30:
        return "medium"
    return "low"


def validate(o: dict) -> list[str]:
    errors: list[str] = []

    def check(key, cond, msg):
        if not cond:
            errors.append(f"{key}: {msg}")

    check("case_type", o.get("case_type") in CASE_TYPES, f"must be one of {sorted(CASE_TYPES)}")
    check("urgency_level", o.get("urgency_level") in URGENCY, "invalid urgency_level")
    score = o.get("urgency_score")
    check("urgency_score", isinstance(score, int) and 0 <= score <= 100, "must be int 0..100")
    check("people_affected", isinstance(o.get("people_affected"), int) and o["people_affected"] >= 1, "must be int >= 1")
    check("confidence_score", isinstance(o.get("confidence_score"), (int, float)) and 0 <= o["confidence_score"] <= 1, "must be 0..1")
    check("human_review_required", isinstance(o.get("human_review_required"), bool), "must be boolean")
    check("detected_language", o.get("detected_language") in LANGS, "invalid detected_language")
    check("recommended_next_steps", isinstance(o.get("recommended_next_steps"), list) and o["recommended_next_steps"], "must be a non-empty list")

    # Cross-field consistency.
    if isinstance(score, int) and o.get("urgency_level") and band(score) != o["urgency_level"]:
        errors.append(f"urgency_level '{o['urgency_level']}' inconsistent with score {score} (expected '{band(score)}')")

    flags = set(o.get("safety_flags", []) or [])
    if flags & CRITICAL_FLAGS and not o.get("human_review_required"):
        errors.append("critical safety flag present but human_review_required is false")

    return errors


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    src = sys.argv[1]
    try:
        text = sys.stdin.read() if src == "-" else open(src, encoding="utf-8").read()
        obj = json.loads(text)
    except (OSError, json.JSONDecodeError) as exc:
        print(json.dumps({"valid": False, "errors": [f"Could not parse input: {exc}"]}, indent=2))
        return 2

    errors = validate(obj)
    print(json.dumps({"valid": not errors, "errors": errors}, indent=2, ensure_ascii=False))
    return 0 if not errors else 3


if __name__ == "__main__":
    raise SystemExit(main())
