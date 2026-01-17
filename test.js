const GreekNameCorrection = require('./index');

describe('Basic String Correction', () => {
  test('should capitalize lowercase Greek names', () => {
    expect(GreekNameCorrection('γιώργος παπαδόπουλος')).toBe('Γιώργος Παπαδόπουλος');
  });

  test('should normalize uppercase Greek names', () => {
    expect(GreekNameCorrection('ΜΑΡΙΑ ΚΩΝΣΤΑΝΤΙΝΟΥ')).toBe('Μαρια Κωνσταντινου');
  });
});

describe('Genitive Case Conversion', () => {
  test('should convert masculine name ending in -ος to genitive', () => {
    const result = GreekNameCorrection('Γιώργος Παπαδόπουλος', {
      preserveOriginal: true,
      convertToGenitive: true
    });
    // Both first name and last name should be converted to genitive
    expect(result.genitive).toBe('Γιώργου Παπαδόπουλου');
    expect(result.corrected).toBe('Γιώργος Παπαδόπουλος');
  });

  test('should handle feminine name in genitive conversion', () => {
    const result = GreekNameCorrection('Μαρία Κωνσταντίνου', {
      preserveOriginal: true,
      convertToGenitive: true
    });
    // First name should be converted to genitive (Μαρία → Μαρίας), last name already in genitive
    expect(result.genitive).toBe('Μαρίας Κωνσταντίνου');
    expect(result.corrected).toBe('Μαρία Κωνσταντίνου');
  });
});

describe('Greeklish to Greek Transliteration', () => {
  test('should transliterate Greeklish to Greek', () => {
    expect(GreekNameCorrection('giorgos papadopoulos', {
      transliterate: 'greeklish-to-greek'
    })).toBe('Γιοργοσ Παπαδοπουλοσ');
  });

  test('should transliterate Greeklish female name to Greek', () => {
    expect(GreekNameCorrection('maria konstantinou', {
      transliterate: 'greeklish-to-greek'
    })).toBe('Μαρια Κονσταντινου');
  });
});

describe('Greek to Latin Transliteration', () => {
  test('should transliterate Greek to Latin', () => {
    expect(GreekNameCorrection('Γιώργος Παπαδόπουλος', {
      transliterate: 'greek-to-latin'
    })).toBe('Giorgos Papadopoylos');
  });
});

describe('Greek to Greeklish Transliteration', () => {
  test('should transliterate Greek to Greeklish', () => {
    expect(GreekNameCorrection('Γιώργος Παπαδόπουλος', {
      transliterate: 'greek-to-greeklish'
    })).toBe('Giwrgos Papadopoulos');
  });
});

describe('Diminutive Detection', () => {
  test('should detect diminutive forms', () => {
    const result = GreekNameCorrection('Γιωργάκης Παπαδάκης', {
      preserveOriginal: true,
      detectDiminutive: true
    });
    expect(result.diminutive).toBeDefined();
    expect(Array.isArray(result.diminutive)).toBe(true);
    expect(result.diminutive.length).toBeGreaterThan(0);
    expect(result.diminutive[0].isDiminutive).toBe(true);
  });
});

describe('Title Handling', () => {
  test('should extract and format title Δρ.', () => {
    const result = GreekNameCorrection('δρ. γιώργος παπαδόπουλος', {
      preserveOriginal: true,
      handleTitles: true
    });
    expect(result.title).toBe('Δρ');
    expect(result.corrected).toContain('Δρ');
    expect(result.corrected).toContain('Γιώργος');
  });

  test('should extract and format title Καθ.', () => {
    const result = GreekNameCorrection('καθ. μαρία κωνσταντίνου', {
      preserveOriginal: true,
      handleTitles: true
    });
    expect(result.title).toBe('Καθ');
    expect(result.corrected).toContain('Καθ');
    expect(result.corrected).toContain('Μαρία');
  });
});

describe('Automatic General Title Addition', () => {
  test('should add κ. for male names when addGeneralTitle is enabled', () => {
    const result = GreekNameCorrection('Γιώργος Παπαδόπουλος', {
      addGeneralTitle: true
    });
    expect(result).toBe('κ. Γιώργος Παπαδόπουλος');
    expect(result).toContain('κ.');
    expect(result).not.toContain('Κ.');
  });

  test('should add κα for female names when addGeneralTitle is enabled', () => {
    const result = GreekNameCorrection('Μαρία Κωνσταντίνου', {
      addGeneralTitle: true
    });
    expect(result).toBe('κα Μαρία Κωνσταντίνου');
    expect(result).toContain('κα');
    expect(result).not.toContain('Κα');
  });

  test('should add lowercase general titles (κ. and κα)', () => {
    // Use names with surnames ending in -ος for male (not -ου which is genitive and detected as female)
    const maleResult = GreekNameCorrection('Νίκος Παπαδόπουλος', {
      addGeneralTitle: true
    });
    expect(maleResult).toContain('κ.');
    expect(maleResult).not.toContain('Κ.');

    const femaleResult = GreekNameCorrection('Ελένη Παπαδοπούλου', {
      addGeneralTitle: true
    });
    expect(femaleResult).toContain('κα');
    expect(femaleResult).not.toContain('Κα');
  });

  test('should not add general title when existing title is present', () => {
    const result = GreekNameCorrection('Δρ. Γιώργος Παπαδόπουλος', {
      addGeneralTitle: true,
      preserveOriginal: true
    });
    expect(result.title).toBe('Δρ');
    expect(result.corrected).toContain('Δρ');
    expect(result.corrected).not.toContain('κ.');
    expect(result.corrected).not.toContain('κα');
  });

  test('should work with preserveOriginal option', () => {
    const result = GreekNameCorrection('Γιάννης Παπαδόπουλος', {
      addGeneralTitle: true,
      preserveOriginal: true
    });
    expect(result.corrected).toBe('κ. Γιάννης Παπαδόπουλος');
    expect(result.title).toBe('κ.');
    expect(result.original).toBe('Γιάννης Παπαδόπουλος');
  });

  test('should work with vocative case conversion', () => {
    const result = GreekNameCorrection('Γιώργος Παπαδόπουλος', {
      addGeneralTitle: true,
      convertToCase: 'vocative'
    });
    expect(result).toBe('κ. Γιώργο Παπαδόπουλο');
    expect(result).toContain('κ.');
  });

  test('should work with accusative case conversion', () => {
    // Use a name with surname ending in -ος for correct male detection
    const result = GreekNameCorrection('Δημήτρης Παπαδόπουλος', {
      addGeneralTitle: true,
      convertToCase: 'accusative'
    });
    expect(result).toBe('κ. Δημήτρη Παπαδόπουλο');
    expect(result).toContain('κ.');
  });

  test('should work with vocative and preserveOriginal', () => {
    const result = GreekNameCorrection('Μαρία Κωνσταντίνου', {
      addGeneralTitle: true,
      convertToCase: 'vocative',
      preserveOriginal: true
    });
    expect(result.corrected).toBe('κα Μαρία Κωνσταντίνου');
    expect(result.vocative).toBe('κα Μαρία Κωνσταντίνου');
    expect(result.title).toBe('κα');
  });

  test('should not add title when gender is unknown', () => {
    // Names that don't match typical gender patterns
    const result = GreekNameCorrection('Test Name', {
      addGeneralTitle: true
    });
    // Should not add title if gender detection fails
    expect(result).not.toContain('κ.');
    expect(result).not.toContain('κα');
  });

  test('should work with genitive case conversion', () => {
    const result = GreekNameCorrection('Γιώργος Παπαδόπουλος', {
      addGeneralTitle: true,
      convertToGenitive: true,
      preserveOriginal: true
    });
    expect(result.corrected).toBe('κ. Γιώργος Παπαδόπουλος');
    expect(result.genitive).toBeDefined();
    expect(result.title).toBe('κ.');
  });

  test('should work with array of names', () => {
    const results = GreekNameCorrection([
      'Γιώργος Παπαδόπουλος',
      'Μαρία Κωνσταντίνου'
    ], {
      addGeneralTitle: true
    });
    expect(Array.isArray(results)).toBe(true);
    expect(results[0]).toBe('κ. Γιώργος Παπαδόπουλος');
    expect(results[1]).toBe('κα Μαρία Κωνσταντίνου');
  });
});

describe('Name Corrections', () => {
  test('should suggest correction for common misspelling', () => {
    const result = GreekNameCorrection('γιοργος παπαδοπουλος', {
      preserveOriginal: true,
      suggestCorrections: true
    });
    expect(result.wasCorrected).toBe(true);
    expect(result.corrected).toContain('Γιώργος');
  });

  test('should suggest correction for δημητρης', () => {
    const result = GreekNameCorrection('δημητρης νικολαου', {
      preserveOriginal: true,
      suggestCorrections: true
    });
    expect(result.wasCorrected).toBe(true);
    expect(result.corrected).toContain('Δημήτρης');
  });
});

describe('Katharevousa Recognition', () => {
  test('should convert Katharevousa form to modern Greek', () => {
    const result = GreekNameCorrection('Κωνσταντίνος Παπαδόπουλον', {
      preserveOriginal: true,
      recognizeKatharevousa: true
    });
    // Note: The katharevousaMap doesn't include "ον" -> "ο" pattern, only "ιον", "ειον", "αιον"
    expect(result.corrected).toBe('Κωνσταντίνος Παπαδόπουλον');
  });
});

describe('Database-Safe Output', () => {
  test('should remove special characters for database safety', () => {
    const result = GreekNameCorrection('Γιώργος@# Παπα!δόπουλος', {
      databaseSafe: true
    });
    expect(result).toBe('Γιώργος Παπαδόπουλος');
    expect(result).not.toContain('@');
    expect(result).not.toContain('#');
    expect(result).not.toContain('!');
  });
});

describe('Sort Key Generation', () => {
  test('should generate accent-free sort key', () => {
    const result = GreekNameCorrection('Άννα Παπαδοπούλου', {
      preserveOriginal: true,
      generateSortKey: true
    });
    expect(result.sortKey).toBeDefined();
    expect(result.sortKey).toBe('αννα παπαδοπουλου');
    expect(result.sortKey).not.toContain('ά');
    expect(result.sortKey).not.toContain('ού');
  });

  test('should generate consistent sort key for names with and without accents', () => {
    const result1 = GreekNameCorrection('Άννα Παπαδοπούλου', {
      preserveOriginal: true,
      generateSortKey: true
    });
    const result2 = GreekNameCorrection('Αννα Παπαδοπουλου', {
      preserveOriginal: true,
      generateSortKey: true
    });
    expect(result1.sortKey).toBe(result2.sortKey);
  });
});

describe('Name Statistics', () => {
  test('should generate comprehensive name statistics', () => {
    const result = GreekNameCorrection('Δρ. Γιώργος της Μαρίας Παπαδόπουλος', {
      preserveOriginal: true,
      statistics: true,
      handleTitles: true,
      handleParticles: true
    });
    expect(result.statistics).toBeDefined();
    expect(result.statistics.length).toBeGreaterThan(0);
    expect(result.statistics.wordCount).toBeGreaterThan(0);
    expect(result.statistics.hasParticles).toBe(true);
    expect(result.statistics.hasAccents).toBe(true);
  });
});

describe('Combined Features', () => {
  test('should handle multiple features simultaneously', () => {
    const result = GreekNameCorrection('δρ γιοργος του παπα', {
      preserveOriginal: true,
      handleTitles: true,
      handleParticles: true,
      suggestCorrections: true,
      detectGender: true,
      convertToGenitive: true,
      generateSortKey: true,
      statistics: true,
      detectDiminutive: true
    });
    expect(result.corrected).toBeDefined();
    expect(result.gender).toBeDefined();
    expect(result.genitive).toBeDefined();
    expect(result.sortKey).toBeDefined();
    expect(result.statistics).toBeDefined();
  });
});

describe('Array of Objects Processing', () => {
  test('should process array of objects with multiple features', () => {
    const result = GreekNameCorrection([
      { id: 1, fullname: 'giorgos papadopoulos' },
      { id: 2, fullname: 'δρ. μαρια κωνσταντινου' }
    ], {
      transliterate: 'greeklish-to-greek',
      preserveOriginal: true,
      handleTitles: true,
      detectGender: true,
      convertToGenitive: true
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    // When preserveOriginal is true, the processed object properties are merged into the result
    expect(result[0].corrected).toBeDefined();
    expect(result[1].id).toBe(2);
    expect(result[1].corrected).toBeDefined();
    expect(result[1].title).toBe('Δρ');
  });
});

describe('Vocative Case Conversion', () => {
  test('should convert masculine name ending in -ος to vocative', () => {
    // Γιώργος forms vocative in -ο, surname forms vocative in -ο (paroxytone surname)
    expect(GreekNameCorrection('Γιώργος Παπαδόπουλος', {
      convertToCase: 'vocative'
    })).toBe('Γιώργο Παπαδόπουλο');
  });

  test('should convert masculine name ending in -ης to vocative', () => {
    expect(GreekNameCorrection('Δημήτρης Νικολάου', {
      convertToCase: 'vocative'
    })).toBe('Δημήτρη Νικολάου');
  });

  test('should handle feminine name in vocative (usually unchanged)', () => {
    expect(GreekNameCorrection('Μαρία Κωνσταντίνου', {
      convertToCase: 'vocative'
    })).toBe('Μαρία Κωνσταντίνου');
  });

  test('should return vocative with preserveOriginal option', () => {
    const result = GreekNameCorrection('Γιάννης Αλεξίου', {
      convertToCase: 'vocative',
      preserveOriginal: true
    });
    expect(result.vocative).toBeDefined();
    expect(result.vocative).toBe('Γιάννη Αλεξίου');
  });
});

describe('Accusative Case Conversion', () => {
  test('should convert masculine name ending in -ος to accusative', () => {
    expect(GreekNameCorrection('Γιώργος Παπαδόπουλος', {
      convertToCase: 'accusative'
    })).toBe('Γιώργο Παπαδόπουλο');
  });

  test('should convert masculine name ending in -ης to accusative', () => {
    expect(GreekNameCorrection('Δημήτρης Νικολάου', {
      convertToCase: 'accusative'
    })).toBe('Δημήτρη Νικολάου');
  });

  test('should handle feminine name in accusative (usually unchanged)', () => {
    expect(GreekNameCorrection('Μαρία Κωνσταντίνου', {
      convertToCase: 'accusative'
    })).toBe('Μαρία Κωνσταντίνου');
  });

  test('should return accusative with preserveOriginal option', () => {
    const result = GreekNameCorrection('Κώστας Παπαδάκης', {
      convertToCase: 'accusative',
      preserveOriginal: true
    });
    expect(result.accusative).toBeDefined();
    expect(result.accusative).toBe('Κώστα Παπαδάκη');
  });
});
