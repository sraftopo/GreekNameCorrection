# Changelog

All notable changes to the GreekNameCorrection project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.1] - 2025-01-XX

### ✨ Enhanced
- **Accent Addition Feature**: Improved `addAccents` option with comprehensive name dictionary support
  - Built-in dictionary with 1,100+ Greek names (first names, surnames, compound surnames)
  - Uses name dictionaries from `generate_greek_names.js` for accurate accent placement
  - Three-tier lookup strategy: Common Corrections → Name Dictionary → Heuristic Rules
  - Lazy initialization and caching for optimal performance

### ✨ Added
- **CLI Support**: Added `-addAccents` flag to command-line interface
- **Name Dictionary**: Comprehensive dictionary including:
  - ~100 male first names
  - ~100 female first names
  - ~500 patronymic surnames (roots × suffixes)
  - ~30 occupational surnames
  - ~30 geographical surnames
  - ~300 compound surnames
  - ~50 common surnames

### 🐛 Fixed
- **CLI**: Fixed missing `-addAccents` flag in command-line interface
- **Capitalization**: Fixed capitalization preservation when using dictionary lookups

### 📚 Documentation
- Updated README.md with enhanced accent addition examples
- Added CLI documentation for `-addAccents` flag

## [2.2.0] - 2025-01-XX

### ✨ Added

- **TypeScript Support**: Comprehensive TypeScript definitions (`index.d.ts`) with full type safety and IntelliSense support
  - Function signatures with proper type annotations
  - Overloads for different input types (string, string[], object, object[])
  - Exported types: `GreekNameCorrectionOptions`, `GreekNameCorrectionResult`, `Gender`, `NameParts`, `DiminutiveInfo`, `NameStatistics`, `TransliterationMode`, `CaseConversion`
  - JSDoc comments for IDE support and inline documentation
  - Automatic type inference for return values
  - Zero runtime impact (compile-time only)

### 📦 Changed

- **Package Configuration**: 
  - Added `"types": "index.d.ts"` field to `package.json` for automatic TypeScript support
  - Added `index.d.ts` to `files` array to ensure it's included in npm package

### ✅ Verified

- **Backward Compatibility**: 100% compatible with existing JavaScript code
- **Type Safety**: All function signatures properly typed
- **No Breaking Changes**: Existing code works without modifications
- **Performance**: Zero runtime impact

## [2.1.2] - 2025-01-XX

### 🐛 Fixed

- **Name Parts Splitting**: Fixed `splitNameParts` function to correctly filter out general titles (κ. and κα) from name parts when `addGeneralTitle` is enabled
  - General titles are now properly excluded from `firstName`, `middleName`, and `lastName` fields
  - Ensures accurate name part extraction when general titles are automatically added

## [2.1.1] - 2025-01-XX

### ✨ Added

- **Automatic General Title Addition**: New `addGeneralTitle` option that automatically adds general titles (κ. for men, κα for women) when no existing title is detected
  - Titles are always added in lowercase format
  - Only adds titles when no other title exists (preserves professional/academic titles)
  - Works seamlessly with all other features including case conversions

### 🔧 Changed

- General titles are always lowercase (κ. and κα) to match Greek conventions

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

[2.2.1]: https://github.com/sraftopo/GreekNameCorrection/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/sraftopo/GreekNameCorrection/compare/v2.1.2...v2.2.0
[2.1.2]: https://github.com/sraftopo/GreekNameCorrection/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/sraftopo/GreekNameCorrection/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/sraftopo/GreekNameCorrection/compare/v2.0...v2.1.0
[2.0.0]: https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.0
[1.0.0]: https://github.com/sraftopo/GreekNameCorrection/releases/tag/v1.0.0
