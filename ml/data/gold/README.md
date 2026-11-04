# Gold labels

`gold.jsonl` is a hand-labeled set for cases the synthetic generator does not cover well: surnames absent from the name lists, vocative edge cases, and compound surnames.

The file starts empty. Add one JSON object per line. Do not put real people's names in it. Use invented examples only.

```json
{"input":"prodromos papadopoulos","target":"{\"corrected\":\"Πρόδρομος Παπαδόπουλος\",\"first\":\"Πρόδρομος\",\"last\":\"Παπαδόπουλος\",\"father\":null,\"title\":null,\"gender\":\"male\",\"genitive\":\"Πρόδρομου Παπαδόπουλου\",\"vocative\":\"Πρόδρομε Παπαδόπουλο\",\"accusative\":\"Πρόδρομο Παπαδόπουλο\",\"sortKey\":\"προδρομοσ παπαδοπουλοσ\"}","corruptions":["gold"],"notes":"out-of-dictionary surname; vocative of an unlisted -ος name"}
```

`target` is a JSON string with the same fields as the synthetic rows: `corrected`, `first`, `last`, `father`, `title`, `gender`, `genitive`, `vocative`, `accusative`, `sortKey`.

`gender` should be the library's `detectGender` label when you are recording what the library does. If you are recording the reading you want a model to learn instead, say so in `notes`.

Phase 5 can mix this file into training with an upweight. This folder does not train anything.
