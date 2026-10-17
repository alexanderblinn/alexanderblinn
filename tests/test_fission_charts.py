"""Fission or Fiction data script: raw releases, own corrections and the generated data module.

Run with: python -m unittest discover -s tests -v
"""
import contextlib
import io
from pathlib import Path
import re
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import fission_charts  # noqa: E402


class ReleaseTest(unittest.TestCase):
    def test_month_and_year_come_from_the_file_name(self):
        self.assertEqual(fission_charts.release(Path("Global-Nuclear-Power-Tracker-August-2026.xlsx")), (2026, 8))
        names = ["Global-Nuclear-Power-Tracker-August-2026.xlsx", "Global-Nuclear-Power-Tracker-July-2024.xlsx",
                 "Global-Nuclear-Power-Tracker-January-2027.xlsx"]
        self.assertEqual(sorted(names, key=fission_charts.release)[-1], names[2])
        with self.assertRaises(ValueError):
            fission_charts.release(Path("tracker-neu.xlsx"))

    def test_data_module_matches_the_newest_raw_release(self):
        year, month = fission_charts.release(fission_charts.newest_release())
        module = (ROOT / "assets/projects/fissionorfiction/units-data.mjs").read_text(encoding="utf-8")
        self.assertIn(f'export const STAND = "{year}-{month:02d}-01";', module)
        page = (ROOT / "public/img/projects/fissionorfiction/map.html").read_text(encoding="utf-8")
        self.assertIn(f"Global Nuclear Power Tracker, {fission_charts.GERMAN_MONTHS[month - 1]} {year}", page)


class CorrectionsTest(unittest.TestCase):
    def apply(self, lines, rows):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "corrections.csv"
            path.write_text("\n".join(["GEM unit ID;Spalte;Wert laut GEM;neuer Wert;Quelle", *lines]) + "\n",
                            encoding="utf-8-sig")
            warnings = io.StringIO()
            with contextlib.redirect_stderr(warnings):
                applied = fission_charts.apply_corrections(rows, path)
        return applied, warnings.getvalue()

    def test_a_correction_applies_while_gem_still_has_the_old_value(self):
        rows = [{"GEM unit ID": "G1", "Capacity (MW)": "362", "Latitude": "-33.967010000000002", "Retirement Date": None}]
        applied, warnings = self.apply([
            "G1;Capacity (MW);362;340;IAEA PRIS",
            "G1;Latitude;-33.96701;-33.9672;Karte",
            "G1;Retirement Date;;2030-01-01;Ankündigung",
        ], rows)
        self.assertEqual((applied, warnings), (3, ""))
        self.assertEqual(rows[0]["Capacity (MW)"], "340")
        self.assertEqual(rows[0]["Latitude"], "-33.9672")
        self.assertEqual(rows[0]["Retirement Date"], "2030-01-01")

    def test_outdated_or_unknown_corrections_are_skipped_with_a_warning(self):
        rows = [{"GEM unit ID": "G1", "Status": "operating"}]
        applied, warnings = self.apply(["G1;Status;construction;operating;alt", "G9;Status;x;y;falsche ID"], rows)
        self.assertEqual(applied, 0)
        self.assertEqual(rows[0]["Status"], "operating")
        self.assertEqual(len(re.findall("übersprungen", warnings)), 2)

    def test_the_corrections_file_in_the_repository_has_the_expected_header(self):
        header = fission_charts.CORRECTIONS.read_text(encoding="utf-8-sig").splitlines()[0]
        self.assertEqual(header, "GEM unit ID;Spalte;Wert laut GEM;neuer Wert;Quelle")


if __name__ == "__main__":
    unittest.main()
