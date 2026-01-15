// index.js
"use strict";

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

  // Transliteration maps
  const greeklishToGreekMap = {
    a: "α",
    b: "β",
    g: "γ",
    d: "δ",
    e: "ε",
    z: "ζ",
    h: "η",
    th: "θ",
    i: "ι",
    k: "κ",
    l: "λ",
    m: "μ",
    n: "ν",
    x: "ξ",
    o: "ο",
    p: "π",
    r: "ρ",
    s: "σ",
    t: "τ",
    y: "υ",
    f: "φ",
    ch: "χ",
    ps: "ψ",
    w: "ω",
    ks: "ξ",
    ou: "ου",
    ai: "αι",
    ei: "ει",
    oi: "οι",
    ui: "υι",
    au: "αυ",
    eu: "ευ",
    ou: "ου",
    iu: "ιου",
    mp: "μπ",
    nt: "ντ",
    gk: "γκ",
    gg: "γγ",
    ts: "τσ",
    tz: "τζ",
    dz: "ντζ"
  };

  const greekToLatinMap = {
    α: "a",
    ά: "a",
    β: "v",
    γ: "g",
    δ: "d",
    ε: "e",
    έ: "e",
    ζ: "z",
    η: "i",
    ή: "i",
    θ: "th",
    ι: "i",
    ί: "i",
    ϊ: "i",
    ΐ: "i",
    κ: "k",
    λ: "l",
    μ: "m",
    ν: "n",
    ξ: "x",
    ο: "o",
    ό: "o",
    π: "p",
    ρ: "r",
    σ: "s",
    ς: "s",
    τ: "t",
    υ: "y",
    ύ: "y",
    ϋ: "y",
    ΰ: "y",
    φ: "f",
    χ: "ch",
    ψ: "ps",
    ω: "o",
    ώ: "o",
    Α: "A",
    Ά: "A",
    Β: "V",
    Γ: "G",
    Δ: "D",
    Ε: "E",
    Έ: "E",
    Ζ: "Z",
    Η: "I",
    Ή: "I",
    Θ: "Th",
    Ι: "I",
    Ί: "I",
    Ϊ: "I",
    Κ: "K",
    Λ: "L",
    Μ: "M",
    Ν: "N",
    Ξ: "X",
    Ο: "O",
    Ό: "O",
    Π: "P",
    Ρ: "R",
    Σ: "S",
    Τ: "T",
    Υ: "Y",
    Ύ: "Y",
    Ϋ: "Y",
    Φ: "F",
    Χ: "Ch",
    Ψ: "Ps",
    Ω: "O",
    Ώ: "O"
  };

  const greekToGreeklishMap = {
    α: "a",
    ά: "a",
    β: "v",
    γ: "g",
    δ: "d",
    ε: "e",
    έ: "e",
    ζ: "z",
    η: "i",
    ή: "i",
    θ: "th",
    ι: "i",
    ί: "i",
    ϊ: "i",
    ΐ: "i",
    κ: "k",
    λ: "l",
    μ: "m",
    ν: "n",
    ξ: "ks",
    ο: "o",
    ό: "o",
    π: "p",
    ρ: "r",
    σ: "s",
    ς: "s",
    τ: "t",
    υ: "u",
    ύ: "u",
    ϋ: "u",
    ΰ: "u",
    φ: "f",
    χ: "x",
    ψ: "ps",
    ω: "w",
    ώ: "w",
    Α: "A",
    Ά: "A",
    Β: "V",
    Γ: "G",
    Δ: "D",
    Ε: "E",
    Έ: "E",
    Ζ: "Z",
    Η: "I",
    Ή: "I",
    Θ: "Th",
    Ι: "I",
    Ί: "I",
    Ϊ: "I",
    Κ: "K",
    Λ: "L",
    Μ: "M",
    Ν: "N",
    Ξ: "Ks",
    Ο: "O",
    Ό: "O",
    Π: "P",
    Ρ: "R",
    Σ: "S",
    Τ: "T",
    Υ: "U",
    Ύ: "U",
    Ϋ: "U",
    Φ: "F",
    Χ: "X",
    Ψ: "Ps",
    Ω: "W",
    Ώ: "W"
  };

  // Diminutive patterns
  const diminutivePatterns = {
    άκης: "ας/ης",
    ούλης: "ος",
    ίτσα: "α",
    ούλα: "α",
    άκι: "ο",
    ούλι: "ο",
    ίτσας: "ας",
    ούλας: "ας",
    ίκος: "ος",
    ούκος: "ος",
    ίκη: "η",
    ούκα: "α"
  };

  // Common Greek titles
  const titles = [
    "Κος",
    "Κα",
    "Δις",
    "Κυρ",
    "Κυρία",
    "Κύριος",
    "Δεσποινίς",
    "Δρ",
    "Καθ",
    "Καθηγητής",
    "Καθηγήτρια",
    "Πρωθυπουργός",
    "Υπουργός",
    "Βουλευτής",
    "Δήμαρχος",
    "Περιφερειάρχης",
    "Αρχιεπίσκοπος",
    "Μητροπολίτης",
    "Επίσκοπος",
    "Πατήρ",
    "Στρατηγός",
    "Ταξίαρχος",
    "Συνταγματάρχης",
    "Αντισυνταγματάρχης"
  ];

  // Katharevousa endings to modern Greek
  const katharevousaMap = {
    ιον: "ιο",
    ειον: "ειο",
    αιον: "αιο",
    ου: "ου",
    ων: "ων",
    ας: "ας",
    ης: "ης"
  };

  // Common name misspellings
  const commonCorrections = {
    γιοργος: "γιώργος",
    γεωργιος: "γεώργιος",
    δημητρης: "δημήτρης",
    δημητριος: "δημήτριος",
    νικος: "νίκος",
    νικολαος: "νικόλαος",
    μαρια: "μαρία",
    ελενη: "ελένη",
    κωνσταντινος: "κωνσταντίνος",
    κωστας: "κώστας",
    ιωαννης: "ιωάννης",
    γιαννης: "γιάννης",
    αναστασια: "αναστασία",
    σοφια: "σοφία",
    παναγιωτης: "παναγιώτης",
    παναγιωτα: "παναγιώτα"
  };

  // Oxytone names (stressed on last syllable) - for vocative case
  // These names ending in -ος remain unchanged in vocative
  const oxytoneNames = ["νικολός", "ανδρός", "αναστάσιος", "αναστάσιος"];

  // Names that end in -ας but are actually -ης pattern (for accusative)
  const namesAsIsPattern = ["θανάσης", "ανάσης"];

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
        caseForm = convertToVocative(processed);
      } else if (config.convertToCase === "accusative") {
        caseForm = convertToAccusative(processed);
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
  function convertToVocative(name) {
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
  function convertToAccusative(name) {
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

  // Capitalize Greek names properly
  function capitalizeGreekName(str) {
    if (!str || str.length === 0) return str;

    const first = str.charAt(0).toUpperCase();
    const rest = str.slice(1).toLowerCase();

    return first + rest;
  }

  // Normalize Greek tonetics
  function normalizeGreekTonotics(str) {
    const tonoticMap = {
      ά: "ά",
      έ: "έ",
      ή: "ή",
      ί: "ί",
      ό: "ό",
      ύ: "ύ",
      ώ: "ώ",
      Ά: "Ά",
      Έ: "Έ",
      Ή: "Ή",
      Ί: "Ί",
      Ό: "Ό",
      Ύ: "Ύ",
      Ώ: "Ώ",
      ϊ: "ϊ",
      ϋ: "ϋ",
      ΐ: "ΐ",
      ΰ: "ΰ",
      Ϊ: "Ϊ",
      Ϋ: "Ϋ"
    };

    return str
      .split("")
      .map((char) => tonoticMap[char] || char)
      .join("");
  }

  // Handle Greek diacritics
  function handleGreekDiacritics(str) {
    return str.normalize("NFC");
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

  // Validate Greek name
  function validateGreekName(name, strict = false) {
    if (!name || name.trim() === "") return false;

    const greekPattern = /^[Α-Ωα-ωίϊΐόάέύϋΰήώ\s\-']+$/;

    if (strict) {
      return greekPattern.test(name);
    }

    const hasGreek = /[Α-Ωα-ω]/.test(name);
    const validChars = /^[A-Za-zΑ-Ωα-ωίϊΐόάέύϋΰήώ\s\-']+$/.test(name);

    return hasGreek && validChars;
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
      .filter((p) => !isGreekParticle(p.toLowerCase()) && !titles.includes(p));

    if (parts.length === 0) return { firstName: "", lastName: "" };
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    if (parts.length === 2) return { firstName: parts[0], lastName: parts[1] };

    return {
      firstName: parts[0],
      middleName: parts.slice(1, -1).join(" "),
      lastName: parts[parts.length - 1]
    };
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
