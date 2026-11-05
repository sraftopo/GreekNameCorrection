"""Unit tests for gold upweight and normalizer metrics. No model download."""

import json
import os
import subprocess
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from data import mix_gold, utf8_length
from metrics import score_rows

ROOT = Path(__file__).resolve().parents[2]


class GoldMixTest(unittest.TestCase):
    def test_upweight_repeats_gold_rows(self):
        train = [{"input": "a", "target": "{}"}]
        gold = [{"input": "g", "target": "{}"}]
        mixed = mix_gold(train, gold, 3)
        self.assertEqual([row["input"] for row in mixed], ["a", "g", "g", "g"])

    def test_zero_upweight_leaves_training_rows(self):
        train = [{"input": "a", "target": "{}"}]
        self.assertEqual(mix_gold(train, [{"input": "g", "target": "{}"}], 0), train)

    def test_utf8_length_counts_bytes(self):
        self.assertGreater(utf8_length("Γιώργος"), len("Γιώργος"))


class MetricsTest(unittest.TestCase):
    def _row(self, prediction, baseline, greeklish=False, surname_known=True):
        gold = {
            "corrected": "Πρόδρομος",
            "first": "Πρόδρομος",
            "last": "Πρόδρομος",
            "father": None,
            "title": None,
            "gender": "male",
            "genitive": "Πρόδρομου",
            "vocative": "Πρόδρομε",
            "accusative": "Πρόδρομο",
            "sortKey": "προδρομοσ",
        }
        return {
            "gold": gold,
            "prediction": json.dumps(prediction, ensure_ascii=False) if isinstance(prediction, dict) else prediction,
            "baseline": baseline,
            "baseline_greeklish": baseline,
            "surname_known": surname_known,
            "greeklish": greeklish,
        }

    def test_invalid_json_misses_every_field(self):
        report = score_rows([self._row("not json", None)])
        self.assertEqual(report["json_valid"], 0.0)
        self.assertEqual(report["exact_match"]["corrected"]["model"], 0.0)
        self.assertEqual(report["vocative_accuracy"]["model"], 0.0)

    def test_exact_fields_and_slices(self):
        gold_prediction = {
            "corrected": "Πρόδρομος",
            "first": "Πρόδρομος",
            "last": "Πρόδρομος",
            "father": None,
            "title": None,
            "gender": "male",
            "genitive": "Πρόδρομου",
            "vocative": "Πρόδρομε",
            "accusative": "Πρόδρομο",
            "sortKey": "προδρομοσ",
        }
        wrong = dict(gold_prediction)
        wrong["last"] = "Προδρομος"
        wrong["vocative"] = "Πρόδρομος"
        wrong["corrected"] = "Προδρομος"
        rows = [
            self._row(gold_prediction, gold_prediction, greeklish=True, surname_known=False),
            self._row(wrong, wrong, greeklish=False, surname_known=False),
        ]
        report = score_rows(rows)
        self.assertEqual(report["json_valid"], 1.0)
        self.assertEqual(report["exact_match"]["last"]["model"], 0.5)
        self.assertEqual(report["vocative_accuracy"]["model"], 0.5)
        self.assertEqual(report["out_of_dictionary_surname_accuracy"]["rows"], 2)
        self.assertEqual(report["out_of_dictionary_surname_accuracy"]["model"], 0.5)
        self.assertEqual(report["greeklish_to_greek_exact"]["rows"], 1)
        self.assertEqual(report["greeklish_to_greek_exact"]["model"], 1.0)


class RulesBaselineTest(unittest.TestCase):
    def test_node_baseline_matches_the_library_label(self):
        script = ROOT / "ml" / "normalizer" / "rules_baseline.js"
        completed = subprocess.run(
            ["node", str(script)],
            input=json.dumps({"input": "Γιώργος Παπαδόπουλος", "surname": "Πρόδρομος"}, ensure_ascii=False) + "\n",
            text=True,
            encoding="utf-8",
            cwd=str(ROOT),
            capture_output=True,
            check=False,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)
        row = json.loads(completed.stdout)
        self.assertEqual(row["rules"]["corrected"], "Γιώργος Παπαδόπουλος")
        self.assertEqual(row["rules"]["gender"], "male")
        self.assertEqual(row["rules"]["vocative"], "Γιώργο Παπαδόπουλο")
        self.assertFalse(row["surname_known"])


if __name__ == "__main__":
    unittest.main()
