"""Import existing ShowMeMSCI figures, retaining their Plotly data and controls.

Usage: python scripts/import_msci.py C:/path/to/msci
The source repository is read only. No data downloads or plot recalculation.
"""
import argparse
from html import escape
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CHARTS = {
    'single': 'MSCI World: Indexverlauf',
    'multiple': 'MSCI World: Jahresverläufe',
    'returns-one': 'MSCI World: Renditeklassen',
    'returns-two': 'MSCI World: Jahresrenditen',
    'long-term': 'MSCI World: Renditen nach Haltedauer',
    'heatmap': 'MSCI World: Renditedreieck',
    'dist': 'MSCI World: Renditeverteilung',
}


def adapt_chart(source, slug, title):
    section = re.search(r'<section class="chart-shell">(.*?)</section>', source, re.S)
    if not section or section[1].count('Plotly.newPlot(') != 1:
        raise ValueError(f'{slug}: Erwarteter Plotly-Export fehlt')
    fragment = section[1]
    after = source[section.end():]
    # Keep chart-specific interactions (year highlighting, histogram statistics).
    # Shared sizing is handled by assets/projects/msci/charts.js.
    scripts = [match[0] for match in re.finditer(r'<script\b[^>]*>.*?</script>', after, re.S)
               if 'const applyFinish' not in match[0]]
    styles = re.findall(r'<style\b[^>]*>.*?</style>', after, re.S)
    tall = ' chart-page-tall' if slug == 'heatmap' else ''
    return f'''<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(title)} — Alexander Blinn</title>
  <link rel="canonical" href="https://alexanderblinn.com/img/projects/msci/{slug}.html">
  <link rel="icon" href="/assets/site/favicon.svg" type="image/svg+xml">
  {''.join(styles)}
  <link rel="stylesheet" href="/assets/projects/msci/charts.css">
  <script>if (window.self !== window.top) document.documentElement.classList.add('embedded');</script>
  <script src="/assets/vendor/plotly-3.0.1.min.js"></script>
  <script src="/assets/projects/msci/charts.js" defer></script>
</head>
<body class="chart-page{tall}">
  <header class="chart-heading">
    <a href="/projects/msci.html#{slug}">← Zum Projekt</a>
    <h1>{escape(title)}</h1>
  </header>
  <p id="chart-status" role="status">Diagramm wird geladen …</p>
  <noscript><p>Dieses interaktive Diagramm benötigt JavaScript.</p></noscript>
  <main class="chart-shell" aria-label="{escape(title)}">{fragment}</main>
  <footer class="chart-source">MSCI World, USD · Datenstand: 02.04.2026 · Quelle: Yahoo Finance (^990100-USD-STRD)</footer>
  {''.join(scripts)}
</body>
</html>
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Pfad zum ShowMeMSCI-Repository')
    args = parser.parse_args()
    source = args.source.resolve()
    destination = ROOT / 'public/img/projects/msci'
    # Prepare every figure first, so incomplete exports fail before any writes.
    pages = {slug: adapt_chart((source / 'img' / f'{slug}.html').read_text(encoding='utf-8'), slug, title)
             for slug, title in CHARTS.items()}
    license_text = (source / 'LICENSE').read_text(encoding='utf-8')
    destination.mkdir(parents=True, exist_ok=True)
    for slug, html in pages.items():
        (destination / f'{slug}.html').write_text(html, encoding='utf-8')
    (destination / 'LICENSE.txt').write_text(license_text, encoding='utf-8')
    print(f'{len(pages)} Diagramme importiert: {destination}')


if __name__ == '__main__':
    main()
