"""Score predicted JSON strings against the Phase 3 target fields."""

import json

from data import TARGET_FIELDS


def parse_target(text):
    try:
        value = json.loads(text)
    except (TypeError, json.JSONDecodeError):
        return None
    if not isinstance(value, dict):
        return None
    if any(field not in value for field in TARGET_FIELDS):
        return None
    return value


def _same(left, right):
    return left == right


def score_rows(rows):
    """Each row needs gold (dict), prediction (string), baseline (dict or None),
    and flags: surname_known (bool), greeklish (bool).
    """
    total = len(rows)
    valid = 0
    field_hits = {field: 0 for field in TARGET_FIELDS}
    baseline_hits = {field: 0 for field in TARGET_FIELDS}
    ood_total = 0
    ood_hits = 0
    ood_baseline = 0
    vocative_hits = 0
    vocative_baseline = 0
    greeklish_total = 0
    greeklish_hits = 0
    greeklish_baseline = 0
    greeklish_transliterate = 0

    for row in rows:
        gold = row["gold"]
        predicted = parse_target(row.get("prediction"))
        baseline = row.get("baseline") if isinstance(row.get("baseline"), dict) else None
        transliterated = row.get("baseline_greeklish")
        if predicted is not None:
            valid += 1
        for field in TARGET_FIELDS:
            if predicted is not None and _same(predicted.get(field), gold.get(field)):
                field_hits[field] += 1
            if baseline is not None and _same(baseline.get(field), gold.get(field)):
                baseline_hits[field] += 1

        if gold.get("last") and not row.get("surname_known"):
            ood_total += 1
            if predicted is not None and _same(predicted.get("last"), gold.get("last")):
                ood_hits += 1
            if baseline is not None and _same(baseline.get("last"), gold.get("last")):
                ood_baseline += 1

        if predicted is not None and _same(predicted.get("vocative"), gold.get("vocative")):
            vocative_hits += 1
        if baseline is not None and _same(baseline.get("vocative"), gold.get("vocative")):
            vocative_baseline += 1

        if row.get("greeklish"):
            greeklish_total += 1
            if predicted is not None and _same(predicted.get("corrected"), gold.get("corrected")):
                greeklish_hits += 1
            if baseline is not None and _same(baseline.get("corrected"), gold.get("corrected")):
                greeklish_baseline += 1
            if isinstance(transliterated, dict) and _same(
                transliterated.get("corrected"), gold.get("corrected")
            ):
                greeklish_transliterate += 1

    def rate(hits, count):
        return (hits / count) if count else 0.0

    report = {
        "rows": total,
        "json_valid": rate(valid, total),
        "exact_match": {
            field: {
                "model": rate(field_hits[field], total),
                "rules": rate(baseline_hits[field], total),
            }
            for field in TARGET_FIELDS
        },
        "vocative_accuracy": {
            "model": rate(vocative_hits, total),
            "rules": rate(vocative_baseline, total),
        },
        "out_of_dictionary_surname_accuracy": {
            "rows": ood_total,
            "model": rate(ood_hits, ood_total),
            "rules": rate(ood_baseline, ood_total),
        },
        "greeklish_to_greek_exact": {
            "rows": greeklish_total,
            "model": rate(greeklish_hits, greeklish_total),
            "rules": rate(greeklish_baseline, greeklish_total),
            "rules_transliterate": rate(greeklish_transliterate, greeklish_total),
        },
    }
    return report
