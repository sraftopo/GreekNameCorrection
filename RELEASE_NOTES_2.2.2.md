# Release Notes - v2.2.2

## 🌐 Browser Compatibility Fix

**Release Date**: January 2025  
**Previous Version**: [v2.2.1](https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.2.1)

---

## Overview

Version 2.2.2 fixes a critical browser compatibility issue where the library would fail when used in browser environments due to Node.js-specific globals like `__dirname`. The library now automatically detects the environment and gracefully handles browser usage by falling back to hard-coded rules when file system access is not available.

---

## 🐛 Bug Fixes

### Browser Compatibility

**Issue**: The library used `__dirname` to read markdown rule files, which caused errors in browser environments where Node.js globals are not available.

**Solution**: 
- Added environment detection to check for Node.js globals (`__dirname`, `require`, `module`)
- Safely require `fs` and `path` modules only in Node.js environments
- Automatically fall back to hard-coded rules from `constants.js` when in browser environments
- Case conversion (vocative and accusative) now works seamlessly in both Node.js and browser environments

**Impact**: The library can now be used directly in browser environments without bundling or polyfills. All features work correctly, with case conversion using the built-in hard-coded rules instead of reading markdown files.

### Technical Implementation

- **Environment Detection**: New `isNodeEnvironment()` function checks for Node.js globals
- **Safe Module Loading**: `fs` and `path` are only required when available
- **Graceful Fallback**: When markdown files can't be read, the library automatically uses hard-coded rules
- **No Breaking Changes**: Existing Node.js functionality remains unchanged

---

## 📝 Usage Examples

### Browser Usage

The library now works seamlessly in browser environments:

```javascript
// In browser (e.g., bundled with Webpack, Browserify, or used directly)
import GreekNameCorrection from 'greek-name-correction';

// All features work, including case conversion
const result = GreekNameCorrection('Γιώργος Παπαδόπουλος', {
  convertToCase: 'vocative'
});
// → "Γιώργο Παπαδόπουλο" (uses hard-coded rules)

const accusative = GreekNameCorrection('Γιώργος Παπαδόπουλος', {
  convertToCase: 'accusative'
});
// → "Γιώργο Παπαδόπουλο" (uses hard-coded rules)
```

### Node.js Usage

Node.js usage remains unchanged and continues to use markdown files when available:

```javascript
// In Node.js - works as before
const GreekNameCorrection = require('greek-name-correction');

// Uses markdown files if available, falls back to hard-coded rules
const result = GreekNameCorrection('Γιώργος Παπαδόπουλος', {
  convertToCase: 'vocative'
});
// → "Γιώργο Παπαδόπουλο"
```

---

## 🔄 Migration Guide

### From v2.2.1

No breaking changes. The library now works in browser environments without any modifications. If you were experiencing browser compatibility issues, they are now resolved.

### For Browser Users

If you were using bundlers or polyfills to work around the `__dirname` issue, you can now remove those workarounds. The library handles browser environments automatically.

### For Node.js Users

No changes required. The library continues to work exactly as before, with the added benefit of better error handling.

---

## 📊 Technical Details

### Environment Detection

The library now includes intelligent environment detection:

```javascript
function isNodeEnvironment() {
  return (
    typeof __dirname !== "undefined" &&
    typeof require !== "undefined" &&
    typeof module !== "undefined"
  );
}
```

### Fallback Behavior

- **Node.js Environment**: Attempts to read markdown files (`names_klitiki.md`, `names_aitiatiki.md`) for enhanced rule coverage
- **Browser Environment**: Automatically uses hard-coded rules from `constants.js`
- **Error Handling**: If file reading fails in Node.js, gracefully falls back to hard-coded rules

### Case Conversion Rules

Both vocative and accusative case conversion work in all environments:
- **Vocative**: Uses parsed markdown rules in Node.js, hard-coded rules in browser
- **Accusative**: Uses parsed markdown rules in Node.js, hard-coded rules in browser
- **Accuracy**: Hard-coded rules provide comprehensive coverage for common Greek names

---

## ✅ Testing

All existing tests pass. New tests added for:
- Browser environment simulation
- Environment detection accuracy
- Fallback behavior verification
- Case conversion in browser-like environments

---

## 📚 Documentation Updates

- Updated README.md with improved browser support information
- Added browser compatibility notes
- Updated environment requirements section

---

## 🙏 Acknowledgments

This fix ensures the library can be used in a wider range of environments, making it more accessible for web applications and browser-based projects.

---

## 📦 Installation

```bash
npm install greek-name-correction@2.2.2
```

---

## 🔗 Links

- [GitHub Repository](https://github.com/sraftopo/greek-name-correction)
- [NPM Package](https://www.npmjs.com/package/greek-name-correction)
- [Documentation](https://github.com/sraftopo/greek-name-correction#readme)
- [Previous Release (v2.2.1)](./RELEASE_NOTES_2.2.1.md)

---

**Full Changelog**: [v2.2.1...v2.2.2](https://github.com/sraftopo/greek-name-correction/compare/v2.2.1...v2.2.2)
