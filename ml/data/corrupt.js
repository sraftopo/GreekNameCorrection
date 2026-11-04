"use strict";

const { greekToGreeklish } = require("../../src/transliteration");

const CORRUPTION_NAMES = [
  "strip_accents",
  "uppercase",
  "greek_to_greeklish",
  "surname_first",
  "latin_homoglyph",
  "delete_char",
  "substitute_char",
  "transpose_chars",
  "extra_whitespace",
  "punctuation_noise"
];

const HOMOGLYPHS = {
  Ρ: "P",
  ρ: "P",
  Η: "H",
  η: "H",
  Κ: "K",
  κ: "K",
  Α: "A",
  α: "A",
  Ε: "E",
  ε: "E",
  Τ: "T",
  τ: "T",
  Ο: "O",
  ο: "O",
  Χ: "X",
  χ: "X"
};

const GREEK_LETTERS = [
  "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ",
  "ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω"
];

const PUNCTUATION = [",", ".", "-", "'"];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, rng) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function stripAccents(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function uppercase(text) {
  return text.toUpperCase();
}

function greekToGreeklishCorruption(text) {
  return greekToGreeklish(text);
}

function surnameFirst(text) {
  const parts = text.split(/\s+/).filter(function (part) {
    return part.length > 0;
  });
  if (parts.length < 2) return text;
  const last = parts.pop();
  return [last].concat(parts).join(" ");
}

function latinHomoglyph(text, rng) {
  const chars = Array.from(text);
  const indexes = [];
  chars.forEach(function (ch, index) {
    if (HOMOGLYPHS[ch]) indexes.push(index);
  });
  if (indexes.length === 0) return text;

  let chosen = indexes.filter(function () {
    return rng() < 0.5;
  });
  if (chosen.length === 0) {
    chosen = [indexes[Math.floor(rng() * indexes.length)]];
  }
  chosen.forEach(function (index) {
    chars[index] = HOMOGLYPHS[chars[index]];
  });
  return chars.join("");
}

function letterIndexes(text) {
  const chars = Array.from(text);
  const indexes = [];
  chars.forEach(function (ch, index) {
    if (!/\s/.test(ch)) indexes.push(index);
  });
  return { chars: chars, indexes: indexes };
}

function deleteChar(text, rng) {
  const found = letterIndexes(text);
  if (found.indexes.length === 0) return text;
  const index = found.indexes[Math.floor(rng() * found.indexes.length)];
  found.chars.splice(index, 1);
  return found.chars.join("");
}

function substituteChar(text, rng) {
  const found = letterIndexes(text);
  const greekIndexes = found.indexes.filter(function (index) {
    return /[Α-ω]/.test(found.chars[index]);
  });
  const pool = greekIndexes.length ? greekIndexes : found.indexes;
  if (pool.length === 0) return text;
  const index = pool[Math.floor(rng() * pool.length)];
  let replacement = GREEK_LETTERS[Math.floor(rng() * GREEK_LETTERS.length)];
  if (replacement === found.chars[index].toLowerCase()) {
    replacement = GREEK_LETTERS[(GREEK_LETTERS.indexOf(replacement) + 1) % GREEK_LETTERS.length];
  }
  found.chars[index] = replacement;
  return found.chars.join("");
}

function transposeChars(text, rng) {
  const chars = Array.from(text);
  const starts = [];
  for (let i = 0; i < chars.length - 1; i++) {
    if (!/\s/.test(chars[i]) && !/\s/.test(chars[i + 1])) starts.push(i);
  }
  if (starts.length === 0) return text;
  const index = starts[Math.floor(rng() * starts.length)];
  const tmp = chars[index];
  chars[index] = chars[index + 1];
  chars[index + 1] = tmp;
  return chars.join("");
}

function extraWhitespace(text, rng) {
  const roll = rng();
  if (roll < 0.34) return "  " + text;
  if (roll < 0.67) return text + "  ";
  const spaces = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === " ") spaces.push(i);
  }
  if (spaces.length === 0) return text + "  ";
  const index = spaces[Math.floor(rng() * spaces.length)];
  return text.slice(0, index) + "   " + text.slice(index + 1);
}

function punctuationNoise(text, rng) {
  const mark = PUNCTUATION[Math.floor(rng() * PUNCTUATION.length)];
  const at = Math.floor(rng() * (Array.from(text).length + 1));
  const chars = Array.from(text);
  chars.splice(at, 0, mark);
  return chars.join("");
}

const CORRUPTION_FNS = {
  strip_accents: stripAccents,
  uppercase: uppercase,
  greek_to_greeklish: greekToGreeklishCorruption,
  surname_first: surnameFirst,
  latin_homoglyph: latinHomoglyph,
  delete_char: deleteChar,
  substitute_char: substituteChar,
  transpose_chars: transposeChars,
  extra_whitespace: extraWhitespace,
  punctuation_noise: punctuationNoise
};

function applyCorruptions(text, rng, count) {
  const order = shuffle(CORRUPTION_NAMES, rng);
  const stack = count == null ? 1 + Math.floor(rng() * 3) : count;
  const chosen = order.slice(0, Math.min(stack, order.length));
  let current = text;
  chosen.forEach(function (name) {
    current = CORRUPTION_FNS[name](current, rng);
  });
  return {
    text: current,
    corruptions: chosen
  };
}

function editDistance(left, right) {
  const a = Array.from(left);
  const b = Array.from(right);
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = [];
  for (let i = 0; i < rows; i++) {
    dp.push(new Array(cols).fill(0));
    dp[i][0] = i;
  }
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

module.exports = {
  CORRUPTION_NAMES: CORRUPTION_NAMES,
  HOMOGLYPHS: HOMOGLYPHS,
  mulberry32: mulberry32,
  shuffle: shuffle,
  stripAccents: stripAccents,
  uppercase: uppercase,
  greekToGreeklishCorruption: greekToGreeklishCorruption,
  surnameFirst: surnameFirst,
  latinHomoglyph: latinHomoglyph,
  deleteChar: deleteChar,
  substituteChar: substituteChar,
  transposeChars: transposeChars,
  extraWhitespace: extraWhitespace,
  punctuationNoise: punctuationNoise,
  applyCorruptions: applyCorruptions,
  editDistance: editDistance
};
