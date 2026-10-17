"""The imported ShowMeMSCI charts are German: labels, number format and historical notes.

Run with: python -m unittest discover -s tests -v
"""
import json
from pathlib import Path
import re
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import import_msci  # noqa: E402
from msci_german import EVENTS  # noqa: E402

CHARTS = ROOT / "public/img/projects/msci"
ENGLISH = re.compile(r"\b(View|return|years?|yrs|level|Holding|observations|bound|Average|Gains|Flat|Loss|"
                     r"Total|Annualized|Days|Months|change|Highlighted|Calendar|Start year)\b")


def figure(name):
    html = (CHARTS / f"{name}.html").read_text(encoding="utf-8")
    decoder = json.JSONDecoder()
    data, end = decoder.raw_decode(html, html.index("[", html.index("Plotly.newPlot(")))
    layout, _ = decoder.raw_decode(html, html.index("{", end))
    return html, data, layout


def texts(node, key=""):
    if isinstance(node, str):
        yield key, node
    elif isinstance(node, dict):
        for name, value in node.items():
            if name not in ("bdata", "customdata", "template", "family"):
                yield from texts(value, name)
    elif isinstance(node, list):
        for value in node:
            yield from texts(value, key)


class MsciChartTests(unittest.TestCase):
    def test_labels_are_german_with_decimal_comma(self):
        for name in import_msci.CHARTS:
            with self.subTest(chart=name):
                _, data, layout = figure(name)
                self.assertEqual(layout["separators"], ",.")
                english = [text for key, text in texts([data, layout]) if ENGLISH.search(text)]
                self.assertEqual(english, [])

    def test_german_prices_and_exchange_rates_are_chained_without_jumps(self):
        import msci_extra
        cpi_de, fx = msci_extra.german_cpi(), msci_extra.usd_per_eur()
        # West German OECD series until 1990, Destatis via Bundesbank from 1991: a normal month at the seam.
        self.assertLess(abs(cpi_de["1991-01"] / cpi_de["1990-12"] - 1), 0.01)
        self.assertAlmostEqual(fx["1972-12"], msci_extra.DM_PER_EURO / 3.2, delta=0.01)
        self.assertLess(abs(fx["1999-01"] / fx["1998-12"] - 1), 0.03)
        for month in ("1972-01", "2025-12"):
            self.assertIn(month, cpi_de)
            self.assertIn(month, fx)

    def test_return_classes_have_a_plain_background(self):
        _, _, layout = figure("returns-one")
        self.assertEqual([shape["type"] for shape in layout["shapes"]], ["line", "line"])

    def test_historical_notes_are_german(self):
        _, data, _ = figure("returns-one")
        notes = {int(row[1]): row[3] for trace in data for row in trace["customdata"]}
        self.assertEqual({year: text.replace("<br>", " ") for year, text in notes.items()}, EVENTS)
        # Wrapped so that the tooltip fits into the chart.
        self.assertTrue(all(len(line) <= 42 for text in notes.values() for line in text.split("<br>")))

    def test_statistics_card_follows_german_buttons(self):
        html, _, _ = figure("dist")
        for label in ('Tage: "days"', 'Monate: "months"', 'Jahre: "years"'):
            self.assertIn(label, html)
        # German thousands separator in the number of daily returns.
        self.assertRegex(html, r'"sample_size": "\d{1,3}\.\d{3}"')

    def test_number_and_label_helpers(self):
        self.assertEqual(import_msci.german_numbers("h = 9.01% (Doane, k = 9)"), "h = 9,01% (Doane, k = 9)")
        self.assertEqual(import_msci.german("1 yrs"), "1 Jahr")
        self.assertEqual(import_msci.german("-50%<br>to -40%"), "-50%<br>bis -40%")
        self.assertEqual(import_msci.german("+403.70%"), "+403,70%")


if __name__ == "__main__":
    unittest.main()
