"""Import Fission or Fiction exports without modifying the source repository.

Usage: python scripts/import_fission.py C:/path/to/fissionorfiction
"""
import argparse
from html import escape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CHARTS = {
    'evolution': ('index-map', 'Kernenergie im Zeitverlauf'),
    'commissioning': ('index-commissioning', 'Inbetriebnahme und Stilllegung'),
    'count': ('index-count', 'Reaktoranzahl und Alter'),
    'capacity': ('index-capacity', 'Installierte Leistung'),
    'construction': ('index-construction', 'Reaktoren im Bau'),
}


def arguments(source, marker, count):
    tail = source.rsplit(marker, 1)[1]
    decoder = json.JSONDecoder()
    values = []
    for _ in range(count):
        tail = tail.lstrip(' \t\r\n,')
        value, end = decoder.raw_decode(tail)
        values.append(value)
        tail = tail[end:]
    return values


def adapt_plot(source, slug, title):
    _, data, layout, config = arguments(source, 'Plotly.newPlot(', 4)
    frames = []
    if 'Plotly.addFrames(' in source:
        tail = source.rsplit('Plotly.addFrames(', 1)[1].split(',', 1)[1].lstrip()
        frames = json.JSONDecoder().raw_decode(tail)[0]
    payload = json.dumps(dict(data=data, layout=layout, config=config, frames=frames),
                         ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    return f'''<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(title)} — Fission or Fiction</title>
  <link rel="canonical" href="https://alexanderblinn.com/img/fissionorfiction/{slug}.html">
  <link rel="stylesheet" href="/assets/fission-charts.css">
  <script>if (self !== top) document.documentElement.classList.add('embedded');</script>
  <script src="/assets/vendor/plotly-2.27.0.min.js" defer></script>
  <script src="/assets/fission-charts.js" defer></script>
</head>
<body data-chart="{slug}">
  <header><a href="/projects/fissionorfiction.html#{slug}">← Zum Projekt</a><h1>{escape(title)}</h1></header>
  <p id="chart-status" role="status">Diagramm wird geladen …</p>
  <noscript>Dieses interaktive Diagramm benötigt JavaScript.</noscript>
  <main class="chart-shell" aria-label="{escape(title)}"><div id="chart"></div></main>
  <footer>Global Energy Monitor · Global Nuclear Power Tracker · Juli 2024 · Alexander Blinn</footer>
  <script id="chart-data" type="application/json">{payload}</script>
</body>
</html>
'''


def adapt_map(source):
    return source.replace('</head>', '''<link rel="stylesheet" href="/assets/fission-map.css">
<script src="/assets/fission-map.js" defer></script>
</head>''', 1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    source = parser.parse_args().source.resolve()
    pages = {slug: adapt_plot((source / 'diagrams' / f'{filename}.html').read_text(encoding='utf-8'), slug, title)
             for slug, (filename, title) in CHARTS.items()}
    map_html = (source / 'diagrams/map.html').read_text(encoding='utf-8')
    pages['map'] = adapt_map(map_html)
    original = (source / 'diagrams/index-capacity.html').read_text(encoding='utf-8')
    libraries = [m[1] for m in re.finditer(r'<script[^>]*>(.*?)</script>', original, re.S)
                 if 'plotly.js v2.27.0' in m[1]]
    if len(libraries) != 1:
        raise ValueError('Expected bundled Plotly 2.27.0 library')
    license_text = (source / 'LICENSE').read_text(encoding='utf-8')
    destination = ROOT / 'public/img/fissionorfiction'
    destination.mkdir(parents=True, exist_ok=True)
    for slug, html in pages.items():
        (destination / f'{slug}.html').write_text(html, encoding='utf-8')
    (destination / 'LICENSE.txt').write_text(license_text, encoding='utf-8')
    (ROOT / 'assets/vendor/plotly-2.27.0.min.js').write_text(libraries[0], encoding='utf-8')
    print(f'{len(pages)} Diagramme importiert: {destination}')


if __name__ == '__main__':
    main()
