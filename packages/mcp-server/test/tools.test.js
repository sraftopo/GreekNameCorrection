"use strict";

const { MAX_BATCH, tools, callTool } = require("../src/tools");

function parseOk(result) {
  expect(result.isError).toBeUndefined();
  expect(result.content).toHaveLength(1);
  expect(result.content[0].type).toBe("text");
  return JSON.parse(result.content[0].text);
}

describe("tool catalog", () => {
  test("exposes the five tools with JSON schemas", () => {
    const names = tools.map((tool) => tool.name);
    expect(names).toEqual([
      "correct_greek_name",
      "convert_greek_name_case",
      "transliterate_greek_name",
      "analyze_greek_name",
      "batch_correct_greek_names"
    ]);

    for (const tool of tools) {
      expect(tool.description.length).toBeGreaterThan(40);
      expect(tool.inputSchema.type).toBe("object");
      expect(tool.inputSchema.additionalProperties).toBe(false);
      expect(Array.isArray(tool.inputSchema.required)).toBe(true);
    }
  });
});

describe("correct_greek_name", () => {
  test("returns the preserveOriginal object", () => {
    const result = parseOk(
      callTool("correct_greek_name", { name: "γιώργος παπαδόπουλος" })
    );

    expect(result.corrected).toBe("Γιώργος Παπαδόπουλος");
    expect(result.original).toBe("γιώργος παπαδόπουλος");
    expect(result.isValid).toBe(true);
    expect(result.parts).toEqual({
      firstName: "Γιώργος",
      lastName: "Παπαδόπουλος"
    });
    expect(result.gender).toBeUndefined();
  });

  test("does not invent accents for all-caps input unless addAccents is set", () => {
    const plain = parseOk(
      callTool("correct_greek_name", { name: "ΓΙΩΡΓΟΣ ΠΑΠΑΔΟΠΟΥΛΟΣ" })
    );
    expect(plain.corrected).toBe("Γιωργος Παπαδοπουλος");

    const accented = parseOk(
      callTool("correct_greek_name", {
        name: "ΓΙΩΡΓΟΣ ΠΑΠΑΔΟΠΟΥΛΟΣ",
        options: { addAccents: true }
      })
    );
    expect(accented.corrected).toBe("Γιώργος Παπαδόπουλος");
  });

  test("passes handleParticles through to the library", () => {
    const kept = parseOk(
      callTool("correct_greek_name", { name: "γιώργος ΤΟΥ παπαδόπουλος" })
    );
    expect(kept.corrected).toBe("Γιώργος του Παπαδόπουλος");

    const capitalized = parseOk(
      callTool("correct_greek_name", {
        name: "γιώργος ΤΟΥ παπαδόπουλος",
        options: { handleParticles: false }
      })
    );
    expect(capitalized.corrected).toBe("Γιώργος Του Παπαδόπουλος");
  });

  test("extracts Δρ without adding a period", () => {
    const result = parseOk(
      callTool("correct_greek_name", { name: "δρ. γιωργος παπαδοπουλος" })
    );
    expect(result.title).toBe("Δρ");
    expect(result.corrected).toBe("Δρ Γιωργος Παπαδοπουλος");
  });

  test("rejects a non-string name and an unknown option", () => {
    const badName = callTool("correct_greek_name", { name: 12 });
    expect(badName.isError).toBe(true);
    expect(badName.content[0].text).toMatch(/arguments\.name must be a string/);

    const badOption = callTool("correct_greek_name", {
      name: "γιώργος",
      options: { explainConfidence: true }
    });
    expect(badOption.isError).toBe(true);
    expect(badOption.content[0].text).toMatch(/explainConfidence/);
  });
});

describe("convert_greek_name_case", () => {
  test("returns genitive on the genitive field without a title prefix", () => {
    const result = parseOk(
      callTool("convert_greek_name_case", {
        name: "δρ. γιώργος παπαδόπουλος",
        case: "genitive"
      })
    );

    expect(result.corrected).toBe("Δρ Γιώργος Παπαδόπουλος");
    expect(result.genitive).toBe("Γιώργου Παπαδόπουλου");
    expect(result.vocative).toBeUndefined();
  });

  test("uses the vocative vowel-count fallback for an unlisted single token", () => {
    const result = parseOk(
      callTool("convert_greek_name_case", {
        name: "Πρόδρομος",
        case: "vocative"
      })
    );
    expect(result.vocative).toBe("Πρόδρομε");
    expect(result.corrected).toBe("Πρόδρομος");
  });

  test("uses -ο for a listed first name and for a following surname", () => {
    const result = parseOk(
      callTool("convert_greek_name_case", {
        name: "Γιώργος Παπαδόπουλος",
        case: "vocative"
      })
    );
    expect(result.vocative).toBe("Γιώργο Παπαδόπουλο");
  });

  test("uses -ο for accusative of -ος", () => {
    const result = parseOk(
      callTool("convert_greek_name_case", {
        name: "Πρόδρομος",
        case: "accusative"
      })
    );
    expect(result.accusative).toBe("Πρόδρομο");
  });

  test("rejects an unsupported case", () => {
    const result = callTool("convert_greek_name_case", {
      name: "Γιώργος",
      case: "dative"
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/genitive, vocative, accusative/);
  });
});

describe("transliterate_greek_name", () => {
  test("maps greeklish with word-final sigma left as σ", () => {
    const result = parseOk(
      callTool("transliterate_greek_name", {
        name: "giorgos papadopoulos",
        mode: "greeklish-to-greek"
      })
    );
    expect(result.corrected).toBe("Γιοργοσ Παπαδοπουλοσ");
  });

  test("maps greek to latin and greek to greeklish", () => {
    const latin = parseOk(
      callTool("transliterate_greek_name", {
        name: "Γιώργος",
        mode: "greek-to-latin"
      })
    );
    expect(latin.corrected).toBe("Giorgos");

    const greeklish = parseOk(
      callTool("transliterate_greek_name", {
        name: "Γιώργος",
        mode: "greek-to-greeklish"
      })
    );
    expect(greeklish.corrected).toBe("Giwrgos");
  });

  test("rejects an unknown mode", () => {
    const result = callTool("transliterate_greek_name", {
      name: "Γιώργος",
      mode: "greek-to-english"
    });
    expect(result.isError).toBe(true);
  });
});

describe("analyze_greek_name", () => {
  test("reports gender from the last token, parts, and a sort key", () => {
    const male = parseOk(
      callTool("analyze_greek_name", { name: "Γιώργος Παπαδόπουλος" })
    );
    expect(male.gender).toBe("male");
    expect(male.diminutive).toBeNull();
    expect(male.parts).toEqual({
      firstName: "Γιώργος",
      lastName: "Παπαδόπουλος"
    });
    expect(male.sortKey).toBe("γιωργο\u03c3 παπαδοπουλο\u03c3");

    const female = parseOk(
      callTool("analyze_greek_name", { name: "Μαρία Κωνσταντίνου" })
    );
    expect(female.gender).toBe("female");

    const unknown = parseOk(callTool("analyze_greek_name", { name: "Ραφαήλ" }));
    expect(unknown.gender).toBe("unknown");
  });

  test("puts a genitive father's name in middleName and detects a diminutive", () => {
    const parted = parseOk(
      callTool("analyze_greek_name", {
        name: "Γιώργος Νικολάου Παπαδόπουλος"
      })
    );
    expect(parted.parts).toEqual({
      firstName: "Γιώργος",
      middleName: "Νικολάου",
      lastName: "Παπαδόπουλος"
    });

    const diminutive = parseOk(
      callTool("analyze_greek_name", { name: "Γιαννάκης Παπαδόπουλος" })
    );
    expect(diminutive.diminutive[0].isDiminutive).toBe(true);
    expect(diminutive.diminutive[0].diminutiveType).toBe("άκης");
  });

  test("drops the particle and then genders the remaining last token", () => {
    const result = parseOk(
      callTool("analyze_greek_name", { name: "Γιώργος του Νίκου" })
    );
    expect(result.parts).toEqual({ firstName: "Γιώργος", lastName: "Νίκου" });
    expect(result.gender).toBe("female");
  });
});

describe("batch_correct_greek_names", () => {
  test("returns one preserveOriginal object per name", () => {
    const result = parseOk(
      callTool("batch_correct_greek_names", {
        names: ["γιώργος παπαδόπουλος", "μαρια κωνσταντινου"]
      })
    );

    expect(result).toHaveLength(2);
    expect(result[0].corrected).toBe("Γιώργος Παπαδόπουλος");
    expect(result[1].corrected).toBe("Μαρια Κωνσταντινου");
  });

  test("rejects a batch over the cap and a non-string item", () => {
    const tooMany = callTool("batch_correct_greek_names", {
      names: new Array(MAX_BATCH + 1).fill("γιώργος")
    });
    expect(tooMany.isError).toBe(true);
    expect(tooMany.content[0].text).toMatch(/maximum of 100/);

    const mixed = callTool("batch_correct_greek_names", {
      names: ["γιώργος", 1]
    });
    expect(mixed.isError).toBe(true);
    expect(mixed.content[0].text).toMatch(/arguments\.names\[1\] must be a string/);
  });
});

describe("callTool", () => {
  test("rejects an unknown tool and a missing name", () => {
    const unknown = callTool("fix_name", { name: "γιώργος" });
    expect(unknown.isError).toBe(true);
    expect(unknown.content[0].text).toMatch(/Unknown tool/);

    const missing = callTool("correct_greek_name", {});
    expect(missing.isError).toBe(true);
    expect(missing.content[0].text).toMatch(/arguments\.name is required/);
  });
});
