// utils.js
"use strict";

const {
  titles,
  diminutivePatterns,
  katharevousaMap,
  commonCorrections
} = require("./constants");

// Capitalize Greek names properly
function capitalizeGreekName(str) {
  if (!str || str.length === 0) return str;

  const first = str.charAt(0).toUpperCase();
  const rest = str.slice(1).toLowerCase();

  return first + rest;
}

// Check if word is a Greek particle
function isGreekParticle(word) {
  const particles = [
    "του",
    "της",
    "των",
    "τον",
    "την",
    "τα",
    "το",
    "και",
    "ή",
    "ειδών",
    "εκ",
    "εξ"
  ];
  return particles.includes(word);
}

// Extract title from name
function extractTitle(name) {
  const words = name.trim().split(/\s+/);
  const firstWord = words[0];

  // Check if first word is a title (case-insensitive)
  const foundTitle = titles.find(
    (t) =>
      firstWord.toLowerCase() === t.toLowerCase() ||
      firstWord.toLowerCase() + "." === t.toLowerCase() ||
      firstWord.toLowerCase() === t.toLowerCase() + "."
  );

  if (foundTitle) {
    return {
      title: capitalizeGreekName(foundTitle),
      name: words.slice(1).join(" ")
    };
  }

  return { title: null, name: name };
}

// Convert Katharevousa to modern Greek
function convertKatharevousa(text) {
  let result = text;

  for (const [old, modern] of Object.entries(katharevousaMap)) {
    const regex = new RegExp(old + "$", "i");
    result = result.replace(regex, modern);
  }

  return result;
}

// Suggest correction for common misspellings
function suggestCorrection(text) {
  const words = text.toLowerCase().split(/\s+/);
  let corrected = false;

  const correctedWords = words.map((word) => {
    if (commonCorrections[word]) {
      corrected = true;
      return commonCorrections[word];
    }
    return word;
  });

  return corrected ? correctedWords.join(" ") : null;
}

// Detect diminutive forms
function detectDiminutive(name) {
  const parts = name.toLowerCase().split(/\s+/);
  const results = [];

  for (const part of parts) {
    for (const [ending, baseEnding] of Object.entries(diminutivePatterns)) {
      if (part.endsWith(ending)) {
        results.push({
          word: capitalizeGreekName(part),
          isDiminutive: true,
          possibleBase: part.slice(0, -ending.length) + baseEnding,
          diminutiveType: ending
        });
        break;
      }
    }
  }

  return results.length > 0 ? results : null;
}

// Make database-safe
function makeDatabaseSafe(text) {
  // Remove potentially problematic characters for databases
  return text
    .replace(/[^\u0370-\u03FF\u1F00-\u1FFF\w\s\-']/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

// Generate sorting key (remove accents for sorting)
function generateSortKey(text) {
  const accentMap = {
    ά: "α",
    έ: "ε",
    ή: "η",
    ί: "ι",
    ό: "ο",
    ύ: "υ",
    ώ: "ω",
    Ά: "Α",
    Έ: "Ε",
    Ή: "Η",
    Ί: "Ι",
    Ό: "Ο",
    Ύ: "Υ",
    Ώ: "Ω",
    ϊ: "ι",
    ϋ: "υ",
    ΐ: "ι",
    ΰ: "υ",
    Ϊ: "Ι",
    Ϋ: "Υ",
    ς: "σ"
  };

  let sortKey = text.toLowerCase();
  for (const [accented, plain] of Object.entries(accentMap)) {
    sortKey = sortKey.replace(new RegExp(accented, "g"), plain);
  }

  return sortKey;
}

// Generate statistics
function generateStatistics(processed, original) {
  const words = processed
    .split(/\s+/)
    .filter((w) => !isGreekParticle(w.toLowerCase()));

  const stats = {
    length: processed.length,
    originalLength: original.length,
    wordCount: words.length,
    hasParticles: processed
      .split(/\s+/)
      .some((w) => isGreekParticle(w.toLowerCase())),
    hasAccents: /[άέήίόύώΆΈΉΊΌΎΏ]/.test(processed),
    hasDiaeresis: /[ϊϋΐΰ]/.test(processed),
    isAllCaps:
      original === original.toUpperCase() && /[Α-Ωα-ω]/.test(original),
    isAllLower:
      original === original.toLowerCase() && /[Α-Ωα-ω]/.test(original),
    hasNumbers: /\d/.test(processed),
    hasSpecialChars: /[^Α-Ωα-ωίϊΐόάέύϋΰήώ\s\-']/.test(processed)
  };

  return stats;
}

// Detect gender from name endings
function detectGender(fullname) {
  // Remove title if present
  const parts = fullname.split(/\s+/).filter((w) => !titles.includes(w));
  const lastName = parts[parts.length - 1]?.toLowerCase();

  if (!lastName) return "unknown";

  const maleEndings = ["ος", "ης", "ας", "ούς"];
  const femaleEndings = ["ου", "α", "η"];

  for (const ending of maleEndings) {
    if (lastName.endsWith(ending)) return "male";
  }

  for (const ending of femaleEndings) {
    if (lastName.endsWith(ending)) return "female";
  }

  return "unknown";
}

// Split name into parts
function splitNameParts(fullname) {
  const parts = fullname
    .split(/\s+/)
    .filter((p) => {
      const lowerP = p.toLowerCase();
      return !isGreekParticle(lowerP) && 
             !titles.includes(p) && 
             !titles.some(t => t.toLowerCase() === lowerP) &&
             lowerP !== "κ." && 
             lowerP !== "κα";
    });

  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  if (parts.length === 2) return { firstName: parts[0], lastName: parts[1] };

  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1]
  };
}

// Add general title (κ. for men, κα for women) if no title exists
function addGeneralTitleIfMissing(nameWithoutTitle) {
  if (!nameWithoutTitle || nameWithoutTitle.trim() === "") {
    return null;
  }

  // Detect gender from the name
  const gender = detectGender(nameWithoutTitle);

  // Add appropriate title based on gender (always lowercase)
  if (gender === "male") {
    return "κ.";
  } else if (gender === "female") {
    return "κα";
  }

  // If gender is unknown, don't add a title
  return null;
}

module.exports = {
  capitalizeGreekName,
  isGreekParticle,
  extractTitle,
  convertKatharevousa,
  suggestCorrection,
  detectDiminutive,
  makeDatabaseSafe,
  generateSortKey,
  generateStatistics,
  detectGender,
  splitNameParts,
  addGeneralTitleIfMissing
};
