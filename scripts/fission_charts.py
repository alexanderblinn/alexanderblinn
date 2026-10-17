"""Data and chart pages for the Fission or Fiction project, built from the Global Nuclear Power Tracker.

Usage: python scripts/fission_charts.py [C:/path/to/Global-Nuclear-Power-Tracker-August-2026.xlsx]

Without an argument the newest release in scripts/data/fissionorfiction/raw/ is used; the files there
are the unchanged downloads from Global Energy Monitor, named as downloaded (month and year of the
release in the name). Own corrections live in scripts/data/fissionorfiction/corrections.csv, see
apply_corrections(). Reads the workbook with the standard library only and writes
- assets/projects/fissionorfiction/units-data.mjs: one compact row per reactor unit,
- public/img/projects/fissionorfiction/<slug>.html: one page per chart.
All figures are computed in the browser by assets/projects/fissionorfiction/charts.mjs.
"""
import argparse
from collections import Counter, defaultdict
import csv
from html import escape
import json
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'scripts/data/fissionorfiction'
RAW = DATA / 'raw'
CORRECTIONS = DATA / 'corrections.csv'
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
          'November', 'December']
GERMAN_MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober',
                 'November', 'Dezember']

# Reactor types of the tracker, in the order of their index in the data module.
TYPES = {
    'pressurized water reactor': 'Druckwasserreaktor',
    'boiling water reactor': 'Siedewasserreaktor',
    'advanced boiling water reactor': 'fortgeschrittener Siedewasserreaktor',
    'pressurized heavy water reactor': 'Druckschwerwasserreaktor',
    'gas-cooled reactor': 'gasgekühlter Reaktor',
    'high temperature gas reactor': 'Hochtemperaturreaktor',
    'light water graphite reactor': 'graphitmoderierter Leichtwasserreaktor',
    'fast breeder reactor': 'Schneller Brüter',
    'fast neutron reactor': 'schneller Reaktor',
    'liquid-metal-cooled fast reactor': 'flüssigmetallgekühlter schneller Reaktor',
    'molten salt reactor': 'Salzschmelzereaktor',
    'small modular reactor': 'kleiner modularer Reaktor',
    'heavy water gas-cooled reactor': 'gasgekühlter Schwerwasserreaktor',
    'heavy water light water reactor': 'Schwerwasser-Leichtwasserreaktor',
    'steam-generating heavy water reactor': 'dampferzeugender Schwerwasserreaktor',
    'microreactor': 'Mikroreaktor',
    'fusion': 'Fusionsreaktor',
}
STATUSES = {'operating', 'construction', 'pre-construction', 'announced', 'retired', 'mothballed',
            'cancelled', 'cancelled - inferred 4 y', 'shelved', 'shelved - inferred 2 y'}
CHARTS = {
    'map': 'Kernkraftwerke weltweit',
    'evolution': 'Kernenergie im Zeitverlauf',
    'commissioning': 'Inbetriebnahme und Stilllegung',
    'count': 'Reaktoranzahl und Alter',
    'capacity': 'Installierte Leistung',
    'construction': 'Reaktoren im Bau',
    'buildtime': 'Bauzeiten',
    'outlook': 'Laufzeit-Szenario',
}

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}


def release(path):
    """(year, month) of a tracker file named like Global-Nuclear-Power-Tracker-August-2026.xlsx."""
    match = re.search(r'-([A-Za-z]+)-(\d{4})\.xlsx$', Path(path).name)
    if not match or match[1] not in MONTHS:
        raise ValueError(f'Monat und Jahr der Ausgabe fehlen im Dateinamen: {Path(path).name}')
    return int(match[2]), MONTHS.index(match[1]) + 1


def newest_release():
    files = sorted(RAW.glob('*.xlsx'), key=release)
    if not files:
        raise SystemExit(f'Keine Tabelle in {RAW}')
    return files[-1]


def read_sheet(path, name='Data'):
    """Rows of one worksheet as dictionaries keyed by the header row (no openpyxl needed)."""
    with zipfile.ZipFile(path) as archive:
        book = ET.fromstring(archive.read('xl/workbook.xml'))
        rels = {rel.get('Id'): rel.get('Target') for rel in ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))}
        sheets = {sheet.get('name'): rels[sheet.get(f'{{{NS["r"]}}}id')] for sheet in book.find('m:sheets', NS)}
        shared = [''.join(text.text or '' for text in item.iter(f'{{{NS["m"]}}}t'))
                  for item in ET.fromstring(archive.read('xl/sharedStrings.xml')).findall('m:si', NS)]
        sheet = ET.fromstring(archive.read('xl/' + sheets[name].removeprefix('/xl/').removeprefix('xl/')))
    rows = []
    for row in sheet.find('m:sheetData', NS):
        values = {}
        for cell in row:
            column = re.match(r'[A-Z]+', cell.get('r'))[0]
            value = cell.find('m:v', NS)
            if cell.get('t') == 's':
                values[column] = shared[int(value.text)]
            elif cell.get('t') == 'inlineStr':
                values[column] = ''.join(text.text or '' for text in cell.iter(f'{{{NS["m"]}}}t'))
            else:
                values[column] = value.text if value is not None else None
        rows.append(values)
    header = rows[0]
    return [{title: row.get(column) for column, title in header.items()} for row in rows[1:]]


def same_value(a, b):
    """Equal as text, or as numbers (the sheet stores -33.967010000000002 where Excel shows -33.96701)."""
    a, b = (a or '').strip(), (b or '').strip()
    if a == b:
        return True
    try:
        return abs(float(a) - float(b)) < 1e-6
    except ValueError:
        return False


def apply_corrections(rows, path=CORRECTIONS):
    """Own corrections on top of the raw data. One change per line, separated by semicolons, with the
    header GEM unit ID;Spalte;Wert laut GEM;neuer Wert;Quelle (column names as in the sheet, an empty
    value for "no value"). A correction is applied only while the field still holds the value from
    GEM; otherwise GEM has changed it since and the correction is skipped with a warning."""
    if not path.exists():
        return 0
    by_id = {row['GEM unit ID']: row for row in rows}
    applied = 0
    with path.open(encoding='utf-8-sig', newline='') as file:
        for line, entry in enumerate(csv.DictReader(file, delimiter=';'), start=2):
            unit_id, column = (entry['GEM unit ID'] or '').strip(), (entry['Spalte'] or '').strip()
            row = by_id.get(unit_id)
            if row is None or column not in row:
                print(f'Korrektur Zeile {line} übersprungen: {unit_id} / {column} gibt es nicht', file=sys.stderr)
            elif not same_value(row[column], entry['Wert laut GEM']):
                print(f'Korrektur Zeile {line} übersprungen: {unit_id} / {column} lautet bei GEM jetzt {row[column]!r}',
                      file=sys.stderr)
            else:
                row[column] = (entry['neuer Wert'] or '').strip() or None
                applied += 1
    return applied


def date(text):
    """ISO date with the precision of the source ('1974', '1974-06' or '1974-06-24') or None."""
    if not text:
        return None
    if not re.fullmatch(r'\d{4}(-\d{2}){0,2}', text):
        raise ValueError(f'Unerwartetes Datum: {text!r}')
    return text


def year(text):
    return int(text) if text else None


def site_name(project):
    name = re.sub(r' nuclear power (plant|station)$', '', project.strip())
    return re.sub(r' floating$', ' (schwimmend)', name)


def units_module(rows, stand, label):
    """Compact rows: sites once, units referring to their site, repeated texts (model, owner,
    operator) once in TEXTS."""
    sites, site_index, units, texts, text_index = [], {}, [], [], {}

    def text(value):
        """Index of a model, owner or operator name in TEXTS; None if unknown."""
        if not value or value == 'unknown':
            return None
        value = '; '.join(part.strip() for part in value.split(';'))
        if value not in text_index:
            text_index[value] = len(texts)
            texts.append(value)
        return text_index[value]

    by_location = defaultdict(list)
    for row in rows:
        by_location[row['GEM location ID']].append(row)
    for location, members in by_location.items():
        names = Counter(site_name(row['Project Name']) for row in members)
        first = members[0]
        lat = round(sum(float(row['Latitude']) for row in members) / len(members), 4)
        lon = round(sum(float(row['Longitude']) for row in members) / len(members), 4)
        area = first['State/Province'] or first['Major Area (prefecture, district)'] or ''
        site_index[location] = len(sites)
        sites.append([' / '.join(name for name, _ in names.most_common()), first['Country/Area'], lat, lon, area])
    types = list(TYPES)
    for row in rows:
        status, kind = row['Status'], row['Reactor Type']
        if status not in STATUSES:
            raise ValueError(f'Unbekannter Status: {status!r}')
        if kind not in TYPES and kind not in (None, 'unknown'):
            raise ValueError(f'Unbekannter Reaktortyp: {kind!r} (deutsche Bezeichnung in TYPES ergänzen)')
        planned = year(row['Retirement Year']) if row['Planned Retirement'] == 'Y' else None
        expected = year(row['Start Year']) if status not in ('operating', 'retired', 'mothballed') else None
        unit = '' if row['Unit Name'] in (None, '--') else row['Unit Name']
        units.append([
            site_index[row['GEM location ID']], unit, status,
            round(float(row['Capacity (MW)'])), types.index(kind) if kind in TYPES else None,
            date(row['Construction Start Date']), date(row['First Grid Connection']),
            date(row['Commercial Operation Date']), date(row['Retirement Date']),
            year(row['Cancellation Year']), expected, planned,
            text(row['Model']), text(row['Owner']), text(row['Operator']),
        ])
    dump = lambda value: json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    lines = [
        '// Generated by scripts/fission_charts.py from the Global Nuclear Power Tracker of Global Energy Monitor',
        '// (CC BY 4.0) and scripts/data/fissionorfiction/corrections.csv. Do not edit by hand.',
        '// STAND: first day of the release month; RELEASE: the release in words',
        '// SITES: [name, country, latitude, longitude, state or province]',
        '// UNITS: [site, unit, status, MW, type, construction start, first grid connection,',
        '//         commercial operation, retirement, cancellation year, expected start year, planned retirement year,',
        '//         model, owner, operator], the last three as indices into TEXTS',
        f'export const STAND = {dump(stand)};',
        f'export const RELEASE = {dump(label)};',
        f'export const TYPES = {dump(list(TYPES.values()))};',
        f'export const TEXTS = {dump(texts)};',
        'export const SITES = [',
        *[f'{dump(site)},' for site in sites],
        '];',
        'export const UNITS = [',
        *[f'{dump(unit)},' for unit in units],
        '];',
    ]
    return '\n'.join(lines) + '\n', len(sites), len(units)


def chart_page(slug, title, label):
    source = (f'Global Energy Monitor, Global Nuclear Power Tracker, {label} (CC BY 4.0) · '
              'Auswertung und Darstellung: Alexander Blinn')
    return f'''<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(title)} — Fission or Fiction</title>
  <link rel="canonical" href="https://alexanderblinn.com/img/projects/fissionorfiction/{slug}.html">
  <link rel="icon" href="/assets/site/favicon.svg" type="image/svg+xml">
  <script>if (window.self !== window.top) document.documentElement.classList.add('embedded');</script>
  <link rel="stylesheet" href="/assets/projects/fissionorfiction/charts.css">
  {MAP_HEAD if slug == 'map' else PLOTLY_HEAD}
  <script type="module" src="/assets/projects/fissionorfiction/charts.mjs"></script>
</head>
<body class="chart-page" data-chart="{slug}">
  <header class="chart-heading">
    <a href="/projects/fissionorfiction.html#{slug}">← Zum Projekt</a>
    <h1>{escape(title)}</h1>
  </header>
  <p id="chart-status" role="status">Diagramm wird geladen …</p>
  <noscript><p>Dieses interaktive Diagramm benötigt JavaScript.</p></noscript>
  <main class="chart-shell" aria-label="{escape(title)}">
    <form class="chart-controls" id="chart-controls" onsubmit="return false"></form>
    <div class="chart-readouts" id="chart-readouts" aria-live="polite"></div>
    <div id="chart"></div>
  </main>
  <footer class="chart-source">{source}</footer>
</body>
</html>
'''


PLOTLY_HEAD = '<script src="/assets/vendor/plotly-3.0.1.min.js"></script>'
MAP_HEAD = ('<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">\n'
            '  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>')


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('source', type=Path, nargs='?', help='GEM-Tabelle (xlsx), sonst die neueste in raw/')
    source = parser.parse_args().source or newest_release()
    release_year, release_month = release(source)
    stand = f'{release_year}-{release_month:02d}-01'
    label = f'{GERMAN_MONTHS[release_month - 1]} {release_year}'
    rows = read_sheet(source)
    corrected = apply_corrections(rows)
    module, site_count, unit_count = units_module(rows, stand, label)
    (ROOT / 'assets/projects/fissionorfiction/units-data.mjs').write_text(module, encoding='utf-8')
    destination = ROOT / 'public/img/projects/fissionorfiction'
    for slug, title in CHARTS.items():
        (destination / f'{slug}.html').write_text(chart_page(slug, title, label), encoding='utf-8')
    print(f'{source.name} ({label}): {unit_count} Blöcke an {site_count} Standorten, '
          f'{corrected} Korrekturen, {len(CHARTS)} Seiten in {destination}')


if __name__ == '__main__':
    main()
