#!/usr/bin/env python
"""Compare a fine-tuned model, the base model, and a sortKey baseline.

The held-out split defaults to test. Recall treats each positive pair as one
query: the gallery is every name in the split, excluding the query string.
F1 sweeps cosine (or Dice) thresholds on positive pairs versus hard negatives.
"""

import argparse
import json

from metrics import evaluate_cases, sort_key_score
from pairs import load_pairs

BASE_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Evaluate name embeddings on a held-out split.")
    parser.add_argument("--pairs", required=True, help="Path to pairs.jsonl")
    parser.add_argument("--split", default="test")
    parser.add_argument("--model", default="", help="Fine-tuned SentenceTransformer directory")
    parser.add_argument("--base", default=BASE_MODEL, help="Base model id. Empty skips it.")
    parser.add_argument("--baseline-only", action="store_true", help="Score only the sortKey baseline.")
    return parser.parse_args(argv)


def embed_score_fn(model):
    cache = {}

    def embed(text):
        if text not in cache:
            cache[text] = model.encode(text, normalize_embeddings=True, show_progress_bar=False)
        return cache[text]

    def score(left, right):
        left_vector = embed(left)
        right_vector = embed(right)
        return float(left_vector @ right_vector)

    return score


def load_sentence_transformer(model_id):
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError as exc:
        raise SystemExit(
            "Install ml/embeddings/requirements.txt before evaluating a model. Missing import: %s"
            % exc
        )
    return SentenceTransformer(model_id)


def run_evaluation(rows, model_path="", base_model=BASE_MODEL, baseline_only=False):
    reports = {"sortkey": evaluate_cases(rows, sort_key_score)}
    if baseline_only:
        return reports
    if model_path:
        tuned = load_sentence_transformer(model_path)
        reports["finetuned"] = evaluate_cases(rows, embed_score_fn(tuned))
    if base_model:
        base = load_sentence_transformer(base_model)
        reports["base"] = evaluate_cases(rows, embed_score_fn(base))
    return reports


def main(argv=None):
    args = parse_args(argv)
    rows = load_pairs(args.pairs, split=args.split)
    if not rows:
        raise SystemExit("No pairs in split %s" % args.split)
    reports = run_evaluation(
        rows,
        model_path=args.model,
        base_model="" if args.baseline_only else args.base,
        baseline_only=args.baseline_only,
    )
    print(json.dumps(reports, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
