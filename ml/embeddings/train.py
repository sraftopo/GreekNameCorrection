#!/usr/bin/env python
"""Fine-tune paraphrase-multilingual-MiniLM-L12-v2 on pairs.jsonl.

Training rows are anchor, positive, and one negative. The negative is a hard
negative from pairs.jsonl when the anchor has one. MultipleNegativesRankingLoss
also uses the other positives in the batch as negatives.
"""

import argparse
import os

from pairs import load_pairs, training_rows

BASE_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Fine-tune the name embedding model.")
    parser.add_argument("--pairs", required=True, help="Path to pairs.jsonl")
    parser.add_argument("--split", default="train", help="Split to train on. Default: train")
    parser.add_argument("--model", default=BASE_MODEL, help="Base SentenceTransformer id or path")
    parser.add_argument("--output", required=True, help="Directory for the fine-tuned model")
    parser.add_argument("--epochs", type=float, default=1.0)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--learning-rate", type=float, default=2e-5)
    parser.add_argument("--seed", type=int, default=1)
    parser.add_argument("--max-samples", type=int, default=0, help="Cap training rows. 0 means all.")
    return parser.parse_args(argv)


def build_dataset(pair_rows, seed, max_samples):
    rows = training_rows(pair_rows, seed=seed)
    if max_samples and max_samples > 0:
        rows = rows[:max_samples]
    if not rows:
        raise SystemExit("No training rows. Generate pairs.jsonl and check --split.")
    return rows


def main(argv=None):
    args = parse_args(argv)
    try:
        from datasets import Dataset
        from sentence_transformers import (
            SentenceTransformer,
            SentenceTransformerTrainer,
            SentenceTransformerTrainingArguments,
        )
        from sentence_transformers.losses import MultipleNegativesRankingLoss
        from sentence_transformers.training_args import BatchSamplers
    except ImportError as exc:
        raise SystemExit(
            "Install ml/embeddings/requirements.txt before training. Missing import: %s" % exc
        )

    pair_rows = load_pairs(args.pairs, split=args.split)
    rows = build_dataset(pair_rows, args.seed, args.max_samples)
    hard_count = sum(1 for row in rows if row["negative_source"] == "hard")
    print("Training rows: %s (%s with a hard negative)" % (len(rows), hard_count))

    dataset = Dataset.from_dict(
        {
            "anchor": [row["anchor"] for row in rows],
            "positive": [row["positive"] for row in rows],
            "negative": [row["negative"] for row in rows],
        }
    )

    model = SentenceTransformer(args.model)
    loss = MultipleNegativesRankingLoss(model)
    train_args = SentenceTransformerTrainingArguments(
        output_dir=args.output,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        warmup_ratio=0.1,
        seed=args.seed,
        batch_sampler=BatchSamplers.NO_DUPLICATES,
        logging_steps=10,
        save_strategy="epoch",
        report_to="none",
    )
    trainer = SentenceTransformerTrainer(
        model=model,
        args=train_args,
        train_dataset=dataset,
        loss=loss,
    )
    trainer.train()
    model.save_pretrained(args.output)
    print("Saved model to %s" % os.path.abspath(args.output))


if __name__ == "__main__":
    main()
