"""Load Phase 3 JSONL and repeat gold rows by an integer upweight."""

import json

TARGET_FIELDS = (
    "corrected",
    "first",
    "last",
    "father",
    "title",
    "gender",
    "genitive",
    "vocative",
    "accusative",
    "sortKey",
)


def load_jsonl(path):
    rows = []
    with open(path, "r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            text = line.strip()
            if not text:
                continue
            row = json.loads(text)
            if "input" not in row or "target" not in row:
                raise ValueError("line %s is missing input or target" % line_number)
            if not isinstance(row["target"], str):
                row["target"] = json.dumps(row["target"], ensure_ascii=False)
            rows.append(row)
    return rows


def mix_gold(train_rows, gold_rows, upweight):
    """Append each gold row `upweight` times. Zero or an empty file adds nothing."""
    if not gold_rows or not upweight or upweight < 1:
        return list(train_rows)
    mixed = list(train_rows)
    repeats = int(upweight)
    for _ in range(repeats):
        mixed.extend(gold_rows)
    return mixed


def utf8_length(text):
    return len(text.encode("utf-8"))
