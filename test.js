const GreekNameCorrection = require('./index');

console.log('=== Basic String Tests ===');
console.log(GreekNameCorrection('γιώργος παπαδόπουλος'));
console.log(GreekNameCorrection('ΜΑΡΙΑ ΚΩΝΣΤΑΝΤΙΝΟΥ'));

console.log('\n=== Genitive Case Conversion ===');
console.log(GreekNameCorrection('Γιώργος Παπαδόπουλος', {
  preserveOriginal: true,
  convertToGenitive: true
}));
console.log(GreekNameCorrection('Μαρία Κωνσταντίνου', {
  preserveOriginal: true,
  convertToGenitive: true
}));

console.log('\n=== Greeklish to Greek Transliteration ===');
console.log(GreekNameCorrection('giorgos papadopoulos', {
  transliterate: 'greeklish-to-greek'
}));
console.log(GreekNameCorrection('maria konstantinou', {
  transliterate: 'greeklish-to-greek'
}));

console.log('\n=== Greek to Latin Transliteration ===');
console.log(GreekNameCorrection('Γιώργος Παπαδόπουλος', {
  transliterate: 'greek-to-latin'
}));

console.log('\n=== Greek to Greeklish Transliteration ===');
console.log(GreekNameCorrection('Γιώργος Παπαδόπουλος', {
  transliterate: 'greek-to-greeklish'
}));

console.log('\n=== Diminutive Detection ===');
console.log(GreekNameCorrection('Γιωργάκης Παπαδάκης', {
  preserveOriginal: true,
  detectDiminutive: true
}));

console.log('\n=== Title Handling ===');
console.log(GreekNameCorrection('δρ. γιώργος παπαδόπουλος', {
  preserveOriginal: true,
  handleTitles: true
}));
console.log(GreekNameCorrection('καθ. μαρία κωνσταντίνου', {
  preserveOriginal: true,
  handleTitles: true
}));

console.log('\n=== Name Corrections ===');
console.log(GreekNameCorrection('γιοργος παπαδοπουλος', {
  preserveOriginal: true,
  suggestCorrections: true
}));
console.log(GreekNameCorrection('δημητρης νικολαου', {
  preserveOriginal: true,
  suggestCorrections: true
}));

console.log('\n=== Katharevousa Recognition ===');
console.log(GreekNameCorrection('Κωνσταντίνος Παπαδόπουλον', {
  preserveOriginal: true,
  recognizeKatharevousa: true
}));

console.log('\n=== Database-Safe Output ===');
console.log(GreekNameCorrection('Γιώργος@# Παπα!δόπουλος', {
  databaseSafe: true
}));

console.log('\n=== Sort Key Generation ===');
console.log(GreekNameCorrection('Άννα Παπαδοπούλου', {
  preserveOriginal: true,
  generateSortKey: true
}));
console.log(GreekNameCorrection('Αννα Παπαδοπουλου', {
  preserveOriginal: true,
  generateSortKey: true
}));

console.log('\n=== Name Statistics ===');
console.log(GreekNameCorrection('Δρ. Γιώργος της Μαρίας Παπαδόπουλος', {
  preserveOriginal: true,
  statistics: true,
  handleTitles: true,
  handleParticles: true
}));

console.log('\n=== Combined Features ===');
console.log(GreekNameCorrection('δρ γιοργος του παπα', {
  preserveOriginal: true,
  handleTitles: true,
  handleParticles: true,
  suggestCorrections: true,
  detectGender: true,
  convertToGenitive: true,
  generateSortKey: true,
  statistics: true,
  detectDiminutive: true
}));

console.log('\n=== Array of Objects with Multiple Features ===');
console.log(JSON.stringify(GreekNameCorrection([
  { id: 1, fullname: 'giorgos papadopoulos' },
  { id: 2, fullname: 'δρ. μαρια κωνσταντινου' }
], {
  transliterate: 'greeklish-to-greek',
  preserveOriginal: true,
  handleTitles: true,
  detectGender: true,
  convertToGenitive: true
}), null, 2));

console.log('\n=== Vocative Case Conversion ===');
console.log(GreekNameCorrection('Γιώργος Παπαδόπουλος', {
  convertToCase: 'vocative'
}));
console.log(GreekNameCorrection('Δημήτρης Νικολάου', {
  convertToCase: 'vocative'
}));
console.log(GreekNameCorrection('Μαρία Κωνσταντίνου', {
  convertToCase: 'vocative'
}));
console.log(GreekNameCorrection('Γιάννης Αλεξίου', {
  convertToCase: 'vocative',
  preserveOriginal: true
}));

console.log('\n=== Accusative Case Conversion ===');
console.log(GreekNameCorrection('Γιώργος Παπαδόπουλος', {
  convertToCase: 'accusative'
}));
console.log(GreekNameCorrection('Δημήτρης Νικολάου', {
  convertToCase: 'accusative'
}));
console.log(GreekNameCorrection('Μαρία Κωνσταντίνου', {
  convertToCase: 'accusative'
}));
console.log(GreekNameCorrection('Κώστας Παπαδάκης', {
  convertToCase: 'accusative',
  preserveOriginal: true
}));