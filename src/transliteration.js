// transliteration.js
"use strict";

const {
  greeklishToGreekMap,
  greekToLatinMap,
  greekToGreeklishMap
} = require("./constants");

const ambiguousGreeklishLetters = {
  i: true,
  h: true,
  y: true,
  o: true,
  w: true,
  e: true
};

// Transliteration function
function transliterate(text, mode, trace) {
  if (mode === "greeklish-to-greek") {
    return greeklishToGreek(text, trace);
  } else if (mode === "greek-to-latin") {
    return greekToLatin(text);
  } else if (mode === "greek-to-greeklish") {
    return greekToGreeklish(text);
  }
  return text;
}

// Greeklish to Greek conversion
function greeklishToGreek(text, trace) {
  let result = text.toLowerCase();

  // Sort by length (longest first) to handle multi-character combinations
  const sortedKeys = Object.keys(greeklishToGreekMap).sort(
    (a, b) => b.length - a.length
  );

  for (const key of sortedKeys) {
    const regex = new RegExp(key, "gi");
    if (
      trace &&
      key.length === 1 &&
      ambiguousGreeklishLetters[key] &&
      regex.test(result)
    ) {
      trace.ambiguous = true;
    }
    regex.lastIndex = 0;
    result = result.replace(regex, greeklishToGreekMap[key]);
  }

  if (trace && /[A-Za-z]/.test(result)) {
    trace.ambiguous = true;
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
