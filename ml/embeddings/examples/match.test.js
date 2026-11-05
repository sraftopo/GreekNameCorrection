"use strict";

const assert = require("assert");
const test = require("node:test");
const { sortKeyOf, prefilter, cosine, vectorFromOutput, matchNames } = require("./match.js");

test("sortKeyOf uses the library key", function () {
  assert.strictEqual(sortKeyOf("Γιώργος Παπαδόπουλος"), "γιωργοσ παπαδοπουλοσ");
  assert.strictEqual(sortKeyOf("Γιωργος Παπαδοπουλος"), "γιωργοσ παπαδοπουλοσ");
});

test("prefilter keeps a shared sortKey token and drops the rest", function () {
  const kept = prefilter("Γιώργος Παπαδόπουλος", [
    "Γιωργος Παπαδοπουλος",
    "Μαρία Κωνσταντίνου"
  ]);
  assert.deepStrictEqual(kept, ["Γιωργος Παπαδοπουλος"]);
});

test("prefilter keeps every candidate when no token is shared", function () {
  const candidates = ["Μαρία Κωνσταντίνου", "Ελένη Νικολάου"];
  assert.deepStrictEqual(prefilter("Γιώργος Παπαδόπουλος", candidates), candidates);
});

test("cosine is 1 for the same vector", function () {
  assert.ok(Math.abs(cosine([1, 0], [1, 0]) - 1) < 1e-9);
  assert.ok(Math.abs(cosine([1, 0], [0, 1])) < 1e-9);
});

test("vectorFromOutput mean-pools token rows", function () {
  const output = {
    dims: [1, 2, 2],
    data: new Float32Array([1, 3, 3, 5])
  };
  assert.deepStrictEqual(vectorFromOutput(output), [2, 4]);
});

test("matchNames ranks the injected embeddings after the sortKey filter", async function () {
  const vectors = {
    "Γιώργος Παπαδόπουλος": [1, 0],
    "Γιωργος Παπαδοπουλος": [0.9, 0.1],
    "Μαρία Κωνσταντίνου": [0, 1]
  };
  const result = await matchNames(
    "Γιώργος Παπαδόπουλος",
    ["Μαρία Κωνσταντίνου", "Γιωργος Παπαδοπουλος"],
    {
      embed: async function (name) { return vectors[name]; },
      topK: 1
    }
  );
  assert.deepStrictEqual(result.considered, ["Γιωργος Παπαδοπουλος"]);
  assert.strictEqual(result.matches[0].name, "Γιωργος Παπαδοπουλος");
  assert.ok(result.matches[0].score > 0.9);
});
