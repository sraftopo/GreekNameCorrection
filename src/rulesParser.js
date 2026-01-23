// rulesParser.js
"use strict";

// Browser environment detection
// Check if Node.js globals are available
function isNodeEnvironment() {
  return (
    typeof __dirname !== "undefined" &&
    typeof require !== "undefined" &&
    typeof module !== "undefined"
  );
}

// Safely require Node.js modules only in Node.js environment
let fs, path;
if (isNodeEnvironment()) {
  try {
    fs = require("fs");
    path = require("path");
  } catch (e) {
    // If require fails, we're likely in a browser environment
    fs = null;
    path = null;
  }
} else {
  fs = null;
  path = null;
}

/**
 * Parse markdown file and extract Greek name case conversion rules
 * @param {string} filePath - Path to the markdown file
 * @returns {Object} Parsed rules structure
 */
function parseMarkdownRules(filePath) {
  // In browser environments, fs is not available
  if (!fs || !path) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return parseMarkdownContent(content);
  } catch (error) {
    // Silently fail - fallback to hard-coded rules
    return null;
  }
}

/**
 * Parse markdown content and extract rules
 * @param {string} content - Markdown content
 * @returns {Object} Parsed rules structure
 */
function parseMarkdownContent(content) {
  const rules = {
    patterns: [],
    exceptions: [],
    examples: [],
    specialCases: {},
    nameTypeRules: {} // For distinguishing first names vs surnames
  };

  const lines = content.split("\n");
  let currentSection = null;
  let inCodeBlock = false;
  let codeBlockContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Detect code blocks
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      if (!inCodeBlock && codeBlockContent.length > 0) {
        // Process code block content
        processCodeBlock(codeBlockContent.join("\n"), rules);
        codeBlockContent = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Detect sections
    if (line.startsWith("#")) {
      currentSection = line.toLowerCase();
      continue;
    }

    // Extract patterns from bullet points
    if (line.startsWith("-") || line.startsWith("*")) {
      extractPatternFromLine(line, rules, currentSection);
    }

    // Extract examples from tables
    if (line.includes("|") && line.split("|").length >= 3) {
      extractExampleFromTableLine(line, rules);
    }

    // Extract special cases
    if (line.includes("→") || line.includes("->")) {
      extractSpecialCase(line, rules);
    }
  }

  return rules;
}

/**
 * Process code block content for patterns
 */
function processCodeBlock(content, rules) {
  const lines = content.split("\n");
  for (const line of lines) {
    if (line.includes("→") || line.includes("->") || line.includes(":")) {
      extractPatternFromLine(line, rules, null);
    }
  }
}

/**
 * Extract pattern from a line
 */
function extractPatternFromLine(line, rules, section) {
  // Remove markdown list markers
  line = line.replace(/^[-*]\s*/, "").trim();

  // Pattern: "Nominative: X, Y, Z" or "Vocative: X, Y, Z"
  const patternMatch = line.match(/(nominative|vocative|accusative):\s*(.+)/i);
  if (patternMatch) {
    const caseType = patternMatch[1].toLowerCase();
    const examples = patternMatch[2].split(",").map((e) => e.trim());
    rules.examples.push(...examples);
    return;
  }

  // Pattern: "**-ος** → **-ε**" or "-ος → -ε"
  const arrowMatch = line.match(/(?:-|→|->)\s*([α-ωάέήίόύώ]+)\s*(?:→|->|-)\s*([α-ωάέήίόύώ]+)/i);
  if (arrowMatch) {
    const from = arrowMatch[1].toLowerCase();
    const to = arrowMatch[2].toLowerCase();
    rules.patterns.push({
      from: from,
      to: to,
      section: section || ""
    });
    return;
  }

  // Pattern: "**Γιώργος** → **Γιώργο**"
  const nameMatch = line.match(/([Α-Ωα-ωάέήίόύώ]+)\s*(?:→|->|-)\s*([Α-Ωα-ωάέήίόύώ]+)/);
  if (nameMatch) {
    const nominative = nameMatch[1].trim();
    const vocative = nameMatch[2].trim();
    
    // Extract ending pattern
    const fromEnding = extractEnding(nominative);
    const toEnding = extractEnding(vocative);
    
    if (fromEnding && toEnding) {
      rules.patterns.push({
        from: fromEnding,
        to: toEnding,
        example: { nominative, vocative },
        section: section || ""
      });
    }
    
    // Store as example
    rules.examples.push({ nominative, vocative });
    return;
  }

  // Pattern: "**-ος (παροξύτονα)** → **-ο**"
  const stressMatch = line.match(/(?:-|→|->)\s*([α-ωάέήίόύώ]+)\s*\(([^)]+)\)\s*(?:→|->|-)\s*([α-ωάέήίόύώ]+)/i);
  if (stressMatch) {
    const from = stressMatch[1].toLowerCase();
    const to = stressMatch[2].toLowerCase();
    const stressType = stressMatch[2].toLowerCase();
    rules.patterns.push({
      from: from,
      to: to,
      stressType: stressType,
      section: section || ""
    });
    return;
  }
}

/**
 * Extract example from table line
 */
function extractExampleFromTableLine(line, rules) {
  const cells = line.split("|").map((c) => c.trim()).filter((c) => c && c.length > 0);
  if (cells.length >= 2) {
    const nominative = cells[0];
    const vocative = cells[1];
    
    // Skip header rows
    const nomLower = nominative.toLowerCase();
    const vocLower = vocative.toLowerCase();
    
    if (nomLower.includes("nominative") || 
        nomLower.includes("ονομαστική") ||
        vocLower.includes("vocative") ||
        vocLower.includes("κλητική") ||
        vocLower.includes("accusative") ||
        vocLower.includes("αιτιατική") ||
        nomLower.includes("translation") ||
        nomLower.includes("μετάφραση")) {
      return;
    }

    // Skip rows that are clearly headers (contain dashes or are empty)
    if (nominative.includes("---") || vocative.includes("---") || 
        nominative.length === 0 || vocative.length === 0) {
      return;
    }

    // Clean up the names (remove markdown formatting)
    const cleanNom = nominative.replace(/\*\*/g, "").trim();
    const cleanVoc = vocative.replace(/\*\*/g, "").trim();
    
    if (cleanNom && cleanVoc && cleanNom !== cleanVoc) {
      rules.examples.push({ nominative: cleanNom, vocative: cleanVoc });
      
      // Extract pattern
      const fromEnding = extractEnding(cleanNom);
      const toEnding = extractEnding(cleanVoc);
      
      if (fromEnding && toEnding) {
        rules.patterns.push({
          from: fromEnding,
          to: toEnding,
          example: { nominative: cleanNom, vocative: cleanVoc }
        });
      }
    } else if (cleanNom && cleanVoc && cleanNom === cleanVoc) {
      // Same form - useful for feminine names or exceptions
      rules.examples.push({ nominative: cleanNom, vocative: cleanVoc, unchanged: true });
    }
  }
}

/**
 * Extract special case from line
 */
function extractSpecialCase(line, rules) {
  const match = line.match(/([Α-Ωα-ωάέήίόύώ]+)\s*(?:→|->|-)\s*([Α-Ωα-ωάέήίόύώ]+)/);
  if (match) {
    const nominative = match[1].trim().toLowerCase();
    const vocative = match[2].trim().toLowerCase();
    rules.specialCases[nominative] = vocative;
  }
}

/**
 * Extract ending pattern from a name
 */
function extractEnding(name) {
  if (!name || name.length < 2) return null;
  
  // Try 2-character ending first
  const ending2 = name.slice(-2).toLowerCase();
  if (ending2.match(/^[α-ωάέήίόύώ]{2}$/)) {
    return ending2;
  }
  
  // Try 3-character ending
  if (name.length >= 3) {
    const ending3 = name.slice(-3).toLowerCase();
    if (ending3.match(/^[α-ωάέήίόύώ]{3}$/)) {
      return ending3;
    }
  }
  
  return null;
}

/**
 * Parse vocative rules from names_klitiki.md
 */
function parseVocativeRules() {
  // In browser environments, skip file reading and return null
  // This will trigger fallback to hard-coded rules in cases.js
  if (!isNodeEnvironment() || !path || typeof __dirname === "undefined") {
    return null;
  }
  
  const filePath = path.join(__dirname, "..", "names_klitiki.md");
  const rules = parseMarkdownRules(filePath);
  
  if (!rules) {
    return null;
  }

  // Structure the rules for vocative case
  const structuredRules = {
    // Patterns for -ος endings
    osEndings: {
      // First names
      firstNames: {
        paroxytone: {
          inO: [], // Names that form vocative in -ο (lowercase)
          inE: []  // Names that form vocative in -ε (lowercase)
        },
        oxytone: {
          unchanged: [] // Names that remain unchanged (lowercase)
        }
      },
      // Surnames
      surnames: {
        paroxytone: {
          inO: [] // Paroxytone surnames → -ο (lowercase)
        },
        oxytone: {
          inE: [] // Oxytone surnames → -ε (lowercase)
        }
      },
      // Diminutives
      diminutives: {
        patterns: [], // Patterns like -άκος, -ούκος, -ίτσος → -ο
        examples: []
      }
    },
    // Patterns for -ης endings
    isEndings: {
      pattern: "ης → η",
      examples: []
    },
    // Patterns for -ας endings
    asEndings: {
      pattern: "ας → α",
      exceptions: [], // Names that are actually -ης pattern (lowercase)
      examples: []
    },
    // Patterns for -ούς endings
    ousEndings: {
      pattern: "ούς → ού",
      examples: []
    },
    // Special cases (lowercase keys)
    specialCases: {},
    // Examples for validation
    examples: []
  };

  // Process patterns and examples
  for (const pattern of rules.patterns) {
    if (pattern.from === "ος") {
      if (pattern.to === "ο") {
        // Could be paroxytone first name or surname
        if (pattern.stressType && pattern.stressType.includes("παροξύτονα")) {
          if (pattern.section && pattern.section.includes("surname")) {
            structuredRules.osEndings.surnames.paroxytone.inO.push(pattern);
          } else {
            structuredRules.osEndings.firstNames.paroxytone.inO.push(pattern);
          }
        } else {
          // Default to first name if unclear
          structuredRules.osEndings.firstNames.paroxytone.inO.push(pattern);
        }
      } else if (pattern.to === "ε") {
        if (pattern.stressType && pattern.stressType.includes("οξύτονα")) {
          structuredRules.osEndings.surnames.oxytone.inE.push(pattern);
        } else {
          structuredRules.osEndings.firstNames.paroxytone.inE.push(pattern);
        }
      } else if (pattern.to === "ος") {
        structuredRules.osEndings.firstNames.oxytone.unchanged.push(pattern);
      }
    } else if (pattern.from === "ης" && pattern.to === "η") {
      structuredRules.isEndings.examples.push(pattern.example || pattern);
    } else if (pattern.from === "ας" && pattern.to === "α") {
      structuredRules.asEndings.examples.push(pattern.example || pattern);
    } else if (pattern.from === "ούς" && pattern.to === "ού") {
      structuredRules.ousEndings.examples.push(pattern.example || pattern);
    }
  }

  // Process special cases
  structuredRules.specialCases = {};
  for (const [key, value] of Object.entries(rules.specialCases)) {
    structuredRules.specialCases[key.toLowerCase()] = value.toLowerCase();
  }
  
  // Extract Παύλος special case from examples if present
  for (const example of rules.examples) {
    if (typeof example === "object" && example.nominative) {
      const nom = example.nominative.toLowerCase();
      if (nom === "παύλος" || nom.includes("παύλος")) {
        // Παύλος can be Παύλο or Παύλε - default to Παύλο
        if (!structuredRules.specialCases["παύλος"]) {
          structuredRules.specialCases["παύλος"] = "παύλο";
        }
      }
    }
  }

  // Process examples
  for (const example of rules.examples) {
    if (typeof example === "object" && example.nominative) {
      structuredRules.examples.push(example);
    }
  }

  // Extract specific name lists from examples
  extractNameListsFromExamples(structuredRules, rules.examples);

  return structuredRules;
}

/**
 * Extract name lists from examples
 */
function extractNameListsFromExamples(structuredRules, examples) {
  // Lists to populate (using Sets to avoid duplicates)
  const firstNamesInO = new Set();
  const firstNamesInE = new Set();
  const firstNamesUnchanged = new Set();
  const surnamesInO = new Set();
  const surnamesInE = new Set();
  const diminutiveExamples = [];
  const asExceptions = new Set();

  for (const example of examples) {
    if (typeof example === "object" && example.nominative && example.vocative) {
      const nom = example.nominative.toLowerCase();
      const voc = example.vocative.toLowerCase();
      
      if (nom.endsWith("ος")) {
        if (voc.endsWith("ο")) {
          // Check if it's a diminutive pattern
          if (nom.match(/άκος$|ούκος$|ίτσος$/)) {
            diminutiveExamples.push({
              nominative: example.nominative,
              vocative: example.vocative
            });
          } else {
            // Could be first name or surname - store both possibilities
            // But prioritize based on context if available
            firstNamesInO.add(nom);
            surnamesInO.add(nom);
          }
        } else if (voc.endsWith("ε")) {
          firstNamesInE.add(nom);
          surnamesInE.add(nom);
        } else if (voc === nom) {
          firstNamesUnchanged.add(nom);
        }
      } else if (nom.endsWith("ης") && voc.endsWith("η")) {
        structuredRules.isEndings.examples.push(example);
      } else if (nom.endsWith("ας")) {
        if (voc.endsWith("α")) {
          structuredRules.asEndings.examples.push(example);
        } else if (voc.endsWith("η")) {
          // Exception: -ας that's actually -ης
          asExceptions.add(nom);
        }
      }
    }
  }

  // Store extracted lists (convert Sets to Arrays)
  structuredRules.osEndings.firstNames.paroxytone.inO = Array.from(firstNamesInO);
  structuredRules.osEndings.firstNames.paroxytone.inE = Array.from(firstNamesInE);
  structuredRules.osEndings.firstNames.oxytone.unchanged = Array.from(firstNamesUnchanged);
  structuredRules.osEndings.surnames.paroxytone.inO = Array.from(surnamesInO);
  structuredRules.osEndings.surnames.oxytone.inE = Array.from(surnamesInE);
  structuredRules.osEndings.diminutives.examples = diminutiveExamples;
  structuredRules.asEndings.exceptions = Array.from(asExceptions);
}

/**
 * Parse accusative rules from names_aitiatiki.md
 */
function parseAccusativeRules() {
  // In browser environments, skip file reading and return null
  // This will trigger fallback to hard-coded rules in cases.js
  if (!isNodeEnvironment() || !path || typeof __dirname === "undefined") {
    return null;
  }
  
  const filePath = path.join(__dirname, "..", "names_aitiatiki.md");
  const rules = parseMarkdownRules(filePath);
  
  if (!rules) {
    return null;
  }

  // Structure the rules for accusative case
  const structuredRules = {
    // Patterns for -ος endings
    osEndings: {
      pattern: "ος → ο", // Consistent pattern, no stress dependency
      examples: []
    },
    // Patterns for -ης endings
    isEndings: {
      pattern: "ης → η",
      examples: []
    },
    // Patterns for -ας endings
    asEndings: {
      pattern: "ας → α",
      exceptions: [], // Names that are actually -ης pattern
      examples: []
    },
    // Patterns for -ούς endings
    ousEndings: {
      pattern: "ούς → ού",
      examples: []
    },
    // Special cases
    specialCases: {},
    // Examples for validation
    examples: []
  };

  // Process patterns and examples
  for (const pattern of rules.patterns) {
    if (pattern.from === "ος" && pattern.to === "ο") {
      structuredRules.osEndings.examples.push(pattern.example || pattern);
    } else if (pattern.from === "ης" && pattern.to === "η") {
      structuredRules.isEndings.examples.push(pattern.example || pattern);
    } else if (pattern.from === "ας") {
      if (pattern.to === "α") {
        structuredRules.asEndings.examples.push(pattern.example || pattern);
      } else if (pattern.to === "η") {
        structuredRules.asEndings.exceptions.push(pattern.example || pattern);
      }
    } else if (pattern.from === "ούς" && pattern.to === "ού") {
      structuredRules.ousEndings.examples.push(pattern.example || pattern);
    }
  }

  // Process special cases
  structuredRules.specialCases = rules.specialCases;

  // Process examples
  for (const example of rules.examples) {
    if (typeof example === "object" && example.nominative) {
      structuredRules.examples.push(example);
    }
  }

  // Extract specific name lists from examples
  extractAccusativeNameListsFromExamples(structuredRules, rules.examples);

  return structuredRules;
}

/**
 * Extract name lists from accusative examples
 */
function extractAccusativeNameListsFromExamples(structuredRules, examples) {
  for (const example of examples) {
    if (typeof example === "object" && example.nominative && example.accusative) {
      const nom = example.nominative.toLowerCase();
      const acc = example.accusative.toLowerCase();
      
      if (nom.endsWith("ος") && acc.endsWith("ο")) {
        structuredRules.osEndings.examples.push(example);
      } else if (nom.endsWith("ης") && acc.endsWith("η")) {
        structuredRules.isEndings.examples.push(example);
      } else if (nom.endsWith("ας")) {
        if (acc.endsWith("α")) {
          structuredRules.asEndings.examples.push(example);
        } else if (acc.endsWith("η")) {
          structuredRules.asEndings.exceptions.push(example);
        }
      }
    } else if (typeof example === "object" && example.nominative) {
      // Try to infer accusative from table format
      const nom = example.nominative.toLowerCase();
      if (nom.endsWith("ος")) {
        structuredRules.osEndings.examples.push(example);
      } else if (nom.endsWith("ης")) {
        structuredRules.isEndings.examples.push(example);
      } else if (nom.endsWith("ας")) {
        structuredRules.asEndings.examples.push(example);
      }
    }
  }
}

/**
 * Load and cache parsed rules
 */
let vocativeRulesCache = null;
let accusativeRulesCache = null;

function getVocativeRules() {
  if (vocativeRulesCache === null) {
    vocativeRulesCache = parseVocativeRules();
  }
  return vocativeRulesCache;
}

function getAccusativeRules() {
  if (accusativeRulesCache === null) {
    accusativeRulesCache = parseAccusativeRules();
  }
  return accusativeRulesCache;
}

module.exports = {
  parseMarkdownRules,
  parseVocativeRules,
  parseAccusativeRules,
  getVocativeRules,
  getAccusativeRules
};
