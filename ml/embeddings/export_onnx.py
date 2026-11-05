#!/usr/bin/env python
"""Export a SentenceTransformer to the ONNX layout Transformers.js loads.

Output:
  <output>/config.json
  <output>/tokenizer.json
  <output>/onnx/model.onnx
  <output>/onnx/model_quantized.onnx

Transformers.js dtype "q8" reads onnx/model_quantized.onnx.
The export uses library_name sentence_transformers so the graph includes
pooling and the sentence embedding.
"""

import argparse
import shutil
from pathlib import Path


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Export the embedding model to ONNX.")
    parser.add_argument("--model", required=True, help="Fine-tuned SentenceTransformer directory")
    parser.add_argument("--output", required=True, help="Transformers.js model directory")
    return parser.parse_args(argv)


def _move_onnx_to_subdir(output_dir):
    onnx_dir = output_dir / "onnx"
    onnx_dir.mkdir(exist_ok=True)
    root_onnx = output_dir / "model.onnx"
    nested = onnx_dir / "model.onnx"
    if root_onnx.exists():
        if nested.exists():
            nested.unlink()
        shutil.move(str(root_onnx), str(nested))
    if not nested.exists():
        raise SystemExit("Export finished without model.onnx in %s" % output_dir)
    return nested


def export_transformers_js(model_dir, output_dir):
    try:
        from optimum.exporters.onnx import main_export
        from onnxruntime.quantization import QuantType, quantize_dynamic
    except ImportError as exc:
        raise SystemExit(
            "Install ml/embeddings/requirements.txt before export. Missing import: %s" % exc
        )

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    main_export(
        model_name_or_path=str(model_dir),
        output=str(output_path),
        task="feature-extraction",
        device="cpu",
        library_name="sentence_transformers",
        do_validation=False,
    )
    fp32 = _move_onnx_to_subdir(output_path)
    quantized = output_path / "onnx" / "model_quantized.onnx"
    quantize_dynamic(str(fp32), str(quantized), weight_type=QuantType.QInt8)
    return {"fp32": str(fp32), "int8": str(quantized)}


def main(argv=None):
    args = parse_args(argv)
    written = export_transformers_js(args.model, args.output)
    print("Wrote %s" % written["fp32"])
    print("Wrote %s" % written["int8"])


if __name__ == "__main__":
    main()
