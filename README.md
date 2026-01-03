# GreekNameCorrection

A powerful, zero-dependency Node.js library for correcting, formatting, and validating Greek names with advanced features including transliteration, genitive conversion, and intelligent name processing.

![NPM Version](https://img.shields.io/npm/v/greek-name-correction)
![License](https://img.shields.io/npm/l/greek-name-correction)
![Node Version](https://img.shields.io/node/v/greek-name-correction)

## Features

✨ **Zero Dependencies** - Lightweight and fast  
🇬🇷 **Greek-Specific** - Built for Greek name conventions  
🔄 **Transliteration** - Greeklish ↔ Greek ↔ Latin  
📝 **Smart Formatting** - Proper capitalization and syntax  
👔 **Title Support** - Handles Greek honorifics (Δρ., Καθ., etc.)  
🔀 **Genitive Conversion** - Automatic του/της forms  
🎯 **Gender Detection** - Identifies gender from name endings  
📊 **Statistics** - Comprehensive name analysis  
🔍 **Diminutive Detection** - Recognizes nickname patterns  
🏛️ **Katharevousa Support** - Converts archaic forms  
💾 **Database-Safe** - SQL-ready output  
🔤 **Sort Keys** - Accent-free sorting support  
✅ **Validation** - Greek name pattern validation  
🔧 **Flexible I/O** - Supports strings, arrays, and objects

## Installation
```bash
npm install greek-name-correction
```

## Quick Start
```javascript
const GreekNameCorrection = require('greek-name-correction');

// Simple correction
const name = GreekNameCorrection('γιώργος παπαδόπουλος');
console.log(name); // "Γιώργος Παπαδόπουλος"

// With options
const result = GreekNameCorrection('δρ. μαρια κωνσταντινου', {
  preserveOriginal: true,
  detectGender: true,
  convertToGenitive: true
});
console.log(result);
// {
//   corrected: "Δρ. Μαρία Κωνσταντίνου",
//   original: "δρ. μαρια κωνσταντινου",
//   isValid: true,
//   title: "Δρ.",
//   gender: "female",
//   genitive: "Δρ. Μαρία Κωνσταντίνου",
//   parts: { firstName: "Μαρία", lastName: "Κωνσταντίνου" }
// }
```

## Usage Examples

### Basic String Correction
```javascript
// Correct capitalization and spacing
GreekNameCorrection('γιώργος  παπαδόπουλος');
// → "Γιώργος Παπαδόπουλος"

GreekNameCorrection('ΜΑΡΙΑ ΚΩΝΣΤΑΝΤΙΝΟΥ');
// → "Μαρία Κωνσταντίνου"
```

### Array Processing
```javascript
const names = [
  'νίκος αλεξίου',
  'ΕΛΕΝΗ ΓΕΩΡΓΙΟΥ',
  'δημήτρης του παπά'
];

GreekNameCorrection(names);
// → ["Νίκος Αλεξίου", "Ελένη Γεωργίου", "Δημήτρης του Παπά"]
```

### JSON Object Processing
```javascript
const person = {
  id: 1,
  fullname: 'κώστας παπαδάκης',
  age: 30
};

GreekNameCorrection(person, { 
  jsonKey: 'fullname',
  outputKey: 'correctedName'
});
// → { id: 1, fullname: 'κώστας παπαδάκης', age: 30, correctedName: 'Κώστας Παπαδάκης' }
```

### Transliteration
```javascript
// Greeklish to Greek
GreekNameCorrection('giorgos papadopoulos', {
  transliterate: 'greeklish-to-greek'
});
// → "Γιοργος Παπαδοπουλος"

// Greek to Latin
GreekNameCorrection('Γιώργος Παπαδόπουλος', {
  transliterate: 'greek-to-latin'
});
// → "Giorgos Papadopoulos"

// Greek to Greeklish
GreekNameCorrection('Γιώργος Παπαδόπουλος', {
  transliterate: 'greek-to-greeklish'
});
// → "Giorgos Papadopoulos"
```

### Genitive Case Conversion
```javascript
GreekNameCorrection('Γιώργος Παπαδόπουλος', {
  preserveOriginal: true,
  convertToGenitive: true
});
// → { 
//     corrected: "Γιώργος Παπαδόπουλος",
//     genitive: "Γιώργος Παπαδόπουλου"
//   }
```

### Title Handling
```javascript
GreekNameCorrection('δρ. γιώργος παπαδόπουλος', {
  preserveOriginal: true,
  handleTitles: true
});
// → { 
//     corrected: "Δρ. Γιώργος Παπαδόπουλος",
//     title: "Δρ."
//   }
```

### Name Corrections
```javascript
GreekNameCorrection('γιοργος παπαδοπουλος', {
  preserveOriginal: true,
  suggestCorrections: true
});
// → {
//     corrected: "Γιώργος Παπαδόπουλος",
//     wasCorrected: true,
//     suggestedCorrection: "γιώργος παπαδόπουλος"
//   }
```

### Diminutive Detection
```javascript
GreekNameCorrection('Γιωργάκης Παπαδάκης', {
  preserveOriginal: true,
  detectDiminutive: true
});
// → {
//     corrected: "Γιωργάκης Παπαδάκης",
//     diminutive: [
//       { word: "Γιωργάκης", isDiminutive: true, possibleBase: "γιωργας/ης", diminutiveType: "άκης" },
//       { word: "Παπαδάκης", isDiminutive: true, possibleBase: "παπαδας/ης", diminutiveType: "άκης" }
//     ]
//   }
```

### Gender Detection
```javascript
GreekNameCorrection('Γιάννης Παπαδόπουλος', { 
  preserveOriginal: true,
  detectGender: true 
});
// → { corrected: "Γιάννης Παπαδόπουλος", gender: "male" }

GreekNameCorrection('Μαρία Παπαδοπούλου', { 
  preserveOriginal: true,
  detectGender: true 
});
// → { corrected: "Μαρία Παπαδοπούλου", gender: "female" }
```

### Database-Safe Output
```javascript
GreekNameCorrection('Γιώργος@# Παπα!δόπουλος', {
  databaseSafe: true
});
// → "Γιώργος Παπαδόπουλος"
```

### Sort Key Generation
```javascript
GreekNameCorrection('Άννα Παπαδοπούλου', {
  preserveOriginal: true,
  generateSortKey: true
});
// → {
//     corrected: "Άννα Παπαδοπούλου",
//     sortKey: "αννα παπαδοπουλου"
//   }
```

### Name Statistics
```javascript
GreekNameCorrection('Δρ. Γιώργος της Μαρίας Παπαδόπουλος', {
  preserveOriginal: true,
  statistics: true,
  handleTitles: true,
  handleParticles: true
});
// → {
//     corrected: "Δρ. Γιώργος της Μαρίας Παπαδόπουλος",
//     statistics: {
//       length: 41,
//       originalLength: 41,
//       wordCount: 3,
//       hasParticles: true,
//       hasAccents: true,
//       hasDiaeresis: false,
//       isAllCaps: false,
//       isAllLower: false,
//       hasNumbers: false,
//       hasSpecialChars: false
//     }
//   }
```

## API Reference

### Main Function
```javascript
GreekNameCorrection(input, options)
```

#### Parameters

- **input** `{string|string[]|Object|Object[]}` - Name(s) to process
  - `string`: Single name
  - `string[]`: Array of names
  - `Object`: Single object with name property
  - `Object[]`: Array of objects with name property

- **options** `{Object}` - Configuration options (all optional)

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `jsonKey` | `string` | `'fullname'` | Property name for input names in objects |
| `outputKey` | `string` | `'correctedFullname'` | Property name for corrected names in objects |
| `preserveOriginal` | `boolean` | `false` | Return detailed object instead of string |
| `splitNames` | `boolean` | `true` | Split and process name parts separately |
| `detectGender` | `boolean` | `false` | Detect gender from name endings |
| `normalizeTonotics` | `boolean` | `true` | Normalize Greek accent marks |
| `handleDiacritics` | `boolean` | `true` | Properly handle Greek diacritics |
| `strictMode` | `boolean` | `false` | Strict Greek character validation |
| `removeExtraSpaces` | `boolean` | `true` | Remove extra whitespace |
| `handleParticles` | `boolean` | `true` | Handle Greek particles (του/της/των) |
| `convertToGenitive` | `boolean` | `false` | Convert to genitive case |
| `transliterate` | `string\|null` | `null` | Transliteration mode: `'greeklish-to-greek'`, `'greek-to-latin'`, `'greek-to-greeklish'` |
| `detectDiminutive` | `boolean` | `false` | Detect diminutive/nickname forms |
| `handleTitles` | `boolean` | `true` | Extract and format titles |
| `suggestCorrections` | `boolean` | `false` | Suggest corrections for misspellings |
| `recognizeKatharevousa` | `boolean` | `false` | Convert archaic Greek forms |
| `databaseSafe` | `boolean` | `false` | Remove problematic characters |
| `generateSortKey` | `boolean` | `false` | Generate accent-free sort key |
| `statistics` | `boolean` | `false` | Generate name statistics |

#### Return Value

Returns the same type as input:
- `string` → `string` (or `Object` if `preserveOriginal: true`)
- `string[]` → `string[]` (or `Object[]` if `preserveOriginal: true`)
- `Object` → `Object` (with added corrected name property)
- `Object[]` → `Object[]` (with added corrected name properties)

When `preserveOriginal: true`, returns an object with:
```javascript
{
  corrected: string,        // Corrected name
  original: string,         // Original input
  isValid: boolean,         // Validation result
  title?: string,           // Extracted title (if handleTitles)
  gender?: string,          // Detected gender (if detectGender)
  parts?: Object,           // Name parts (if splitNames)
  diminutive?: Array,       // Diminutive info (if detectDiminutive)
  genitive?: string,        // Genitive form (if convertToGenitive)
  sortKey?: string,         // Sort key (if generateSortKey)
  statistics?: Object,      // Name statistics (if statistics)
  wasCorrected?: boolean,   // If corrections were applied
  suggestedCorrection?: string  // Suggested correction
}
```

## Supported Greek Titles

The library recognizes and properly formats the following Greek titles:

- **General**: Κος, Κα, Δις, Κυρ, Κυρία, Κύριος, Δεσποινίς
- **Academic**: Δρ, Καθ, Καθηγητής, Καθηγήτρια
- **Political**: Πρωθυπουργός, Υπουργός, Βουλευτής, Δήμαρχος, Περιφερειάρχης
- **Religious**: Αρχιεπίσκοπος, Μητροπολίτης, Επίσκοπος, Πατήρ
- **Military**: Στρατηγός, Ταξίαρχος, Συνταγματάρχης, Αντισυνταγματάρχης

## Common Name Corrections

The library automatically corrects common Greek name misspellings:

| Misspelling | Correction |
|-------------|------------|
| γιοργος | γιώργος |
| δημητρης | δημήτρης |
| νικος | νίκος |
| μαρια | μαρία |
| ελενη | ελένη |
| κωνσταντινος | κωνσταντίνος |
| ιωαννης | ιωάννης |
| And many more... | |

## Transliteration Tables

### Greeklish to Greek

The library uses intelligent multi-character pattern matching:

- `th` → `θ`
- `ch` → `χ`
- `ps` → `ψ`
- `ou` → `ου`
- `ai` → `αι`
- `ei` → `ει`
- `mp` → `μπ`
- `nt` → `ντ`
- `gk` → `γκ`
- And all single characters...

### Greek to Latin/Greeklish

Full support for all Greek characters including accented vowels and diaeresis.

## Advanced Usage

### Complete Name Processing Pipeline
```javascript
const result = GreekNameCorrection('dr giorgos tou papa', {
  transliterate: 'greeklish-to-greek',
  preserveOriginal: true,
  handleTitles: true,
  handleParticles: true,
  suggestCorrections: true,
  detectGender: true,
  convertToGenitive: true,
  generateSortKey: true,
  statistics: true,
  detectDiminutive: true,
  databaseSafe: true
});

console.log(result);
// Complete analysis with all features enabled
```

### Batch Processing with Custom Keys
```javascript
const employees = [
  { empId: 1, employeeName: 'giorgos papadopoulos', dept: 'IT' },
  { empId: 2, employeeName: 'maria konstantinou', dept: 'HR' }
];

const processed = GreekNameCorrection(employees, {
  jsonKey: 'employeeName',
  outputKey: 'greekName',
  transliterate: 'greeklish-to-greek',
  detectGender: true,
  preserveOriginal: true
});
```

### Database Integration Example
```javascript
// For SQL Server / PostgreSQL
const safeName = GreekNameCorrection(userInput, {
  databaseSafe: true,
  removeExtraSpaces: true,
  strictMode: true
});

// For sorting queries
const { corrected, sortKey } = GreekNameCorrection(name, {
  preserveOriginal: true,
  generateSortKey: true
});

// INSERT INTO users (name, name_sort) VALUES (?, ?)
// [corrected, sortKey]
```

## Use Cases

### 1. Form Validation & Correction
```javascript
app.post('/register', (req, res) => {
  const corrected = GreekNameCorrection(req.body.fullname, {
    suggestCorrections: true,
    handleTitles: true,
    databaseSafe: true
  });
  // Save corrected name to database
});
```

### 2. Import/Export Systems
```javascript
// Convert Greeklish to Greek during import
const greekNames = csvData.map(row => 
  GreekNameCorrection(row.name, {
    transliterate: 'greeklish-to-greek'
  })
);

// Convert to Latin for international systems
const latinNames = greekNames.map(name =>
  GreekNameCorrection(name, {
    transliterate: 'greek-to-latin'
  })
);
```

### 3. Search & Matching
```javascript
// Generate search keys
const searchKey = GreekNameCorrection(searchTerm, {
  generateSortKey: true,
  preserveOriginal: true
}).sortKey;

// Search without accent sensitivity
```

### 4. Document Generation
```javascript
// Generate formal documents with genitive forms
const recipient = GreekNameCorrection(name, {
  convertToGenitive: true,
  handleTitles: true,
  preserveOriginal: true
});

console.log(`Προς: ${recipient.genitive}`);
```

### 5. Gender-Based Processing
```javascript
const person = GreekNameCorrection(name, {
  detectGender: true,
  preserveOriginal: true
});

const pronoun = person.gender === 'male' ? 'ο' : 'η';
console.log(`${pronoun} ${person.corrected}`);
```

## Performance

- **Zero dependencies**: No external packages required
- **Efficient**: Processes thousands of names per second
- **Memory-friendly**: Minimal memory footprint
- **Pure JavaScript**: No native bindings

## Browser Support

While designed for Node.js, the library can be bundled for browser use with tools like Webpack or Browserify.

## TypeScript

TypeScript definitions can be added. Example:
```typescript
declare function GreekNameCorrection(
  input: string | string[] | object | object[],
  options?: {
    jsonKey?: string;
    outputKey?: string;
    preserveOriginal?: boolean;
    // ... other options
  }
): string | string[] | object | object[];
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development
```bash
# Clone the repository
git clone https://github.com/sraftopo/greek-name-correction.git

# Install dependencies (none currently!)
npm install

# Run tests
npm test
```

## Testing
```bash
npm test
```

The test suite covers:
- Basic string correction
- Array processing
- Object processing
- All transliteration modes
- Genitive conversion
- Title handling
- Diminutive detection
- Gender detection
- Statistics generation
- Edge cases and error handling

## Changelog

### Version 2.0.0 (Current)
- ✨ Added transliteration support (Greeklish ↔ Greek ↔ Latin)
- ✨ Added genitive case conversion
- ✨ Added diminutive detection
- ✨ Added title/honorific support
- ✨ Added name correction suggestions
- ✨ Added Katharevousa recognition
- ✨ Added database-safe output
- ✨ Added sort key generation
- ✨ Added comprehensive statistics
- 🐛 Improved accent normalization
- 🐛 Better particle handling

### Version 1.0.0
- 🎉 Initial release
- ✅ Basic name correction
- ✅ Gender detection
- ✅ Name part splitting
- ✅ Validation

## License

MIT © Stavros

## Support

For bugs, questions, and discussions please use the [GitHub Issues](https://github.com/sraftopo/greek-name-correction/issues).

## Acknowledgments

Built with ❤️ for the Greek developer community.

Special thanks to all contributors and users who help improve this library.

## Related Projects

- [greek-utils](https://www.npmjs.com/package/greek-utils) - General Greek language utilities
- [transliteration](https://www.npmjs.com/package/transliteration) - General transliteration library

---

**Made in Greece 🇬🇷**

If you find this library helpful, please consider giving it a ⭐️ on GitHub!
