// Reactor fleet computations behind the Fission or Fiction charts and the numbers quoted in the text.
// Data: Global Nuclear Power Tracker, August 2026. Run with: node --test tests/fission-fleet.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as F from '../assets/projects/fissionorfiction/fleet.mjs';
import { COUNTRIES, REGIONS } from '../assets/projects/fissionorfiction/countries.mjs';

const text = readFileSync(new URL('../content/projects/fissionorfiction.md', import.meta.url), 'utf8').replace(/ /g, ' ');
const at = (series, key, year) => Object.values(series).reduce((sum, s) => sum + s[key][F.YEARS.indexOf(year)], 0);
const unit = (name, block) => F.units.find(u => u.name === name && u.unit === block);
const round1 = x => Math.round(x * 10) / 10;
const gw = list => list.reduce((sum, u) => sum + u.mw, 0) / 1000;

test('dates of any precision become decimal years; the data date follows the release', () => {
  assert.equal(F.decimalYear('1974'), 1974);
  assert.equal(F.decimalYear('1974-07'), 1974 + 181 / 365);
  assert.equal(F.decimalYear(null), null);
  assert.equal(F.STAND, '2026-08-01');
  assert.equal(F.RELEASE, 'August 2026');
  assert.equal(F.LAST_YEAR, 2026);
  assert.ok(text.includes('Global Nuclear Power Tracker, August 2026'));
});

test('every country has a German name, a colour, a region and an ISO code', () => {
  for (const u of F.units) {
    const country = COUNTRIES[u.country];
    assert.ok(country, u.country);
    assert.match(country.color, /^#[0-9a-fA-F]{6}$/);
    assert.ok(country.region in REGIONS);
    assert.match(country.iso, /^[A-Z]{3}$/);
  }
});

test('reactors prepared for a restart count like mothballed ones, from their grid connection', () => {
  const tokai = unit('Tokai', '2');
  assert.equal(tokai.restart, true);
  assert.equal(tokai.status, 'mothballed');
  assert.equal(tokai.cod, tokai.grid);
  assert.equal(F.operatingAt(tokai, 2000), true);
  assert.equal(F.buildingAt(tokai, 2000), false);
  assert.equal(F.units.filter(u => u.restart).length, 3);
});

test('fleet over time: count, capacity and age', () => {
  const fleet = F.fleetSeries();
  assert.equal(at(fleet, 'count', 2026), 446);
  assert.equal(round1(at(fleet, 'gw', 2026)), 426.8);
  assert.equal(Math.round(at(fleet, 'gw', 1990)), 349);
  const since1988 = F.YEARS.filter(y => y >= 1988).map(y => at(fleet, 'count', y));
  assert.deepEqual([Math.min(...since1988), Math.max(...since1988)], [413, 447]);
  const age = year => Object.values(fleet).reduce((sum, s) => sum + (s.age[F.YEARS.indexOf(year)] ?? 0) * s.count[F.YEARS.indexOf(year)], 0) / at(fleet, 'count', year);
  assert.deepEqual([Math.round(age(1990)), Math.round(age(2026))], [11, 33]);
  assert.equal(Math.round(fleet['United States'].age.at(-1)), 44);
  assert.equal(fleet.China.count[F.YEARS.indexOf(2000)], 3);
  assert.equal(fleet.China.count.at(-1), 61);
  const top3 = ['United States', 'France', 'China'].reduce((sum, c) => sum + fleet[c].gw.at(-1), 0);
  assert.ok(top3 / at(fleet, 'gw', 2026) > 0.5);
  for (const quoted of ['zwischen 410 und 450', 'von 11 auf 33 Jahre, in den USA auf 44', 'von 3 auf 61', 'von 349 auf 427 GW']) {
    assert.ok(text.includes(quoted), quoted);
  }
});

test('units in operation, mothballed, under construction and older than 40 years, as quoted', () => {
  const operating = F.units.filter(u => u.status === 'operating');
  const mothballed = F.units.filter(u => u.status === 'mothballed' && u.cod !== null);
  const construction = F.units.filter(u => u.status === 'construction');
  assert.equal(operating.length, 424);
  assert.equal(Math.round(gw(operating)), 408);
  assert.equal(new Set(operating.map(u => u.site)).size, 172);
  assert.equal(new Set(operating.map(u => u.country)).size, 32);
  assert.deepEqual([mothballed.length, Math.round(gw(mothballed))], [22, 19]);
  assert.deepEqual([construction.length, new Set(construction.map(u => u.country)).size], [82, 17]);
  assert.equal(construction.filter(u => u.start === null).length, 5);
  assert.equal(operating.filter(u => F.STAND_YEAR - u.cod > 40).length, 191);
  for (const quoted of ['424 Reaktorblöcke mit 408 GW', '172 Standorten in 32 Ländern', '82 weitere', 'in 17 Ländern',
    '22 Blöcke mit 19 GW', '191 der 424', 'fünf Blöcke ohne Baubeginn']) {
    assert.ok(text.includes(quoted), quoted);
  }
});

test('retirements after Fukushima and in a period of the same length before', () => {
  const fukushima = F.decimalYear('2011-03-11'), length = F.STAND_YEAR - fukushima;
  const retired = F.units.filter(u => u.status === 'retired');
  const after = retired.filter(u => u.retired >= fukushima && u.retired < F.STAND_YEAR);
  const before = retired.filter(u => u.retired >= fukushima - length && u.retired < fukushima);
  assert.deepEqual([after.length, Math.round(gw(after)), before.length, Math.round(gw(before))], [91, 73, 50, 21]);
  assert.ok(text.includes('91 Reaktoren mit 73 GW') && text.includes('waren es 50 mit 21 GW'));
});

test('construction: abandoned projects count until they are given up, plans do not count', () => {
  const series = F.constructionSeries();
  assert.equal(at(series, 'building', 1980) + at(series, 'abandoned', 1980), 212);
  assert.equal(at(series, 'building', 2026), 77);
  assert.equal(series.China.building.at(-1), 36);
  assert.ok(text.includes('waren es 77, fast die Hälfte davon in China'));
  // Khmelnitski 3 started in 1986 but is listed as pre-construction with planned dates.
  const khmelnitski = unit('Khmelnitski', '3');
  assert.ok(['pre-construction', 'announced'].includes(khmelnitski.status));
  assert.equal(F.buildingAt(khmelnitski, 2000), false);
  assert.equal(F.operatingAt(khmelnitski, 2040), false);
});

test('build times use realised dates only', () => {
  const points = F.buildTimes();
  const done = points.filter(p => p.done);
  assert.equal(round1(F.median(done.map(p => p.years))), 5.9);
  const recent = done.filter(p => p.u.grid !== null && p.u.grid >= 2016);
  assert.equal(round1(F.median(recent.filter(p => p.u.country === 'China').map(p => p.years))), 5.6);
  assert.equal(round1(F.median(recent.filter(p => p.u.country !== 'China').map(p => p.years))), 9.7);
  assert.equal(Math.round(points.find(p => p.u === unit('Watts Bar', '2')).years), 43);
  const mochovce = points.find(p => p.u === unit('Mochovce', '4'));
  assert.equal(mochovce.done, false);
  assert.equal(mochovce.u.dates.start.slice(0, 4), '1987');
  assert.ok(points.every(p => p.years > 0 && p.years < 45));
  assert.ok(text.includes('5,6 Jahre, die übrigen 9,7') && text.includes('nach 43 Jahren ans Netz'));
});

test('scenario: half of today’s capacity gone by 2028 at 40 years, by 2048 at 60 years', () => {
  const halfBy = lifetime => {
    const s = F.scenario(lifetime);
    const existing = s.times.map((_, i) => Object.values(s.regions).reduce((sum, r) => sum + r[i], 0));
    return s.times.find((t, i) => existing[i] < existing[0] / 2) - 1;
  };
  assert.equal(halfBy(40), 2028);
  assert.equal(halfBy(60), 2048);
  const s = F.scenario(60);
  assert.equal(Math.round(s.total[0]), 408);
  const change2050 = s.total[s.times.indexOf(2050)] / s.total[0] - 1;
  assert.ok(change2050 < -1 / 3 && change2050 > -0.4, change2050);
  // Without construction the first point stays, later capacity is lower.
  const without = F.scenario(60, { construction: false });
  assert.equal(without.total[0], s.total[0]);
  assert.ok(without.total.every((v, i) => v <= s.total[i] + 1e-9));
  assert.ok(text.includes('bis 2028 vom Netz, bei 60 Jahren bis 2048') && text.includes('um gut ein Drittel'));
});
