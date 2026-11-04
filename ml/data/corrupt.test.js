"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const { buildCatalog } = require("./catalog");
const { labelName } = require("./label");
const {
  mulberry32,
  stripAccents,
  uppercase,
  greekToGreeklishCorruption,
  surnameFirst,
  latinHomoglyph,
  deleteChar,
  substituteChar,
  transposeChars,
  extraWhitespace,
  punctuationNoise,
  applyCorruptions,
  HOMOGLYPHS
} = require("./corrupt");
const { buildDataset, writeDataset, assignSplits } = require("./generate");

test("strip_accents removes tonos and leaves the base letters", function () {
  assert.strictEqual(stripAccents("Γιώργος"), "Γιωργος");
  assert.strictEqual(stripAccents("Μαρία"), "Μαρια");
});

test("uppercase uses the Greek capital letters", function () {
  assert.strictEqual(uppercase("γιώργος"), "ΓΙΏΡΓΟΣ");
});

test("greek_to_greeklish uses the library map", function () {
  assert.strictEqual(greekToGreeklishCorruption("Γιώργος"), "Giwrgos");
});

test("surname_first moves the last token to the front", function () {
  assert.strictEqual(
    surnameFirst("Δρ Γιώργος Παπαδόπουλος"),
    "Παπαδόπουλος Δρ Γιώργος"
  );
  assert.strictEqual(surnameFirst("Γιώργος"), "Γιώργος");
});

test("latin_homoglyph replaces only the listed lookalike letters", function () {
  const rng = mulberry32(3);
  const result = latinHomoglyph("Κώστας", rng);
  assert.notStrictEqual(result, "Κώστας");
  const source = Array.from("Κώστας");
  const output = Array.from(result);
  assert.strictEqual(output.length, source.length);
  output.forEach(function (ch, index) {
    if (ch === source[index]) return;
    assert.strictEqual(ch, HOMOGLYPHS[source[index]]);
  });
  assert.strictEqual(latinHomoglyph("Ψυ", mulberry32(1)), "Ψυ");
});

test("delete_char removes one non-space character", function () {
  const result = deleteChar("Γιώργος", mulberry32(4));
  assert.strictEqual(Array.from(result).length, Array.from("Γιώργος").length - 1);
});

test("substitute_char changes one character", function () {
  const source = "Γιώργος";
  const result = substituteChar(source, mulberry32(5));
  const left = Array.from(source);
  const right = Array.from(result);
  assert.strictEqual(right.length, left.length);
  const changes = right.filter(function (ch, index) {
    return ch !== left[index];
  });
  assert.strictEqual(changes.length, 1);
});

test("transpose_chars swaps two adjacent non-space characters", function () {
  const result = transposeChars("ΑΒ", mulberry32(6));
  assert.strictEqual(result, "ΒΑ");
});

test("extra_whitespace adds spaces", function () {
  const result = extraWhitespace("Γιώργος Παπαδόπουλος", mulberry32(7));
  assert.ok(result.includes("  ") || result.startsWith(" ") || result.endsWith(" "));
  assert.notStrictEqual(result, "Γιώργος Παπαδόπουλος");
});

test("punctuation_noise inserts one mark", function () {
  const result = punctuationNoise("Γιώργος", mulberry32(8));
  assert.ok(/[,.'-]/.test(result));
  assert.strictEqual(result.replace(/[,.'-]/g, ""), "Γιώργος");
});

test("applyCorruptions stacks 1 to 3 distinct corruptions and repeats for a seed", function () {
  const once = applyCorruptions("Γιώργος Παπαδόπουλος", mulberry32(9));
  const twice = applyCorruptions("Γιώργος Παπαδόπουλος", mulberry32(9));
  assert.deepStrictEqual(once, twice);
  assert.ok(once.corruptions.length >= 1 && once.corruptions.length <= 3);
  assert.strictEqual(new Set(once.corruptions).size, once.corruptions.length);
});

test("library labels keep detectGender, including -ου surnames", function () {
  const male = labelName("Γιώργος Παπαδόπουλος");
  assert.strictEqual(male.gender, "male");
  assert.strictEqual(male.first, "Γιώργος");
  assert.strictEqual(male.last, "Παπαδόπουλος");
  assert.strictEqual(male.father, null);
  assert.strictEqual(male.title, null);
  assert.ok(male.genitive);
  assert.ok(male.vocative);
  assert.ok(male.accusative);
  assert.ok(male.sortKey);

  const withFather = labelName("Γιώργος του Νίκου Παπαδόπουλος");
  assert.strictEqual(withFather.father, "Νίκου");
  assert.strictEqual(withFather.gender, "male");

  const inou = labelName("Γιώργος Γεωργίου");
  assert.strictEqual(inou.gender, "female");
  assert.strictEqual(inou.last, "Γεωργίου");
});

test("surname families do not cross train, val, and test", function () {
  const left = buildDataset({ seed: 11, perName: 1, max: 24 });
  const right = buildDataset({ seed: 11, perName: 1, max: 24 });
  assert.deepStrictEqual(left, right);

  const surnameSplits = new Map();
  ["train", "val", "test"].forEach(function (split) {
    left.buckets[split].forEach(function (row) {
      const target = JSON.parse(row.target);
      assert.strictEqual(typeof row.input, "string");
      assert.strictEqual(typeof row.target, "string");
      assert.ok(row.corruptions.length >= 1 && row.corruptions.length <= 3);
      assert.ok(row.id.indexOf(split + "-") === 0);
      const previous = surnameSplits.get(target.last);
      if (previous) assert.strictEqual(previous, split);
      surnameSplits.set(target.last, split);
    });
  });

  assert.ok(left.buckets.train.length > 0);
  assert.ok(left.buckets.val.length > 0);
  assert.ok(left.buckets.test.length > 0);

  const reasons = left.pairs.map(function (pair) { return pair.reason; });
  assert.ok(reasons.indexOf("surface") !== -1);
  assert.ok(reasons.indexOf("diminutive") !== -1);
  assert.ok(reasons.indexOf("gendered_surname") !== -1);
  assert.ok(reasons.indexOf("one_letter") !== -1);
});

test("assignSplits is deterministic and covers every family once", function () {
  const families = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
  const once = assignSplits(families, mulberry32(2));
  const twice = assignSplits(families, mulberry32(2));
  assert.deepStrictEqual(Array.from(once.entries()), Array.from(twice.entries()));
  assert.strictEqual(once.size, families.length);
  const counts = { train: 0, val: 0, test: 0 };
  once.forEach(function (split) { counts[split] += 1; });
  assert.ok(counts.train > 0 && counts.val > 0 && counts.test > 0);
});

test("the catalog groups gendered surname forms under one family", function () {
  const catalog = buildCatalog();
  const georg = catalog.surnames.filter(function (entry) {
    return entry.family === "Γεώργ";
  });
  const genders = georg.map(function (entry) { return entry.gender; }).sort();
  assert.ok(genders.indexOf("M") !== -1);
  assert.ok(genders.indexOf("F") !== -1);
  assert.ok(genders.indexOf("Both") !== -1);
});

test("writeDataset writes the four jsonl files", function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gnc-data-"));
  const dataset = buildDataset({ seed: 1, perName: 1, max: 6 });
  writeDataset(dataset, dir);
  ["train.jsonl", "val.jsonl", "test.jsonl", "pairs.jsonl"].forEach(function (name) {
    assert.ok(fs.existsSync(path.join(dir, name)));
  });
});
