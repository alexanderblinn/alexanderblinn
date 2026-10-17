// Reactor fleet computations behind the Fission or Fiction charts. Pure functions, tested in
// tests/fission-fleet.test.mjs. Times are decimal years; "at the end of year y" means t = y + 1,
// in the last year of the data the data date (yearEnd).
import { STAND, RELEASE, TYPES, TEXTS, SITES, UNITS } from './units-data.mjs';
import { COUNTRIES } from './countries.mjs';

export { STAND, RELEASE };

export function decimalYear(iso) {
  if (!iso) return null;
  const [y, m = 1, d = 1] = iso.split('-').map(Number);
  const start = Date.UTC(y, 0, 1);
  return y + (Date.UTC(y, m - 1, d) - start) / (Date.UTC(y + 1, 0, 1) - start);
}

export const STAND_YEAR = decimalYear(STAND);
export const FIRST_YEAR = 1954;
export const LAST_YEAR = Math.floor(STAND_YEAR);
export const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
export const YEARS = range(FIRST_YEAR, LAST_YEAR);
export const yearEnd = y => Math.min(y + 1, STAND_YEAR);

const text = index => (index === null ? null : TEXTS[index]);

export const units = UNITS.map(([site, unit, status, mw, type, start, grid, cod, retired, cancelled, expected, planned,
  model, owner, operator]) => {
  const [name, country, lat, lon, area] = SITES[site];
  // Reactors connected to the grid long ago but listed as under construction again are prepared for
  // a restart (Japan after Fukushima); the tracker replaces their commercial operation date by the
  // planned restart. They count like mothballed units, in operation from their grid connection.
  const restart = status === 'construction' && grid !== null && decimalYear(grid) <= STAND_YEAR;
  if (restart) [status, cod] = ['mothballed', grid];
  return {
    site, name, unit, country, lat, lon, area, status, mw, restart,
    type: type === null ? null : TYPES[type],
    model: text(model), owner: text(owner), operator: text(operator),
    region: COUNTRIES[country].region,
    start: decimalYear(start), grid: decimalYear(grid), cod: decimalYear(cod), retired: decimalYear(retired),
    cancelled, expected, planned, dates: { start, grid, cod, retired },
  };
});

// Statuses of units that were actually built. Other units may carry planned dates in the data.
export const BUILT = new Set(['operating', 'mothballed', 'retired']);

// In operation at time t: in commercial operation and not yet retired. As in the original charts,
// units shut down but not formally retired ("mothballed", mostly in Japan) still count.
export const operatingAt = (u, t) =>
  BUILT.has(u.status) && u.cod !== null && u.cod < t && (u.retired === null || u.retired >= t);

// Under construction at time t: construction started, not yet in commercial operation and not yet
// abandoned. Abandoned units carry a cancellation year and count until the start of that year.
// Units still under construction count from their start, whatever completion dates are planned;
// announced and pre-construction units are left out, even if the data gives a start date.
export function buildingAt(u, t) {
  if (u.start === null || u.start >= t || u.status === 'announced' || u.status === 'pre-construction') return false;
  if (u.status === 'construction') return true;
  if (u.cod !== null) return u.cod >= t;
  if (u.grid !== null) return u.grid >= t;
  return u.cancelled !== null && u.cancelled >= t;
}

export const byName = (a, b) => COUNTRIES[a].name.localeCompare(COUNTRIES[b].name, 'de');

// Operating units per country and year: number, capacity in GW and mean age in years.
export function fleetSeries(years = YEARS) {
  const series = {};
  for (const u of units) {
    years.forEach((y, i) => {
      if (!operatingAt(u, yearEnd(y))) return;
      const s = (series[u.country] ??= { count: years.map(() => 0), gw: years.map(() => 0), age: years.map(() => 0) });
      s.count[i] += 1;
      s.gw[i] += u.mw / 1000;
      s.age[i] += yearEnd(y) - u.cod;
    });
  }
  for (const s of Object.values(series)) s.age = s.age.map((sum, i) => (s.count[i] ? sum / s.count[i] : null));
  return series;
}

// Units under construction per country at the end of each year, split by whether the project was
// abandoned later.
export function constructionSeries(years = YEARS) {
  const series = {};
  for (const u of units) {
    years.forEach((y, i) => {
      if (!buildingAt(u, yearEnd(y))) return;
      const s = (series[u.country] ??= { building: years.map(() => 0), abandoned: years.map(() => 0) });
      s[u.cancelled === null ? 'building' : 'abandoned'][i] += 1;
    });
  }
  return series;
}

// Years from construction start to the first grid connection (or commercial operation, if the
// grid date is missing) of built units. Units still under construction get the time elapsed until
// the data date.
export function buildTimes() {
  return units.filter(u => u.start !== null).flatMap(u => {
    const end = u.grid ?? u.cod;
    if (BUILT.has(u.status) && end !== null && end > u.start && end <= STAND_YEAR) {
      return [{ u, years: end - u.start, done: true }];
    }
    if (u.status === 'construction') return [{ u, years: STAND_YEAR - u.start, done: false }];
    return [];
  });
}

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length / 2;
  return sorted.length % 2 ? sorted[Math.floor(mid)] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Median build time of completed units per period of `width` years of construction start.
export function medianBuildTime(points, width = 5) {
  const groups = new Map();
  for (const p of points.filter(p => p.done)) {
    const from = Math.floor(p.u.start / width) * width;
    if (!groups.has(from)) groups.set(from, []);
    groups.get(from).push(p.years);
  }
  return [...groups].sort((a, b) => a[0] - b[0]).map(([from, values]) => ({ from, to: from + width, median: median(values), n: values.length }));
}

// Operating units and capacity per country and per site at the end of year y (evolution map).
export function mapYear(y) {
  const countries = {}, sites = {};
  for (const u of units) {
    if (!operatingAt(u, yearEnd(y))) continue;
    const c = (countries[u.country] ??= { count: 0, gw: 0 });
    c.count += 1;
    c.gw += u.mw / 1000;
    const s = (sites[u.site] ??= { name: u.name, country: u.country, lat: u.lat, lon: u.lon, count: 0, gw: 0 });
    s.count += 1;
    s.gw += u.mw / 1000;
  }
  return { countries, sites: Object.values(sites) };
}

export const SCENARIO_YEARS = range(LAST_YEAR + 1, 2080);
export const DEFAULT_BUILD_YEARS = 7;

// Thought experiment, not a forecast: every operating unit runs exactly `lifetime` years from
// commercial operation, or until an announced earlier retirement; units older than that go offline
// at the end of the data year. Units under construction start in their expected year (the year
// after the data year at the earliest, construction start plus DEFAULT_BUILD_YEARS if unknown) and
// also run `lifetime` years.
// Capacity in GW at the data date and at the start of every year in SCENARIO_YEARS.
export function scenario(lifetime, { construction = true } = {}) {
  const times = [STAND_YEAR, ...SCENARIO_YEARS];
  const regions = {}, building = times.map(() => 0);
  for (const u of units) {
    let on, off, target;
    if (u.status === 'operating') {
      on = u.cod;
      off = Math.max(LAST_YEAR + 1, u.cod + lifetime);
      if (u.planned !== null) off = Math.min(off, Math.max(LAST_YEAR + 1, u.planned + 1));
      target = (regions[u.region] ??= times.map(() => 0));
    } else if (construction && u.status === 'construction') {
      on = Math.max(LAST_YEAR + 1, u.expected ?? Math.ceil(u.start + DEFAULT_BUILD_YEARS)) + 1;
      off = on + lifetime;
      target = building;
    } else continue;
    times.forEach((t, i) => { if (on <= t && t < off) target[i] += u.mw / 1000; });
  }
  const total = times.map((_, i) => Object.values(regions).reduce((sum, r) => sum + r[i], 0) + building[i]);
  return { times, regions, building, total };
}
