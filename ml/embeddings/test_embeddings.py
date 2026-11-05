"""Unit tests for pair building, sortKey, and retrieval metrics. No torch."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from metrics import evaluate_cases, sort_key, sort_key_score
from pairs import training_rows


class SortKeyTest(unittest.TestCase):
    def test_matches_the_library_fixtures(self):
        self.assertEqual(sort_key("Γιώργος"), "γιωργοσ")
        self.assertEqual(sort_key("γιώργος"), "γιωργοσ")
        self.assertEqual(sort_key("Γιώργος Παπαδόπουλος"), "γιωργοσ παπαδοπουλοσ")
        self.assertEqual(sort_key("Γιωργος Παπαδοπουλος"), "γιωργοσ παπαδοπουλοσ")
        self.assertEqual(sort_key("Μαρία Κωνσταντίνου"), "μαρια κωνσταντινου")
        points = [format(ord(char), "x") for char in sort_key("Γιώργος Παπαδόπουλος")]
        self.assertEqual(
            points,
            "3b3 3b9 3c9 3c1 3b3 3bf 3c3 20 3c0 3b1 3c0 3b1 3b4 3bf 3c0 3bf 3c5 3bb 3bf 3c3".split(),
        )

    def test_identical_sort_keys_score_one(self):
        self.assertEqual(
            sort_key_score("Γιώργος Παπαδόπουλος", "Γιωργος Παπαδοπουλος"),
            1.0,
        )


class TrainingRowsTest(unittest.TestCase):
    def test_attaches_a_hard_negative_for_the_same_anchor(self):
        pairs = [
            {"type": "positive", "split": "train", "a": "Γιώργος Παπαδόπουλος", "b": "Γιωργος Παπαδοπουλος"},
            {"type": "hard_negative", "split": "train", "a": "Γιώργος Παπαδόπουλος", "b": "Μαρία Παπαδοπούλου"},
            {"type": "positive", "split": "test", "a": "Άννα", "b": "Αννα"},
        ]
        rows = training_rows(pairs, seed=1)
        self.assertEqual(len(rows), 2)
        matched = [row for row in rows if row["anchor"] == "Γιώργος Παπαδόπουλος"][0]
        self.assertEqual(matched["negative"], "Μαρία Παπαδοπούλου")
        self.assertEqual(matched["negative_source"], "hard")

    def test_random_negative_is_stable_and_not_a_positive_surface(self):
        pairs = [
            {"type": "positive", "a": "Α", "b": "Β"},
            {"type": "positive", "a": "Γ", "b": "Δ"},
        ]
        once = training_rows(pairs, seed=3)
        twice = training_rows(pairs, seed=3)
        self.assertEqual(once, twice)
        for row in once:
            self.assertEqual(row["negative_source"], "random")
            self.assertNotIn(row["negative"], (row["anchor"], row["positive"]))


class MetricsTest(unittest.TestCase):
    def test_recall_and_f1_for_a_perfect_score(self):
        rows = [
            {"type": "positive", "a": "query", "b": "hit"},
            {"type": "hard_negative", "a": "query", "b": "miss"},
        ]

        def score(left, right):
            if right == "hit":
                return 0.9
            return 0.1

        report = evaluate_cases(rows, score)
        self.assertEqual(report["recall@1"], 1.0)
        self.assertEqual(report["recall@5"], 1.0)
        self.assertEqual(report["f1"], 1.0)
        self.assertGreaterEqual(report["threshold"], 0.9)

    def test_sortkey_baseline_ranks_the_accent_stripped_form_first(self):
        rows = [
            {"type": "positive", "a": "Γιώργος Παπαδόπουλος", "b": "Γιωργος Παπαδοπουλος"},
            {"type": "hard_negative", "a": "Γιώργος Παπαδόπουλος", "b": "Μαρία Κωνσταντίνου"},
            {"type": "positive", "a": "Μαρία Κωνσταντίνου", "b": "Μαρια Κωνσταντινου"},
        ]
        report = evaluate_cases(rows, sort_key_score)
        self.assertEqual(report["recall@1"], 1.0)
        self.assertEqual(report["f1"], 1.0)


if __name__ == "__main__":
    unittest.main()
