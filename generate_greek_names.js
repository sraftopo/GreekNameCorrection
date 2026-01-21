const fs = require('fs');

// Helper function to remove accents
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Common Greek name components with accents
const maleFirstNames = [
  'Γιώργος', 'Γιάννης', 'Νίκος', 'Δημήτρης', 'Κώστας', 'Ανδρέας', 'Παναγιώτης',
  'Μιχάλης', 'Βασίλης', 'Χρήστος', 'Θανάσης', 'Σταύρος', 'Αντώνης', 'Πέτρος',
  'Σπύρος', 'Μάνος', 'Λευτέρης', 'Γρηγόρης', 'Αλέξανδρος', 'Κυριάκος',
  'Κωνσταντίνος', 'Θεόδωρος', 'Ηλίας', 'Απόστολος', 'Νικόλαος', 'Χαράλαμπος',
  'Ευάγγελος', 'Άγγελος', 'Ιωάννης', 'Σωτήρης', 'Τάσος', 'Μάρκος', 'Φώτης',
  'Παύλος', 'Αθανάσιος', 'Ηλίας', 'Μιλτιάδης', 'Θεμιστοκλής', 'Περικλής',
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

const surnameCompoundPrefixes = [
  'Παπα', 'Καρα', 'Μαυρο', 'Χατζη', 'Κοντο', 'Μακρο', 'Μικρο',
  'Παλαιο', 'Νεο', 'Σιδερο', 'Χρυσο', 'Αργυρο', 'Καλο', 'Μεγαλο',
  'Τρια', 'Πενταρ', 'Εξαρχ', 'Επταρ', 'Εννιαρ', 'Δεκαρ'
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

// Generate names
const names = [];

// Add base first names
maleFirstNames.forEach(name => {
  names.push({
    accented: name,
    unaccented: removeAccents(name),
    gender: 'M',
    type: 'first'
  });
});

femaleFirstNames.forEach(name => {
  names.push({
    accented: name,
    unaccented: removeAccents(name),
    gender: 'F',
    type: 'first'
  });
});

// Generate diminutives for male names
const maleDiminutives = ['άκης', 'άκι', 'ούλης', 'ούλη', 'ίτσας', 'ής'];
maleFirstNames.slice(0, 30).forEach(name => {
  const root = name.slice(0, -2);
  maleDiminutives.forEach(suffix => {
    const dimName = root + suffix;
    if (names.length < 1500) {
      names.push({
        accented: dimName,
        unaccented: removeAccents(dimName),
        gender: 'M',
        type: 'first'
      });
    }
  });
});

// Generate diminutives for female names
const femaleDiminutives = ['ούλα', 'ίτσα', 'ώ', 'ούδα', 'άκι'];
femaleFirstNames.slice(0, 30).forEach(name => {
  const root = name.slice(0, -1);
  femaleDiminutives.forEach(suffix => {
    const dimName = root + suffix;
    if (names.length < 2000) {
      names.push({
        accented: dimName,
        unaccented: removeAccents(dimName),
        gender: 'F',
        type: 'first'
      });
    }
  });
});

// Generate patronymic surnames
surnameRoots.forEach(root => {
  surnamePatronymicSuffixes.forEach(({suffix, gender}) => {
    const surname = root + suffix;
    names.push({
      accented: surname,
      unaccented: removeAccents(surname),
      gender: gender,
      type: 'surname'
    });
  });
});

// Generate compound surnames with prefixes
surnameCompoundPrefixes.forEach(prefix => {
  surnameRoots.slice(0, 40).forEach(root => {
    surnamePatronymicSuffixes.slice(0, 4).forEach(({suffix, gender}) => {
      const surname = prefix + root.toLowerCase() + suffix;
      if (names.length < 4000) {
        names.push({
          accented: surname,
          unaccented: removeAccents(surname),
          gender: gender,
          type: 'surname'
        });
      }
    });
  });
});

// Add occupational surnames
occupationalSurnames.forEach(name => {
  names.push({
    accented: name,
    unaccented: removeAccents(name),
    gender: 'Both',
    type: 'surname'
  });
});

// Add geographical surnames
geographicalSurnames.forEach(name => {
  names.push({
    accented: name,
    unaccented: removeAccents(name),
    gender: 'Both',
    type: 'surname'
  });
});

// Generate more compound surnames with double prefixes
if (names.length < 5000) {
  const doublePrefixes = [];
  for (let i = 0; i < surnameCompoundPrefixes.length && i < 5; i++) {
    for (let j = 0; j < surnameCompoundPrefixes.length && j < 5; j++) {
      if (i !== j) {
        doublePrefixes.push(surnameCompoundPrefixes[i] + surnameCompoundPrefixes[j].toLowerCase());
      }
    }
  }
  
  doublePrefixes.forEach(prefix => {
    surnameRoots.slice(0, 20).forEach(root => {
      surnamePatronymicSuffixes.slice(0, 2).forEach(({suffix, gender}) => {
        if (names.length < 5000) {
          const surname = prefix + root.toLowerCase() + suffix;
          names.push({
            accented: surname,
            unaccented: removeAccents(surname),
            gender: gender,
            type: 'surname'
          });
        }
      });
    });
  });
}

// Fill up to 5000 with more variations
const extraMaleNames = [
  'Αχιλλέας', 'Βύρων', 'Γαλανός', 'Δαρείος', 'Ερμής', 'Ζευς', 'Θησέας',
  'Ικάρος', 'Κάρολος', 'Λοΐζος', 'Μένανδρος', 'Νίκανδρος', 'Ξέρξης',
  'Οδυσσέας', 'Πρωτέας', 'Ρομπέρτος', 'Σολομών', 'Τηλέμαχος', 'Φαίδων',
  'Ψυχάρης', 'Ωνάσης', 'Αγησίλαος', 'Βαλέριος', 'Γοργίας', 'Δημοσθένης',
  'Επαμεινώνδας', 'Ζηνόδοτος', 'Θουκυδίδης', 'Ισοκράτης', 'Κλεισθένης',
  'Λυσίας', 'Μενέλαος', 'Νεστορίδης', 'Οδυσσέας', 'Πυθαγόρας',
  'Σόλων', 'Τελαμών', 'Φειδίας', 'Χείρων', 'Αινείας', 'Βελισάριος'
];

const extraFemaleNames = [
  'Αλκμήνη', 'Βερονίκη', 'Γαλήνη', 'Δωροθέα', 'Ευρυδίκη', 'Ζέφυρα',
  'Θεοφανώ', 'Ιόλη', 'Καλυψώ', 'Λυδία', 'Μαριάννα', 'Νεφθύς', 'Οφηλία',
  'Πολύμνια', 'Ραϊσα', 'Σαπφώ', 'Τελέμαχη', 'Φοίβη', 'Χαρίτη', 'Αίγλη',
  'Βιολέττα', 'Γοργόνη', 'Δρυάδα', 'Εριφύλη', 'Ζηνοβία', 'Θέμις',
  'Ιφιμέδεια', 'Κλυταιμνήστρα', 'Λαοδίκη', 'Μαιάνδρη', 'Νιόβη', 'Ομήρα',
  'Πασιφάη', 'Σεμίραμις', 'Τάμυρα', 'Φιλομήλα', 'Χρυσηίς', 'Αριάδνη'
];

while (names.length < 5000) {
  // Add extra first names
  if (extraMaleNames.length > 0) {
    const name = extraMaleNames.shift();
    names.push({
      accented: name,
      unaccented: removeAccents(name),
      gender: 'M',
      type: 'first'
    });
  }
  
  if (extraFemaleNames.length > 0) {
    const name = extraFemaleNames.shift();
    names.push({
      accented: name,
      unaccented: removeAccents(name),
      gender: 'F',
      type: 'first'
    });
  }
  
  // Generate more creative combinations
  if (names.length < 5000) {
    const randomRoot = surnameRoots[Math.floor(Math.random() * surnameRoots.length)];
    const randomSuffix = surnamePatronymicSuffixes[Math.floor(Math.random() * surnamePatronymicSuffixes.length)];
    const randomPrefix = surnameCompoundPrefixes[Math.floor(Math.random() * surnameCompoundPrefixes.length)];
    
    const variant = randomPrefix + randomRoot.toLowerCase() + randomSuffix.suffix;
    const exists = names.find(n => n.accented === variant);
    
    if (!exists) {
      names.push({
        accented: variant,
        unaccented: removeAccents(variant),
        gender: randomSuffix.gender,
        type: 'surname'
      });
    }
  }
}

// Create CSV content
let csv = 'name_accented,name_unaccented,gender,type\n';
names.forEach(name => {
  csv += `${name.accented},${name.unaccented},${name.gender},${name.type}\n`;
});

// Write to file
fs.writeFileSync('/home/claude/greek_names_5000.csv', csv, 'utf8');

console.log(`Generated ${names.length} Greek names`);
console.log(`First names: ${names.filter(n => n.type === 'first').length}`);
console.log(`Surnames: ${names.filter(n => n.type === 'surname').length}`);
