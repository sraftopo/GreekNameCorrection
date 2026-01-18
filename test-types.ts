/**
 * TypeScript test file to verify type definitions
 * This file can be deleted after verification
 */

import GreekNameCorrection = require('./index');

// Test 1: String input
const result1: string = GreekNameCorrection('γιάννης παπαδόπουλος');
const result1WithOptions: string | import('./index').GreekNameCorrectionResult = 
  GreekNameCorrection('γιάννης παπαδόπουλος', { preserveOriginal: true });

// Test 2: Array of strings
const result2: (string | import('./index').GreekNameCorrectionResult)[] = 
  GreekNameCorrection(['γιάννης', 'μαρία']);

// Test 3: Object input
const result3 = GreekNameCorrection({ fullname: 'γιάννης παπαδόπουλος' });
// result3 should have fullname and correctedFullname properties

// Test 4: Array of objects
const result4 = GreekNameCorrection([
  { fullname: 'γιάννης παπαδόπουλος' },
  { fullname: 'μαρία γεωργίου' }
]);

// Test 5: With all options
const result5 = GreekNameCorrection('γιάννης παπαδόπουλος', {
  jsonKey: 'name',
  preserveOriginal: true,
  outputKey: 'corrected',
  splitNames: true,
  detectGender: true,
  normalizeTonotics: true,
  handleDiacritics: true,
  strictMode: false,
  removeExtraSpaces: true,
  handleParticles: true,
  convertToGenitive: true,
  convertToCase: 'vocative',
  transliterate: 'greek-to-latin',
  detectDiminutive: true,
  handleTitles: true,
  suggestCorrections: true,
  recognizeKatharevousa: true,
  databaseSafe: true,
  generateSortKey: true,
  statistics: true,
  addGeneralTitle: true
});

// Test 6: Type checking for result properties
if (typeof result5 === 'object' && 'corrected' in result5) {
  const corrected: string = result5.corrected;
  const original: string = result5.original;
  const isValid: boolean = result5.isValid;
  const gender: import('./index').Gender | undefined = result5.gender;
  const parts: import('./index').NameParts | undefined = result5.parts;
  const genitive: string | undefined = result5.genitive;
  const vocative: string | undefined = result5.vocative;
  const sortKey: string | undefined = result5.sortKey;
  const statistics: import('./index').NameStatistics | undefined = result5.statistics;
}

console.log('TypeScript definitions are working correctly!');
