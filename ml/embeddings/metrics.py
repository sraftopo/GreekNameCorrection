"""Retrieval metrics and the sortKey baseline. No model dependencies.

sort_key follows src/utils.js generateSortKey: lowercase, then the same
single-character replacements, including final sigma to medial sigma.
"""

ACCENT_MAP = (
    ("ά", "α"),
    ("έ", "ε"),
    ("ή", "η"),
    ("ί", "ι"),
    ("ό", "ο"),
    ("ύ", "υ"),
    ("ώ", "ω"),
    ("Ά", "Α"),
    ("Έ", "Ε"),
    ("Ή", "Η"),
    ("Ί", "Ι"),
    ("Ό", "Ο"),
    ("Ύ", "Υ"),
    ("Ώ", "Ω"),
    ("ϊ", "ι"),
    ("ϋ", "υ"),
    ("ΐ", "ι"),
    ("ΰ", "υ"),
    ("Ϊ", "Ι"),
    ("Ϋ", "Υ"),
    ("ς", "σ"),
)


def sort_key(text):
    lowered = text.lower()
    for accented, plain in ACCENT_MAP:
        lowered = lowered.replace(accented, plain)
    return lowered


def _bigrams(text):
    if len(text) < 2:
        return [text] if text else []
    return [text[i : i + 2] for i in range(len(text) - 1)]


def dice_coefficient(left, right):
    left_grams = _bigrams(left)
    right_grams = _bigrams(right)
    if not left_grams and not right_grams:
        return 1.0
    if not left_grams or not right_grams:
        return 0.0
    from collections import Counter

    left_counts = Counter(left_grams)
    right_counts = Counter(right_grams)
    overlap = sum((left_counts & right_counts).values())
    total = sum(left_counts.values()) + sum(right_counts.values())
    if total == 0:
        return 0.0
    return (2.0 * overlap) / total


def sort_key_score(left, right):
    return dice_coefficient(sort_key(left), sort_key(right))


def best_threshold_f1(scored_labels):
    """scored_labels is a list of (score, label) with label 1 for same identity.

    Ties keep the higher threshold.
    """
    empty = {"f1": 0.0, "threshold": 1.0, "precision": 0.0, "recall": 0.0}
    if not scored_labels:
        return empty

    thresholds = sorted({score for score, _label in scored_labels}, reverse=True)
    best = {"f1": -1.0, "threshold": 1.0, "precision": 0.0, "recall": 0.0}
    for threshold in thresholds:
        true_positive = 0
        false_positive = 0
        false_negative = 0
        for score, label in scored_labels:
            predicted = score >= threshold
            if predicted and label == 1:
                true_positive += 1
            elif predicted and label == 0:
                false_positive += 1
            elif (not predicted) and label == 1:
                false_negative += 1
        precision = (
            true_positive / (true_positive + false_positive)
            if true_positive + false_positive
            else 0.0
        )
        recall = (
            true_positive / (true_positive + false_negative)
            if true_positive + false_negative
            else 0.0
        )
        f1 = (
            (2.0 * precision * recall) / (precision + recall)
            if precision + recall
            else 0.0
        )
        if f1 > best["f1"]:
            best = {
                "f1": f1,
                "threshold": threshold,
                "precision": precision,
                "recall": recall,
            }
    if best["f1"] < 0:
        return empty
    return best


def evaluate_cases(rows, score_fn, ks=(1, 5)):
    positives = [row for row in rows if row.get("type") == "positive"]
    hard = [row for row in rows if row.get("type") == "hard_negative"]
    gallery = []
    seen = set()
    for row in rows:
        for name in (row["a"], row["b"]):
            if name not in seen:
                seen.add(name)
                gallery.append(name)

    hits = {k: 0 for k in ks}
    for row in positives:
        query = row["a"]
        relevant = row["b"]
        ranked = sorted(
            [name for name in gallery if name != query],
            key=lambda name: score_fn(query, name),
            reverse=True,
        )
        for k in ks:
            if relevant in ranked[:k]:
                hits[k] += 1

    total = len(positives)
    report = {}
    for k in ks:
        report["recall@%s" % k] = (hits[k] / total) if total else 0.0

    labeled = [(score_fn(row["a"], row["b"]), 1) for row in positives]
    labeled.extend((score_fn(row["a"], row["b"]), 0) for row in hard)
    threshold = best_threshold_f1(labeled)
    report["f1"] = threshold["f1"]
    report["threshold"] = threshold["threshold"]
    report["precision"] = threshold["precision"]
    report["recall"] = threshold["recall"]
    report["positives"] = total
    report["hard_negatives"] = len(hard)
    return report
