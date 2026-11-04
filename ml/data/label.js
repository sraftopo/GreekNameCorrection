"use strict";

const GreekNameCorrection = require("../../index.js");

function labelName(clean) {
  const base = GreekNameCorrection(clean, {
    preserveOriginal: true,
    detectGender: true,
    splitNames: true,
    handleTitles: true,
    generateSortKey: true,
    convertToGenitive: true
  });
  const vocative = GreekNameCorrection(clean, {
    preserveOriginal: true,
    handleTitles: true,
    convertToCase: "vocative"
  });
  const accusative = GreekNameCorrection(clean, {
    preserveOriginal: true,
    handleTitles: true,
    convertToCase: "accusative"
  });

  return {
    corrected: base.corrected,
    first: base.parts ? base.parts.firstName : "",
    last: base.parts ? base.parts.lastName : "",
    father: base.parts && base.parts.middleName ? base.parts.middleName : null,
    title: base.title || null,
    gender: base.gender,
    genitive: base.genitive,
    vocative: vocative.vocative,
    accusative: accusative.accusative,
    sortKey: base.sortKey
  };
}

module.exports = {
  labelName: labelName
};
