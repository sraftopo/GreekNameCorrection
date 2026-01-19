# Release Notes - v2.2.0

## ✨ TypeScript Support Release

**Release Date**: January 2025  
**Previous Version**: [v2.1.2](https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.1.2)

---

## Overview

Version 2.2.0 adds comprehensive TypeScript support to the GreekNameCorrection library. This release includes full type definitions with IntelliSense support, type safety, and exported types for use in TypeScript projects. This is a **non-breaking release** - all existing JavaScript code continues to work without any changes.

---

## ✨ New Features

### TypeScript Definitions (`index.d.ts`)

Added comprehensive TypeScript definition file with:

- **Full type safety** - All function signatures are properly typed
- **IntelliSense support** - Autocomplete and inline documentation in IDEs
- **Type inference** - Return types are automatically inferred based on input
- **Function overloads** - Separate overloads for different input types (string, string[], object, object[])
- **Exported types** - All interfaces and types are exported for use in TypeScript projects
- **JSDoc comments** - Comprehensive inline documentation

### Type Definitions Included

#### Core Types
- `GreekNameCorrectionOptions` - Configuration options interface
- `GreekNameCorrectionResult` - Result object when `preserveOriginal: true`
- `TransliterationMode` - Union type for transliteration modes
- `CaseConversion` - Union type for case conversion options
- `Gender` - Union type for gender detection results

#### Supporting Types
- `NameParts` - Structure for split name parts
- `DiminutiveInfo` - Diminutive detection information
- `NameStatistics` - Statistics object structure

### Example Usage

```typescript
import GreekNameCorrection = require('greek-name-correction');

// Simple string correction with type inference
const corrected: string = GreekNameCorrection('γιάννης παπαδόπουλος');

// With options - full type checking
const result = GreekNameCorrection('γιάννης παπαδόπουλος', {
  preserveOriginal: true,
  detectGender: true,
  convertToGenitive: true
});

// result is typed as GreekNameCorrectionResult
console.log(result.corrected);  // string
console.log(result.gender);      // 'male' | 'female' | 'unknown' | undefined
console.log(result.genitive);    // string | undefined
console.log(result.parts);        // NameParts | undefined
```

### Using Exported Types

```typescript
import {
  GreekNameCorrectionOptions,
  GreekNameCorrectionResult,
  Gender,
  NameParts
} from 'greek-name-correction';

function processName(
  name: string,
  options: GreekNameCorrectionOptions
): GreekNameCorrectionResult {
  return GreekNameCorrection(name, options) as GreekNameCorrectionResult;
}

function getGender(result: GreekNameCorrectionResult): Gender | undefined {
  return result.gender;
}
```

### Array and Object Support

```typescript
// Array of strings - properly typed
const names: (string | GreekNameCorrectionResult)[] = 
  GreekNameCorrection(['γιάννης', 'μαρία']);

// Object input - preserves original object type
const person = GreekNameCorrection({
  id: 1,
  fullname: 'γιάννης παπαδόπουλος'
});
// person has type: { id: number, fullname: string, correctedFullname: string }
```

---

## 📦 Package Configuration

### Updated `package.json`

- Added `"types": "index.d.ts"` field for TypeScript to automatically find definitions
- Added `index.d.ts` to `files` array to ensure it's included in npm package

### Installation

TypeScript definitions are automatically included:

```bash
npm install greek-name-correction
```

No additional packages or configuration needed!

---

## ✅ What Stayed the Same?

### 100% Backward Compatible

- **JavaScript**: All existing JavaScript code works identically
- **API**: No changes to function signatures or options
- **Behavior**: All features work exactly as before
- **Performance**: Zero performance impact (definitions are compile-time only)
- **Runtime**: No runtime changes - definitions are purely for TypeScript

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

### For TypeScript Users

- **Full type safety** - Catch errors at compile time
- **Better IDE support** - IntelliSense, autocomplete, and inline documentation
- **Improved developer experience** - Better code completion and error messages
- **Type inference** - Automatic type detection for return values
- **Exported types** - Use library types in your own code

### For JavaScript Users

- **No changes required** - Everything works exactly as before
- **No performance impact** - TypeScript definitions are compile-time only
- **Future-proof** - Easy migration to TypeScript if desired

### For Library Maintainers

- **Better documentation** - Types serve as living documentation
- **Easier maintenance** - TypeScript helps catch bugs during development
- **Improved DX** - Better developer experience for contributors

---

## 🚀 Migration Guide

### No Migration Required!

This is a **non-breaking release**. Your existing code works without any changes:

```javascript
// This code works in both v2.1.2 and v2.2.0
const GreekNameCorrection = require('greek-name-correction');

const result = GreekNameCorrection('γιάννης παπαδόπουλος', {
  preserveOriginal: true,
  detectGender: true
});

console.log(result);
// Works exactly the same!
```

### For TypeScript Projects

Simply update to v2.2.0 and start using types:

```typescript
// Before (still works, but no types)
const GreekNameCorrection = require('greek-name-correction');

// After (with full type support)
import GreekNameCorrection = require('greek-name-correction');
// or
import GreekNameCorrection from 'greek-name-correction';

// Now you get full type checking and IntelliSense!
```

---

## 📈 Performance

- **Zero runtime impact** - TypeScript definitions are compile-time only
- **No bundle size increase** - Definitions are not included in JavaScript bundles
- **Same speed** - Identical performance to v2.1.2
- **Memory usage** - Unchanged

---

## 🧪 Testing

TypeScript definitions have been verified:

- ✅ All function signatures properly typed
- ✅ Overloads work correctly for all input types
- ✅ Return types correctly inferred
- ✅ Exported types accessible
- ✅ No TypeScript compilation errors
- ✅ Backward compatibility confirmed

---

## 📚 Documentation

- **README.md**: Updated with TypeScript usage examples and type information
- **index.d.ts**: Comprehensive type definitions with JSDoc comments
- **CHANGELOG.md**: Complete change history

---

## 🔗 Related Releases

- **v2.1.2**: Bug fix for name parts splitting with general titles
- **v2.1.1**: Added automatic general title addition feature
- **v2.1.0**: Modular architecture refactoring
- **v2.0.0**: Major feature release with transliteration and case conversions

---

## 📞 Support

- **GitHub Issues**: [Report issues](https://github.com/sraftopo/GreekNameCorrection/issues)
- **Discussions**: [Ask questions](https://github.com/sraftopo/GreekNameCorrection/discussions)
- **Previous Release**: [v2.1.2 Release Notes](https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.1.2)

---

## 📦 Installation

```bash
npm install greek-name-correction@2.2.0
```

Or update from v2.1.2:

```bash
npm update greek-name-correction
```

---

## 🔗 Links

- **GitHub Repository**: [sraftopo/GreekNameCorrection](https://github.com/sraftopo/GreekNameCorrection)
- **NPM Package**: [greek-name-correction](https://www.npmjs.com/package/greek-name-correction)
- **Previous Release**: [v2.1.2](https://github.com/sraftopo/GreekNameCorrection/releases/tag/v2.1.2)
- **Full Changelog**: [CHANGELOG.md](./CHANGELOG.md)

---

## 🎉 What's Next?

With TypeScript support now available, we're looking forward to:

- Enhanced developer experience for TypeScript users
- Better IDE integration and autocomplete
- Improved code quality through type safety
- Easier library maintenance and contributions

---

**Made in Greece 🇬🇷**

_If you find this library helpful, please consider giving it a ⭐️ on GitHub!_
