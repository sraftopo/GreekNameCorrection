/**
 * TypeScript definitions for greek-name-correction
 * A zero-dependency library for correcting and formatting Greek names
 */

/**
 * Transliteration mode options
 */
export type TransliterationMode = 
  | 'greeklish-to-greek' 
  | 'greek-to-latin' 
  | 'greek-to-greeklish' 
  | null;

/**
 * Case conversion options
 */
export type CaseConversion = 'vocative' | 'accusative' | null;

/**
 * Gender detection result
 */
export type Gender = 'male' | 'female' | 'unknown';

/**
 * Name parts structure
 */
export interface NameParts {
  firstName: string;
  middleName?: string;
  lastName: string;
}

/**
 * Diminutive detection result
 */
export interface DiminutiveInfo {
  word: string;
  isDiminutive: boolean;
  possibleBase: string;
  diminutiveType: string;
}

/**
 * Statistics about the processed name
 */
export interface NameStatistics {
  length: number;
  originalLength: number;
  wordCount: number;
  hasParticles: boolean;
  hasAccents: boolean;
  hasDiaeresis: boolean;
  isAllCaps: boolean;
  isAllLower: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
}

/**
 * Configuration options for GreekNameCorrection
 */
export interface GreekNameCorrectionOptions {
  /**
   * JSON key to look for when processing objects (default: "fullname")
   */
  jsonKey?: string;

  /**
   * If true, returns detailed object with correction info instead of just the corrected string (default: false)
   */
  preserveOriginal?: boolean;

  /**
   * Output key name when processing objects (default: "correctedFullname")
   */
  outputKey?: string;

  /**
   * Split names into parts and capitalize each part separately (default: true)
   */
  splitNames?: boolean;

  /**
   * Detect and include gender information in result (default: false)
   */
  detectGender?: boolean;

  /**
   * Normalize Greek tonetics (accents) (default: true)
   */
  normalizeTonotics?: boolean;

  /**
   * Handle Greek diacritics properly (default: true)
   */
  handleDiacritics?: boolean;

  /**
   * Enable strict validation mode (default: false)
   */
  strictMode?: boolean;

  /**
   * Remove extra spaces (default: true)
   */
  removeExtraSpaces?: boolean;

  /**
   * Handle Greek particles (του, της, etc.) (default: true)
   */
  handleParticles?: boolean;

  /**
   * Convert name to genitive case (default: false)
   */
  convertToGenitive?: boolean;

  /**
   * Convert name to specified case: 'vocative' or 'accusative' (default: null)
   */
  convertToCase?: CaseConversion;

  /**
   * Transliteration mode: 'greeklish-to-greek', 'greek-to-latin', or 'greek-to-greeklish' (default: null)
   */
  transliterate?: TransliterationMode;

  /**
   * Detect diminutive forms in names (default: false)
   */
  detectDiminutive?: boolean;

  /**
   * Handle and extract titles (Κύριος, Κυρία, etc.) (default: true)
   */
  handleTitles?: boolean;

  /**
   * Suggest corrections for common misspellings (default: false)
   */
  suggestCorrections?: boolean;

  /**
   * Recognize and convert Katharevousa forms to modern Greek (default: false)
   */
  recognizeKatharevousa?: boolean;

  /**
   * Make output database-safe by removing problematic characters (default: false)
   */
  databaseSafe?: boolean;

  /**
   * Generate a sort key (accent-insensitive) for the name (default: false)
   */
  generateSortKey?: boolean;

  /**
   * Generate statistics about the processed name (default: false)
   */
  statistics?: boolean;

  /**
   * Add general title (κ. for men, κα for women) if no title exists (default: false)
   */
  addGeneralTitle?: boolean;

  /**
   * Add accents to firstname and lastname (one accent per word) (default: false)
   */
  addAccents?: boolean;
}

/**
 * Result object returned when preserveOriginal is true
 */
export interface GreekNameCorrectionResult {
  /**
   * The corrected name string
   */
  corrected: string;

  /**
   * The original input name
   */
  original: string;

  /**
   * Whether the corrected name is valid according to validation rules
   */
  isValid: boolean;

  /**
   * Extracted title (if any)
   */
  title?: string;

  /**
   * Detected gender (if detectGender is true)
   */
  gender?: Gender;

  /**
   * Name parts split into firstName, middleName, lastName (if splitNames is true)
   */
  parts?: NameParts;

  /**
   * Diminutive detection information (if detectDiminutive is true)
   */
  diminutive?: DiminutiveInfo[] | null;

  /**
   * Genitive form of the name (if convertToGenitive is true)
   */
  genitive?: string;

  /**
   * Vocative form of the name (if convertToCase is 'vocative')
   */
  vocative?: string;

  /**
   * Accusative form of the name (if convertToCase is 'accusative')
   */
  accusative?: string;

  /**
   * Sort key for the name (if generateSortKey is true)
   */
  sortKey?: string;

  /**
   * Statistics about the processed name (if statistics is true)
   */
  statistics?: NameStatistics;

  /**
   * Whether a correction was suggested (if suggestCorrections is true)
   */
  wasCorrected?: boolean;

  /**
   * The suggested correction (if suggestCorrections is true and a correction was found)
   */
  suggestedCorrection?: string;
}

/**
 * GreekNameCorrection - A zero-dependency library for correcting and formatting Greek names
 * 
 * @param input - Name(s) to correct. Can be a string, array of strings, object, or array of objects
 * @param options - Configuration options for name processing
 * @returns Corrected name(s) in the same format as input, or detailed result object if preserveOriginal is true
 * 
 * @example
 * // Simple string correction
 * const corrected = GreekNameCorrection('γιάννης παπαδόπουλος');
 * // Returns: "Γιάννης Παπαδόπουλος"
 * 
 * @example
 * // With options
 * const result = GreekNameCorrection('γιάννης παπαδόπουλος', {
 *   preserveOriginal: true,
 *   detectGender: true,
 *   convertToGenitive: true
 * });
 * // Returns: { corrected: "...", original: "...", gender: "male", genitive: "...", ... }
 * 
 * @example
 * // Array of strings
 * const corrected = GreekNameCorrection(['γιάννης', 'μαρία']);
 * // Returns: ["Γιάννης", "Μαρία"]
 * 
 * @example
 * // Object input
 * const corrected = GreekNameCorrection({ fullname: 'γιάννης παπαδόπουλος' });
 * // Returns: { fullname: 'γιάννης παπαδόπουλος', correctedFullname: 'Γιάννης Παπαδόπουλος' }
 */
declare function GreekNameCorrection(
  input: string,
  options?: GreekNameCorrectionOptions
): string | GreekNameCorrectionResult;

/**
 * Overload for array of strings
 */
declare function GreekNameCorrection(
  input: string[],
  options?: GreekNameCorrectionOptions
): (string | GreekNameCorrectionResult)[];

/**
 * Overload for object input
 */
declare function GreekNameCorrection<T extends Record<string, any>>(
  input: T,
  options?: GreekNameCorrectionOptions
): T & Record<string, any>;

/**
 * Overload for array of objects
 */
declare function GreekNameCorrection<T extends Record<string, any>>(
  input: T[],
  options?: GreekNameCorrectionOptions
): (T & Record<string, any>)[];

export = GreekNameCorrection;
