"use strict";

// ByT5 has no tokenizer.json that Transformers.js can load.
// Token ids are UTF-8 bytes plus 3. 0 is pad, 1 is end, 2 is unknown.

function encodeByT5(text) {
  const bytes = Buffer.from(text, "utf8");
  const ids = [];
  for (let i = 0; i < bytes.length; i++) {
    ids.push(bytes[i] + 3);
  }
  ids.push(1);
  return ids;
}

function decodeByT5(ids) {
  const bytes = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (id >= 3 && id <= 258) bytes.push(id - 3);
  }
  return Buffer.from(bytes).toString("utf8");
}

module.exports = {
  encodeByT5: encodeByT5,
  decodeByT5: decodeByT5
};
