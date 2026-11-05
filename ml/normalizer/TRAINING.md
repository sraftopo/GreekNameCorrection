# ByT5 normalizer

Fine-tune `google/byt5-small` so a noisy name string becomes the Phase 3 label JSON. The core package does not depend on this folder. These commands do not run during development; run them when you want a checkpoint.

ByT5-small has 300 million parameters (12 encoder layers, 4 decoder layers). A float32 checkpoint is about 1.2 GB. The int8 ONNX build of the public base model is about 300 MB. A fine-tune will be in that range. The decoder emits one byte at a time, so a label JSON of a few hundred bytes can take seconds per name on CPU. Training wants a GPU. 16 GB of VRAM is a practical size for the batch in `config.json`. 8 GB can work if you lower `per_device_train_batch_size` to 1 or 2. CPU training of this model is possible and much slower.

On this Windows machine, `python` may be the Store alias. Use `py -3` in place of `python` if that is the case.

```bash
py -3 -m pip install -r ml/normalizer/requirements.txt
node ml/data/generate.js --seed 1 --per-name 2 --max 500 --out ml/data/out
py -3 ml/normalizer/train.py --config ml/normalizer/config.json
py -3 ml/normalizer/evaluate.py --config ml/normalizer/config.json --model ml/normalizer/output/model
py -3 ml/normalizer/export_onnx.py --model ml/normalizer/output/model --output ml/normalizer/output/onnx
```

`config.json` sets three epochs, batch size 4, gradient accumulation 4, learning rate 0.0001, source limit 128 bytes, and target limit 768 bytes. The longest generated label in the default 500-name set is 654 bytes, so 512 would cut the JSON. `gold_upweight` is 5: each non-empty line in `ml/data/gold/gold.jsonl` is appended to the training rows five times. The gold file starts empty, so that factor does nothing until you add invented rows. `max_samples` of 0 uses every training row.

The training target is the `target` string already stored in the JSONL. That string is JSON with `corrected`, `first`, `last`, `father`, `title`, `gender`, `genitive`, `vocative`, `accusative`, and `sortKey`.

`evaluate.py` prints, for the test split:

- JSON validity rate
- exact match of each field, for the model and for the rules baseline
- vocative exact match
- exact match of `last` on surnames the library marks with `name_not_in_dictionary`
- exact match of `corrected` on rows whose corruptions include `greek_to_greeklish`

The rules baseline is one library label of the noisy input, with the same options Phase 3 uses for a clean name. Transliteration stays off, so plain rules do not turn Greeklish back into Greek. The greeklish slice also reports `rules_transliterate`, which is a second library call with `transliterate` set to `greeklish-to-greek`. When a model path is set, the report includes `cpu_latency.seconds_per_name` and the checkpoint size in megabytes. Use `--rules-only` to skip the model, and `--limit 20` to time a short CPU sample.

`export_onnx.py` writes the text-to-text graphs under `onnx/`, plus an int8 `*_quantized.onnx` next to each graph. Transformers.js can run the graphs with `T5ForConditionalGeneration`. It does not ship a ByT5 tokenizer, so do not use `pipeline()`. Encode with `ml/normalizer/examples/bytes.js`: UTF-8 bytes plus 3, then append id 1. Decode ids from 3 through 258 by subtracting 3.

```bash
node --test ml/normalizer/examples/bytes.test.js
py -3 -m unittest ml/normalizer/test_normalizer.py
```

Checkpoints under `ml/normalizer/output/` stay local.
