#!/usr/bin/env node
// bin/greek-name-correction.js - CLI for GreekNameCorrection
"use strict";

const GreekNameCorrection = require("../src/index");

/**
 * Parse command-line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  let name = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    // Parse -name or --name
    if ((arg === "-name" || arg === "--name") && nextArg) {
      name = nextArg;
      i++; // Skip next argument
    }
    // Parse -convertToCase or --convertToCase
    else if ((arg === "-convertToCase" || arg === "--convertToCase") && nextArg) {
      options.convertToCase = nextArg.toLowerCase();
      i++;
    }
    // Parse -transliterate or --transliterate
    else if ((arg === "-transliterate" || arg === "--transliterate") && nextArg) {
      options.transliterate = nextArg.toLowerCase();
      i++;
    }
    // Parse boolean flags
    else if (arg === "-preserveOriginal" || arg === "--preserveOriginal") {
      options.preserveOriginal = true;
    }
    else if (arg === "-convertToGenitive" || arg === "--convertToGenitive") {
      options.convertToGenitive = true;
    }
    else if (arg === "-detectGender" || arg === "--detectGender") {
      options.detectGender = true;
    }
    else if (arg === "-detectDiminutive" || arg === "--detectDiminutive") {
      options.detectDiminutive = true;
    }
    else if (arg === "-suggestCorrections" || arg === "--suggestCorrections") {
      options.suggestCorrections = true;
    }
    else if (arg === "-recognizeKatharevousa" || arg === "--recognizeKatharevousa") {
      options.recognizeKatharevousa = true;
    }
    else if (arg === "-databaseSafe" || arg === "--databaseSafe") {
      options.databaseSafe = true;
    }
    else if (arg === "-generateSortKey" || arg === "--generateSortKey") {
      options.generateSortKey = true;
    }
    else if (arg === "-statistics" || arg === "--statistics") {
      options.statistics = true;
    }
    else if (arg === "-addGeneralTitle" || arg === "--addGeneralTitle") {
      options.addGeneralTitle = true;
    }
    else if (arg === "-addAccents" || arg === "--addAccents") {
      options.addAccents = true;
    }
    else if (arg === "-handleTitles" || arg === "--handleTitles") {
      options.handleTitles = true;
    }
    else if (arg === "-handleParticles" || arg === "--handleParticles") {
      options.handleParticles = true;
    }
    else if (arg === "-strictMode" || arg === "--strictMode") {
      options.strictMode = true;
    }
    else if (arg === "-json" || arg === "--json") {
      options.json = true;
    }
    else if (arg === "-help" || arg === "--help" || arg === "-h" || arg === "--h") {
      printHelp();
      process.exit(0);
    }
    else if (arg === "-version" || arg === "--version" || arg === "-v" || arg === "--v") {
      const pkg = require("../package.json");
      console.log(pkg.version);
      process.exit(0);
    }
    // If no flag, treat as name (for convenience)
    else if (!name && !arg.startsWith("-")) {
      name = arg;
    }
  }

  return { name, options };
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
Greek Name Correction CLI

Usage:
  greek-name-correction -name "NAME" [OPTIONS]
  greek-name-correction "NAME" [OPTIONS]

Options:
  -name, --name <name>              Name to correct (required if not provided as positional argument)
  -convertToCase <case>             Convert to case: 'vocative' or 'accusative'
  -transliterate <type>             Transliteration type: 'greeklish-to-greek', 'greek-to-latin', 'greek-to-greeklish'
  -convertToGenitive                 Convert to genitive case
  -preserveOriginal                  Return object with original and corrected name
  -detectGender                      Detect gender from name
  -detectDiminutive                  Detect diminutive forms
  -suggestCorrections               Suggest corrections for common misspellings
  -recognizeKatharevousa            Recognize and convert Katharevousa forms
  -databaseSafe                     Make output database-safe
  -generateSortKey                  Generate sort key (accent-free)
  -statistics                       Generate name statistics
  -addGeneralTitle                  Add general title (κ./κα) based on gender
  -addAccents                       Add accents to firstname and lastname (one accent per word)
  -handleTitles                     Handle titles (default: true)
  -handleParticles                  Handle Greek particles (default: true)
  -strictMode                       Enable strict mode
  -json                             Output result as JSON
  -help, -h                         Show this help message
  -version, -v                      Show version

Examples:
  greek-name-correction -name "γιώργος παπαδόπουλος"
  greek-name-correction "Ραυτόπουλος Σταύρος" -convertToCase vocative
  greek-name-correction -name "giorgos papadopoulos" -transliterate greeklish-to-greek
  greek-name-correction -name "Γιώργος Παπαδόπουλος" -convertToGenitive -preserveOriginal -json
  greek-name-correction -name "Μαρία Κωνσταντίνου" -detectGender -addGeneralTitle
  greek-name-correction -name "γιωργος παπαδοπουλος" -addAccents
`);
}

/**
 * Format output based on options
 */
function formatOutput(result, options) {
  if (options.json || options.preserveOriginal) {
    // If JSON output requested or preserveOriginal is true, return JSON
    return JSON.stringify(result, null, 2);
  }
  
  if (typeof result === "object" && result !== null && !Array.isArray(result)) {
    // If it's an object result, check for case-specific fields first
    if (options.convertToCase && result[options.convertToCase]) {
      return result[options.convertToCase];
    }
    if (options.convertToGenitive && result.genitive) {
      return result.genitive;
    }
    // Otherwise return corrected field
    if (result.corrected !== undefined) {
      return result.corrected;
    }
    // Fallback to JSON if object structure is unexpected
    return JSON.stringify(result, null, 2);
  }
  
  return result;
}

/**
 * Main CLI function
 */
function main() {
  const { name, options } = parseArgs();

  if (!name) {
    console.error("Error: Name is required. Use -name or provide as argument.");
    console.error("Run with -help for usage information.");
    process.exit(1);
  }

  try {
    const result = GreekNameCorrection(name, options);
    const output = formatOutput(result, options);
    console.log(output);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { parseArgs, formatOutput };
