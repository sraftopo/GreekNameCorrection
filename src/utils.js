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

// Check if a word already has an accent
function hasAccent(word) {
  return /[άέήίόύώΆΈΉΊΌΎΏ]/.test(word);
}

// Add accent to a single Greek word (ensures only one accent per word)
function addAccentsToGreekWord(word) {
  if (!word || word.trim() === "") {
    return word;
  }

  // If word already has an accent, return as is
  if (hasAccent(word)) {
    return word;
  }

  // Check if word is in commonCorrections map (which has accented versions)
  const lowerWord = word.toLowerCase();
  if (commonCorrections[lowerWord]) {
    // Preserve original capitalization
    const accented = commonCorrections[lowerWord];
    if (word[0] === word[0].toUpperCase()) {
      return capitalizeGreekName(accented);
    }
    return accented;
  }

  // Map of unaccented to accented vowels
  const accentMap = {
    α: "ά",
    ε: "έ",
    η: "ή",
    ι: "ί",
    ο: "ό",
    υ: "ύ",
    ω: "ώ",
    Α: "Ά",
    Ε: "Έ",
    Η: "Ή",
    Ι: "Ί",
    Ο: "Ό",
    Υ: "Ύ",
    Ω: "Ώ"
  };

  // Find vowels in the word
  const vowels = /[αεηιουωΑΕΗΙΟΥΩ]/g;
  const vowelMatches = [];
  let match;
  while ((match = vowels.exec(word)) !== null) {
    vowelMatches.push({
      index: match.index,
      char: match[0]
    });
  }

  if (vowelMatches.length === 0) {
    return word; // No vowels, can't add accent
  }

  // Determine accent position based on word ending and length
  let accentIndex = -1;
  const wordLower = word.toLowerCase();
  const lastChar = wordLower[wordLower.length - 1];
  const secondLastChar = wordLower.length > 1 ? wordLower[wordLower.length - 2] : "";

  // For words ending in -ος, -ης, -ας (masculine), accent typically on antepenultimate syllable
  // For words ending in -ου, -α, -η (feminine), accent typically on penultimate syllable
  // For short words (2-3 letters), accent on first vowel
  // For longer words, accent on penultimate or antepenultimate vowel

  if (wordLower.length <= 3) {
    // Short words: accent on first vowel
    accentIndex = 0;
  } else if (wordLower.endsWith("ος") || wordLower.endsWith("ης") || wordLower.endsWith("ας") || 
             wordLower.endsWith("ούς")) {
    // Masculine endings: try antepenultimate syllable (3rd from end)
    // If not enough vowels, use penultimate (2nd from end)
    if (vowelMatches.length >= 3) {
      accentIndex = vowelMatches.length - 3;
    } else if (vowelMatches.length >= 2) {
      accentIndex = vowelMatches.length - 2;
    } else {
      accentIndex = 0;
    }
  } else if (wordLower.endsWith("ου") || wordLower.endsWith("α") || wordLower.endsWith("η")) {
    // Feminine endings: accent on penultimate syllable (2nd from end)
    if (vowelMatches.length >= 2) {
      accentIndex = vowelMatches.length - 2;
    } else {
      accentIndex = 0;
    }
  } else {
    // Default: accent on penultimate vowel
    if (vowelMatches.length >= 2) {
      accentIndex = vowelMatches.length - 2;
    } else {
      accentIndex = 0;
    }
  }

  // Apply accent
  if (accentIndex >= 0 && accentIndex < vowelMatches.length) {
    const vowelPos = vowelMatches[accentIndex];
    const accentedChar = accentMap[vowelPos.char];
    
    if (accentedChar) {
      return word.substring(0, vowelPos.index) + 
             accentedChar + 
             word.substring(vowelPos.index + 1);
    }
  }

  return word;
}

// Add accents to firstname and lastname (each word gets only one accent)
function addAccentsToName(name) {
  if (!name || name.trim() === "") {
    return name;
  }

  // Split name into parts
  const parts = name.split(/\s+/);
  const result = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const lowerPart = part.toLowerCase();

    // Skip particles and titles
    if (isGreekParticle(lowerPart) || 
        titles.some(t => t.toLowerCase() === lowerPart || t.toLowerCase() + "." === lowerPart)) {
      result.push(part);
      continue;
    }

    // Add accent to the word
    const accentedPart = addAccentsToGreekWord(part);
    result.push(accentedPart);
  }

  return result.join(" ");
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
  addGeneralTitleIfMissing,
  addAccentsToGreekWord,
  addAccentsToName
};
