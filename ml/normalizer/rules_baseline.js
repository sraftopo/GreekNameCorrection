"use strict";

const fs = require("fs");
const GreekNameCorrection = require("../../index.js");
const { labelName } = require("../data/label");

function surnameKnown(surname) {
  if (!surname) return false;
  const result = GreekNameCorrection(surname, {
    preserveOriginal: true,
    explainConfidence: true,
    handleTitles: false
  });
  if (!result || !result.confidence || !result.confidence.signals) return false;
  return result.confidence.signals.indexOf("name_not_in_dictionary") === -1;
}

function rulesFor(input) {
  return {
    rules: labelName(input),
    rules_greeklish: labelName(input, { transliterate: "greeklish-to-greek" })
  };
}

function baselineRow(input, surname) {
  const labeled = rulesFor(input);
  return {
    rules: labeled.rules,
    rules_greeklish: labeled.rules_greeklish,
    surname_known: surnameKnown(surname)
  };
}

function readStdin() {
  return fs.readFileSync(0, "utf8");
}

function main() {
  const text = readStdin();
  const lines = text.split(/\r?\n/).filter(function (line) {
    return line.trim().length > 0;
  });
  lines.forEach(function (line) {
    const row = JSON.parse(line);
    const result = baselineRow(row.input, row.surname || "");
    process.stdout.write(JSON.stringify(result) + "\n");
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  surnameKnown: surnameKnown,
  baselineRow: baselineRow
};
