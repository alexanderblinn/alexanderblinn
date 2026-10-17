// Savings plan on the MSCI page: cash flows, rates and the numbers quoted in the text.
// Run with: node --test tests/msci-sparplan.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { savingsPlan, annualRate, maxYears, RATE } from '../assets/projects/msci/sparplan.mjs';
import { MONTHS } from '../assets/projects/msci/sparplan-data.mjs';

const pct = x => Math.round(x * 1000) / 10;

test('annual rate of monthly flows: 1 % a month is 12.68 % a year', () => {
  const flows = [-100, ...new Array(11).fill(0), 100 * 1.01 ** 12];
  assert.ok(Math.abs(annualRate(flows) - (1.01 ** 12 - 1)) < 1e-9);
});

test('a plan pays the monthly rate and values the units one month after the last one', () => {
  const plan = savingsPlan(2000, 20);
  assert.equal(plan.paid, RATE * 240);
  assert.equal(plan.months.length, 241);
  assert.equal(plan.months[0], '2000-01');
  assert.equal(plan.months.at(-1), '2020-01');
  assert.ok(plan.end > 0 && plan.lumpEnd > 0);
});

test('real values are smaller than nominal ones after inflation', () => {
  const nominal = savingsPlan(1990, 30), real = savingsPlan(1990, 30, 'real');
  assert.ok(real.end < nominal.end && real.paid < nominal.paid && real.rate < nominal.rate);
});

test('20-year plans: rates by start year as quoted in the text', () => {
  const starts = [];
  for (let year = 1972; maxYears(year) >= 20; year++) starts.push(year);
  const nominal = starts.map(year => [year, savingsPlan(year, 20).rate]);
  const real = starts.map(year => [year, savingsPlan(year, 20, 'real').rate]);
  const german = starts.map(year => [year, savingsPlan(year, 20, 'real-de').rate]);
  const [worst, best] = [nominal.reduce((a, b) => (b[1] < a[1] ? b : a)), nominal.reduce((a, b) => (b[1] > a[1] ? b : a))];
  const range = list => [Math.min(...list.map(r => r[1])), Math.max(...list.map(r => r[1]))].map(pct);
  console.log('20 years nominal', worst, best, 'real US', range(real), 'real DE', range(german), german.reduce((a, b) => (b[1] < a[1] ? b : a)), german.reduce((a, b) => (b[1] > a[1] ? b : a)));
  assert.deepEqual([worst[0], pct(worst[1])], [1989, 0.4]);
  assert.deepEqual([best[0], pct(best[1])], [1980, 12.5]);
  assert.deepEqual(range(real), [-2.0, 9.0]);
  assert.deepEqual(range(german), [-2.4, 9.6]);
});

test('German view: 100 euros a month at the exchange rate, valued in German purchasing power', () => {
  const plan = savingsPlan(2000, 10, 'real-de');
  assert.equal(plan.invested[0], RATE);
  assert.ok(plan.paid < RATE * 120);
  assert.throws(() => savingsPlan(2000, 10, true), RangeError);
});

test('the data end with the last complete month', () => {
  assert.equal(MONTHS.at(-1), '2026-09');
  assert.throws(() => savingsPlan(2010, 20), RangeError);
});
