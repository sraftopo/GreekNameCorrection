"use strict";

const lists = require("../../generate_greek_names");

function addFirst(first, accented, gender, base) {
  if (!accented || first.has(accented)) return;
  first.set(accented, {
    accented: accented,
    gender: gender,
    type: "first",
    base: base || null
  });
}

function addSurname(surnames, accented, gender, family) {
  if (!accented || surnames.has(accented)) return;
  surnames.set(accented, {
    accented: accented,
    gender: gender,
    type: "surname",
    family: family
  });
}

function buildCatalog() {
  const first = new Map();

  lists.maleFirstNames.forEach(function (name) {
    addFirst(first, name, "M", null);
  });
  lists.femaleFirstNames.forEach(function (name) {
    addFirst(first, name, "F", null);
  });
  lists.extraMaleNames.forEach(function (name) {
    addFirst(first, name, "M", null);
  });
  lists.extraFemaleNames.forEach(function (name) {
    addFirst(first, name, "F", null);
  });

  lists.maleFirstNames.slice(0, 30).forEach(function (name) {
    if (name.length <= 2) return;
    const root = name.slice(0, -2);
    lists.maleDiminutives.forEach(function (suffix) {
      addFirst(first, root + suffix, "M", name);
    });
  });

  lists.femaleFirstNames.slice(0, 30).forEach(function (name) {
    if (name.length <= 1) return;
    const root = name.slice(0, -1);
    lists.femaleDiminutives.forEach(function (suffix) {
      addFirst(first, root + suffix, "F", name);
    });
  });

  const surnames = new Map();

  lists.surnameRoots.forEach(function (root) {
    lists.surnamePatronymicSuffixes.forEach(function (entry) {
      addSurname(surnames, root + entry.suffix, entry.gender, root);
    });
  });

  lists.surnameCompoundPrefixes.forEach(function (prefix) {
    lists.surnameRoots.forEach(function (root) {
      lists.surnamePatronymicSuffixes.forEach(function (entry) {
        const family = prefix + root.toLowerCase();
        addSurname(
          surnames,
          family + entry.suffix,
          entry.gender,
          family
        );
      });
    });
  });

  lists.occupationalSurnames.forEach(function (name) {
    addSurname(surnames, name, "Both", "occ:" + name);
  });
  lists.geographicalSurnames.forEach(function (name) {
    addSurname(surnames, name, "Both", "geo:" + name);
  });

  return {
    firstNames: Array.from(first.values()),
    surnames: Array.from(surnames.values())
  };
}

module.exports = {
  buildCatalog: buildCatalog
};
