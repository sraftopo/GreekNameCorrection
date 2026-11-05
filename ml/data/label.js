"use strict";

const GreekNameCorrection = require("../../index.js");

function labelName(clean, extra) {
  const overlay = extra || {};
  const base = GreekNameCorrection(clean, Object.assign({
    preserveOriginal: true,
    detectGender: true,
    splitNames: true,
    handleTitles: true,
    generateSortKey: true,
    convertToGenitive: true
  }, overlay));
  const vocative = GreekNameCorrection(clean, Object.assign({
    preserveOriginal: true,
    handleTitles: true,
    convertToCase: "vocative"
  }, overlay));
  const accusative = GreekNameCorrection(clean, Object.assign({
    preserveOriginal: true,
    handleTitles: true,
    convertToCase: "accusative"
  }, overlay));

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
