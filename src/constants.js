// constants.js
"use strict";

// Transliteration maps
const greeklishToGreekMap = {
  a: "α",
  b: "β",
  g: "γ",
  d: "δ",
  e: "ε",
  z: "ζ",
  h: "η",
  th: "θ",
  i: "ι",
  k: "κ",
  l: "λ",
  m: "μ",
  n: "ν",
  x: "ξ",
  o: "ο",
  p: "π",
  r: "ρ",
  s: "σ",
  t: "τ",
  y: "υ",
  f: "φ",
  ch: "χ",
  ps: "ψ",
  w: "ω",
  ks: "ξ",
  ou: "ου",
  ai: "αι",
  ei: "ει",
  oi: "οι",
  ui: "υι",
  au: "αυ",
  eu: "ευ",
  ou: "ου",
  iu: "ιου",
  mp: "μπ",
  nt: "ντ",
  gk: "γκ",
  gg: "γγ",
  ts: "τσ",
  tz: "τζ",
  dz: "ντζ"
};

const greekToLatinMap = {
  α: "a",
  ά: "a",
  β: "v",
  γ: "g",
  δ: "d",
  ε: "e",
  έ: "e",
  ζ: "z",
  η: "i",
  ή: "i",
  θ: "th",
  ι: "i",
  ί: "i",
  ϊ: "i",
  ΐ: "i",
  κ: "k",
  λ: "l",
  μ: "m",
  ν: "n",
  ξ: "x",
  ο: "o",
  ό: "o",
  π: "p",
  ρ: "r",
  σ: "s",
  ς: "s",
  τ: "t",
  υ: "y",
  ύ: "y",
  ϋ: "y",
  ΰ: "y",
  φ: "f",
  χ: "ch",
  ψ: "ps",
  ω: "o",
  ώ: "o",
  Α: "A",
  Ά: "A",
  Β: "V",
  Γ: "G",
  Δ: "D",
  Ε: "E",
  Έ: "E",
  Ζ: "Z",
  Η: "I",
  Ή: "I",
  Θ: "Th",
  Ι: "I",
  Ί: "I",
  Ϊ: "I",
  Κ: "K",
  Λ: "L",
  Μ: "M",
  Ν: "N",
  Ξ: "X",
  Ο: "O",
  Ό: "O",
  Π: "P",
  Ρ: "R",
  Σ: "S",
  Τ: "T",
  Υ: "Y",
  Ύ: "Y",
  Ϋ: "Y",
  Φ: "F",
  Χ: "Ch",
  Ψ: "Ps",
  Ω: "O",
  Ώ: "O"
};

const greekToGreeklishMap = {
  α: "a",
  ά: "a",
  β: "v",
  γ: "g",
  δ: "d",
  ε: "e",
  έ: "e",
  ζ: "z",
  η: "i",
  ή: "i",
  θ: "th",
  ι: "i",
  ί: "i",
  ϊ: "i",
  ΐ: "i",
  κ: "k",
  λ: "l",
  μ: "m",
  ν: "n",
  ξ: "ks",
  ο: "o",
  ό: "o",
  π: "p",
  ρ: "r",
  σ: "s",
  ς: "s",
  τ: "t",
  υ: "u",
  ύ: "u",
  ϋ: "u",
  ΰ: "u",
  φ: "f",
  χ: "x",
  ψ: "ps",
  ω: "w",
  ώ: "w",
  Α: "A",
  Ά: "A",
  Β: "V",
  Γ: "G",
  Δ: "D",
  Ε: "E",
  Έ: "E",
  Ζ: "Z",
  Η: "I",
  Ή: "I",
  Θ: "Th",
  Ι: "I",
  Ί: "I",
  Ϊ: "I",
  Κ: "K",
  Λ: "L",
  Μ: "M",
  Ν: "N",
  Ξ: "Ks",
  Ο: "O",
  Ό: "O",
  Π: "P",
  Ρ: "R",
  Σ: "S",
  Τ: "T",
  Υ: "U",
  Ύ: "U",
  Ϋ: "U",
  Φ: "F",
  Χ: "X",
  Ψ: "Ps",
  Ω: "W",
  Ώ: "W"
};

// Diminutive patterns
const diminutivePatterns = {
  άκης: "ας/ης",
  ούλης: "ος",
  ίτσα: "α",
  ούλα: "α",
  άκι: "ο",
  ούλι: "ο",
  ίτσας: "ας",
  ούλας: "ας",
  ίκος: "ος",
  ούκος: "ος",
  ίκη: "η",
  ούκα: "α"
};

// Common Greek titles
const titles = [
  "Κος",
  "Κα",
  "Δις",
  "Κυρ",
  "Κυρία",
  "Κύριος",
  "Δεσποινίς",
  "Δρ",
  "Καθ",
  "Καθηγητής",
  "Καθηγήτρια",
  "Πρωθυπουργός",
  "Υπουργός",
  "Βουλευτής",
  "Δήμαρχος",
  "Περιφερειάρχης",
  "Αρχιεπίσκοπος",
  "Μητροπολίτης",
  "Επίσκοπος",
  "Πατήρ",
  "Στρατηγός",
  "Ταξίαρχος",
  "Συνταγματάρχης",
  "Αντισυνταγματάρχης"
];

// Katharevousa endings to modern Greek
const katharevousaMap = {
  ιον: "ιο",
  ειον: "ειο",
  αιον: "αιο",
  ου: "ου",
  ων: "ων",
  ας: "ας",
  ης: "ης"
};

// Common name misspellings
const commonCorrections = {
  γιοργος: "γιώργος",
  γεωργιος: "γεώργιος",
  δημητρης: "δημήτρης",
  δημητριος: "δημήτριος",
  νικος: "νίκος",
  νικολαος: "νικόλαος",
  μαρια: "μαρία",
  ελενη: "ελένη",
  κωνσταντινος: "κωνσταντίνος",
  κωστας: "κώστας",
  ιωαννης: "ιωάννης",
  γιαννης: "γιάννης",
  αναστασια: "αναστασία",
  σοφια: "σοφία",
  παναγιωτης: "παναγιώτης",
  παναγιωτα: "παναγιώτα"
};

// Oxytone names (stressed on last syllable) - for vocative case
// These names ending in -ος remain unchanged in vocative (first names only)
const oxytoneNames = ["νικολός", "ανδρός", "αναστάσιος", "αναστάσιος"];

// Names that end in -ας but are actually -ης pattern (for accusative)
const namesAsIsPattern = ["θανάσης", "ανάσης"];

// Common Greek surnames ending in -ος that form vocative in -ο (paroxytone surnames)
// These are surnames that should form vocative in -ο, not -ε
const paroxytoneSurnames = [
  "ευαγγελάτος", "ευγενελάτος", "βενιζέλος", "παπαδάτος", "παπαδόπουλος",
  "γεωργίου", "κωνσταντίνου", "δημήτριου", "αλεξίου", "νικολάου",
  "παπαγεωργίου", "παπακωνσταντίνου", "παπαδήμου", "παπαδάκης",
  "ανδρέου", "ιωάννου", "βασιλείου", "αθανασίου", "παναγιώτου",
  "χατζηγιάννη", "χατζηκωνσταντίνου", "χατζηπαναγιώτου"
];

// Oxytone surnames (stressed on last syllable) that form vocative in -ε
// These are surnames that should form vocative in -ε (not remain unchanged like oxytone first names)
const oxytoneSurnames = ["ξινός"];

// Diminutive patterns that form vocative in -ο
const diminutiveVocativePatterns = ["άκος", "ούκος", "ίτσος"];

// First names ending in -ος that form vocative in -ο (not -ε)
// These are typically disyllabic or common short names
const vocativeInO_FirstNames = [
  "γιώργος", "νίκος", "σπύρος", "χρήστος", "πέτρος"
];

// First names ending in -ος that form vocative in -ε
// These are typically longer names (3+ syllables)
const vocativeInE_FirstNames = [
  "κωνσταντίνος", "αλέξανδρος", "στέφανος", "νικόλαος"
];

// Special cases for vocative (names with irregular or multiple forms)
const specialVocativeCases = {
  "παύλος": "παύλο", // Παύλος can be Παύλο or Παύλε, default to Παύλο
  "παυλος": "παυλο"
};

module.exports = {
  greeklishToGreekMap,
  greekToLatinMap,
  greekToGreeklishMap,
  diminutivePatterns,
  titles,
  katharevousaMap,
  commonCorrections,
  oxytoneNames,
  namesAsIsPattern,
  paroxytoneSurnames,
  oxytoneSurnames,
  diminutiveVocativePatterns,
  vocativeInO_FirstNames,
  vocativeInE_FirstNames,
  specialVocativeCases
};
