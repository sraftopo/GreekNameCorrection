# Release Notes - v2.2.1

## ✨ Accent Addition Feature Enhancement

**Release Date**: January 2025  
**Previous Version**: [v2.2.0](https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.2.0)

---

## Overview

Version 2.2.1 enhances the accent addition feature introduced in v2.2.0 with improved accuracy and comprehensive name dictionary support. This release implements accent placement based on actual Greek name dictionaries from `generate_greek_names.js`, ensuring more accurate accent placement for common Greek names.

---

## ✨ New Features

### Enhanced Accent Addition with Name Dictionary

The `addAccents` feature now uses a comprehensive name dictionary built from the same source data as `generate_greek_names.js`, ensuring accurate accent placement for:

- **First Names**: All male and female first names from the standard Greek name lists
- **Surnames**: Patronymic surnames generated from roots and suffixes
- **Compound Surnames**: Common compound surnames with prefixes (Παπα-, Καρα-, etc.)
- **Occupational Surnames**: Traditional occupational surnames
- **Geographical Surnames**: Location-based surnames
- **Common Surnames**: Frequently used surnames including genitive forms

### Improved Lookup Logic

The accent addition now follows a three-tier lookup strategy:

1. **Common Corrections Map** - Checks against known common misspellings
2. **Name Dictionary** - Looks up in comprehensive name dictionary (new in v2.2.1)
3. **Heuristic Rules** - Falls back to accent placement rules based on word endings

This ensures maximum accuracy for known names while still providing reasonable defaults for unknown names.

### CLI Support for Accent Addition

Added command-line interface support for the `addAccents` feature:

```bash
# Add accents to unaccented names
greek-name-correction -name "γιωργος παπαδοπουλος" -addAccents
# → "Γιώργος Παπαδόπουλος"

# Combine with other options
greek-name-correction -name "γιωργος παπαδοπουλος" -addAccents -preserveOriginal -json
```

---

## 🔧 Improvements

### Name Dictionary Implementation

- **Lazy Initialization**: Name dictionary is built once and cached for performance
- **Comprehensive Coverage**: Includes thousands of name variations
- **Accurate Matching**: Uses `removeAccents` function (same as `generate_greek_names.js`) for consistent matching
- **Capitalization Preservation**: Maintains original capitalization patterns

### Better Accent Placement

- **Dictionary-First Approach**: Prioritizes dictionary lookups over heuristic rules
- **Accurate for Common Names**: Names like "γιωργος", "μαρια", "παπαδοπουλος" now get correct accents
- **Fallback Support**: Still provides reasonable accent placement for unknown names

---

## 📝 Usage Examples

### Basic Accent Addition

```javascript
const GreekNameCorrection = require('greek-name-correction');

// Add accents to unaccented names
GreekNameCorrection('γιωργος παπαδοπουλος', {
  addAccents: true
});
// → "Γιώργος Παπαδόπουλος"

GreekNameCorrection('μαρια κωνσταντινου', {
  addAccents: true
});
// → "Μαρία Κωνσταντίνου"
```

### With Preserve Original

```javascript
const result = GreekNameCorrection('νικος αλεξιου', {
  addAccents: true,
  preserveOriginal: true
});
// → {
//     corrected: "Νίκος Αλεξίου",
//     original: "νικος αλεξιου",
//     isValid: true
//   }
```

### Combined with Other Features

```javascript
const result = GreekNameCorrection('γιωργος παπαδοπουλος', {
  addAccents: true,
  preserveOriginal: true,
  detectGender: true,
  convertToGenitive: true
});
// → {
//     corrected: "Γιώργος Παπαδόπουλος",
//     gender: "male",
//     genitive: "Γιώργου Παπαδόπουλου",
//     ...
//   }
```

### CLI Usage

```bash
# Basic usage
greek-name-correction -name "γιωργος παπαδοπουλος" -addAccents

# With JSON output
greek-name-correction -name "μαρια κωνσταντινου" -addAccents -json

# Combined with transliteration
greek-name-correction -name "giorgos papadopoulos" -transliterate greeklish-to-greek -addAccents
```

---

## 🐛 Bug Fixes

- **CLI Support**: Fixed missing `-addAccents` flag in command-line interface
- **Dictionary Lookup**: Improved accent placement accuracy using name dictionaries
- **Capitalization**: Fixed capitalization preservation when using dictionary lookups

---

## 🔄 Migration Guide

### From v2.2.0

No breaking changes. The `addAccents` feature now provides more accurate results for common Greek names. Existing code continues to work without modifications.

### Updating Your Code

If you were using `addAccents` in v2.2.0, you'll automatically benefit from improved accuracy in v2.2.1. No code changes required.

---

## 📊 Technical Details

### Name Dictionary Structure

The name dictionary is built from:
- **~100 male first names**
- **~100 female first names**
- **~50 surname roots** × **10 suffixes** = **~500 patronymic surnames**
- **~30 occupational surnames**
- **~30 geographical surnames**
- **~300 compound surnames**
- **~50 common surnames**

Total dictionary size: **~1,100+ name entries**

### Performance

- **Lazy Loading**: Dictionary is built only when first accessed
- **Caching**: Dictionary is cached after first build
- **Fast Lookup**: O(1) dictionary lookup time
- **Memory Efficient**: Single dictionary instance shared across all calls

---

## ✅ Testing

All existing tests pass (52/52). New tests added for:
- Dictionary lookup accuracy
- Capitalization preservation
- CLI flag parsing
- Combined feature usage

---

## 📚 Documentation Updates

- Updated README.md with accent addition examples
- Added CLI documentation for `-addAccents` flag
- Updated TypeScript definitions (already included in v2.2.0)

---

## 🙏 Acknowledgments

This release improves accent placement accuracy by leveraging the comprehensive name data from `generate_greek_names.js`, ensuring consistency across the codebase.

---

## 📦 Installation

```bash
npm install greek-name-correction@2.2.1
```

---

## 🔗 Links

- [GitHub Repository](https://github.com/sraftopo/greek-name-correction)
- [NPM Package](https://www.npmjs.com/package/greek-name-correction)
- [Documentation](https://github.com/sraftopo/greek-name-correction#readme)
- [Previous Release (v2.2.0)](./RELEASE_NOTES_2.2.0.md)

---

**Full Changelog**: [v2.2.0...v2.2.1](https://github.com/sraftopo/greek-name-correction/compare/v2.2.0...v2.2.1)
