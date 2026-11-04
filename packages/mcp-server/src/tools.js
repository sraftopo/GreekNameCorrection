"use strict";

const GreekNameCorrection = require("greek-name-correction");

const MAX_BATCH = 100;

const CORRECT_OPTION_KEYS = [
  "addAccents",
  "addGeneralTitle",
  "handleTitles",
  "handleParticles",
  "strictMode",
  "suggestCorrections",
  "recognizeKatharevousa",
  "databaseSafe",
  "removeExtraSpaces",
  "splitNames",
  "normalizeTonotics",
  "handleDiacritics"
];

const correctOptionsSchema = {
  type: "object",
  additionalProperties: false,
  description:
    "Optional rules-engine flags. Omitted flags use the library defaults. preserveOriginal is always forced on and is not accepted here.",
  properties: {
    addAccents: {
      type: "boolean",
      description:
        "Place one accent per content word. Dictionary and the small commonCorrections map are tried first; other words use the vowel-position heuristic. Default false, which leaves an unaccented input unaccented."
    },
    addGeneralTitle: {
      type: "boolean",
      description:
        "Prefix κ. when the last token looks male and κα when it looks female, and only when no title was extracted. Unknown gender adds nothing. Default false."
    },
    handleTitles: {
      type: "boolean",
      description:
        "Extract a leading title (Δρ, Καθ, Κύριος, and the rest of the built-in list). The returned title has no added period. Default true."
    },
    handleParticles: {
      type: "boolean",
      description:
        "Keep του, της, των, τον, την, τα, το, και, ή, ειδών, εκ, and εξ in lowercase. Default true."
    },
    strictMode: {
      type: "boolean",
      description:
        "When true, an empty name returns null and isValid requires the corrected string to match the Greek name pattern. Default false."
    },
    suggestCorrections: {
      type: "boolean",
      description:
        "Replace a token that is a key in the built-in commonCorrections map (for example γιοργος → γιώργος) before capitalization. Default false."
    },
    recognizeKatharevousa: {
      type: "boolean",
      description:
        "Apply the Katharevousa ending map to the end of the whole string. Only ιον, ειον, and αιον change. Default false."
    },
    databaseSafe: {
      type: "boolean",
      description:
        "Strip characters outside Greek, word characters, spaces, hyphen, and apostrophe from the name body. The title is reattached afterwards. Default false."
    },
    removeExtraSpaces: {
      type: "boolean",
      description: "Collapse whitespace and trim. Default true."
    },
    splitNames: {
      type: "boolean",
      description:
        "Capitalize each token separately and include parts. Default true. When false, the whole string is capitalized as one token and parts is omitted."
    },
    normalizeTonotics: {
      type: "boolean",
      description:
        "Run the library tonotic pass. That pass is an identity map, so it does not add or remove accents. Default true."
    },
    handleDiacritics: {
      type: "boolean",
      description: "Normalize the string to NFC. Default true."
    }
  }
};

const tools = [
  {
    name: "correct_greek_name",
    description:
      "Correct one Greek personal name with the greek-name-correction rules engine (capitalization, spacing, particles, titles, and optional accent restoration). Returns the preserveOriginal object: corrected, original, isValid, and, by default, parts. parts is firstName, lastName, and middleName only when three or more content tokens remain. Particles and titles are removed from parts; there is no father-name field. A genitive father's name sitting between the first name and the surname becomes middleName. Accents already in the input are kept; all-caps Greek has no tonos, so it is capitalized without accents unless addAccents is true. An empty or whitespace-only name does not build the object: strictMode returns null, otherwise the original value is returned. Use the case, transliterate, and analyze tools for those tasks.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["name"],
      properties: {
        name: {
          type: "string",
          description: "The name to correct, in Greek or as the library will see it."
        },
        options: correctOptionsSchema
      }
    }
  },
  {
    name: "convert_greek_name_case",
    description:
      "Convert one Greek name to genitive, vocative, or accusative and return the preserveOriginal object. corrected is the nominative correction. For case \"genitive\", read genitive: every non-particle token is converted, and a title is not copied onto that string. For \"vocative\" or \"accusative\", read vocative or accusative; a title is prefixed onto that form when one was extracted. Accusative of -ος is always -ο. Vocative of -ος checks diminutive endings (άκος, ούκος, ίτσος) then the built-in first-name lists, then treats the last token of a multi-token name as a surname (-ε if it looks oxytone, otherwise -ο), then leaves listed oxytone first names unchanged. An unlisted non-surname falls through to a vowel-letter count: 2 or fewer vowel letters become -ο, otherwise -ε. Παύλος is a special case and becomes Παύλο. Tokens ending in -ου, and feminine -α/-η, stay as they are. -ης becomes -η. -ας becomes -α, except the built-in -ης-pattern exceptions, which become -η.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["name", "case"],
      properties: {
        name: {
          type: "string",
          description: "The name to convert."
        },
        case: {
          type: "string",
          enum: ["genitive", "vocative", "accusative"],
          description:
            "genitive uses convertToGenitive. vocative and accusative use convertToCase."
        }
      }
    }
  },
  {
    name: "transliterate_greek_name",
    description:
      "Transliterate one name and return the preserveOriginal object. corrected is the library pipeline result: transliteration runs first, then each token is capitalized. mode greeklish-to-greek is longest-key-first with one fixed letter and no context choice: e→ε (ei/eu win), h→η (th→θ, ch→χ), i→ι (ai/ei/oi/ui/iu win), y→υ, o→ο (ou→ου), w→ω. s becomes σ in every position, including the end of a word; final ς is not restored. u, c, j, q, and v have no key and stay Latin. greek-to-greeklish writes υ as u and χ as x, so a round trip is lossy (η→i→ι, χ→x→ξ). greek-to-latin writes η and ι as i, and both ο and ω as o.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["name", "mode"],
      properties: {
        name: {
          type: "string",
          description: "The name to transliterate."
        },
        mode: {
          type: "string",
          enum: ["greeklish-to-greek", "greek-to-latin", "greek-to-greeklish"],
          description: "Library transliterate mode."
        }
      }
    }
  },
  {
    name: "analyze_greek_name",
    description:
      "Analyze one name. Returns the preserveOriginal object with gender, diminutive, parts, sortKey, and title when a leading title was extracted. gender is taken from the last token only, after exact title tokens are removed; particles are not removed before that check. Male endings are tested first (ος, ης, ας, ούς), then female (ου, α, η). Anything else is unknown, including -ήλ, -ίμ, -ών, -εύς, and -ω. A surname already in -ου, such as Γεωργίου, is female. diminutive is an array of matches or null. parts drops particles and titles; there is no father-name field. sortKey is lowercase, with tonos removed and ς folded to σ.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["name"],
      properties: {
        name: {
          type: "string",
          description: "The name to analyze."
        }
      }
    }
  },
  {
    name: "batch_correct_greek_names",
    description:
      "Correct up to 100 names with the same options as correct_greek_name. Passes the array through the library's array API and returns a JSON array of preserveOriginal objects in input order. A blank item is returned unchanged as a string, because that is what the library returns for an empty string. More than 100 names is an error. Every item must be a string.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["names"],
      properties: {
        names: {
          type: "array",
          maxItems: MAX_BATCH,
          items: { type: "string" },
          description: "Names to correct, at most " + MAX_BATCH + " strings."
        },
        options: correctOptionsSchema
      }
    }
  }
];

function validateAgainstSchema(value, schema, path) {
  const errors = [];
  const label = path || "arguments";

  if (schema.type === "object") {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      errors.push(label + " must be an object");
      return errors;
    }

    const properties = schema.properties || {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) {
          errors.push(label + "." + key + " is not a supported argument");
        }
      }
    }

    for (const key of schema.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(label + "." + key + " is required");
      }
    }

    for (const key of Object.keys(properties)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(
          ...validateAgainstSchema(value[key], properties[key], label + "." + key)
        );
      }
    }

    return errors;
  }

  if (schema.type === "string") {
    if (typeof value !== "string") {
      errors.push(label + " must be a string");
      return errors;
    }
    if (schema.enum && schema.enum.indexOf(value) === -1) {
      errors.push(label + " must be one of: " + schema.enum.join(", "));
    }
    return errors;
  }

  if (schema.type === "boolean") {
    if (typeof value !== "boolean") {
      errors.push(label + " must be a boolean");
    }
    return errors;
  }

  if (schema.type === "array") {
    if (!Array.isArray(value)) {
      errors.push(label + " must be an array");
      return errors;
    }
    if (typeof schema.maxItems === "number" && value.length > schema.maxItems) {
      errors.push(label + " exceeds the maximum of " + schema.maxItems + " items");
    }
    if (schema.items) {
      for (let i = 0; i < value.length; i++) {
        errors.push(
          ...validateAgainstSchema(value[i], schema.items, label + "[" + i + "]")
        );
      }
    }
    return errors;
  }

  return errors;
}

function libraryOptions(options) {
  const config = { preserveOriginal: true };
  if (!options) return config;

  for (const key of CORRECT_OPTION_KEYS) {
    if (Object.prototype.hasOwnProperty.call(options, key)) {
      config[key] = options[key];
    }
  }
  return config;
}

function ok(value) {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }]
  };
}

function fail(message) {
  return {
    isError: true,
    content: [{ type: "text", text: message }]
  };
}

function callTool(name, args) {
  if (args == null) args = {};

  const tool = tools.find((entry) => entry.name === name);
  if (!tool) {
    return fail("Unknown tool: " + name);
  }

  const errors = validateAgainstSchema(args, tool.inputSchema, "arguments");
  if (errors.length > 0) {
    return fail(errors.join("\n"));
  }

  if (name === "correct_greek_name") {
    return ok(GreekNameCorrection(args.name, libraryOptions(args.options)));
  }

  if (name === "convert_greek_name_case") {
    const config = { preserveOriginal: true };
    if (args.case === "genitive") {
      config.convertToGenitive = true;
    } else {
      config.convertToCase = args.case;
    }
    return ok(GreekNameCorrection(args.name, config));
  }

  if (name === "transliterate_greek_name") {
    return ok(
      GreekNameCorrection(args.name, {
        preserveOriginal: true,
        transliterate: args.mode
      })
    );
  }

  if (name === "analyze_greek_name") {
    return ok(
      GreekNameCorrection(args.name, {
        preserveOriginal: true,
        detectGender: true,
        detectDiminutive: true,
        generateSortKey: true,
        handleTitles: true,
        splitNames: true
      })
    );
  }

  if (name === "batch_correct_greek_names") {
    return ok(GreekNameCorrection(args.names, libraryOptions(args.options)));
  }

  return fail("Unknown tool: " + name);
}

module.exports = {
  MAX_BATCH,
  tools,
  callTool
};
