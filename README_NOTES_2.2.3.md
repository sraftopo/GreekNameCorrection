# Release Notes - v2.2.3

## 📖 Case Conversion Documentation & Clarity

**Release Date**: May 2026  
**Previous Version**: [v2.2.2](./RELEASE_NOTES_2.2.2.md)

---

## Overview

Version 2.2.3 clarifies how **vocative (κλητική)** and **accusative (αιτιατική)** case conversion work for Greek names—especially masculine names ending in **-ος**, where the two cases often produce **different** forms. This release adds comprehensive README documentation, a small internal refactor for vocative logic, and tests that lock in correct behavior for names like **Πρόδρομος**.

**No breaking changes.** Existing API and conversion results are unchanged; documentation and code structure are improved.

---

## 📖 Documentation

### README updates

The README now includes:

- **Vocative (Κλητική)** — when to use it, **-ο** / **-ε** rules, surname handling, examples
- **Accusative (Αιτιατική)** — when to use it, consistent **-ος → -ο** rule, other endings
- **Vocative vs Accusative** — comparison table and side-by-side code examples
- **CLI examples** for `Πρόδρομος` in both cases
- Updated processing pipeline and use-case sections

### Key rule (do not confuse cases)

| Name (ονομαστική) | Accusative (αιτιατική) | Vocative (κλητική) | Typical use |
|-------------------|------------------------|-------------------|-------------|
| **Πρόδρομος** | **Πρόδρομο** | **Πρόδρομε** | τον Πρόδρομο / «Πρόδρομε!» |
| **Στέφανος** | **Στέφανο** | **Στέφανε** | τον Στέφανο / «Στέφανε!» |
| **Γιώργος** | **Γιώργο** | **Γιώργο** | τον Γιώργο / «Γιώργο!» |

- Use **`convertToCase: 'accusative'`** for direct objects (with **τον/την**).
- Use **`convertToCase: 'vocative'`** for direct address (greeting, calling someone).

---

## 🔧 Code changes

### Vocative refactor (`src/cases.js`)

Masculine **-ος** vocative logic is centralized in `resolveOsVocativeStyleEnding()`:

- Diminutives → **-ο**
- Listed short first names → **-ο** (Γιώργος, Νίκος, …)
- Listed longer first names → **-ε** (Στέφανος, Κωνσταντίνος, …)
- Surnames: paroxytone → **-ο**, oxytone → **-ε**
- Other first names: disyllabic → **-ο**, 3+ syllables → **-ε** (e.g. **Πρόδρομος** → **Πρόδρομε**)

Behavior matches previous releases; the refactor improves maintainability only.

### Accusative (unchanged behavior)

Masculine names in **-ος** always form accusative in **-ο**, regardless of stress or syllable count:

```javascript
GreekNameCorrection('Πρόδρομος', { convertToCase: 'accusative' });
// → "Πρόδρομο"

GreekNameCorrection('Στέφανος', { convertToCase: 'accusative' });
// → "Στέφανο"
```

Accusative does **not** use vocative **-ε** endings (e.g. Πρόδρομος is never Πρόδρομε in accusative).

---

## 📝 Usage examples

### Accusative (direct object)

```javascript
const acc = GreekNameCorrection('Πρόδρομος', { convertToCase: 'accusative' });
console.log(`Είδα τον ${acc}.`); // "Είδα τον Πρόδρομο."
```

### Vocative (addressing)

```javascript
const voc = GreekNameCorrection('Πρόδρομος', { convertToCase: 'vocative' });
console.log(`Γεια σου, ${voc}!`); // "Γεια σου, Πρόδρομε!"
```

### Both forms with `preserveOriginal`

```javascript
const result = GreekNameCorrection('Πρόδρομος', {
  convertToCase: 'vocative',
  preserveOriginal: true
});
// result.corrected → "Πρόδρομος"
// result.vocative   → "Πρόδρομε"
```

### CLI

```bash
# Accusative: Πρόδρομο
greek-name-correction -name "Πρόδρομος" -convertToCase accusative

# Vocative: Πρόδρομε
greek-name-correction -name "Πρόδρομος" -convertToCase vocative
```

---

## ✅ Testing

New test coverage:

```javascript
// Accusative: Πρόδρομο | Vocative: Πρόδρομε
GreekNameCorrection('Πρόδρομος', { convertToCase: 'accusative' }); // → "Πρόδρομο"
GreekNameCorrection('Πρόδρομος', { convertToCase: 'vocative' });   // → "Πρόδρομε"
```

All **53** tests pass.

---

## 🔄 Migration guide

### From v2.2.2

No code changes required. If you previously assumed accusative and vocative always match for **-ος** names, update your expectations:

- **Πρόδρομος**: accusative **Πρόδρομο**, vocative **Πρόδρομε**
- **Στέφανος**: accusative **Στέφανο**, vocative **Στέφανε**

Use the correct `convertToCase` value for your UI or grammar context.

---

## 📚 Related files

| File | Role |
|------|------|
| `README.md` | User-facing documentation (updated) |
| `names_klitiki.md` | Vocative rules reference |
| `names_aitiatiki.md` | Accusative rules reference |
| `src/cases.js` | Case conversion implementation |
| `src/constants.js` | Name lists for vocative **-ο** / **-ε** |
| `CHANGELOG.md` | Keep a Changelog entry |

---

## 📦 Installation

```bash
npm install greek-name-correction@2.2.3
```

---

## 🔗 Links

- [GitHub Repository](https://github.com/sraftopo/greek-name-correction)
- [NPM Package](https://www.npmjs.com/package/greek-name-correction)
- [Documentation](./README.md)
- [Previous Release (v2.2.2)](./RELEASE_NOTES_2.2.2.md)

---

**Full Changelog**: [v2.2.2...v2.2.3](https://github.com/sraftopo/greek-name-correction/compare/v2.2.2...v2.2.3)
