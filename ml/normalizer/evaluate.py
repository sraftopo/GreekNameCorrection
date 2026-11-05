#!/usr/bin/env python
"""Score a ByT5 normalizer against the library on the same test rows.

The rules baseline calls the Node library. It does not turn transliteration on.
Rows whose corruptions include greek_to_greeklish also get a second library
call with transliterate set to greeklish-to-greek. That second call is reported
only on the greeklish slice.
"""

import argparse
import json
import os
import subprocess
import time

from data import TARGET_FIELDS, load_jsonl
from metrics import parse_target, score_rows

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RULES_SCRIPT = os.path.join(os.path.dirname(__file__), "rules_baseline.js")


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Evaluate the ByT5 normalizer.")
    parser.add_argument("--config", default=os.path.join(os.path.dirname(__file__), "config.json"))
    parser.add_argument("--test", default="", help="Test JSONL. Defaults to config test_jsonl.")
    parser.add_argument("--model", default="", help="Fine-tuned model directory. Omit for rules only.")
    parser.add_argument("--rules-only", action="store_true")
    parser.add_argument("--limit", type=int, default=0, help="Score only the first N test rows.")
    return parser.parse_args(argv)


def load_config(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def gold_of(row):
    parsed = parse_target(row["target"])
    if parsed is None:
        raise ValueError("test row %s has a target that is not the label object" % row.get("id", ""))
    return parsed


def run_rules(rows):
    payload = []
    for row in rows:
        gold = gold_of(row)
        payload.append(json.dumps({"input": row["input"], "surname": gold.get("last") or ""}, ensure_ascii=False))
    completed = subprocess.run(
        ["node", RULES_SCRIPT],
        input="\n".join(payload) + "\n",
        text=True,
        encoding="utf-8",
        cwd=ROOT,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise SystemExit(completed.stderr or "rules baseline failed")
    lines = [line for line in completed.stdout.splitlines() if line.strip()]
    if len(lines) != len(rows):
        raise SystemExit("rules baseline returned %s rows for %s inputs" % (len(lines), len(rows)))
    return [json.loads(line) for line in lines]


def generate_texts(model_dir, inputs, max_length):
    try:
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    except ImportError as exc:
        raise SystemExit(
            "Install ml/normalizer/requirements.txt before scoring a model. Missing import: %s" % exc
        )
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_dir)
    model.eval()
    predictions = []
    started = time.perf_counter()
    for text in inputs:
        encoded = tokenizer(text, return_tensors="pt", truncation=True)
        output = model.generate(**encoded, max_length=max_length)
        predictions.append(tokenizer.decode(output[0], skip_special_tokens=True))
    elapsed = time.perf_counter() - started
    return predictions, elapsed


def directory_megabytes(path):
    total = 0
    for root, _dirs, files in os.walk(path):
        for name in files:
            total += os.path.getsize(os.path.join(root, name))
    return total / (1024 * 1024)


def build_score_rows(rows, rules, predictions):
    scored = []
    for index, row in enumerate(rows):
        gold = gold_of(row)
        corruptions = row.get("corruptions") or []
        scored.append(
            {
                "gold": gold,
                "prediction": "" if predictions is None else predictions[index],
                "baseline": rules[index].get("rules"),
                "baseline_greeklish": rules[index].get("rules_greeklish"),
                "surname_known": bool(rules[index].get("surname_known")),
                "greeklish": "greek_to_greeklish" in corruptions,
            }
        )
    return scored


def main(argv=None):
    args = parse_args(argv)
    config = load_config(args.config)
    test_path = args.test or config["test_jsonl"]
    rows = load_jsonl(test_path)
    if args.limit and args.limit > 0:
        rows = rows[: args.limit]
    if not rows:
        raise SystemExit("No test rows in %s" % test_path)

    rules = run_rules(rows)
    predictions = None
    latency = None
    model_dir = "" if args.rules_only else (args.model or "")
    if model_dir:
        predictions, elapsed = generate_texts(
            model_dir,
            [row["input"] for row in rows],
            int(config.get("generation_max_length", config["max_target_length"])),
        )
        latency = {
            "names": len(rows),
            "seconds_per_name": elapsed / len(rows),
            "model_megabytes": directory_megabytes(model_dir),
        }

    report = score_rows(build_score_rows(rows, rules, predictions))
    report["fields"] = list(TARGET_FIELDS)
    if latency is not None:
        report["cpu_latency"] = latency
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
