// validation.js
"use strict";

// Validate Greek name
function validateGreekName(name, strict = false) {
  if (!name || name.trim() === "") return false;

  const greekPattern = /^[Α-Ωα-ωίϊΐόάέύϋΰήώ\s\-']+$/;

  if (strict) {
    return greekPattern.test(name);
  }

  const hasGreek = /[Α-Ωα-ω]/.test(name);
  const validChars = /^[A-Za-zΑ-Ωα-ωίϊΐόάέύϋΰήώ\s\-']+$/.test(name);

  return hasGreek && validChars;
}

// Normalize Greek tonetics
function normalizeGreekTonotics(str) {
  const tonoticMap = {
    ά: "ά",
    έ: "έ",
    ή: "ή",
    ί: "ί",
    ό: "ό",
    ύ: "ύ",
    ώ: "ώ",
    Ά: "Ά",
    Έ: "Έ",
    Ή: "Ή",
    Ί: "Ί",
    Ό: "Ό",
    Ύ: "Ύ",
    Ώ: "Ώ",
    ϊ: "ϊ",
    ϋ: "ϋ",
    ΐ: "ΐ",
    ΰ: "ΰ",
    Ϊ: "Ϊ",
    Ϋ: "Ϋ"
  };

  return str
    .split("")
    .map((char) => tonoticMap[char] || char)
    .join("");
}

// Handle Greek diacritics
function handleGreekDiacritics(str) {
  return str.normalize("NFC");
}

module.exports = {
  validateGreekName,
  normalizeGreekTonotics,
  handleGreekDiacritics
};
