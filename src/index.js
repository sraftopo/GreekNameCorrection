// src/index.js
"use strict";

const { transliterate } = require("./transliteration");
const {
  convertToGenitive,
  convertToVocative,
  convertToAccusative
} = require("./cases");
const {
  validateGreekName,
  normalizeGreekTonotics,
  handleGreekDiacritics
} = require("./validation");
const {
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
  splitNameParts
} = require("./utils");

/**
 * GreekNameCorrection - A zero-dependency library for correcting and formatting Greek names
 * @param {string|string[]|Object|Object[]} input - Name(s) to correct
 * @param {Object} options - Configuration options
 * @returns {string|string[]|Object|Object[]} Corrected name(s) in same format as input
 */
function GreekNameCorrection(input, options = {}) {
  const defaults = {
    jsonKey: "fullname",
    preserveOriginal: false,
    outputKey: "correctedFullname",
    splitNames: true,
    detectGender: false,
    normalizeTonotics: true,
    handleDiacritics: true,
    strictMode: false,
    removeExtraSpaces: true,
    handleParticles: true,
    // New features
    convertToGenitive: false,
    convertToCase: null, // 'vocative', 'accusative', null
    transliterate: null, // 'greeklish-to-greek', 'greek-to-latin', 'greek-to-greeklish'
    detectDiminutive: false,
    handleTitles: true,
    suggestCorrections: false,
    recognizeKatharevousa: false,
    databaseSafe: false,
    generateSortKey: false,
    statistics: false
  };

  const config = { ...defaults, ...options };

  // Main processing function
  function processName(name) {
    if (typeof name !== "string" || name.trim() === "") {
      return config.strictMode ? null : name;
    }

    let processed = name;
    let extractedTitle = null;

    // Extract and handle titles
    if (config.handleTitles) {
      const titleResult = extractTitle(processed);
      extractedTitle = titleResult.title;
      processed = titleResult.name;
    }

    // Transliteration
    if (config.transliterate) {
      processed = transliterate(processed, config.transliterate);
    }

    // Remove extra spaces
    if (config.removeExtraSpaces) {
      processed = processed.replace(/\s+/g, " ").trim();
    }

    // Recognize and convert Katharevousa forms
    if (config.recognizeKatharevousa) {
      processed = convertKatharevousa(processed);
    }

    // Suggest corrections for common misspellings
    let suggestion = null;
    if (config.suggestCorrections) {
      suggestion = suggestCorrection(processed);
      if (suggestion) {
        processed = suggestion;
      }
    }

    // Normalize Greek tonetics
    if (config.normalizeTonotics) {
      processed = normalizeGreekTonotics(processed);
    }

    // Handle diacritics properly
    if (config.handleDiacritics) {
      processed = handleGreekDiacritics(processed);
    }

    // Split and capitalize each part
    if (config.splitNames) {
      const parts = processed.split(/\s+/);
      processed = parts
        .map((part, index) => {
          // Handle Greek name particles
          if (config.handleParticles && isGreekParticle(part.toLowerCase())) {
            return part.toLowerCase();
          }
          return capitalizeGreekName(part);
        })
        .join(" ");
    } else {
      processed = capitalizeGreekName(processed);
    }

    // Convert to genitive case (before re-attaching title)
    let genitiveForm = null;
    if (config.convertToGenitive) {
      genitiveForm = convertToGenitive(processed);
    }

    // Convert to case (vocative or accusative) - before re-attaching title
    let caseForm = null;
    if (config.convertToCase) {
      if (config.convertToCase === "vocative") {
        caseForm = convertToVocative(processed, config);
      } else if (config.convertToCase === "accusative") {
        caseForm = convertToAccusative(processed, config);
      }
      // Re-attach title to case form if it was extracted
      if (extractedTitle && caseForm) {
        caseForm = extractedTitle + " " + caseForm;
      }
    }

    // Database-safe output
    if (config.databaseSafe) {
      processed = makeDatabaseSafe(processed);
    }

    // Re-attach title if it was extracted
    if (extractedTitle) {
      processed = extractedTitle + " " + processed;
    }

    const result = {
      corrected: processed,
      original: name,
      isValid: validateGreekName(processed, config.strictMode)
    };

    if (extractedTitle) {
      result.title = extractedTitle;
    }

    if (config.detectGender) {
      result.gender = detectGender(processed);
    }

    if (config.splitNames) {
      result.parts = splitNameParts(processed);
    }

    if (config.detectDiminutive) {
      result.diminutive = detectDiminutive(processed);
    }

    if (genitiveForm) {
      result.genitive = genitiveForm;
    }

    if (caseForm) {
      result[config.convertToCase] = caseForm;
    }

    if (config.generateSortKey) {
      result.sortKey = generateSortKey(processed);
    }

    if (config.statistics) {
      result.statistics = generateStatistics(processed, name);
    }

    if (suggestion && config.suggestCorrections) {
      result.wasCorrected = true;
      result.suggestedCorrection = suggestion;
    }

    // If convertToCase is specified and preserveOriginal is false, return the case form
    if (config.convertToCase && !config.preserveOriginal && caseForm) {
      return caseForm;
    }

    return config.preserveOriginal ? result : processed;
  }

  // Handle different input types
  if (typeof input === "string") {
    return processName(input);
  }

  if (Array.isArray(input)) {
    return input.map((item) => {
      if (typeof item === "string") {
        return processName(item);
      }
      if (typeof item === "object" && item !== null) {
        const result = { ...item };
        if (item[config.jsonKey]) {
          const processed = processName(item[config.jsonKey]);
          if (config.preserveOriginal && typeof processed === "object") {
            Object.assign(result, processed);
          } else {
            result[config.outputKey] = processed;
          }
        }
        return result;
      }
      return item;
    });
  }

  if (typeof input === "object" && input !== null) {
    const result = { ...input };
    if (input[config.jsonKey]) {
      const processed = processName(input[config.jsonKey]);
      if (config.preserveOriginal && typeof processed === "object") {
        Object.assign(result, processed);
      } else {
        result[config.outputKey] = processed;
      }
    }
    return result;
  }

  return input;
}

module.exports = GreekNameCorrection;
