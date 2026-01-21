// utils.js
"use strict";

const {
  titles,
  diminutivePatterns,
  katharevousaMap,
  commonCorrections
} = require("./constants");

// Capitalize Greek names properly
function capitalizeGreekName(str) {
  if (!str || str.length === 0) return str;

  const first = str.charAt(0).toUpperCase();
  const rest = str.slice(1).toLowerCase();

  return first + rest;
}

// Check if word is a Greek particle
function isGreekParticle(word) {
  const particles = [
    "του",
    "της",
    "των",
    "τον",
    "την",
    "τα",
    "το",
    "και",
    "ή",
    "ειδών",
    "εκ",
    "εξ"
  ];
  return particles.includes(word);
}

// Extract title from name
function extractTitle(name) {
  const words = name.trim().split(/\s+/);
  const firstWord = words[0];

  // Check if first word is a title (case-insensitive)
  const foundTitle = titles.find(
    (t) =>
      firstWord.toLowerCase() === t.toLowerCase() ||
      firstWord.toLowerCase() + "." === t.toLowerCase() ||
      firstWord.toLowerCase() === t.toLowerCase() + "."
  );

  if (foundTitle) {
    return {
      title: capitalizeGreekName(foundTitle),
      name: words.slice(1).join(" ")
    };
  }

  return { title: null, name: name };
}

// Convert Katharevousa to modern Greek
function convertKatharevousa(text) {
  let result = text;

  for (const [old, modern] of Object.entries(katharevousaMap)) {
    const regex = new RegExp(old + "$", "i");
    result = result.replace(regex, modern);
  }

  return result;
}

// Suggest correction for common misspellings
function suggestCorrection(text) {
  const words = text.toLowerCase().split(/\s+/);
  let corrected = false;

  const correctedWords = words.map((word) => {
    if (commonCorrections[word]) {
      corrected = true;
      return commonCorrections[word];
    }
    return word;
  });

  return corrected ? correctedWords.join(" ") : null;
}

// Detect diminutive forms
function detectDiminutive(name) {
  const parts = name.toLowerCase().split(/\s+/);
  const results = [];

  for (const part of parts) {
    for (const [ending, baseEnding] of Object.entries(diminutivePatterns)) {
      if (part.endsWith(ending)) {
        results.push({
          word: capitalizeGreekName(part),
          isDiminutive: true,
          possibleBase: part.slice(0, -ending.length) + baseEnding,
          diminutiveType: ending
        });
        break;
      }
    }
  }

  return results.length > 0 ? results : null;
}

// Make database-safe
function makeDatabaseSafe(text) {
  // Remove potentially problematic characters for databases
  return text
    .replace(/[^\u0370-\u03FF\u1F00-\u1FFF\w\s\-']/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

// Generate sorting key (remove accents for sorting)
function generateSortKey(text) {
  const accentMap = {
    ά: "α",
    έ: "ε",
    ή: "η",
    ί: "ι",
    ό: "ο",
    ύ: "υ",
    ώ: "ω",
    Ά: "Α",
    Έ: "Ε",
    Ή: "Η",
    Ί: "Ι",
    Ό: "Ο",
    Ύ: "Υ",
    Ώ: "Ω",
    ϊ: "ι",
    ϋ: "υ",
    ΐ: "ι",
    ΰ: "υ",
    Ϊ: "Ι",
    Ϋ: "Υ",
    ς: "σ"
  };

  let sortKey = text.toLowerCase();
  for (const [accented, plain] of Object.entries(accentMap)) {
    sortKey = sortKey.replace(new RegExp(accented, "g"), plain);
  }

  return sortKey;
}

// Generate statistics
function generateStatistics(processed, original) {
  const words = processed
    .split(/\s+/)
    .filter((w) => !isGreekParticle(w.toLowerCase()));

  const stats = {
    length: processed.length,
    originalLength: original.length,
    wordCount: words.length,
    hasParticles: processed
      .split(/\s+/)
      .some((w) => isGreekParticle(w.toLowerCase())),
    hasAccents: /[άέήίόύώΆΈΉΊΌΎΏ]/.test(processed),
    hasDiaeresis: /[ϊϋΐΰ]/.test(processed),
    isAllCaps:
      original === original.toUpperCase() && /[Α-Ωα-ω]/.test(original),
    isAllLower:
      original === original.toLowerCase() && /[Α-Ωα-ω]/.test(original),
    hasNumbers: /\d/.test(processed),
    hasSpecialChars: /[^Α-Ωα-ωίϊΐόάέύϋΰήώ\s\-']/.test(processed)
  };

  return stats;
}

// Detect gender from name endings
function detectGender(fullname) {
  // Remove title if present
  const parts = fullname.split(/\s+/).filter((w) => !titles.includes(w));
  const lastName = parts[parts.length - 1]?.toLowerCase();

  if (!lastName) return "unknown";

  const maleEndings = ["ος", "ης", "ας", "ούς"];
  const femaleEndings = ["ου", "α", "η"];

  for (const ending of maleEndings) {
    if (lastName.endsWith(ending)) return "male";
  }

  for (const ending of femaleEndings) {
    if (lastName.endsWith(ending)) return "female";
  }

  return "unknown";
}

// Split name into parts
function splitNameParts(fullname) {
  const parts = fullname
    .split(/\s+/)
    .filter((p) => {
      const lowerP = p.toLowerCase();
      return !isGreekParticle(lowerP) && 
             !titles.includes(p) && 
             !titles.some(t => t.toLowerCase() === lowerP) &&
             lowerP !== "κ." && 
             lowerP !== "κα";
    });

  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  if (parts.length === 2) return { firstName: parts[0], lastName: parts[1] };

  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1]
  };
}

// Add general title (κ. for men, κα for women) if no title exists
function addGeneralTitleIfMissing(nameWithoutTitle) {
  if (!nameWithoutTitle || nameWithoutTitle.trim() === "") {
    return null;
  }

  // Detect gender from the name
  const gender = detectGender(nameWithoutTitle);

  // Add appropriate title based on gender (always lowercase)
  if (gender === "male") {
    return "κ.";
  } else if (gender === "female") {
    return "κα";
  }

  // If gender is unknown, don't add a title
  return null;
}

// Remove accents from a string (same as generate_greek_names.js)
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Check if a word already has an accent
function hasAccent(word) {
  return /[άέήίόύώΆΈΉΊΌΎΏ]/.test(word);
}

// Build name dictionary from accented name lists (based on generate_greek_names.js)
function buildNameDictionary() {
  const maleFirstNames = [
    'Γιώργος', 'Γιάννης', 'Νίκος', 'Δημήτρης', 'Κώστας', 'Ανδρέας', 'Παναγιώτης',
    'Μιχάλης', 'Βασίλης', 'Χρήστος', 'Θανάσης', 'Σταύρος', 'Αντώνης', 'Πέτρος',
    'Σπύρος', 'Μάνος', 'Λευτέρης', 'Γρηγόρης', 'Αλέξανδρος', 'Κυριάκος',
    'Κωνσταντίνος', 'Θεόδωρος', 'Ηλίας', 'Απόστολος', 'Νικόλαος', 'Χαράλαμπος',
    'Ευάγγελος', 'Άγγελος', 'Ιωάννης', 'Σωτήρης', 'Τάσος', 'Μάρκος', 'Φώτης',
    'Παύλος', 'Αθανάσιος', 'Μιλτιάδης', 'Θεμιστοκλής', 'Περικλής',
    'Αριστείδης', 'Ευστάθιος', 'Ιάκωβος', 'Λάζαρος', 'Παρασκευάς', 'Σάββας',
    'Βησσαρίων', 'Διονύσης', 'Δομήνικος', 'Ζαχαρίας', 'Θεοφάνης', 'Ιγνάτιος',
    'Κλήμης', 'Λουκάς', 'Ματθαίος', 'Νεκτάριος', 'Ξενοφών', 'Ορέστης',
    'Παντελής', 'Ραφαήλ', 'Σεραφείμ', 'Τιμόθεος', 'Φίλιππος', 'Χαρίτων',
    'Ψαλτής', 'Ωρίων', 'Αλκιβιάδης', 'Βάϊος', 'Γαβριήλ', 'Δαμιανός',
    'Εμμανουήλ', 'Ζήνων', 'Θεοδόσιος', 'Ιεροθέος', 'Καλλίνικος', 'Λεωνίδας',
    'Μελέτιος', 'Νικηφόρος', 'Οδυσσέας', 'Πλάτων', 'Ρήγας', 'Στέφανος',
    'Τρύφων', 'Φιλήμων', 'Χριστόφορος', 'Αγαμέμνων', 'Βενιαμίν', 'Γεδεών',
    'Δανιήλ', 'Ελευθέριος', 'Ζηνόβιος', 'Θεόκλητος', 'Ισίδωρος', 'Κύριλλος',
    'Λάμπρος', 'Μάξιμος', 'Νεόφυτος', 'Ονήσιμος', 'Παϊσιος', 'Ρωμανός'
  ];

  const femaleFirstNames = [
    'Μαρία', 'Ελένη', 'Κατερίνα', 'Σοφία', 'Άννα', 'Βασιλική', 'Δήμητρα',
    'Ιωάννα', 'Χριστίνα', 'Αικατερίνη', 'Παναγιώτα', 'Αθηνά', 'Ευαγγελία',
    'Δέσποινα', 'Μαργαρίτα', 'Κωνσταντίνα', 'Αλεξάνδρα', 'Φωτεινή', 'Γεωργία',
    'Νίκη', 'Ειρήνη', 'Ελισάβετ', 'Αναστασία', 'Θεοδώρα', 'Αγγελική',
    'Παρασκευή', 'Σταυρούλα', 'Ευτυχία', 'Χαρίκλεια', 'Βασιλεία', 'Μάρθα',
    'Χαρά', 'Ελπίδα', 'Πηνελόπη', 'Καλλιόπη', 'Ουρανία', 'Εύη', 'Ζωή',
    'Θάλεια', 'Ισμήνη', 'Κλειώ', 'Λητώ', 'Μελίνα', 'Νατάσα', 'Ολυμπία',
    'Ρένα', 'Σέβη', 'Τατιάνα', 'Φανή', 'Χρύσα', 'Αγλαΐα', 'Βάσω',
    'Γλυκερία', 'Δανάη', 'Ευδοκία', 'Ζηνοβία', 'Θεανώ', 'Ιφιγένεια',
    'Κασσάνδρα', 'Λαμπρινή', 'Μελπομένη', 'Νεφέλη', 'Περσεφόνη', 'Ρόδη',
    'Σμαράγδα', 'Τερψιχόρη', 'Φαίδρα', 'Χρυσάνθη', 'Αγάπη', 'Βιργινία',
    'Γαλάτεια', 'Διονυσία', 'Ερμιόνη', 'Ζέφη', 'Θεοδοσία', 'Ιουλία',
    'Καλλιρόη', 'Ληδά', 'Μυρτώ', 'Νόρα', 'Πολυξένη', 'Ρωξάνη',
    'Στέλλα', 'Τριανταφυλλιά', 'Φλώρα', 'Χλόη', 'Αρετή', 'Βέρα',
    'Γιούλη', 'Δάφνη', 'Εύα', 'Ζέτα', 'Θεώνη', 'Ίρις'
  ];

  const surnameRoots = [
    'Γεώργ', 'Νικολά', 'Δημήτρ', 'Κωνσταντίν', 'Ιωάνν', 'Βασιλεί', 'Αθανασί',
    'Μιχαήλ', 'Παναγιώτ', 'Αντων', 'Χριστοδούλ', 'Σταματί', 'Ευαγγέλ',
    'Θεοδώρ', 'Ανδρέ', 'Πέτρ', 'Παύλ', 'Σπυρίδ', 'Χαράλαμπ', 'Αποστόλ',
    'Ηλί', 'Γρηγόρ', 'Μάρκ', 'Φώτ', 'Αλεξάνδρ', 'Κυριάκ', 'Λεωνίδ',
    'Περικλ', 'Θεμιστοκλ', 'Αριστείδ', 'Διονύσ', 'Ζαχαρί', 'Ματθαί',
    'Στεφάν', 'Τάκ', 'Μανώλ', 'Τζών', 'Σωτήρ', 'Λάζαρ', 'Χρήστ',
    'Παρασκευ', 'Σάββ', 'Νεκτάρ', 'Φίλιππ', 'Ραφαήλ', 'Γαβριήλ',
    'Δαμιαν', 'Εμμανουήλ', 'Θεοδόσ', 'Καλλίνικ', 'Μελέτ', 'Ξενοφών',
    'Ορέστ', 'Πλάτων', 'Σεραφείμ', 'Τιμόθε', 'Φιλήμον', 'Χριστοφόρ'
  ];

  const surnamePatronymicSuffixes = [
    { suffix: 'ίου', gender: 'Both' },
    { suffix: 'όπουλος', gender: 'M' },
    { suffix: 'οπούλου', gender: 'F' },
    { suffix: 'ίδης', gender: 'M' },
    { suffix: 'ίδου', gender: 'F' },
    { suffix: 'άκης', gender: 'M' },
    { suffix: 'άκη', gender: 'F' },
    { suffix: 'έλης', gender: 'M' },
    { suffix: 'έλη', gender: 'F' },
    { suffix: 'όγλου', gender: 'Both' }
  ];

  const occupationalSurnames = [
    'Οικονόμου', 'Παπάς', 'Παππάς', 'Ιερομονάχου', 'Διδασκάλου', 'Γραμματικού',
    'Καπετάνιος', 'Στρατηγός', 'Ναύτης', 'Αγρότης', 'Ψαράς', 'Κτηνοτρόφος',
    'Βοσκός', 'Μαραγκός', 'Σιδεράς', 'Χαλκιάς', 'Χρυσοχόος', 'Αργυροπούλος',
    'Ράπτης', 'Υφαντής', 'Κτίστης', 'Ξυλουργός', 'Ελαιοπώλης', 'Καφετζής',
    'Μαγειρίτσης', 'Κρεοπώλης', 'Αρτοποιός', 'Φούρναρης', 'Ζαχαροπλάστης',
    'Μπακάλης', 'Παντοπώλης', 'Ταβερνάρης', 'Ξενοδόχος', 'Γιατρός',
    'Φαρμακοποιός', 'Δικηγόρος', 'Συμβολαιογράφος', 'Μηχανικός', 'Τεχνίτης'
  ];

  const geographicalSurnames = [
    'Αθηναίος', 'Θεσσαλονικεύς', 'Πατρινός', 'Ηρακλειώτης', 'Βολιώτης',
    'Λαρισαίος', 'Ιωαννίτης', 'Κερκυραίος', 'Ροδίτης', 'Χανιώτης',
    'Ρεθυμνιώτης', 'Κρητικός', 'Πελοποννήσιος', 'Θηβαίος', 'Κορίνθιος',
    'Σπαρτιάτης', 'Αργείος', 'Μεσσήνιος', 'Αρκάς', 'Αχαιός',
    'Ηλείος', 'Μακεδών', 'Ήπειρώτης', 'Θεσσαλός', 'Στερεοελλαδίτης',
    'Θρακιώτης', 'Νησιώτης', 'Μικρασιάτης', 'Πόντιος', 'Κύπριος',
    'Αλεξανδρινός', 'Σμυρναίος', 'Κωνσταντινουπολίτης', 'Τραπεζούντιος', 'Σινώπης'
  ];

  const dictionary = {};

  // Add first names
  [...maleFirstNames, ...femaleFirstNames].forEach(name => {
    const unaccented = removeAccents(name).toLowerCase();
    dictionary[unaccented] = name;
  });

  // Generate patronymic surnames
  surnameRoots.forEach(root => {
    surnamePatronymicSuffixes.forEach(({suffix}) => {
      const surname = root + suffix;
      const unaccented = removeAccents(surname).toLowerCase();
      dictionary[unaccented] = surname;
    });
  });

  // Add occupational surnames
  occupationalSurnames.forEach(name => {
    const unaccented = removeAccents(name).toLowerCase();
    dictionary[unaccented] = name;
  });

  // Add geographical surnames
  geographicalSurnames.forEach(name => {
    const unaccented = removeAccents(name).toLowerCase();
    dictionary[unaccented] = name;
  });

  // Add common compound surnames (like in generate_greek_names.js)
  const surnameCompoundPrefixes = [
    'Παπα', 'Καρα', 'Μαυρο', 'Χατζη', 'Κοντο', 'Μακρο', 'Μικρο',
    'Παλαιο', 'Νεο', 'Σιδερο', 'Χρυσο', 'Αργυρο', 'Καλο', 'Μεγαλο',
    'Τρια', 'Πενταρ', 'Εξαρχ', 'Επταρ', 'Εννιαρ', 'Δεκαρ'
  ];

  // Generate some common compound surnames
  surnameCompoundPrefixes.forEach(prefix => {
    surnameRoots.slice(0, 10).forEach(root => {
      surnamePatronymicSuffixes.slice(0, 3).forEach(({suffix}) => {
        const surname = prefix + root.toLowerCase() + suffix;
        const unaccented = removeAccents(surname).toLowerCase();
        dictionary[unaccented] = surname;
      });
    });
  });

  // Add some very common surnames manually (including genitive forms)
  const commonSurnames = [
    'Παπαδόπουλος', 'Παπαδοπούλου', 'Γεωργίου', 'Κωνσταντίνου',
    'Δημητρίου', 'Αλεξίου', 'Νικολάου', 'Βασιλείου', 'Αθανασίου',
    'Παναγιώτου', 'Χατζηγιάννη', 'Παπαδάκης', 'Αντωνίου',
    'Ιωάννου', 'Μιχαήλ', 'Μιχαήλου', 'Σταματίου', 'Ευαγγέλου',
    'Θεοδώρου', 'Ανδρέου', 'Πέτρου', 'Παύλου', 'Σπυρίδου',
    'Χαράλαμπου', 'Αποστόλου', 'Ηλίου', 'Γρηγόριου', 'Μάρκου',
    'Φώτου', 'Κυριάκου', 'Λεωνίδου', 'Στεφάνου', 'Μανώλη',
    'Σωτήρη', 'Σωτήρου', 'Λαζάρου', 'Χρήστου', 'Παρασκευά',
    'Σάββα', 'Νεκταρίου', 'Ραφαήλ', 'Γαβριήλ', 'Δαμιανού',
    'Εμμανουήλ', 'Θεοδόσιου', 'Καλλινίκου', 'Μελετίου', 'Ξενοφώντος',
    'Ορέστη', 'Ορέστου', 'Σεραφείμ', 'Τιμοθέου', 'Φιλήμονος',
    'Χριστοφόρου'
  ];

  commonSurnames.forEach(name => {
    const unaccented = removeAccents(name).toLowerCase();
    dictionary[unaccented] = name;
  });

  return dictionary;
}

// Cache the name dictionary
let nameDictionary = null;

// Get name dictionary (lazy initialization)
function getNameDictionary() {
  if (!nameDictionary) {
    nameDictionary = buildNameDictionary();
  }
  return nameDictionary;
}

// Add accent to a single Greek word (ensures only one accent per word)
function addAccentsToGreekWord(word) {
  if (!word || word.trim() === "") {
    return word;
  }

  // If word already has an accent, return as is
  if (hasAccent(word)) {
    return word;
  }

  // First, try commonCorrections map
  const lowerWord = word.toLowerCase();
  if (commonCorrections[lowerWord]) {
    const accented = commonCorrections[lowerWord];
    if (word[0] === word[0].toUpperCase()) {
      return capitalizeGreekName(accented);
    }
    return accented;
  }

  // Then, try name dictionary (based on generate_greek_names.js)
  const dict = getNameDictionary();
  const unaccentedLower = removeAccents(word).toLowerCase();
  if (dict[unaccentedLower]) {
    const accented = dict[unaccentedLower];
    // Preserve original capitalization pattern
    if (word[0] === word[0].toUpperCase()) {
      return capitalizeGreekName(accented);
    }
    return accented.toLowerCase();
  }

  // Map of unaccented to accented vowels
  const accentMap = {
    α: "ά",
    ε: "έ",
    η: "ή",
    ι: "ί",
    ο: "ό",
    υ: "ύ",
    ω: "ώ",
    Α: "Ά",
    Ε: "Έ",
    Η: "Ή",
    Ι: "Ί",
    Ο: "Ό",
    Υ: "Ύ",
    Ω: "Ώ"
  };

  // Find vowels in the word
  const vowels = /[αεηιουωΑΕΗΙΟΥΩ]/g;
  const vowelMatches = [];
  let match;
  while ((match = vowels.exec(word)) !== null) {
    vowelMatches.push({
      index: match.index,
      char: match[0]
    });
  }

  if (vowelMatches.length === 0) {
    return word; // No vowels, can't add accent
  }

  // Determine accent position based on word ending and length
  let accentIndex = -1;
  const wordLower = word.toLowerCase();
  const lastChar = wordLower[wordLower.length - 1];
  const secondLastChar = wordLower.length > 1 ? wordLower[wordLower.length - 2] : "";

  // For words ending in -ος, -ης, -ας (masculine), accent typically on antepenultimate syllable
  // For words ending in -ου, -α, -η (feminine), accent typically on penultimate syllable
  // For short words (2-3 letters), accent on first vowel
  // For longer words, accent on penultimate or antepenultimate vowel

  if (wordLower.length <= 3) {
    // Short words: accent on first vowel
    accentIndex = 0;
  } else if (wordLower.endsWith("ος") || wordLower.endsWith("ης") || wordLower.endsWith("ας") || 
             wordLower.endsWith("ούς")) {
    // Masculine endings: try antepenultimate syllable (3rd from end)
    // If not enough vowels, use penultimate (2nd from end)
    if (vowelMatches.length >= 3) {
      accentIndex = vowelMatches.length - 3;
    } else if (vowelMatches.length >= 2) {
      accentIndex = vowelMatches.length - 2;
    } else {
      accentIndex = 0;
    }
  } else if (wordLower.endsWith("ου") || wordLower.endsWith("α") || wordLower.endsWith("η")) {
    // Feminine endings: accent on penultimate syllable (2nd from end)
    if (vowelMatches.length >= 2) {
      accentIndex = vowelMatches.length - 2;
    } else {
      accentIndex = 0;
    }
  } else {
    // Default: accent on penultimate vowel
    if (vowelMatches.length >= 2) {
      accentIndex = vowelMatches.length - 2;
    } else {
      accentIndex = 0;
    }
  }

  // Apply accent
  if (accentIndex >= 0 && accentIndex < vowelMatches.length) {
    const vowelPos = vowelMatches[accentIndex];
    const accentedChar = accentMap[vowelPos.char];
    
    if (accentedChar) {
      return word.substring(0, vowelPos.index) + 
             accentedChar + 
             word.substring(vowelPos.index + 1);
    }
  }

  return word;
}

// Add accents to firstname and lastname (each word gets only one accent)
function addAccentsToName(name) {
  if (!name || name.trim() === "") {
    return name;
  }

  // Split name into parts
  const parts = name.split(/\s+/);
  const result = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const lowerPart = part.toLowerCase();

    // Skip particles and titles
    if (isGreekParticle(lowerPart) || 
        titles.some(t => t.toLowerCase() === lowerPart || t.toLowerCase() + "." === lowerPart)) {
      result.push(part);
      continue;
    }

    // Add accent to the word
    const accentedPart = addAccentsToGreekWord(part);
    result.push(accentedPart);
  }

  return result.join(" ");
}

module.exports = {
  capitalizeGreekName,
  isGreekParticle,
  extractTitle,
  convertKatharevousa,
  suggestCorrection,
  detectDiminutive,
  makeDatabaseSafe,
  generateSortKey,
  generateStatistics,
  detectGender,
  splitNameParts,
  addGeneralTitleIfMissing,
  addAccentsToGreekWord,
  addAccentsToName
};
