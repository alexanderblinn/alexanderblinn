"""Import existing ShowMeMSCI figures, retaining their Plotly data and controls.

Usage: python scripts/import_msci.py C:/path/to/msci
The source repository is read only. No data downloads or plot recalculation.
"""
import argparse
from html import escape
import json
from pathlib import Path
import re
import textwrap

from msci_german import EVENTS, LABELS

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


# German numbers: decimal comma, thousands point ("13,892" -> "13.892", "0.10%" -> "0,10%").
SWAP_SEPARATORS = str.maketrans('.,', ',.')


def german_numbers(text):
    return re.sub(r'\d+(?:[.,]\d+)+', lambda match: match[0].translate(SWAP_SEPARATORS), text)


def german(text):
    """German version of one string of a figure; unknown strings stay as they are."""
    if text in LABELS:
        return LABELS[text]
    if match := re.fullmatch(r'(\d+) yrs', text):
        return f'{match[1]} Jahr' if match[1] == '1' else f'{match[1]} Jahre'
    if match := re.fullmatch(r'(-?\d+%)(<br>| )to (-?\d+%)', text):
        return f'{match[1]}{match[2]}bis {match[3]}'
    if re.fullmatch(r'[+-]?\d+\.\d+%', text):
        return german_numbers(text)
    return text


def translate(node):
    if isinstance(node, str):
        return german(node)
    if isinstance(node, list):
        return [translate(item) for item in node]
    if isinstance(node, dict):
        return {key: value if key == 'bdata' else translate(value) for key, value in node.items()}
    return node


def localize_figure(fragment, slug):
    """German texts and number format plus a few layout fixes, applied to the figure JSON."""
    decoder = json.JSONDecoder()
    call = fragment.index('Plotly.newPlot(')
    data_start = fragment.index('[', call)
    data, data_end = decoder.raw_decode(fragment, data_start)
    layout_start = fragment.index('{', data_end)
    layout, layout_end = decoder.raw_decode(fragment, layout_start)
    # The historical notes are long single lines; wrapped, the tooltip stays inside the chart.
    note = lambda year: '<br>'.join(textwrap.wrap(EVENTS[year], 42, break_on_hyphens=False))
    if slug == 'returns-one':
        for trace in data:
            for row in trace['customdata']:
                row[3] = note(int(row[1]))
    if slug == 'returns-two':
        for trace in data:
            for year, row in zip(trace['x'], trace['customdata']):
                row[0] = note(int(year))
    if slug in ('returns-one', 'returns-two'):
        layout.setdefault('hoverlabel', {})['align'] = 'left'
    if slug == 'returns-one':
        # Plain background like the other charts: drop the tinted loss/flat/gain areas, keep the dividing lines.
        layout['shapes'] = [shape for shape in layout.get('shapes', []) if shape.get('type') != 'rect']
    if slug == 'multiple':
        for trace in data:
            trace['customdata'] = [re.sub(r'(\d{4})-(\d{2})-(\d{2})', r'\3.\2.\1', day) for day in trace['customdata']]
        # The yearly paths stay between -52 % and +41 %; the exported axis ran to -110 %.
        for axis in [layout['yaxis']] + [button['args'][1]['yaxis'] for button in layout['updatemenus'][0]['buttons']]:
            if axis.get('range') == [-110, 60]:
                axis['range'] = [-55, 45]
    if slug == 'long-term':
        # Legend from the highest to the lowest line; the fill needs the traces in their order.
        for trace, rank in zip(data, [1, 3, 2]):
            trace['showlegend'] = True
            trace['legendrank'] = rank
        layout['showlegend'] = True
        layout['legend'].update(orientation='h', x=0, xanchor='left', y=1.02, yanchor='bottom', traceorder='normal')
        layout['margin']['t'] = max(layout['margin'].get('t', 0), 56)
    if slug == 'heatmap':
        for trace, title in zip(data, ['Rendite p. a.', 'Gesamtrendite']):
            trace['showscale'] = True
            trace['colorbar'] = {'title': {'text': title, 'side': 'right'}, 'tickformat': '.0%',
                                 'thickness': 12, 'len': 0.6, 'outlinewidth': 0}
    data, layout = translate(data), translate(layout)
    layout['separators'] = ',.'
    dump = lambda value: json.dumps(value, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return (fragment[:data_start] + dump(data) + fragment[data_end:layout_start] + dump(layout)
            + fragment[layout_end:])


def localize_script(script):
    """The histogram statistics card is set by its own script with English labels."""
    marker = 'const statsPayload = '
    if marker not in script:
        return script
    start = script.index(marker) + len(marker)
    payload, end = json.JSONDecoder().raw_decode(script, start)
    for stats in payload.values():
        stats['title'] = LABELS[stats['title']]
        for key in ('sample_size', 'bin_label', 'sample_mean', 'sample_variance'):
            stats[key] = german_numbers(stats[key])
    script = script[:start] + json.dumps(payload, ensure_ascii=False) + script[end:]
    # The card follows the button labels, which are German now.
    for english, key in (('Days', 'days'), ('Months', 'months'), ('Years', 'years')):
        old = f'{english}: "{key}"'
        if old not in script:
            raise ValueError(f'Statistik-Skript: {old} fehlt')
        script = script.replace(old, f'{LABELS[english]}: "{key}"')
    return script


def adapt_chart(source, slug, title, footer):
    section = re.search(r'<section class="chart-shell">(.*?)</section>', source, re.S)
    if not section or section[1].count('Plotly.newPlot(') != 1:
        raise ValueError(f'{slug}: Erwarteter Plotly-Export fehlt')
    fragment = localize_figure(section[1], slug)
    after = source[section.end():]
    # Keep chart-specific interactions (year highlighting, histogram statistics).
    # Shared sizing is handled by assets/projects/msci/charts.js.
    scripts = [localize_script(match[0]) for match in re.finditer(r'<script\b[^>]*>.*?</script>', after, re.S)
               if 'const applyFinish' not in match[0]]
    styles = re.findall(r'<style\b[^>]*>.*?</style>', after, re.S)
    tall = ' chart-page-tall' if slug == 'heatmap' else ''
    return chart_page(slug, title, fragment, styles=''.join(styles), scripts=''.join(scripts),
                      body_class=f'chart-page{tall}', source=footer)


def data_date(source):
    """Last trading day in the daily closes of the ShowMeMSCI repository, as 16.10.2026."""
    last = (source / 'src/data/raw/MSCI_World_daily.csv').read_text(encoding='utf-8').rstrip().rsplit('\n', 1)[-1]
    year, month, day = last.split(',', 1)[0].split('-')
    return f'{day}.{month}.{year}'


def source_line(source):
    return f'MSCI World, USD · Datenstand: {data_date(source)} · Quelle: Yahoo Finance (^990100-USD-STRD)'


PLOTLY_HEAD = ('<script src="/assets/vendor/plotly-3.0.1.min.js"></script>\n'
               '  <script src="/assets/projects/msci/charts.js" defer></script>')


def chart_page(slug, title, main, *, source, styles='', scripts='', head=PLOTLY_HEAD, body_class='chart-page',
               main_class='chart-shell'):
    """Page around one MSCI chart; shared by the imported figures and scripts/msci_extra.py."""
    return f'''<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(title)} — Alexander Blinn</title>
  <link rel="canonical" href="https://alexanderblinn.com/img/projects/msci/{slug}.html">
  <link rel="icon" href="/assets/site/favicon.svg" type="image/svg+xml">
  {styles}
  <link rel="stylesheet" href="/assets/projects/msci/charts.css">
  <script>if (window.self !== window.top) document.documentElement.classList.add('embedded');</script>
  {head}
</head>
<body class="{body_class}">
  <header class="chart-heading">
    <a href="/projects/msci.html#{slug}">← Zum Projekt</a>
    <h1>{escape(title)}</h1>
  </header>
  <p id="chart-status" role="status">Diagramm wird geladen …</p>
  <noscript><p>Dieses interaktive Diagramm benötigt JavaScript.</p></noscript>
  <main class="{main_class}" aria-label="{escape(title)}">{main}</main>
  <footer class="chart-source">{source}</footer>
  {scripts}
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
    footer = source_line(source)
    pages = {slug: adapt_chart((source / 'img' / f'{slug}.html').read_text(encoding='utf-8'), slug, title, footer)
             for slug, title in CHARTS.items()}
    license_text = (source / 'LICENSE').read_text(encoding='utf-8')
    destination.mkdir(parents=True, exist_ok=True)
    for slug, html in pages.items():
        (destination / f'{slug}.html').write_text(html, encoding='utf-8')
    (destination / 'LICENSE.txt').write_text(license_text, encoding='utf-8')
    print(f'{len(pages)} Diagramme importiert: {destination}')


if __name__ == '__main__':
    main()
