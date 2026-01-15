// cases.js
"use strict";

const { oxytoneNames, namesAsIsPattern } = require("./constants");
const { isGreekParticle } = require("./utils");

// Convert to genitive case
function convertToGenitive(name) {
  const parts = name.split(/\s+/);
  const lastName = parts[parts.length - 1];
  const lowerLast = lastName.toLowerCase();

  let genitive = lastName;

  // Male genitive rules
  if (lowerLast.endsWith("ος")) {
    genitive = lastName.slice(0, -2) + "ου";
  } else if (lowerLast.endsWith("ας")) {
    genitive = lastName.slice(0, -2) + "α";
  } else if (lowerLast.endsWith("ης")) {
    genitive = lastName.slice(0, -2) + "η";
  }
  // Female names often stay the same or change differently
  else if (lowerLast.endsWith("ου")) {
    genitive = lastName; // Already genitive
  } else if (lowerLast.endsWith("α")) {
    genitive = lastName.slice(0, -1) + "ας";
  } else if (lowerLast.endsWith("η")) {
    genitive = lastName.slice(0, -1) + "ης";
  }

  parts[parts.length - 1] = genitive;
  return parts.join(" ");
}

// Check if a name is oxytone (stressed on last syllable)
function isOxytone(name) {
  const lowerName = name.toLowerCase();

  // Check against known oxytone names
  if (oxytoneNames.includes(lowerName)) {
    return true;
  }

  // Try to detect based on accent position
  // If the accent is on the last syllable, it's oxytone
  const accentedVowels = [
    "ά",
    "έ",
    "ή",
    "ί",
    "ό",
    "ύ",
    "ώ",
    "Ά",
    "Έ",
    "Ή",
    "Ί",
    "Ό",
    "Ύ",
    "Ώ"
  ];

  // Check if name ends with -ός (accented o + sigma)
  if (name.length >= 2) {
    const secondLastChar = name[name.length - 2];
    const lastChar = name[name.length - 1];

    // If name ends with accented ό + ς, it's oxytone (e.g., Νικολός)
    if (
      (secondLastChar === "ό" || secondLastChar === "Ό") &&
      lastChar === "ς"
    ) {
      return true;
    }

    // If name ends with accented vowel + ς (and it's not -ος pattern), check further
    if (accentedVowels.includes(secondLastChar) && lastChar === "ς") {
      // Check if it's a pattern like -άς, -ής, etc. (not -ος)
      const ending = name.slice(-3).toLowerCase();
      if (ending.endsWith("ός")) {
        return true;
      }
    }
  }

  // Default: assume paroxytone (most common for -ος names)
  return false;
}

// Convert to vocative case
// Converts all name parts (first name and last name), but skips particles
function convertToVocative(name, config) {
  const parts = name.split(/\s+/);
  const processedParts = parts.map((part) => {
    const lowerPart = part.toLowerCase();

    // Skip particles - they don't change in vocative
    if (config.handleParticles && isGreekParticle(lowerPart)) {
      return part;
    }

    let vocative = part;

    // Handle masculine names ending in -ος
    if (lowerPart.endsWith("ος")) {
      if (isOxytone(part)) {
        // Oxytone: remains unchanged
        vocative = part;
      } else {
        // Paroxytone: -ος → -ε
        vocative = part.slice(0, -2) + "ε";
      }
    }
    // Handle masculine names ending in -ης
    else if (lowerPart.endsWith("ης")) {
      vocative = part.slice(0, -2) + "η";
    }
    // Handle masculine names ending in -ας
    else if (lowerPart.endsWith("ας")) {
      // Check if it's actually -ης pattern
      if (namesAsIsPattern.some((pattern) => lowerPart.includes(pattern))) {
        vocative = part.slice(0, -2) + "η";
      } else {
        vocative = part.slice(0, -2) + "α";
      }
    }
    // Handle masculine names ending in -ούς
    else if (lowerPart.endsWith("ούς")) {
      vocative = part.slice(0, -3) + "ού";
    }
    // Names ending in -ου (genitive forms) usually remain unchanged
    else if (lowerPart.endsWith("ου")) {
      vocative = part; // Keep as is (already genitive form)
    }
    // Feminine names usually remain unchanged
    // (already handled by default vocative = part)

    return vocative;
  });

  return processedParts.join(" ");
}

// Convert to accusative case
// Converts all name parts (first name and last name), but skips particles
function convertToAccusative(name, config) {
  const parts = name.split(/\s+/);
  const processedParts = parts.map((part) => {
    const lowerPart = part.toLowerCase();

    // Skip particles - they don't change in accusative
    if (config.handleParticles && isGreekParticle(lowerPart)) {
      return part;
    }

    let accusative = part;

    // Handle masculine names ending in -ος
    if (lowerPart.endsWith("ος")) {
      // Accusative: -ος → -ο (consistent, no stress dependency)
      accusative = part.slice(0, -2) + "ο";
    }
    // Handle masculine names ending in -ης
    else if (lowerPart.endsWith("ης")) {
      accusative = part.slice(0, -2) + "η";
    }
    // Handle masculine names ending in -ας
    else if (lowerPart.endsWith("ας")) {
      // Check if it's actually -ης pattern
      if (namesAsIsPattern.some((pattern) => lowerPart.includes(pattern))) {
        accusative = part.slice(0, -2) + "η";
      } else {
        accusative = part.slice(0, -2) + "α";
      }
    }
    // Handle masculine names ending in -ούς
    else if (lowerPart.endsWith("ούς")) {
      accusative = part.slice(0, -3) + "ού";
    }
    // Names ending in -ου (genitive forms) usually remain unchanged
    else if (lowerPart.endsWith("ου")) {
      accusative = part; // Keep as is (already genitive form)
    }
    // Feminine names usually remain unchanged
    // (already handled by default accusative = part)

    return accusative;
  });

  return processedParts.join(" ");
}

module.exports = {
  convertToGenitive,
  convertToVocative,
  convertToAccusative,
  isOxytone
};
