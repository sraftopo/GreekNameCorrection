# Release Notes - v2.1.2

## 🐛 Bug Fix Release

**Release Date**: January 2025  
**Previous Version**: [v2.1.1](https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.1.1)

---

## Overview

Version 2.1.2 is a bug fix release that addresses an issue with name parts splitting when using the `addGeneralTitle` feature. This release ensures that general titles (κ. and κα) are correctly filtered out from name parts, providing accurate name component extraction.

**This is a non-breaking release** - all existing code will continue to work without any changes.

---

## 🐛 Bug Fix

### Fixed: Name Parts Splitting with General Titles

**Issue**: When `addGeneralTitle` was enabled, the general titles (κ. and κα) were not being filtered out from the `parts` object, causing them to appear as part of the first name.

**Example of the bug**:
```javascript
// Before v2.1.2
GreekNameCorrection('Ραυτόπουλος Σταύρος', {
  addGeneralTitle: true,
  preserveOriginal: true
});
// Result:
// {
//   parts: {
//     firstName: "κ.",        // ❌ Wrong - title included
//     middleName: "Ραυτόπουλος",
//     lastName: "Σταύρος"
//   }
// }
```

**Fixed behavior**:
```javascript
// After v2.1.2
GreekNameCorrection('Ραυτόπουλος Σταύρος', {
  addGeneralTitle: true,
  preserveOriginal: true
});
// Result:
// {
//   parts: {
//     firstName: "Ραυτόπουλος",  // ✅ Correct - title filtered out
//     lastName: "Σταύρος"
//   }
// }
```

### Technical Details

The `splitNameParts` function in `src/utils.js` was updated to:
- Filter out lowercase general titles (κ. and κα) in addition to capitalized titles
- Use case-insensitive comparison for title detection
- Ensure accurate name part extraction regardless of title format

---

## ✅ What Stayed the Same?

### 100% Backward Compatible

- **API**: No changes to function signatures or options
- **Behavior**: All features work identically to v2.1.1
- **Output**: Same results for all inputs (except the fixed bug)
- **Tests**: All tests passing

### All Features Preserved

✅ Automatic general title addition (κ. and κα)  
✅ Gender detection  
✅ Case conversions (genitive, vocative, accusative)  
✅ Transliteration (Greeklish ↔ Greek ↔ Latin)  
✅ Diminutive detection  
✅ Title handling  
✅ Name corrections  
✅ Katharevousa recognition  
✅ Database-safe output  
✅ Sort key generation  
✅ Statistics generation  
✅ Particle handling  
✅ Validation  
✅ All configuration options  

---

## 📊 Impact

### For Users

- **No changes required** - Existing code works as-is
- **Bug fix** - Name parts now correctly exclude general titles
- **Same performance** - No performance impact
- **Improved accuracy** - Better name part extraction

### For Developers

- **Fixed bug** - `splitNameParts` now correctly filters all title formats
- **Better consistency** - Title filtering works uniformly
- **Improved reliability** - More accurate name component extraction

---

## 🚀 Migration Guide

### No Migration Required!

This is a **non-breaking bug fix release**. Your existing code will work without any changes:

```javascript
// This code works in both v2.1.1 and v2.1.2
const GreekNameCorrection = require('greek-name-correction');

const result = GreekNameCorrection('Ραυτόπουλος Σταύρος', {
  addGeneralTitle: true,
  preserveOriginal: true,
  detectGender: true,
  convertToCase: 'vocative'
});

console.log(result);
// {
//   corrected: "κ. Ραυτόπουλος Σταύρος",
//   title: "κ.",
//   gender: "male",
//   parts: {
//     firstName: "Ραυτόπουλος",  // ✅ Now correctly excludes title
//     lastName: "Σταύρος"
//   },
//   vocative: "κ. Ραυτόπουλε Σταύρο"
// }
```

---

## 📈 Performance

- **No performance impact** - Same speed as v2.1.1
- **Memory usage** - Unchanged
- **Bundle size** - Unchanged

---

## 🧪 Testing

All tests continue to pass, including new tests for the bug fix:

```
✅ All tests passing
✅ Bug fix verified
✅ Edge cases covered
✅ Backward compatibility confirmed
```

---

## 📚 Documentation

- **README.md**: Updated with v2.1.2 changelog entry
- **CHANGELOG.md**: Complete change history
- **Code Comments**: Updated inline documentation

---

## 🔗 Related Releases

- **v2.1.1**: Added automatic general title addition feature
- **v2.1.0**: Modular architecture refactoring
- **v2.0.0**: Major feature release with transliteration and case conversions

---

## 📞 Support

- **GitHub Issues**: [Report issues](https://github.com/sraftopo/GreekNameCorrection/issues)
- **Discussions**: [Ask questions](https://github.com/sraftopo/GreekNameCorrection/discussions)
- **Previous Release**: [v2.1.1 Release Notes](https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.1.1)

---

## 📦 Installation

```bash
npm install greek-name-correction@2.1.2
```

Or update from v2.1.1:

```bash
npm update greek-name-correction
```

---

## 🔗 Links

- **GitHub Repository**: [sraftopo/GreekNameCorrection](https://github.com/sraftopo/GreekNameCorrection)
- **NPM Package**: [greek-name-correction](https://www.npmjs.com/package/greek-name-correction)
- **Previous Release**: [v2.1.1](https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.1.1)
- **Full Changelog**: [CHANGELOG.md](./CHANGELOG.md)

---

**Made in Greece 🇬🇷**

_If you find this library helpful, please consider giving it a ⭐️ on GitHub!_
