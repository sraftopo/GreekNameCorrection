// transliteration.js
"use strict";

const {
  greeklishToGreekMap,
  greekToLatinMap,
  greekToGreeklishMap
} = require("./constants");

// Transliteration function
function transliterate(text, mode) {
  if (mode === "greeklish-to-greek") {
    return greeklishToGreek(text);
  } else if (mode === "greek-to-latin") {
    return greekToLatin(text);
  } else if (mode === "greek-to-greeklish") {
    return greekToGreeklish(text);
  }
  return text;
}

// Greeklish to Greek conversion
function greeklishToGreek(text) {
  let result = text.toLowerCase();

  // Sort by length (longest first) to handle multi-character combinations
  const sortedKeys = Object.keys(greeklishToGreekMap).sort(
    (a, b) => b.length - a.length
  );

  for (const key of sortedKeys) {
    const regex = new RegExp(key, "gi");
    result = result.replace(regex, greeklishToGreekMap[key]);
  }

  return result;
}

// Greek to Latin conversion
function greekToLatin(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += greekToLatinMap[char] || char;
  }
  return result;
}

// Greek to Greeklish conversion
function greekToGreeklish(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += greekToGreeklishMap[char] || char;
  }
  return result;
}

module.exports = {
  transliterate,
  greeklishToGreek,
  greekToLatin,
  greekToGreeklish
};
