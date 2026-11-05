#!/usr/bin/env python
"""Export a fine-tuned ByT5 model to ONNX for Transformers.js.

Transformers.js does not ship a ByT5 tokenizer. After export, encode text as
UTF-8 bytes plus 3 and decode generated ids the same way. See examples/bytes.js
and TRAINING.md.

The int8 files are dynamic weight-only quantization of each ONNX graph.
"""

import argparse
import shutil
from pathlib import Path


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Export the ByT5 normalizer to ONNX.")
    parser.add_argument("--model", required=True, help="Fine-tuned model directory")
    parser.add_argument("--output", required=True, help="Transformers.js directory")
    return parser.parse_args(argv)


def _flatten_onnx(output_dir):
    onnx_dir = output_dir / "onnx"
    onnx_dir.mkdir(exist_ok=True)
    moved = []
    for path in output_dir.glob("*.onnx"):
        target = onnx_dir / path.name
        if target.exists():
            target.unlink()
        shutil.move(str(path), str(target))
        moved.append(target)
    if not moved and not any(onnx_dir.glob("*.onnx")):
        raise SystemExit("Export finished without ONNX files in %s" % output_dir)
    return list(onnx_dir.glob("*.onnx"))


def export_transformers_js(model_dir, output_dir):
    try:
        from optimum.exporters.onnx import main_export
        from onnxruntime.quantization import QuantType, quantize_dynamic
    except ImportError as exc:
        raise SystemExit(
            "Install ml/normalizer/requirements.txt before export. Missing import: %s" % exc
        )

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    main_export(
        model_name_or_path=str(model_dir),
        output=str(output_path),
        task="text2text-generation",
        device="cpu",
        do_validation=False,
    )
    graphs = _flatten_onnx(output_path)
    quantized = []
    for graph in graphs:
        if graph.name.endswith("_quantized.onnx"):
            continue
        destination = graph.with_name(graph.stem + "_quantized.onnx")
        quantize_dynamic(str(graph), str(destination), weight_type=QuantType.QInt8)
        quantized.append(destination)
    return {
        "fp32": [str(path) for path in graphs],
        "int8": [str(path) for path in quantized],
    }


def main(argv=None):
    args = parse_args(argv)
    written = export_transformers_js(args.model, args.output)
    for path in written["fp32"]:
        print("Wrote %s" % path)
    for path in written["int8"]:
        print("Wrote %s" % path)


if __name__ == "__main__":
    main()
