"""MSCI charts of the journal itself, not part of ShowMeMSCI: drawdowns and a savings plan.

Usage: python scripts/msci_extra.py C:/path/to/msci
Reads the daily closes of ShowMeMSCI (src/data/raw/MSCI_World_daily.csv, read only) and, from
scripts/data/msci/, consumer prices and exchange rates (see read_fred, german_cpi, usd_per_eur).
Writes public/img/projects/msci/drawdown.html, sparplan.html and assets/projects/msci/sparplan-data.mjs and
prints the numbers quoted in content/projects/msci.md.
"""
import argparse
import csv
import datetime as dt
import json
from pathlib import Path
import re

from import_msci import ROOT, chart_page, data_date, source_line

DATA = ROOT / 'scripts/data/msci'
DM_PER_EURO = 1.95583
INK, MUTED, PAPER, NEGATIVE = '#28313A', '#5C6770', '#faf9f6', '#73515E'
DUMP = dict(ensure_ascii=False, separators=(',', ':'))


def read_closes(source):
    path = source / 'src/data/raw/MSCI_World_daily.csv'
    rows = list(csv.reader(path.open(encoding='utf-8')))[3:]  # header, ticker and date rows
    return [(dt.date.fromisoformat(row[0]), float(row[1])) for row in rows if row[1]]


def read_fred(name):
    """Monthly series downloaded from FRED (fredgraph.csv) as {'2025-10': value}. A month without a
    published value (October 2025 in the US CPI) is interpolated linearly."""
    rows = list(csv.reader((DATA / name).open(encoding='utf-8')))[1:]
    values = {}
    for i, (day, value) in enumerate(rows):
        values[day[:7]] = float(value) if value else (float(rows[i - 1][1]) + float(rows[i + 1][1])) / 2
    return values


def read_bundesbank(name):
    """Monthly series downloaded from the Bundesbank time series database (CSV, German format)."""
    values = {}
    for line in (DATA / name).open(encoding='utf-8-sig'):
        month, value = (line.strip().split(';') + ['', ''])[:2]
        if re.fullmatch(r'\d{4}-\d{2}', month) and value:
            values[month] = float(value.replace(',', '.'))
    return values


def us_cpi():
    """US consumer prices: CPI-U, not seasonally adjusted (BLS via FRED, CPIAUCNS)."""
    return read_fred('CPIAUCNS.csv')


def german_cpi():
    """German consumer prices: Destatis via the Bundesbank from 1991 (2020 = 100); before that the
    OECD series for West Germany (via FRED, DEUCPIALLMINMEI), chained in January 1991."""
    recent = read_bundesbank('VPI-Deutschland-Bundesbank.csv')
    older = read_fred('DEUCPIALLMINMEI.csv')
    factor = recent['1991-01'] / older['1991-01']
    return {**{month: value * factor for month, value in older.items() if month < '1991-01'}, **recent}


def usd_per_eur():
    """Monthly average exchange rates in US dollars per euro (FRED, EXUSEU); before 1999 from the
    D-Mark (EXGEUS) at the fixed conversion rate of 1.95583 D-Mark per euro."""
    dm = read_fred('EXGEUS.csv')
    euro = read_fred('EXUSEU.csv')
    return {**{month: DM_PER_EURO / value for month, value in dm.items() if month < '1999-01'}, **euro}


def german(value, digits=1):
    return f'{value:.{digits}f}'.replace('.', ',').replace('-', '−')


def drawdowns(closes):
    """Daily distance to the running maximum, and the episodes from one high to the next."""
    peak, peak_day = closes[0][1], closes[0][0]
    series, episodes, current = [], [], None
    for day, close in closes:
        if close >= peak:
            if current:
                current['recovery'] = day
                episodes.append(current)
                current = None
            peak, peak_day = close, day
        elif current is None or close / peak - 1 < current['depth']:
            current = current or {'peak': peak_day, 'recovery': None}
            current.update(trough=day, depth=close / peak - 1)
        series.append((day, close / peak - 1, peak_day))
    if current:
        episodes.append(current)
    return series, sorted(episodes, key=lambda episode: episode['depth'])


def drawdown_page(closes, footer):
    series, episodes = drawdowns(closes)
    # One point per week, the deepest day of that week, so that every trough survives.
    weeks = {}
    for day, depth, peak_day in series:
        key = day.isocalendar()[:2]
        if key not in weeks or depth < weeks[key][1]:
            weeks[key] = (day, depth, peak_day)
    points = [weeks[key] for key in sorted(weeks)]
    trace = {
        'type': 'scatter', 'mode': 'lines', 'fill': 'tozeroy',
        'x': [day.isoformat() for day, _, _ in points], 'y': [round(depth, 4) for _, depth, _ in points],
        'customdata': [peak.strftime('%d.%m.%Y') for _, _, peak in points],
        'line': {'color': NEGATIVE, 'width': 1.4}, 'fillcolor': 'rgba(115, 81, 94, 0.25)',
        'hovertemplate': '%{x|%d.%m.%Y}<br>%{y:.1%} unter dem<br>Höchststand vom %{customdata}<extra></extra>',
    }
    annotations = [{
        'x': episode['trough'].isoformat(), 'y': episode['depth'], 'yanchor': 'top', 'yshift': -6, 'showarrow': False,
        'text': f"{german(episode['depth'] * 100, 0)} %<br>{german((episode['recovery'] - episode['peak']).days / 365.25)} J.",
        'font': {'size': 12, 'color': INK},
    } for episode in episodes[:4]]
    axis = {'tickfont': {'size': 11, 'color': '#4C5660'}, 'fixedrange': True}
    layout = {
        'paper_bgcolor': PAPER, 'plot_bgcolor': PAPER, 'separators': ',.', 'showlegend': False, 'hovermode': 'closest',
        'margin': {'l': 44, 'r': 22, 't': 24, 'b': 48}, 'annotations': annotations,
        'xaxis': {**axis, 'type': 'date', 'tickformat': '%Y', 'hoverformat': '%d.%m.%Y', 'showgrid': False},
        'yaxis': {**axis, 'title': {'text': 'Abstand zum Höchststand', 'font': {'size': 12, 'color': MUTED}},
                  'tickformat': '.0%', 'range': [-0.74, 0.02], 'gridcolor': 'rgba(35, 48, 59, 0.07)',
                  'zeroline': True, 'zerolinecolor': 'rgba(35, 48, 59, 0.22)'},
    }
    config = {'displayModeBar': False, 'responsive': True, 'scrollZoom': False, 'doubleClick': 'reset'}
    fragment = ('<div id="chart" class="plotly-graph-div" style="height:100%; width:100%;"></div>\n'
                f'  <script>Plotly.newPlot("chart", {json.dumps([trace], **DUMP)}, {json.dumps(layout, **DUMP)}, '
                f'{json.dumps(config, **DUMP)});</script>')
    return chart_page('drawdown', 'MSCI World: Abstand zum Höchststand', fragment, source=footer), episodes


PLAN = '''
  <form class="plan-controls" onsubmit="return false">
    <label for="plan-start">Startjahr (ab Januar)<select id="plan-start"></select></label>
    <label for="plan-years">Dauer <output id="plan-years-value">20 Jahre</output><input id="plan-years" type="range" min="1" max="54" value="20"></label>
    <div class="plan-view" role="radiogroup" aria-label="Ansicht">
      <label><input type="radio" name="plan-view" id="plan-nominal" value="nominal" checked> nominal ($)</label>
      <label><input type="radio" name="plan-view" id="plan-real" value="real"> real, USA ($)</label>
      <label><input type="radio" name="plan-view" id="plan-real-de" value="real-de"> real, Deutschland (€)</label>
    </div>
  </form>
  <div class="plan-readouts" aria-live="polite">
    <div><span id="plan-paid-label">Eingezahlt, 100 $ im Monat</span><output id="plan-paid">—</output></div>
    <div><span>Sparplan am Ende</span><output id="plan-end">—</output><small id="plan-rate">—</small></div>
    <div><span>Einmalanlage derselben Summe</span><output id="plan-lump">—</output><small id="plan-lump-rate">—</small></div>
  </div>
  <div id="plan-chart"></div>
'''


def plan_page(stand):
    head = ('<link rel="stylesheet" href="/assets/projects/msci/sparplan.css">\n'
            '  <script src="/assets/vendor/plotly-3.0.1.min.js"></script>\n'
            '  <script type="module" src="/assets/projects/msci/sparplan.mjs"></script>')
    source = (f'MSCI World, Preisindex ohne Dividenden, USD · Datenstand: {stand} · Quellen: Yahoo Finance '
              '(^990100-USD-STRD), US-Verbraucherpreise des BLS über FRED (CPIAUCNS), deutsche Verbraucherpreise '
              'von Destatis über die Bundesbank (vor 1991 OECD, Westdeutschland), Wechselkurse über FRED (EXUSEU, EXGEUS)')
    return chart_page('sparplan', 'MSCI World: Sparplan', PLAN, head=head, main_class='plan-shell', source=source)


def plan_data(closes, cpi, cpi_de, fx):
    """Month-end closes, consumer prices and exchange rates; an unfinished last month and months
    without prices or rates yet are left out."""
    month_end = {}
    for day, close in closes:
        month_end[f'{day.year}-{day.month:02d}'] = close
    last_day = closes[-1][0]
    if (last_day + dt.timedelta(days=1)).month == last_day.month:
        month_end.pop(f'{last_day.year}-{last_day.month:02d}')
    months = [m for m in sorted(month_end) if m in cpi and m in cpi_de and m in fx]
    return (
        '// Generated by scripts/msci_extra.py for the savings plan on the MSCI page: month-end closes of\n'
        '// the MSCI World price index in USD (ShowMeMSCI, Yahoo Finance ^990100-USD-STRD), US consumer\n'
        '// prices (CPI-U, BLS via FRED), German consumer prices (Destatis via Bundesbank, before 1991 OECD\n'
        '// West Germany) and monthly average US dollars per euro (FRED, before 1999 via the D-Mark).\n'
        f'export const MONTHS = {json.dumps(months, **DUMP)};\n'
        f'export const CLOSE = {json.dumps([round(month_end[m], 2) for m in months], **DUMP)};\n'
        f'export const CPI = {json.dumps([cpi[m] for m in months], **DUMP)};\n'
        f'export const CPI_DE = {json.dumps([round(cpi_de[m], 3) for m in months], **DUMP)};\n'
        f'export const USD_PER_EUR = {json.dumps([round(fx[m], 4) for m in months], **DUMP)};\n'
    ), months[-1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Pfad zum ShowMeMSCI-Repository')
    source = parser.parse_args().source.resolve()
    closes, cpi, cpi_de, fx = read_closes(source), us_cpi(), german_cpi(), usd_per_eur()
    page, episodes = drawdown_page(closes, source_line(source))
    data, last_month = plan_data(closes, cpi, cpi_de, fx)
    (ROOT / 'public/img/projects/msci/drawdown.html').write_text(page, encoding='utf-8')
    (ROOT / 'public/img/projects/msci/sparplan.html').write_text(plan_page(data_date(source)), encoding='utf-8')
    (ROOT / 'assets/projects/msci/sparplan-data.mjs').write_text(data, encoding='utf-8')

    # Numbers quoted in the text: growth from the end of 1972 to the end of 2025.
    year_end = {day.year: close for day, close in closes}
    years = 2025 - 1972
    nominal = (year_end[2025] / year_end[1972]) ** (1 / years) - 1
    inflation = (cpi['2025-12'] / cpi['1972-12']) ** (1 / years) - 1
    print(f'Preisindex Ende 1972 bis Ende 2025: {nominal:.2%} p. a. nominal, Inflation {inflation:.2%} p. a., '
          f'real {(1 + nominal) / (1 + inflation) - 1:.2%} p. a.')
    # The same in euros (December average exchange rate) and German purchasing power.
    euro = {year: year_end[year] / fx[f'{year}-12'] for year in (1972, 2025)}
    nominal_eur = (euro[2025] / euro[1972]) ** (1 / years) - 1
    inflation_de = (cpi_de['2025-12'] / cpi_de['1972-12']) ** (1 / years) - 1
    real_de = (1 + nominal_eur) / (1 + inflation_de) - 1
    print(f'In Euro: {nominal_eur:.2%} p. a. nominal (Faktor {euro[2025] / euro[1972]:.1f}), Inflation Deutschland '
          f'{inflation_de:.2%} p. a. (Faktor {cpi_de["2025-12"] / cpi_de["1972-12"]:.2f}), real {real_de:.2%} p. a. '
          f'(Faktor {(1 + real_de) ** years:.2f}); Dollar je Euro Ende 1972 {fx["1972-12"]:.3f}, Ende 2025 {fx["2025-12"]:.3f}')
    print(f'USA: Faktor nominal {year_end[2025] / year_end[1972]:.1f}, Preise {cpi["2025-12"] / cpi["1972-12"]:.2f}, '
          f'real {(year_end[2025] / year_end[1972]) / (cpi["2025-12"] / cpi["1972-12"]):.2f}')
    for episode in episodes[:6]:
        recovery = episode['recovery']
        print(f"Drawdown {episode['depth']:.1%}: Hoch {episode['peak']}, Tief {episode['trough']}, wieder erreicht {recovery} "
              f"({(recovery - episode['peak']).days / 365.25:.1f} Jahre)" if recovery else f"Drawdown {episode['depth']:.1%} (offen)")
    print(f'Sparplan-Daten bis {last_month}; Diagramm und Daten geschrieben.')


if __name__ == '__main__':
    main()
