// Savings plan in the MSCI World price index: the same amount at every month-end close from
// January of the start year on, valued at the close one month after the last instalment, next
// to a lump sum of the same total at the start. Three views:
// - 'nominal': 100 US dollars a month, in dollars;
// - 'real': the same, every amount in US purchasing power of the first month (US consumer prices);
// - 'real-de': 100 euros a month, converted at the monthly average exchange rate (before 1999 via
//   the D-Mark), every amount in German purchasing power of the first month (German consumer prices).
import { MONTHS, CLOSE, CPI, CPI_DE, USD_PER_EUR } from './sparplan-data.mjs';

export const RATE = 100;
export const FIRST_YEAR = Number(MONTHS[0].slice(0, 4));
export const VIEWS = ['nominal', 'real', 'real-de'];

const firstIndex = startYear => MONTHS.indexOf(`${startYear}-01`);
export const maxYears = startYear => Math.floor((MONTHS.length - 1 - firstIndex(startYear)) / 12);

// Annual rate of a series of monthly cash flows (payments negative), by bisection.
export function annualRate(flows) {
  const presentValue = r => flows.reduce((total, flow, t) => total + flow / (1 + r) ** t, 0);
  let low = -0.1, high = 0.1;
  for (let i = 0; i < 200; i++) {
    const middle = (low + high) / 2;
    if (presentValue(low) * presentValue(middle) <= 0) high = middle; else low = middle;
  }
  return (1 + (low + high) / 2) ** 12 - 1;
}

export function savingsPlan(startYear, years, view = 'nominal') {
  if (!VIEWS.includes(view)) throw new RangeError(`Unbekannte Ansicht: ${view}`);
  const first = firstIndex(startYear), n = 12 * years, last = first + n;
  if (first < 0 || years < 1 || last >= MONTHS.length) throw new RangeError('Zeitraum außerhalb der Daten');
  // Index level in the currency of the saver, and the factor into purchasing power of the first month.
  const price = k => (view === 'real-de' ? CLOSE[k] / USD_PER_EUR[k] : CLOSE[k]);
  const prices = view === 'real-de' ? CPI_DE : CPI;
  const factor = k => (view === 'nominal' ? 1 : prices[first] / prices[k]);
  const lumpUnits = (RATE * n) / price(first);
  let units = 0, paid = 0;
  const flows = [], months = [], value = [], invested = [], lump = [];
  for (let k = first; k <= last; k++) {
    if (k < last) {
      units += RATE / price(k);
      paid += RATE * factor(k);
      flows.push(-RATE * factor(k));
    }
    months.push(MONTHS[k]);
    value.push(units * price(k) * factor(k));
    invested.push(paid);
    lump.push(lumpUnits * price(k) * factor(k));
  }
  flows.push(value.at(-1));
  return {
    months, value, invested, lump,
    paid, end: value.at(-1), rate: annualRate(flows),
    lumpEnd: lump.at(-1), lumpRate: (lump.at(-1) / (RATE * n)) ** (1 / years) - 1,
  };
}

if (typeof document !== 'undefined' && document.getElementById('plan-chart')) {
  const $ = id => document.getElementById(id);
  const money = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  const percent = x => `${x < 0 ? '−' : '+'}${Math.abs(x * 100).toFixed(1).replace('.', ',')} % p. a.`;
  const lastYear = Number(MONTHS.at(-1).slice(0, 4));
  for (let year = FIRST_YEAR; year < lastYear; year++) $('plan-start').append(new Option(year, year));
  $('plan-start').value = '2000';
  const font = { family: '"Courier New", Courier, monospace', size: 14, color: '#252525' };
  const axis = { tickfont: { size: 11, color: '#4C5660' }, fixedrange: true, gridcolor: 'rgba(35, 48, 59, 0.07)' };
  const line = (name, y, color, unit, extra = {}) => ({
    type: 'scatter', mode: 'lines', name, y, line: { color, width: 2.2, ...extra },
    hovertemplate: `${name}: %{y:,.0f} ${unit}<extra></extra>`,
  });

  function update() {
    const start = Number($('plan-start').value);
    $('plan-years').max = maxYears(start);
    if (Number($('plan-years').value) > maxYears(start)) $('plan-years').value = maxYears(start);
    const years = Number($('plan-years').value);
    const view = document.querySelector('input[name="plan-view"]:checked').value;
    const unit = view === 'real-de' ? '€' : '$';
    const amount = x => `${money.format(x)} ${unit}`;
    $('plan-years-value').value = `${years} ${years === 1 ? 'Jahr' : 'Jahre'}`;
    const plan = savingsPlan(start, years, view);
    $('plan-paid-label').textContent = view === 'nominal' ? 'Eingezahlt, 100 $ im Monat'
      : `Eingezahlt, 100 ${unit} im Monat, in Kaufkraft von 01/${start}`;
    $('plan-paid').value = amount(plan.paid);
    $('plan-end').value = amount(plan.end);
    $('plan-rate').textContent = percent(plan.rate);
    $('plan-lump').value = amount(plan.lumpEnd);
    $('plan-lump-rate').textContent = percent(plan.lumpRate);
    const x = plan.months;
    const traces = [
      { ...line('Eingezahlt', plan.invested, '#B59B74', unit, { dash: 'dot', shape: 'hv' }), x },
      { ...line('Einmalanlage', plan.lump, '#A07A72', unit, { width: 1.6 }), x },
      { ...line('Sparplan', plan.value, '#456674', unit, { width: 3 }), x },
    ];
    const axisTitle = { nominal: 'US-Dollar', real: `US-Kaufkraft von 01/${start}`, 'real-de': `deutsche Kaufkraft von 01/${start}` }[view];
    const layout = {
      font, paper_bgcolor: '#faf9f6', plot_bgcolor: '#faf9f6', separators: ',.', hovermode: 'x unified',
      margin: { l: 70, r: 16, t: 36, b: 40 },
      legend: { orientation: 'h', x: 0, y: 1.02, xanchor: 'left', yanchor: 'bottom', font: { size: 13 } },
      xaxis: { ...axis, type: 'date', hoverformat: '%m/%Y', showgrid: false },
      yaxis: { ...axis, tickformat: ',.0f', ticksuffix: ` ${unit}`, rangemode: 'tozero',
               title: { text: axisTitle, font: { size: 12, color: '#5C6770' } } },
    };
    Plotly.react($('plan-chart'), traces, layout, { displayModeBar: false, responsive: true });
    $('chart-status').hidden = true;
  }

  for (const id of ['plan-start', 'plan-years', 'plan-nominal', 'plan-real', 'plan-real-de']) $(id).addEventListener('input', update);
  update();
}
