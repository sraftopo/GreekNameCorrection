# Next Steps for GreekNameCorrection Library

This document outlines the remaining improvements for the GreekNameCorrection library, with analysis for AI agent builder implementation.

## Completed Tasks ✅

1. **Fix package.json (remove unnecessary deps)** - ✅ Completed
   - Removed unused dependencies (luxon, moment, dep-optimizer, self-reference)
   - Library is now truly zero-dependency

2. **Add proper test framework** - ✅ Completed
   - Jest framework integrated
   - All 28 tests passing
   - Coverage configuration added

---

## Remaining Tasks

### 1. Modularize the Codebase

**Current State:**
- Single `index.js` file with 996 lines
- All functionality in one monolithic function
- Hard to maintain and test individual components

**Goal:**
Split into logical modules:
- `src/transliteration.js` - Transliteration maps and functions
- `src/cases.js` - Genitive, vocative, accusative conversions
- `src/validation.js` - Validation and normalization functions
- `src/utils.js` - Helper functions (capitalize, particles, etc.)
- `src/constants.js` - Maps, patterns, titles, corrections
- `src/index.js` - Main entry point that exports the main function

**AI Agent Builder Analysis:**
```
Task Type: Refactoring
Complexity: Medium-High
Dependencies: None (can be done independently)
Estimated Steps: 8-10
Risk Level: Medium (must preserve exact functionality)

Sub-tasks:
1. Create src/ directory structure
2. Extract transliteration maps and functions → transliteration.js
3. Extract case conversion functions → cases.js
4. Extract validation functions → validation.js
5. Extract utility functions → utils.js
6. Extract constants (maps, arrays) → constants.js
7. Refactor main function to import and use modules
8. Update test.js to work with new structure
9. Verify all tests still pass
10. Update package.json main field if needed

Prompt Template:
"Refactor the GreekNameCorrection library by splitting index.js (996 lines) 
into modular components. Create a src/ directory with separate files for:
- Transliteration (maps and conversion functions)
- Case conversions (genitive, vocative, accusative)
- Validation and normalization
- Utility functions
- Constants (maps, patterns, titles)
- Main entry point

Preserve exact functionality - all 28 tests must continue passing."
```

---

### 2. Add TypeScript Definitions

**Current State:**
- Pure JavaScript library
- No type definitions
- Limited IDE support and type safety

**Goal:**
Create comprehensive TypeScript definition file (`index.d.ts`) with:
- Function signatures for main export
- All option types
- Return type unions based on input types
- JSDoc comments converted to TypeScript types

**AI Agent Builder Analysis:**
```
Task Type: Type Definition
Complexity: Medium
Dependencies: None (can be done independently)
Estimated Steps: 5-6
Risk Level: Low (additive only, doesn't change runtime)

Sub-tasks:
1. Analyze all function signatures in index.js
2. Map all option types and their defaults
3. Create index.d.ts with main function signature
4. Define Options interface with all configuration options
5. Define return type unions (string | object | array)
6. Add JSDoc-style comments for better IDE support
7. Test TypeScript definitions with a sample .ts file

Prompt Template:
"Create a TypeScript definition file (index.d.ts) for the GreekNameCorrection 
library. The library exports a single function that accepts:
- Input: string | string[] | object | object[]
- Options: object with 20+ configuration properties
- Returns: same type as input (or object if preserveOriginal: true)

Include all option types, return type unions, and preserve JSDoc information 
as TypeScript comments."
```

---

### 3. Use Markdown Files for Case Conversion Rules

**Current State:**
- `names_klitiki.md` (266 lines) - Vocative case rules
- `names_aitiatiki.md` (277 lines) - Accusative case rules
- These files exist but are NOT used by the code
- Hard-coded rules in JavaScript functions

**Goal:**
- Parse markdown files to extract rules
- Convert rules to data structures
- Use parsed rules in case conversion functions
- Make rules extensible and maintainable

**AI Agent Builder Analysis:**
```
Task Type: Data Integration + Parsing
Complexity: High
Dependencies: None (but improves case conversion accuracy)
Estimated Steps: 10-12
Risk Level: Medium-High (must maintain backward compatibility)

Sub-tasks:
1. Analyze markdown file structure and rule patterns
2. Create markdown parser function
3. Extract vocative case rules from names_klitiki.md
4. Extract accusative case rules from names_aitiatiki.md
5. Convert rules to structured data (objects/arrays)
6. Create rule matching engine
7. Integrate parsed rules into convertToVocative()
8. Integrate parsed rules into convertToAccusative()
9. Add fallback to existing hard-coded rules
10. Add tests for new rule-based conversions
11. Verify existing tests still pass
12. Document rule format for future additions

Prompt Template:
"Parse the markdown files (names_klitiki.md and names_aitiatiki.md) to extract 
Greek name case conversion rules. Create a parser that:
1. Extracts rule patterns (e.g., '-ος → -ε' for vocative)
2. Handles special cases (oxytone names, exceptions)
3. Converts rules to structured JavaScript data
4. Integrates with existing convertToVocative() and convertToAccusative() functions
5. Maintains backward compatibility with existing hard-coded rules

The parser should handle markdown formatting, code blocks, and Greek text."
```

---

### 4. Add Input Validation and Error Handling

**Current State:**
- Minimal input validation
- No error messages for invalid inputs
- Silent failures in some cases (returns input unchanged)
- No validation of option types/values

**Goal:**
- Validate all input types
- Validate all option values
- Provide clear, helpful error messages
- Handle edge cases gracefully
- Add strict mode validation

**AI Agent Builder Analysis:**
```
Task Type: Validation + Error Handling
Complexity: Medium
Dependencies: None (can be done independently)
Estimated Steps: 8-10
Risk Level: Low-Medium (must not break existing behavior)

Sub-tasks:
1. Create validateInput() function
2. Create validateOptions() function
3. Add type checking for input parameter
4. Add validation for each option (type, allowed values)
5. Create custom error classes (InvalidInputError, InvalidOptionError)
6. Add error messages for common mistakes
7. Update main function to use validation
8. Add tests for invalid inputs
9. Add tests for invalid options
10. Document error handling in README

Prompt Template:
"Add comprehensive input validation and error handling to GreekNameCorrection:
1. Validate input types (string, array, object, or null/undefined)
2. Validate all 20+ option types and values
3. Create custom error classes with helpful messages
4. Handle edge cases (empty strings, null, undefined, invalid types)
5. Add strict mode that throws errors instead of silently failing
6. Maintain backward compatibility (default behavior should not throw)

Include tests for all validation scenarios."
```

---

## Implementation Priority

### Phase 1: Foundation (Low Risk, High Value)
1. **Add TypeScript Definitions** - Improves developer experience immediately
2. **Add Input Validation** - Prevents bugs and improves reliability

### Phase 2: Architecture (Medium Risk, High Value)
3. **Modularize Codebase** - Makes future improvements easier
4. **Use Markdown Files for Rules** - Improves accuracy and maintainability

---

## AI Agent Builder Prompt Templates

### Template 1: Modularization
```
You are refactoring a 996-line JavaScript file into a modular structure.

Context:
- File: index.js (996 lines)
- Function: GreekNameCorrection(input, options)
- Current: All code in single file
- Goal: Split into logical modules

Steps:
1. Analyze code structure and identify logical groupings
2. Create src/ directory
3. Extract transliteration functionality → transliteration.js
4. Extract case conversions → cases.js
5. Extract validation → validation.js
6. Extract utilities → utils.js
7. Extract constants → constants.js
8. Refactor main function to use modules
9. Ensure all 28 tests pass

Constraints:
- Must preserve exact functionality
- No breaking changes to API
- All tests must pass
- Maintain zero-dependency status
```

### Template 2: TypeScript Definitions
```
Create TypeScript definitions for a JavaScript library.

Context:
- Library: greek-name-correction
- Main export: function GreekNameCorrection(input, options)
- Input types: string | string[] | object | object[]
- Options: 20+ configuration properties
- Return: Same type as input, or object if preserveOriginal: true

Requirements:
1. Create index.d.ts
2. Define all option types accurately
3. Use union types for input/output
4. Add JSDoc-style comments
5. Export all types for external use
6. Ensure type safety without breaking changes
```

### Template 3: Markdown Parser Integration
```
Parse markdown documentation files to extract and use rules in code.

Context:
- Files: names_klitiki.md (vocative rules), names_aitiatiki.md (accusative rules)
- Current: Rules exist in markdown but not used in code
- Goal: Parse rules and integrate into conversion functions

Requirements:
1. Parse markdown structure (headings, lists, code blocks)
2. Extract rule patterns (e.g., "-ος → -ε")
3. Handle Greek text and special characters
4. Convert to structured JavaScript data
5. Integrate with existing functions
6. Maintain backward compatibility
7. Add tests for new rule-based behavior
```

### Template 4: Validation System
```
Add comprehensive validation and error handling to a library.

Context:
- Library: GreekNameCorrection function
- Current: Minimal validation, silent failures
- Goal: Validate inputs and options, provide helpful errors

Requirements:
1. Validate input types (string, array, object, null, undefined)
2. Validate all option types and values
3. Create custom error classes
4. Provide clear, actionable error messages
5. Handle edge cases gracefully
6. Add strict mode option
7. Maintain backward compatibility
8. Add comprehensive tests
```

---

## Success Criteria

### For Each Task:
- ✅ All existing tests pass
- ✅ No breaking changes to API
- ✅ Code is more maintainable
- ✅ Documentation is updated
- ✅ New functionality is tested

### Overall Goals:
- **Maintainability**: Code is easier to understand and modify
- **Reliability**: Better error handling and validation
- **Developer Experience**: TypeScript support, better errors
- **Accuracy**: More accurate case conversions using markdown rules
- **Zero Dependencies**: Maintain library's zero-dependency status

---

## Notes for AI Agent Builder

### Key Considerations:
1. **Backward Compatibility**: All changes must maintain existing API
2. **Test Coverage**: All 28 existing tests must continue passing
3. **Zero Dependencies**: No new npm packages (except devDependencies for TypeScript)
4. **Performance**: Modularization should not significantly impact performance
5. **Documentation**: Update README.md for any API changes

### Testing Strategy:
- Run `npm test` after each major change
- Add new tests for new functionality
- Verify coverage doesn't decrease
- Test edge cases and error conditions

### Code Quality:
- Follow existing code style
- Add JSDoc comments where missing
- Keep functions focused and single-purpose
- Use descriptive variable and function names

---

## Estimated Timeline

- **TypeScript Definitions**: 2-3 hours
- **Input Validation**: 3-4 hours
- **Modularization**: 4-6 hours
- **Markdown Integration**: 6-8 hours

**Total**: ~15-21 hours of development time

---

*Last Updated: After completing Jest test framework integration*
