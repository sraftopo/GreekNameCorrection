# Name embeddings

Fine-tune `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` on `pairs.jsonl` from Phase 3. The core package does not depend on this folder.

```bash
pip install -r ml/embeddings/requirements.txt
node ml/data/generate.js --seed 1 --per-name 2 --max 500 --out ml/data/out
python ml/embeddings/train.py --pairs ml/data/out/pairs.jsonl --output ml/embeddings/output/model
python ml/embeddings/evaluate.py --pairs ml/data/out/pairs.jsonl --model ml/embeddings/output/model --split test
python ml/embeddings/export_onnx.py --model ml/embeddings/output/model --output ml/embeddings/output/onnx
```

`train.py` uses `MultipleNegativesRankingLoss` and a batch sampler that avoids duplicate strings in one batch. Each positive pair is `(anchor, positive, negative)`. The negative is the hard negative from `pairs.jsonl` when that anchor has one (gendered surname form or one-letter-different name). Other rows get a different training name that is not a known surface form of the anchor. The loss also treats the other positives in the batch as negatives.

`evaluate.py` reports recall@1, recall@5, and the best-threshold F1 on the chosen split. It scores three systems when a model path is passed: the fine-tuned model, the base model, and a sortKey baseline. The baseline ranks character bigram Dice overlap of the library sort key. `--baseline-only` skips the neural models.

`export_onnx.py` writes a Transformers.js folder: tokenizer files at the root, `onnx/model.onnx`, and int8 `onnx/model_quantized.onnx`. The graph is exported as a sentence-transformers feature-extraction model, so it includes pooling.

The Node matcher:

```bash
cd ml/embeddings/examples
npm install
node match.js --model ../output/onnx --query "Γιώργος Παπαδόπουλος" --candidates "Γιωργος Παπαδοπουλος,Μαρία Κωνσταντίνου"
```

It keeps candidates that share a sortKey token with the query, then ranks those by cosine similarity. `--dtype q8` is the default and loads `model_quantized.onnx`. If the token filter matches nobody, every candidate is scored.

Tests that do not download weights:

```bash
python -m unittest ml/embeddings/test_embeddings.py
node --test ml/embeddings/examples/match.test.js
```

Training weights stay in `ml/embeddings/output/` and are not part of the core package.
