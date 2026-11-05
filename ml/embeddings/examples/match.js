"use strict";

const GreekNameCorrection = require("../../../index.js");

function sortKeyOf(name) {
  const result = GreekNameCorrection(name, {
    preserveOriginal: true,
    generateSortKey: true
  });
  return result && result.sortKey ? result.sortKey : "";
}

function tokensOf(sortKey) {
  return new Set(
    sortKey.split(/\s+/).filter(function (token) {
      return token.length > 0;
    })
  );
}

function sharesToken(left, right) {
  const rightTokens = tokensOf(right);
  const leftTokens = tokensOf(left);
  for (const token of leftTokens) {
    if (rightTokens.has(token)) return true;
  }
  return false;
}

function prefilter(query, candidates) {
  const queryKey = sortKeyOf(query);
  const kept = candidates.filter(function (name) {
    return sharesToken(queryKey, sortKeyOf(name));
  });
  return kept.length > 0 ? kept : candidates.slice();
}

function cosine(left, right) {
  const length = Math.min(left.length, right.length);
  let dot = 0;
  let leftSquare = 0;
  let rightSquare = 0;
  for (let i = 0; i < length; i++) {
    dot += left[i] * right[i];
    leftSquare += left[i] * left[i];
    rightSquare += right[i] * right[i];
  }
  const denom = Math.sqrt(leftSquare) * Math.sqrt(rightSquare);
  if (denom === 0) return 0;
  return dot / denom;
}

function vectorFromOutput(output) {
  const data = output.data;
  const dims = output.dims || [];
  if (dims.length === 3) {
    const tokens = dims[1];
    const hidden = dims[2];
    const pooled = new Array(hidden).fill(0);
    for (let token = 0; token < tokens; token++) {
      for (let index = 0; index < hidden; index++) {
        pooled[index] += data[token * hidden + index];
      }
    }
    if (tokens > 0) {
      for (let index = 0; index < hidden; index++) pooled[index] /= tokens;
    }
    return pooled;
  }
  return Array.from(data);
}

async function matchNames(query, candidates, options) {
  const settings = options || {};
  const topK = settings.topK == null ? 5 : settings.topK;
  const threshold = settings.threshold == null ? null : settings.threshold;
  const considered = prefilter(query, candidates);
  const queryVector = await settings.embed(query);
  const scored = [];
  for (let i = 0; i < considered.length; i++) {
    const name = considered[i];
    const vector = await settings.embed(name);
    const score = cosine(queryVector, vector);
    if (threshold == null || score >= threshold) {
      scored.push({ name: name, score: score });
    }
  }
  scored.sort(function (left, right) {
    return right.score - left.score;
  });
  return {
    query: query,
    considered: considered,
    matches: scored.slice(0, topK)
  };
}

async function loadEmbedder(modelPath, dtype) {
  const transformers = await import("@huggingface/transformers");
  const extractor = await transformers.pipeline("feature-extraction", modelPath, {
    dtype: dtype || "q8"
  });
  return async function embed(text) {
    const output = await extractor(text, { normalize: true });
    return vectorFromOutput(output);
  };
}

function parseArgs(argv) {
  const options = {
    model: "",
    query: "",
    candidates: [],
    topK: 5,
    threshold: null,
    dtype: "q8"
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--model") options.model = argv[++i];
    else if (arg === "--query") options.query = argv[++i];
    else if (arg === "--candidates") {
      options.candidates = String(argv[++i] || "")
        .split(",")
        .map(function (name) { return name.trim(); })
        .filter(Boolean);
    } else if (arg === "--top-k") options.topK = Number(argv[++i]);
    else if (arg === "--threshold") options.threshold = Number(argv[++i]);
    else if (arg === "--dtype") options.dtype = argv[++i];
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error("Unknown argument: " + arg);
  }
  return options;
}

async function main(argv) {
  const options = parseArgs(argv);
  if (options.help || !options.model || !options.query) {
    console.log(
      "Usage: node match.js --model <onnx-dir> --query <name> --candidates <a,b,c> [--top-k 5] [--threshold 0.5] [--dtype q8]"
    );
    return;
  }
  const embed = await loadEmbedder(options.model, options.dtype);
  const result = await matchNames(options.query, options.candidates, {
    embed: embed,
    topK: options.topK,
    threshold: options.threshold
  });
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(function (error) {
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
  });
}

module.exports = {
  sortKeyOf: sortKeyOf,
  prefilter: prefilter,
  cosine: cosine,
  vectorFromOutput: vectorFromOutput,
  matchNames: matchNames,
  parseArgs: parseArgs
};
