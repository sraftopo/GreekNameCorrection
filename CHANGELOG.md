# Changelog

All notable changes to the GreekNameCorrection project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-01-XX

### 🏗️ Major Refactoring: Modular Architecture

This release represents a significant architectural improvement, refactoring the entire codebase from a monolithic structure into a clean, modular architecture. While maintaining 100% backward compatibility and all existing functionality, the codebase is now more maintainable, testable, and extensible.

**Reference**: This release builds upon [v2.0.0](https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.0), which introduced transliteration, genitive conversion, and advanced features.

### ✨ Added

- **Modular Code Structure**: Complete separation of concerns into dedicated modules:
  - `src/transliteration.js` - All transliteration maps and conversion functions
  - `src/cases.js` - Genitive, vocative, and accusative case conversion logic
  - `src/validation.js` - Name validation and normalization functions
  - `src/utils.js` - Helper utilities (capitalization, particles, titles, etc.)
  - `src/constants.js` - All maps, patterns, titles, and correction dictionaries
  - `src/index.js` - Main entry point orchestrating all modules

### 🔧 Changed

- **Code Organization**: 
  - Split monolithic 996-line `index.js` into 6 focused modules
  - Each module has a single, clear responsibility
  - Improved code readability and maintainability
  - Better separation of data (constants) from logic (functions)

- **Module Structure**:
  - `transliteration.js`: 65 lines - Handles all transliteration modes
  - `cases.js`: 323 lines - Complete case conversion system
  - `validation.js`: 61 lines - Validation and normalization
  - `utils.js`: 234 lines - Utility functions and helpers
  - `constants.js`: 327 lines - All configuration data
  - `index.js`: 252 lines - Main orchestration logic

### 📦 Improved

- **Maintainability**: 
  - Easier to locate and modify specific functionality
  - Clear module boundaries reduce coupling
  - Simplified testing of individual components

- **Developer Experience**:
  - Better code navigation and understanding
  - Easier to extend with new features
  - Clearer import/export structure

- **Code Quality**:
  - Reduced complexity per file
  - Improved code organization
  - Better separation of concerns

### ✅ Verified

- **Backward Compatibility**: All existing functionality preserved
- **Test Coverage**: All 28 tests passing
- **API Compatibility**: No breaking changes to public API
- **Functionality**: All features from v2.0.0 working identically

### 📊 Statistics

- **Before**: 1 monolithic file (996 lines)
- **After**: 6 focused modules (~1,262 total lines, including structure)
- **Test Results**: 28/28 tests passing ✅
- **Breaking Changes**: None
- **Migration Required**: None

### 🔗 Related

- **Previous Release**: [v2.0.0 Release Notes](https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.0)
- **GitHub Repository**: [sraftopo/GreekNameCorrection](https://github.com/sraftopo/GreekNameCorrection)

---

## [2.0.0] - 2025-01-02

### 🎉 Initial Public Release

Major feature release introducing transliteration, genitive conversion, and advanced name processing capabilities.

**Full Release Notes**: [v2.0.0 Release](https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.0)

### ✨ Added

- **Transliteration Support**:
  - Greeklish to Greek conversion
  - Greek to Latin (ELOT 743 inspired)
  - Greek to Greeklish conversion

- **Case Conversion**:
  - Genitive case conversion (του/της forms)
  - Vocative case conversion
  - Accusative case conversion

- **Advanced Features**:
  - Diminutive/nickname detection
  - Title and honorific support
  - Name correction suggestions
  - Katharevousa recognition
  - Database-safe output
  - Sort key generation
  - Comprehensive statistics
  - Gender detection
  - Particle handling (του/της/των)

### 🔧 Improved

- Accent normalization
- Better particle handling
- Enhanced validation

### 📚 Documentation

- Complete API reference
- Comprehensive examples
- Usage guides

---

## [1.0.0] - Initial Release

### ✨ Features

- Basic name correction
- Gender detection
- Name part splitting
- Validation

---

[2.1.0]: https://github.com/sraftopo/GreekNameCorrection/compare/v2.0...v2.1.0
[2.0.0]: https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.0
[1.0.0]: https://github.com/sraftopo/GreekNameCorrection/releases/tag/v1.0.0
