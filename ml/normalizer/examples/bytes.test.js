"use strict";

const assert = require("assert");
const test = require("node:test");
const { encodeByT5, decodeByT5 } = require("./bytes.js");
const { surnameKnown, baselineRow } = require("../rules_baseline.js");

test("byte ids round-trip Greek text and a JSON target", function () {
  const text = "Γιώργος Παπαδόπουλος";
  const ids = encodeByT5(text);
  assert.strictEqual(ids[ids.length - 1], 1);
  assert.strictEqual(decodeByT5(ids), text);
  const target = "{\"corrected\":\"Γιώργος\"}";
  assert.strictEqual(decodeByT5(encodeByT5(target)), target);
});

test("the library dictionary mark matches explainConfidence", function () {
  assert.strictEqual(surnameKnown("Γιώργος"), true);
  assert.strictEqual(surnameKnown("Πρόδρομος"), false);
});

test("the rules baseline returns the Phase 3 label fields", function () {
  const row = baselineRow("Γιώργος Παπαδόπουλος", "Παπαδόπουλος");
  assert.strictEqual(row.rules.corrected, "Γιώργος Παπαδόπουλος");
  assert.strictEqual(row.rules.gender, "male");
  assert.strictEqual(row.rules.first, "Γιώργος");
  assert.strictEqual(row.rules.last, "Παπαδόπουλος");
  assert.ok(row.rules.vocative);
  assert.ok(row.rules.genitive);
  assert.ok(row.rules_greeklish.corrected);
});
