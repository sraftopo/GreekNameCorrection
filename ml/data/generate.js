#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { buildCatalog } = require("./catalog");
const { labelName } = require("./label");
const {
  mulberry32,
  shuffle,
  stripAccents,
  editDistance,
  applyCorruptions
} = require("./corrupt");

const TITLES = ["Δρ", "Καθ", "Κος", "Κα", "Κυρία", "Κύριος"];

function parseArgs(argv) {
  const options = {
    seed: 1,
    perName: 2,
    max: 500,
    out: path.join("ml", "data", "out")
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--seed") {
      options.seed = readNumber(argv[++i], "--seed");
    } else if (arg === "--per-name") {
      options.perName = readNumber(argv[++i], "--per-name");
    } else if (arg === "--max") {
      options.max = readNumber(argv[++i], "--max");
    } else if (arg === "--out") {
      options.out = argv[++i];
      if (!options.out) throw new Error("--out needs a directory");
    } else {
      throw new Error("Unknown argument: " + arg);
    }
  }

  if (!Number.isInteger(options.seed)) throw new Error("--seed must be an integer");
  if (!Number.isInteger(options.perName) || options.perName < 1) {
    throw new Error("--per-name must be an integer >= 1");
  }
  if (!Number.isInteger(options.max) || options.max < 1) {
    throw new Error("--max must be an integer >= 1");
  }
  return options;
}

function readNumber(value, flag) {
  if (value == null || value === "") throw new Error(flag + " needs a number");
  return Number(value);
}

function helpText() {
  return [
    "Usage: node ml/data/generate.js [--seed N] [--per-name N] [--max N] [--out DIR]",
    "",
    "Builds synthetic Greek name rows from the name lists in generate_greek_names.js.",
    "Labels come from the library. Splits are by surname family, so a surname and its",
    "gendered forms stay in one of train, val, or test.",
    "",
    "Writes train.jsonl, val.jsonl, test.jsonl, and pairs.jsonl."
  ].join("\n");
}

function assignSplits(familyIds, rng) {
  const ids = shuffle(familyIds.slice().sort(), rng);
  const n = ids.length;
  let nTest = Math.floor(n * 0.1);
  let nVal = Math.floor(n * 0.1);
  if (n >= 3) {
    nTest = Math.max(1, nTest);
    nVal = Math.max(1, nVal);
  }
  if (nTest + nVal >= n) {
    nTest = n > 2 ? 1 : 0;
    nVal = n > 1 ? 1 : 0;
  }

  const splitOf = new Map();
  ids.forEach(function (id, index) {
    let split = "train";
    if (index < nTest) split = "test";
    else if (index < nTest + nVal) split = "val";
    splitOf.set(id, split);
  });
  return splitOf;
}

function compose(title, first, fatherGenitive, surname) {
  const tokens = [];
  if (title) tokens.push(title);
  tokens.push(first);
  if (fatherGenitive) tokens.push("του", fatherGenitive);
  tokens.push(surname);
  return tokens.join(" ");
}

function counterpartSurname(catalog, surname) {
  if (surname.gender !== "M" && surname.gender !== "F") return null;
  const want = surname.gender === "M" ? "F" : "M";
  for (let i = 0; i < catalog.surnames.length; i++) {
    const other = catalog.surnames[i];
    if (other.family === surname.family && other.gender === want) return other;
  }
  return null;
}

function oneLetterIndex(firstNames) {
  const bases = firstNames.filter(function (entry) {
    return !entry.base;
  });
  const stripped = bases.map(function (entry) {
    return stripAccents(entry.accented).toLowerCase();
  });
  const index = new Map();
  const pairs = [];
  for (let i = 0; i < bases.length; i++) {
    for (let j = i + 1; j < bases.length; j++) {
      if (bases[i].gender !== bases[j].gender) continue;
      if (Math.abs(stripped[i].length - stripped[j].length) > 1) continue;
      if (editDistance(stripped[i], stripped[j]) !== 1) continue;
      pairs.push([bases[i], bases[j]]);
      if (!index.has(bases[i].accented)) index.set(bases[i].accented, []);
      if (!index.has(bases[j].accented)) index.set(bases[j].accented, []);
      index.get(bases[i].accented).push(bases[j]);
      index.get(bases[j].accented).push(bases[i]);
    }
  }
  return { index: index, pairs: pairs };
}

function nextPerson(people, cursor, gender) {
  const pool = people[gender];
  if (!pool.length) return null;
  const person = pool[cursor[gender] % pool.length];
  cursor[gender] += 1;
  return person;
}

function buildCleanNames(catalog, max, rng) {
  const bases = catalog.firstNames.filter(function (entry) {
    return !entry.base;
  });
  const people = {
    M: bases.filter(function (entry) { return entry.gender === "M"; }),
    F: bases.filter(function (entry) { return entry.gender === "F"; })
  };
  const cursor = { M: 0, F: 0 };
  const surnames = {
    M: shuffle(catalog.surnames.filter(function (entry) {
      return entry.gender === "M" || entry.gender === "Both";
    }), rng),
    F: shuffle(catalog.surnames.filter(function (entry) {
      return entry.gender === "F" || entry.gender === "Both";
    }), rng)
  };
  const oneLetter = oneLetterIndex(catalog.firstNames);
  const neighbors = oneLetter.index;
  const diminutiveBudget = Math.max(1, Math.floor(max * 0.15));
  const twinBudget = Math.max(1, Math.floor(max * 0.15));
  let diminutivesAdded = 0;
  let twinsAdded = 0;
  const seen = new Set();
  const cleans = [];

  function pushRow(row) {
    if (cleans.length >= max) return false;
    if (seen.has(row.text)) return false;
    seen.add(row.text);
    cleans.push(row);
    return true;
  }

  const seededSurname = { M: 0, F: 0 };
  oneLetter.pairs.forEach(function (pair) {
    if (twinsAdded >= twinBudget || cleans.length + 1 >= max) return;
    const gender = pair[0].gender;
    const list = surnames[gender];
    if (!list.length) return;
    const surname = list[seededSurname[gender] % list.length];
    seededSurname[gender] += 1;
    let added = false;
    pair.forEach(function (person) {
      const text = compose(null, person.accented, null, surname.accented);
      if (pushRow({
        text: text,
        family: surname.family,
        surname: surname.accented,
        first: person.accented,
        baseFirst: null,
        personGender: person.gender,
        title: null,
        father: null
      })) {
        added = true;
      }
    });
    if (added) twinsAdded += 1;
  });

  const sequence = [];
  const longer = Math.max(surnames.M.length, surnames.F.length);
  for (let i = 0; i < longer; i++) {
    if (i < surnames.M.length) sequence.push(surnames.M[i]);
    if (i < surnames.F.length) sequence.push(surnames.F[i]);
  }

  for (let i = 0; i < sequence.length && cleans.length < max; i++) {
    const surname = sequence[i];
    const gender = surname.gender === "F" ? "F" : surname.gender === "M" ? "M" : (rng() < 0.5 ? "M" : "F");
    const person = nextPerson(people, cursor, gender);
    if (!person) continue;

    const useFather = rng() < 0.25;
    const useTitle = rng() < 0.15;
    const father = useFather ? people.M[Math.floor(rng() * people.M.length)] : null;
    const fatherGenitive = father
      ? labelName(father.accented).genitive
      : null;
    const title = useTitle ? TITLES[Math.floor(rng() * TITLES.length)] : null;
    const text = compose(title, person.accented, fatherGenitive, surname.accented);
    pushRow({
      text: text,
      family: surname.family,
      surname: surname.accented,
      first: person.accented,
      baseFirst: null,
      personGender: person.gender,
      title: title,
      father: fatherGenitive
    });
    if (cleans.length >= max) break;

    const otherSurname = counterpartSurname(catalog, surname);
    if (otherSurname) {
      const otherGender = otherSurname.gender === "F" ? "F" : "M";
      const otherPerson = nextPerson(people, cursor, otherGender);
      if (otherPerson) {
        const otherText = compose(null, otherPerson.accented, null, otherSurname.accented);
        pushRow({
          text: otherText,
          family: otherSurname.family,
          surname: otherSurname.accented,
          first: otherPerson.accented,
          baseFirst: null,
          personGender: otherPerson.gender,
          title: null,
          father: null
        });
      }
    }
    if (cleans.length >= max) break;

    if (diminutivesAdded < diminutiveBudget) {
      const diminutive = catalog.firstNames.find(function (entry) {
        return entry.base === person.accented;
      });
      if (diminutive) {
        const dimText = compose(title, diminutive.accented, fatherGenitive, surname.accented);
        if (pushRow({
          text: dimText,
          family: surname.family,
          surname: surname.accented,
          first: diminutive.accented,
          baseFirst: person.accented,
          personGender: diminutive.gender,
          title: title,
          father: fatherGenitive
        })) {
          diminutivesAdded += 1;
        }
      }
    }
    if (cleans.length >= max) break;

    if (twinsAdded < twinBudget) {
      const twinPool = neighbors.get(person.accented) || [];
      const twin = twinPool.find(function (entry) {
        return entry.gender === person.gender;
      });
      if (twin) {
        const twinText = compose(title, twin.accented, fatherGenitive, surname.accented);
        if (pushRow({
          text: twinText,
          family: surname.family,
          surname: surname.accented,
          first: twin.accented,
          baseFirst: null,
          personGender: twin.gender,
          title: title,
          father: fatherGenitive
        })) {
          twinsAdded += 1;
        }
      }
    }
  }

  return cleans;
}

function buildPairs(labeled) {
  const pairs = [];

  labeled.forEach(function (row) {
    const stripped = stripAccents(row.target.corrected);
    if (stripped !== row.target.corrected) {
      pairs.push({
        type: "positive",
        split: row.split,
        a: row.target.corrected,
        b: stripped,
        reason: "surface"
      });
    }
  });

  labeled.forEach(function (row) {
    if (!row.clean.baseFirst) return;
    const base = labeled.find(function (other) {
      return other.split === row.split &&
        other.clean.family === row.clean.family &&
        other.clean.first === row.clean.baseFirst &&
        other.clean.father === row.clean.father &&
        other.clean.title === row.clean.title;
    });
    if (!base) return;
    pairs.push({
      type: "positive",
      split: row.split,
      a: base.target.corrected,
      b: row.target.corrected,
      reason: "diminutive"
    });
  });

  const byFamily = new Map();
  labeled.forEach(function (row) {
    if (row.clean.baseFirst) return;
    const key = row.split + "\0" + row.clean.family;
    if (!byFamily.has(key)) byFamily.set(key, []);
    byFamily.get(key).push(row);
  });
  byFamily.forEach(function (rows) {
    const male = rows.find(function (row) {
      return row.clean.personGender === "M";
    });
    const female = rows.find(function (row) {
      return row.clean.personGender === "F";
    });
    if (!male || !female) return;
    if (male.clean.surname === female.clean.surname) return;
    pairs.push({
      type: "hard_negative",
      split: male.split,
      a: male.target.corrected,
      b: female.target.corrected,
      reason: "gendered_surname"
    });
  });

  const bySurname = new Map();
  labeled.forEach(function (row) {
    if (row.clean.baseFirst) return;
    const key = row.split + "\0" + row.clean.surname;
    if (!bySurname.has(key)) bySurname.set(key, []);
    bySurname.get(key).push(row);
  });
  bySurname.forEach(function (rows) {
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const left = stripAccents(rows[i].clean.first).toLowerCase();
        const right = stripAccents(rows[j].clean.first).toLowerCase();
        if (editDistance(left, right) !== 1) continue;
        pairs.push({
          type: "hard_negative",
          split: rows[i].split,
          a: rows[i].target.corrected,
          b: rows[j].target.corrected,
          reason: "one_letter"
        });
        return;
      }
    }
  });

  return pairs;
}

function buildDataset(options) {
  const rng = mulberry32(options.seed >>> 0);
  const catalog = buildCatalog();
  const cleans = buildCleanNames(catalog, options.max, rng);
  const families = [];
  const seenFamilies = new Set();
  cleans.forEach(function (clean) {
    if (seenFamilies.has(clean.family)) return;
    seenFamilies.add(clean.family);
    families.push(clean.family);
  });
  const splitOf = assignSplits(families, rng);
  const labeled = cleans.map(function (clean) {
    return {
      clean: clean,
      split: splitOf.get(clean.family) || "train",
      target: labelName(clean.text)
    };
  });

  const buckets = { train: [], val: [], test: [] };
  labeled.forEach(function (row) {
    for (let n = 0; n < options.perName; n++) {
      const corrupted = applyCorruptions(row.target.corrected, rng);
      buckets[row.split].push({
        input: corrupted.text,
        target: JSON.stringify(row.target),
        corruptions: corrupted.corruptions,
        split: row.split
      });
    }
  });

  ["train", "val", "test"].forEach(function (split) {
    buckets[split].forEach(function (row, index) {
      row.id = split + "-" + String(index + 1).padStart(6, "0");
    });
  });

  const pairs = buildPairs(labeled).map(function (pair, index) {
    pair.id = "pair-" + String(index + 1).padStart(6, "0");
    return pair;
  });

  return {
    buckets: buckets,
    pairs: pairs
  };
}

function writeJsonl(file, rows) {
  const body = rows.map(function (row) {
    return JSON.stringify(row);
  }).join("\n");
  fs.writeFileSync(file, body.length ? body + "\n" : "", "utf8");
}

function writeDataset(dataset, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  writeJsonl(path.join(outDir, "train.jsonl"), dataset.buckets.train);
  writeJsonl(path.join(outDir, "val.jsonl"), dataset.buckets.val);
  writeJsonl(path.join(outDir, "test.jsonl"), dataset.buckets.test);
  writeJsonl(path.join(outDir, "pairs.jsonl"), dataset.pairs);
}

function main(argv) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(helpText());
    return;
  }
  const dataset = buildDataset(options);
  writeDataset(dataset, options.out);
  console.log(
    "Wrote " + dataset.buckets.train.length + " train, " +
    dataset.buckets.val.length + " val, " +
    dataset.buckets.test.length + " test, " +
    dataset.pairs.length + " pairs to " + options.out
  );
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = {
  parseArgs: parseArgs,
  assignSplits: assignSplits,
  buildDataset: buildDataset,
  writeDataset: writeDataset
};
