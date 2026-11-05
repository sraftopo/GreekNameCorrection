"""Read pairs.jsonl and build training rows. No model dependencies."""

import json
import random


def load_pairs(path, split=None):
    rows = []
    with open(path, "r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            text = line.strip()
            if not text:
                continue
            row = json.loads(text)
            if split is not None and row.get("split") != split:
                continue
            if "a" not in row or "b" not in row or "type" not in row:
                raise ValueError("pair on line %s is missing a, b, or type" % line_number)
            rows.append(row)
    return rows


def training_rows(pairs, seed=1):
    """One row per positive pair.

    A hard negative is attached when the positive anchor is also the anchor of a
    hard_negative row. Otherwise the negative is another training name that is
    not a known surface form of that anchor. In-batch negatives still apply
    during MultipleNegativesRankingLoss.
    """
    positives = [row for row in pairs if row.get("type") == "positive"]
    hard_rows = [row for row in pairs if row.get("type") == "hard_negative"]

    hard_by_anchor = {}
    names = []
    seen_names = set()

    def add_name(name):
        if name not in seen_names:
            seen_names.add(name)
            names.append(name)

    for row in hard_rows:
        hard_by_anchor.setdefault(row["a"], [])
        if row["b"] not in hard_by_anchor[row["a"]]:
            hard_by_anchor[row["a"]].append(row["b"])
        add_name(row["a"])
        add_name(row["b"])

    protected = {}
    for row in positives:
        protected.setdefault(row["a"], set()).update((row["a"], row["b"]))
        add_name(row["a"])
        add_name(row["b"])

    rng = random.Random(seed)
    built = []
    for index, row in enumerate(positives):
        anchor = row["a"]
        positive = row["b"]
        blocked = protected.get(anchor, set())
        hard = [name for name in hard_by_anchor.get(anchor, []) if name not in blocked]
        if hard:
            negative = hard[index % len(hard)]
            source = "hard"
        else:
            pool = [name for name in names if name not in blocked]
            if not pool:
                continue
            negative = pool[rng.randrange(len(pool))]
            source = "random"
        built.append(
            {
                "anchor": anchor,
                "positive": positive,
                "negative": negative,
                "negative_source": source,
            }
        )
    return built
