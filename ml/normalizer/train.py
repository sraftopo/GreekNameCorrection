#!/usr/bin/env python
"""Fine-tune google/byt5-small to map a noisy name to the Phase 3 JSON target.

Do not run this until ml/data/out/train.jsonl exists. See TRAINING.md.
"""

import argparse
import inspect
import json
import os

from data import load_jsonl, mix_gold, utf8_length


def load_config(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Fine-tune the ByT5 name normalizer.")
    parser.add_argument("--config", default=os.path.join(os.path.dirname(__file__), "config.json"))
    return parser.parse_args(argv)


def build_rows(config):
    train_rows = load_jsonl(config["train_jsonl"])
    gold_path = config.get("gold_jsonl") or ""
    gold_rows = load_jsonl(gold_path) if gold_path and os.path.exists(gold_path) else []
    rows = mix_gold(train_rows, gold_rows, int(config.get("gold_upweight", 0)))
    limit = int(config.get("max_samples", 0) or 0)
    if limit > 0:
        rows = rows[:limit]
    if not rows:
        raise SystemExit("No training rows. Generate ml/data/out/train.jsonl first.")
    return rows, len(gold_rows)


def warn_truncation(rows, max_source, max_target):
    long_source = 0
    long_target = 0
    for row in rows:
        if utf8_length(row["input"]) + 1 > max_source:
            long_source += 1
        if utf8_length(row["target"]) + 1 > max_target:
            long_target += 1
    if long_source or long_target:
        print(
            "Warning: %s inputs and %s targets exceed the configured byte lengths and will be truncated."
            % (long_source, long_target)
        )


def main(argv=None):
    args = parse_args(argv)
    config = load_config(args.config)
    try:
        from datasets import Dataset
        from transformers import (
            AutoModelForSeq2SeqLM,
            AutoTokenizer,
            DataCollatorForSeq2Seq,
            Seq2SeqTrainer,
            Seq2SeqTrainingArguments,
            set_seed,
        )
    except ImportError as exc:
        raise SystemExit(
            "Install ml/normalizer/requirements.txt before training. Missing import: %s" % exc
        )

    set_seed(int(config.get("seed", 1)))
    rows, gold_count = build_rows(config)
    max_source = int(config["max_source_length"])
    max_target = int(config["max_target_length"])
    warn_truncation(rows, max_source, max_target)
    print("Training rows: %s (gold file has %s rows, upweight %s)" % (
        len(rows), gold_count, config.get("gold_upweight", 0)
    ))

    tokenizer = AutoTokenizer.from_pretrained(config["model_name"])
    model = AutoModelForSeq2SeqLM.from_pretrained(config["model_name"])

    def preprocess(batch):
        model_inputs = tokenizer(
            batch["input"],
            max_length=max_source,
            truncation=True,
        )
        labels = tokenizer(
            batch["target"],
            max_length=max_target,
            truncation=True,
        )
        model_inputs["labels"] = labels["input_ids"]
        return model_inputs

    dataset = Dataset.from_dict(
        {
            "input": [row["input"] for row in rows],
            "target": [row["target"] for row in rows],
        }
    ).map(preprocess, batched=True, remove_columns=["input", "target"])

    eval_dataset = None
    val_path = config.get("val_jsonl") or ""
    if val_path and os.path.exists(val_path):
        val_rows = load_jsonl(val_path)
        if val_rows:
            eval_dataset = Dataset.from_dict(
                {
                    "input": [row["input"] for row in val_rows],
                    "target": [row["target"] for row in val_rows],
                }
            ).map(preprocess, batched=True, remove_columns=["input", "target"])

    output_dir = config["output_dir"]
    train_kwargs = {
        "output_dir": output_dir,
        "num_train_epochs": float(config["num_train_epochs"]),
        "per_device_train_batch_size": int(config["per_device_train_batch_size"]),
        "per_device_eval_batch_size": int(config["per_device_eval_batch_size"]),
        "gradient_accumulation_steps": int(config["gradient_accumulation_steps"]),
        "learning_rate": float(config["learning_rate"]),
        "warmup_ratio": float(config["warmup_ratio"]),
        "seed": int(config.get("seed", 1)),
        "predict_with_generate": False,
        "save_strategy": "epoch",
        "logging_steps": 10,
        "report_to": "none",
    }
    eval_key = (
        "eval_strategy"
        if "eval_strategy" in inspect.signature(Seq2SeqTrainingArguments.__init__).parameters
        else "evaluation_strategy"
    )
    train_kwargs[eval_key] = "epoch" if eval_dataset is not None else "no"
    train_args = Seq2SeqTrainingArguments(**train_kwargs)
    trainer = Seq2SeqTrainer(
        model=model,
        args=train_args,
        train_dataset=dataset,
        eval_dataset=eval_dataset,
        data_collator=DataCollatorForSeq2Seq(tokenizer, model=model),
    )
    trainer.train()
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print("Saved model to %s" % os.path.abspath(output_dir))


if __name__ == "__main__":
    main()
