// Charts of the Fission or Fiction project, computed in the browser from units-data.mjs.
// Every chart page loads this module; <body data-chart="..."> selects the figure.
import * as F from './fleet.mjs';
import { COUNTRIES, REGIONS } from './countries.mjs';

const $ = id => document.getElementById(id);
const PAPER = '#faf9f6', INK = '#252525', MUTED = '#65635d';
const FONT = { family: '"Courier New", Courier, monospace', size: 13, color: INK };
const CONFIG = { displayModeBar: false, responsive: true };
const AXIS = { tickfont: { size: 12 }, gridcolor: 'rgba(35, 48, 59, 0.08)', zeroline: false, fixedrange: true, automargin: true };
const title = text => ({ text, font: { size: 12, color: MUTED } });
// Colour scale of the original age chart and Plotly's "matter" scale of the original map.
const AGE_SCALE = ['#000000', '#001f4d', '#003786', '#0e58a8', '#217eb8', '#30a4ca', '#54c8df', '#9be4ef', '#e1e9d1',
  '#f3d573', '#e7b000', '#da8200', '#c65400', '#ac2301', '#820000', '#4c0000', '#000000'].map((c, i, all) => [i / (all.length - 1), c]);
const MATTER = ['#fdedb0', '#facd91', '#f6ad77', '#f08e62', '#e76d54', '#d85053', '#c3385a', '#a82860', '#8a1d63',
  '#6b185d', '#4c1550', '#2f0f3d'].map((c, i, all) => [i / (all.length - 1), c]);

const number = (x, digits = 0) => x.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const name = country => COUNTRIES[country].name;
const unitLabel = u => [u.name, u.unit].filter(Boolean).join(' ');
const monthYear = iso => (iso.length >= 7 ? `${iso.slice(5, 7)}/${iso.slice(0, 4)}` : iso.slice(0, 4));
const inRegion = (country, region) => !region || COUNTRIES[country].region === region;
const narrow = () => $('chart').clientWidth < 600;
// "Stand 08/2026": the data date in labels.
const STAND_LABEL = `Stand ${F.STAND.slice(5, 7)}/${F.STAND.slice(0, 4)}`;
const escapeHtml = text => text.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const years = x => `${number(x, 1)} Jahre`;
const yearsDative = x => `${number(x, 1)} Jahren`;
const blockLabel = u => (u.unit ? `Block ${u.unit}` : 'Block');

// Status of a unit with its years of operation, as far as they apply.
function statusLine(u) {
  const d = u.dates, expected = u.expected ? `, Inbetriebnahme geplant ${u.expected}` : '';
  switch (u.status) {
    case 'operating': return `in Betrieb seit ${monthYear(d.cod)} (${years(F.STAND_YEAR - u.cod)})`;
    case 'mothballed':
      if (u.restart) return `abgeschaltet, Wiederinbetriebnahme vorbereitet${expected} (am Netz ab ${monthYear(d.grid)})`;
      return u.cod === null ? 'ruhend, nie in Betrieb' : `abgeschaltet, nicht stillgelegt (in Betrieb ab ${monthYear(d.cod)})`;
    case 'retired': return `stillgelegt ${monthYear(d.retired)}` + (u.cod === null ? '' : ` nach ${yearsDative(u.retired - u.cod)} Betrieb`);
    case 'construction': return `im Bau${expected}`;
    case 'pre-construction': return `in Vorbereitung${expected}`;
    case 'announced': return `angekündigt${expected}`;
    case 'shelved': return 'zurückgestellt';
    case 'shelved - inferred 2 y': return 'vermutlich zurückgestellt (über zwei Jahre ohne Fortschritt)';
    case 'cancelled - inferred 4 y': return 'vermutlich aufgegeben (über vier Jahre ohne Fortschritt)';
    default: return u.cancelled ? `aufgegeben ${u.cancelled}` : 'aufgegeben';
  }
}

// Construction start and build time; planned dates of announced projects are left out.
function buildLine(u) {
  const d = u.dates;
  if (u.start === null) return null;
  const end = F.BUILT.has(u.status) ? (u.grid ?? u.cod) : null;
  if (end !== null && end > u.start && end <= F.STAND_YEAR) {
    return `Bauzeit ${years(end - u.start)}: Baubeginn ${monthYear(d.start)}, ${d.grid ? 'am Netz' : 'in Betrieb'} ${monthYear(d.grid ?? d.cod)}`;
  }
  if (u.status === 'construction') return `Baubeginn ${monthYear(d.start)}, seit ${yearsDative(F.STAND_YEAR - u.start)} im Bau`;
  return u.status === 'announced' || u.status === 'pre-construction' ? null : `Baubeginn ${monthYear(d.start)}`;
}

// All details of one unit as lines of escaped HTML: status, construction, design, owner.
function unitDetails(u) {
  const owner = u.owner && u.owner === u.operator
    ? [`Eigentümer und Betreiber: ${u.owner}`]
    : [u.owner && `Eigentümer: ${u.owner}`, u.operator && `Betreiber: ${u.operator}`];
  const design = u.type && u.model ? `${u.type} (${u.model})` : u.type ?? u.model;
  return [statusLine(u), buildLine(u), design, ...owner].filter(Boolean).map(escapeHtml).join('<br>');
}

function layout(extra) {
  return {
    font: FONT, paper_bgcolor: PAPER, plot_bgcolor: PAPER, separators: ',.',
    margin: { l: 8, r: 8, t: 8, b: 8 },
    hoverlabel: { bgcolor: PAPER, bordercolor: '#bebbb3', font: { ...FONT, size: 12 }, align: 'left' },
    ...extra,
  };
}

function plot(traces, lay) {
  return Plotly.react($('chart'), traces, lay, CONFIG).then(() => { $('chart-status').hidden = true; });
}

// Legend below the plot with fixed column widths; on narrow screens the countries stay in the hover only.
const countryLegend = { orientation: 'h', x: 0, xanchor: 'left', y: -0.07, yanchor: 'top', entrywidth: 96,
  entrywidthmode: 'pixels', font: { size: 11 }, traceorder: 'normal', itemsizing: 'constant', itemdoubleclick: 'toggleothers' };

function regionControl(render) {
  const options = [['', 'Welt'], ...Object.entries(REGIONS)];
  $('chart-controls').innerHTML = `<fieldset><legend>Region</legend>${options.map(([value, label], i) =>
    `<label><input type="radio" name="region" value="${value}"${i ? '' : ' checked'}>${label}</label>`).join('')}</fieldset>`;
  const region = () => $('chart-controls').elements.region.value;
  $('chart-controls').addEventListener('change', () => render(region()));
  rerenderOnWidth(() => render(region()));
  render('');
}

// Some charts change their layout below 600 px (legend, labels); redraw when that boundary is crossed.
function rerenderOnWidth(render) {
  let small = narrow();
  new ResizeObserver(() => { if (narrow() !== small) { small = narrow(); render(); } }).observe($('chart'));
}

function countChart() {
  const fleet = F.fleetSeries();
  regionControl(region => {
    const countries = Object.keys(fleet).filter(c => inRegion(c, region)).sort(F.byName);
    const traces = countries.map(c => ({
      type: 'bar', name: name(c), x: F.YEARS, y: fleet[c].count.map(v => v || null), customdata: fleet[c].age,
      marker: { color: fleet[c].age.map(a => a ?? 0), coloraxis: 'coloraxis', line: { width: 0 } },
      hovertemplate: `<b>${name(c)}</b> %{x}<br>%{y} Reaktoren, im Mittel %{customdata:.1f} Jahre alt<extra></extra>`,
    }));
    const total = F.YEARS.map((_, i) => countries.reduce((sum, c) => sum + fleet[c].count[i], 0));
    const age = F.YEARS.map((_, i) => (total[i]
      ? countries.reduce((sum, c) => sum + (fleet[c].age[i] ?? 0) * fleet[c].count[i], 0) / total[i] : null));
    traces.push({
      type: 'scatter', mode: 'lines', name: 'mittleres Alter', x: F.YEARS, y: age, yaxis: 'y2', customdata: total,
      line: { color: INK, width: 2, dash: 'dot' },
      hovertemplate: `<b>${region ? REGIONS[region] : 'Welt'}</b> %{x}<br>%{customdata} Reaktoren, im Mittel %{y:.1f} Jahre alt<extra></extra>`,
    });
    return plot(traces, layout({
      barmode: 'stack', bargap: 0.12, showlegend: false, hovermode: 'closest',
      xaxis: { ...AXIS },
      yaxis: { ...AXIS, title: title('Reaktoren in Betrieb'), rangemode: 'tozero' },
      yaxis2: { ...AXIS, overlaying: 'y', side: 'right', range: [0, 50], showgrid: false, title: title('mittleres Alter, Linie') },
      coloraxis: {
        cmin: 0, cmax: 50, colorscale: AGE_SCALE,
        colorbar: { orientation: 'h', x: 0.02, xanchor: 'left', y: 0.97, yanchor: 'top', len: narrow() ? 0.5 : 0.3, thickness: 10,
          title: { text: 'mittleres Alter je Land', side: 'top', font: { size: 11 } }, tickfont: { size: 11 }, outlinewidth: 0 },
      },
    }));
  });
}

function capacityChart() {
  const fleet = F.fleetSeries();
  regionControl(region => {
    const countries = Object.keys(fleet).filter(c => inRegion(c, region)).sort(F.byName);
    const traces = countries.map(c => ({
      type: 'bar', name: name(c), x: F.YEARS, y: fleet[c].gw.map(v => v || null), showlegend: !narrow(),
      marker: { color: COUNTRIES[c].color, line: { width: 0 } },
      hovertemplate: `<b>${name(c)}</b> %{x}<br>%{y:.1f} GW<extra></extra>`,
    }));
    return plot(traces, layout({
      barmode: 'stack', bargap: 0.12, hovermode: 'closest', legend: countryLegend,
      xaxis: { ...AXIS }, yaxis: { ...AXIS, title: title('Leistung in Betrieb in GW'), rangemode: 'tozero' },
    }));
  });
}

function constructionChart() {
  const series = F.constructionSeries();
  const cross = { shape: 'x', size: 6, fgcolor: PAPER, fgopacity: 1 };
  regionControl(region => {
    const countries = Object.keys(series).filter(c => inRegion(c, region)).sort(F.byName);
    const building = countries.map(c => ({
      type: 'bar', name: name(c), legendgroup: c, showlegend: !narrow(), x: F.YEARS, y: series[c].building.map(v => v || null),
      marker: { color: COUNTRIES[c].color, line: { width: 0 } },
      hovertemplate: `<b>${name(c)}</b> %{x}<br>%{y} im Bau<extra></extra>`,
    }));
    // Abandoned projects come last and so sit on top of every bar, where the crossed band stays visible.
    const abandoned = countries.map(c => ({
      type: 'bar', name: name(c), legendgroup: c, showlegend: false, x: F.YEARS, y: series[c].abandoned.map(v => v || null),
      marker: { color: COUNTRIES[c].color, line: { width: 0 }, pattern: { ...cross, bgcolor: COUNTRIES[c].color } },
      hovertemplate: `<b>${name(c)}</b> %{x}<br>%{y} im Bau, später aufgegeben<extra></extra>`,
    }));
    const traces = [...building, ...abandoned];
    if (!$('pattern-key')) $('chart-controls').insertAdjacentHTML('beforeend',
      '<span id="pattern-key"><span class="cross" aria-hidden="true"></span>gekreuzt: später aufgegeben</span>');
    return plot(traces, layout({
      barmode: 'stack', bargap: 0.12, hovermode: 'closest', legend: countryLegend,
      xaxis: { ...AXIS }, yaxis: { ...AXIS, title: title('Reaktoren im Bau'), rangemode: 'tozero' },
    }));
  });
}

const ACCIDENTS = [['Harrisburg', '1979-03-28', 'right'], ['Tschernobyl', '1986-04-26', 'left'], ['Fukushima', '2011-03-11', 'center']];

// Card with all details of a clicked unit, in the upper right corner of the chart.
function detailCard() {
  const card = document.createElement('aside');
  card.className = 'detail-card';
  card.hidden = true;
  card.setAttribute('aria-live', 'polite');
  document.querySelector('.chart-shell').append(card);
  const hide = () => { card.hidden = true; };
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  return u => {
    card.innerHTML = `<button type="button" class="detail-close" aria-label="Details schließen">×</button>
      <h2>${escapeHtml(unitLabel(u))}</h2><small>${escapeHtml([u.area, name(u.country)].filter(Boolean).join(', '))}</small>
      <p><b>${number(u.mw)} MW</b><br>${unitDetails(u)}</p>`;
    card.querySelector('button').addEventListener('click', hide);
    card.hidden = false;
  };
}

// Points show a short hover text and open the detail card on click; the cursor marks them as clickable.
function clickableUnits(show) {
  const chart = $('chart');
  chart.on('plotly_click', event => { const point = event.points[0]; if (point.customdata != null) show(F.units[point.customdata]); });
  chart.on('plotly_hover', () => { chart.querySelector('.nsewdrag')?.style.setProperty('cursor', 'pointer'); });
  chart.on('plotly_unhover', () => { chart.querySelector('.nsewdrag')?.style.removeProperty('cursor'); });
}

function commissioningChart() {
  const operating = F.units.filter(u => u.status === 'operating' && u.cod !== null);
  const retired = F.units.filter(u => u.status === 'retired' && u.retired !== null);
  const index = new Map(F.units.map((u, i) => [u, i]));
  const size = u => Math.max(6, Math.log10(u.mw / 1000 + 1) * 42);
  const show = detailCard();
  let bound = false;
  regionControl(region => {
    const countries = [...new Set([...operating, ...retired].map(u => u.country))].filter(c => inRegion(c, region)).sort(F.byName);
    const traces = [];
    for (const c of countries) {
      const marker = list => ({ color: COUNTRIES[c].color, size: list.map(size), opacity: 0.75, line: { color: PAPER, width: 0.6 } });
      const base = { type: 'scatter', mode: 'markers', name: name(c), legendgroup: c, hovertemplate: '%{text}<extra></extra>' };
      const running = operating.filter(u => u.country === c), closed = retired.filter(u => u.country === c);
      if (running.length) traces.push({
        ...base, showlegend: !narrow(), marker: marker(running), customdata: running.map(u => index.get(u)),
        x: running.map(u => u.cod), y: running.map(u => F.STAND_YEAR - u.cod),
        text: running.map(u => `<b>${unitLabel(u)}</b> (${name(c)})<br>in Betrieb seit ${monthYear(u.dates.cod)}`),
      });
      if (closed.length) traces.push({
        ...base, showlegend: !narrow() && !running.length, marker: marker(closed), customdata: closed.map(u => index.get(u)),
        x: closed.map(u => u.retired), y: closed.map(u => (u.cod === null ? 0 : u.cod - u.retired)),
        text: closed.map(u => `<b>${unitLabel(u)}</b> (${name(c)})<br>stillgelegt ${monthYear(u.dates.retired)}`),
      });
    }
    const small = narrow();
    // Narrow: names without years, Fukushima one line lower, so that the labels do not overlap.
    const accidents = ACCIDENTS.map(([label, date, side]) => ({
      x: F.decimalYear(date), label: small ? label : `${label} ${date.slice(0, 4)}`, side,
      yshift: small && label === 'Fukushima' ? -16 : 0,
    }));
    return plot(traces, layout({
      hovermode: 'closest', legend: countryLegend,
      xaxis: { ...AXIS, range: [1954, F.LAST_YEAR + 1.5], dtick: 10 },
      yaxis: { ...AXIS, title: title('Alter in Jahren'), range: [-64, 64], tickvals: [-60, -40, -20, 0, 20, 40, 60],
               ticktext: ['60', '40', '20', '0', '20', '40', '60'] },
      shapes: [
        { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 0, y1: 0, line: { color: INK, width: 1 } },
        ...accidents.map(a => ({ type: 'line', x0: a.x, x1: a.x, yref: 'paper', y0: 0, y1: 1, line: { color: MUTED, width: 1, dash: 'dot' } })),
      ],
      annotations: [
        ...accidents.map(a => ({ x: a.x, xanchor: a.side, xshift: { right: -3, left: 3, center: 0 }[a.side], yshift: a.yshift, y: 1, yref: 'paper',
          yanchor: 'top', text: a.label, showarrow: false, font: { size: small ? 10 : 11, color: MUTED }, bgcolor: 'rgba(250, 249, 246, 0.85)' })),
        { x: 0.01, xref: 'paper', xanchor: 'left', y: 0.52, yref: 'paper', yanchor: 'bottom', showarrow: false, align: 'left',
          text: '↑ in Betrieb: Alter heute', font: { size: 11, color: MUTED } },
        { x: 0.01, xref: 'paper', xanchor: 'left', y: 0.48, yref: 'paper', yanchor: 'top', showarrow: false, align: 'left',
          text: '↓ stillgelegt: Betriebsdauer', font: { size: 11, color: MUTED } },
      ],
    })).then(() => {
      if (!bound) { bound = true; clickableUnits(show); }
    });
  });
}

function buildtimeChart() {
  const points = F.buildTimes();
  const legendOnly = (name, marker) => ({ type: 'scatter', mode: 'markers', x: [null], y: [null], name, marker, hoverinfo: 'skip' });
  regionControl(region => {
    const selected = points.filter(p => inRegion(p.u.country, region));
    const text = p => `<b>${unitLabel(p.u)}</b> (${name(p.u.country)})<br>Baubeginn ${monthYear(p.u.dates.start)}<br>` + (p.done
      ? `${p.u.dates.grid ? 'am Netz' : 'in Betrieb'} ${monthYear(p.u.dates.grid ?? p.u.dates.cod)}: ${number(p.years, 1)} Jahre`
      : `noch im Bau, bisher ${number(p.years, 1)} Jahre`);
    const series = (list, extra) => ({
      type: 'scatter', mode: 'markers', showlegend: false, x: list.map(p => p.u.start), y: list.map(p => p.years),
      text: list.map(text), hovertemplate: '%{text}<extra></extra>', ...extra,
    });
    const done = selected.filter(p => p.done), open = selected.filter(p => !p.done);
    const medians = F.medianBuildTime(selected).filter(m => m.n >= 5);
    const traces = [
      series(done, { marker: { size: 7, opacity: 0.7, color: done.map(p => COUNTRIES[p.u.country].color), line: { color: PAPER, width: 0.5 } } }),
      series(open, { marker: { size: 9, symbol: 'circle-open', color: open.map(p => COUNTRIES[p.u.country].color), line: { width: 2 } } }),
      {
        type: 'scatter', mode: 'lines', name: 'Median je fünf Jahre Baubeginn', line: { color: INK, width: 2.5 },
        x: medians.flatMap(m => [m.from, m.to, null]), y: medians.flatMap(m => [m.median, m.median, null]),
        customdata: medians.flatMap(m => [[m.from, m.to - 1, m.n], [m.from, m.to - 1, m.n], null]),
        hovertemplate: 'Baubeginn %{customdata[0]}–%{customdata[1]}<br>Median %{y:.1f} Jahre (%{customdata[2]} Blöcke)<extra></extra>',
      },
      legendOnly('fertiggestellt', { size: 8, color: '#9a978f' }),
      legendOnly('noch im Bau (bisherige Dauer)', { size: 9, symbol: 'circle-open', color: '#9a978f', line: { width: 2 } }),
    ];
    return plot(traces, layout({
      hovermode: 'closest',
      legend: { orientation: 'h', x: 0, xanchor: 'left', y: 1.01, yanchor: 'bottom', font: { size: 11 } },
      xaxis: { ...AXIS, title: title('Baubeginn'), range: [1950, F.LAST_YEAR + 1], dtick: 10 },
      yaxis: { ...AXIS, title: title('Bauzeit in Jahren'), range: [0, 45], dtick: 5 },
    }));
  });
}

const LAT = [-56, 80], LON = [-130, 180];

function evolutionChart() {
  const years = new Map(F.YEARS.map(y => [y, F.mapYear(y)]));
  const zmax = Math.max(...[...years.values()].flatMap(d => Object.values(d.countries).map(c => c.gw)));
  $('chart-controls').innerHTML = `
    <button type="button" id="play" aria-pressed="false">▶ Abspielen</button>
    <label for="year">Jahr <input type="range" id="year" min="${F.FIRST_YEAR}" max="${F.LAST_YEAR}" value="${F.LAST_YEAR}"></label>
    <output id="year-value" for="year">${F.LAST_YEAR}</output>`;
  $('chart-readouts').innerHTML = `
    <div><span>Reaktoren in Betrieb</span><output id="r-count"></output></div>
    <div><span>Leistung</span><output id="r-gw"></output></div>
    <div><span>Länder</span><output id="r-countries"></output></div>`;
  function draw() {
    const y = Number($('year').value);
    const { countries, sites } = years.get(y);
    const keys = Object.keys(countries).sort(F.byName);
    const count = keys.reduce((sum, c) => sum + countries[c].count, 0);
    const gw = keys.reduce((sum, c) => sum + countries[c].gw, 0);
    $('year-value').value = y === F.LAST_YEAR ? STAND_LABEL : `Ende ${y}`;
    $('r-count').value = number(count);
    $('r-gw').value = `${number(gw, 1)} GW`;
    $('r-countries').value = number(keys.length);
    return plot([
      {
        type: 'choropleth', locationmode: 'ISO-3', locations: keys.map(c => COUNTRIES[c].iso), z: keys.map(c => countries[c].gw),
        zmin: 0, zmax, colorscale: MATTER, marker: { line: { color: '#6b6b6b', width: 0.4 } },
        customdata: keys.map(c => [name(c), countries[c].count]),
        hovertemplate: '<b>%{customdata[0]}</b><br>%{customdata[1]} Reaktoren, %{z:.1f} GW<extra></extra>',
        // Wide: colour bar in the empty ocean south of Africa and Australia; narrow: below the map.
        colorbar: { orientation: 'h', thickness: 8, outlinewidth: 0, tickfont: { size: 11 },
          title: { text: 'Leistung je Land in GW', side: 'top', font: { size: 11 } },
          ...(narrow() ? { x: 0.5, xanchor: 'center', y: 0, yanchor: 'top', len: 0.8 }
            : { x: 0.5, xanchor: 'left', y: 0.02, yanchor: 'bottom', len: 0.26 }) },
      },
      {
        type: 'scattergeo', mode: 'markers', lat: sites.map(s => s.lat), lon: sites.map(s => s.lon),
        marker: { size: narrow() ? 4 : 6, color: INK, opacity: 0.55, line: { color: PAPER, width: 0.5 } },
        customdata: sites.map(s => [s.name, name(s.country), s.count, s.gw]),
        hovertemplate: '<b>%{customdata[0]}</b> (%{customdata[1]})<br>%{customdata[2]} Reaktoren, %{customdata[3]:.2f} GW<extra></extra>',
      },
    ], layout({
      showlegend: false, margin: { l: 0, r: 0, t: 0, b: 0 },
      geo: { projection: { type: 'equirectangular' }, showframe: false, showcoastlines: true, coastlinecolor: '#6b6b6b',
             coastlinewidth: 0.5, showcountries: true, countrycolor: '#8a8a8a', countrywidth: 0.4, showland: false,
             showocean: true, oceancolor: '#ced9ef', bgcolor: PAPER, lataxis: { range: LAT }, lonaxis: { range: LON } },
    })).then(fit);
  }
  // The map fills the full width: from the American west coast (Alaska and Hawaii have no reactors)
  // to the date line and from 56° S to 80° N. Plotly fits this box with great-circle edges, so the
  // drawn map is a little taller than the box; its aspect ratio is measured after every drawing and
  // sets the height, plus room for the colour bar below on narrow screens. Embedded, the frame takes
  // the height of the page.
  let aspect = 2.15;
  function fit() {
    const map = $('chart').querySelector('g.geo')?.getBoundingClientRect();
    if (map && map.width > 0 && map.height > 0) aspect = map.width / map.height;
    const height = Math.round($('chart').clientWidth / aspect) + (narrow() ? 62 : 0);
    if (Math.abs($('chart').getBoundingClientRect().height - height) > 1) $('chart').style.height = `${height}px`;
    if (window.frameElement) window.frameElement.style.height = `${Math.ceil(document.body.getBoundingClientRect().height)}px`;
  }
  new ResizeObserver(fit).observe(document.body);
  let timer = null;
  const stop = () => { clearInterval(timer); timer = null; $('play').textContent = '▶ Abspielen'; $('play').setAttribute('aria-pressed', 'false'); };
  $('play').addEventListener('click', () => {
    if (timer) return stop();
    if (Number($('year').value) === F.LAST_YEAR) $('year').value = F.FIRST_YEAR;
    $('play').textContent = '❚❚ Anhalten';
    $('play').setAttribute('aria-pressed', 'true');
    draw();
    timer = setInterval(() => {
      const next = Number($('year').value) + 1;
      if (next > F.LAST_YEAR) return stop();
      $('year').value = next;
      draw();
    }, 350);
  });
  $('year').addEventListener('input', () => { stop(); draw(); });
  rerenderOnWidth(draw);
  draw();
}

const REGION_COLORS = { Americas: '#456674', Europe: '#B59B74', Asia: '#A07A72', Africa: '#7d8f69' };

function outlookChart() {
  $('chart-controls').innerHTML = `
    <label for="life">Laufzeit <input type="range" id="life" min="40" max="80" step="5" value="60"></label>
    <output id="life-value" for="life"></output>
    <label><input type="checkbox" id="building" checked> Reaktoren im Bau einrechnen</label>`;
  $('chart-readouts').innerHTML = `
    <div><span>${STAND_LABEL}</span><output id="r-now"></output></div>
    <div><span>Anfang 2035</span><output id="r-2035"></output></div>
    <div><span>Anfang 2050</span><output id="r-2050"></output></div>
    <div><span>Hälfte der heutigen Leistung vom Netz</span><output id="r-half"></output></div>`;
  function draw() {
    const lifetime = Number($('life').value), construction = $('building').checked;
    const s = F.scenario(lifetime, { construction });
    const now = s.total[0];
    const at = year => s.total[s.times.indexOf(year)];
    const change = year => `${number(at(year))} GW (${at(year) >= now ? '+' : '−'}${number(Math.abs(at(year) / now - 1) * 100)} %)`;
    const existing = s.times.map((_, i) => Object.values(s.regions).reduce((sum, r) => sum + r[i], 0));
    const half = s.times.find((t, i) => existing[i] < existing[0] / 2);
    $('life-value').value = `${lifetime} Jahre`;
    $('r-now').value = `${number(now)} GW`;
    $('r-2035').value = change(2035);
    $('r-2050').value = change(2050);
    $('r-half').value = half ? `bis ${half - 1}` : `nach ${F.SCENARIO_YEARS.at(-1)}`;
    const area = (name, y, color, extra = {}) => ({
      type: 'scatter', mode: 'lines', stackgroup: 'fleet', name, x: s.times, y, line: { width: 0.5, color },
      fillcolor: color, hovertemplate: `${name}: %{y:.0f} GW<extra></extra>`, ...extra,
    });
    const traces = Object.keys(REGIONS).filter(r => s.regions[r]).map(r => area(REGIONS[r], s.regions[r], REGION_COLORS[r]));
    if (construction) traces.push(area('Reaktoren im Bau', s.building, '#c8553d',
      { fillpattern: { shape: '/', bgcolor: '#c8553d', fgcolor: PAPER, size: 7, solidity: 0.25 } }));
    return plot(traces, layout({
      hovermode: 'x unified',
      legend: { orientation: 'h', x: 0, xanchor: 'left', y: 1.01, yanchor: 'bottom', font: { size: 11 }, traceorder: 'normal' },
      xaxis: { ...AXIS, range: [F.STAND_YEAR, 2080], dtick: 10, hoverformat: '.0f' },
      yaxis: { ...AXIS, title: title('Leistung in GW'), rangemode: 'tozero', range: [0, 520] },
      shapes: [{ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: now, y1: now, line: { color: INK, width: 1, dash: 'dash' } }],
      annotations: [{ xref: 'paper', x: 1, xanchor: 'right', y: now, yanchor: 'bottom', showarrow: false,
                      text: `Leistung ${STAND_LABEL}`, font: { size: 11, color: MUTED } }],
    }));
  }
  for (const id of ['life', 'building']) $(id).addEventListener('input', draw);
  draw();
}

// Location map: one pie marker per site, split by the status of its units.
const GROUPS = [
  { label: 'in Betrieb', color: '#239b56', statuses: ['operating'], shown: true },
  { label: 'abgeschaltet', color: '#e67e22', statuses: ['mothballed'], shown: true },
  { label: 'im Bau', color: '#2471a3', statuses: ['construction'], shown: true },
  { label: 'geplant', color: '#8e44ad', statuses: ['announced', 'pre-construction'] },
  { label: 'stillgelegt', color: '#5d6d7e', statuses: ['retired'] },
  { label: 'aufgegeben oder zurückgestellt', color: '#cb4335', statuses: ['cancelled', 'cancelled - inferred 4 y', 'shelved', 'shelved - inferred 2 y'] },
];
const groupOf = u => GROUPS.findIndex(g => g.statuses.includes(u.status));
// "2 in Betrieb, 1 stillgelegt"
const statusSummary = list => GROUPS.map((g, i) => [g.label, list.filter(u => groupOf(u) === i).length])
  .filter(([, n]) => n).map(([label, n]) => `${n} ${label}`).join(', ');

function pie(shares, size) {
  const r = size / 2, total = shares.reduce((sum, [, n]) => sum + n, 0);
  let angle = -Math.PI / 2;
  const point = a => `${(r + r * Math.cos(a)).toFixed(2)} ${(r + r * Math.sin(a)).toFixed(2)}`;
  const slices = shares.length === 1
    ? `<circle cx="${r}" cy="${r}" r="${r}" fill="${shares[0][0]}"/>`
    : shares.map(([color, n]) => {
      const end = angle + (n / total) * 2 * Math.PI;
      const path = `<path d="M${r} ${r}L${point(angle)}A${r} ${r} 0 ${end - angle > Math.PI ? 1 : 0} 1 ${point(end)}Z" fill="${color}"/>`;
      angle = end;
      return path;
    }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${slices}<circle cx="${r}" cy="${r}" r="${r - 0.5}" fill="none" stroke="#fff" stroke-width="1"/></svg>`;
}

function locationMap() {
  const sites = new Map();
  for (const u of F.units) {
    if (!sites.has(u.site)) sites.set(u.site, { name: u.name, country: u.country, area: u.area, lat: u.lat, lon: u.lon, units: [] });
    sites.get(u.site).units.push(u);
  }
  $('chart-controls').innerHTML = `<fieldset><legend>Blöcke</legend>${GROUPS.map((g, i) =>
    `<label><input type="checkbox" name="group" value="${i}"${g.shown ? ' checked' : ''}><span class="swatch" style="background:${g.color}"></span>${g.label}</label>`).join('')}</fieldset>`;
  $('chart-readouts').innerHTML = `
    <div><span>Standorte</span><output id="r-sites"></output></div>
    <div><span>Reaktorblöcke</span><output id="r-units"></output></div>
    <div><span>Leistung</span><output id="r-gw"></output></div>`;
  const map = L.map('chart', { worldCopyJump: true, zoomSnap: 0.25, wheelPxPerZoomLevel: 120, minZoom: 1 });
  const gray = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16, attribution: 'Karte © Esri, HERE, Garmin, © OpenStreetMap-Mitwirkende',
  }).addTo(map);
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18, attribution: 'Bilder © Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP und GIS User Community',
  });
  const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
  });
  L.control.layers({ Karte: gray, Satellit: satellite, OpenStreetMap: osm }).addTo(map);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
  map.fitBounds([[-42, -125], [64, 148]]);
  const layer = L.layerGroup().addTo(map);

  // Hover: name and a summary of the shown units. Click: every unit of the site with all details.
  function popup(site) {
    const items = [...site.units].sort((a, b) => groupOf(a) - groupOf(b) || a.unit.localeCompare(b.unit, 'de', { numeric: true }))
      .map(u => `<li><span class="swatch" style="background:${GROUPS[groupOf(u)].color}"></span>`
        + `<b>${escapeHtml(blockLabel(u))}</b>, ${number(u.mw)} MW<br>${unitDetails(u)}</li>`).join('');
    const place = [site.area, name(site.country)].filter(Boolean).join(', ');
    return `<h2>${escapeHtml(site.name)}</h2><small>${escapeHtml(place)}<br>${statusSummary(site.units)}</small><ul>${items}</ul>`;
  }

  function draw() {
    const shown = new Set([...$('chart-controls').querySelectorAll('input:checked')].map(input => Number(input.value)));
    layer.clearLayers();
    let siteCount = 0, unitCount = 0, mw = 0;
    for (const site of sites.values()) {
      const visible = site.units.filter(u => shown.has(groupOf(u)));
      if (!visible.length) continue;
      const counts = GROUPS.map((g, i) => [g.color, visible.filter(u => groupOf(u) === i).length]).filter(([, n]) => n);
      const gw = visible.reduce((sum, u) => sum + u.mw, 0) / 1000;
      const size = Math.round(12 + 4 * Math.sqrt(gw));
      siteCount += 1; unitCount += visible.length; mw += gw * 1000;
      L.marker([site.lat, site.lon], {
        icon: L.divIcon({ html: pie(counts, size), className: 'site-marker', iconSize: [size, size] }),
        keyboard: true, title: site.name, riseOnHover: true,
      })
        .bindTooltip(`<b>${escapeHtml(site.name)}</b> (${name(site.country)})<br>${statusSummary(visible)}<br>${number(gw, 1)} GW`,
          { direction: 'top', offset: [0, -size / 2] })
        .bindPopup(() => popup(site), { maxWidth: 340 })
        .addTo(layer);
    }
    $('r-sites').value = number(siteCount);
    $('r-units').value = number(unitCount);
    $('r-gw').value = `${number(mw / 1000, 1)} GW`;
    $('chart-status').hidden = true;
  }
  $('chart-controls').addEventListener('change', draw);
  draw();
}

const CHARTS = {
  map: locationMap, evolution: evolutionChart, commissioning: commissioningChart, count: countChart,
  capacity: capacityChart, construction: constructionChart, buildtime: buildtimeChart, outlook: outlookChart,
};
try {
  CHARTS[document.body.dataset.chart]();
} catch (error) {
  $('chart-status').textContent = 'Das Diagramm konnte nicht geladen werden. Bitte die Seite neu laden.';
  throw error;
}
