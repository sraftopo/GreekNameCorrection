// cases.js
"use strict";

const {
  oxytoneNames,
  namesAsIsPattern,
  paroxytoneSurnames,
  oxytoneSurnames,
  diminutiveVocativePatterns,
  vocativeInO_FirstNames,
  vocativeInE_FirstNames,
  specialVocativeCases
} = require("./constants");
const { isGreekParticle } = require("./utils");
const { getVocativeRules, getAccusativeRules } = require("./rulesParser");

// Convert to genitive case
// Converts all name parts (first name and last name), but skips particles
function convertToGenitive(name, config = {}) {
  const parts = name.split(/\s+/);
  const processedParts = parts.map((part) => {
    const lowerPart = part.toLowerCase();

    // Skip particles - they don't change in genitive
    if (config.handleParticles && isGreekParticle(lowerPart)) {
      return part;
    }

    let genitive = part;

    // Male genitive rules
    if (lowerPart.endsWith("ος")) {
      genitive = part.slice(0, -2) + "ου";
    } else if (lowerPart.endsWith("ας")) {
      genitive = part.slice(0, -2) + "α";
    } else if (lowerPart.endsWith("ης")) {
      genitive = part.slice(0, -2) + "η";
    }
    // Female names often stay the same or change differently
    else if (lowerPart.endsWith("ου")) {
      genitive = part; // Already genitive
    } else if (lowerPart.endsWith("α")) {
      genitive = part.slice(0, -1) + "ας";
    } else if (lowerPart.endsWith("η")) {
      genitive = part.slice(0, -1) + "ης";
    }

    return genitive;
  });

  return processedParts.join(" ");
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

// Check if a name part is likely a surname
// Heuristic: if it's the last part of a multi-part name, or if it's in the known surnames list
function isLikelySurname(part, index, totalParts) {
  const lowerPart = part.toLowerCase();
  
  // If it's the last part and there are multiple parts, it's likely a surname
  if (index === totalParts - 1 && totalParts > 1) {
    return true;
  }
  
  // Check against known surnames lists
  if (paroxytoneSurnames.includes(lowerPart) || oxytoneSurnames.includes(lowerPart)) {
    return true;
  }
  
  return false;
}

// Check if a surname is oxytone (for vocative purposes)
// For surnames ending in -ος, if they form vocative in -ε, they are oxytone
function isOxytoneSurname(part) {
  const lowerPart = part.toLowerCase();
  
  // Check explicit list first (normalize for comparison)
  const normalizedPart = lowerPart.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const surname of oxytoneSurnames) {
    const normalizedSurname = surname.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalizedPart === normalizedSurname || normalizedPart.includes(normalizedSurname)) {
      return true;
    }
  }
  
  // Check if it ends with -ός (accented ό + ς) - this is a clear oxytone marker
  if (part.length >= 2) {
    const secondLastChar = part[part.length - 2];
    const lastChar = part[part.length - 1];
    if ((secondLastChar === "ό" || secondLastChar === "Ό") && lastChar === "ς") {
      return true;
    }
  }
  
  // For surnames, if the last syllable has an accent, it might be oxytone
  // Check if there's an accent in the last two characters
  const lastTwo = part.slice(-2);
  const hasAccentInLastSyllable = /[άέήίόύώΆΈΉΊΌΎΏ]/.test(lastTwo);
  
  // Use the general isOxytone function as fallback
  return isOxytone(part) || hasAccentInLastSyllable;
}

// Check if a name matches a diminutive pattern
function isDiminutivePattern(lowerPart) {
  return diminutiveVocativePatterns.some((pattern) =>
    lowerPart.endsWith(pattern)
  );
}

// Convert to vocative case
// Converts all name parts (first name and last name), but skips particles
function convertToVocative(name, config) {
  // Try to load parsed rules from markdown, fallback to hard-coded rules
  const parsedRules = getVocativeRules();
  
  const parts = name.split(/\s+/);
  const totalParts = parts.length;
  
  const processedParts = parts.map((part, index) => {
    const lowerPart = part.toLowerCase();

    // Skip particles - they don't change in vocative
    if (config.handleParticles && isGreekParticle(lowerPart)) {
      return part;
    }

    let vocative = part;

    // Check for special cases first (e.g., Παύλος)
    // Try parsed rules first, then fallback to hard-coded
    const specialCases = parsedRules?.specialCases || specialVocativeCases;
    if (specialCases[lowerPart]) {
      const specialForm = specialCases[lowerPart];
      // Preserve original capitalization
      if (part[0] === part[0].toUpperCase()) {
        return specialForm.charAt(0).toUpperCase() + specialForm.slice(1);
      }
      return specialForm;
    }

    // Handle masculine names ending in -ος
    if (lowerPart.endsWith("ος")) {
      // Check if it's a diminutive pattern first
      if (isDiminutivePattern(lowerPart)) {
        // Diminutives: -ος → -ο
        vocative = part.slice(0, -2) + "ο";
      }
      // Use parsed rules if available, otherwise use hard-coded lists
      else {
        // Get name lists from parsed rules or fallback to hard-coded
        const firstNamesInO = parsedRules?.osEndings?.firstNames?.paroxytone?.inO || vocativeInO_FirstNames;
        const firstNamesInE = parsedRules?.osEndings?.firstNames?.paroxytone?.inE || vocativeInE_FirstNames;
        const firstNamesUnchanged = parsedRules?.osEndings?.firstNames?.oxytone?.unchanged || oxytoneNames;
        
        // Check explicit list of first names that form vocative in -ο
        if (firstNamesInO.includes(lowerPart)) {
          vocative = part.slice(0, -2) + "ο";
        }
        // Check explicit list of first names that form vocative in -ε
        else if (firstNamesInE.includes(lowerPart)) {
          vocative = part.slice(0, -2) + "ε";
        }
        // Check if it's likely a surname (by position or explicit list)
        else if (isLikelySurname(part, index, totalParts)) {
          // For surnames, check if oxytone
          if (isOxytoneSurname(part)) {
            // Oxytone surname: -ος → -ε
            vocative = part.slice(0, -2) + "ε";
          } else {
            // Paroxytone surname: -ος → -ο
            vocative = part.slice(0, -2) + "ο";
          }
        }
        // It's a first name (not in explicit lists) - default behavior
        else {
          if (firstNamesUnchanged.includes(lowerPart) || isOxytone(part)) {
            // Oxytone first name: remains unchanged
            vocative = part;
          } else {
            // Paroxytone first name: default to -ο for common short names, -ε for longer names
            // Default to -ο for disyllabic names, -ε for longer
            const syllableCount = (part.match(/[αεηιουωάέήίόύώ]/gi) || []).length;
            if (syllableCount <= 2) {
              // Disyllabic: -ος → -ο
              vocative = part.slice(0, -2) + "ο";
            } else {
              // Longer names: -ος → -ε
              vocative = part.slice(0, -2) + "ε";
            }
          }
        }
      }
    }
    // Handle masculine names ending in -ης
    else if (lowerPart.endsWith("ης")) {
      vocative = part.slice(0, -2) + "η";
    }
    // Handle masculine names ending in -ας
    else if (lowerPart.endsWith("ας")) {
      // Check if it's actually -ης pattern
      // Use parsed rules exceptions if available
      const asExceptions = parsedRules?.asEndings?.exceptions || [];
      const exceptionPatterns = asExceptions.map(ex => {
        if (typeof ex === "string") return ex;
        return ex.nominative?.toLowerCase() || "";
      });
      const allExceptions = [...namesAsIsPattern, ...exceptionPatterns];
      
      if (allExceptions.some((pattern) => lowerPart.includes(pattern.toLowerCase()))) {
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
  // Try to load parsed rules from markdown, fallback to hard-coded rules
  const parsedRules = getAccusativeRules();
  
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
      // Use parsed rules exceptions if available
      const asExceptions = parsedRules?.asEndings?.exceptions || [];
      const exceptionPatterns = asExceptions.map(ex => {
        if (typeof ex === "string") return ex;
        return ex.nominative?.toLowerCase() || "";
      });
      const allExceptions = [...namesAsIsPattern, ...exceptionPatterns];
      
      if (allExceptions.some((pattern) => lowerPart.includes(pattern.toLowerCase()))) {
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
